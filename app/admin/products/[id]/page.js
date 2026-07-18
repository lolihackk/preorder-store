import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/requireAdmin";
import { getProduct } from "@/lib/products";
import AdminNav from "@/components/AdminNav";
import ProductForm from "@/components/ProductForm";

export const dynamic = "force-dynamic";

export default function EditProductPage({ params }) {
  requireAdmin();
  const product = getProduct(params.id);
  if (!product) notFound();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <AdminNav active="products" />
      <h1 className="font-display text-2xl text-ink mb-6">Edit product</h1>
      <ProductForm initialProduct={product} />
    </div>
  );
}
