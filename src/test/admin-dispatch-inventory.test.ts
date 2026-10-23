import { describe, it, expect, beforeEach } from 'vitest';
import {
  getNextOrderStatus,
  assignOrderRider,
  getWhatsAppDispatchLink,
  subscribeToOrders,
  saveOrder,
  getOrderById,
  type Order,
} from '@/lib/orders';
import { useProductStore } from '@/stores/productStore';

describe('Admin Live Dispatch & Inventory Management', () => {
  beforeEach(() => {
    useProductStore.getState().resetToDefault();
  });

  describe('1. Live Order Dispatch Workflow', () => {
    it('accurately advances orders through the bakery status pipeline', () => {
      const step1 = getNextOrderStatus('placed');
      expect(step1).toEqual({
        nextStatus: 'confirmed',
        label: 'Confirmed',
        actionText: 'Confirm Order',
      });

      const step2 = getNextOrderStatus('confirmed');
      expect(step2?.nextStatus).toBe('preparing');
      expect(step2?.actionText).toBe('Start Baking');

      const step3 = getNextOrderStatus('preparing');
      expect(step3?.nextStatus).toBe('ready');
      expect(step3?.actionText).toBe('Mark Packed & Ready');

      const step4 = getNextOrderStatus('ready');
      expect(step4?.nextStatus).toBe('out_for_delivery');
      expect(step4?.actionText).toBe('Dispatch Order');

      const step5 = getNextOrderStatus('out_for_delivery');
      expect(step5?.nextStatus).toBe('delivered');
      expect(step5?.actionText).toBe('Mark Delivered');

      const step6 = getNextOrderStatus('delivered');
      expect(step6).toBeNull();
    });

    it('assigns delivery rider details and moves order to out_for_delivery', async () => {
      const testOrder: Order = {
        id: 'TEST-DISPATCH-001',
        createdAt: new Date().toISOString(),
        customer: {
          name: 'Ananya S.',
          email: 'ananya@example.com',
          phone: '9840199999',
          address: '12, Ocean View Road',
          city: 'Chennai',
          pincode: '600004',
        },
        items: [{ id: 'cake-001', name: 'Dream Cake', price: 150, quantity: 1, category: 'Cakes' }],
        subtotal: 150,
        deliveryFee: 40,
        discount: 0,
        total: 190,
        fulfillment: 'delivery',
        orderStatus: 'ready',
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
      };

      await saveOrder(testOrder);

      await assignOrderRider(
        'TEST-DISPATCH-001',
        'Karthik (Express Van)',
        '9840123456',
        'Handle with care, temperature sensitive'
      );

      const updated = await getOrderById('TEST-DISPATCH-001');
      expect(updated).toBeDefined();
      expect(updated?.orderStatus).toBe('out_for_delivery');
      expect(updated?.dispatchDetails?.riderName).toBe('Karthik (Express Van)');
      expect(updated?.dispatchDetails?.riderPhone).toBe('9840123456');
      expect(updated?.dispatchDetails?.notes).toBe('Handle with care, temperature sensitive');
    });

    it('generates a valid customer WhatsApp dispatch notification URL', () => {
      const testOrder: Order = {
        id: 'YOYO-999',
        createdAt: new Date().toISOString(),
        customer: {
          name: 'Deepak V.',
          email: 'deepak@example.com',
          phone: '9888877777',
        },
        items: [{ id: 'cake-002', name: 'Matilda Cake', price: 200, quantity: 2, category: 'Cakes' }],
        subtotal: 400,
        deliveryFee: 0,
        discount: 0,
        total: 400,
        fulfillment: 'delivery',
        orderStatus: 'out_for_delivery',
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        dispatchDetails: {
          riderName: 'Ramesh',
          riderPhone: '9876543210',
        },
      };

      const url = getWhatsAppDispatchLink(testOrder);
      expect(url).toContain('https://wa.me/919888877777?text=');
      expect(decodeURIComponent(url)).toContain('Deepak V.');
      expect(decodeURIComponent(url)).toContain('YOYO-999');
      expect(decodeURIComponent(url)).toContain('OUT FOR DELIVERY');
      expect(decodeURIComponent(url)).toContain('Ramesh');
    });

    it('receives initial orders through subscribeToOrders listener', () => {
      let received: Order[] = [];
      const unsub = subscribeToOrders((orders) => {
        received = orders;
      });

      expect(received.length).toBeGreaterThan(0);
      unsub();
    });
  });

  describe('2. Product Inventory Management & Live Stock Controls', () => {
    it('updates stock quantity and automatically updates inStock status', async () => {
      const store = useProductStore.getState();
      const product = store.products[0];
      expect(product).toBeDefined();

      // Set quantity to 5
      await store.updateStockQuantity(product.id, 5);
      let current = useProductStore.getState().getProductById(product.id);
      expect(current?.stockQuantity).toBe(5);
      expect(current?.inStock).toBe(true);

      // Set quantity to 0 -> automatically marks out of stock
      await store.updateStockQuantity(product.id, 0);
      current = useProductStore.getState().getProductById(product.id);
      expect(current?.stockQuantity).toBe(0);
      expect(current?.inStock).toBe(false);
    });

    it('performs batch inventory adjustments and restock', async () => {
      const store = useProductStore.getState();
      const targetIds = [store.products[0].id, store.products[1].id];

      // Reset both to 10
      await store.updateStockQuantity(targetIds[0], 10);
      await store.updateStockQuantity(targetIds[1], 10);

      // Batch restock +15
      await store.batchAdjustStockQuantity(targetIds, 15);

      const p1 = useProductStore.getState().getProductById(targetIds[0]);
      const p2 = useProductStore.getState().getProductById(targetIds[1]);
      expect(p1?.stockQuantity).toBe(25);
      expect(p2?.stockQuantity).toBe(25);
      expect(p1?.inStock).toBe(true);
      expect(p2?.inStock).toBe(true);
    });

    it('performs batch inStock status toggles', async () => {
      const store = useProductStore.getState();
      const targetIds = [store.products[0].id, store.products[1].id];

      // Batch mark sold out
      await store.batchUpdateStock(targetIds, false);
      let p1 = useProductStore.getState().getProductById(targetIds[0]);
      let p2 = useProductStore.getState().getProductById(targetIds[1]);
      expect(p1?.inStock).toBe(false);
      expect(p2?.inStock).toBe(false);

      // Batch mark in stock
      await store.batchUpdateStock(targetIds, true);
      p1 = useProductStore.getState().getProductById(targetIds[0]);
      p2 = useProductStore.getState().getProductById(targetIds[1]);
      expect(p1?.inStock).toBe(true);
      expect(p2?.inStock).toBe(true);
    });
  });
});
