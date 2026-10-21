import { db, isFirebaseConfigured } from './firebase';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
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

    // 2. Seed all 27 Products
    for (const prod of PRODUCTS) {
      const prodRef = doc(db, 'products', prod.id);
      batch.set(prodRef, { ...prod, updatedAt: new Date().toISOString() }, { merge: true });
    }

    await batch.commit();
    console.log(`Successfully seeded ${PRODUCTS.length} products and ${CATEGORIES.length} categories to Firestore.`);
    return { success: true, count: PRODUCTS.length };
  } catch (err: any) {
    console.error('Firestore catalog seeding error:', err);
    return { success: false, count: 0, error: err?.message || 'Seeding failed' };
  }
}
