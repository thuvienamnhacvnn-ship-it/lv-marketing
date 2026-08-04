import { NextResponse, type NextRequest } from "next/server";
import QRCode from "qrcode";
import { verifyCardToken } from "@/lib/loyalty-qr";

export const runtime = "nodejs";

/**
 * Vẽ mã QR của thẻ thành viên thành ảnh PNG.
 *
 * Kiểm chữ ký trước khi vẽ: nếu không, đây thành một máy sinh QR miễn phí cho
 * bất kỳ chuỗi nào ai đó nhét vào tham số.
 *
 * Ảnh chứa chính token — máy quét của quán đọc token rồi gọi API để tra ra khách.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  const verified = verifyCardToken(token);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.reason }, { status: 400 });
  }

  const png = await QRCode.toBuffer(token, {
    type: "png",
    width: 640,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#14121aff", light: "#ffffffff" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      // Thẻ là dữ liệu riêng của một người — không cho CDN hay proxy giữ lại.
      "Cache-Control": "private, no-store",
    },
  });
}
