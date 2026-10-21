import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Truck,
  ChefHat,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/orders';
import { formatPrice } from '@/data/products';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    const list = await getAllOrders();
    setOrders(list);
  };

  useEffect(() => {
    let isMounted = true;
    getAllOrders().then((list) => {
      if (isMounted) {
        setOrders(list);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter
  const filtered = orders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search);
    const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
    newPayment?: PaymentStatus
  ) => {
    await updateOrderStatus(orderId, newStatus, newPayment);
    toast.success(`Order #${orderId} transitioned to ${newStatus}`);
    await loadOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        orderStatus: newStatus,
        paymentStatus: newPayment || selectedOrder.paymentStatus,
      });
    }
  };

  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const bakingCount = orders.filter((o) => o.orderStatus === 'preparing').length;
  const onRouteCount = orders.filter((o) => o.orderStatus === 'out_for_delivery').length;
  const completedCount = orders.filter((o) => o.orderStatus === 'delivered').length;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--color-brand-chocolate)]">
            Orders & Kitchen Fulfillment
          </h1>
          <p className="text-sm text-[var(--color-brand-muted)] mt-1">
            Track real-time bakery orders, kitchen baking workflows, and dispatch
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} /> Refresh Orders
        </button>
      </div>

      {/* DaisyUI Metrics Stats Banner */}
      <div className="stats stats-vertical sm:stats-horizontal shadow-xs border border-gray-200/80 bg-white w-full rounded-2xl">
        <div className="stat py-4 px-6">
          <div className="stat-title text-xs font-semibold text-gray-500">Total Orders</div>
          <div className="stat-value text-2xl font-bold text-[var(--color-brand-chocolate)]">{orders.length}</div>
          <div className="stat-desc text-xs text-gray-400">All recorded bakery orders</div>
        </div>
        <div className="stat py-4 px-6">
          <div className="stat-title text-xs font-semibold text-gray-500">Collected Revenue</div>
          <div className="stat-value text-2xl font-bold text-[#007600]">{formatPrice(totalRevenue)}</div>
          <div className="stat-desc text-xs text-[#007600] font-semibold">Online + Settled COD</div>
        </div>
        <div className="stat py-4 px-6">
          <div className="stat-title text-xs font-semibold text-gray-500">In Kitchen / Baking</div>
          <div className="stat-value text-2xl font-bold text-amber-600">{bakingCount}</div>
          <div className="stat-desc text-xs text-amber-600 font-semibold">Active baking tickets</div>
        </div>
        <div className="stat py-4 px-6">
          <div className="stat-title text-xs font-semibold text-gray-500">Out For Delivery</div>
          <div className="stat-value text-2xl font-bold text-blue-600">{onRouteCount}</div>
          <div className="stat-desc text-xs text-blue-600 font-semibold">{completedCount} delivered today</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/70 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, name, or phone..."
            className="input-field pl-10 py-2 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'placed', label: 'Placed' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'preparing', label: 'Baking' },
            { key: 'ready', label: 'Ready' },
            { key: 'out_for_delivery', label: 'On Route' },
            { key: 'delivered', label: 'Completed' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setStatusFilter(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === s.key
                  ? 'bg-[var(--color-brand-chocolate)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra table-hover w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-[var(--color-brand-muted)] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[var(--color-brand-chocolate)]">
                    <div>{order.id}</div>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold block">{order.customer.name}</span>
                    <span className="text-[10px] text-gray-400">{order.customer.phone}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-medium flex items-center gap-1 text-[var(--color-brand-chocolate-light)]">
                      {order.fulfillment === 'delivery' ? (
                        <Truck size={14} className="text-[var(--color-brand-info)]" />
                      ) : (
                        <ChefHat size={14} className="text-[var(--color-brand-warning)]" />
                      )}
                      {order.fulfillment}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-700">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[var(--color-brand-primary-dark)]">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`badge badge-sm font-bold text-[10px] uppercase tracking-wider ${
                        order.paymentStatus === 'paid' ? 'badge-success text-white' : 'badge-warning text-gray-900'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as OrderStatus)
                      }
                      className="select select-bordered select-xs font-semibold text-[var(--color-brand-chocolate)] focus:outline-[var(--color-brand-primary-dark)]"
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Baking / Preparing</option>
                      <option value="ready">Ready for Dispatch / Pickup</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered / Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="btn btn-ghost btn-xs text-gray-600 hover:text-[var(--color-brand-primary-dark)]"
                      title="Inspect Order Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DaisyUI Order Detail Modal */}
      {selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-xl p-6 sm:p-8 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <span className="badge badge-primary badge-outline text-[10px] font-mono font-bold uppercase mb-1">
                  Order Details
                </span>
                <h3 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)]">
                  {selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Customer summary */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-1.5 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Name:</span>
                  <span className="font-bold text-gray-800">{selectedOrder.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact:</span>
                  <span className="font-semibold text-gray-800">{selectedOrder.customer.phone} • {selectedOrder.customer.email}</span>
                </div>
                {selectedOrder.fulfillment === 'delivery' && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-gray-500 block">Delivery Address:</span>
                    <p className="font-medium text-gray-800 mt-0.5">
                      {selectedOrder.customer.address}, {selectedOrder.customer.city} — {selectedOrder.customer.pincode}
                    </p>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-heading text-sm font-bold text-[var(--color-brand-chocolate)] mb-3">
                  Purchased Items
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800">{item.name}</div>
                        <span className="text-[10px] text-gray-400">
                          {formatPrice(item.price)} × {item.quantity}
                        </span>
                      </div>
                      <div className="font-bold text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-[var(--color-brand-cream)] p-4 rounded-xl space-y-1 border border-amber-100">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(selectedOrder.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[var(--color-brand-primary-dark)] pt-1 border-t border-[var(--color-brand-primary-light)]/40">
                  <span>Total Amount Paid</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="pt-2 space-y-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Quick Advance Workflow
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'preparing')}
                    className="btn btn-sm btn-outline text-xs"
                  >
                    Start Baking
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'ready')}
                    className="btn btn-sm btn-outline text-xs"
                  >
                    Mark Ready
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'out_for_delivery')}
                    className="btn btn-sm btn-outline text-xs"
                  >
                    Send with Driver
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                    className="btn btn-sm btn-primary text-xs"
                  >
                    Mark Delivered
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop bg-black/50" onClick={() => setSelectedOrder(null)} />
        </div>
      )}
    </div>
  );
}
