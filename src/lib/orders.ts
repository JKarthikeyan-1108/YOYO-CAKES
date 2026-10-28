import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, getDocs, getDoc, updateDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import {
  createFirestoreOrder,
  updateFirestoreOrderStatus,
  type OrderDocument,
} from '@/services/firestoreService';

export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentType = 'delivery' | 'pickup';

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  pincode?: string;
  instructions?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
  customMessage?: string;
  includeCandles?: boolean;
}

export interface DeliveryAddressSnapshot {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  deliveryInstructions?: string;
  capturedAt?: string;
}

export interface PickupLocationInfo {
  name: string;
  address: string;
  phone?: string;
  instructions?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId?: string;
  createdAt: string;
  customer: OrderCustomer;
  items: (OrderItem & { pricePaise?: number })[];
  subtotal: number;
  subtotalPaise?: number;
  deliveryFee: number;
  deliveryFeePaise?: number;
  discount: number;
  discountPaise?: number;
  total: number;
  totalPaise?: number;
  fulfillment: FulfillmentType;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryAddressSnapshot?: DeliveryAddressSnapshot;
  pickupLocation?: PickupLocationInfo;
  deliverySlot?: string;
  scheduledDate?: string;
  distanceKm?: number;
  dispatchDetails?: {
    riderName?: string;
    riderPhone?: string;
    dispatchedAt?: string;
    notes?: string;
  };
}

const LOCAL_STORAGE_KEY = 'yoyo_cakes_orders';

// Initial demo orders so admin dashboard and tracking have realistic data immediately
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'YOYO-78901',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
      address: '42, Park Avenue, 2nd Floor',
      city: 'Chennai',
      pincode: '600028',
      instructions: 'Please do not ring bell, baby is sleeping',
    },
    items: [
      { id: 'cake-001', name: 'Dream Cake', price: 150, quantity: 1, category: 'Cakes' },
      { id: 'brownie-005', name: 'Triple Chocolate Brownie', price: 150, quantity: 2, category: 'Brownies' },
      { id: 'tiramisu-001', name: 'Classic Tiramisu', price: 250, quantity: 1, category: 'Tiramisu & Desserts' },
    ],
    subtotal: 700,
    deliveryFee: 0,
    discount: 70,
    total: 630,
    fulfillment: 'delivery',
    orderStatus: 'preparing',
    paymentStatus: 'paid',
    paymentMethod: 'UPI (Razorpay)',
    razorpayOrderId: 'order_test_1001',
    razorpayPaymentId: 'pay_test_9001',
  },
  {
    id: 'YOYO-78902',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customer: {
      name: 'Anand Kumar',
      email: 'anand@example.com',
      phone: '9840123456',
    },
    items: [
      { id: 'cake-002', name: 'Matilda Cake', price: 200, quantity: 1, category: 'Cakes' },
      { id: 'jar-001', name: 'Black Forest', price: 50, quantity: 3, category: 'Mini Jar Cakes' },
    ],
    subtotal: 350,
    deliveryFee: 0,
    discount: 0,
    total: 350,
    fulfillment: 'pickup',
    orderStatus: 'ready',
    paymentStatus: 'paid',
    paymentMethod: 'Card (Razorpay)',
    razorpayOrderId: 'order_test_1002',
    razorpayPaymentId: 'pay_test_9002',
  },
  {
    id: 'YOYO-78903',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    customer: {
      name: 'Kavitha R.',
      email: 'kavitha@example.com',
      phone: '9789012345',
      address: 'Flat 3B, Sunshine Apartments',
      city: 'Chennai',
      pincode: '600041',
    },
    items: [
      { id: 'pie-003', name: 'Cookie Pie', price: 150, quantity: 2, category: 'Tea Cakes & Pies' },
      { id: 'brownie-008', name: 'Assorted Brownie', price: 199, quantity: 1, category: 'Brownies' },
    ],
    subtotal: 499,
    deliveryFee: 40,
    discount: 0,
    total: 539,
    fulfillment: 'delivery',
    orderStatus: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'UPI (Razorpay)',
    razorpayOrderId: 'order_test_1003',
    razorpayPaymentId: 'pay_test_9003',
  },
];

export function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      return INITIAL_DEMO_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_ORDERS;
  }
}

export function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders locally', err);
  }
}

export async function saveOrder(order: Order): Promise<void> {
  const current = getLocalOrders();
  const existingIdx = current.findIndex((o) => o.id === order.id);
  if (existingIdx >= 0) {
    current[existingIdx] = order;
  } else {
    current.unshift(order);
  }
  saveLocalOrders(current);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yoyo:orders_updated', { detail: { order } }));
  }

  if (isFirebaseConfigured && db) {
    try {
      // Calculate paise fields if missing
      const orderDoc: OrderDocument = {
        ...order,
        orderNumber: order.orderNumber || order.id,
        subtotalPaise: order.subtotalPaise || order.subtotal * 100,
        deliveryFeePaise: order.deliveryFeePaise || order.deliveryFee * 100,
        discountPaise: order.discountPaise || order.discount * 100,
        totalPaise: order.totalPaise || order.total * 100,
        items: order.items.map((i) => ({
          ...i,
          pricePaise: i.pricePaise || i.price * 100,
        })),
      };
      await createFirestoreOrder(orderDoc);
    } catch (e) {
      console.warn('Failed to sync order to Firestore:', e);
    }
  }
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const local = getLocalOrders().find((o) => o.id.toLowerCase() === id.toLowerCase());
  if (local) return local;

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'orders', id));
      if (snap.exists()) {
        return snap.data() as Order;
      }
    } catch (e) {
      console.warn('Error fetching order from Firestore:', e);
    }
  }
  return undefined;
}

