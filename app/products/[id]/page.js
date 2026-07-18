import PreorderForm from "@/components/PreorderForm";
import { getProduct } from "@/lib/products";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ProductPage({ params }) {
  const product = getProduct(params.id);
  if (!product) notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <div>
          <div className="relative aspect-[4/5] bg-beige rounded-sm overflow-hidden border border-beige-dark">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-soft text-sm">
                No image
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {product.images.slice(1, 5).map((src, i) => (
                <div key={i} className="relative aspect-square bg-beige rounded-sm overflow-hidden border border-beige-dark">
                  <Image src={src} alt={`${product.name} ${i + 2}`} fill sizes="120px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-xl sm:text-3xl text-ink leading-snug">{product.name}</h1>
          <p className="text-lg sm:text-xl text-clay mt-1.5 sm:mt-2">{product.price.toLocaleString()} DA</p>
          <p className="text-ink-soft text-sm sm:text-base mt-3 sm:mt-4 leading-relaxed whitespace-pre-line">{product.description}</p>

          <div className="mt-4 text-sm">
            {product.stock > 0 ? (
              <span className="text-ink-soft">{product.stock} unit{product.stock === 1 ? "" : "s"} available</span>
            ) : (
              <span className="text-red-700">Currently sold out</span>
            )}
          </div>

          <hr className="border-beige-dark my-6" />

          <PreorderForm product={product} />
        </div>
      </div>
    </div>
  );
}