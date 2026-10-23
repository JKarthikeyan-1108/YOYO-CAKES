import { describe, it, expect, beforeEach } from 'vitest';
import { PRODUCTS, CATEGORIES, getProductById, searchProducts, getProductsByCategory } from '../data/products';
import { useCartStore } from '../stores/cartStore';
import { useLocationStore } from '../stores/locationStore';
import { calculateLocalServiceability } from '../services/deliveryService';

describe('Stage 2 — Mobile Shopping Experience & Product Browsing', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  describe('1. Category Structure & Product Discovery', () => {
    it('defines the 5 required bakery category filters', () => {
      const categorySlugs = CATEGORIES.map((c) => c.slug);
      expect(categorySlugs).toContain('cakes');
      expect(categorySlugs).toContain('tiramisu-desserts');
      expect(categorySlugs).toContain('brownies');
      expect(categorySlugs).toContain('tea-cakes-pies');
      expect(categorySlugs).toContain('mini-jar-cakes');
      expect(CATEGORIES).toHaveLength(5);
    });

    it('distributes all 27 products across the 5 categories without missing items', () => {
      let totalCategorized = 0;
      for (const cat of CATEGORIES) {
        const inCategory = getProductsByCategory(cat.slug);
        expect(inCategory.length).toBeGreaterThan(0);
        totalCategorized += inCategory.length;
      }
      expect(totalCategorized).toBe(27);
    });
  });

  describe('2. Product Browsing & Search', () => {
    it('searches products by name accurately', () => {
      const dreamResults = searchProducts('Dream');
      expect(dreamResults.length).toBeGreaterThanOrEqual(1);
      expect(dreamResults[0].name).toBe('Dream Cake');

      const tiramisuResults = searchProducts('tiramisu');
      expect(tiramisuResults.length).toBeGreaterThanOrEqual(2);

      const emptyResults = searchProducts('NonExistentBakeryItemXYZ');
      expect(emptyResults).toHaveLength(0);
    });

    it('correctly sorts products by price ascending, price descending, and alphabetical', () => {
      const all = [...PRODUCTS];

      // Price: Low to High
      const asc = [...all].sort((a, b) => a.price - b.price);
      expect(asc[0].price).toBe(50);
      expect(asc[asc.length - 1].price).toBe(300);

      // Price: High to Low
      const desc = [...all].sort((a, b) => b.price - a.price);
      expect(desc[0].price).toBe(300);
      expect(desc[desc.length - 1].price).toBe(50);

      // Name: A to Z
      const alpha = [...all].sort((a, b) => a.name.localeCompare(b.name));
      expect(alpha[0].name.localeCompare(alpha[1].name)).toBeLessThanOrEqual(0);
    });
  });

  describe('3. Functional Cart Operations & Real-Time Sync', () => {
    it('allows adding an item and exposes updated quantity controls', () => {
      const dreamCake = getProductById('cake-001')!;
      useCartStore.getState().addItem(dreamCake, 1);

      const state = useCartStore.getState();
      const item = state.items.find((i) => i.product.id === 'cake-001');
      expect(item).toBeDefined();
      expect(item?.quantity).toBe(1);
      expect(state.getItemCount()).toBe(1);
      expect(state.getSubtotal()).toBe(150);
    });

    it('supports increasing, decreasing, and removing items', () => {
      const matilda = getProductById('cake-002')!;
      useCartStore.getState().addItem(matilda, 1);

      // Increase to 3
      useCartStore.getState().updateQuantity('cake-002', 3);
      expect(useCartStore.getState().getItemCount()).toBe(3);
      expect(useCartStore.getState().getSubtotal()).toBe(600); // 200 * 3

      // Decrease to 2
      useCartStore.getState().updateQuantity('cake-002', 2);
      expect(useCartStore.getState().getItemCount()).toBe(2);
      expect(useCartStore.getState().getSubtotal()).toBe(400);

      // Remove item
      useCartStore.getState().removeItem('cake-002');
      expect(useCartStore.getState().items).toHaveLength(0);
      expect(useCartStore.getState().getItemCount()).toBe(0);
      expect(useCartStore.getState().getSubtotal()).toBe(0);
    });

    it('synchronizes multiple distinct products and calculates subtotal correctly', () => {
      const cake = getProductById('cake-001')!; // ₹150
      const brownie = getProductById('brownie-001')!; // ₹50
      const tiramisu = getProductById('tiramisu-001')!; // ₹250

      useCartStore.getState().addItem(cake, 2);     // 300
      useCartStore.getState().addItem(brownie, 4);  // 200
      useCartStore.getState().addItem(tiramisu, 1); // 250

      const state = useCartStore.getState();
      expect(state.getItemCount()).toBe(7);
      expect(state.getSubtotal()).toBe(750);
    });
  });

  describe('4. Location Store & Regional Kitchen Support', () => {
    it('provides default delivery location with area, city, and coordinates', () => {
      const loc = useLocationStore.getState().currentLocation;
      expect(loc.area).toBeTruthy();
      expect(loc.city).toBeTruthy();
      expect(loc.pincode).toBeTruthy();
      expect(loc.latitude).toBeTypeOf('number');
      expect(loc.longitude).toBeTypeOf('number');
    });

    it('updates delivery location with coordinates preserved', () => {
      useLocationStore.getState().setLocation({
        area: 'RS Puram',
        city: 'Coimbatore',
        pincode: '641002',
        latitude: 11.008,
        longitude: 76.945,
      });

      const updated = useLocationStore.getState().currentLocation;
      expect(updated.area).toBe('RS Puram');
      expect(updated.city).toBe('Coimbatore');
      expect(updated.pincode).toBe('641002');
      expect(updated.latitude).toBe(11.008);
      expect(updated.longitude).toBe(76.945);
    });

    it('returns Coimbatore pickup hub for Coimbatore coordinates and Anna Nagar for Chennai', () => {
      // Coimbatore pickup (lat: 11.008, lng: 76.945)
      const cbePickup = calculateLocalServiceability(11.008, 76.945, 300, 'pickup');
      expect(cbePickup.serviceable).toBe(true);
      expect(cbePickup.storeLocation.name).toContain('Coimbatore');
      expect(cbePickup.storeLocation.address).toContain('RS Puram, Coimbatore');

      // Chennai pickup (lat: 13.085, lng: 80.210)
      const chennaiPickup = calculateLocalServiceability(13.085, 80.210, 300, 'pickup');
      expect(chennaiPickup.serviceable).toBe(true);
      expect(chennaiPickup.storeLocation.address).toContain('Anna Nagar');
    });
  });
});

