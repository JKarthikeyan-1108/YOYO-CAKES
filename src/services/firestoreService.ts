import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { ref as rtdbRef, get as rtdbGet, set as rtdbSet, remove as rtdbRemove } from 'firebase/database';
import { db, rtdb, storage, isFirebaseConfigured } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product } from '@/data/products';
import { PRODUCTS, CATEGORIES } from '@/data/products';

export const COLLECTIONS = {
  USERS: 'users',
  USER_SETTINGS: 'userSettings',
  ADDRESSES: 'addresses',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  CARTS: 'carts',
  WISHLISTS: 'wishlists',
  ORDERS: 'orders',
  PAYMENTS: 'payments',
  COUPONS: 'coupons',
  ORDER_STATUS_HISTORY: 'orderStatusHistory',
  BUSINESS_SETTINGS: 'businessSettings',
} as const;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
}

export interface UserSettings {
  userId: string;
  theme: 'cream' | 'dark' | 'system';
  emailNotifications: boolean;
  orderUpdates: boolean;
  smsAlerts: boolean;
  updatedAt?: string | Timestamp;
}

export interface SavedAddress {
  id: string;
  userId: string;
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
  createdAt?: string | Timestamp;
}

export interface FirestoreCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  updatedAt?: string | Timestamp;
}

export interface FirestoreProduct extends Product {
  pricePaise: number; // Integer paise for accurate monetary calculations (e.g. ₹150 = 15000)
  updatedAt?: string | Timestamp;
}

export interface CartDocument {
  userId: string;
  items: {
    productId: string;
    quantity: number;
    snapshot: {
      name: string;
      price: number;
      pricePaise: number;
      category: string;
    };
  }[];
  updatedAt?: string | Timestamp;
}

export interface WishlistDocument {
  userId: string;
  productIds: string[];
  updatedAt?: string | Timestamp;
}

export interface OrderDocument {
  id: string;
  orderNumber: string;
  userId?: string; // Optional for guest checkouts
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    pincode?: string;
    instructions?: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
    pricePaise: number;
    quantity: number;
    category: string;
    image?: string;
  }[];
  subtotal: number;
  subtotalPaise: number;
  deliveryFee: number;
  deliveryFeePaise: number;
  discount: number;
  discountPaise: number;
  total: number;
  totalPaise: number;
  fulfillment: 'delivery' | 'pickup';
  orderStatus: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentDocument {
  id: string;
  orderId: string;
  userId?: string;
  amount: number;
  amountPaise: number;
  currency: 'INR';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  createdAt: string;
}

export interface CouponDocument {
  id: string;
  code: string;
  discountPercentage: number;
  maxDiscount?: number;
  minOrderAmount?: number;
  active: boolean;
  expiresAt?: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  orderId: string;
  userId?: string;
  status: string;
  notes: string;
  updatedBy: string;
  timestamp: string;
}

// ==========================================
// 2. FIRESTORE COLLECTION METHODS
// ==========================================

// --- USERS & SETTINGS ---
export async function getProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? (snap.data() as UserProfile) : null;
  } catch (err) {
    console.warn('Error fetching profile from Firestore:', err);
    return null;
  }
}

export async function saveProfileToFirestore(profile: Partial<UserProfile> & { uid: string }): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      role: profile.role || 'customer',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving profile to Firestore:', err);
  }
}

export async function getUserSettingsFromFirestore(uid: string): Promise<UserSettings | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'userSettings', uid));
    return snap.exists() ? (snap.data() as UserSettings) : null;
  } catch (err) {
    console.warn('Error fetching user settings from Firestore:', err);
    return null;
  }
}

export async function saveUserSettingsToFirestore(settings: UserSettings): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'userSettings', settings.userId), {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving user settings to Firestore:', err);
  }
}

// --- ADDRESSES ---
export async function getUserAddressesFromFirestore(userId: string): Promise<SavedAddress[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, 'addresses'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedAddress));
  } catch (err) {
    console.warn('Error fetching addresses from Firestore:', err);
    return [];
  }
}

