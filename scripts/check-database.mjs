/**
 * Soi database đích TRƯỚC khi chạy `prisma db push`.
 *
 * Vì sao cần: `db push` đối chiếu schema với database rồi XOÁ mọi bảng không có
 * trong schema. Trỏ nhầm vào database của ứng dụng khác là mất sạch dữ liệu, mà
 * cảnh báo của Prisma chỉ hiện ra sau khi đã gõ lệnh — dễ bấm qua cho xong.
 *
 * Script này chạy trước, chỉ ĐỌC, và thoát với mã lỗi nếu thấy bảng lạ.
 *
 * Dùng: npm run db:check
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL chưa được cấu hình — xem .env.example");
  process.exit(1);
}

/** Lấy tên bảng từ chính schema Prisma để danh sách không bao giờ lỗi thời. */
function knownTables() {
  const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
  return new Set([...schema.matchAll(/^model\s+(\w+)\s*\{/gm)].map((m) => m[1]));
}

/** Che mật khẩu trước khi in ra — output có thể bị dán vào chat hoặc log. */
function safeTarget(url) {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`;
  } catch {
    return "(không đọc được)";
  }
}

const client = new pg.Client({ connectionString });

try {
  await client.connect();

  const { rows } = await client.query(`
    SELECT c.relname AS name, COALESCE(s.n_live_tup, 0) AS rows
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
    WHERE c.relkind = 'r' AND n.nspname = 'public'
    ORDER BY c.relname
  `);

  const known = knownTables();
  const ours = rows.filter((r) => known.has(r.name));
  const foreign = rows.filter((r) => !known.has(r.name));

  console.log(`Database: ${safeTarget(connectionString)}`);
  console.log(`Tổng số bảng trong schema "public": ${rows.length}`);
  console.log("");

  if (rows.length === 0) {
    console.log("Database TRỐNG — an toàn để chạy `npm run db:push`.");
    process.exit(0);
  }

  if (foreign.length === 0) {
    console.log(`Đã có ${ours.length} bảng của LV Marketing Hub, không thấy bảng lạ.`);
    console.log("An toàn để chạy `npm run db:push`.");
    process.exit(0);
  }

  console.log(`CẢNH BÁO: có ${foreign.length} bảng KHÔNG thuộc dự án này:`);
  for (const table of foreign) {
    console.log(`  - ${table.name} (~${table.rows} dòng)`);
  }
  console.log("");
  console.log("`prisma db push` sẽ XOÁ toàn bộ các bảng trên và không khôi phục được.");
  console.log("Hãy tạo database riêng cho dự án này rồi đổi DATABASE_URL.");
  process.exit(1);
} catch (error) {
  console.error("Không kết nối được:", error.message.split("\n")[0]);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
