"use client";

import { useState } from "react";
import { useBasket } from "@/components/BasketContext";

export default function ProductBasketForm({ product }) {
  const { addItem } = useBasket();
  const [size, setSize] = useState(product.sizes?.[0] || "");
  const [color, setColor] = useState(product.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock <= 0;

  function handleAdd() {
    const n = parseInt(quantity, 10);
    const safeQuantity = Math.min(Math.max(1, isNaN(n) ? 1 : n), Math.max(product.stock, 1));
    addItem(product, { size: size || null, color: color || null, quantity: safeQuantity });
    setQuantity(safeQuantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-5">
      {soldOut && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
          This product is currently sold out.
        </p>
      )}

      {product.sizes?.length > 0 && (
        <Field label="Size">
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <ChipOption key={s} active={size === s} onClick={() => setSize(s)}>
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
              <ChipOption key={c} active={color === c} onClick={() => setColor(c)}>
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
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onBlur={() => {
            const n = parseInt(quantity, 10);
            const clamped = Math.min(Math.max(1, isNaN(n) ? 1 : n), Math.max(product.stock, 1));
            setQuantity(clamped);
          }}
          className="input w-24"
          disabled={soldOut}
        />
      </Field>

      <button
        type="button"
        onClick={handleAdd}
        disabled={soldOut}
        className="btn-primary w-full py-3 rounded-sm font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {added ? "Added to basket ✓" : "Add to basket"}
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
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm text-ink-soft mb-1.5">{label}</span>
      {children}
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