export async function saveAddressToFirestore(address: SavedAddress): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'addresses', address.id), {
      ...address,
      createdAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving address to Firestore:', err);
  }
}

export async function deleteAddressFromFirestore(addressId: string): Promise<void> {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'addresses', addressId));
  } catch (err) {
    console.warn('Error deleting address from Firestore:', err);
  }
}

// --- CARTS & WISHLISTS ---
export async function getCartFromFirestore(userId: string): Promise<CartDocument | null> {
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, 'carts', userId));
    return snap.exists() ? (snap.data() as CartDocument) : null;
  } catch (err) {
    console.warn('Error fetching cart from Firestore:', err);
    return null;
  }
}

export async function syncCartToFirestore(cartDoc: CartDocument): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'carts', cartDoc.userId), {
      ...cartDoc,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error syncing cart to Firestore:', err);
  }
}

export async function getWishlistFromFirestore(userId: string): Promise<string[]> {
  if (!db) return [];
  try {
    const snap = await getDoc(doc(db, 'wishlists', userId));
    return snap.exists() ? ((snap.data() as WishlistDocument).productIds || []) : [];
  } catch (err) {
    console.warn('Error fetching wishlist from Firestore:', err);
    return [];
  }
}

export async function syncWishlistToFirestore(userId: string, productIds: string[]): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'wishlists', userId), {
      userId,
      productIds,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn('Error syncing wishlist to Firestore:', err);
  }
}

// --- ORDERS & TRACKING ---
export async function createFirestoreOrder(order: OrderDocument): Promise<void> {
  // 1. Save to Realtime Database
  if (rtdb) {
    try {
      await rtdbSet(rtdbRef(rtdb, `orders/${order.id}`), order);
    } catch (err) {
      console.warn('Error saving order to Realtime Database:', err);
    }
  }

  // 2. Save to Firestore
  if (db) {
    try {
      await setDoc(doc(db, 'orders', order.id), order, { merge: true });

      const historyId = `hist-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const historyItem: OrderStatusHistoryItem = {
        id: historyId,
        orderId: order.id,
        userId: order.userId,
        status: order.orderStatus,
        notes: `Order created via ${order.fulfillment} and payment marked as ${order.paymentStatus}`,
        updatedBy: 'system',
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, 'orderStatusHistory', historyId), historyItem);

      if (order.paymentStatus === 'paid') {
        const paymentId = `pay-${order.id}`;
        const paymentItem: PaymentDocument = {
          id: paymentId,
          orderId: order.id,
          userId: order.userId,
          amount: order.total,
          amountPaise: order.totalPaise,
          currency: 'INR',
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: order.razorpayPaymentId,
          status: 'captured',
          createdAt: new Date().toISOString(),
        };
        await setDoc(doc(db, 'payments', paymentId), paymentItem);
      }
    } catch (err) {
      console.warn('Error creating order in Firestore:', err);
    }
  }
}

export async function updateFirestoreOrderStatus(
  orderId: string,
  newStatus: OrderDocument['orderStatus'],
  updatedBy: string = 'admin',
  notes?: string
): Promise<void> {
  if (rtdb) {
    try {
      await rtdbSet(rtdbRef(rtdb, `orders/${orderId}/orderStatus`), newStatus);
      await rtdbSet(rtdbRef(rtdb, `orders/${orderId}/updatedAt`), new Date().toISOString());
    } catch (err) {
      console.warn('Error updating order status in RTDB:', err);
    }
  }

  if (db) {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        orderStatus: newStatus,
        updatedAt: new Date().toISOString(),
      });

      const historyId = `hist-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      const historyItem: OrderStatusHistoryItem = {
        id: historyId,
        orderId,
        status: newStatus,
        notes: notes || `Order advanced to ${newStatus}`,
        updatedBy,
        timestamp: new Date().toISOString(),
      };
      await setDoc(doc(db, 'orderStatusHistory', historyId), historyItem);
    } catch (err) {
      console.warn('Error updating order status in Firestore:', err);
    }
  }
}

