"use client";

import { useBasket } from "@/components/BasketContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function BasketPage() {
  const { items, updateQuantity, removeItem, subtotal, clearBasket, lineKey, loaded } = useBasket();

  const [form, setForm] = useState({
    fullName: "", phone1: "", phone2: "", wilaya: "", commune: "", deliveryType: "home",
  });
  const [meta, setMeta] = useState({ wilayas: [], setifCommunes: [] });
  const [shipping, setShipping] = useState({ available: null, cost: null, error: null });
  const [shippingLoading, setShippingLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);
  const [communeMode, setCommuneMode] = useState("list");

  useEffect(() => {
    fetch("/api/shipping").then((r) => r.json()).then(setMeta).catch(() => {});
  }, []);

  const selectedWilaya = meta.wilayas.find((w) => w.name === form.wilaya);
  const isSetif = !!selectedWilaya?.isLocal;
  const knownCommunes = selectedWilaya?.communes || [];
  const hasCommuneList = knownCommunes.length > 0;

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
        next.commune = "";
        setCommuneMode("list");
      }
      return next;
    });
  }

  const total = shipping.cost != null ? subtotal + shipping.cost : null;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const canSubmit = useMemo(() => {
    return (
      items.length > 0 &&
      form.fullName.trim() &&
      /^0[5-7][0-9]{8}$/.test(form.phone1.trim()) &&
      form.wilaya &&
      form.commune.trim() &&
      form.deliveryType &&
      shipping.available === true
    );
  }, [form, shipping, items]);

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
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
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
      clearBasket();
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        <div className="border border-beige-dark bg-white rounded-sm p-6 sm:p-8 shadow-sm">
          <div className="w-11 h-11 rounded-full bg-clay/15 text-clay flex items-center justify-center mb-4 text-lg">✓</div>
          <p className="text-[11px] uppercase tracking-[0.15em] text-clay mb-1.5">Pre-order confirmed</p>
          <h3 className="font-display text-2xl text-ink mb-2">Thank you, {result.full_name.split(" ")[0]}.</h3>
          <p className="text-ink-soft text-sm leading-relaxed">
            Your order has been recorded. We will call you at <strong className="text-ink">{result.phone1}</strong> shortly to confirm.
          </p>

          <div className="mt-6 divide-y divide-beige-dark border-t border-b border-beige-dark">
            {result.items.map((it) => (
              <div key={it.id} className="flex justify-between py-2.5 text-sm">
                <span className="text-ink">
                  {it.product_name}
                  <span className="text-ink-soft"> · {[it.size, it.color].filter(Boolean).join(" / ") || "—"} · x{it.quantity}</span>
                </span>
                <span className="text-ink-soft whitespace-nowrap ml-4">{it.line_total.toLocaleString()} DA</span>
              </div>
            ))}
          </div>

          <dl className="mt-4 text-sm space-y-1.5 text-ink-soft">
            <div className="flex justify-between"><dt>Order reference</dt><dd className="text-ink">#{result.id}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd className="text-ink">{result.shipping_cost.toLocaleString()} DA</dd></div>
            <div className="flex justify-between font-medium text-ink text-base border-t border-beige-dark pt-2 mt-2">
              <dt>Total</dt><dd>{result.total_price.toLocaleString()} DA</dd>
            </div>
          </dl>

          <Link
            href="/"
            className="btn-primary w-full mt-6 py-3 rounded-sm font-medium tracking-wide inline-block text-center transition-transform hover:-translate-y-0.5"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  if (loaded && items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-8 py-20 sm:py-28 text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-clay/10 animate-basket-pulse" />
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="relative">
            <circle cx="48" cy="48" r="47" stroke="#DFD3B8" strokeWidth="1" fill="#F8F5EF" />
            <g transform="translate(24, 28)" stroke="#B08B57" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h40l-3.5 30a3 3 0 0 1-3 2.7H10.5a3 3 0 0 1-3-2.7L4 12Z" />
              <path d="M13 12V9a11 11 0 0 1 22 0v3" />
              <circle cx="18" cy="24" r="1.4" fill="#B08B57" stroke="none" />
              <circle cx="30" cy="24" r="1.4" fill="#B08B57" stroke="none" />
            </g>
          </svg>
        </div>
        <h2 className="font-display text-xl text-ink mb-2">Your basket is empty</h2>
        <p className="text-ink-soft text-sm mb-7 leading-relaxed">
          Nothing here yet — browse the collection and add a piece<br className="hidden sm:block" /> you'd like to pre-order.
        </p>
        <Link
          href="/"
          className="btn-primary inline-block px-6 py-3 rounded-sm font-medium tracking-wide transition-transform hover:-translate-y-0.5"
        >
          Browse the collection
        </Link>

        <style jsx global>{`
          @keyframes basket-pulse {
            0%, 100% { transform: scale(0.92); opacity: 0.5; }
            50% { transform: scale(1.05); opacity: 0.9; }
          }
          .animate-basket-pulse {
            animation: basket-pulse 2.6s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <p className="text-[11px] uppercase tracking-[0.15em] text-clay mb-1.5">Your order</p>
      <h1 className="font-display text-2xl sm:text-3xl text-ink mb-8">
        Basket <span className="text-ink-soft font-body text-base align-middle">· {itemCount} item{itemCount === 1 ? "" : "s"}</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
        {/* Items */}
        <div className="lg:col-span-3 space-y-3">
          {items.map((item) => {
            const key = lineKey(item);
            return (
              <div
                key={key}
                className="group flex gap-4 border border-beige-dark rounded-sm p-3.5 bg-white transition-shadow hover:shadow-[0_2px_16px_rgba(43,38,32,0.06)]"
              >
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-beige rounded-sm overflow-hidden border border-beige-dark/60">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-soft text-[10px]">No image</div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm sm:text-[15px] font-medium text-ink leading-snug truncate">{item.name}</h3>
                      <button
                        type="button"
                        onClick={() => removeItem(key)}
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 text-ink-soft/60 hover:text-red-700 transition-colors leading-none text-lg -mt-0.5"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {[item.size, item.color].filter(Boolean).join("  ·  ") || "—"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-beige-dark rounded-sm overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-ink-soft hover:bg-beige hover:text-ink transition-colors"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm text-ink tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-ink-soft hover:bg-beige hover:text-ink transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-medium text-clay">
                      {(item.price * item.quantity).toLocaleString()} DA
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <Link href="/" className="inline-block text-xs text-ink-soft hover:text-clay underline underline-offset-2 pt-1">
            ← Continue shopping
          </Link>
        </div>

        {/* Checkout */}
        <div className="lg:col-span-2 lg:sticky lg:top-24">
          <div className="border border-beige-dark rounded-sm bg-white overflow-hidden">
            <div className="bg-beige/60 px-5 py-3.5 border-b border-beige-dark">
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft">Order summary</p>
            </div>
            <div className="px-5 py-4 text-sm space-y-1.5">
              <div className="flex justify-between text-ink-soft">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} DA</span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>Shipping</span>
                <span>{shippingLoading ? "Calculating…" : shipping.cost != null ? `${shipping.cost.toLocaleString()} DA` : "—"}</span>
              </div>
              {shipping.error && <p className="text-red-700 text-xs pt-1">{shipping.error}</p>}
              <div className="flex justify-between font-medium text-ink text-base border-t border-beige-dark pt-2.5 mt-2.5">
                <span>Total</span>
                <span>{total != null ? `${total.toLocaleString()} DA` : "—"}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pb-5 pt-1 space-y-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-ink-soft pt-3 border-t border-beige-dark">Delivery details</p>

              <Field label="Full name" error={errors.fullName}>
                <input type="text" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="input" placeholder="e.g. Amine Belkacem" />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Phone number 1" error={errors.phone1}>
                  <input type="tel" value={form.phone1} onChange={(e) => update("phone1", e.target.value)} className="input" placeholder="05/06/07 XX XX XX XX" />
                </Field>
                <Field label="Phone 2 (optional)" error={errors.phone2}>
                  <input type="tel" value={form.phone2} onChange={(e) => update("phone2", e.target.value)} className="input" placeholder="Alternative number" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Wilaya" error={errors.wilaya}>
                  <select value={form.wilaya} onChange={(e) => update("wilaya", e.target.value)} className="input">
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
                        disabled={!form.wilaya}
                      />
                      {hasCommuneList && (
                        <button type="button" onClick={() => { setCommuneMode("list"); update("commune", ""); }} className="text-xs text-clay underline underline-offset-2">
                          Choose from list instead
                        </button>
                      )}
                    </div>
                  )}
                </Field>
              </div>

              <Field label="Delivery type" error={errors.deliveryType}>
                <div className="grid grid-cols-2 gap-2">
                  <DeliveryOption
                    label="Home Delivery"
                    active={form.deliveryType === "home"}
                    available={selectedWilaya ? selectedWilaya.homeAvailable : true}
                    onClick={() => update("deliveryType", "home")}
                  />
                  <DeliveryOption
                    label="Stop Desk"
                    active={form.deliveryType === "stopdesk"}
                    available={selectedWilaya ? selectedWilaya.stopdeskAvailable : true}
                    onClick={() => update("deliveryType", "stopdesk")}
                  />
                </div>
              </Field>

              {(errors.items || submitError) && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                  {errors.items || submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="btn-primary w-full py-3 rounded-sm font-medium tracking-wide transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:opacity-50"
              >
                {submitting ? "Placing order…" : "Confirm pre-order"}
              </button>
            </form>
          </div>
        </div>
      </div>

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
    </div>
  );
}

function Field({ label, children, error }) {
  return (
    <label className="block">
      <span className="block text-xs text-ink-soft mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-700 mt-1">{error}</span>}
    </label>
  );
}

function DeliveryOption({ label, active, available, onClick }) {
  return (
    <button
      type="button"
      onClick={available ? onClick : undefined}
      disabled={!available}
      className={`px-3 py-2 text-xs rounded-sm border text-left transition-colors ${
        !available
          ? "bg-beige/40 text-ink-soft/50 border-beige-dark cursor-not-allowed"
          : active
          ? "bg-clay text-cream border-clay"
          : "bg-white text-ink border-beige-dark hover:border-clay"
      }`}
    >
      {label}
      {!available && <span className="block text-[10px]">Not available here</span>}
    </button>
  );
}
