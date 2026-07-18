"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "preorder", label: "Pre-order" },
  { value: "sold_out", label: "Sold out" },
  { value: "hidden", label: "Hidden (not shown on store)" },
];

export default function ProductForm({ initialProduct }) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  const [form, setForm] = useState({
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    price: initialProduct?.price ?? "",
    stock: initialProduct?.stock ?? "",
    status: initialProduct?.status || "active",
    images: initialProduct?.images || [],
    sizes: initialProduct?.sizes || [],
    colors: initialProduct?.colors || [],
  });
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function addTag(field, value, setInput) {
    const v = value.trim();
    if (!v) return;
    if (!form[field].includes(v)) update(field, [...form[field], v]);
    setInput("");
  }

  function removeTag(field, value) {
    update(field, form[field].filter((v) => v !== value));
  }

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed.");
        uploaded.push(data.url);
      }
      update("images", [...form.images, ...uploaded]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url) {
    update("images", form.images.filter((i) => i !== url));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Product name is required.");
    if (form.price === "" || Number(form.price) < 0) return setError("Enter a valid price.");

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock) || 0,
        status: form.status,
        images: form.images,
        sizes: form.sizes,
        colors: form.colors,
      };
      const res = await fetch(isEdit ? `/api/products/${initialProduct.id}` : "/api/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save product.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm text-ink-soft mb-1.5">Product name</label>
        <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} />
      </div>

      <div>
        <label className="block text-sm text-ink-soft mb-1.5">Description</label>
        <textarea
          className="input min-h-[120px]"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-ink-soft mb-1.5">Price (DA)</label>
          <input
            type="number"
            min="0"
            step="1"
            className="input"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-ink-soft mb-1.5">Stock</label>
          <input
            type="number"
            min="0"
            step="1"
            className="input"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-ink-soft mb-1.5">Status</label>
        <select className="input" value={form.status} onChange={(e) => update("status", e.target.value)}>
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <TagInput
        label="Sizes (optional)"
        value={sizeInput}
        onChange={setSizeInput}
        tags={form.sizes}
        onAdd={() => addTag("sizes", sizeInput, setSizeInput)}
        onRemove={(v) => removeTag("sizes", v)}
        placeholder="e.g. S, M, L"
      />

      <TagInput
        label="Colors (optional)"
        value={colorInput}
        onChange={setColorInput}
        tags={form.colors}
        onAdd={() => addTag("colors", colorInput, setColorInput)}
        onRemove={(v) => removeTag("colors", v)}
        placeholder="e.g. Beige, Black"
      />

      <div>
        <label className="block text-sm text-ink-soft mb-1.5">Product images</label>
        <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={uploading} />
        {uploading && <p className="text-xs text-ink-soft mt-1">Uploading…</p>}
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {form.images.map((url) => (
              <div key={url} className="relative w-20 h-20 border border-beige-dark rounded-sm overflow-hidden group">
                <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-0.5 right-0.5 bg-ink/70 text-cream text-[10px] w-5 h-5 rounded-full opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 rounded-sm text-sm font-medium">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
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
      `}</style>
    </form>
  );
}

function TagInput({ label, value, onChange, tags, onAdd, onRemove, placeholder }) {
  return (
    <div>
      <label className="block text-sm text-ink-soft mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          className="input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <button type="button" onClick={onAdd} className="px-3 py-2 text-sm border border-beige-dark rounded-sm text-ink-soft hover:border-clay">
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 bg-beige text-ink text-xs px-2 py-1 rounded-sm">
              {t}
              <button type="button" onClick={() => onRemove(t)} className="text-ink-soft hover:text-ink">✕</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
