import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Truck,
  ChefHat,
  Eye,
  RefreshCw,
  X,
  MapPin,
  Navigation,
  ExternalLink,
  Phone,
  Clock,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
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
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllOrders();
      setOrders(list);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Handle Escape key to close details modal & body scroll lock
  useEffect(() => {
    if (!selectedOrder) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedOrder(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedOrder]);

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
    toast.success(`Order #${orderId} transitioned to ${newStatus.replace('_', ' ')}`);
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

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'preparing':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'out_for_delivery':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#1E1008]">
            Orders & Kitchen Fulfillment
          </h1>
          <p className="text-xs sm:text-sm text-[#7A695E] mt-1">
            Real-time bakery orders, kitchen baking workflows, and dispatch
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#F5ECE1] hover:bg-[#EBDCCF] text-[#1E1008] border border-[#E0D3C5] font-bold text-xs shadow-xs min-h-[44px] flex items-center gap-2 self-start sm:self-auto transition-all"
          aria-label="Refresh orders list"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#8C5E3C]' : 'text-[#8C5E3C]'} />
          <span>{loading ? 'Refreshing...' : 'Refresh Orders'}</span>
        </button>
      </div>

      {/* Metrics Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
          <div className="text-xs font-bold text-[#7A695E] flex items-center gap-1.5">
            <Package size={14} className="text-[#1E1008]" /> Total Orders
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#1E1008] mt-1">{orders.length}</div>
          <div className="text-[11px] text-[#8C7A6E] mt-0.5">All customer orders</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
          <div className="text-xs font-bold text-[#7A695E] flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-700" /> Revenue
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">{formatPrice(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Paid online / COD</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
          <div className="text-xs font-bold text-[#7A695E] flex items-center gap-1.5">
            <ChefHat size={14} className="text-[#8C5E3C]" /> In Kitchen
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#8C5E3C] mt-1">{bakingCount}</div>
          <div className="text-[11px] text-[#8C5E3C] font-medium mt-0.5">Active baking tickets</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DFD5] shadow-xs">
          <div className="text-xs font-bold text-[#7A695E] flex items-center gap-1.5">
            <Truck size={14} className="text-blue-700" /> Out for Delivery
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-700 mt-1">{onRouteCount}</div>
          <div className="text-[11px] text-blue-800 font-medium mt-0.5">{completedCount} delivered</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8DFD5] shadow-xs flex flex-col gap-3">
        <div className="relative w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order ID, customer name, or phone..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-[#E0D3C5] rounded-xl focus:outline-none focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/25 min-h-[44px]"
            aria-label="Search orders"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          <Filter size={14} className="text-gray-400 flex-shrink-0" />
          {[
            { key: 'all', label: 'All' },
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors min-h-[36px] flex items-center ${
                statusFilter === s.key
                  ? 'bg-[#1E1008] text-[#FAF7F2] shadow-xs'
                  : 'bg-[#F5ECE1] text-[#6B5A4E] hover:bg-[#EBDCCF]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E8DFD5] p-8 sm:p-12 text-center shadow-xs">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-[#1E1008]">No orders found</h3>
          <p className="text-xs text-[#7A695E] mt-1 max-w-sm mx-auto">
            {search ? 'No orders match your search criteria. Try a different query.' : 'No orders in this status category.'}
          </p>
        </div>
      )}

      {/* === MOBILE CARD VIEW (< lg) === */}
      <div className="lg:hidden space-y-3.5">
        {filtered.map((order) => {
          const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-[#E8DFD5] p-4 shadow-xs space-y-3 transition-shadow hover:shadow-sm"
            >
              {/* Card Header: ID, Date & Fulfillment */}
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#E8DFD5]">
                <div>
                  <span className="font-mono font-bold text-xs text-[#1E1008] block">
                    #{order.id}
                  </span>
                  <span className="text-[11px] text-[#7A695E] flex items-center gap-1 mt-0.5">
                    <Calendar size={11} />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize flex items-center gap-1 border ${
                      order.fulfillment === 'delivery'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-[#F7EFE6] text-[#8C5E3C] border-[#E8DFD5]'
                    }`}
                  >
                    {order.fulfillment === 'delivery' ? <Truck size={10} /> : <ChefHat size={10} />}
                    {order.fulfillment}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer & Phone */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#1E1008] block text-sm">{order.customer.name}</span>
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-[#8C5E3C] hover:underline flex items-center gap-1 text-[11px] mt-0.5 font-medium"
                    aria-label={`Call ${order.customer.name} at ${order.customer.phone}`}
                  >
                    <Phone size={11} /> {order.customer.phone}
                  </a>
                </div>

                <div className="text-right">
                  <div className="font-black text-base text-[#1E1008]">
                    {formatPrice(order.total)}
                  </div>
                  <span className="text-[11px] text-[#7A695E]">{itemCount} items</span>
                </div>
              </div>

              {/* Items summary preview */}
              <div className="bg-[#FAF7F2] rounded-xl p-2.5 text-[11px] text-[#5C4D42] border border-[#E8DFD5] space-y-1">
                {order.items.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex justify-between truncate">
                    <span className="truncate pr-2">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="font-semibold text-[#1E1008] flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <div className="text-[10px] text-[#7A695E] italic pt-0.5">
                    +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}...
                  </div>
                )}
              </div>

              {/* Status & Quick Actions */}
              <div className="pt-1 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <label htmlFor={`status-select-${order.id}`} className="sr-only">
                    Change status for order {order.id}
                  </label>
                  <select
                    id={`status-select-${order.id}`}
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors min-h-[44px] ${getStatusBadge(
                      order.orderStatus
                    )}`}
                  >
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Baking / Preparing</option>
                    <option value="ready">Ready for Dispatch</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered / Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(order)}
                  className="px-3.5 py-2 rounded-xl bg-[#F5ECE1] hover:bg-[#EBDCCF] text-[#1E1008] border border-[#E0D3C5] text-xs font-bold flex items-center gap-1.5 min-h-[44px] flex-shrink-0 transition-colors"
                  aria-label={`View full details for order ${order.id}`}
                >
                  <Eye size={15} /> Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* === DESKTOP TABLE VIEW (lg+) === */}
      <div className="hidden lg:block bg-white rounded-2xl border border-gray-200/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra table-hover w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase tracking-wider font-bold">
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
                    <div>#{order.id}</div>
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
                    <span className="font-semibold block text-gray-800">{order.customer.name}</span>
                    <a
                      href={`tel:${order.customer.phone}`}
                      className="text-[10px] text-blue-600 hover:underline block"
                    >
                      {order.customer.phone}
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-medium flex items-center gap-1 text-[var(--color-brand-chocolate-light)]">
                      {order.fulfillment === 'delivery' ? (
                        <Truck size={14} className="text-blue-600" />
                      ) : (
                        <ChefHat size={14} className="text-amber-600" />
                      )}
                      {order.fulfillment}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-700">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[var(--color-brand-primary-dark)] text-sm">
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
                      aria-label={`Status for order ${order.id}`}
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
                      className="btn btn-ghost btn-xs text-gray-600 hover:text-[var(--color-brand-primary-dark)] p-2 min-h-[36px]"
                      title="Inspect Order Details"
                      aria-label={`Inspect order ${order.id}`}
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

      {/* Accessible Order Detail Modal / Bottom Sheet */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-order-title"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full max-h-[92dvh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--color-brand-primary-dark)] bg-amber-50 px-2 py-0.5 rounded-full mb-1">
                  Order Details
                </span>
                <h3 id="modal-order-title" className="font-heading text-lg sm:text-xl font-bold text-[var(--color-brand-chocolate)]">
                  #{selectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close order details modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Customer summary */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Customer:</span>
                  <span className="font-bold text-gray-800 text-sm">{selectedOrder.customer.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Contact:</span>
                  <div className="text-right">
                    <a
                      href={`tel:${selectedOrder.customer.phone}`}
                      className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <Phone size={12} /> {selectedOrder.customer.phone}
                    </a>
                    {selectedOrder.customer.email && (
                      <span className="text-gray-400 block text-[11px]">{selectedOrder.customer.email}</span>
                    )}
                  </div>
                </div>

                {selectedOrder.fulfillment === 'delivery' && (
                  <div className="pt-2 border-t border-gray-200/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold flex items-center gap-1">
                        <MapPin size={13} className="text-[var(--color-brand-primary-dark)]" />
                        Doorstep Delivery Address:
                      </span>
                      {selectedOrder.distanceKm && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full">
                          ~{selectedOrder.distanceKm} km from bakery
                        </span>
                      )}
                    </div>
                    
                    <p className="font-medium text-gray-900 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-200/60">
                      {selectedOrder.deliveryAddressSnapshot?.addressLine1 || selectedOrder.customer.address}
                      {selectedOrder.deliveryAddressSnapshot?.addressLine2 ? `, ${selectedOrder.deliveryAddressSnapshot.addressLine2}` : ''}
                      {selectedOrder.deliveryAddressSnapshot?.locality ? `, ${selectedOrder.deliveryAddressSnapshot.locality}` : ''}
                      , {selectedOrder.deliveryAddressSnapshot?.city || selectedOrder.customer.city} — {selectedOrder.deliveryAddressSnapshot?.postalCode || selectedOrder.customer.pincode}
                    </p>

                    {selectedOrder.customer.instructions && (
                      <div className="text-[11px] bg-amber-50 text-amber-900 p-2.5 rounded-lg border border-amber-200">
                        <span className="font-bold">Instructions:</span> {selectedOrder.customer.instructions}
                      </div>
                    )}

                    {/* GPS Coordinates & Google Turn-by-turn Navigation */}
                    {selectedOrder.deliveryAddressSnapshot?.latitude && (
                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-gray-600 bg-gray-100 px-2.5 py-1.5 rounded-lg">
                          <Navigation size={12} className="text-blue-600" />
                          <span>
                            {selectedOrder.deliveryAddressSnapshot.latitude.toFixed(5)}° N, {selectedOrder.deliveryAddressSnapshot.longitude.toFixed(5)}° E
                          </span>
                        </div>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.deliveryAddressSnapshot.latitude},${selectedOrder.deliveryAddressSnapshot.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs text-xs min-h-[40px]"
                        >
                          <ExternalLink size={12} /> Driver Turn-by-Turn GPS
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {selectedOrder.fulfillment === 'pickup' && (
                  <div className="pt-2 border-t border-gray-200/70">
                    <span className="text-gray-500 font-semibold block mb-1">Fulfillment Method:</span>
                    <span className="inline-block font-bold text-xs bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg">
                      🏬 Customer Store Pickup at YOYO CAKES
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-heading text-sm font-bold text-[var(--color-brand-chocolate)] mb-2 flex items-center gap-1.5">
                  <Package size={14} /> Purchased Items ({selectedOrder.items.length})
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-gray-800 text-xs">{item.name}</div>
                        <span className="text-[10px] text-gray-400">
                          {formatPrice(item.price)} × {item.quantity}
                        </span>
                      </div>
                      <div className="font-bold text-gray-800 text-xs">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-[var(--color-brand-cream)] p-4 rounded-xl space-y-1.5 border border-amber-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">{formatPrice(selectedOrder.deliveryFee)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-[var(--color-brand-primary-dark)] pt-2 border-t border-amber-200/70">
                  <span>Total Amount</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Status Update Quick Advance */}
              <div className="space-y-2 pt-1">
                <span className="block text-xs font-bold text-gray-700">
                  Quick Advance Workflow Stage
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, 'preparing')}
                    className="py-2.5 px-3 rounded-xl border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 text-xs font-bold min-h-[44px] transition-colors"
                  >
                    Start Baking
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, 'ready')}
                    className="py-2.5 px-3 rounded-xl border border-purple-300 text-purple-900 bg-purple-50 hover:bg-purple-100 text-xs font-bold min-h-[44px] transition-colors"
                  >
                    Mark Ready
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, 'out_for_delivery')}
                    className="py-2.5 px-3 rounded-xl border border-sky-300 text-sky-900 bg-sky-50 hover:bg-sky-100 text-xs font-bold min-h-[44px] transition-colors"
                  >
                    Send Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                    className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold min-h-[44px] transition-colors shadow-xs"
                  >
                    Delivered
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
