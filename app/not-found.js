import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <h1 className="font-display text-2xl text-ink mb-2">Page not found</h1>
      <p className="text-ink-soft mb-6">The page you&apos;re looking for doesn&apos;t exist or has been removed.</p>
      <Link href="/" className="btn-primary inline-block px-5 py-2.5 rounded-sm text-sm font-medium">
        Back to shop
      </Link>
    </div>
  );
}
