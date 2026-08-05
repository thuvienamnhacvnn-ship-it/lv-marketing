"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AlarmClock, GripVertical, Plus, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LeadEditor, type LeadItem } from "@/components/app/lead-editor";
import { moveLeadAction } from "@/features/crm/actions";
import type { LeadStatusKey } from "@/features/crm/schema";
import { cn } from "@/lib/utils";

export type BoardLead = LeadItem & {
  ownerName: string | null;
  activityCount: number;
  /** Tính ở máy chủ — xem chú thích trong `loadPipeline`. */
  overdue: boolean;
};

export type BoardColumn = {
  key: LeadStatusKey;
  name: string;
  leads: BoardLead[];
};

const COLUMN_TONE: Record<string, string> = {
  NEW: "text-ink-2",
  CONTACTED: "text-sky-ink",
  QUALIFIED: "text-sky-ink",
  APPOINTMENT: "text-violet-ink",
  PROPOSAL: "text-amber-ink",
  WON: "text-mint-ink",
  LOST: "text-ink-3",
};

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function sumValue(leads: BoardLead[]) {
  return leads.reduce((total, lead) => total + (lead.expectedValueCents ?? 0), 0);
}

export function LeadBoard({
  slug,
  columns,
  canWrite,
}: {
  slug: string;
  columns: BoardColumn[];
  canWrite: boolean;
}) {
  const [dragging, setDragging] = useState<BoardLead | null>(null);
  const [editor, setEditor] = useState<{ lead: BoardLead | null; status?: string } | null>(null);
  const [, startTransition] = useTransition();

  // Thẻ nhảy cột ngay khi thả, không đợi máy chủ trả lời. Hỏng thì React tự lùi lại.
  const [optimistic, moveOptimistic] = useOptimistic(
    columns,
    (state: BoardColumn[], move: { id: string; to: string }) => {
      const lead = state.flatMap((column) => column.leads).find((item) => item.id === move.id);
      if (!lead) return state;
      return state.map((column) => ({
        ...column,
        leads:
          column.key === move.to
            ? [{ ...lead, status: move.to }, ...column.leads.filter((i) => i.id !== move.id)]
            : column.leads.filter((i) => i.id !== move.id),
      }));
    },
  );

  /*
    Chuột và cảm ứng cần hai luật khác nhau. Trên máy tính, nhích 8px là kéo.
    Trên điện thoại thì không được vậy — bảng phễu cuộn ngang, mà cuộn cũng là
    nhích ngón tay, nên mọi cú vuốt sẽ biến thành kéo thẻ. Ở đó phải giữ 250ms
    mới tính là kéo, còn vuốt nhanh vẫn là cuộn.
  */
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );

  function onDragEnd(event: DragEndEvent) {
    setDragging(null);
    const id = String(event.active.id);
    const to = event.over?.id ? String(event.over.id) : null;
    if (!to) return;

    const current = optimistic.find((column) => column.leads.some((lead) => lead.id === id));
    if (!current || current.key === to) return;

    startTransition(async () => {
      moveOptimistic({ id, to });
      const res = await moveLeadAction(slug, id, to);
      if (!res.ok) toast.error(res.message ?? "Không chuyển được giai đoạn.");
    });
  }

  return (
    <DndContext
      // id cố định — không có thì dnd-kit sinh id trợ năng bằng bộ đếm toàn cục
      // và server/client ra hai giá trị khác nhau, React báo hydration mismatch.
      id="lv-lead-board"
      sensors={sensors}
      onDragStart={(e: DragStartEvent) =>
        setDragging(
          optimistic.flatMap((c) => c.leads).find((lead) => lead.id === String(e.active.id)) ?? null,
        )
      }
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
    >
      <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3">
        {optimistic.map((column) => (
          <Column
            key={column.key}
            column={column}
            canWrite={canWrite}
            onAdd={() => setEditor({ lead: null, status: column.key })}
            onOpen={(lead) => setEditor({ lead })}
          />
        ))}
      </div>

      <LeadEditor
        slug={slug}
        open={editor !== null}
        lead={editor?.lead ?? null}
        defaultStatus={editor?.status}
        canWrite={canWrite}
        onClose={() => setEditor(null)}
      />

      <DragOverlay dropAnimation={null}>
        {dragging ? (
          <div className="border-brand bg-paper-2 rounded-xl border px-2.5 py-2 text-xs font-bold shadow-[var(--shadow-lg)]">
            {dragging.fullName}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  column,
  canWrite,
  onAdd,
  onOpen,
}: {
  column: BoardColumn;
  canWrite: boolean;
  onAdd: () => void;
  onOpen: (lead: BoardLead) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });
  const value = sumValue(column.leads);

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[15.5rem] shrink-0 snap-start flex-col rounded-2xl border p-2.5 transition-colors",
        isOver ? "border-brand bg-brand-tint/40" : "border-line bg-paper-2",
      )}
    >
      <header className="mb-2 px-0.5">
        <div className="flex items-center gap-1.5">
          <p className={cn("text-xs font-bold", COLUMN_TONE[column.key] ?? "text-ink-2")}>
            {column.name}
          </p>
          <span className="text-ink-3 ml-auto text-xs font-bold tabular-nums">
            {column.leads.length}
          </span>
          {canWrite ? (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Thêm lead vào ${column.name}`}
              className="text-ink-3 hover:bg-paper-3 hover:text-ink rounded p-0.5"
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
        <p className="text-ink-3 mt-0.5 text-[0.65rem] tabular-nums">
          {value > 0 ? eur.format(value / 100) : "—"}
        </p>
      </header>

      <div className="min-h-[4rem] space-y-1.5">
        {column.leads.length === 0 ? (
          <p className="text-ink-3 py-4 text-center text-[0.65rem]">Trống</p>
        ) : (
          column.leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onOpen={() => onOpen(lead)} />
          ))
        )}
      </div>
    </section>
  );
}

function LeadCard({ lead, onOpen }: { lead: BoardLead; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: lead.id });

  const followUp = lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt) : null;
  // Lead vừa được kéo sang cột kết thúc thì thôi báo quá hạn ngay, không đợi
  // máy chủ trả lời — không còn ai phải gọi nữa.
  const closed = lead.status === "WON" || lead.status === "LOST";
  const overdue = lead.overdue && !closed;

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      className={cn(
        "cursor-grab rounded-xl border p-2.5 text-left transition-opacity active:cursor-grabbing",
        overdue ? "border-magenta/40 bg-magenta-tint/20" : "border-line bg-paper",
        isDragging && "opacity-30",
      )}
    >
      <div className="flex items-start gap-1">
        <GripVertical className="text-ink-3 mt-0.5 size-3 shrink-0 opacity-40" aria-hidden />
        <p className="text-ink min-w-0 flex-1 text-xs leading-snug font-bold">{lead.fullName}</p>
        {!lead.consent ? (
          <ShieldOff
            className="text-ink-3 mt-0.5 size-3 shrink-0"
            aria-label="Chưa đồng ý nhận tiếp thị"
          />
        ) : null}
      </div>

      {lead.need ? (
        <p className="text-ink-2 mt-1 line-clamp-2 text-[0.68rem] leading-snug">{lead.need}</p>
      ) : null}

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {lead.expectedValueCents ? (
          <span className="text-ink text-[0.68rem] font-bold tabular-nums">
            {eur.format(lead.expectedValueCents / 100)}
          </span>
        ) : null}
        {followUp ? (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[0.62rem] tabular-nums",
              overdue ? "text-magenta-ink font-bold" : "text-ink-3",
            )}
          >
            <AlarmClock className="size-2.5" aria-hidden />
            {followUp.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              timeZone: "UTC",
            })}
          </span>
        ) : null}
        {lead.source ? (
          <span className="bg-paper-3 text-ink-3 rounded px-1 py-px text-[0.6rem]">
            {lead.source}
          </span>
        ) : null}
      </div>
    </article>
  );
}

/** Nút mở bảng tạo lead mới, dùng ở đầu trang. */
export function NewLeadButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" className="rounded-full" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" aria-hidden />
        Lead mới
      </Button>
      <LeadEditor
        slug={slug}
        open={open}
        lead={null}
        defaultStatus="NEW"
        canWrite
        onClose={() => setOpen(false)}
      />
    </>
  );
}
