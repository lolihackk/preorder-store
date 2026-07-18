import HiddenAdminTrigger from "@/components/HiddenAdminTrigger";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: process.env.NEXT_PUBLIC_SHOP_NAME || "Pre-Order Store",
  description: "Reserve your favorites before they arrive.",
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "DANADINE";

  return (
    <html lang="en">
      <body className="bg-cream text-ink font-body antialiased min-h-screen flex flex-col">
        <header className="border-b border-beige-dark bg-cream/95 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 max-w-[70%]">
              <img src="/logo.png" alt={shopName} className="h-8 sm:h-10 w-auto object-contain" />
              <span className="font-display text-lg sm:text-xl tracking-wide text-ink truncate">
                {shopName}
              </span>
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-beige-dark mt-12 sm:mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 text-[11px] sm:text-xs text-ink-soft flex flex-col sm:flex-row justify-between gap-1.5 sm:gap-2">
            <span>
              &copy; <HiddenAdminTrigger>{new Date().getFullYear()}</HiddenAdminTrigger> {shopName}. All pre-orders are confirmed by phone.
            </span>
            <span>Delivery across Algeria &mdash; Home Delivery &amp; Stop Desk</span>
          </div>
        </footer>
      </body>
    </html>
  );
}