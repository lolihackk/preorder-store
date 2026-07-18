import { listProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const products = listProducts();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      <section className="mb-8 sm:mb-12 relative">
        <div className="absolute -top-8 -left-10 w-40 h-40 rounded-full bg-sand/20 blur-3xl pointer-events-none hidden sm:block" />
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-clay mb-2.5 sm:mb-3 font-medium">
          Pre-order collection
        </p>
        <h1 className="font-display text-[28px] sm:text-4xl text-ink max-w-xl leading-[1.15] sm:leading-tight">
          Reserve it now, receive it soon.
        </h1>
        <p className="text-ink-soft text-sm sm:text-base mt-3 max-w-lg leading-relaxed">
          Every piece below is available for pre-order. Choose an item, fill in your delivery
          details, and we&apos;ll confirm your order by phone.
        </p>
      </section>

      {products.length === 0 ? (
        <div className="border border-beige-dark bg-beige/40 rounded-sm p-10 text-center text-ink-soft">
          No products are available yet. Please check back soon.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

    </div>
  );
}
