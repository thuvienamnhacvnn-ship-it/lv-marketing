"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, ShieldCheck, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CustomerRow = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  language: string;
  marketingConsent: boolean;
  optedOutAt: Date | string | null;
  lastVisitAt: Date | string | null;
  totalVisits: number;
  totalSpentCents: number;
  tags: { name: string; color: string }[];
  points: number | null;
};

const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function CustomerTable({ rows, search }: { rows: CustomerRow[]; search: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(search);

  function submit(next: string) {
    const query = new URLSearchParams(params.toString());
    query.set("view", "customers");
    if (next.trim()) query.set("q", next.trim());
    else query.delete("q");
    router.replace(`?${query.toString()}`);
  }

  const df = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="relative mb-3 max-w-sm"
      >
        <Search
          className="text-ink-3 pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2"
          aria-hidden
        />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Tìm theo tên, email, số điện thoại…"
          aria-label="Tìm khách hàng"
          className="pl-9"
        />
      </form>

      {rows.length === 0 ? (
        <p className="lv-card text-ink-3 rounded-2xl py-12 text-center text-sm">
          {search ? `Không có khách nào khớp “${search}”.` : "Chưa có khách hàng nào."}
        </p>
      ) : (
        <div className="border-line bg-paper-2 overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-line text-ink-3 border-b text-left text-[0.65rem] font-bold uppercase">
                <th className="px-4 py-2.5">Khách</th>
                <th className="px-4 py-2.5">Liên hệ</th>
                <th className="px-4 py-2.5 text-right">Lượt ghé</th>
                <th className="px-4 py-2.5 text-right">Đã chi</th>
                <th className="px-4 py-2.5 text-right">Điểm</th>
                <th className="px-4 py-2.5">Ghé gần nhất</th>
                <th className="px-4 py-2.5">Tiếp thị</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                // Rút đồng ý (opt-out) đè lên ô đồng ý: khách đã bảo thôi thì
                // dù cờ cũ còn bật cũng không được gửi nữa.
                const reachable = row.marketingConsent && !row.optedOutAt;
                return (
                  <tr key={row.id} className="border-line/60 hover:bg-paper-3/50 border-b last:border-0">
                    <td className="px-4 py-2.5">
                      <p className="text-ink font-semibold">{row.fullName}</p>
                      {row.tags.length > 0 ? (
                        <span className="mt-1 flex flex-wrap gap-1">
                          {row.tags.map((tag) => (
                            <span
                              key={tag.name}
                              className="rounded px-1.5 py-px text-[0.6rem] font-semibold"
                              style={{ backgroundColor: `${tag.color}22`, color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </td>
                    <td className="text-ink-2 px-4 py-2.5 text-xs">
                      {row.email ? <p>{row.email}</p> : null}
                      {row.phone ? <p className="text-ink-3">{row.phone}</p> : null}
                      {!row.email && !row.phone ? <span className="text-ink-3">—</span> : null}
                    </td>
                    <td className="text-ink px-4 py-2.5 text-right tabular-nums">
                      {row.totalVisits}
                    </td>
                    <td className="text-ink px-4 py-2.5 text-right font-semibold tabular-nums">
                      {eur.format(row.totalSpentCents / 100)}
                    </td>
                    <td className="text-ink-2 px-4 py-2.5 text-right tabular-nums">
                      {row.points ?? "—"}
                    </td>
                    <td className="text-ink-2 px-4 py-2.5 text-xs tabular-nums">
                      {row.lastVisitAt ? df.format(new Date(row.lastVisitAt)) : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-bold",
                          reachable ? "bg-mint-tint text-mint-ink" : "bg-paper-3 text-ink-3",
                        )}
                      >
                        {reachable ? (
                          <ShieldCheck className="size-2.5" aria-hidden />
                        ) : (
                          <ShieldOff className="size-2.5" aria-hidden />
                        )}
                        {reachable ? "Được gửi" : row.optedOutAt ? "Đã rút" : "Chưa đồng ý"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
