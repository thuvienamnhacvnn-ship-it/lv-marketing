# Kết nối database — bắt buộc trước khi dùng đăng nhập và dashboard

Trang marketing chạy được mà **không cần** database. Nhưng đăng ký, đăng nhập,
form liên hệ và toàn bộ dashboard đều cần PostgreSQL.

Hiện tại máy bạn **chưa có PostgreSQL chạy ở cổng 5432** và cũng chưa cài Docker,
nên các chức năng đó sẽ báo *"Chưa kết nối được cơ sở dữ liệu"*.

## Cách nhanh nhất — Neon (miễn phí, không cài gì)

1. Vào https://neon.com, đăng ký tài khoản
2. Tạo project mới, chọn region **Europe (Frankfurt)** cho gần Berlin
3. Copy chuỗi kết nối, dạng:
   ```
   postgresql://user:password@ep-abc-123.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Mở file `.env` trong thư mục dự án, thay dòng `DATABASE_URL` bằng chuỗi vừa copy
5. Chạy hai lệnh:
   ```
   npm run db:push
   npm run db:seed
   ```

Xong. Đăng ký tài khoản tại `/register` sẽ hoạt động.

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
