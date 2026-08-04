"use client";

import { useState, useTransition } from "react";
import { Coins, Gift, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  earnPointsAction,
  redeemRewardAction,
  rotateCardSecretAction,
} from "@/features/loyalty/actions";

/**
 * Ba thao tác của nhân viên trên một thẻ thành viên.
 *
 * `router.refresh()` không cần gọi tay: các action đều `revalidatePath` nên số
 * dư và lịch sử tự cập nhật sau khi thành công.
 */
export function MemberActions({
  slug,
  customerId,
  rewards,
}: {
  slug: string;
  customerId: string;
  rewards: { id: string; name: string; pointsCost: number }[];
}) {
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState("");
  const [pending, start] = useTransition();

  function earn() {
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      toast.error("Nhập số tiền hoá đơn.");
      return;
    }
    start(async () => {
      const res = await earnPointsAction(slug, {
        customerId,
        amountEuro: value,
        receiptRef: receipt || undefined,
      });
      if (res.ok) {
        toast.success(res.message);
        setAmount("");
        setReceipt("");
      } else {
        toast.error(res.message);
      }
    });
  }

  function redeem(rewardId: string) {
    start(async () => {
      const res = await redeemRewardAction(slug, { customerId, rewardId });
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  function rotate() {
    start(async () => {
      const res = await rotateCardSecretAction(slug, customerId);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    });
  }

  return (
    <div className="space-y-4">
      {/* ── Cộng điểm ────────────────────────────────────── */}
      <section className="lv-card rounded-2xl p-5">
        <h2 className="text-ink flex items-center gap-2 text-sm font-bold">
          <Coins className="text-amber size-4" aria-hidden />
          Tích điểm từ hoá đơn
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-ink-2 mb-1.5 block text-xs font-semibold">
              Số tiền hoá đơn (€)
            </Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="42,50"
            />
          </div>
          <div>
            <Label className="text-ink-2 mb-1.5 block text-xs font-semibold">
              Mã hoá đơn (không bắt buộc)
            </Label>
            <Input
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder="R-2026-0841"
            />
          </div>
        </div>
        <p className="text-ink-3 mt-2 text-xs">
          Điểm tính theo hệ số nhân của hạng. Mỗi mã hoá đơn chỉ tích được một lần.
        </p>
        <Button size="sm" className="mt-3 rounded-full" onClick={earn} disabled={pending}>
          {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
          Cộng điểm
        </Button>
      </section>

      {/* ── Đổi quà ──────────────────────────────────────── */}
      {rewards.length > 0 ? (
        <section className="lv-card rounded-2xl p-5">
          <h2 className="text-ink flex items-center gap-2 text-sm font-bold">
            <Gift className="text-magenta size-4" aria-hidden />
            Đổi quà cho khách
          </h2>
          <ul className="mt-3 space-y-1.5">
            {rewards.map((reward) => (
              <li
                key={reward.id}
                className="border-line flex items-center justify-between gap-3 border-b py-2 last:border-0"
              >
                <span className="min-w-0">
                  <span className="text-ink block truncate text-sm font-medium">{reward.name}</span>
                  <span className="text-ink-3 text-xs tabular-nums">{reward.pointsCost} điểm</span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 rounded-full"
                  disabled={pending}
                  onClick={() => redeem(reward.id)}
                >
                  Đổi
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Cấp lại mã QR ────────────────────────────────── */}
      <section className="lv-card rounded-2xl p-5">
        <h2 className="text-ink text-sm font-bold">Thẻ bị lộ hoặc mất máy?</h2>
        <p className="text-ink-2 mt-1.5 text-sm leading-relaxed">
          Cấp mã QR mới sẽ làm <span className="font-semibold">mọi thẻ đã gửi trước đó hỏng ngay</span>,
          kể cả ảnh chụp màn hình. Khách phải nhận lại đường dẫn mới.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3 rounded-full"
          onClick={rotate}
          disabled={pending}
        >
          <RefreshCw className="size-3.5" aria-hidden />
          Cấp mã QR mới
        </Button>
      </section>
    </div>
  );
}
