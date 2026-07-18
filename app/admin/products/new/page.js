import { requireAdmin } from "@/lib/requireAdmin";
import AdminNav from "@/components/AdminNav";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  requireAdmin();
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <AdminNav active="products" />
      <h1 className="font-display text-2xl text-ink mb-6">Add product</h1>
      <ProductForm />
    </div>
  );
}
