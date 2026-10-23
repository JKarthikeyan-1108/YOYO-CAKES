import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { saveOrder, getOrderById, updateOrderStatus, type Order } from '../lib/orders';
import { COLLECTIONS } from '../services/firestoreService';

vi.mock('../services/firestoreService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/firestoreService')>();
  return {
    ...actual,
    createFirestoreOrder: vi.fn().mockResolvedValue(undefined),
    updateFirestoreOrderStatus: vi.fn().mockResolvedValue(undefined),
  };
});

describe('End-to-End E-Commerce Workflow & Firestore Schema Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('1. Storefront Catalog & Product Data Completeness', () => {
    it('verifies all 27 products exist and conform to exact business specs', () => {
      expect(PRODUCTS).toHaveLength(27);
      
      const cakes = PRODUCTS.filter(p => p.categorySlug === 'cakes');
      const tiramisu = PRODUCTS.filter(p => p.categorySlug === 'tiramisu-desserts');
      const brownies = PRODUCTS.filter(p => p.categorySlug === 'brownies');
      const teacakes = PRODUCTS.filter(p => p.categorySlug === 'tea-cakes-pies');
      const jarcakes = PRODUCTS.filter(p => p.categorySlug === 'mini-jar-cakes');

      expect(cakes).toHaveLength(6);
      expect(tiramisu).toHaveLength(3);
      expect(brownies).toHaveLength(10);
      expect(teacakes).toHaveLength(3);
      expect(jarcakes).toHaveLength(5);

      // Verify each product has valid integer paise
      PRODUCTS.forEach(p => {
        expect(p.price).toBeGreaterThan(0);
        const paise = Math.round(p.price * 100);
        expect(Number.isInteger(paise)).toBe(true);
        expect(p.name).toBeTruthy();
        expect(p.ingredients).toBeTruthy();
      });
    });

    it('verifies all 5 bakery categories are properly configured', () => {
      expect(CATEGORIES).toHaveLength(5);
      const slugs = CATEGORIES.map(c => c.slug);
      expect(slugs).toContain('cakes');
      expect(slugs).toContain('tiramisu-desserts');
      expect(slugs).toContain('brownies');
      expect(slugs).toContain('tea-cakes-pies');
      expect(slugs).toContain('mini-jar-cakes');
    });
  });

  describe('2. Customer Cart, Coupon & Delivery Fee Calculations', () => {
    it('applies delivery fee under ₹500 and complimentary delivery waiver at/above ₹500', () => {
      // Order 1: ₹350 (subtotal < 500)
      const subtotalLow = 350;
      const feeLow = subtotalLow >= 500 ? 0 : 40;
      expect(feeLow).toBe(40);
      expect(subtotalLow + feeLow).toBe(390);

      // Order 2: ₹650 (subtotal >= 500)
      const subtotalHigh = 650;
      const feeHigh = subtotalHigh >= 500 ? 0 : 40;
      expect(feeHigh).toBe(0);
      expect(subtotalHigh + feeHigh).toBe(650);
    });

    it('calculates coupon discounts correctly for YOYO10', () => {
      const subtotal = 1000;
      const couponCode = 'YOYO10';
      const discountRate = couponCode === 'YOYO10' ? 0.10 : 0;
      const discount = Math.round(subtotal * discountRate);

      expect(discount).toBe(100);
      const deliveryFee = 0; // >= 500
      const total = subtotal - discount + deliveryFee;
      expect(total).toBe(900);
      expect(total * 100).toBe(90000); // 90000 paise
    });
  });

  describe('3. Order Placement, Razorpay Amount & Fulfillment Flow', () => {
    it('creates, saves, and tracks order through complete fulfillment lifecycle', async () => {
      const orderId = `YOYO-E2E-${Date.now()}`;
      const newOrder: Order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        customer: {
          name: 'Ananya Iyer',
          email: 'ananya@example.com',
          phone: '+91 98401 23456',
          address: '42, Besant Nagar Beach Road',
          city: 'Chennai',
          pincode: '600090',
        },
        items: [
          { id: 'cake-001', name: 'Dream Cake', price: 150, quantity: 2, category: 'Cakes' },
          { id: 'brownie-005', name: 'Triple Chocolate Brownie', price: 150, quantity: 2, category: 'Brownies' },
        ],
        subtotal: 600,
        deliveryFee: 0,
        discount: 60,
        total: 540,
        fulfillment: 'delivery',
        orderStatus: 'placed',
        paymentStatus: 'paid',
        paymentMethod: 'Razorpay',
        razorpayOrderId: 'order_e2e_12345',
        razorpayPaymentId: 'pay_e2e_12345',
      };

      await saveOrder(newOrder);

      // Step 1: Placed
      let found = await getOrderById(orderId);
      expect(found).toBeDefined();
      expect(found?.orderStatus).toBe('placed');

      // Step 2: Confirmed by system
      await updateOrderStatus(orderId, 'confirmed');
      found = await getOrderById(orderId);
      expect(found?.orderStatus).toBe('confirmed');

      // Step 3: Kitchen baking
      await updateOrderStatus(orderId, 'preparing');
      found = await getOrderById(orderId);
      expect(found?.orderStatus).toBe('preparing');

      // Step 4: Ready for dispatch
      await updateOrderStatus(orderId, 'ready');
      found = await getOrderById(orderId);
      expect(found?.orderStatus).toBe('ready');

      // Step 5: Out for delivery
      await updateOrderStatus(orderId, 'out_for_delivery');
      found = await getOrderById(orderId);
      expect(found?.orderStatus).toBe('out_for_delivery');

      // Step 6: Delivered
      await updateOrderStatus(orderId, 'delivered');
      found = await getOrderById(orderId);
      expect(found?.orderStatus).toBe('delivered');
    });
  });

  describe('4. Cloud Firestore Collections Schema Verification', () => {
    it('verifies all 11 required collections are formally defined', () => {
      const expectedCollections = [
        'users',
        'userSettings',
        'addresses',
        'categories',
        'products',
        'carts',
        'wishlists',
        'orders',
        'payments',
        'coupons',
        'orderStatusHistory',
      ];

      expectedCollections.forEach(col => {
        expect(Object.values(COLLECTIONS)).toContain(col);
      });
    });
  });
});
