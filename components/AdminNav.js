import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminNav({ active }) {
  const tabs = [
    { key: "orders", label: "Pre-orders", href: "/admin" },
    { key: "products", label: "Products", href: "/admin/products" },
  ];
  return (
    <div className="flex items-center justify-between border-b border-beige-dark mb-8 pb-4">
      <nav className="flex gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`px-3 py-1.5 text-sm rounded-sm ${
              active === t.key ? "bg-clay text-cream" : "text-ink-soft hover:bg-beige"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <LogoutButton />
    </div>
  );
}
