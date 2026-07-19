"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STATUS_OPTIONS = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const STATUS_STYLES = {
  pending: "bg-beige text-ink-soft",
  confirmed: "bg-clay/20 text-clay",
  shipped: "bg-sand/40 text-ink",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-700",
};

// Plays a short two-tone beep using the Web Audio API — no audio file needed.
function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [880, 1180].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.25, now + i * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.14 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.2);
    });
  } catch {
    // Web Audio not available — fail silently, the toast still shows.
  }
}

export default function OrdersTable({ initialOrders }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState("confirmed");
  const [bulkApplying, setBulkApplying] = useState(false);
  const [newCount, setNewCount] = useState(0);

  const knownIdsRef = useRef(new Set(initialOrders.map((o) => o.id)));
  const baseTitleRef = useRef(typeof document !== "undefined" ? document.title : "");

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Poll for new orders. Detect any order ID we haven't seen before, notify.
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) return;
        const data = await res.json();

        const freshOnes = data.orders.filter((o) => !knownIdsRef.current.has(o.id));
        if (freshOnes.length > 0) {
          freshOnes.forEach((o) => knownIdsRef.current.add(o.id));
          setNewCount((c) => c + freshOnes.length);
          playNotificationSound();
          showToast(
            freshOnes.length === 1
              ? `New pre-order from ${freshOnes[0].full_name}!`
              : `${freshOnes.length} new pre-orders just came in!`,
            "success"
          );
        }
        setOrders(data.orders);
      } catch {
        // ignore transient network errors during polling
      }
    }, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect unseen new-order count in the browser tab title.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.title = newCount > 0 ? `(${newCount}) ${baseTitleRef.current}` : baseTitleRef.current;
  }, [newCount]);

  // Clear the "new" badge once the admin comes back to look at the tab.
  useEffect(() => {
    function handleFocus() {
      setNewCount(0);
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
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
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
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

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelected((prev) => {
      const allVisibleSelected = filtered.length > 0 && filtered.every((o) => prev.has(o.id));
      if (allVisibleSelected) {
        const next = new Set(prev);
        filtered.forEach((o) => next.delete(o.id));
        return next;
      }
      const next = new Set(prev);
      filtered.forEach((o) => next.add(o.id));
      return next;
    });
  }

  async function applyBulkStatus() {
    if (selected.size === 0) return;
    setBulkApplying(true);
    const ids = Array.from(selected);
    try {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: bulkStatus }),
          }).then((res) => ({ id, ok: res.ok }))
        )
      );
      const succeeded = new Set(results.filter((r) => r.ok).map((r) => r.id));
      setOrders((prev) => prev.map((o) => (succeeded.has(o.id) ? { ...o, status: bulkStatus } : o)));
      setSelected(new Set());
      showToast(`${succeeded.size} order(s) updated to "${bulkStatus}".`, "success");
    } catch {
      showToast("Network error during bulk update.", "error");
    } finally {
      setBulkApplying(false);
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

  const allVisibleSelected = filtered.length > 0 && filtered.every((o) => selected.has(o.id));

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

      {selected.size > 0 && (
        <div className="flex items-center gap-2 mb-3 flex-wrap bg-clay/10 border border-clay/30 rounded-sm px-3 py-2">
          <span className="text-sm text-ink font-medium">{selected.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="text-sm border border-beige-dark rounded-sm px-2 py-1 bg-white"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>Mark as {s}</option>
            ))}
          </select>
          <button
            onClick={applyBulkStatus}
            disabled={bulkApplying}
            className="btn-primary text-sm px-3 py-1.5 rounded-sm disabled:opacity-60"
          >
            {bulkApplying ? "Applying…" : "Apply"}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-ink-soft underline underline-offset-2"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto border border-beige-dark rounded-sm bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-beige/60 text-left text-ink-soft text-xs uppercase tracking-wide">
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  aria-label="Select all visible orders"
                />
              </th>
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
                <td colSpan={9} className="px-4 py-8 text-center text-ink-soft">
                  {query ? "No orders match your search." : "No pre-orders yet."}
                </td>
              </tr>
            )}
            {filtered.map((o) => (
              <tr key={o.id} className={`border-t border-beige-dark align-top ${selected.has(o.id) ? "bg-clay/5" : ""}`}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(o.id)}
                    onChange={() => toggleSelect(o.id)}
                    aria-label={`Select order #${o.id}`}
                  />
                </td>
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