"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, GripVertical, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { moveContentAction } from "@/features/calendar/actions";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

export type CalendarItem = {
  id: string;
  title: string;
  status: string;
  type: string;
  language: string;
  targetDate: Date | string | null;
};

const STATUS_TONE: Record<string, string> = {
  IDEA: "bg-paper-3 text-ink-3 border-line",
  DRAFT: "bg-paper-3 text-ink-2 border-line",
  WAITING_APPROVAL: "bg-amber-tint text-amber-ink border-amber/30",
  APPROVED: "bg-mint-tint text-mint-ink border-mint/30",
  SCHEDULED: "bg-sky-tint text-sky-ink border-sky/30",
  PUBLISHED: "bg-brand-tint text-brand-ink border-brand/30",
  FAILED: "bg-magenta-tint text-magenta-ink border-magenta/30",
  ARCHIVED: "bg-paper-3 text-ink-3 border-line",
};

const DAY_LABELS = {
  vi: ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"],
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
} as const;

const UNSCHEDULED_ID = "unscheduled";

function dayKeyOf(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ContentCalendar({
  slug,
  locale,
  year,
  month,
  items,
}: {
  slug: string;
  locale: Locale;
  year: number;
  month: number;
  items: CalendarItem[];
}) {
  const [dragging, setDragging] = useState<CalendarItem | null>(null);
  const [, startTransition] = useTransition();

  /*
    Cập nhật lạc quan: thẻ nhảy sang ô mới ngay khi thả, không đợi máy chủ. Kéo
    thả mà phải chờ một vòng mạng thì cảm giác như bị treo. Nếu máy chủ báo hỏng
    thì React tự trả về trạng thái cũ.
  */
  const [optimistic, moveOptimistic] = useOptimistic(
    items,
    (state: CalendarItem[], move: { id: string; dayKey: string | null }) =>
      state.map((item) =>
        item.id === move.id
          ? { ...item, targetDate: move.dayKey ? `${move.dayKey}T12:00:00.000Z` : null }
          : item,
      ),
  );

  const sensors = useSensors(
    // Phải kéo 6px mới tính là kéo — nếu không thì mỗi cú bấm vào thẻ đều bị
    // hiểu nhầm thành thao tác kéo.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const { days, byDay, unscheduled } = useMemo(() => {
    const first = new Date(Date.UTC(year, month, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const start = new Date(first);
    start.setUTCDate(first.getUTCDate() - offset);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      days.push(d);
    }

    const byDay = new Map<string, CalendarItem[]>();
    const unscheduled: CalendarItem[] = [];
    for (const item of optimistic) {
      if (!item.targetDate) {
        unscheduled.push(item);
        continue;
      }
      const key = new Date(item.targetDate).toISOString().slice(0, 10);
      const bucket = byDay.get(key);
      if (bucket) bucket.push(item);
      else byDay.set(key, [item]);
    }
    return { days, byDay, unscheduled };
  }, [optimistic, year, month]);

  function onDragEnd(event: DragEndEvent) {
    setDragging(null);
    const id = String(event.active.id);
    const over = event.over?.id;
    if (!over) return;

    const dayKey = over === UNSCHEDULED_ID ? null : String(over);
    const current = optimistic.find((item) => item.id === id);
    const currentKey = current?.targetDate
      ? new Date(current.targetDate).toISOString().slice(0, 10)
      : null;
    if (currentKey === dayKey) return;

    startTransition(async () => {
      moveOptimistic({ id, dayKey });
      const res = await moveContentAction(slug, id, dayKey);
      if (!res.ok) toast.error(res.message ?? "Không dời được nội dung.");
    });
  }

  const monthLabel = new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "vi-VN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));

  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };
  const todayKey = dayKeyOf(new Date());
  const labels = DAY_LABELS[locale === "de" ? "de" : "vi"];

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e: DragStartEvent) =>
        setDragging(optimistic.find((i) => i.id === String(e.active.id)) ?? null)
      }
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink text-lg font-extrabold capitalize">{monthLabel}</p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            render={<a href={`?y=${prev.y}&m=${prev.m}`} aria-label="Tháng trước" />}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            render={<a href="?" />}
          >
            Hôm nay
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            render={<a href={`?y=${next.y}&m=${next.m}`} aria-label="Tháng sau" />}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_16rem]">
        {/* ── Lưới tháng ─────────────────────────────────── */}
        <div className="min-w-0">
          <div className="mb-1 grid grid-cols-7 gap-1.5">
            {labels.map((label) => (
              <p key={label} className="text-ink-3 text-center text-[0.65rem] font-bold uppercase">
                {label}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const key = dayKeyOf(day);
              return (
                <DayCell
                  key={key}
                  dayKey={key}
                  dayNumber={day.getUTCDate()}
                  inMonth={day.getUTCMonth() === month}
                  isToday={key === todayKey}
                  items={byDay.get(key) ?? []}
                />
              );
            })}
          </div>
        </div>

        {/* ── Chưa xếp lịch ──────────────────────────────── */}
        <UnscheduledColumn items={unscheduled} />
      </div>

      <DragOverlay dropAnimation={null}>
        {dragging ? (
          <div
            className={cn(
              "rounded-lg border px-2 py-1.5 text-[0.68rem] font-semibold shadow-[var(--shadow-lg)]",
              STATUS_TONE[dragging.status] ?? "bg-paper-3 text-ink-2 border-line",
            )}
          >
            {dragging.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DayCell({
  dayKey,
  dayNumber,
  inMonth,
  isToday,
  items,
}: {
  dayKey: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  items: CalendarItem[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: dayKey });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[6.5rem] rounded-xl border p-1.5 transition-colors",
        inMonth ? "border-line bg-paper-2" : "border-line/60 bg-paper-3/40",
        isOver && "border-brand bg-brand-tint/50",
      )}
    >
      <p
        className={cn(
          "mb-1 px-0.5 text-[0.62rem] font-bold tabular-nums",
          isToday
            ? "bg-brand inline-block rounded-full px-1.5 text-white"
            : inMonth
              ? "text-ink-2"
              : "text-ink-3/60",
        )}
      >
        {dayNumber}
      </p>
      <div className="space-y-1">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function UnscheduledColumn({ items }: { items: CalendarItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: UNSCHEDULED_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-fit rounded-2xl border p-3 transition-colors",
        isOver ? "border-brand bg-brand-tint/40" : "border-line bg-paper-2",
      )}
    >
      <p className="text-ink mb-1 flex items-center gap-1.5 text-xs font-bold">
        <Inbox className="size-3.5" aria-hidden />
        Chưa xếp lịch
        <span className="text-ink-3 ml-auto tabular-nums">{items.length}</span>
      </p>
      <p className="text-ink-3 mb-3 text-[0.65rem] leading-relaxed">
        Kéo sang lưới để xếp ngày đăng. Kéo ngược về đây để gỡ khỏi lịch.
      </p>
      <div className="space-y-1.5">
        {items.length === 0 ? (
          <p className="text-ink-3 py-4 text-center text-xs">Trống</p>
        ) : (
          items.map((item) => <ItemCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: CalendarItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      title={item.title}
      className={cn(
        "flex cursor-grab items-start gap-1 rounded-lg border px-1.5 py-1 text-left text-[0.62rem] leading-tight font-semibold transition-opacity active:cursor-grabbing",
        STATUS_TONE[item.status] ?? "bg-paper-3 text-ink-2 border-line",
        isDragging && "opacity-30",
      )}
    >
      <GripVertical className="mt-px size-2.5 shrink-0 opacity-40" aria-hidden />
      <span className="line-clamp-2 min-w-0">{item.title}</span>
    </div>
  );
}
