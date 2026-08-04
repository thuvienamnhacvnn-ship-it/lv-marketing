import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Gift, Sparkles, Ticket } from "lucide-react";
import { LvLogo } from "@/components/brand/lv-logo";
import { prisma } from "@/lib/prisma";
import { verifyCardToken } from "@/lib/loyalty-qr";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Thẻ thành viên",
  // Thẻ là dữ liệu cá nhân — không cho công cụ tìm kiếm lập chỉ mục.
  robots: { index: false, follow: false },
};

/**
 * Thẻ thành viên công khai — KHÔNG cần đăng nhập.
 *
 * Khách nhận đường dẫn qua WhatsApp hoặc quét QR ở quán. Token ký HMAC nên chỉ
 * đường dẫn hợp lệ mới mở được; id khách không bao giờ lộ ra.
 *
 * Ba lớp kiểm, thiếu lớp nào cũng hở:
 *  1. chữ ký token
 *  2. khách phải thuộc đúng tổ chức trong token
 *  3. `qrSecret` trong token phải khớp giá trị hiện tại — đổi secret là thẻ cũ hỏng
 */
export default async function MemberCardPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const raw = decodeURIComponent(token);

  const verified = verifyCardToken(raw);
  if (!verified.ok) notFound();
  const { o: organizationId, c: customerId, m: memberCode, s: qrSecret } = verified.payload;

  const account = await prisma.loyaltyAccount.findFirst({
    where: { organizationId, customerId, memberCode, qrSecret },
    include: {
      organization: { select: { name: true } },
      customer: {
        select: {
          fullName: true,
          membership: { include: { tier: { select: { name: true, color: true, minPoints: true } } } },
        },
      },
    },
  });
  if (!account || account.isBlocked) notFound();

  const [nextTier, rewards, vouchers] = await Promise.all([
    prisma.membershipTier.findFirst({
      where: { organizationId, minPoints: { gt: account.totalEarned } },
      orderBy: { minPoints: "asc" },
      select: { name: true, minPoints: true },
    }),
    prisma.reward.findMany({
      where: { organizationId, status: "ACTIVE" },
      orderBy: { pointsCost: "asc" },
      take: 5,
      select: { id: true, name: true, pointsCost: true },
    }),
    prisma.issuedVoucher.findMany({
      where: { organizationId, customerId, status: "ISSUED" },
      include: { voucher: { select: { title: true, discountType: true, discountValue: true } } },
      take: 5,
    }),
  ]);

  const tier = account.customer.membership?.tier;
  const currentMin = tier?.minPoints ?? 0;
  const progress = nextTier
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((account.totalEarned - currentMin) / (nextTier.minPoints - currentMin)) * 100,
          ),
        ),
      )
    : 100;

  const nf = new Intl.NumberFormat("vi-VN");

  return (
    <main className="bg-paper flex min-h-dvh flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <LvLogo size={36} withWordmark />
        </div>

        {/* ── Thẻ ─────────────────────────────────────────── */}
        <div
          className="lv-slab relative mt-6 overflow-hidden rounded-3xl p-6"
          style={{ boxShadow: "var(--shadow-xl)" }}
        >
          <span
            className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full opacity-40 blur-3xl"
            style={{ background: tier?.color ?? "var(--brand)" }}
            aria-hidden
          />

          <p className="text-slab-ink-soft relative text-[0.65rem] font-bold tracking-[0.18em] uppercase">
            {account.organization.name}
          </p>
          <p className="text-slab-ink relative mt-2 text-2xl font-extrabold">
            {account.customer.fullName}
          </p>

          <div className="relative mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-slab-ink-soft text-[0.62rem] tracking-wide uppercase">Điểm hiện có</p>
              <p className="text-slab-ink text-4xl font-extrabold tabular-nums">
                {nf.format(account.points)}
              </p>
            </div>
            {tier ? (
              <span
                className="rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: tier.color }}
              >
                {tier.name}
              </span>
            ) : null}
          </div>

          <p className="text-slab-ink-soft relative mt-4 font-mono text-xs tracking-widest">
            {memberCode}
          </p>
        </div>

        {/* ── Mã QR ───────────────────────────────────────── */}
        <div className="lv-card mt-4 rounded-3xl p-5 text-center">
          <p className="text-ink text-sm font-bold">Đưa mã này cho nhân viên</p>
          <p className="text-ink-3 mt-1 text-xs">Để tích điểm hoặc đổi quà</p>
          <div className="mt-4 flex justify-center">
            <Image
              src={`/api/loyalty/qr?token=${encodeURIComponent(raw)}`}
              alt={`Mã QR thẻ thành viên ${memberCode}`}
              width={220}
              height={220}
              unoptimized
              className="rounded-2xl"
            />
          </div>
        </div>

        {/* ── Tiến độ lên hạng ────────────────────────────── */}
        {nextTier ? (
          <div className="lv-card mt-4 rounded-2xl p-4">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-ink-2">
                Còn{" "}
                <span className="text-ink font-bold tabular-nums">
                  {nf.format(nextTier.minPoints - account.totalEarned)}
                </span>{" "}
                điểm để lên hạng
              </span>
              <span className="text-ink shrink-0 font-bold">{nextTier.name}</span>
            </div>
            <span className="bg-line mt-2.5 block h-2 overflow-hidden rounded-full">
              <span
                className="bg-brand block h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </span>
            <p className="text-ink-3 mt-2 text-[0.65rem]">
              Tính theo điểm tích luỹ trọn đời ({nf.format(account.totalEarned)}) — đổi quà không
              làm tụt hạng.
            </p>
          </div>
        ) : null}

        {/* ── Voucher của khách ───────────────────────────── */}
        {vouchers.length > 0 ? (
          <div className="lv-card mt-4 rounded-2xl p-4">
            <p className="text-ink flex items-center gap-2 text-sm font-bold">
              <Ticket className="text-violet size-4" aria-hidden />
              Voucher của bạn
            </p>
            <ul className="mt-3 space-y-2">
              {vouchers.map((issued) => (
                <li
                  key={issued.id}
                  className="bg-violet-tint flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="text-ink block truncate text-xs font-semibold">
                      {issued.voucher.title}
                    </span>
                    <span className="text-ink-3 block truncate font-mono text-[0.6rem]">
                      {issued.code}
                    </span>
                  </span>
                  <span className="text-violet-ink shrink-0 text-sm font-bold">
                    {issued.voucher.discountType === "PERCENT"
                      ? `−${issued.voucher.discountValue}%`
                      : issued.voucher.discountType === "FIXED"
                        ? `−${issued.voucher.discountValue} €`
                        : "Tặng món"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* ── Quà đổi được ────────────────────────────────── */}
        {rewards.length > 0 ? (
          <div className="lv-card mt-4 rounded-2xl p-4">
            <p className="text-ink flex items-center gap-2 text-sm font-bold">
              <Gift className="text-magenta size-4" aria-hidden />
              Quà đổi điểm
            </p>
            <ul className="mt-3 space-y-1.5">
              {rewards.map((reward) => {
                const enough = account.points >= reward.pointsCost;
                return (
                  <li
                    key={reward.id}
                    className="border-line flex items-center justify-between gap-3 border-b py-2 last:border-0"
                  >
                    <span className="text-ink min-w-0 truncate text-xs font-medium">
                      {reward.name}
                    </span>
                    <span
                      className={
                        enough
                          ? "bg-mint-tint text-mint-ink shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-bold tabular-nums"
                          : "text-ink-3 shrink-0 text-[0.65rem] tabular-nums"
                      }
                    >
                      {nf.format(reward.pointsCost)} điểm
                      {enough ? " · đổi được" : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <p className="text-ink-3 mt-6 flex items-center justify-center gap-1.5 text-center text-[0.65rem]">
          <Sparkles className="size-3" aria-hidden />
          Thẻ thành viên điện tử · LV Marketing Hub
        </p>
      </div>
    </main>
  );
}
