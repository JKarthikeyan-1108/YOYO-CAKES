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
  customMessage?: string;
  includeCandles?: boolean;
}

interface CartState {
  items: CartItem[];
  savedItems: CartItem[];
  addItem: (product: Product, quantity?: number, options?: { customMessage?: string; includeCandles?: boolean }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateCustomization: (productId: string, options: { customMessage?: string; includeCandles?: boolean }) => void;
  clearCart: () => void;
  saveForLater: (productId: string) => void;
  moveToCartFromSaved: (productId: string) => void;
  removeSavedItem: (productId: string) => void;
  buyAgainItems: (orderItems: { id?: string; productId?: string; name: string; price: number; quantity: number }[]) => void;
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
      savedItems: [],

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

      addItem: (
        product: Product,
        quantity: number = 1,
        options?: { customMessage?: string; includeCandles?: boolean }
      ) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.product.id === product.id
          );
          let newItems: CartItem[];
          if (existing) {
            newItems = state.items.map((item) =>
              item.product.id === product.id
                ? {
                    ...item,
                    quantity: item.quantity + quantity,
                    customMessage: options?.customMessage ?? item.customMessage,
                    includeCandles: options?.includeCandles ?? item.includeCandles,
                  }
                : item
            );
          } else {
            newItems = [
              ...state.items,
              {
                product,
                quantity,
                customMessage: options?.customMessage,
                includeCandles: options?.includeCandles,
              },
            ];
          }
          syncCurrentCartToFirestore(newItems);
          return { items: newItems };
        });
      },

      updateCustomization: (
        productId: string,
        options: { customMessage?: string; includeCandles?: boolean }
      ) => {
        set((state) => {
          const newItems = state.items.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  customMessage: options.customMessage ?? item.customMessage,
                  includeCandles: options.includeCandles ?? item.includeCandles,
                }
              : item
          );
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

      saveForLater: (productId: string) => {
        set((state) => {
          const target = state.items.find((i) => i.product.id === productId);
          if (!target) return state;
          const newItems = state.items.filter((i) => i.product.id !== productId);
          const alreadySaved = state.savedItems.some((i) => i.product.id === productId);
          const newSaved = alreadySaved ? state.savedItems : [...state.savedItems, target];
          syncCurrentCartToFirestore(newItems);
          return { items: newItems, savedItems: newSaved };
        });
      },

      moveToCartFromSaved: (productId: string) => {
        set((state) => {
          const target = state.savedItems.find((i) => i.product.id === productId);
          if (!target) return state;
          const newSaved = state.savedItems.filter((i) => i.product.id !== productId);
          const existingInCart = state.items.find((i) => i.product.id === productId);
          const newItems = existingInCart
            ? state.items.map((i) =>
                i.product.id === productId ? { ...i, quantity: i.quantity + target.quantity } : i
              )
            : [...state.items, target];
          syncCurrentCartToFirestore(newItems);
          return { items: newItems, savedItems: newSaved };
        });
      },

      removeSavedItem: (productId: string) => {
        set((state) => ({
          savedItems: state.savedItems.filter((i) => i.product.id !== productId),
        }));
      },

      buyAgainItems: (orderItems) => {
        set((state) => {
          const newItems = [...state.items];
          for (const ordItem of orderItems) {
            const pId = ordItem.productId || ordItem.id || '';
            const catalogProduct = PRODUCTS.find((p) => p.id === pId) || {
              id: pId,
              name: ordItem.name,
              price: ordItem.price,
              category: 'Cakes',
              categorySlug: 'cakes',
              description: '',
              image: '/images/products/custom.jpg',
              inStock: true,
              stockQuantity: 10,
              featured: false,
              bestseller: false,
              ingredients: '',
              allergens: '',
            };
            const existing = newItems.find((i) => i.product.id === catalogProduct.id);
            if (existing) {
              existing.quantity += ordItem.quantity || 1;
            } else {
              newItems.push({
                product: catalogProduct,
                quantity: ordItem.quantity || 1,
              });
            }
          }
          syncCurrentCartToFirestore(newItems);
          return { items: newItems };
        });
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

