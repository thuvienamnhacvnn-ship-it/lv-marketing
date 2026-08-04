"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
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
  changeStatusAction,
  deleteContentAction,
  saveContentAction,
} from "@/features/calendar/actions";
import {
  ALLOWED_TRANSITIONS,
  CONTENT_STATUSES,
  CONTENT_TYPES,
  LANGUAGES,
} from "@/features/calendar/schema";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  FACEBOOK_POST: "Bài Facebook",
  INSTAGRAM_CAPTION: "Caption Instagram",
  TIKTOK_SCRIPT: "Kịch bản TikTok",
  GOOGLE_BUSINESS_POST: "Bài Google Business",
  BLOG_ARTICLE: "Bài blog",
  NEWSLETTER: "Bản tin email",
  WHATSAPP_MESSAGE: "Tin WhatsApp",
  PROMOTION: "Khuyến mại",
  EVENT_ANNOUNCEMENT: "Thông báo sự kiện",
  MENU_DESCRIPTION: "Mô tả món",
};

export const STATUS_LABELS: Record<string, string> = {
  IDEA: "Ý tưởng",
  DRAFT: "Nháp",
  WAITING_APPROVAL: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  SCHEDULED: "Đã lên lịch",
  PUBLISHED: "Đã đăng",
  FAILED: "Lỗi đăng",
  ARCHIVED: "Lưu trữ",
};

const LANG_LABELS: Record<string, string> = { VI: "Tiếng Việt", DE: "Tiếng Đức", BOTH: "Cả hai" };

export type EditorItem = {
  id: string;
  title: string;
  body?: string;
  status: string;
  type: string;
  language: string;
  callToAction?: string | null;
  hashtags?: string[];
  targetDate: Date | string | null;
};

