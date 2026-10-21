import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth } from '@/firebase';
import {
  getWishlistFromFirestore,
  syncWishlistToFirestore,
} from '@/services/firestoreService';

interface WishlistState {
  items: string[]; // product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncWithFirestore: (userId: string) => Promise<void>;
}

const syncCurrentWishlistToFirestore = (productIds: string[]) => {
  const user = auth.currentUser;
  if (!user) return;
  syncWishlistToFirestore(user.uid, productIds).catch((err) =>
    console.warn('Wishlist sync failed:', err)
  );
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      syncWithFirestore: async (userId: string) => {
        try {
          const remoteIds = await getWishlistFromFirestore(userId);
          if (remoteIds && remoteIds.length > 0) {
            // Merge remote items with local items
            const merged = Array.from(new Set([...get().items, ...remoteIds]));
            set({ items: merged });
            syncCurrentWishlistToFirestore(merged);
          } else if (get().items.length > 0) {
            syncCurrentWishlistToFirestore(get().items);
          }
        } catch (err) {
          console.warn('Error synchronizing wishlist with Firestore:', err);
        }
      },

      addItem: (productId: string) => {
        set((state) => {
          const next = state.items.includes(productId)
            ? state.items
            : [...state.items, productId];
          syncCurrentWishlistToFirestore(next);
          return { items: next };
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const next = state.items.filter((id) => id !== productId);
          syncCurrentWishlistToFirestore(next);
          return { items: next };
        });
      },

      toggleItem: (productId: string) => {
        const { items } = get();
        if (items.includes(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.includes(productId);
      },

      clearWishlist: () => {
        set({ items: [] });
        syncCurrentWishlistToFirestore([]);
      },
    }),
    {
      name: 'yoyo-cakes-wishlist',
    }
  )
);

