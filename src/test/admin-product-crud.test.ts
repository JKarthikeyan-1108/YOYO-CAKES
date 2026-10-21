import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { useProductStore } from '@/stores/productStore';
import type { Product } from '@/data/products';

// Mock Firestore network calls for lightning-fast, isolated unit testing
vi.mock('@/services/firestoreService', () => ({
  saveProductToFirestore: vi.fn().mockResolvedValue(undefined),
  deleteProductFromFirestore: vi.fn().mockResolvedValue(undefined),
  getProductsFromFirestore: vi.fn().mockResolvedValue([]),
  uploadProductImageToStorage: vi.fn().mockResolvedValue('https://example.com/mock-image.jpg'),
}));

describe('Admin Authentication & Product Catalog CRUD', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ user: null, isAdmin: false, error: null });
    useProductStore.getState().resetToDefault();
  });

  it('allows valid administrator login and persists admin session', async () => {
    const auth = useAuthStore.getState();
    const success = await auth.adminLogin('admin@yoyocakes.com', 'yoyoadmin2025', 'yoyoadmin2025');

    expect(success).toBe(true);
    expect(useAuthStore.getState().isAdmin).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('admin@yoyocakes.com');
    expect(localStorage.getItem('yoyo_auth_admin')).toBe('true');
  });

  it('rejects unauthorized users attempting admin login', async () => {
    const auth = useAuthStore.getState();

    await expect(
      auth.adminLogin('hacker@random.com', 'wrongpassword', 'badpin')
    ).rejects.toThrow();

    expect(useAuthStore.getState().isAdmin).toBe(false);
  });

  it('clears admin status on logout', async () => {
    const auth = useAuthStore.getState();
    await auth.adminLogin('admin@yoyocakes.com', 'yoyoadmin2025');
    expect(useAuthStore.getState().isAdmin).toBe(true);

    await auth.logout();
    expect(useAuthStore.getState().isAdmin).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem('yoyo_auth_admin')).toBeNull();
  });

  it('allows adding a new product to the catalog', async () => {
    const store = useProductStore.getState();
    const initialCount = store.products.length;

    const newProduct: Product = {
      id: 'test-custom-cake',
      name: 'Pistachio Kunafa Crunch Cake',
      price: 280,
      category: 'Cakes',
      categorySlug: 'cakes',
      description: 'Handcrafted pistachio kunafa crunch cake with Belgian white chocolate.',
      image: '/images/products/dream-cake.jpg',
      inStock: true,
      stockQuantity: 15,
      featured: true,
      bestseller: true,
      ingredients: 'Pistachio butter, roasted kunafa phyllo, kataifi, cream.',
      allergens: 'Pistachio (Nuts), Dairy, Gluten.',
    };

    await store.addProduct(newProduct);

    const updated = useProductStore.getState().products;
    expect(updated.length).toBe(initialCount + 1);
    expect(updated[0].id).toBe('test-custom-cake');
    expect(updated[0].name).toBe('Pistachio Kunafa Crunch Cake');

    // Check localStorage persistence
    const saved = JSON.parse(localStorage.getItem('yoyo_custom_products_catalog') || '[]');
    expect(saved.some((p: Product) => p.id === 'test-custom-cake')).toBe(true);
  });

  it('allows updating an existing product details and price', async () => {
    const store = useProductStore.getState();
    const existing = store.products[0];

    const modified: Product = {
      ...existing,
      name: `${existing.name} (Special Edition)`,
      price: existing.price + 50,
    };

    await store.updateProduct(modified);

    const target = useProductStore.getState().products.find((p) => p.id === existing.id);
    expect(target?.name).toContain('(Special Edition)');
    expect(target?.price).toBe(existing.price + 50);
  });

  it('allows toggling in-stock and out-of-stock status', async () => {
    const store = useProductStore.getState();
    const targetId = store.products[0].id;
    const initialStock = store.products[0].inStock;

    await store.toggleStock(targetId);

    const target = useProductStore.getState().products.find((p) => p.id === targetId);
    expect(target?.inStock).toBe(!initialStock);
  });

  it('allows deleting a product from the catalog', async () => {
    const store = useProductStore.getState();
    const targetId = store.products[0].id;
    const initialCount = store.products.length;

    await store.deleteProduct(targetId);

    const updated = useProductStore.getState().products;
    expect(updated.length).toBe(initialCount - 1);
    expect(updated.find((p) => p.id === targetId)).toBeUndefined();
  });
});
