import { requireAdmin } from "@/lib/requireAdmin";
import { listOrders } from "@/lib/orders";
import AdminNav from "@/components/AdminNav";
import OrdersTable from "@/components/OrdersTable";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  requireAdmin();
  const orders = listOrders();

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
      <AdminNav active="orders" />
      <h1 className="font-display text-2xl text-ink mb-1">Pre-orders</h1>
      <p className="text-ink-soft text-sm mb-6">
        Every pre-order placed on the store, updated automatically.
      </p>
      <OrdersTable initialOrders={orders} />
    </div>
  );
}
