import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, getDocs, getDoc, updateDoc, query, orderBy } from 'firebase/firestore';

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
}

export interface Order {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  fulfillment: FulfillmentType;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
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

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'orders', order.id), order, { merge: true });
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
  paymentStatus?: PaymentStatus
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

  if (isFirebaseConfigured && db) {
    try {
      const updateData: any = { orderStatus };
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      await updateDoc(doc(db, 'orders', orderId), updateData);
    } catch (e) {
      console.warn('Failed to update order in Firestore:', e);
    }
  }
}
