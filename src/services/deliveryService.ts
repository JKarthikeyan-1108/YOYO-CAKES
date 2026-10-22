import { auth } from '@/firebase';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export interface DeliverySettings {
  storeName: string;
  storeAddress: string;
  latitude: number;
  longitude: number;
  maxRadiusKm: number;
  minOrderValue: number;
  freeDeliveryThreshold: number;
  baseDeliveryFee: number;
  baseRadiusKm: number;
  ratePerKmBeyondBase: number;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupInstructions: string;
  updatedAt?: string;
}

export interface ServiceabilityResponse {
  serviceable: boolean;
  reason?: string;
  pickupAvailable: boolean;
  distanceKm: number;
  estimatedMinutes: number;
  deliveryFee: number;
  deliveryFeePaise: number;
  freeDeliveryThreshold: number;
  isFreeDelivery: boolean;
  storeLocation: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

export const FALLBACK_DELIVERY_SETTINGS: DeliverySettings = {
  storeName: 'YOYO CAKES Flagship Artisan Bakery',
  storeAddress: 'Plot 14, 2nd Avenue, Anna Nagar East, Chennai, Tamil Nadu 600040',
  latitude: 13.085,
  longitude: 80.2101,
  maxRadiusKm: 25,
  minOrderValue: 150,
  freeDeliveryThreshold: 500,
  baseDeliveryFee: 40,
  baseRadiusKm: 5,
  ratePerKmBeyondBase: 5,
  deliveryEnabled: true,
  pickupEnabled: true,
  pickupAddress: 'YOYO CAKES Pickup Counter, Plot 14, 2nd Avenue, Anna Nagar East, Chennai',
  pickupInstructions: 'Show your order confirmation screen or 4-digit order number at the pick-up counter.',
};

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimates driving road distance by applying standard urban road winding curvature (1.35x)
 */
export function estimateRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const straight = calculateHaversineDistanceKm(lat1, lon1, lat2, lon2);
  return Number((straight * 1.35).toFixed(2));
}

/**
 * Client-side fallback serviceability calculation if backend is temporarily unreachable
 */
export function calculateLocalServiceability(
  lat: number,
  lng: number,
  subtotal: number = 0,
  fulfillment: 'delivery' | 'pickup' = 'delivery',
  settings: DeliverySettings = FALLBACK_DELIVERY_SETTINGS
): ServiceabilityResponse {
  if (fulfillment === 'pickup') {
    return {
      serviceable: settings.pickupEnabled,
      reason: settings.pickupEnabled ? undefined : 'Store pickup is temporarily unavailable.',
      pickupAvailable: settings.pickupEnabled,
      distanceKm: 0,
      estimatedMinutes: 30,
      deliveryFee: 0,
      deliveryFeePaise: 0,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      isFreeDelivery: true,
      storeLocation: {
        name: settings.storeName,
        address: settings.storeAddress,
        latitude: settings.latitude,
        longitude: settings.longitude,
      },
    };
  }

  if (!settings.deliveryEnabled) {
    return {
      serviceable: false,
      reason: 'Home delivery is temporarily paused for kitchen maintenance. Store pickup is available!',
      pickupAvailable: settings.pickupEnabled,
      distanceKm: 0,
      estimatedMinutes: 0,
      deliveryFee: 0,
      deliveryFeePaise: 0,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      isFreeDelivery: false,
      storeLocation: {
        name: settings.storeName,
        address: settings.storeAddress,
        latitude: settings.latitude,
        longitude: settings.longitude,
      },
    };
  }

  const distanceKm = estimateRoadDistanceKm(settings.latitude, settings.longitude, lat, lng);
  const estimatedMinutes = Math.round(25 + distanceKm * 2.5);

  if (settings.minOrderValue > 0 && subtotal > 0 && subtotal < settings.minOrderValue) {
    return {
      serviceable: false,
      reason: `Minimum cart value of ₹${settings.minOrderValue} required for delivery. Your cart is ₹${subtotal}.`,
      pickupAvailable: settings.pickupEnabled,
      distanceKm,
      estimatedMinutes,
      deliveryFee: settings.baseDeliveryFee,
      deliveryFeePaise: settings.baseDeliveryFee * 100,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      isFreeDelivery: false,
      storeLocation: {
        name: settings.storeName,
        address: settings.storeAddress,
        latitude: settings.latitude,
        longitude: settings.longitude,
      },
    };
  }

  if (distanceKm > settings.maxRadiusKm) {
    return {
      serviceable: false,
      reason: `Your selected location is ${distanceKm} km away, which exceeds our ${settings.maxRadiusKm} km fresh cake delivery radius. You can opt for Store Pickup at our flagship kitchen!`,
      pickupAvailable: settings.pickupEnabled,
      distanceKm,
      estimatedMinutes,
      deliveryFee: 0,
      deliveryFeePaise: 0,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      isFreeDelivery: false,
      storeLocation: {
        name: settings.storeName,
        address: settings.storeAddress,
        latitude: settings.latitude,
        longitude: settings.longitude,
      },
    };
  }

  let fee = settings.baseDeliveryFee;
  const isFree = subtotal >= settings.freeDeliveryThreshold;

  if (isFree) {
    fee = 0;
  } else if (distanceKm > settings.baseRadiusKm && settings.ratePerKmBeyondBase > 0) {
    const extraKm = distanceKm - settings.baseRadiusKm;
    fee = Math.round(settings.baseDeliveryFee + extraKm * settings.ratePerKmBeyondBase);
  }

  return {
    serviceable: true,
    pickupAvailable: settings.pickupEnabled,
    distanceKm,
    estimatedMinutes,
    deliveryFee: fee,
    deliveryFeePaise: fee * 100,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    isFreeDelivery: isFree,
    storeLocation: {
      name: settings.storeName,
      address: settings.storeAddress,
      latitude: settings.latitude,
      longitude: settings.longitude,
    },
  };
}

/**
 * Validates delivery serviceability via the Render Node.js backend API
 */
export async function checkDeliveryServiceabilityApi(params: {
  latitude: number;
  longitude: number;
  subtotal?: number;
  fulfillment?: 'delivery' | 'pickup';
}): Promise<ServiceabilityResponse> {
  try {
    let authHeader = '';
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      authHeader = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/delivery/check-serviceability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({
        latitude: params.latitude,
        longitude: params.longitude,
        subtotal: params.subtotal || 0,
        fulfillment: params.fulfillment || 'delivery',
      }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('[DeliveryService] Backend check failed, using client calculation:', err);
  }

  // Graceful client fallback
  return calculateLocalServiceability(
    params.latitude,
    params.longitude,
    params.subtotal || 0,
    params.fulfillment || 'delivery'
  );
}

/**
 * Fetches delivery settings from the backend or Firestore
 */
export async function fetchDeliverySettings(): Promise<DeliverySettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/delivery/settings`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('[DeliveryService] Failed fetching settings from backend, using fallback:', err);
  }
  return FALLBACK_DELIVERY_SETTINGS;
}

/**
 * Updates delivery settings via the Render backend (Admin only)
 */
export async function updateDeliverySettingsApi(
  settings: Partial<DeliverySettings>
): Promise<{ success: boolean; settings?: DeliverySettings; message?: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Authentication required to update delivery settings.');
  }

  const token = await currentUser.getIdToken();

  const response = await fetch(`${API_BASE_URL}/api/delivery/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || 'Failed to update delivery settings.');
  }

  return await response.json();
}
