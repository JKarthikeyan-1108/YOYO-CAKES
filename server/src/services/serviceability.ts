import { db } from '../firebaseAdmin';

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
  updatedAt: string;
}

export interface ServiceabilityResult {
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

// Canonical Default Settings - stored in Firestore and administrator-editable
export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
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
  pickupAddress: 'YOYO CAKES Pickup Counter, Plot 14, 2nd Avenue, Anna Nagar East, Chennai (Near Metro Station)',
  pickupInstructions: 'Show your order confirmation screen or 4-digit order number at the pick-up counter.',
  updatedAt: new Date().toISOString(),
};

const SETTINGS_DOC_REF = 'businessSettings/delivery';

/**
 * Loads current delivery settings from Firestore, initializing defaults if absent
 */
export async function getDeliverySettings(): Promise<DeliverySettings> {
  try {
    const docSnap = await db.doc(SETTINGS_DOC_REF).get();
    if (docSnap.exists) {
      return {
        ...DEFAULT_DELIVERY_SETTINGS,
        ...(docSnap.data() as Partial<DeliverySettings>),
      };
    }

    // Initialize document in Firestore if not yet saved
    await db.doc(SETTINGS_DOC_REF).set(DEFAULT_DELIVERY_SETTINGS);
    return DEFAULT_DELIVERY_SETTINGS;
  } catch (err) {
    console.warn('[Serviceability] Failed reading Firestore delivery settings, using defaults:', err);
    return DEFAULT_DELIVERY_SETTINGS;
  }
}

/**
 * Updates delivery settings in Firestore (restricted to authorized administrators)
 */
export async function updateDeliverySettings(
  updates: Partial<DeliverySettings>,
  updatedByUid?: string
): Promise<DeliverySettings> {
  const current = await getDeliverySettings();
  const updated: DeliverySettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.doc(SETTINGS_DOC_REF).set(updated, { merge: true });

  // Audit log of admin changes
  if (updatedByUid) {
    await db.collection('auditLogs').add({
      action: 'UPDATE_DELIVERY_SETTINGS',
      updatedBy: updatedByUid,
      settings: updated,
      timestamp: new Date().toISOString(),
    });
  }

  return updated;
}

/**
 * Haversine straight-line distance calculation between two GPS coordinates
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in kilometers
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
 * Accurate Road Distance Calculation:
 * - Queries Google Distance Matrix API if GOOGLE_MAPS_SERVER_API_KEY is available.
 * - Otherwise applies an established urban road network winding factor (1.35x) to straight-line distance
 *   so that we never confuse straight-line flight distance with actual driving road distance!
 */
export async function calculateRoadDistanceAndDuration(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): Promise<{ distanceKm: number; durationMinutes: number }> {
  const serverApiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (serverApiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLon}&destinations=${destLat},${destLon}&mode=driving&units=metric&key=${serverApiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const element = data?.rows?.[0]?.elements?.[0];
        if (element && element.status === 'OK') {
          const distanceKm = Number((element.distance.value / 1000).toFixed(2));
          const durationMinutes = Math.ceil(element.duration.value / 60);
          return { distanceKm, durationMinutes };
        }
      }
    } catch (err) {
      console.warn('[DistanceMatrix API] Call failed, using road-curvature calculation fallback:', err);
    }
  }

  // Road curvature fallback calculation
  const haversine = calculateHaversineDistanceKm(originLat, originLon, destLat, destLon);
  // Urban road factor (1.35x) to account for roads, intersections, and traffic routing
  const distanceKm = Number((haversine * 1.35).toFixed(2));
  // Estimated delivery time: 25 mins fresh baking & packing + 2.5 mins per road km
  const durationMinutes = Math.round(25 + distanceKm * 2.5);

  return { distanceKm, durationMinutes };
}

/**
 * Authoritative Server-Side Serviceability Validation
 */
