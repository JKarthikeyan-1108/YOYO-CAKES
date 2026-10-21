import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getAllOrders, type Order } from '@/lib/orders';
import { PRODUCTS, formatPrice } from '@/data/products';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllOrders();
      setOrders(data);
      setLoading(false);
    }
    load();
  }, []);

  // Compute live metrics from actual stored records
  const totalOrders = orders.length;
  const verifiedSalesRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(
    (o) => o.orderStatus === 'placed' || o.orderStatus === 'confirmed' || o.orderStatus === 'preparing'
  ).length;

  const completedOrders = orders.filter((o) => o.orderStatus === 'delivered').length;

  // Low stock products from catalog (stockQuantity <= 15)
  const lowStockProducts = PRODUCTS.filter((p) => p.stockQuantity <= 15);

  // Recent 5 orders
  const recentOrders = [...orders].slice(0, 5);

  // Group verified orders by day for sales trend chart
  const salesByDay: Record<string, number> = {};
  orders.forEach((o) => {
    if (o.paymentStatus === 'paid') {
      const day = new Date(o.createdAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
      salesByDay[day] = (salesByDay[day] || 0) + o.total;
    }
  });

  const chartData = Object.entries(salesByDay).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  // If no orders yet, provide fallback empty state representation
  if (chartData.length === 0) {
    chartData.push(
      { date: 'Mon', revenue: 0 },
      { date: 'Tue', revenue: 0 },
      { date: 'Today', revenue: verifiedSalesRevenue }
    );
  }

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--color-brand-chocolate)]">
          Bakery Operations Dashboard
        </h1>
        <p className="text-sm text-[var(--color-brand-muted)] mt-1">
          Real-time sales, live inventory, and order fulfillment tracking
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider block">
              Verified Revenue
            </span>
            <span className="text-2xl font-bold text-[var(--color-brand-chocolate)] mt-1 block">
              {formatPrice(verifiedSalesRevenue)}
            </span>
            <span className="text-[11px] text-[var(--color-brand-success)] font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={12} /> Live Razorpay records
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[var(--color-brand-primary-dark)] flex items-center justify-center">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-2xl font-bold text-[var(--color-brand-chocolate)] mt-1 block">
              {totalOrders}
            </span>
            <span className="text-[11px] text-[var(--color-brand-muted)] font-medium mt-1 block">
              All channels (Delivery & Pickup)
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[var(--color-brand-info)] flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider block">
              In Progress
            </span>
            <span className="text-2xl font-bold text-[var(--color-brand-chocolate)] mt-1 block">
              {pendingOrders}
            </span>
            <span className="text-[11px] text-[var(--color-brand-warning)] font-medium mt-1 block">
              Kitchen preparing / baking
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-yellow-50 text-[var(--color-brand-warning)] flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200/70 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider block">
              Completed Orders
            </span>
            <span className="text-2xl font-bold text-[var(--color-brand-chocolate)] mt-1 block">
              {completedOrders}
            </span>
            <span className="text-[11px] text-[var(--color-brand-success)] font-medium mt-1 block">
              Delivered or collected
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-[var(--color-brand-success)] flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
              Sales Revenue Trends (INR)
            </h2>
            <p className="text-xs text-[var(--color-brand-muted)]">
              Daily verified revenue generated from completed transactions
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--color-brand-primary-dark)] bg-[var(--color-brand-cream)] px-3 py-1 rounded-full">
            Recharts Analytics
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A184" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#C9A184" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#9B8578" fontSize={12} tickLine={false} />
              <YAxis stroke="#9B8578" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val: any) => [`₹${val}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: '#3D2417',
                  color: '#fff',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#7F5643"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[var(--color-brand-primary-dark)] hover:underline flex items-center gap-1"
            >
              View All Orders <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-[var(--color-brand-muted)] text-center py-8">
              No orders registered yet. New customer orders will show up here immediately.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[var(--color-brand-muted)] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 font-mono font-bold text-[var(--color-brand-chocolate)]">
                        {o.id}
                      </td>
                      <td className="py-3">
                        <span className="font-semibold block">{o.customer.name}</span>
                        <span className="text-[10px] text-[var(--color-brand-muted)]">{o.fulfillment}</span>
                      </td>
                      <td className="py-3 font-bold text-[var(--color-brand-primary-dark)]">
                        {formatPrice(o.total)}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-brand-cream)] text-[var(--color-brand-primary-dark)]">
                          {o.orderStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          to={`/order/${o.id}`}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[var(--color-brand-primary-dark)] inline-flex"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts (1 Col) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
              <AlertTriangle size={18} className="text-[var(--color-brand-warning)]" />
              Low Stock Alerts
            </h2>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-[var(--color-brand-primary-dark)] hover:underline"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.slice(0, 6).map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-semibold text-[var(--color-brand-chocolate)]">{product.name}</h4>
                  <span className="text-[10px] text-[var(--color-brand-muted)]">{product.category}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      product.stockQuantity <= 10
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {product.stockQuantity} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
