"use client";

import { useBasket } from "@/components/BasketContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BasketIcon() {
  const { count } = useBasket();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <Link href="/basket" className="relative p-2 -m-2" aria-label="View basket">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-clay text-cream text-[10px] leading-none rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
          {count}
        </span>
      )}
    </Link>
  );
}
