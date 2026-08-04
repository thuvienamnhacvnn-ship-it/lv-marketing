"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Send, Sparkles, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteReviewReplyAction,
  draftReviewReplyAction,
  saveReviewReplyAction,
} from "@/features/reviews/actions";
import { cn } from "@/lib/utils";

export type ReviewReplyItem = {
  id: string;
  body: string;
  isAiDraft: boolean;
  createdAt: Date | string;
};

export type ReviewItem = {
  id: string;
  authorName: string;
  rating: number;
  body: string | null;
  language: string;
  source: string;
  sentiment: string;
  topics: string[];
  postedAt: Date | string;
  replies: ReviewReplyItem[];
};

const SENTIMENT_TONE: Record<string, string> = {
  POSITIVE: "bg-mint-tint text-mint-ink",
  NEUTRAL: "bg-paper-3 text-ink-2",
  NEGATIVE: "bg-magenta-tint text-magenta-ink",
};

const SENTIMENT_LABEL: Record<string, string> = {
  POSITIVE: "Tích cực",
  NEUTRAL: "Trung tính",
  NEGATIVE: "Tiêu cực",
};

export function ReviewCard({
  slug,
  review,
  locale,
}: {
  slug: string;
  review: ReviewItem;
  locale: string;
}) {
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [escalation, setEscalation] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [drafting, startDraft] = useTransition();

  const df = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const answered = review.replies.length > 0;
  const urgent = !answered && review.sentiment === "NEGATIVE";

  function askAi() {
    startDraft(async () => {
      const res = await draftReviewReplyAction(slug, review.id);
      if (res.ok) {
        setDraft(res.reply);
        setOpen(true);
        setEscalation(res.escalate ? (res.escalationReason ?? "Nên có người phụ trách xem lại.") : null);
        toast.success("Đã soạn nháp — đọc lại trước khi lưu.");
      } else {
        toast.error(res.message);
      }
    });
  }

  function save() {
    if (!draft.trim()) {
      toast.error("Chưa có nội dung phản hồi.");
      return;
    }
    start(async () => {
      const res = await saveReviewReplyAction(slug, review.id, draft);
      if (res.ok) {
        toast.success(res.message);
        setDraft("");
        setOpen(false);
        setEscalation(null);
      } else {
        toast.error(res.message);
      }
    });
  }

  function removeReply(replyId: string) {
    start(async () => {
      const res = await deleteReviewReplyAction(slug, replyId);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <article
      className={cn(
        "rounded-2xl border p-4 transition-colors",
        urgent ? "border-magenta/40 bg-magenta-tint/20" : "border-line bg-paper-2",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              className={cn(
                "size-3.5",
                i < review.rating ? "fill-amber text-amber" : "text-line-strong",
              )}
              aria-hidden
            />
          ))}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[0.6rem] font-bold",
            SENTIMENT_TONE[review.sentiment] ?? "bg-paper-3 text-ink-2",
          )}
        >
          {SENTIMENT_LABEL[review.sentiment] ?? review.sentiment}
        </span>
        {!answered ? (
          <span className="border-magenta/40 text-magenta-ink rounded-full border px-2 py-0.5 text-[0.6rem] font-bold">
            Chưa trả lời
          </span>
        ) : null}
        <span className="text-ink-3 ml-auto text-xs">
          {review.authorName} · {review.source.toLowerCase()} · {df.format(new Date(review.postedAt))}
        </span>
      </div>

      {review.body ? (
        <p className="text-ink mt-2.5 text-sm leading-relaxed">„{review.body}“</p>
      ) : (
        <p className="text-ink-3 mt-2.5 text-sm italic">Khách chấm sao nhưng không viết gì.</p>
      )}

      {review.topics.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {review.topics.map((topic) => (
            <span key={topic} className="bg-paper-3 text-ink-3 rounded px-1.5 py-0.5 text-[0.62rem]">
              {topic}
            </span>
          ))}
        </div>
      ) : null}

      {/* ── Phản hồi đã có ─────────────────────────────────── */}
      {review.replies.map((reply) => (
        <div key={reply.id} className="border-line bg-paper-3 mt-3 rounded-xl border p-3">
          <p className="text-ink-3 mb-1 flex items-center gap-1.5 text-[0.6rem] font-bold uppercase">
            Phản hồi của quán
            {reply.isAiDraft ? (
              <span className="text-violet-ink">· AI soạn</span>
            ) : null}
            <button
              type="button"
              onClick={() => removeReply(reply.id)}
              disabled={pending}
              className="text-ink-3 hover:text-magenta-ink ml-auto"
              aria-label="Xoá phản hồi"
            >
              <Trash2 className="size-3" aria-hidden />
            </button>
          </p>
          <p className="text-ink-2 text-sm leading-relaxed">{reply.body}</p>
        </div>
      ))}

      {/* ── Soạn phản hồi ──────────────────────────────────── */}
      {!answered || open ? (
        <div className="mt-3">
          {open ? (
            <>
              {escalation ? (
                <div className="border-magenta/30 bg-magenta-tint/30 mb-2 flex items-start gap-2 rounded-xl border p-2.5">
                  <AlertTriangle className="text-magenta-ink mt-0.5 size-3 shrink-0" aria-hidden />
                  <p className="text-ink-2 text-xs leading-relaxed">
                    <span className="text-ink font-semibold">AI đề nghị chuyển người phụ trách:</span>{" "}
                    {escalation}
                  </p>
                </div>
              ) : null}
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                placeholder="Viết phản hồi…"
              />
            </>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-2">
            {open ? (
              <Button size="sm" className="rounded-full" onClick={save} disabled={pending}>
                {pending ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-3.5" aria-hidden />
                )}
                Lưu phản hồi
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={() => setOpen(true)}
              >
                Viết phản hồi
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full"
              onClick={askAi}
              disabled={drafting}
            >
              {drafting ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-3.5" aria-hidden />
              )}
              AI soạn nháp
            </Button>
            {open ? (
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setOpen(false);
                  setDraft("");
                  setEscalation(null);
                }}
              >
                Huỷ
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
