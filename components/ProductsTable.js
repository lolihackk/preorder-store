"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LOW_STOCK_THRESHOLD = 5;

export default function ProductsTable({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState("");

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Could not delete product.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD && p.status !== "hidden");

  if (products.length === 0) {
    return (
      <div className="border border-beige-dark rounded-sm bg-beige/40 p-10 text-center text-ink-soft">
        No products yet. Click &quot;Add product&quot; to create your first one.
      </div>
    );
  }

  return (
    <div>
      {lowStockProducts.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-sm px-3 py-2.5 text-sm">
          <span className="font-medium">Low stock:</span>{" "}
          {lowStockProducts.map((p) => `${p.name} (${p.stock} left)`).join(", ")}
        </div>
      )}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products by name…"
        className="w-full bg-white border border-beige-dark rounded-sm px-3 py-2 text-sm mb-4"
      />
      <div className="overflow-x-auto border border-beige-dark rounded-sm bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-beige/60 text-left text-ink-soft text-xs uppercase tracking-wide">
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-soft">
                  No products match your search.
                </td>
              </tr>
            )}
            {filtered.map((p) => {
              const isLow = p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD;
              const isOut = p.stock <= 0;
              return (
                <tr key={p.id} className={`border-t border-beige-dark ${isLow ? "bg-amber-50/60" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="relative w-12 h-14 bg-beige rounded-sm overflow-hidden">
                      {p.images?.[0] && (
                        <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{p.price.toLocaleString()} DA</td>
                  <td className="px-4 py-3">
                    <span className={isOut ? "text-red-700 font-medium" : isLow ? "text-amber-700 font-medium" : "text-ink-soft"}>
                      {p.stock}
                    </span>
                    {isLow && <span className="ml-1.5 text-[10px] uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm">Low</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-soft capitalize">{p.status.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link href={`/admin/products/${p.id}`} className="text-clay text-sm underline underline-offset-2 mr-4">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      disabled={deletingId === p.id}
                      className="text-red-700 text-sm underline underline-offset-2"
                    >
                      {deletingId === p.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}