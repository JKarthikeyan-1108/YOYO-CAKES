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
}

export const POPULAR_DELIVERY_HUBS: DeliveryLocation[] = [
  // Chennai Hubs
  {
    city: 'Chennai',
    area: 'Anna Nagar',
    pincode: '600040',
    estimatedTime: '40–50 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'T. Nagar',
    pincode: '600017',
    estimatedTime: '45–60 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'Velachery',
    pincode: '600042',
    estimatedTime: '50–65 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'Adyar / Besant Nagar',
    pincode: '600020',
    estimatedTime: '45–55 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'OMR / Thoraipakkam',
    pincode: '600096',
    estimatedTime: '60–75 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'Nungambakkam',
    pincode: '600034',
    estimatedTime: '35–45 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Chennai',
    area: 'Porur / Ramapuram',
    pincode: '600116',
    estimatedTime: '50–60 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },

  // Coimbatore Hubs
  {
    city: 'Coimbatore',
    area: 'RS Puram',
    pincode: '641002',
    estimatedTime: '35–45 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Coimbatore',
    area: 'Peelamedu',
    pincode: '641004',
    estimatedTime: '40–50 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Coimbatore',
    area: 'Gandhipuram',
    pincode: '641012',
    estimatedTime: '30–40 mins',
    isExpressAvailable: true,
    deliveryFee: 0,
  },
  {
    city: 'Coimbatore',
    area: 'Saibaba Colony',
    pincode: '641011',
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
    const customArea = cleanPin.startsWith('600')
      ? 'Chennai Zone'
      : cleanPin.startsWith('641')
      ? 'Coimbatore Zone'
      : 'Tamil Nadu Express';

    const customCity = cleanPin.startsWith('641') ? 'Coimbatore' : 'Chennai';

    const updated: DeliveryLocation = {
      city: customCity,
      area: customArea,
      pincode: cleanPin,
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
