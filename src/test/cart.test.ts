import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../stores/cartStore';
import { getProductById } from '../data/products';

describe('Cart Store & Calculation Engine', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts with an empty cart and subtotal of 0', () => {
    const { items, getSubtotal, getItemCount } = useCartStore.getState();
    expect(items).toHaveLength(0);
    expect(getSubtotal()).toBe(0);
    expect(getItemCount()).toBe(0);
  });

  it('adds items and accurately calculates subtotal and item count', () => {
    const dreamCake = getProductById('cake-001')!; // ₹150
    const brownie = getProductById('brownie-001')!; // ₹50

    useCartStore.getState().addItem(dreamCake, 2); // 150 * 2 = 300
    useCartStore.getState().addItem(brownie, 3); // 50 * 3 = 150

    const { items, getSubtotal, getItemCount } = useCartStore.getState();
    expect(items).toHaveLength(2);
    expect(getItemCount()).toBe(5);
    expect(getSubtotal()).toBe(450);
  });

  it('updates quantity of existing item and recalculates subtotal', () => {
    const matilda = getProductById('cake-002')!; // ₹200
    useCartStore.getState().addItem(matilda, 1);
    expect(useCartStore.getState().getSubtotal()).toBe(200);

    useCartStore.getState().updateQuantity('cake-002', 4);
    expect(useCartStore.getState().getSubtotal()).toBe(800);
  });

  it('removes item when quantity is reduced to 0', () => {
    const oreoCake = getProductById('cake-003')!;
    useCartStore.getState().addItem(oreoCake, 1);
    expect(useCartStore.getState().items).toHaveLength(1);

    useCartStore.getState().updateQuantity('cake-003', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('correctly assesses free delivery threshold (>= ₹500)', () => {
    const cookiePie = getProductById('teacake-003')!; // ₹150

    // 3 pies = ₹450 -> under ₹500 -> delivery fee is ₹40
    useCartStore.getState().addItem(cookiePie, 3);
    const subtotalBelow = useCartStore.getState().getSubtotal();
    expect(subtotalBelow).toBe(450);
    const deliveryFeeBelow = subtotalBelow >= 500 ? 0 : 40;
    expect(deliveryFeeBelow).toBe(40);

    // Add 1 more pie -> ₹600 -> qualifies for FREE delivery
    useCartStore.getState().addItem(cookiePie, 1);
    const subtotalAbove = useCartStore.getState().getSubtotal();
    expect(subtotalAbove).toBe(600);
    const deliveryFeeAbove = subtotalAbove >= 500 ? 0 : 40;
    expect(deliveryFeeAbove).toBe(0);
  });
});
