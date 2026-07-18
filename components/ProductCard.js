import Link from "next/link";
import Image from "next/image";

const STATUS_LABEL = {
  active: "In stock",
  preorder: "Pre-order",
  sold_out: "Sold out",
};

export default function ProductCard({ product }) {
  const cover = product.images?.[0];
  const outOfStock = product.stock <= 0 || product.status === "sold_out";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block bg-white border border-beige-dark rounded-sm overflow-hidden shadow-card hover:shadow-soft active:scale-[0.99] transition-all"
    >
      <div className="relative aspect-[4/5] bg-beige overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.04] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-soft text-xs">
            No image
          </div>
        )}
        {outOfStock && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-ink/85 text-cream text-[10px] sm:text-[11px] uppercase tracking-wide px-2 py-1 rounded-sm">
            Sold out
          </span>
        )}
      </div>
      <div className="p-2.5 sm:p-4">
        <h3 className="font-display text-[13px] sm:text-base text-ink leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between mt-1.5 sm:mt-2 gap-1">
          <span className="text-ink font-medium text-sm sm:text-base">{product.price.toLocaleString()} DA</span>
          <span className="text-[9px] sm:text-[11px] uppercase tracking-wide text-ink-soft whitespace-nowrap">
            {STATUS_LABEL[product.status] || "Available"}
          </span>
        </div>
      </div>
    </Link>
  );
}
