import { db, isFirebaseConfigured } from './firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { PRODUCTS, CATEGORIES } from '@/data/products';

/**
 * Idempotently seeds or refreshes the 27 catalog products and categories into Firestore.
 * Using stable document IDs ensures re-running never creates duplicate products.
 */
export async function seedCatalogToFirestore(): Promise<{ success: boolean; count: number; error?: string }> {
  if (!isFirebaseConfigured || !db) {
    console.warn('Firebase is not configured. Skipping Firestore remote seed.');
    return {
      success: false,
      count: 0,
      error: 'Firebase credentials missing. Seed can only run when VITE_FIREBASE_PROJECT_ID is provided.',
    };
  }

  try {
    const batch = writeBatch(db);

    // 1. Seed Categories
    for (const cat of CATEGORIES) {
      const catRef = doc(db, 'categories', cat.id);
      batch.set(catRef, { ...cat, updatedAt: new Date().toISOString() }, { merge: true });
    }

    // 2. Seed all 27 Products with integer paise
    for (const prod of PRODUCTS) {
      const prodRef = doc(db, 'products', prod.id);
      batch.set(
        prodRef,
        {
          ...prod,
          pricePaise: prod.price * 100,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    // 3. Seed Default Coupon (YOYO10)
    const couponRef = doc(db, 'coupons', 'coupon-yoyo10');
    batch.set(
      couponRef,
      {
        id: 'coupon-yoyo10',
        code: 'YOYO10',
        discountPercentage: 10,
        minOrderAmount: 200,
        active: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    await batch.commit();
    console.log(`Successfully seeded ${PRODUCTS.length} products, categories, and coupons to Firestore.`);
    return { success: true, count: PRODUCTS.length };
  } catch (err: any) {
    console.error('Firestore catalog seeding error:', err);
    return { success: false, count: 0, error: err?.message || 'Seeding failed' };
  }
}
