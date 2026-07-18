import Link from "next/link";
import { requireAdmin } from "@/lib/requireAdmin";
import { listProducts } from "@/lib/products";
import AdminNav from "@/components/AdminNav";
import ProductsTable from "@/components/ProductsTable";

export const dynamic = "force-dynamic";

export default function AdminProductsPage() {
  requireAdmin();
  const products = listProducts({ includeHidden: true });

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <AdminNav active="products" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink mb-1">Products</h1>
          <p className="text-ink-soft text-sm">Add, edit, and manage stock for your catalog.</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary px-4 py-2 rounded-sm text-sm font-medium">
          + Add product
        </Link>
      </div>
      <ProductsTable initialProducts={products} />
    </div>
  );
}