export async function getOrderStatusHistory(orderId: string): Promise<OrderStatusHistoryItem[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'orderStatusHistory'),
      where('orderId', '==', orderId),
      orderBy('timestamp', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as OrderStatusHistoryItem);
  } catch (err) {
    console.warn('Error fetching order status history from Firestore:', err);
    return [];
  }
}

// --- COUPONS ---
export async function validateCouponInFirestore(code: string, currentTotal: number): Promise<{
  valid: boolean;
  discount: number;
  message?: string;
}> {
  const normalized = code.trim().toUpperCase();

  // Standard fallback promotional coupons for instant client response
  if (normalized === 'YOYO10') {
    const discount = Math.round(currentTotal * 0.1);
    return { valid: true, discount, message: '10% discount applied successfully!' };
  }
  if (normalized === 'FIRST50') {
    if (currentTotal < 300) {
      return { valid: false, discount: 0, message: 'Minimum order amount of ₹300 required for FIRST50.' };
    }
    const discount = Math.min(50, currentTotal);
    return { valid: true, discount, message: 'Flat ₹50 welcome discount applied!' };
  }
  if (normalized === 'SWEET20') {
    if (currentTotal < 600) {
      return { valid: false, discount: 0, message: 'Minimum order amount of ₹600 required for SWEET20.' };
    }
    const discount = Math.min(200, Math.round(currentTotal * 0.2));
    return { valid: true, discount, message: '20% celebration discount applied!' };
  }

  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', normalized), where('active', '==', true));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const coupon = snap.docs[0].data() as CouponDocument;
        if (coupon.minOrderAmount && currentTotal < coupon.minOrderAmount) {
          return { valid: false, discount: 0, message: `Minimum order amount of ₹${coupon.minOrderAmount} required.` };
        }
        let discount = Math.round((currentTotal * coupon.discountPercentage) / 100);
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
        return { valid: true, discount, message: `${coupon.discountPercentage}% discount applied!` };
      }
    } catch (err) {
      console.warn('Error verifying coupon in Firestore:', err);
    }
  }

  return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
}

