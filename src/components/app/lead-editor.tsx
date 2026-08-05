"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ArrowRightLeft,
  CalendarClock,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  addLeadActivityAction,
  convertLeadAction,
  deleteLeadAction,
  fetchLeadActivitiesAction,
  saveLeadAction,
  type ActivityRow,
} from "@/features/crm/actions";
import {
  ACTIVITY_LABELS,
  ACTIVITY_TYPES,
  LEAD_STATUSES,
  STATUS_LABELS,
} from "@/features/crm/schema";
import { cn } from "@/lib/utils";

export type LeadItem = {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  source: string | null;
  need: string | null;
  note: string | null;
  status: string;
  consent: boolean;
  expectedValueCents: number | null;
  nextFollowUpAt: Date | string | null;
  hasCustomer?: boolean;
};

function toDayKey(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

/** Cent → chuỗi euro để đưa vào ô nhập. Chuỗi rỗng nghĩa là chưa ước tính. */
function centsToEuro(cents: number | null | undefined) {
  return cents === null || cents === undefined ? "" : (cents / 100).toFixed(2);
}

export function LeadEditor({
  slug,
  open,
  lead,
  defaultStatus,
  canWrite,
  onClose,
}: {
  slug: string;
  open: boolean;
  lead: LeadItem | null;
  defaultStatus?: string;
  canWrite: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="bg-paper w-[min(36rem,95vw)] overflow-y-auto">
        {/* `key` để biểu mẫu mount lại mỗi lần mở một lead khác — xem chú thích
            cùng kiểu ở content-editor.tsx. */}
        {open ? (
          <LeadForm
            key={lead?.id ?? `new-${defaultStatus ?? ""}`}
            slug={slug}
            lead={lead}
            defaultStatus={defaultStatus}
            canWrite={canWrite}
            onClose={onClose}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function LeadForm({
  slug,
  lead,
  defaultStatus,
  canWrite,
  onClose,
}: {
  slug: string;
  lead: LeadItem | null;
  defaultStatus?: string;
  canWrite: boolean;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    fullName: lead?.fullName ?? "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    source: lead?.source ?? "",
    need: lead?.need ?? "",
    note: lead?.note ?? "",
    status: lead?.status ?? defaultStatus ?? "NEW",
    expectedValueEuro: centsToEuro(lead?.expectedValueCents),
    nextFollowUpAt: toDayKey(lead?.nextFollowUpAt),
    consent: lead?.consent ?? false,
  });

  function save() {
    start(async () => {
      const res = await saveLeadAction(slug, form, lead?.id);
      if (res.ok) {
        toast.success(res.message);
        onClose();
      } else {
        setErrors(res.fields ?? {});
        toast.error(res.message);
      }
    });
  }

  function remove() {
    if (!lead) return;
    start(async () => {
      const res = await deleteLeadAction(slug, lead.id);
      if (res.ok) {
        toast.success(res.message ?? "Đã xoá.");
        onClose();
      } else {
        toast.error(res.message ?? "Không xoá được.");
      }
    });
  }

  function convert() {
    if (!lead) return;
    start(async () => {
      const res = await convertLeadAction(slug, lead.id);
      if (res.ok) toast.success(res.message ?? "Đã tạo hồ sơ.");
      else toast.error(res.message ?? "Không tạo được hồ sơ.");
    });
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-left">{lead ? lead.fullName : "Lead mới"}</SheetTitle>
        <SheetDescription className="text-left">
          {lead
            ? `Đang ở giai đoạn “${STATUS_LABELS[lead.status as keyof typeof STATUS_LABELS] ?? lead.status}”`
            : "Ghi lại người vừa hỏi để không quên gọi lại."}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-4 px-4 pb-6">
        <Field label="Tên khách" error={errors.fullName}>
          <Input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Sabine Krüger"
            disabled={!canWrite}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Điện thoại" error={errors.phone}>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+49 170 1234567"
              disabled={!canWrite}
            />
          </Field>
          <Field label="Email" error={errors.email}>
            <Input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="ten@example.de"
              disabled={!canWrite}
            />
          </Field>
        </div>

        <Field label="Nhu cầu" error={errors.need}>
          <Textarea
            value={form.need}
            onChange={(e) => setForm({ ...form, need: e.target.value })}
            rows={3}
            placeholder="Đặt tiệc sinh nhật 20 khách, tối thứ Bảy"
            disabled={!canWrite}
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Giai đoạn">
            <Select
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={LEAD_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
              disabled={!canWrite}
            />
          </Field>
          <Field label="Nguồn khách" error={errors.source}>
            <Input
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="Google Business"
              disabled={!canWrite}
            />
          </Field>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Giá trị ước tính (€)" error={errors.expectedValueEuro}>
            <Input
              inputMode="decimal"
              value={form.expectedValueEuro}
              onChange={(e) => setForm({ ...form, expectedValueEuro: e.target.value })}
              placeholder="680,00"
              disabled={!canWrite}
            />
          </Field>
          <Field label="Hẹn liên hệ lại" error={errors.nextFollowUpAt}>
            <Input
              type="date"
              value={form.nextFollowUpAt}
              onChange={(e) => setForm({ ...form, nextFollowUpAt: e.target.value })}
              disabled={!canWrite}
            />
          </Field>
        </div>

        <Field label="Ghi chú nội bộ" error={errors.note}>
          <Textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={3}
            placeholder="Khách hỏi giá set menu chay…"
            disabled={!canWrite}
          />
        </Field>

        {/* Đồng ý nhận tiếp thị — bắt buộc phải rõ ràng trước khi đưa khách vào
            bất kỳ chiến dịch email/SMS nào. */}
        <label
          className={cn(
            "border-line bg-paper-2 flex cursor-pointer items-start gap-2.5 rounded-xl border p-3",
            !canWrite && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            disabled={!canWrite}
            className="accent-brand mt-0.5 size-4"
          />
          <span>
            <span className="text-ink flex items-center gap-1.5 text-sm font-semibold">
              {form.consent ? (
                <ShieldCheck className="text-mint-ink size-3.5" aria-hidden />
              ) : (
                <ShieldOff className="text-ink-3 size-3.5" aria-hidden />
              )}
              Khách đồng ý nhận thông tin tiếp thị
            </span>
            <span className="text-ink-3 mt-0.5 block text-xs leading-relaxed">
              Chưa tick thì lead này không được đưa vào chiến dịch email hay SMS. Gửi cho người chưa
              đồng ý là vi phạm quy định ở Đức.
            </span>
          </span>
        </label>

        {canWrite ? (
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" className="rounded-full" onClick={save} disabled={pending}>
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Save className="size-3.5" aria-hidden />
              )}
              Lưu
            </Button>

            {lead && lead.status === "WON" && !lead.hasCustomer ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={convert}
                disabled={pending}
              >
                <UserPlus className="size-3.5" aria-hidden />
                Tạo hồ sơ khách hàng
              </Button>
            ) : null}

            {/* Lead đã chốt là số liệu doanh thu — máy chủ chặn xoá, nên đây cũng
                không hiện nút. Bày ra một nút bấm vào là báo lỗi thì tệ hơn là
                không có nút. */}
            {lead && lead.status !== "WON" ? (
              <Button
                size="sm"
                variant="outline"
                className="text-magenta-ink rounded-full"
                onClick={remove}
                disabled={pending}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Xoá
              </Button>
            ) : null}
          </div>
        ) : null}

        {lead ? <ActivityLog slug={slug} leadId={lead.id} canWrite={canWrite} /> : null}
      </div>
    </>
  );
}

const ACTIVITY_ICON: Record<string, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: CalendarClock,
  STAGE: ArrowRightLeft,
};

/**
 * Nhật ký chăm sóc.
 *
 * Đây là phần khiến CRM khác một danh sách tên: mỗi lần gọi, mỗi lần đổi giai
 * đoạn đều để lại dấu, nên người nhận bàn giao đọc là hiểu ngay đã nói gì với
 * khách.
 */
function ActivityLog({
  slug,
  leadId,
  canWrite,
}: {
  slug: string;
  leadId: string;
  canWrite: boolean;
}) {
  const [rows, setRows] = useState<ActivityRow[] | null>(null);
  const [type, setType] = useState<string>("NOTE");
  const [content, setContent] = useState("");
  const [pending, start] = useTransition();

  // Nạp một lần khi bảng mở. Danh sách này chỉ có ở máy chủ nên phải gọi ra.
  useEffect(() => {
    let alive = true;
    fetchLeadActivitiesAction(slug, leadId)
      .then((data) => {
        if (alive) setRows(data);
      })
      .catch(() => {
        if (alive) setRows([]);
      });
    return () => {
      alive = false;
    };
  }, [slug, leadId]);

  function add() {
    if (!content.trim()) {
      toast.error("Chưa có nội dung.");
      return;
    }
    start(async () => {
      const res = await addLeadActivityAction(slug, leadId, { type, content });
      if (res.ok) {
        toast.success(res.message ?? "Đã ghi.");
        setContent("");
        setRows(await fetchLeadActivitiesAction(slug, leadId));
      } else {
        toast.error(res.message ?? "Không ghi được.");
      }
    });
  }

  const df = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border-line border-t pt-4">
      <p className="text-ink-2 mb-2 text-xs font-semibold">Nhật ký chăm sóc</p>

      {canWrite ? (
        <div className="mb-3 space-y-2">
          <div className="flex gap-2">
            <Select
              value={type}
              onChange={setType}
              options={ACTIVITY_TYPES.filter((t) => t !== "STAGE").map((t) => ({
                value: t,
                label: ACTIVITY_LABELS[t] ?? t,
              }))}
            />
            <Button size="sm" className="shrink-0 rounded-full" onClick={add} disabled={pending}>
              {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
              Ghi
            </Button>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            placeholder="Đã gọi, khách xin gửi thực đơn qua email…"
          />
        </div>
      ) : null}

      {rows === null ? (
        <p className="text-ink-3 py-3 text-xs">Đang tải…</p>
      ) : rows.length === 0 ? (
        <p className="text-ink-3 py-3 text-xs">Chưa có ghi chép nào.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => {
            const Icon = ACTIVITY_ICON[row.type] ?? null;
            return (
              <li key={row.id} className="flex gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    row.type === "STAGE" ? "bg-sky-tint text-sky-ink" : "bg-paper-3 text-ink-3",
                  )}
                >
                  {Icon ? <Icon className="size-3" aria-hidden /> : null}
                </span>
                <div className="min-w-0">
                  <p className="text-ink text-sm leading-snug">{row.content}</p>
                  <p className="text-ink-3 mt-0.5 text-[0.65rem]">
                    {ACTIVITY_LABELS[row.type] ?? row.type}
                    {row.userName ? ` · ${row.userName}` : ""} ·{" "}
                    {df.format(new Date(row.createdAt))}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-ink-2 mb-1.5 block text-xs font-semibold">{label}</Label>
      {children}
      {error ? <p className="text-magenta-ink mt-1 text-xs">{error}</p> : null}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "border-input bg-paper-2 text-ink focus-visible:ring-brand/40 h-9 w-full rounded-lg border px-2.5 text-sm",
        "focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60",
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