export async function checkDeliveryServiceability(
  destLat: number,
  destLon: number,
  subtotal: number = 0,
  fulfillment: 'delivery' | 'pickup' = 'delivery'
): Promise<ServiceabilityResult> {
  const settings = await getDeliverySettings();

  // Validate GPS coordinates boundaries
  if (
    typeof destLat !== 'number' ||
    typeof destLon !== 'number' ||
    isNaN(destLat) ||
    isNaN(destLon) ||
    destLat < -90 ||
    destLat > 90 ||
    destLon < -180 ||
    destLon > 180
  ) {
    return {
      serviceable: false,
      reason: 'Invalid GPS coordinates provided. Please select a valid delivery location on the map.',
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

  // Store Pickup fulfillment is always serviceable if pickup is enabled
  if (fulfillment === 'pickup') {
    return {
      serviceable: settings.pickupEnabled,
      reason: settings.pickupEnabled ? undefined : 'Store pickup is currently unavailable.',
      pickupAvailable: settings.pickupEnabled,
      distanceKm: 0,
      estimatedMinutes: 30, // Ready in 30 mins
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

  // Check if store delivery is currently enabled
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

  // Support flagship bakery and regional dispatch kitchens (e.g. Coimbatore hub)
  const isCoimbatore = destLat >= 10.8 && destLat <= 11.3 && destLon >= 76.7 && destLon <= 77.3;
  const kitchenLat = isCoimbatore ? 11.0168 : settings.latitude;
  const kitchenLng = isCoimbatore ? 76.9675 : settings.longitude;
  const kitchenName = isCoimbatore ? 'YOYO CAKES Coimbatore Kitchen' : settings.storeName;
  const kitchenAddress = isCoimbatore ? '72, DB Road, RS Puram, Coimbatore, Tamil Nadu 641002' : settings.storeAddress;

  // Calculate road distance
  const { distanceKm, durationMinutes } = await calculateRoadDistanceAndDuration(
    kitchenLat,
    kitchenLng,
    destLat,
    destLon
  );

  // Check minimum order value if applicable
  if (settings.minOrderValue > 0 && subtotal > 0 && subtotal < settings.minOrderValue) {
    return {
      serviceable: false,
      reason: `Minimum cart value of ₹${settings.minOrderValue} required for doorstep delivery. Your cart is ₹${subtotal}.`,
      pickupAvailable: settings.pickupEnabled,
      distanceKm,
      estimatedMinutes: durationMinutes,
      deliveryFee: settings.baseDeliveryFee,
      deliveryFeePaise: settings.baseDeliveryFee * 100,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      isFreeDelivery: false,
      storeLocation: {
        name: kitchenName,
        address: kitchenAddress,
        latitude: kitchenLat,
        longitude: kitchenLng,
      },
    };
  }

  // Check maximum delivery radius
  if (distanceKm > settings.maxRadiusKm) {
    return {
      serviceable: false,
      reason: `Your selected location is ${distanceKm} km away, which exceeds our ${settings.maxRadiusKm} km fresh cake delivery radius. You can opt for Store Pickup at our flagship kitchen!`,
      pickupAvailable: settings.pickupEnabled,
      distanceKm,
      estimatedMinutes: durationMinutes,
      deliveryFee: 0,
      deliveryFeePaise: 0,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      isFreeDelivery: false,
      storeLocation: {
        name: kitchenName,
        address: kitchenAddress,
        latitude: kitchenLat,
        longitude: kitchenLng,
      },
    };
  }

  // Recalculate authoritative delivery fee
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
    estimatedMinutes: durationMinutes,
    deliveryFee: fee,
    deliveryFeePaise: fee * 100,
    freeDeliveryThreshold: settings.freeDeliveryThreshold,
    isFreeDelivery: isFree,
    storeLocation: {
      name: kitchenName,
      address: kitchenAddress,
      latitude: kitchenLat,
      longitude: kitchenLng,
    },
  };
}
