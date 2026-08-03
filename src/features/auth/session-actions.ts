"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/server/auth";

/**
 * Đăng xuất rồi đưa về trang đăng nhập.
 *
 * `redirect: false` để Auth.js chỉ xoá cookie chứ không tự điều hướng — sau đó
 * `redirect()` của Next mới chạy. Để Auth.js tự điều hướng thì nó ném ra một lỗi
 * riêng mà Next 16 không xử lý được trong ngữ cảnh server action.
 */
export async function signOutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
