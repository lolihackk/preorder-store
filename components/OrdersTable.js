"use client";

import { useCallback, useEffect, useState } from "react";

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
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

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
        showToast(`Order status updated to "${status}".`, "success");
      } else {
        showToast("Could not update order status.", "error");
      }
    } catch {
      showToast("Network error while updating status.", "error");
    } finally {
      setUpdating(null);
    }
  }

  async function removeOrder(id) {
    if (!confirm("Delete this order permanently? This cannot be undone.")) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        showToast("Order deleted.", "success");
      } else {
        showToast("Could not delete order.", "error");
      }
    } catch {
      showToast("Network error while deleting order.", "error");
    } finally {
      setUpdating(null);
    }
  }

  const statusFiltered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? statusFiltered.filter((o) => {
        const haystack = [
          o.full_name, o.phone1, o.phone2, o.product_name,
          o.wilaya, o.commune, String(o.id),
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(q);
      })
    : statusFiltered;

  const totalRevenue = orders
  .filter((o) => o.status !== "cancelled")
  .reduce((sum, o) => sum + o.subtotal, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  function exportCsv() {
    const headers = [
      "id", "date", "customer", "phone1", "phone2", "product", "size", "color",
      "quantity", "wilaya", "commune", "delivery_type", "shipping_cost",
      "subtotal", "total_price", "status",
    ];
    const rows = filtered.map((o) => [
      o.id, o.created_at, o.full_name, o.phone1, o.phone2 || "", o.product_name,
      o.size || "", o.color || "", o.quantity, o.wilaya, o.commune, o.delivery_type,
      o.shipping_cost, o.subtotal, o.total_price, o.status,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <ToastStack toasts={toasts} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total orders" value={orders.length} />
        <StatCard label="Pending" value={pendingCount} />
        <StatCard label="Revenue" value={`${totalRevenue.toLocaleString()} DA`} />
        <StatCard label="Showing" value={filtered.length} />
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, product, wilaya…"
          className="flex-1 min-w-[200px] bg-white border border-beige-dark rounded-sm px-3 py-2 text-sm"
        />
        <button
          onClick={exportCsv}
          className="text-xs px-3 py-2 border border-beige-dark rounded-sm text-ink-soft hover:border-clay hover:text-ink whitespace-nowrap"
        >
          Export CSV
        </button>
      </div>

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
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink-soft">
                  {query ? "No orders match your search." : "No pre-orders yet."}
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
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeOrder(o.id)}
                    disabled={updating === o.id}
                    className="text-xs text-red-700 hover:text-red-900 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border border-beige-dark rounded-sm px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wide text-ink-soft">{label}</div>
      <div className="text-lg font-medium text-ink mt-0.5">{value}</div>
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

function ToastStack({ toasts }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2.5 rounded-sm text-sm shadow-lg text-white animate-toast-in ${
            t.type === "error" ? "bg-red-700" : "bg-ink"
          }`}
        >
          {t.message}
        </div>
      ))}
      <style jsx global>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-toast-in {
          animation: toast-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}