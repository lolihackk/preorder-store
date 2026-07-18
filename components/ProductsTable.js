"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProductsTable({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [deletingId, setDeletingId] = useState(null);

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

  if (products.length === 0) {
    return (
      <div className="border border-beige-dark rounded-sm bg-beige/40 p-10 text-center text-ink-soft">
        No products yet. Click &quot;Add product&quot; to create your first one.
      </div>
    );
  }

  return (
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
          {products.map((p) => (
            <tr key={p.id} className="border-t border-beige-dark">
              <td className="px-4 py-3">
                <div className="relative w-12 h-14 bg-beige rounded-sm overflow-hidden">
                  {p.images?.[0] && (
                    <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-ink font-medium">{p.name}</td>
              <td className="px-4 py-3 text-ink-soft">{p.price.toLocaleString()} DA</td>
              <td className="px-4 py-3 text-ink-soft">{p.stock}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
