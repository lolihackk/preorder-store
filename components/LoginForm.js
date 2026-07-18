"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-beige-dark rounded-sm p-6 shadow-card">
      <label className="block">
        <span className="block text-sm text-ink-soft mb-1.5">Username</span>
        <input
          className="input"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          autoFocus
        />
      </label>
      <label className="block">
        <span className="block text-sm text-ink-soft mb-1.5">Password</span>
        <input
          type="password"
          className="input"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 rounded-sm font-medium">
        {loading ? "Signing in…" : "Sign in"}
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
      `}</style>
    </form>
  );
}
