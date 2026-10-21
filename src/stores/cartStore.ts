import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/data/products';
import { PRODUCTS } from '@/data/products';
import { auth } from '@/firebase';
import {
  getCartFromFirestore,
  syncCartToFirestore,
  type CartDocument,
} from '@/services/firestoreService';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
  syncWithFirestore: (userId: string) => Promise<void>;
}

// Helper to push cart to Firestore when authenticated
const syncCurrentCartToFirestore = (items: CartItem[]) => {
  const user = auth.currentUser;
  if (!user) return;
  const cartDoc: CartDocument = {
    userId: user.uid,
    items: items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
      snapshot: {
        name: item.product.name,
        price: item.product.price,
        pricePaise: item.product.price * 100,
        category: item.product.category,
      },
    })),
  };
  syncCartToFirestore(cartDoc).catch((err) => console.warn('Cart sync failed:', err));
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      syncWithFirestore: async (userId: string) => {
        try {
          const remoteCart = await getCartFromFirestore(userId);
          if (remoteCart && remoteCart.items && remoteCart.items.length > 0) {
            // Reconstruct CartItems from remoteCart items
            const restoredItems: CartItem[] = [];
            for (const item of remoteCart.items) {
              const catalogProduct = PRODUCTS.find((p) => p.id === item.productId);
              if (catalogProduct) {
                restoredItems.push({
                  product: catalogProduct,
                  quantity: item.quantity,
                });
              } else if (item.snapshot) {
                restoredItems.push({
                  product: {
                    id: item.productId,
                    name: item.snapshot.name,
                    price: item.snapshot.price,
                    category: item.snapshot.category,
                    categorySlug: 'cakes',
                    description: '',
                    image: '/images/products/custom.jpg',
                    inStock: true,
                    stockQuantity: 10,
                    featured: false,
                    bestseller: false,
                    ingredients: '',
                    allergens: '',
                  },
                  quantity: item.quantity,
                });
              }
            }
            if (restoredItems.length > 0) {
              set({ items: restoredItems });
            }
          } else if (get().items.length > 0) {
            // Push local cart to Firestore if Firestore is empty
            syncCurrentCartToFirestore(get().items);
          }
        } catch (err) {
          console.warn('Error synchronizing cart with Firestore:', err);
        }
      },

      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id
          );
          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            newItems = [...state.items, { product, quantity }];
          }
          syncCurrentCartToFirestore(newItems);
          return { items: newItems };
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.product.id !== productId);
          syncCurrentCartToFirestore(newItems);
          return { items: newItems };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => {
          const newItems = state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          );
          syncCurrentCartToFirestore(newItems);
          return { items: newItems };
        });
      },

      clearCart: () => {
        set({ items: [] });
        syncCurrentCartToFirestore([]);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'yoyo-cakes-cart',
    }
  )
);

