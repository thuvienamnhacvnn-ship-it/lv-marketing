# Kết nối database — bắt buộc trước khi dùng đăng nhập và dashboard

Trang marketing chạy được mà **không cần** database. Nhưng đăng ký, đăng nhập,
form liên hệ và toàn bộ dashboard đều cần PostgreSQL.

Hiện tại máy bạn **chưa có PostgreSQL chạy ở cổng 5432** và cũng chưa cài Docker,
nên các chức năng đó sẽ báo *"Chưa kết nối được cơ sở dữ liệu"*.

> ## ⚠️ Database phải TRỐNG hoặc chỉ dành riêng cho dự án này
>
> `npm run db:push` đối chiếu schema với database rồi **xoá mọi bảng không có
> trong schema**. Trỏ nhầm vào database của ứng dụng khác là mất sạch dữ liệu và
> **không khôi phục được**.
>
> Nếu bạn đã có sẵn một project Neon/Supabase đang chạy ứng dụng khác, đừng dùng
> lại chuỗi kết nối đó. Hãy tạo **database riêng** (Neon cho phép nhiều database
> trong một project) hoặc **project riêng**.
>
> Trước khi push, luôn chạy:
> ```
> npm run db:check
> ```
> Lệnh này chỉ đọc, liệt kê các bảng đang có và báo lỗi nếu thấy bảng lạ.
> `npm run db:push` cũng đã tự gọi nó trước, nhưng chạy tay một lần để tự nhìn
> vẫn tốt hơn.

## Cách nhanh nhất — Neon (miễn phí, không cài gì)

1. Vào https://neon.com, đăng ký tài khoản
2. Tạo **project mới** — không dùng lại project đang chạy ứng dụng khác.
   Chọn region **Europe (Frankfurt)** cho gần Berlin
3. Copy chuỗi kết nối, dạng:
   ```
   postgresql://user:password@ep-abc-123.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Mở file `.env` trong thư mục dự án, thay dòng `DATABASE_URL` bằng chuỗi vừa copy
5. Kiểm tra rồi mới khởi tạo:
   ```
   npm run db:check
   npm run db:push
   npm run db:seed
   ```

Xong. Đăng nhập bằng tài khoản demo `demo@lv-groups.com` / `demo12345`, hoặc đăng
ký tài khoản mới tại `/register`.

### Nếu Neon báo hết hạn mức project

Gói miễn phí giới hạn số project. Khi đó tạo **database mới trong project sẵn có**:
Neon Console → project → **Databases** → **New Database**, đặt tên `lv_marketing`.
Chuỗi kết nối giữ nguyên, chỉ đổi phần cuối `/neondb` thành `/lv_marketing`.
Dữ liệu của database cũ không bị đụng tới.

## Phương án khác — Supabase

Tương tự Neon: tạo project, vào **Project Settings → Database → Connection string →
URI**, copy vào `DATABASE_URL`. Nhớ dùng chuỗi có `?pgbouncer=true` nếu Supabase gợi ý.

## Phương án cài tại máy

Tải PostgreSQL 16 tại https://www.postgresql.org/download/windows/ rồi tạo database:

```
createdb -U postgres lv_marketing_hub
```

Giữ nguyên `DATABASE_URL` mặc định trong `.env`, đổi `lv_password` thành mật khẩu
bạn đặt lúc cài.

## Sinh AUTH_SECRET thật

`.env` đang dùng chuỗi tạm cho môi trường phát triển. Trước khi đưa lên máy chủ:

```
npx auth secret
```

Copy giá trị sinh ra vào `AUTH_SECRET`.

## Bật tính năng AI

Các nút AI trong dashboard chỉ hoạt động khi có khoá Anthropic:

```
ANTHROPIC_API_KEY="sk-ant-..."
```

Không có khoá thì giao diện báo rõ *"chưa cấu hình"* thay vì giả lập kết quả.
