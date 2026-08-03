"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Hash,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateContentAction, saveVariantAction } from "@/features/studio/actions";
import { CHANNELS, CONTENT_TYPES, type StudioResult } from "@/features/studio/schema";
import { cn } from "@/lib/utils";

const CHANNEL_LABELS: Record<(typeof CHANNELS)[number], string> = {
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  GOOGLE_BUSINESS: "Google Business",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
};

const TYPE_LABELS: Record<(typeof CONTENT_TYPES)[number], string> = {
  INSTAGRAM_CAPTION: "Caption Instagram",
  FACEBOOK_POST: "Bài Facebook",
  TIKTOK_SCRIPT: "Kịch bản TikTok",
  GOOGLE_BUSINESS_POST: "Bài Google Business",
  PROMOTION: "Chương trình khuyến mại",
  EVENT_ANNOUNCEMENT: "Thông báo sự kiện",
  MENU_DESCRIPTION: "Mô tả món",
};

const LENGTHS = [
  { value: "short", label: "Ngắn" },
  { value: "medium", label: "Vừa" },
  { value: "long", label: "Dài" },
] as const;

const LANGUAGES = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "de", label: "Tiếng Đức" },
  { value: "both", label: "Cả hai" },
] as const;

export function StudioForm({ slug }: { slug: string }) {
  const [result, setResult] = useState<StudioResult | null>(null);
  const [selected, setSelected] = useState(0);
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  const [saving, startSaving] = useTransition();

  // Giữ lại bản khai để bấm "Tạo lại" không phải nhập tay từ đầu.
  const [form, setForm] = useState({
    goal: "Tăng lượt đặt bàn tối cuối tuần",
    channel: "INSTAGRAM" as (typeof CHANNELS)[number],
    contentType: "INSTAGRAM_CAPTION" as (typeof CONTENT_TYPES)[number],
    language: "vi" as "vi" | "de" | "both",
    tone: "Ấm áp, tự hào về món ăn",
    length: "medium" as "short" | "medium" | "long",
    product: "",
    promotion: "",
    callToAction: "",
    extraNotes: "",
    variantCount: 3,
  });

  const fieldErrors = result && !result.ok && result.reason === "validation" ? result.fields : undefined;

  function submit() {
    startTransition(async () => {
      const next = await generateContentAction(slug, form);
      setResult(next);
      setSelected(0);
      setSavedIndexes(new Set());
      if (!next.ok) toast.error(next.message);
    });
  }

  function save(index: number) {
    if (!result?.ok) return;
    const variant = result.variants[index];
    startSaving(async () => {
      const res = await saveVariantAction(slug, {
        title: variant.headline,
        body: variant.body,
        hashtags: variant.hashtags,
        callToAction: variant.callToAction,
        contentType: form.contentType,
        language: form.language,
      });
      if (res.ok) {
        setSavedIndexes((prev) => new Set(prev).add(index));
        toast.success("Đã lưu vào nội dung nháp");
      } else {
        toast.error(res.message);
      }
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      {/* ── Bản khai ─────────────────────────────────────── */}
      <section className="lv-card h-fit rounded-2xl p-5">
        <h2 className="text-ink text-sm font-bold">Bản khai</h2>
        <p className="text-ink-3 mt-1 text-xs leading-relaxed">
          Claude đọc thêm hồ sơ thương hiệu của bạn: món, giá, giọng văn, từ cấm.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Mục tiêu" error={fieldErrors?.goal}>
            <Input
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
              placeholder="Tăng lượt đặt bàn tối cuối tuần"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Kênh">
              <NativeSelect
                value={form.channel}
                onChange={(v) => setForm({ ...form, channel: v as (typeof CHANNELS)[number] })}
                options={CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABELS[c] }))}
              />
            </Field>
            <Field label="Dạng nội dung">
              <NativeSelect
                value={form.contentType}
                onChange={(v) =>
                  setForm({ ...form, contentType: v as (typeof CONTENT_TYPES)[number] })
                }
                options={CONTENT_TYPES.map((c) => ({ value: c, label: TYPE_LABELS[c] }))}
              />
            </Field>
          </div>

          <Field label="Món hoặc dịch vụ">
            <Input
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              placeholder="Bún bò Huế"
            />
          </Field>

          <Field label="Giọng văn" error={fieldErrors?.tone}>
            <Input
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
              placeholder="Ấm áp, tự hào về món ăn"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Ngôn ngữ">
              <NativeSelect
                value={form.language}
                onChange={(v) => setForm({ ...form, language: v as "vi" | "de" | "both" })}
                options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
              />
            </Field>
            <Field label="Độ dài">
              <NativeSelect
                value={form.length}
                onChange={(v) => setForm({ ...form, length: v as "short" | "medium" | "long" })}
                options={LENGTHS.map((l) => ({ value: l.value, label: l.label }))}
              />
            </Field>
            <Field label="Số phương án">
              <NativeSelect
                value={String(form.variantCount)}
                onChange={(v) => setForm({ ...form, variantCount: Number(v) })}
                options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: String(n) }))}
              />
            </Field>
          </div>

          <Field label="Khuyến mại (nếu có)">
            <Input
              value={form.promotion}
              onChange={(e) => setForm({ ...form, promotion: e.target.value })}
              placeholder="Combo trưa 9,90 € từ thứ Hai đến thứ Sáu"
            />
          </Field>

          <Field label="Ghi chú thêm">
            <Textarea
              value={form.extraNotes}
              onChange={(e) => setForm({ ...form, extraNotes: e.target.value })}
              rows={3}
              placeholder="Nhắc khách đặt bàn trước, tránh nói quá về độ cay…"
            />
          </Field>
        </div>

        <Button
          size="lg"
          className="mt-5 w-full rounded-full"
          onClick={submit}
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Claude đang viết…
            </>
          ) : (
            <>
              <Sparkles className="size-4" aria-hidden />
              Tạo nội dung
            </>
          )}
        </Button>
      </section>

      {/* ── Kết quả ──────────────────────────────────────── */}
      <section className="min-w-0">
        {!result && !pending ? (
          <div className="border-line text-ink-3 flex h-full min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center">
            <Sparkles className="text-ink-3/50 size-8" aria-hidden />
            <p className="mt-3 text-sm">Khai xong bên trái rồi bấm “Tạo nội dung”.</p>
            <p className="mt-1 text-xs">Mỗi lần chạy cho ra tối đa bốn phương án khác nhau.</p>
          </div>
        ) : null}

        {pending ? (
          <div className="border-line flex h-full min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed p-8">
            <Loader2 className="text-brand size-7 animate-spin" aria-hidden />
            <p className="text-ink-2 mt-3 text-sm">Đang soạn {form.variantCount} phương án…</p>
            <p className="text-ink-3 mt-1 text-xs">Thường mất 5–15 giây.</p>
          </div>
        ) : null}

        {result && !result.ok ? <ErrorPanel result={result} onRetry={submit} /> : null}

        {result?.ok ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-ink text-sm font-bold">
                {result.variants.length} phương án
              </p>
              <div className="flex items-center gap-3">
                <span className="text-ink-3 text-xs tabular-nums">
                  {(result.latencyMs / 1000).toFixed(1)}s ·{" "}
                  {(result.costMicroCents / 10000).toFixed(2)}¢
                </span>
                <Button variant="ghost" size="sm" className="rounded-full" onClick={submit}>
                  <RefreshCw className="size-3.5" aria-hidden />
                  Tạo lại
                </Button>
              </div>
            </div>

            {result.variants.map((variant, i) => {
              const on = i === selected;
              const saved = savedIndexes.has(i);
              return (
                <article
                  key={i}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-4 transition-all duration-200",
                    on
                      ? "border-brand/40 bg-brand-tint/40 shadow-[var(--shadow-sm)]"
                      : "border-line bg-paper-2 hover:border-line-strong",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-ink text-sm font-bold">{variant.headline}</h3>
                    {on ? (
                      <span className="bg-brand shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-bold text-white">
                        Đang chọn
                      </span>
                    ) : null}
                  </div>

                  <p className="text-ink-2 mt-2.5 text-sm leading-relaxed whitespace-pre-wrap">
                    {variant.body}
                  </p>

                  {variant.hashtags.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {variant.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-violet-tint text-violet-ink rounded px-1.5 py-0.5 text-[0.65rem] font-semibold"
                        >
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="border-line mt-3.5 flex flex-wrap items-center gap-2 border-t pt-3">
                    <span className="text-ink-3 flex items-center gap-1 text-xs">
                      <Hash className="size-3" aria-hidden />
                      {variant.callToAction}
                    </span>
                    <span className="text-ink-3 ml-auto text-[0.65rem] italic">
                      {variant.toneNote}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant={saved ? "outline" : "default"}
                      className="rounded-full"
                      disabled={saving || saved}
                      onClick={(e) => {
                        e.stopPropagation();
                        save(i);
                      }}
                    >
                      {saved ? (
                        <>
                          <Check className="size-3.5" aria-hidden />
                          Đã lưu
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5" aria-hidden />
                          Lưu thành nháp
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        void navigator.clipboard.writeText(
                          `${variant.headline}\n\n${variant.body}\n\n${variant.hashtags.join(" ")}`,
                        );
                        toast.success("Đã chép vào bộ nhớ tạm");
                      }}
                    >
                      <Copy className="size-3.5" aria-hidden />
                      Chép
                    </Button>
                  </div>
                </article>
              );
            })}

            {result.complianceNotes.length > 0 ? (
              <div className="border-amber/30 bg-amber-tint/40 rounded-2xl border p-4">
                <p className="text-amber-ink flex items-center gap-1.5 text-xs font-bold uppercase">
                  <AlertTriangle className="size-3.5" aria-hidden />
                  Cần kiểm lại trước khi đăng
                </p>
                <ul className="text-ink-2 mt-2 space-y-1 text-sm">
                  {result.complianceNotes.map((note) => (
                    <li key={note}>· {note}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.imagePrompt ? (
              <div className="border-line bg-paper-3 rounded-2xl border p-4">
                <p className="text-ink-3 flex items-center gap-1.5 text-xs font-bold uppercase">
                  <ImageIcon className="size-3.5" aria-hidden />
                  Gợi ý ảnh đi kèm
                </p>
                <p className="text-ink-2 mt-2 text-sm leading-relaxed">{result.imagePrompt}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ErrorPanel({ result, onRetry }: { result: StudioResult; onRetry: () => void }) {
  if (result.ok) return null;
  const canRetry = result.reason === "rate_limited" || result.reason === "invalid_output" || result.reason === "failed";

  return (
    <div className="border-magenta/30 bg-magenta-tint/30 rounded-2xl border p-5">
      <p className="text-magenta-ink flex items-center gap-2 text-sm font-bold">
        <AlertTriangle className="size-4" aria-hidden />
        {result.reason === "not_configured"
          ? "Chưa bật tính năng AI"
          : result.reason === "rate_limited"
            ? "Đang quá tải"
            : result.reason === "validation"
              ? "Bản khai chưa hợp lệ"
              : "Không tạo được nội dung"}
      </p>
      <p className="text-ink-2 mt-2 text-sm leading-relaxed">{result.message}</p>
      {canRetry ? (
        <Button size="sm" variant="outline" className="mt-4 rounded-full" onClick={onRetry}>
          <RefreshCw className="size-3.5" aria-hidden />
          Thử lại
        </Button>
      ) : null}
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

/**
 * Dùng `<select>` gốc thay cho Select của Base UI.
 *
 * Bản khai có sáu ô chọn nằm sát nhau; select gốc mở nhanh, hoạt động tốt trên
 * điện thoại (iOS hiện bánh xe quay quen thuộc) và không cần thêm mã cho bàn phím.
 */
function NativeSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-input bg-paper-2 text-ink focus-visible:ring-brand/40 h-9 w-full rounded-lg border px-2.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
