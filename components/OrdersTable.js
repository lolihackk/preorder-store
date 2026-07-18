"use client";

import { useEffect, useState } from "react";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_STYLES = {
  pending: "bg-beige text-ink-soft",
  confirmed: "bg-clay/20 text-clay",
  shipped: "bg-sand/40 text-ink",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersTable({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const data = await res.json();
        setOrders(data.orders);
      } catch {
        // ignore transient network errors during polling
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  async function changeStatus(id, status) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      }
    } finally {
      setUpdating(null);
    }
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All ({orders.length})
        </FilterChip>
        {STATUS_OPTIONS.map((s) => (
          <FilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {s} ({orders.filter((o) => o.status === s).length})
          </FilterChip>
        ))}
      </div>

      <div className="overflow-x-auto border border-beige-dark rounded-sm bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-beige/60 text-left text-ink-soft text-xs uppercase tracking-wide">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink-soft">
                  No pre-orders yet.
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-beige-dark align-top">
                <td className="px-4 py-3 whitespace-nowrap text-ink-soft">
                  {new Date(o.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{o.full_name}</div>
                  <div className="text-ink-soft text-xs">{o.commune}, {o.wilaya}</div>
                </td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  <div>{o.phone1}</div>
                  {o.phone2 && <div>{o.phone2}</div>}
                </td>
                <td className="px-4 py-3">
                  <div className="text-ink">{o.product_name}</div>
                  <div className="text-ink-soft text-xs">
                    {[o.size, o.color].filter(Boolean).join(" / ") || "—"} · Qty {o.quantity}
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                  {o.delivery_type === "home" ? "Home Delivery" : "Stop Desk"}
                  <div className="text-xs">{o.shipping_cost.toLocaleString()} DA</div>
                </td>
                <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">
                  {o.total_price.toLocaleString()} DA
                </td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    disabled={updating === o.id}
                    onChange={(e) => changeStatus(o.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-sm border-0 ${STATUS_STYLES[o.status]}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs rounded-sm border capitalize ${
        active ? "bg-clay text-cream border-clay" : "bg-white text-ink-soft border-beige-dark hover:border-clay"
      }`}
    >
      {children}
    </button>
  );
}
