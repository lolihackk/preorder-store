"use client";

import { useMemo, useState } from "react";

const RANGE_OPTIONS = [
  { key: "7", label: "7 days" },
  { key: "14", label: "14 days" },
  { key: "30", label: "30 days" },
];

export default function SalesChart({ orders }) {
  const [range, setRange] = useState("14");
  const days = Number(range);

  const data = useMemo(() => {
    const buckets = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.push({ date: d, revenue: 0, count: 0 });
    }

    const byDate = new Map(buckets.map((b) => [b.date.toDateString(), b]));

    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const d = new Date(o.created_at);
      d.setHours(0, 0, 0, 0);
      const bucket = byDate.get(d.toDateString());
      if (bucket) {
        bucket.revenue += o.subtotal;
        bucket.count += 1;
      }
    });

    return buckets;
  }, [orders, days]);

  const maxRevenue = Math.max(1, ...data.map((b) => b.revenue));
  const totalRevenue = data.reduce((s, b) => s + b.revenue, 0);
  const totalOrders = data.reduce((s, b) => s + b.count, 0);

  const chartHeight = 140;
  const barGap = 4;

  return (
    <div className="border border-beige-dark rounded-sm bg-white p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-display text-base text-ink">Sales overview</h3>
          <p className="text-xs text-ink-soft mt-0.5">
            {totalOrders} order{totalOrders === 1 ? "" : "s"} · {totalRevenue.toLocaleString()} DA product revenue
          </p>
        </div>
        <div className="flex gap-1.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`text-xs px-2.5 py-1 rounded-sm border ${
                range === opt.key
                  ? "bg-clay text-cream border-clay"
                  : "bg-white text-ink-soft border-beige-dark hover:border-clay"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-[3px] sm:gap-1" style={{ height: chartHeight }}>
        {data.map((b, i) => {
          const h = b.revenue > 0 ? Math.max(4, (b.revenue / maxRevenue) * (chartHeight - 24)) : 2;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-1 -translate-y-full bg-ink text-cream text-[10px] px-2 py-1 rounded-sm whitespace-nowrap z-10">
                {b.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}: {b.revenue.toLocaleString()} DA ({b.count})
              </div>
              <div
                className={`w-full rounded-t-sm ${b.revenue > 0 ? "bg-clay" : "bg-beige-dark"}`}
                style={{ height: h }}
              />
              {days <= 14 && (
                <span className="text-[9px] text-ink-soft mt-1.5 whitespace-nowrap">
                  {b.date.toLocaleDateString(undefined, { day: "numeric" })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}