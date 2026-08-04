import "server-only";
import crypto from "node:crypto";

/**
 * Token cho thẻ thành viên, ký bằng HMAC-SHA256.
 *
 * Ba lý do phải ký thay vì nhét thẳng id khách vào đường dẫn:
 *  - id thật không bao giờ lộ ra trong mã QR hay URL;
 *  - đổi `qrSecret` của thẻ là mọi mã QR cũ hỏng ngay — dùng khi khách mất điện thoại;
 *  - máy chủ kiểm được chữ ký mà không cần truy vấn database.
 *
 * Dạng token: base64url(payload JSON) + "." + base64url(HMAC)
 *
 * Dùng `AUTH_SECRET` làm khoá ký. Không thêm biến môi trường mới vì mỗi biến
 * bắt buộc là một thứ nữa có thể quên khai lúc triển khai, mà bí mật này không
 * cần tách riêng khỏi bí mật phiên đăng nhập.
 */
export type CardPayload = {
  /** organizationId */
  o: string;
  /** customerId */
  c: string;
  /** memberCode */
  m: string;
  /** qrSecret của thẻ — đổi giá trị này là vô hiệu hoá mọi token đã phát */
  s: string;
  /** hạn dùng, giây unix. 0 = không hết hạn (thẻ in ra giấy) */
  exp: number;
};

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET chưa cấu hình hoặc quá ngắn — xem .env.example");
  }
  return value;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(payload: string): string {
  return b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
}

/**
 * @param ttlSeconds Thời gian sống. 0 = vĩnh viễn, dùng cho thẻ in ra giấy.
 *   Thẻ hiện trên điện thoại nên để ngắn (60s) và tự làm mới, để ảnh chụp màn
 *   hình không dùng lại được.
 */
export function createCardToken(
  data: { organizationId: string; customerId: string; memberCode: string; qrSecret: string },
  ttlSeconds = 0,
): string {
  const payload: CardPayload = {
    o: data.organizationId,
    c: data.customerId,
    m: data.memberCode,
    s: data.qrSecret,
    exp: ttlSeconds > 0 ? Math.floor(Date.now() / 1000) + ttlSeconds : 0,
  };
  const encoded = b64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

export type VerifyResult =
  | { ok: true; payload: CardPayload }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" };

export function verifyCardToken(token: string): VerifyResult {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };
  const [encoded, signature] = parts;

  const expected = sign(encoded);
  // `timingSafeEqual` chứ không phải `===`: so sánh chuỗi thoát ra ngay ở byte
  // đầu khác nhau, đo thời gian nhiều lần là dò ra được chữ ký đúng.
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: "bad_signature" };
  }

  let payload: CardPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as CardPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (!payload.o || !payload.c || !payload.m || !payload.s) {
    return { ok: false, reason: "malformed" };
  }
  if (payload.exp > 0 && payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}
