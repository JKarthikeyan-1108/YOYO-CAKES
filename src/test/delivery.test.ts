import { describe, it, expect } from 'vitest';
import { 
  estimateRoadDistanceKm, 
  FALLBACK_DELIVERY_SETTINGS, 
  calculateLocalServiceability 
} from '../services/deliveryService';

describe('GPS Delivery Address & Serviceability Engine', () => {
  it('correctly calculates road-curvature distance between two coordinates', () => {
    // Distance from YOYO CAKES store (Anna Nagar, Chennai: 13.0850, 80.2101) to nearby T. Nagar (13.0418, 80.2341)
    const distanceKm = estimateRoadDistanceKm(
      FALLBACK_DELIVERY_SETTINGS.latitude,
      FALLBACK_DELIVERY_SETTINGS.longitude,
      13.0418,
      80.2341
    );

    expect(distanceKm).toBeGreaterThan(5);
    expect(distanceKm).toBeLessThan(12);
  });

  it('marks location as serviceable within configured delivery radius', () => {
    // ~2 km away from store
    const res = calculateLocalServiceability(
      13.088,
      80.215,
      600,
      'delivery',
      FALLBACK_DELIVERY_SETTINGS
    );

    expect(res.serviceable).toBe(true);
    expect(res.distanceKm).toBeLessThan(FALLBACK_DELIVERY_SETTINGS.maxRadiusKm);
    expect(res.deliveryFee).toBe(0); // Subtotal >= 500 triggers delivery fee waiver
  });

  it('charges base delivery fee when subtotal is below delivery fee waiver threshold', () => {
    const res = calculateLocalServiceability(
      13.088,
      80.215,
      350,
      'delivery',
      FALLBACK_DELIVERY_SETTINGS
    );

    expect(res.serviceable).toBe(true);
    expect(res.deliveryFee).toBe(FALLBACK_DELIVERY_SETTINGS.baseDeliveryFee);
  });

  it('declines delivery when address exceeds maximum delivery radius', () => {
    // Coordinates far away in Bangalore (12.9716, 77.5946)
    const res = calculateLocalServiceability(
      12.9716,
      77.5946,
      1000,
      'delivery',
      FALLBACK_DELIVERY_SETTINGS
    );

    expect(res.serviceable).toBe(false);
    expect(res.reason).toContain('exceeds our');
  });

  it('enforces minimum order value if configured', () => {
    const strictSettings = {
      ...FALLBACK_DELIVERY_SETTINGS,
      minOrderValue: 400,
    };

    const res = calculateLocalServiceability(
      13.088,
      80.215,
      250,
      'delivery',
      strictSettings
    );

    expect(res.serviceable).toBe(false);
    expect(res.reason).toContain('Minimum cart value');
  });

  it('always marks store pickup as serviceable with zero delivery fee', () => {
    const res = calculateLocalServiceability(
      0,
      0,
      200,
      'pickup',
      FALLBACK_DELIVERY_SETTINGS
    );

    expect(res.serviceable).toBe(true);
    expect(res.deliveryFee).toBe(0);
    expect(res.distanceKm).toBe(0);
  });
});
