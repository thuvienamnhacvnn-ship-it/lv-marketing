"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  changeConversationStatusAction,
  draftReplyAction,
  sendReplyAction,
} from "@/features/inbox/actions";
import { cn } from "@/lib/utils";

export type ThreadMessage = {
  id: string;
  direction: string;
  body: string;
  isAiDraft: boolean;
  sentAt: Date | string;
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Đang mở",
  PENDING: "Chờ khách",
  SNOOZED: "Tạm hoãn",
  RESOLVED: "Đã xong",
  SPAM: "Rác",
};

/**
 * Khung hội thoại: danh sách tin nhắn và ô soạn trả lời.
 *
 * Bản nháp do AI viết đổ thẳng vào ô soạn chứ không tự gửi. Người thật phải đọc
 * lại rồi mới bấm gửi — câu trả lời sai về giá hay giờ mở cửa đi tới khách rồi
 * thì không rút lại được.
 */
export function InboxThread({
  slug,
  conversationId,
  status,
  messages,
  locale,
}: {
  slug: string;
  conversationId: string;
  status: string;
  messages: ThreadMessage[];
  locale: string;
}) {
  const [text, setText] = useState("");
  const [escalation, setEscalation] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [drafting, startDraft] = useTransition();

  const dtf = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  function send(direction: "OUTBOUND" | "INTERNAL_NOTE") {
    if (!text.trim()) {
      toast.error("Chưa có nội dung.");
      return;
    }
    start(async () => {
      const res = await sendReplyAction(slug, conversationId, text, direction);
      if (res.ok) {
        toast.success(res.message ?? "Đã gửi.");
        setText("");
        setEscalation(null);
      } else {
        toast.error(res.message);
      }
    });
  }

  function draft() {
    startDraft(async () => {
      const res = await draftReplyAction(slug, conversationId);
      if (res.ok) {
        setText(res.reply);
        setEscalation(res.escalate ? (res.escalationReason ?? "Nên chuyển cho người phụ trách.") : null);
        toast.success("Đã soạn nháp — đọc lại trước khi gửi.");
      } else {
        toast.error(res.message);
      }
    });
  }

  function setStatus(next: string) {
    start(async () => {
      const res = await changeConversationStatusAction(
        slug,
        conversationId,
        next as "OPEN" | "PENDING" | "RESOLVED" | "SNOOZED" | "SPAM",
      );
      if (res.ok) toast.success(res.message ?? "Đã cập nhật.");
      else toast.error(res.message);
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ── Tin nhắn ─────────────────────────────────────── */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => {
          const inbound = message.direction === "INBOUND";
          const note = message.direction === "INTERNAL_NOTE";
          return (
            <div
              key={message.id}
              className={cn("flex", inbound ? "justify-start" : "justify-end")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5",
                  note
                    ? "border-amber/40 bg-amber-tint/50 border border-dashed"
                    : inbound
                      ? "bg-paper-3 rounded-bl-sm"
                      : "bg-brand-tint rounded-br-sm",
                )}
              >
                {note ? (
                  <p className="text-amber-ink mb-1 flex items-center gap-1 text-[0.6rem] font-bold uppercase">
                    <StickyNote className="size-2.5" aria-hidden />
                    Ghi chú nội bộ — khách không thấy
                  </p>
                ) : null}
                <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
                  {message.body}
                </p>
                <p className="text-ink-3 mt-1.5 text-[0.6rem] tabular-nums">
                  {dtf.format(new Date(message.sentAt))}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Cảnh báo cần chuyển người ────────────────────── */}
      {escalation ? (
        <div className="border-magenta/30 bg-magenta-tint/30 mt-3 flex items-start gap-2 rounded-xl border p-3">
          <AlertTriangle className="text-magenta-ink mt-0.5 size-3.5 shrink-0" aria-hidden />
          <p className="text-ink-2 text-xs leading-relaxed">
            <span className="text-ink font-semibold">AI đề nghị chuyển cho người phụ trách:</span>{" "}
            {escalation}
          </p>
        </div>
      ) : null}

      {/* ── Ô soạn ───────────────────────────────────────── */}
      <div className="border-line mt-3 border-t pt-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Viết trả lời, hoặc bấm “AI soạn nháp”…"
        />
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Button size="sm" className="rounded-full" onClick={() => send("OUTBOUND")} disabled={pending}>
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Send className="size-3.5" aria-hidden />
            )}
            Gửi
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={draft}
            disabled={drafting}
          >
            {drafting ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="size-3.5" aria-hidden />
            )}
            AI soạn nháp
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-full"
            onClick={() => send("INTERNAL_NOTE")}
            disabled={pending}
          >
            <StickyNote className="size-3.5" aria-hidden />
            Ghi chú
          </Button>

          <span className="ml-auto flex items-center gap-1.5">
            {status !== "RESOLVED" ? (
              <Button
                size="sm"
                variant="outline"
                className="text-mint-ink rounded-full"
                onClick={() => setStatus("RESOLVED")}
                disabled={pending}
              >
                <Check className="size-3.5" aria-hidden />
                Đánh dấu xong
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => setStatus("OPEN")}
                disabled={pending}
              >
                <MessageSquare className="size-3.5" aria-hidden />
                Mở lại
              </Button>
            )}
          </span>
        </div>
        <p className="text-ink-3 mt-2 text-[0.65rem] leading-relaxed">
          Bản nháp do AI viết không tự gửi. Đọc lại giá, giờ mở cửa và cam kết trước khi bấm gửi.
          Trạng thái hiện tại: <span className="font-semibold">{STATUS_LABELS[status] ?? status}</span>
        </p>
      </div>
    </div>
  );
}
