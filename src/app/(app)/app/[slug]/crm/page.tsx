import Link from "next/link";
import { AlarmClock, Euro, ShieldOff, Target, TrendingUp, Users } from "lucide-react";
import { LeadBoard, NewLeadButton, type BoardColumn } from "@/components/app/lead-board";
import { CustomerTable } from "@/components/app/customer-table";
import { requirePermission } from "@/server/tenant";
import { loadCrmStats, loadCustomers, loadPipeline } from "@/features/crm/queries";
import { getAppDictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/utils";

export const metadata = { title: "CRM" };

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default async function CrmPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ view?: string; q?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const ctx = await requirePermission(slug, "crm:read");
  const { t } = await getAppDictionary();

  const view = query.view === "customers" ? "customers" : "leads";
  const search = query.q ?? "";
  const canWrite = ctx.can("crm:update");

  const [stats, pipeline, customers] = await Promise.all([
    loadCrmStats(ctx.organization.id),
    view === "leads" ? loadPipeline(ctx.organization.id) : null,
    view === "customers" ? loadCustomers(ctx.organization.id, search) : null,
  ]);

  const columns: BoardColumn[] =
    pipeline?.columns.map((column) => ({
      key: column.key,
      name: column.name,
      leads: column.leads.map((lead) => ({
        id: lead.id,
        fullName: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        need: lead.need,
        note: lead.note,
        status: lead.status,
        consent: lead.consent,
        expectedValueCents: lead.expectedValueCents,
        nextFollowUpAt: lead.nextFollowUpAt,
        ownerName: lead.owner?.name ?? null,
        activityCount: lead._count.activities,
        overdue: lead.overdue,
      })),
    })) ?? [];

  return (
    <div className="mx-auto w-full max-w-[110rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-ink text-2xl font-extrabold sm:text-3xl">{t.appNav.crm}</h1>
          <p className="text-ink-2 mt-1.5 text-sm">
            Ai đang hỏi, ai cần gọi lại, ai đã thành khách quen.
          </p>
        </div>
        {canWrite && view === "leads" ? <NewLeadButton slug={slug} /> : null}
      </div>

      {/* Quá hạn theo dõi là con số duy nhất đáng báo động: khách đã hỏi rồi mà
          không ai gọi lại thì coi như mất, không cần đợi báo cáo cuối tháng. */}
      {stats.overdue > 0 ? (
        <div className="border-magenta/40 bg-magenta-tint/30 mt-5 flex items-start gap-3 rounded-2xl border p-4">
          <AlarmClock className="text-magenta-ink mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="text-ink text-sm font-semibold">
              {stats.overdue} lead quá hạn hẹn liên hệ lại
            </p>
            <p className="text-ink-2 mt-1 text-sm leading-relaxed">
              Thẻ viền đỏ trong bảng dưới. Gọi lại hoặc dời ngày hẹn — để nguyên thì tuần sau vẫn
              nằm đó.
            </p>
          </div>
        </div>
      ) : null}

      {/* ── Số liệu ────────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat
          icon={<Target className="text-sky size-4" aria-hidden />}
          label="Lead đang mở"
          value={String(stats.openCount)}
          hint={`${stats.dueSoon} hẹn trong 7 ngày`}
        />
        <Stat
          icon={<Euro className="text-brand size-4" aria-hidden />}
          label="Giá trị đang theo đuổi"
          value={stats.openValueCents > 0 ? eur.format(stats.openValueCents / 100) : "—"}
          hint="Chỉ tính lead chưa đóng"
        />
        <Stat
          icon={<TrendingUp className="text-mint size-4" aria-hidden />}
          label="Chốt tháng này"
          value={String(stats.wonCount)}
          hint={stats.wonValueCents > 0 ? eur.format(stats.wonValueCents / 100) : "Chưa có"}
        />
        <Stat
          icon={<TrendingUp className="text-violet size-4" aria-hidden />}
          label="Tỉ lệ chốt"
          value={stats.winRate === null ? "—" : `${stats.winRate}%`}
          hint={stats.winRate === null ? "Chưa đóng lead nào" : "Trên số lead đã đóng"}
        />
        <Stat
          icon={<Users className="text-amber size-4" aria-hidden />}
          label="Khách hàng"
          value={String(stats.customers)}
          hint={`${stats.consented} được phép gửi tiếp thị`}
        />
      </div>

      {/* ── Chuyển khung nhìn ──────────────────────────────── */}
      <div className="mt-5 mb-3 flex flex-wrap gap-2">
        {[
          { key: "leads", label: "Phễu bán hàng" },
          { key: "customers", label: "Khách hàng" },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`?view=${tab.key}`}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              view === tab.key
                ? "bg-brand-tint text-brand-ink"
                : "text-ink-3 hover:bg-paper-3 hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {view === "leads" ? (
        <>
          <LeadBoard slug={slug} columns={columns} canWrite={canWrite} />
          <p className="text-ink-3 mt-1 text-xs leading-relaxed">
            Kéo thẻ sang cột khác để đổi giai đoạn — mỗi lần chuyển đều được ghi vào nhật ký của
            lead. Trên điện thoại thì giữ thẻ một nhịp rồi mới kéo, vuốt nhanh là cuộn bảng.
            {stats.openCount > 0 ? (
              <>
                {" "}
                Biểu tượng <ShieldOff className="inline size-3 align-text-bottom" aria-hidden /> nghĩa
                là khách chưa đồng ý nhận tiếp thị.
              </>
            ) : null}
          </p>
        </>
      ) : (
        <CustomerTable
          rows={(customers ?? []).map((row) => ({
            id: row.id,
            fullName: row.fullName,
            email: row.email,
            phone: row.phone,
            language: row.language,
            marketingConsent: row.marketingConsent,
            optedOutAt: row.optedOutAt,
            lastVisitAt: row.lastVisitAt,
            totalVisits: row.totalVisits,
            totalSpentCents: row.totalSpentCents,
            tags: row.tags.map((link) => link.tag),
            points: row.loyalty?.points ?? null,
          }))}
          search={search}
        />
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="lv-card rounded-2xl p-4">
      <p className="text-ink-3 flex items-center gap-1.5 text-[0.65rem] font-bold uppercase">
        {icon}
        {label}
      </p>
      <p className="text-ink mt-1.5 text-xl font-extrabold tabular-nums">{value}</p>
      <p className="text-ink-3 mt-0.5 text-[0.65rem]">{hint}</p>
    </div>
  );
}