// --- PRODUCTS SEED & INIT ---
export async function seedAllCollectionsToFirestore(): Promise<{ success: boolean; seededCount: number; error?: string }> {
  if (!db) return { success: false, seededCount: 0, error: 'Firestore is not initialized.' };

  try {
    const batch = writeBatch(db);

    // 1. Categories
    for (const cat of CATEGORIES) {
      batch.set(doc(db, 'categories', cat.id), {
        ...cat,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    // 2. Products with Integer Paise
    for (const prod of PRODUCTS) {
      batch.set(doc(db, 'products', prod.id), {
        ...prod,
        pricePaise: prod.price * 100,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    // 3. Default Coupons (YOYO10)
    batch.set(doc(db, 'coupons', 'coupon-yoyo10'), {
      id: 'coupon-yoyo10',
      code: 'YOYO10',
      discountPercentage: 10,
      active: true,
      minOrderAmount: 200,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    await batch.commit();
    return { success: true, seededCount: PRODUCTS.length };
  } catch (err: any) {
    return { success: false, seededCount: 0, error: err?.message || 'Seed failed' };
  }
}

// --- PRODUCTS & CATEGORIES CRUD (Dual Cloud Firestore + Realtime Database Support) ---
export async function getProductsFromFirestore(): Promise<FirestoreProduct[]> {
  // 1. Try Firestore if available
  if (db) {
    try {
      const q = query(collection(db, 'products'), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => {
          const data = d.data() as FirestoreProduct;
          return {
            ...data,
            id: d.id,
            pricePaise: data.pricePaise || (data.price ? data.price * 100 : 0),
          };
        });
      }
    } catch {
      // Graceful fallback to Realtime Database
    }
  }

  // 2. Query Firebase Realtime Database
  if (rtdb) {
    try {
      const snap = await rtdbGet(rtdbRef(rtdb, 'products'));
      if (snap.exists()) {
        const val = snap.val();
        const list = Object.values(val) as FirestoreProduct[];
        if (list.length > 0) {
          return list.map((p) => ({
            ...p,
            pricePaise: p.pricePaise || (p.price ? p.price * 100 : 0),
          }));
        }
      }
    } catch (rtdbErr) {
      console.warn('Error reading products from Realtime Database:', rtdbErr);
    }
  }

  return PRODUCTS.map((p) => ({ ...p, pricePaise: p.price * 100 }));
}

export async function saveProductToFirestore(product: Partial<FirestoreProduct> & { id: string }): Promise<void> {
  const dataToSave: Record<string, any> = { ...product };
  if (typeof product.price === 'number') {
    dataToSave.pricePaise = Math.round(product.price * 100);
  }
  dataToSave.updatedAt = new Date().toISOString();

  // Strip undefined
  Object.keys(dataToSave).forEach((key) => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key];
    }
  });

  // 1. Write to Realtime Database
  if (rtdb) {
    try {
      await rtdbSet(rtdbRef(rtdb, `products/${product.id}`), dataToSave);
    } catch (err) {
      console.warn('Error saving product to Realtime Database:', err);
    }
  }

  // 2. Write to Firestore if available
  if (db) {
    try {
      await setDoc(doc(db, 'products', product.id), { ...dataToSave, updatedAt: serverTimestamp() }, { merge: true });
    } catch {
      // Ignored if Firestore is not initialized
    }
  }
}

export async function deleteProductFromFirestore(id: string): Promise<void> {
  if (rtdb) {
    try {
      await rtdbRemove(rtdbRef(rtdb, `products/${id}`));
    } catch (err) {
      console.warn('Error deleting product from Realtime Database:', err);
    }
  }

  if (db) {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch {
      // Ignored if Firestore is not initialized
    }
  }
}

export async function getCategoriesFromFirestore(): Promise<FirestoreCategory[]> {
  // 1. Try Realtime Database first for low latency
  if (rtdb) {
    try {
      const snap = await rtdbGet(rtdbRef(rtdb, 'categories'));
      if (snap.exists()) {
        const val = snap.val();
        return Object.values(val) as FirestoreCategory[];
      }
    } catch {
      // Fallback
    }
  }

  if (db) {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreCategory));
      }
    } catch {
      // Fallback
    }
  }
  return CATEGORIES.map((c) => ({ ...c }));
}

export async function saveCategoryToFirestore(category: FirestoreCategory): Promise<void> {
  const dataToSave = { ...category, updatedAt: new Date().toISOString() };

  if (rtdb) {
    try {
      await rtdbSet(rtdbRef(rtdb, `categories/${category.id}`), dataToSave);
    } catch (err) {
      console.warn('Error saving category to Realtime Database:', err);
    }
  }

  if (db) {
    try {
      await setDoc(doc(db, 'categories', category.id), { ...category, updatedAt: serverTimestamp() }, { merge: true });
    } catch {
      // Ignored
    }
  }
}

// --- FIREBASE STORAGE UPLOADS ---
export async function uploadProductImageToStorage(file: File, productId: string): Promise<string> {
  if (!storage) throw new Error('Firebase Storage is not initialized.');
  const fileExt = file.name.split('.').pop() || 'jpg';
  const imageRef = ref(storage, `products/${productId}_${Date.now()}.${fileExt}`);
  const snap = await uploadBytes(imageRef, file);
  return await getDownloadURL(snap.ref);
}

export async function uploadProfileImageToStorage(file: File, userId: string): Promise<string> {
  if (!storage) throw new Error('Firebase Storage is not initialized.');
  const fileExt = file.name.split('.').pop() || 'jpg';
  const imageRef = ref(storage, `profiles/${userId}/${userId}_${Date.now()}.${fileExt}`);
  const snap = await uploadBytes(imageRef, file);
  return await getDownloadURL(snap.ref);
}

