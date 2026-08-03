import { Coins, Gift, Ticket, TrendingDown, TrendingUp, UserPlus, Users } from "lucide-react";
import { requirePermission } from "@/server/tenant";
import {
  loadLoyaltyOverview,
  loadMembers,
  loadRecentPointTransactions,
  loadRewardsAndVouchers,
} from "@/features/loyalty/queries";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

export const metadata = { title: "Loyalty" };

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

export default async function LoyaltyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ctx = await requirePermission(slug, "loyalty:manage");
  const { locale, t } = await getAppDictionary();

  const [overview, members, transactions, catalogue] = await Promise.all([
    loadLoyaltyOverview(ctx.organization.id),
    loadMembers(ctx.organization.id),
    loadRecentPointTransactions(ctx.organization.id),
    loadRewardsAndVouchers(ctx.organization.id),
  ]);

  const nf = new Intl.NumberFormat(locale === "de" ? "de-DE" : "vi-VN");
  const df = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

  const tiles = [
    { icon: Users, label: "Thành viên", value: nf.format(overview.memberCount), tone: "bg-violet-tint text-violet-ink" },
    { icon: UserPlus, label: "Mới 30 ngày", value: nf.format(overview.newMembers30d), tone: "bg-sky-tint text-sky-ink" },
    { icon: Coins, label: "Điểm đang lưu hành", value: nf.format(overview.pointsOutstanding), tone: "bg-amber-tint text-amber-ink" },
    { icon: TrendingUp, label: "Tích 30 ngày", value: nf.format(overview.earned30d), tone: "bg-mint-tint text-mint-ink" },
    { icon: TrendingDown, label: "Đổi 30 ngày", value: nf.format(overview.redeemed30d), tone: "bg-brand-tint text-brand-ink" },
    { icon: Gift, label: "Quà đang mở", value: nf.format(overview.activeRewards), tone: "bg-magenta-tint text-magenta-ink" },
  ];

  const maxTierCount = Math.max(1, ...overview.tiers.map((tier) => tier._count.memberships));

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-extrabold sm:text-3xl">{t.appNav.loyalty}</h1>
          <p className="text-ink-2 mt-1.5 text-sm">
            {overview.program?.name ?? "Chưa có chương trình nào đang chạy"}
            {ctx.organization.isDemo ? (
              <span className="bg-amber-tint text-amber-ink ml-2 rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase">
                {t.common.demoBadge}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => (
          <div key={tile.label} className="lv-card rounded-2xl p-4">
            <span className={cn("grid size-9 place-items-center rounded-xl", tile.tone)}>
              <tile.icon className="size-4" aria-hidden />
            </span>
            <p className="text-ink mt-3.5 text-2xl font-extrabold tabular-nums">{tile.value}</p>
            <p className="text-ink-3 mt-1 text-xs">{tile.label}</p>
          </div>
        ))}
      </div>

      {/*
        Điểm đang lưu hành là NỢ của quán với khách, không phải doanh thu. Nói rõ
        ra vì rất dễ bị đọc nhầm thành một con số tích cực.
      */}
      <p className="text-ink-3 border-line bg-paper-3 mt-4 rounded-xl border border-dashed px-4 py-2.5 text-xs leading-relaxed">
        <span className="text-ink font-semibold">Điểm đang lưu hành</span> là tổng số dư của mọi
        thành viên — khoản quán còn nợ khách, sẽ thành chi phí khi họ đổi quà. Trọn đời đã tích{" "}
        {nf.format(overview.lifetimeEarned)} điểm, đã đổi {nf.format(overview.lifetimeRedeemed)}.
      </p>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        {/* ── Thành viên ─────────────────────────────────── */}
        <section className="lv-card rounded-2xl p-5">
          <h2 className="text-ink mb-4 text-sm font-bold">Thành viên tích luỹ nhiều nhất</h2>
          {members.length === 0 ? (
            <p className="text-ink-3 py-8 text-center text-sm">{t.common.empty}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-sm">
                <thead>
                  <tr className="text-ink-3 border-line border-b text-left text-[0.65rem] uppercase">
                    <th className="pb-2 font-bold">Khách</th>
                    <th className="pb-2 font-bold">Hạng</th>
                    <th className="pb-2 text-right font-bold">Điểm dư</th>
                    <th className="pb-2 text-right font-bold">Tích luỹ</th>
                    <th className="pb-2 text-right font-bold">Ghé gần nhất</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((account) => {
                    const tier = account.customer.membership?.tier;
                    return (
                      <tr key={account.id} className="border-line border-b last:border-0">
                        <td className="py-2.5 pr-3">
                          <span className="text-ink block font-semibold">
                            {account.customer.fullName}
                          </span>
                          <span className="text-ink-3 block font-mono text-[0.65rem]">
                            {account.memberCode}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3">
                          {tier ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="size-2 shrink-0 rounded-full"
                                style={{ background: tier.color }}
                                aria-hidden
                              />
                              <span className="text-ink-2 text-xs font-semibold">{tier.name}</span>
                            </span>
                          ) : (
                            <span className="text-ink-3 text-xs">—</span>
                          )}
                        </td>
                        <td className="text-ink py-2.5 text-right font-bold tabular-nums">
                          {nf.format(account.points)}
                        </td>
                        <td className="text-ink-2 py-2.5 text-right tabular-nums">
                          {nf.format(account.totalEarned)}
                        </td>
                        <td className="text-ink-3 py-2.5 text-right text-xs tabular-nums">
                          {account.customer.lastVisitAt
                            ? df.format(account.customer.lastVisitAt)
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-5">
          {/* ── Phân bố hạng ─────────────────────────────── */}
          <section className="lv-card rounded-2xl p-5">
            <h2 className="text-ink mb-4 text-sm font-bold">Phân bố hạng thành viên</h2>
            <ul className="space-y-3">
              {overview.tiers.map((tier) => (
                <li key={tier.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: tier.color }}
                        aria-hidden
                      />
                      <span className="text-ink truncate text-xs font-semibold">{tier.name}</span>
                      <span className="text-ink-3 shrink-0 text-[0.65rem]">
                        từ {nf.format(tier.minPoints)} điểm · ×{tier.pointsMultiplier}
                      </span>
                    </span>
                    <span className="text-ink shrink-0 text-xs font-bold tabular-nums">
                      {tier._count.memberships}
                    </span>
                  </div>
                  <span className="bg-line mt-1.5 block h-1.5 overflow-hidden rounded-full">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(tier._count.memberships / maxTierCount) * 100}%`,
                        background: tier.color,
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Giao dịch điểm gần nhất ──────────────────── */}
          <section className="lv-card rounded-2xl p-5">
            <h2 className="text-ink mb-3.5 text-sm font-bold">Giao dịch điểm gần nhất</h2>
            <ul className="divide-line divide-y">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold",
                      TX_TONE[tx.type] ?? "bg-paper-3 text-ink-2",
                    )}
                  >
                    {tx.type.toLowerCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink block truncate text-xs font-semibold">
                      {tx.customer.fullName}
                    </span>
                    {tx.note ? (
                      <span className="text-ink-3 block truncate text-[0.65rem]">{tx.note}</span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-xs font-bold tabular-nums",
                      tx.points >= 0 ? "text-mint-ink" : "text-brand-ink",
                    )}
                  >
                    {tx.points >= 0 ? "+" : ""}
                    {nf.format(tx.points)}
                  </span>
                  <span className="text-ink-3 shrink-0 text-[0.65rem] tabular-nums">
                    {df.format(tx.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* ── Quà và voucher ─────────────────────────────── */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="lv-card rounded-2xl p-5">
          <h2 className="text-ink mb-4 flex items-center gap-2 text-sm font-bold">
            <Gift className="text-magenta size-4" aria-hidden />
            Quà đổi điểm
          </h2>
          <ul className="divide-line divide-y">
            {catalogue.rewards.map((reward) => (
              <li key={reward.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate text-sm font-semibold">
                    {reward.name}
                  </span>
                  <span className="text-ink-3 block truncate text-xs">
                    {reward.stock === null ? "Không giới hạn" : `Còn ${reward.stock}`} ·{" "}
                    {reward._count.redemptions} lượt đổi
                  </span>
                </span>
                <span className="bg-amber-tint text-amber-ink shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums">
                  {nf.format(reward.pointsCost)} đ
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lv-card rounded-2xl p-5">
          <h2 className="text-ink mb-4 flex items-center gap-2 text-sm font-bold">
            <Ticket className="text-violet size-4" aria-hidden />
            Voucher
          </h2>
          <ul className="divide-line divide-y">
            {catalogue.vouchers.map((voucher) => (
              <li key={voucher.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate text-sm font-semibold">
                    {voucher.title}
                  </span>
                  <span className="text-ink-3 block truncate font-mono text-[0.65rem]">
                    {voucher.code} · đã phát {voucher._count.issued}
                    {voucher.quantity ? `/${voucher.quantity}` : ""}
                    {voucher.autoBirthday ? " · tự phát sinh nhật" : ""}
                  </span>
                </span>
                <span className="bg-violet-tint text-violet-ink shrink-0 rounded-full px-2.5 py-1 text-xs font-bold">
                  {voucher.discountType === "PERCENT"
                    ? `−${voucher.discountValue}%`
                    : voucher.discountType === "FIXED"
                      ? `−${voucher.discountValue} €`
                      : "Tặng món"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* ── Luật tính điểm ─────────────────────────────── */}
      {overview.program ? (
        <section className="lv-card mt-5 rounded-2xl p-5">
          <h2 className="text-ink mb-4 text-sm font-bold">Luật đang áp dụng</h2>
          <div className="flex flex-wrap gap-2.5">
            {overview.program.rules.map((rule) => (
              <span
                key={rule.id}
                className="border-line bg-paper-3 text-ink-2 rounded-full border px-3 py-1.5 text-xs"
              >
                {rule.name}
                <span className="text-ink ml-1.5 font-bold tabular-nums">
                  {rule.kind === "double_points" ? `×${rule.value}` : `+${rule.value}`}
                </span>
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
