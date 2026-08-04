import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, QrCode } from "lucide-react";
import { MemberActions } from "@/components/app/member-actions";
import { requirePermission } from "@/server/tenant";
import { prisma } from "@/lib/prisma";
import { createCardToken } from "@/lib/loyalty-qr";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

export const metadata = { title: "Thành viên" };

const TX_TONE: Record<string, string> = {
  EARN: "bg-mint-tint text-mint-ink",
  BONUS: "bg-violet-tint text-violet-ink",
  REDEEM: "bg-brand-tint text-brand-ink",
  REFUND: "bg-amber-tint text-amber-ink",
  ADJUSTMENT: "bg-paper-3 text-ink-2",
  EXPIRE: "bg-paper-3 text-ink-3",
  REFERRAL: "bg-sky-tint text-sky-ink",
  BIRTHDAY: "bg-magenta-tint text-magenta-ink",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ slug: string; customerId: string }>;
}) {
  const { slug, customerId } = await params;
  const ctx = await requirePermission(slug, "loyalty:manage");
  const { locale } = await getAppDictionary();

  const account = await prisma.loyaltyAccount.findFirst({
    where: { organizationId: ctx.organization.id, customerId },
    include: {
      customer: {
        select: {
          fullName: true,
          email: true,
          phone: true,
          birthday: true,
          membership: { include: { tier: true } },
        },
      },
    },
  });
  if (!account) notFound();

  const [transactions, rewards, issuedVouchers] = await Promise.all([
    prisma.pointTransaction.findMany({
      where: { organizationId: ctx.organization.id, customerId },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.reward.findMany({
      where: { organizationId: ctx.organization.id, status: "ACTIVE" },
      orderBy: { pointsCost: "asc" },
      select: { id: true, name: true, pointsCost: true },
    }),
    prisma.issuedVoucher.findMany({
      where: { organizationId: ctx.organization.id, customerId },
      include: { voucher: { select: { title: true } } },
      orderBy: { issuedAt: "desc" },
    }),
  ]);

  // Token vĩnh viễn cho đường dẫn gửi khách qua WhatsApp. Muốn huỷ thì cấp
  // `qrSecret` mới — thẻ cũ hỏng ngay.
  const cardToken = createCardToken({
    organizationId: ctx.organization.id,
    customerId,
    memberCode: account.memberCode,
    qrSecret: account.qrSecret,
  });

  const nf = new Intl.NumberFormat(locale === "de" ? "de-DE" : "vi-VN");
  const dtf = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const tier = account.customer.membership?.tier;

  return (
    <div className="mx-auto w-full max-w-[100rem]">
      <Link
        href={`/app/${slug}/loyalty`}
        className="text-ink-3 hover:text-ink inline-flex items-center gap-1.5 text-xs font-semibold"
      >
        <ArrowLeft className="size-3.5" aria-hidden />
        Về Loyalty
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-extrabold sm:text-3xl">
            {account.customer.fullName}
          </h1>
          <p className="text-ink-3 mt-1.5 font-mono text-sm">{account.memberCode}</p>
        </div>
        <div className="flex items-center gap-2">
          {tier ? (
            <span
              className="rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: tier.color }}
            >
              {tier.name}
            </span>
          ) : null}
          <Link
            href={`/the/${encodeURIComponent(cardToken)}`}
            target="_blank"
            className="border-line text-ink-2 hover:bg-paper-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold"
          >
            <QrCode className="size-3.5" aria-hidden />
            Mở thẻ của khách
            <ExternalLink className="size-3" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Điểm hiện có", value: account.points, tone: "text-ink" },
          { label: "Tích luỹ trọn đời", value: account.totalEarned, tone: "text-mint-ink" },
          { label: "Đã đổi", value: account.totalRedeemed, tone: "text-brand-ink" },
        ].map((tile) => (
          <div key={tile.label} className="lv-card rounded-2xl p-4">
            <p className={cn("text-2xl font-extrabold tabular-nums", tile.tone)}>
              {nf.format(tile.value)}
            </p>
            <p className="text-ink-3 mt-1 text-xs">{tile.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <MemberActions slug={slug} customerId={customerId} rewards={rewards} />

        <div className="space-y-5">
          {/* ── Sổ cái ─────────────────────────────────────── */}
          <section className="lv-card rounded-2xl p-5">
            <h2 className="text-ink mb-1 text-sm font-bold">Sổ điểm</h2>
            <p className="text-ink-3 mb-3.5 text-xs">
              Mỗi dòng ghi số dư trước và sau — đối chiếu được khi khách khiếu nại.
            </p>
            <div className="max-h-[26rem] overflow-y-auto">
              <ul className="divide-line divide-y">
                {transactions.map((tx) => (
                  <li key={tx.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold",
                        TX_TONE[tx.type] ?? "bg-paper-3 text-ink-2",
                      )}
                    >
                      {tx.type.toLowerCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-ink-2 block truncate text-xs">
                        {tx.note ??
                          (tx.amountCents
                            ? `Hoá đơn ${(tx.amountCents / 100).toFixed(2)} €`
                            : "—")}
                      </span>
                      <span className="text-ink-3 block text-[0.62rem] tabular-nums">
                        {nf.format(tx.balanceBefore)} → {nf.format(tx.balanceAfter)}
                        {tx.receiptRef ? ` · ${tx.receiptRef}` : ""}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-bold tabular-nums",
                        tx.points >= 0 ? "text-mint-ink" : "text-brand-ink",
                      )}
                    >
                      {tx.points >= 0 ? "+" : ""}
                      {nf.format(tx.points)}
                    </span>
                    <span className="text-ink-3 shrink-0 text-[0.62rem] tabular-nums">
                      {dtf.format(tx.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {issuedVouchers.length > 0 ? (
            <section className="lv-card rounded-2xl p-5">
              <h2 className="text-ink mb-3 text-sm font-bold">Voucher đã phát</h2>
              <ul className="divide-line divide-y">
                {issuedVouchers.map((issued) => (
                  <li key={issued.id} className="flex items-center gap-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="text-ink block truncate text-xs font-semibold">
                        {issued.voucher.title}
                      </span>
                      <span className="text-ink-3 block truncate font-mono text-[0.6rem]">
                        {issued.code}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold",
                        issued.status === "ISSUED"
                          ? "bg-mint-tint text-mint-ink"
                          : "bg-paper-3 text-ink-3",
                      )}
                    >
                      {issued.status.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
