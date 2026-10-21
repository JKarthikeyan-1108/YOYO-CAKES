import { describe, it, expect } from 'vitest';
import { PRODUCTS, getProductById, getProductsByCategory, searchProducts } from '../data/products';

describe('Product Catalog & Exact Pricing Verification', () => {
  it('contains exactly 27 products as specified in master business requirements', () => {
    expect(PRODUCTS).toHaveLength(27);
  });

  const EXPECTED_PRODUCTS: Record<string, number> = {
    'Dream Cake': 150,
    'Matilda Cake': 200,
    'Oreo Cake': 200,
    'Crunch Cake': 250,
    'Puddle Cake': 199,
    'Japanese Cotton Cheese Cake with Triple Chocolate': 160,
    'Classic Tiramisu': 250,
    'Chocolate Tiramisu': 300,
    'Triple Chocolate Mousse': 99,
    'Brownie': 50,
    'Nuts Brownie': 90,
    'Brownie Bites with Dark Chocolate Dip': 100,
    'Lava Brownie': 100,
    'Triple Chocolate Brownie': 150,
    'Nutella Brownie': 180,
    'Pista Brownie': 180,
    'Biscoff Brownie': 80,
    'Gunaffa Brownie': 100,
    'Assorted Brownie': 199,
    'Plain Tea Cake': 100,
    'Marble Tea Cake': 120,
    'Cookie Pie': 150,
    'Black Forest': 50,
    'Black Current': 50,
    'Butterscotch': 50,
    'Strawberry': 50,
    'Mango': 50,
  };

  it('preserves exact names and exact INR prices without deviation', () => {
    for (const [name, expectedPrice] of Object.entries(EXPECTED_PRODUCTS)) {
      const product = PRODUCTS.find((p) => p.name === name);
      expect(product, `Expected product "${name}" to exist in catalog`).toBeDefined();
      expect(product?.price, `Expected "${name}" to have price ₹${expectedPrice}`).toBe(expectedPrice);
    }
  });

  it('assigns unique, stable product IDs to all products', () => {
    const ids = PRODUCTS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(27);
  });

  it('supports retrieval by product ID', () => {
    const dreamCake = getProductById('cake-001');
    expect(dreamCake).toBeDefined();
    expect(dreamCake?.name).toBe('Dream Cake');
    expect(dreamCake?.price).toBe(150);
  });

  it('supports category filtering', () => {
    const brownies = getProductsByCategory('brownies');
    expect(brownies.length).toBe(10);

    const miniJars = getProductsByCategory('mini-jar-cakes');
    expect(miniJars.length).toBe(5);
  });

  it('supports search by keywords', () => {
    const tiramisuSearch = searchProducts('tiramisu');
    expect(tiramisuSearch.length).toBeGreaterThanOrEqual(2);

    const brownieSearch = searchProducts('brownie');
    expect(brownieSearch.length).toBeGreaterThanOrEqual(10);
  });
});
