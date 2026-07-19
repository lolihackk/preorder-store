import AdminNav from "@/components/AdminNav";
import OrdersTable from "@/components/OrdersTable";
import SalesChart from "@/components/SalesChart";
import { listOrders } from "@/lib/orders";
import { requireAdmin } from "@/lib/requireAdmin";

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
      <SalesChart orders={orders} />
      <OrdersTable initialOrders={orders} />
    </div>
  );
}