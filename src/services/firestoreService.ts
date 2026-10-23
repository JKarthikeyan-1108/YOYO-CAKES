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
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
  isDefault?: boolean;
  createdAt?: string | Timestamp;
  updatedAt?: string | Timestamp;
  // Legacy aliases for backwards compatibility
  name?: string;
  addressLine?: string;
  pincode?: string;
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
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId || userId,
        recipientName: data.recipientName || data.name || 'Customer',
        phone: data.phone || '',
        addressLine1: data.addressLine1 || data.addressLine || '',
        addressLine2: data.addressLine2 || '',
        locality: data.locality || '',
        city: data.city || 'Chennai',
        state: data.state || 'Tamil Nadu',
        postalCode: data.postalCode || data.pincode || '600001',
        latitude: typeof data.latitude === 'number' ? data.latitude : 13.085,
        longitude: typeof data.longitude === 'number' ? data.longitude : 80.2101,
        deliveryInstructions: data.deliveryInstructions || '',
        isDefault: Boolean(data.isDefault),
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        // Legacy compatibility
        name: data.recipientName || data.name,
        addressLine: data.addressLine1 || data.addressLine,
        pincode: data.postalCode || data.pincode,
      } as SavedAddress;
    });
  } catch (err) {
    console.warn('Error fetching addresses from Firestore:', err);
    return [];
  }
}

export async function saveAddressToFirestore(address: SavedAddress): Promise<void> {
  if (!db) return;
  try {
    const docData: Record<string, any> = {
      userId: address.userId,
      recipientName: address.recipientName || address.name || 'Customer',
      phone: address.phone,
      addressLine1: address.addressLine1 || address.addressLine || '',
      addressLine2: address.addressLine2 || '',
      locality: address.locality || '',
      city: address.city || 'Chennai',
      state: address.state || 'Tamil Nadu',
      postalCode: address.postalCode || address.pincode || '600001',
      latitude: address.latitude,
      longitude: address.longitude,
      deliveryInstructions: address.deliveryInstructions || '',
      isDefault: Boolean(address.isDefault),
      updatedAt: serverTimestamp(),
    };

    if (address.createdAt) {
      docData.createdAt = address.createdAt;
    } else {
      docData.createdAt = serverTimestamp();
    }

    // If this address is set as default, unset other addresses for this user
    if (address.isDefault) {
      const existing = await getUserAddressesFromFirestore(address.userId);
      const batch = writeBatch(db);
      existing.forEach((addr) => {
        if (addr.id !== address.id && addr.isDefault) {
          batch.update(doc(db, 'addresses', addr.id), { isDefault: false });
        }
      });
      batch.set(doc(db, 'addresses', address.id), docData, { merge: true });
      await batch.commit();
      return;
    }

    await setDoc(doc(db, 'addresses', address.id), docData, { merge: true });
  } catch (err) {
    console.warn('Error saving address to Firestore:', err);
  }
}

export async function setDefaultAddressInFirestore(userId: string, addressId: string): Promise<void> {
  if (!db) return;
  try {
    const existing = await getUserAddressesFromFirestore(userId);
    const batch = writeBatch(db);
    existing.forEach((addr) => {
      const isTarget = addr.id === addressId;
      batch.update(doc(db, 'addresses', addr.id), { isDefault: isTarget });
    });
    await batch.commit();
  } catch (err) {
    console.warn('Error setting default address in Firestore:', err);
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
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function uploadProductImageToStorage(
  file: File,
  productId: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized. Please verify your Firebase configuration.');
  }

  // 1. Validate MIME format
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    throw new Error(
      `Unsupported file format (${file.type || 'unknown'}). Please upload a JPEG, PNG, WebP, or GIF image.`
    );
  }

  // 2. Validate file size (5MB limit)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Image size (${sizeMb} MB) exceeds the 5 MB limit. Please select a smaller image.`
    );
  }

  // 3. Construct unique storage path with clean file extension
  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = rawExt.replace(/[^a-z0-9]/g, '') || 'jpg';
  const safeProductId = productId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${safeProductId}_${Date.now()}.${cleanExt}`;
  const imageRef = ref(storage, `products/${filename}`);

  const metadata = {
    contentType: file.type || 'image/jpeg',
    customMetadata: {
      productId,
      uploadedAt: new Date().toISOString(),
    },
  };

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(imageRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (onProgress) {
            onProgress(progress);
          }
        }
      },
      (error: any) => {
        console.error('Firebase Storage upload error:', error);
        let userMessage = error.message || 'Image upload failed.';
        switch (error.code) {
          case 'storage/unauthorized':
            userMessage = 'Permission denied: Admin authentication is required to upload product images.';
            break;
          case 'storage/canceled':
            userMessage = 'Image upload was cancelled.';
            break;
          case 'storage/quota-exceeded':
            userMessage = 'Firebase Storage quota exceeded. Please contact your administrator.';
            break;
          case 'storage/retry-limit-exceeded':
            userMessage = 'Upload timed out. Please check your network connection and try again.';
            break;
          case 'storage/invalid-checksum':
            userMessage = 'File corrupted during transfer. Please retry.';
            break;
          case 'storage/bucket-not-found':
            userMessage = 'Firebase Storage bucket was not found. Please verify VITE_FIREBASE_STORAGE_BUCKET in your environment.';
            break;
          case 'storage/project-not-found':
            userMessage = 'Firebase project not found for storage.';
            break;
        }
        reject(new Error(userMessage));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err: any) {
          reject(new Error(err?.message || 'Failed to retrieve image download URL after upload.'));
        }
      }
    );
  });
}

export async function uploadProfileImageToStorage(file: File, userId: string): Promise<string> {
  if (!storage) throw new Error('Firebase Storage is not initialized.');
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    throw new Error('Unsupported file format. Please upload a JPEG, PNG, WebP, or GIF image.');
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Profile image exceeds the 5 MB limit.');
  }
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const cleanExt = fileExt.replace(/[^a-z0-9]/g, '') || 'jpg';
  const imageRef = ref(storage, `profiles/${userId}/${userId}_${Date.now()}.${cleanExt}`);
  const snap = await uploadBytes(imageRef, file);
  return await getDownloadURL(snap.ref);
}

