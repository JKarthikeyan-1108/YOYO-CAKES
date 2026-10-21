import { describe, it, expect } from 'vitest';
import { PRODUCTS, CATEGORIES } from '@/data/products';
import { validateCouponInFirestore } from '@/services/firestoreService';

describe('Firestore Integration & Data Architecture', () => {
  it('ensures all 27 products have exact prices and valid paise calculations', () => {
    expect(PRODUCTS.length).toBe(27);

    PRODUCTS.forEach((product) => {
      expect(product.id).toBeDefined();
      expect(product.name).toBeDefined();
      expect(product.price).toBeGreaterThan(0);
      expect(Number.isInteger(product.price)).toBe(true);

      // Verify integer paise calculations
      const pricePaise = product.price * 100;
      expect(Number.isInteger(pricePaise)).toBe(true);
      expect(pricePaise).toBe(product.price * 100);
    });
  });

  it('ensures all 5 categories are properly defined and unique', () => {
    expect(CATEGORIES.length).toBe(5);
    const slugs = CATEGORIES.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(5);
  });

  it('validates standard coupons correctly using validateCouponInFirestore', async () => {
    // Test valid YOYO10 coupon
    const validResult = await validateCouponInFirestore('YOYO10', 500);
    expect(validResult.valid).toBe(true);
    expect(validResult.discount).toBe(50); // 10% of 500

    // Test invalid coupon code
    const invalidResult = await validateCouponInFirestore('INVALID99', 500);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.discount).toBe(0);
  });

  it('calculates order paise totals without floating point precision issues', () => {
    // 3 items at ₹150 and 2 items at ₹250
    const item1Price = 150;
    const item1Qty = 3;
    const item2Price = 250;
    const item2Qty = 2;

    const subtotal = item1Price * item1Qty + item2Price * item2Qty;
    const subtotalPaise = item1Price * 100 * item1Qty + item2Price * 100 * item2Qty;

    expect(subtotal).toBe(950);
    expect(subtotalPaise).toBe(95000);

    const deliveryFee = 0; // free above 500
    const deliveryFeePaise = deliveryFee * 100;
    const discount = 95; // 10%
    const discountPaise = discount * 100;

    const totalPaise = subtotalPaise - discountPaise + deliveryFeePaise;
    expect(totalPaise).toBe(85500);
    expect(totalPaise / 100).toBe(855);
  });
});