function toDayKey(value: Date | string | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

/**
 * Bảng biên tập một nội dung.
 *
 * `item === null` là tạo mới; có `item` là sửa. Trạng thái chỉ đổi được theo các
 * bước hợp lệ — nút nào không hợp lệ thì không hiện, và máy chủ kiểm lại lần nữa.
 */
export function ContentEditor({
  slug,
  open,
  item,
  defaultDayKey,
  onClose,
}: {
  slug: string;
  open: boolean;
  item: EditorItem | null;
  defaultDayKey?: string;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent side="right" className="bg-paper w-[min(34rem,95vw)] overflow-y-auto">
        {/*
          `key` làm biểu mẫu mount lại mỗi lần mở một bài khác, nên state khởi tạo
          thẳng từ props. Cách kia — nạp lại bằng `useEffect` + `setState` — vừa
          bị quy tắc `react-hooks/set-state-in-effect` chặn, vừa gây một lần render
          thừa với dữ liệu của bài mở trước đó.
        */}
        {open ? (
          <EditorForm
            key={item?.id ?? `new-${defaultDayKey ?? ""}`}
            slug={slug}
            item={item}
            defaultDayKey={defaultDayKey}
            onClose={onClose}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function EditorForm({
  slug,
  item,
  defaultDayKey,
  onClose,
}: {
  slug: string;
  item: EditorItem | null;
  defaultDayKey?: string;
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    title: item?.title ?? "",
    body: item?.body ?? "",
    type: item?.type ?? "FACEBOOK_POST",
    status: item?.status ?? "DRAFT",
    language: item?.language ?? "VI",
    callToAction: item?.callToAction ?? "",
    hashtags: (item?.hashtags ?? []).join(" "),
    targetDate: toDayKey(item?.targetDate) || defaultDayKey || "",
  });

  function save() {
    start(async () => {
      const res = await saveContentAction(
        slug,
        { ...form, targetDate: form.targetDate || null },
        item?.id,
      );
      if (res.ok) {
        toast.success(res.message);
        onClose();
      } else {
        setErrors(res.fields ?? {});
        toast.error(res.message);
      }
    });
  }

  function changeStatus(next: string) {
    if (!item) return;
    start(async () => {
      const res = await changeStatusAction(slug, item.id, next);
      if (res.ok) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
      }
    });
  }

  function remove() {
    if (!item) return;
    start(async () => {
      const res = await deleteContentAction(slug, item.id);
      if (res.ok) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
      }
    });
  }

  const transitions = item ? (ALLOWED_TRANSITIONS[item.status] ?? []) : [];

  return (
    <>
        <SheetHeader>
          <SheetTitle className="text-left">
            {item ? "Sửa nội dung" : "Nội dung mới"}
          </SheetTitle>
          <SheetDescription className="text-left">
            {item
              ? `Trạng thái hiện tại: ${STATUS_LABELS[item.status] ?? item.status}`
              : "Điền nội dung rồi chọn ngày đăng."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <Field label="Tiêu đề" error={errors.title}>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Phở bò đặc biệt — món tuần này"
            />
          </Field>

          <Field label="Nội dung" error={errors.body}>
            <Textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={8}
              placeholder="Nước dùng ninh 12 tiếng từ 4 giờ sáng…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Dạng nội dung">
              <Select
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v })}
                options={CONTENT_TYPES.map((t) => ({ value: t, label: TYPE_LABELS[t] ?? t }))}
              />
            </Field>
            <Field label="Ngôn ngữ">
              <Select
                value={form.language}
                onChange={(v) => setForm({ ...form, language: v })}
                options={LANGUAGES.map((l) => ({ value: l, label: LANG_LABELS[l] }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày đăng">
              <Input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
              />
            </Field>
            <Field label="Trạng thái">
              {item ? (
                // Khi sửa, trạng thái đổi qua các nút bên dưới để đi đúng quy trình.
                <p className="border-line bg-paper-3 text-ink-2 flex h-9 items-center rounded-lg border px-2.5 text-sm">
                  {STATUS_LABELS[form.status] ?? form.status}
                </p>
              ) : (
                <Select
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                  options={CONTENT_STATUSES.filter((s) => s === "IDEA" || s === "DRAFT").map(
                    (s) => ({ value: s, label: STATUS_LABELS[s] }),
                  )}
                />
              )}
            </Field>
          </div>

          <Field label="Lời kêu gọi">
            <Input
              value={form.callToAction}
              onChange={(e) => setForm({ ...form, callToAction: e.target.value })}
              placeholder="Đặt bàn ngay"
            />
          </Field>

          <Field label="Hashtag">
            <Input
              value={form.hashtags}
              onChange={(e) => setForm({ ...form, hashtags: e.target.value })}
              placeholder="#nhahangsen #berlin"
            />
          </Field>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" className="rounded-full" onClick={save} disabled={pending}>
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Save className="size-3.5" aria-hidden />
              )}
              Lưu
            </Button>
            {item ? (
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

          {item && transitions.length > 0 ? (
            <div className="border-line border-t pt-4">
              <p className="text-ink-2 mb-2 text-xs font-semibold">Chuyển trạng thái</p>
              <div className="flex flex-wrap gap-2">
                {transitions.map((next) => (
                  <Button
                    key={next}
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={pending}
                    onClick={() => changeStatus(next)}
                  >
                    → {STATUS_LABELS[next] ?? next}
                  </Button>
                ))}
              </div>
              <p className="text-ink-3 mt-2.5 text-xs leading-relaxed">
                Không có bước nhảy thẳng sang “Đã đăng” — trạng thái đó chỉ do tiến trình đăng bài
                thật đặt, nếu không số liệu báo cáo sẽ sai.
              </p>
            </div>
          ) : null}
        </div>
    </>
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
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "border-input bg-paper-2 text-ink focus-visible:ring-brand/40 h-9 w-full rounded-lg border px-2.5 text-sm",
        "focus-visible:ring-2 focus-visible:outline-none",
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
