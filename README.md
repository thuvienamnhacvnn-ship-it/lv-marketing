# LV Marketing Hub

Nền tảng marketing cho doanh nghiệp địa phương của người Việt tại Đức — nhà hàng,
tiệm nail, spa, quán café, cửa hàng bán lẻ và showroom vật liệu.

Sản phẩm của **LV GROUP** (Berlin), song ngữ tiếng Việt và tiếng Đức.

## Trạng thái hiện tại

| Phần | Tình trạng |
| --- | --- |
| Trang marketing (11 trang, VI/DE) | Xong |
| Hệ 2 theme sáng/tối | Xong |
| Đăng ký / đăng nhập (giao diện + server action) | Xong |
| Schema cơ sở dữ liệu (51 model, đa tenant) | Xong |
| Lớp dịch vụ AI Claude (8 tác vụ) | Xong, **chưa có màn hình nào gọi tới** |
| `/api/auth/[...nextauth]` | Xong |
| `prisma/seed.ts` — gói dịch vụ + tổ chức demo | Xong |
| Khung app `/app/[slug]` — sidebar, chọn workspace, đăng xuất | Xong |
| Trang Tổng quan (số liệu đọc thẳng từ database) | Xong |
| 17 màn hình còn lại trong menu (Studio, Calendar, Inbox, CRM…) | **Chưa có** — hiện gắn nhãn "Sắp ra mắt" |

### Tài khoản demo

Sau khi chạy `npm run db:seed`:

```
email:    demo@lv-groups.com
mật khẩu: demo12345
```

Đăng nhập xong sẽ vào workspace `nha-hang-sen` — một nhà hàng Việt ở Berlin kèm
dữ liệu mẫu: 3 kênh social, 7 nội dung ở các trạng thái khác nhau, 4 khách hàng,
3 lead, 3 hội thoại, 4 đánh giá Google và 3 chiến dịch.

## Chạy thử

Yêu cầu Node.js 20 trở lên.

```bash
npm install
cp .env.example .env    # rồi điền giá trị thật
npm run dev
```

Mở http://localhost:3000 — trang gốc tự chuyển sang `/vi` hoặc `/de` theo cookie
ngôn ngữ, mặc định tiếng Việt.

**Trang marketing chạy được mà không cần database.** Đăng ký, đăng nhập và form
liên hệ thì cần PostgreSQL — xem [docs/ket-noi-database.md](docs/ket-noi-database.md).
Các tính năng AI cần `ANTHROPIC_API_KEY`; để trống thì ứng dụng vẫn chạy nhưng mọi
nút AI báo "chưa cấu hình" thay vì giả lập kết quả.

## Lệnh

| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Máy chủ phát triển (Turbopack) |
| `npm run build` | Build production |
| `npm run typecheck` | Kiểm tra kiểu, không xuất file |
| `npm run lint` | ESLint |
| `npm run db:push` | Đẩy schema vào database (chưa tạo migration) |
| `npm run db:migrate` | Tạo và chạy migration |
| `npm run db:studio` | Mở Prisma Studio |

## Công nghệ

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
Base UI · framer-motion · Prisma 7 + PostgreSQL · Auth.js v5 · Anthropic Claude SDK

## Cấu trúc

```
src/
  app/(marketing)/[locale]/   Trang marketing — ngôn ngữ nằm trong URL
  app/(auth)/                 Đăng nhập, đăng ký — ngôn ngữ lấy từ cookie
  components/ui/              Component nền, bọc Base UI
  components/marketing/       Component riêng của trang marketing
  components/motion/          Hiệu ứng dùng chung (reveal, parallax, marquee)
  config/                     Cấu hình site, theme, danh mục giải pháp
  data/                       Registry ảnh và template ấn phẩm
  features/                   Server action theo nghiệp vụ
  i18n/                       Từ điển VI/DE
  server/                     Auth, phân quyền, ngữ cảnh tenant
  services/ai/                Lớp gọi Claude: prompt, schema, runner
  proxy.ts                    Định tuyến ngôn ngữ (middleware của Next 16)
prisma/schema.prisma          Schema cơ sở dữ liệu
docs/                         Tài liệu vận hành
```

## Quy ước

- **Chỉ dùng token màu, không hardcode màu.** Mọi màu khai trong `src/app/globals.css`
  theo hai theme `light` và `dark`, chuyển bằng thuộc tính `data-theme` trên `<html>`.
- **Ảnh lấy từ registry** `src/data/media.ts` để mọi ảnh đều có `alt` đúng ngôn ngữ.
  Hiện phần lớn là ảnh stock Unsplash — danh sách ảnh thật cần chụp nằm ở
  [docs/danh-sach-anh-can-chup.md](docs/danh-sach-anh-can-chup.md).
- **Từ điển tiếng Việt là chuẩn về cấu trúc** (`src/i18n/dictionaries/vi.ts` khai
  `type Dictionary`), bản tiếng Đức phải khớp đúng shape đó.

## Giấy phép

Mã nguồn thuộc sở hữu của LV GROUP. Chưa phát hành công khai.