export async function getAllOrders(): Promise<Order[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as Order);
      }
    } catch (e) {
      console.warn('Firestore fetch failed, using local orders:', e);
    }
  }
  return getLocalOrders();
}

export async function updateOrderStatus(
  orderId: string,
  orderStatus: OrderStatus,
  paymentStatus?: PaymentStatus,
  notes?: string
): Promise<void> {
  const current = getLocalOrders();
  const target = current.find((o) => o.id === orderId);
  if (target) {
    target.orderStatus = orderStatus;
    if (paymentStatus) {
      target.paymentStatus = paymentStatus;
    }
    saveLocalOrders(current);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yoyo:orders_updated', { detail: { orderId, orderStatus } }));
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateFirestoreOrderStatus(orderId, orderStatus, 'admin', notes);
      if (paymentStatus) {
        await updateDoc(doc(db, 'orders', orderId), { paymentStatus });
      }
    } catch (e) {
      console.warn('Failed to update order in Firestore:', e);
    }
  }
}

/**
 * Assign a rider / delivery partner to an order and dispatch
 */
export async function assignOrderRider(
  orderId: string,
  riderName: string,
  riderPhone: string,
  notes?: string
): Promise<void> {
  const current = getLocalOrders();
  const target = current.find((o) => o.id === orderId);
  const dispatchDetails = {
    riderName: riderName.trim(),
    riderPhone: riderPhone.trim(),
    dispatchedAt: new Date().toISOString(),
    notes: notes?.trim() || undefined,
  };

  if (target) {
    target.dispatchDetails = dispatchDetails;
    if (target.orderStatus === 'ready' || target.orderStatus === 'confirmed') {
      target.orderStatus = 'out_for_delivery';
    }
    saveLocalOrders(current);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('yoyo:orders_updated', { detail: { orderId, dispatchDetails } }));
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        dispatchDetails,
        orderStatus: 'out_for_delivery',
        updatedAt: new Date().toISOString(),
      });
      await updateFirestoreOrderStatus(
        orderId,
        'out_for_delivery',
        'admin',
        `Assigned rider ${riderName} (${riderPhone}). ${notes || ''}`
      );
    } catch (e) {
      console.warn('Failed to assign rider in Firestore:', e);
    }
  }
}

/**
 * Next logical status step in the bakery dispatch pipeline
 */
export function getNextOrderStatus(current: OrderStatus): { nextStatus: OrderStatus; label: string; actionText: string } | null {
  switch (current) {
    case 'placed':
      return { nextStatus: 'confirmed', label: 'Confirmed', actionText: 'Confirm Order' };
    case 'confirmed':
      return { nextStatus: 'preparing', label: 'Baking', actionText: 'Start Baking' };
    case 'preparing':
      return { nextStatus: 'ready', label: 'Ready for Dispatch', actionText: 'Mark Packed & Ready' };
    case 'ready':
      return { nextStatus: 'out_for_delivery', label: 'On Route', actionText: 'Dispatch Order' };
    case 'out_for_delivery':
      return { nextStatus: 'delivered', label: 'Delivered', actionText: 'Mark Delivered' };
    default:
      return null;
  }
}

/**
 * Generate a pre-filled WhatsApp customer dispatch message
 */
export function getWhatsAppDispatchLink(order: Order): string {
  const phone = order.customer.phone.replace(/[^0-9]/g, '');
  const cleanPhone = phone.startsWith('91') ? phone : `91${phone}`;
  const statusLabel = order.orderStatus.replace(/_/g, ' ').toUpperCase();
  const riderInfo = order.dispatchDetails?.riderName
    ? `\n🚴 Rider: *${order.dispatchDetails.riderName}* (${order.dispatchDetails.riderPhone || 'En route'})`
    : '';

  const message = `Hello *${order.customer.name}*! 🍰\nYour YOYO CAKES order *#${order.id}* is now *${statusLabel}*!${riderInfo}\n\nItems: ${order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}\nTotal: ₹${order.total}\n\nThank you for choosing YOYO CAKES! For assistance, contact +91 98401 23456.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Real-time order listener for live dispatch board
 */
export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
  // 1. Initial push from local storage
  callback(getLocalOrders());

  let unsubFirestore: (() => void) | null = null;

  // 2. Attach Firestore live onSnapshot if available
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      unsubFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => d.data() as Order);
            callback(list);
          }
        },
        (err) => {
          console.warn('Firestore onSnapshot error, falling back to local storage events:', err);
        }
      );
    } catch (e) {
      console.warn('Could not subscribe to Firestore orders:', e);
    }
  }

  // 3. Listen to local window events
  const handleUpdate = () => {
    callback(getLocalOrders());
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      callback(getLocalOrders());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('yoyo:orders_updated', handleUpdate);
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    if (unsubFirestore) {
      unsubFirestore();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('yoyo:orders_updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    }
  };
}
