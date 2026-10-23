import { create } from 'zustand';

export interface DeliveryLocation {
  city: string;
  area: string;
  pincode: string;
  address?: string;
  landmark?: string;
  estimatedTime: string;
  isExpressAvailable: boolean;
  deliveryFee: number;
  latitude?: number;
  longitude?: number;
}

export const POPULAR_DELIVERY_HUBS: DeliveryLocation[] = [
  // Chennai Hubs
  {
    city: 'Chennai',
    area: 'Anna Nagar',
    pincode: '600040',
    latitude: 13.085,
    longitude: 80.2101,
    estimatedTime: '40–50 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'T. Nagar',
    pincode: '600017',
    latitude: 13.0418,
    longitude: 80.2341,
    estimatedTime: '45–60 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'Velachery',
    pincode: '600042',
    latitude: 12.9756,
    longitude: 80.2207,
    estimatedTime: '50–65 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'Adyar / Besant Nagar',
    pincode: '600020',
    latitude: 13.0012,
    longitude: 80.2565,
    estimatedTime: '45–55 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'OMR / Thoraipakkam',
    pincode: '600096',
    latitude: 12.9363,
    longitude: 80.2319,
    estimatedTime: '60–75 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'Nungambakkam',
    pincode: '600034',
    latitude: 13.0569,
    longitude: 80.2425,
    estimatedTime: '35–45 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'Porur / Ramapuram',
    pincode: '600116',
    latitude: 13.0336,
    longitude: 80.1585,
    estimatedTime: '50–60 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },

  // Coimbatore Hubs
  {
    city: 'Coimbatore',
    area: 'RS Puram',
    pincode: '641002',
    latitude: 11.0088,
    longitude: 76.9458,
    estimatedTime: '35–45 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Coimbatore',
    area: 'Peelamedu',
    pincode: '641004',
    latitude: 11.0287,
    longitude: 77.0182,
    estimatedTime: '40–50 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Coimbatore',
    area: 'Gandhipuram',
    pincode: '641012',
    latitude: 11.0168,
    longitude: 76.9675,
    estimatedTime: '30–40 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Coimbatore',
    area: 'Saibaba Colony',
    pincode: '641011',
    latitude: 11.0256,
    longitude: 76.9427,
    estimatedTime: '35–45 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
];

const LOCAL_STORAGE_KEY = 'yoyo_delivery_location_v1';

function getInitialLocation(): DeliveryLocation {
  if (typeof window === 'undefined') return POPULAR_DELIVERY_HUBS[0];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.pincode) return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse delivery location from storage:', err);
  }
  return POPULAR_DELIVERY_HUBS[0];
}

interface LocationStore {
  currentLocation: DeliveryLocation;
  isModalOpen: boolean;
  detecting: boolean;
  openModal: () => void;
  closeModal: () => void;
  setLocation: (loc: Partial<DeliveryLocation> & { pincode: string }) => void;
  setPincode: (pincode: string) => { valid: boolean; area?: string; message: string };
  detectCurrentGpsLocation: () => Promise<DeliveryLocation>;
}

export const useLocationStore = create<LocationStore>()((set, get) => ({
  currentLocation: getInitialLocation(),
  isModalOpen: false,
  detecting: false,

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  setLocation: (loc) => {
    const updated: DeliveryLocation = {
      ...get().currentLocation,
      ...loc,
      city: loc.city || get().currentLocation.city,
      area: loc.area || get().currentLocation.area,
      pincode: loc.pincode,
      latitude: loc.latitude !== undefined ? loc.latitude : get().currentLocation.latitude,
      longitude: loc.longitude !== undefined ? loc.longitude : get().currentLocation.longitude,
      estimatedTime: loc.estimatedTime || '45–60 mins',
      isExpressAvailable: true,
      deliveryFee: 0,
    };
    set({ currentLocation: updated, isModalOpen: false });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
    }
  },

  setPincode: (pincodeInput: string) => {
    const cleanPin = pincodeInput.trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      return { valid: false, message: 'Please enter a valid 6-digit Indian PIN code.' };
    }

    // Match against known hubs
    const match = POPULAR_DELIVERY_HUBS.find((h) => h.pincode === cleanPin);
    if (match) {
      get().setLocation(match);
      return { valid: true, area: match.area, message: `Delivering to ${match.area}, ${match.city}!` };
    }

    // Default valid Indian pincode fallback
    const isCoimbatore = cleanPin.startsWith('641');
    const customArea = cleanPin.startsWith('600')
      ? 'Chennai Zone'
      : isCoimbatore
      ? 'Coimbatore Zone'
      : 'Tamil Nadu Express';

    const customCity = isCoimbatore ? 'Coimbatore' : 'Chennai';
    const customLat = isCoimbatore ? 11.0168 : 13.085;
    const customLng = isCoimbatore ? 76.9675 : 80.2101;

    const updated: DeliveryLocation = {
      city: customCity,
      area: customArea,
      pincode: cleanPin,
      latitude: customLat,
      longitude: customLng,
      estimatedTime: '45–70 mins',
      isExpressAvailable: true,
      deliveryFee: 0,
    };

    get().setLocation(updated);
    return { valid: true, area: customArea, message: `Delivery available for PIN ${cleanPin}!` };
  },

  detectCurrentGpsLocation: async () => {
    set({ detecting: true });

    return new Promise<DeliveryLocation>((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        set({ detecting: false });
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            // Approximate zone detection based on coordinates
            const isCoimbatore = latitude >= 10.9 && latitude <= 11.2 && longitude >= 76.8 && longitude <= 77.1;
            const chosenHub = isCoimbatore ? POPULAR_DELIVERY_HUBS[7] : POPULAR_DELIVERY_HUBS[0];

            const detectedLoc: DeliveryLocation = {
              ...chosenHub,
              latitude,
              longitude,
              address: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            };

            get().setLocation(detectedLoc);
            set({ detecting: false });
            resolve(detectedLoc);
          } catch (err: any) {
            set({ detecting: false });
            reject(err);
          }
        },
        (error) => {
          set({ detecting: false });
          reject(new Error(error.message || 'Unable to retrieve your current location.'));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  },
}));
