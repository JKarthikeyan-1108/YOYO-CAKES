import { create } from 'zustand';
import { PRODUCTS, CATEGORIES, type Product } from '@/data/products';
import {
  getProductsFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
} from '@/services/firestoreService';

const LOCAL_STORAGE_CATALOG_KEY = 'yoyo_custom_products_catalog';

function loadInitialCatalog(): Product[] {
  if (typeof window === 'undefined') return [...PRODUCTS];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATALOG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load catalog from localStorage:', err);
  }
  return [...PRODUCTS];
}

function persistCatalog(products: Product[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_CATALOG_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Failed to persist catalog to localStorage:', err);
  }
}

interface ProductStore {
  products: Product[];
  categories: typeof CATEGORIES;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  fetchCatalog: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleStock: (id: string) => Promise<void>;
  updateStockQuantity: (id: string, quantity: number) => Promise<void>;
  batchUpdateStock: (ids: string[], inStock: boolean) => Promise<void>;
  batchAdjustStockQuantity: (ids: string[], delta: number) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  resetToDefault: () => void;
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  products: loadInitialCatalog(),
  categories: CATEGORIES,
  loading: false,
  initialized: false,
  error: null,

  fetchCatalog: async () => {
    set({ loading: true, error: null });
    try {
      const firestoreProducts = await getProductsFromFirestore();
      if (firestoreProducts && firestoreProducts.length > 0) {
        // Map Firestore products to Product interface
        const mapped: Product[] = firestoreProducts.map((fp) => ({
          id: fp.id,
          name: fp.name,
          price: fp.price,
          category: fp.category,
          categorySlug: fp.categorySlug,
          description: fp.description || '',
          image: fp.image || `/images/categories/${fp.categorySlug}.jpg`,
          inStock: fp.inStock !== false,
          stockQuantity: typeof fp.stockQuantity === 'number' ? fp.stockQuantity : 20,
          featured: Boolean(fp.featured),
          bestseller: Boolean(fp.bestseller),
          ingredients: fp.ingredients || '',
          allergens: fp.allergens || '',
        }));

        set({ products: mapped, loading: false, initialized: true });
        persistCatalog(mapped);
        return;
      }
    } catch (err) {
      console.warn('Could not sync with Firestore catalog, using local cache:', err);
    }
    set({ loading: false, initialized: true });
  },

  addProduct: async (newProduct: Product) => {
    const current = get().products;
    // Prepend new item
    const updated = [newProduct, ...current.filter((p) => p.id !== newProduct.id)];
    set({ products: updated });
    persistCatalog(updated);

    try {
      await saveProductToFirestore(newProduct);
    } catch (err) {
      console.warn('Failed to save product to Firestore:', err);
    }
  },

  updateProduct: async (updatedProduct: Product) => {
    const current = get().products;
    const updated = current.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    set({ products: updated });
    persistCatalog(updated);

    try {
      await saveProductToFirestore(updatedProduct);
    } catch (err) {
      console.warn('Failed to update product in Firestore:', err);
    }
  },

  deleteProduct: async (id: string) => {
    const current = get().products;
    const updated = current.filter((p) => p.id !== id);
    set({ products: updated });
    persistCatalog(updated);

    try {
      await deleteProductFromFirestore(id);
    } catch (err) {
      console.warn('Failed to delete product from Firestore:', err);
    }
  },

  toggleStock: async (id: string) => {
    const current = get().products;
    const target = current.find((p) => p.id === id);
    if (!target) return;

    const newInStock = !target.inStock;
    const updated = current.map((p) => (p.id === id ? { ...p, inStock: newInStock } : p));
    set({ products: updated });
    persistCatalog(updated);

    try {
      await saveProductToFirestore({ id, inStock: newInStock });
    } catch (err) {
      console.warn('Failed to toggle stock in Firestore:', err);
    }
  },

  updateStockQuantity: async (id: string, quantity: number) => {
    const safeQty = Math.max(0, Math.floor(quantity));
    const current = get().products;
    const target = current.find((p) => p.id === id);
    if (!target) return;

    const inStock = safeQty > 0;
    const updated = current.map((p) =>
      p.id === id ? { ...p, stockQuantity: safeQty, inStock } : p
    );
    set({ products: updated });
    persistCatalog(updated);

    try {
      await saveProductToFirestore({ id, stockQuantity: safeQty, inStock });
    } catch (err) {
      console.warn('Failed to update stock quantity in Firestore:', err);
    }
  },

  batchUpdateStock: async (ids: string[], inStock: boolean) => {
    if (!ids || ids.length === 0) return;
    const current = get().products;
    const setIds = new Set(ids);
    const updated = current.map((p) => (setIds.has(p.id) ? { ...p, inStock } : p));
    set({ products: updated });
    persistCatalog(updated);

    try {
      await Promise.all(ids.map((id) => saveProductToFirestore({ id, inStock })));
    } catch (err) {
      console.warn('Failed to batch update stock in Firestore:', err);
    }
  },

  batchAdjustStockQuantity: async (ids: string[], delta: number) => {
    if (!ids || ids.length === 0) return;
    const current = get().products;
    const setIds = new Set(ids);
    const updated = current.map((p) => {
      if (!setIds.has(p.id)) return p;
      const nextQty = Math.max(0, (p.stockQuantity || 0) + delta);
      return { ...p, stockQuantity: nextQty, inStock: nextQty > 0 };
    });
    set({ products: updated });
    persistCatalog(updated);

    try {
      await Promise.all(
        updated
          .filter((p) => setIds.has(p.id))
          .map((p) => saveProductToFirestore({ id: p.id, stockQuantity: p.stockQuantity, inStock: p.inStock }))
      );
    } catch (err) {
      console.warn('Failed to batch adjust stock quantity in Firestore:', err);
    }
  },

  getProductById: (id: string) => {
    return get().products.find((p) => p.id === id);
  },

  resetToDefault: () => {
    set({ products: [...PRODUCTS] });
    persistCatalog([...PRODUCTS]);
  },
}));
