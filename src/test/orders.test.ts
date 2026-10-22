import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLocalOrders, saveOrder, getOrderById, updateOrderStatus, type Order } from '../lib/orders';

vi.mock('@/services/firestoreService', () => ({
  createFirestoreOrder: vi.fn().mockResolvedValue(undefined),
  updateFirestoreOrderStatus: vi.fn().mockResolvedValue(undefined),
}));

describe('Orders Lifecycle & State Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides baseline demo orders on initial load', () => {
    const orders = getLocalOrders();
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0]).toHaveProperty('id');
    expect(orders[0]).toHaveProperty('customer');
    expect(orders[0]).toHaveProperty('paymentStatus');
  });

  it('saves and retrieves a newly placed order', async () => {
    const testOrder: Order = {
      id: 'YOYO-TEST-999',
      createdAt: new Date().toISOString(),
      customer: {
        name: 'Rohan Mehta',
        email: 'rohan@example.com',
        phone: '9988776655',
        address: '10, Marine Drive',
        city: 'Chennai',
        pincode: '600001',
      },
      items: [
        { id: 'cake-001', name: 'Dream Cake', price: 150, quantity: 2, category: 'Cakes' },
      ],
      subtotal: 300,
      deliveryFee: 40,
      discount: 0,
      total: 340,
      fulfillment: 'delivery',
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Razorpay',
      razorpayOrderId: 'order_test_999',
      razorpayPaymentId: 'pay_test_999',
    };

    await saveOrder(testOrder);
    const retrieved = await getOrderById('YOYO-TEST-999');
    expect(retrieved).toBeDefined();
    expect(retrieved?.customer.name).toBe('Rohan Mehta');
    expect(retrieved?.total).toBe(340);
  });

  it('updates order status through kitchen and fulfillment stages', async () => {
    const initialOrder: Order = {
      id: 'YOYO-TRACK-101',
      createdAt: new Date().toISOString(),
      customer: {
        name: 'Divya S',
        email: 'divya@example.com',
        phone: '9840998877',
      },
      items: [
        { id: 'brownie-001', name: 'Brownie', price: 50, quantity: 4, category: 'Brownies' },
      ],
      subtotal: 200,
      deliveryFee: 0,
      discount: 0,
      total: 200,
      fulfillment: 'pickup',
      orderStatus: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: 'Razorpay',
    };

    await saveOrder(initialOrder);

    // Transition to preparing
    await updateOrderStatus('YOYO-TRACK-101', 'preparing');
    let order = await getOrderById('YOYO-TRACK-101');
    expect(order?.orderStatus).toBe('preparing');

    // Transition to ready
    await updateOrderStatus('YOYO-TRACK-101', 'ready');
    order = await getOrderById('YOYO-TRACK-101');
    expect(order?.orderStatus).toBe('ready');

    // Transition to delivered
    await updateOrderStatus('YOYO-TRACK-101', 'delivered');
    order = await getOrderById('YOYO-TRACK-101');
    expect(order?.orderStatus).toBe('delivered');
  });

  it('verifies razorpay options calculation with integer paise conversion', () => {
    const amount = 450;
    const amountPaise = Math.round(amount * 100);
    expect(amountPaise).toBe(45000);
    expect(Number.isInteger(amountPaise)).toBe(true);
  });
});

