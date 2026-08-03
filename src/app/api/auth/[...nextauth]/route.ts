import { handlers } from "@/server/auth";

/**
 * Điểm cuối HTTP của Auth.js.
 *
 * `signIn`/`signOut` gọi từ server action không đi qua đây (Auth.js chạy thẳng
 * trong tiến trình rồi tự ghi cookie), nhưng route này vẫn bắt buộc phải có cho
 * `/api/auth/session`, `/api/auth/csrf`, form đăng xuất và mọi luồng OAuth sau này.
 *
 * `src/proxy.ts` cho `/api` đi qua không xử lý nên không cần khai báo gì thêm.
 */
export const { GET, POST } = handlers;
