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
  ChefHat,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { getAllOrders, type Order } from '@/lib/orders';
import { formatPrice } from '@/data/products';
import { useProductStore } from '@/stores/productStore';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const products = useProductStore((s) => s.products);

  useEffect(() => {
    async function load() {
      const data = await getAllOrders();
      setOrders(data);
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

  // Low stock products from catalog (inStock with stockQuantity <= 15)
  const lowStockProducts = products.filter((p) => p.inStock && p.stockQuantity <= 15);

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

  // If no orders yet, provide fallback baseline
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] bg-[var(--color-brand-cream-dark)] px-2.5 py-0.5 rounded-full border border-[var(--color-brand-border)]">
              Executive Overview
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Live Telemetry
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)] tracking-tight">
            Bakery Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-brand-muted)] mt-1">
            Real-time sales, live inventory, and order fulfillment tracking for YOYO CAKES
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#E5B88F] hover:from-[#C79361] hover:to-[#D9A779] text-[#1E1008] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 border border-[#C59262] min-h-[44px]"
          >
            <Package size={15} /> Manage Catalog
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-[var(--color-brand-surface)] hover:bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 border border-[var(--color-brand-border)] min-h-[44px]"
          >
            <Clock size={15} /> View Kitchen
          </Link>
        </div>
      </div>

      {/* KPI Cards (Luxury Warm Espresso & Gold) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Verified Revenue */}
        <div className="bg-[var(--color-brand-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-brand-border)] shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] uppercase tracking-wider block">
              Verified Revenue
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[var(--color-brand-chocolate)] mt-1.5 block tracking-tight">
              {formatPrice(verifiedSalesRevenue)}
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={13} /> Live Razorpay records
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center shadow-2xs flex-shrink-0">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[var(--color-brand-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-brand-border)] shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[var(--color-brand-muted)] uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[var(--color-brand-chocolate)] mt-1.5 block tracking-tight">
              {totalOrders}
            </span>
            <span className="text-[11px] text-[var(--color-brand-muted)] font-medium mt-1 block">
              Delivery & Bakery Store Pickup
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] border border-[var(--color-brand-border)] flex items-center justify-center shadow-2xs flex-shrink-0">
            <Package size={24} />
          </div>
        </div>

        {/* In Kitchen / Baking */}
        <div className="bg-[var(--color-brand-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-brand-border)] shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider block">
              In Kitchen / Baking
            </span>
            <span className="text-2xl sm:text-3xl font-black text-orange-700 dark:text-orange-400 mt-1.5 block tracking-tight">
              {pendingOrders}
            </span>
            <span className="text-[11px] text-orange-600 dark:text-orange-300 font-semibold mt-1 block">
              Active preparation tickets
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/70 dark:border-orange-800/70 flex items-center justify-center shadow-2xs flex-shrink-0">
            <ChefHat size={24} />
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-[var(--color-brand-surface)] p-5 sm:p-6 rounded-2xl border border-[var(--color-brand-border)] shadow-xs hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
              Completed Orders
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-400 mt-1.5 block tracking-tight">
              {completedOrders}
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium mt-1 block">
              Delivered or collected
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center justify-center shadow-2xs flex-shrink-0">
            <CheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Sales Trend Chart (Espresso & Honey-Gold Area) */}
      <div className="bg-[var(--color-brand-surface)] p-5 sm:p-7 rounded-2xl border border-[var(--color-brand-border)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-[var(--color-brand-chocolate)]">
              Sales Revenue Trends (INR)
            </h2>
            <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">
              Daily verified revenue generated from completed bakery transactions
            </p>
          </div>
          <span className="text-xs font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] bg-[var(--color-brand-cream-dark)] px-3 py-1.5 rounded-full border border-[var(--color-brand-border)] self-start sm:self-auto">
            ✨ Gold Analytics
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4A373" stopOpacity={0.65} />
                  <stop offset="95%" stopColor="#D4A373" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-[var(--color-brand-border)] opacity-40" />
              <XAxis dataKey="date" stroke="currentColor" className="text-[var(--color-brand-muted)]" fontSize={11} tickLine={false} />
              <YAxis
                stroke="currentColor"
                className="text-[var(--color-brand-muted)]"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                formatter={(val: any) => [`₹${val}`, 'Revenue']}
                contentStyle={{
                  backgroundColor: '#1E1008',
                  color: '#FFF9F2',
                  borderRadius: '12px',
                  border: '1px solid #D4A373',
                  boxShadow: '0 10px 25px -5px rgba(30, 16, 8, 0.45)',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C9A184"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#salesGradGold)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 bg-[var(--color-brand-surface)] p-5 sm:p-7 rounded-2xl border border-[var(--color-brand-border)] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)]">
                Recent Customer Orders
              </h2>
              <span className="text-xs text-[var(--color-brand-muted)]">Latest orders placed across Chennai</span>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] hover:text-[var(--color-brand-chocolate)] transition-colors flex items-center gap-1 bg-[var(--color-brand-cream-dark)] px-3 py-1.5 rounded-lg border border-[var(--color-brand-border)]"
            >
              All Orders <ArrowRight size={13} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-[var(--color-brand-muted)] text-center py-8">
              No orders registered yet. New customer orders will show up here immediately.
            </p>
          ) : (
            <>
              {/* Mobile Card List (< sm) */}
              <div className="sm:hidden space-y-2.5">
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="p-3.5 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-cream-dark)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-[var(--color-brand-chocolate)] block">
                        #{o.id}
                      </span>
                      <span className="font-bold text-[var(--color-brand-chocolate)] block text-xs mt-0.5">
                        {o.customer.name}
                      </span>
                      <span className="text-[10px] text-[var(--color-brand-muted)] capitalize">{o.fulfillment}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="font-black text-[var(--color-brand-chocolate)] block text-xs">
                          {formatPrice(o.total)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[var(--color-brand-surface)] text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] border border-[var(--color-brand-border)]">
                          {o.orderStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <Link
                        to={`/order/${o.id}`}
                        className="p-2 rounded-lg text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-surface-elevated)] min-w-[36px] min-h-[36px] flex items-center justify-center bg-[var(--color-brand-surface)] border border-[var(--color-brand-border)] shadow-2xs"
                        aria-label={`View order ${o.id}`}
                      >
                        <Eye size={15} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (sm+) */}
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-[var(--color-brand-border)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--color-brand-cream-dark)] border-b border-[var(--color-brand-border)] text-[var(--color-brand-chocolate)] uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-3.5">Order ID</th>
                      <th className="py-3 px-3.5">Customer</th>
                      <th className="py-3 px-3.5">Total</th>
                      <th className="py-3 px-3.5">Status</th>
                      <th className="py-3 px-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-brand-border)]">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[var(--color-brand-cream-dark)]/50 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-[var(--color-brand-chocolate)]">
                          #{o.id}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="font-bold text-[var(--color-brand-chocolate)] block">{o.customer.name}</span>
                          <span className="text-[10px] text-[var(--color-brand-muted)] capitalize">{o.fulfillment}</span>
                        </td>
                        <td className="py-3 px-3.5 font-black text-[var(--color-brand-chocolate)]">
                          {formatPrice(o.total)}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] border border-[var(--color-brand-border)]">
                            {o.orderStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <Link
                            to={`/order/${o.id}`}
                            className="p-1.5 rounded-lg text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] hover:text-[var(--color-brand-chocolate)] hover:bg-[var(--color-brand-cream-dark)] inline-flex transition-colors"
                            aria-label={`View order ${o.id}`}
                          >
                            <Eye size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Low Stock Alerts (1 Col) */}
        <div className="bg-[var(--color-brand-surface)] p-5 sm:p-7 rounded-2xl border border-[var(--color-brand-border)] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-bold text-[var(--color-brand-chocolate)] flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#C2410C]" />
              Low Stock Alerts
            </h2>
            <Link
              to="/admin/products"
              className="text-xs font-bold text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] hover:text-[var(--color-brand-chocolate)] bg-[var(--color-brand-cream-dark)] px-2.5 py-1 rounded-lg border border-[var(--color-brand-border)]"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-2.5">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-[var(--color-brand-muted)] text-center py-6">
                All products have healthy inventory levels.
              </p>
            ) : (
              lowStockProducts.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="p-3 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-cream-dark)] hover:bg-[var(--color-brand-surface-elevated)] transition-colors flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <h4 className="font-bold text-[var(--color-brand-chocolate)] truncate">{product.name}</h4>
                    <span className="text-[10px] text-[var(--color-brand-muted)]">{product.category}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={`font-black px-2 py-0.5 rounded-full text-[10px] border ${
                        product.stockQuantity <= 10
                          ? 'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950/50 dark:text-rose-200 dark:border-rose-800'
                          : 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {product.stockQuantity} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
