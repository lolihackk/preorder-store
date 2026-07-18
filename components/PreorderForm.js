"use client";

import { useEffect, useMemo, useState } from "react";

const emptyForm = {
  size: "",
  color: "",
  quantity: 1,
  fullName: "",
  phone1: "",
  phone2: "",
  wilaya: "",
  commune: "",
  deliveryType: "home",
};

export default function PreorderForm({ product }) {
  const [form, setForm] = useState({
    ...emptyForm,
    size: product.sizes?.[0] || "",
    color: product.colors?.[0] || "",
  });
  const [meta, setMeta] = useState({ wilayas: [], setifCommunes: [] });
  const [shipping, setShipping] = useState({ available: null, cost: null, error: null });
  const [shippingLoading, setShippingLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // successful order object
  const [submitError, setSubmitError] = useState("");

  const soldOut = product.stock <= 0;

  useEffect(() => {
    fetch("/api/shipping")
      .then((r) => r.json())
      .then(setMeta)
      .catch(() => {});
  }, []);

  const selectedWilaya = meta.wilayas.find((w) => w.name === form.wilaya);
  const isSetif = !!selectedWilaya?.isLocal;
  const knownCommunes = selectedWilaya?.communes || [];
  const hasCommuneList = knownCommunes.length > 0;
  const [communeMode, setCommuneMode] = useState("list"); // "list" | "other"

  // Fetch live shipping cost whenever wilaya / delivery type / commune changes.
  useEffect(() => {
    if (!form.wilaya || !form.deliveryType) {
      setShipping({ available: null, cost: null, error: null });
      return;
    }
    if (isSetif && !form.commune) {
      setShipping({ available: null, cost: null, error: null });
      return;
    }
    setShippingLoading(true);
    const controller = new AbortController();
    fetch("/api/shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wilaya: form.wilaya, deliveryType: form.deliveryType, commune: form.commune }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then(setShipping)
      .catch(() => {})
      .finally(() => setShippingLoading(false));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.wilaya, form.deliveryType, form.commune, isSetif]);

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "wilaya") {
        next.commune = ""; // reset commune when wilaya changes
        setCommuneMode("list");
      }
      return next;
    });
  }

  const qty = Math.max(1, parseInt(form.quantity, 10) || 1);
  const subtotal = product.price * qty;
  const total = shipping.cost != null ? subtotal + shipping.cost : null;

  const canSubmit = useMemo(() => {
    return (
      !soldOut &&
      form.fullName.trim() &&
      /^0[5-7][0-9]{8}$/.test(form.phone1.trim()) &&
      form.wilaya &&
      form.commune.trim() &&
      form.deliveryType &&
      shipping.available === true
    );
  }, [form, shipping, soldOut]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError("");
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size: form.size || null,
          color: form.color || null,
          quantity: qty,
          fullName: form.fullName,
          phone1: form.phone1,
          phone2: form.phone2,
          wilaya: form.wilaya,
          commune: form.commune,
          deliveryType: form.deliveryType,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.fields || {});
        setSubmitError(data.error || "Something went wrong. Please check the form.");
        return;
      }
      setResult(data.order);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="border border-beige-dark bg-beige/50 rounded-sm p-5 sm:p-6">
        <div className="w-10 h-10 rounded-full bg-clay/15 text-clay flex items-center justify-center mb-3">
          ✓
        </div>
        <h3 className="font-display text-lg text-ink mb-2">Pre-order received</h3>
        <p className="text-ink-soft text-sm">
          Thank you, {result.full_name}. Your order for <strong>{result.product_name}</strong> has
          been recorded. We will call you at <strong>{result.phone1}</strong> shortly to confirm.
        </p>
        <dl className="mt-4 text-sm space-y-1 text-ink-soft">
          <div className="flex justify-between"><dt>Order reference</dt><dd className="text-ink">#{result.id}</dd></div>
          <div className="flex justify-between"><dt>Product</dt><dd className="text-ink">{result.subtotal.toLocaleString()} DA</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd className="text-ink">{result.shipping_cost.toLocaleString()} DA</dd></div>
          <div className="flex justify-between font-medium text-ink border-t border-beige-dark pt-1 mt-1"><dt>Total</dt><dd>{result.total_price.toLocaleString()} DA</dd></div>
        </dl>
        <button
          type="button"
          onClick={() => downloadReceipt(result, product)}
          className="btn-primary w-full mt-5 py-3 rounded-sm font-medium tracking-wide"
        >
          Download receipt
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {soldOut && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          This product is currently sold out and cannot be pre-ordered.
        </p>
      )}

      {product.sizes?.length > 0 && (
        <Field label="Size">
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <ChipOption key={s} active={form.size === s} onClick={() => update("size", s)}>
                {s}
              </ChipOption>
            ))}
          </div>
        </Field>
      )}

      {product.colors?.length > 0 && (
        <Field label="Color">
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <ChipOption key={c} active={form.color === c} onClick={() => update("color", c)}>
                {c}
              </ChipOption>
            ))}
          </div>
        </Field>
      )}

      <Field label="Quantity">
        <input
          type="number"
          min={1}
          max={Math.max(product.stock, 1)}
          value={form.quantity}
          onChange={(e) => update("quantity", e.target.value)}
          className="input w-24"
          disabled={soldOut}
        />
      </Field>

      <hr className="border-beige-dark" />
      <p className="text-xs uppercase tracking-wide text-ink-soft">Delivery details</p>

      <Field label="Full name" error={errors.fullName}>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          className="input"
          placeholder="e.g. Amine Belkacem"
          disabled={soldOut}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Phone number 1" error={errors.phone1}>
          <input
            type="tel"
            value={form.phone1}
            onChange={(e) => update("phone1", e.target.value)}
            className="input"
            placeholder="05/06/07 XX XX XX XX"
            disabled={soldOut}
          />
        </Field>
        <Field label="Phone number 2 (optional)" error={errors.phone2}>
          <input
            type="tel"
            value={form.phone2}
            onChange={(e) => update("phone2", e.target.value)}
            className="input"
            placeholder="Alternative number"
            disabled={soldOut}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Wilaya" error={errors.wilaya}>
          <select
            value={form.wilaya}
            onChange={(e) => update("wilaya", e.target.value)}
            className="input"
            disabled={soldOut}
          >
            <option value="">Select wilaya</option>
            {meta.wilayas.map((w) => (
              <option key={w.name} value={w.name}>{w.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Commune" error={errors.commune}>
          {hasCommuneList && communeMode === "list" ? (
            <select
              value={form.commune}
              onChange={(e) => {
                if (e.target.value === "__other__") {
                  setCommuneMode("other");
                  update("commune", "");
                } else {
                  update("commune", e.target.value);
                }
              }}
              className="input"
              disabled={soldOut}
            >
              <option value="">Select commune</option>
              {knownCommunes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="__other__">Other — not in this list</option>
            </select>
          ) : (
            <div className="space-y-1.5">
              <input
                type="text"
                value={form.commune}
                onChange={(e) => update("commune", e.target.value)}
                className="input"
                placeholder="Type your commune"
                disabled={soldOut || !form.wilaya}
              />
              {hasCommuneList && (
                <button
                  type="button"
                  onClick={() => { setCommuneMode("list"); update("commune", ""); }}
                  className="text-xs text-clay underline underline-offset-2"
                >
                  Choose from list instead
                </button>
              )}
            </div>
          )}
        </Field>
      </div>

      <Field label="Delivery type" error={errors.deliveryType}>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <DeliveryOption
            label="Home Delivery"
            active={form.deliveryType === "home"}
            available={selectedWilaya ? selectedWilaya.homeAvailable : true}
            onClick={() => update("deliveryType", "home")}
            disabled={soldOut}
          />
          <DeliveryOption
            label="Stop Desk"
            active={form.deliveryType === "stopdesk"}
            available={selectedWilaya ? selectedWilaya.stopdeskAvailable : true}
            onClick={() => update("deliveryType", "stopdesk")}
            disabled={soldOut}
          />
        </div>
      </Field>

      {/* Order summary */}
      <div className="border border-beige-dark rounded-sm p-4 bg-beige/40 text-sm space-y-1.5">
        <div className="flex justify-between text-ink-soft">
          <span>Product ({qty}x)</span>
          <span>{subtotal.toLocaleString()} DA</span>
        </div>
        <div className="flex justify-between text-ink-soft">
          <span>Shipping</span>
          <span>
            {shippingLoading
              ? "Calculating…"
              : shipping.cost != null
              ? `${shipping.cost.toLocaleString()} DA`
              : "—"}
          </span>
        </div>
        {shipping.error && (
          <p className="text-red-700 text-xs">{shipping.error}</p>
        )}
        <div className="flex justify-between font-medium text-ink border-t border-beige-dark pt-1.5 mt-1.5">
          <span>Total</span>
          <span>{total != null ? `${total.toLocaleString()} DA` : "—"}</span>
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="btn-primary w-full py-3 rounded-sm font-medium tracking-wide transition-colors"
      >
        {submitting ? "Placing order…" : "Confirm pre-order"}
      </button>

      <style jsx global>{`
        .input {
          width: 100%;
          background: #fff;
          border: 1px solid #DFD3B8;
          border-radius: 4px;
          padding: 0.55rem 0.75rem;
          font-size: 0.9rem;
          color: #2B2620;
        }
        .input:disabled { background: #F3EFE7; color: #999; }
      `}</style>
    </form>
  );
}

function downloadReceipt(order, product) {
  const shopName = (typeof window !== "undefined" && document.title) || "Store";
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Receipt #${order.id}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; background:#F8F5EF; color:#2B2620; margin:0; padding:40px 20px; }
  .receipt { max-width:480px; margin:0 auto; background:#fff; border:1px solid #DFD3B8; border-radius:6px; padding:32px; }
  h1 { font-size:20px; margin:0 0 4px; }
  .muted { color:#6E655A; font-size:13px; margin-bottom:24px; }
  table { width:100%; font-size:14px; border-collapse:collapse; }
  td { padding:6px 0; }
  .label { color:#6E655A; }
  .value { text-align:right; }
  .total-row td { border-top:1px solid #DFD3B8; font-weight:bold; padding-top:12px; }
  .section-title { font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#8A7250; margin:24px 0 8px; }
  .footer { margin-top:28px; font-size:12px; color:#6E655A; text-align:center; }
  @media print { body { background:#fff; padding:0; } .receipt { border:none; } }
</style>
</head>
<body>
  <div class="receipt">
    <h1>${shopName}</h1>
    <div class="muted">Pre-order receipt &middot; ${new Date(order.created_at).toLocaleString()}</div>

    <div class="section-title">Order</div>
    <table>
      <tr><td class="label">Order reference</td><td class="value">#${order.id}</td></tr>
      <tr><td class="label">Product</td><td class="value">${order.product_name}</td></tr>
      <tr><td class="label">Options</td><td class="value">${[order.size, order.color].filter(Boolean).join(" / ") || "—"}</td></tr>
      <tr><td class="label">Quantity</td><td class="value">${order.quantity}</td></tr>
    </table>

    <div class="section-title">Delivery</div>
    <table>
      <tr><td class="label">Name</td><td class="value">${order.full_name}</td></tr>
      <tr><td class="label">Phone</td><td class="value">${order.phone1}${order.phone2 ? " / " + order.phone2 : ""}</td></tr>
      <tr><td class="label">Address</td><td class="value">${order.commune}, ${order.wilaya}</td></tr>
      <tr><td class="label">Delivery type</td><td class="value">${order.delivery_type === "home" ? "Home Delivery" : "Stop Desk"}</td></tr>
    </table>

    <div class="section-title">Payment</div>
    <table>
      <tr><td class="label">Product total</td><td class="value">${order.subtotal.toLocaleString()} DA</td></tr>
      <tr><td class="label">Shipping</td><td class="value">${order.shipping_cost.toLocaleString()} DA</td></tr>
      <tr class="total-row"><td>Total</td><td class="value">${order.total_price.toLocaleString()} DA</td></tr>
    </table>

    <div class="footer">This order will be confirmed by phone before shipping.</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${order.id}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Field({ label, children, error }) {
  return (
    <label className="block">
      <span className="block text-sm text-ink-soft mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-700 mt-1">{error}</span>}
    </label>
  );
}

function ChipOption({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
        active ? "bg-clay text-cream border-clay" : "bg-white text-ink border-beige-dark hover:border-clay"
      }`}
    >
      {children}
    </button>
  );
}

function DeliveryOption({ label, active, available, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={available ? onClick : undefined}
      disabled={disabled || !available}
      className={`flex-1 px-3 py-2.5 text-sm rounded-sm border text-left transition-colors ${
        !available
          ? "bg-beige/40 text-ink-soft/50 border-beige-dark cursor-not-allowed"
          : active
          ? "bg-clay text-cream border-clay"
          : "bg-white text-ink border-beige-dark hover:border-clay"
      }`}
    >
      {label}
      {!available && <span className="block text-[11px]">Not available here</span>}
    </button>
  );
}
