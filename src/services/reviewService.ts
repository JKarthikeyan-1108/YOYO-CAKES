// YOYO CAKES - Review & Customer Feedback Management Service
// Accessible and moderated by the Admin Portal

export interface CustomerReview {
  id: string;
  customerName: string;
  customerEmail?: string;
  rating: number; // 1 to 5
  headline: string;
  comment: string;
  productName: string;
  productId?: string;
  category: string;
  location: string;
  verified: boolean;
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
  adminResponse?: string;
  adminResponseAt?: string;
  helpfulCount: number;
}

const LOCAL_STORAGE_REVIEWS_KEY = 'yoyo_customer_reviews_store_v1';

const INITIAL_SEED_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-001',
    customerName: 'Priya Sundaram',
    customerEmail: 'priya.sundaram@example.com',
    rating: 5,
    headline: 'Best Chocolate Dream Cake in Chennai! Hands down.',
    comment: 'Ordered the 5-in-1 Chocolate Dream Cake for my daughter’s birthday. The crack on the top chocolate shell was so crisp and satisfying, and the cocoa layers underneath were melt-in-mouth! Delivery was right on time at 7 PM sharp.',
    productName: '5-in-1 Chocolate Dream Cake',
    productId: 'cake-001',
    category: 'dream-cake',
    location: 'Anna Nagar, Chennai',
    verified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    adminResponse: 'Thank you so much Priya! Delighted to make your daughter’s birthday celebration unforgettable. We use pure 64% Belgian Couverture for that iconic snap!',
    adminResponseAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    helpfulCount: 28,
  },
  {
    id: 'rev-002',
    customerName: 'Karthik Raja',
    customerEmail: 'karthik.raja@example.com',
    rating: 5,
    headline: 'Pure Belgian indulgence, absolutely uncompromised quality.',
    comment: 'The Assorted Brownie Box (Nutella + Biscoff + Pista) is pure bliss. Unlike bakery brownies loaded with excess sugar, YOYO uses authentic cocoa and butter. You can literally taste the premium ingredients. 10/10 recommendation!',
    productName: 'Assorted Brownie Box (6 Pcs)',
    productId: 'brownie-001',
    category: 'brownies',
    location: 'T. Nagar, Chennai',
    verified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    adminResponse: 'We appreciate the kind words Karthik! We bake every single brownie batch using pure dairy butter and zero palm oil.',
    adminResponseAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    helpfulCount: 21,
  },
  {
    id: 'rev-003',
    customerName: 'Ananya Krishnan',
    customerEmail: 'ananya.k@example.com',
    rating: 5,
    headline: 'The Mini Jar Cakes are so cute and super fresh!',
    comment: 'Ordered 10 Red Velvet and Mango mini jar cakes for an office anniversary party. The personal jars were a total hit—zero mess, perfectly portioned, and the cream cheese frosting was heavenly. Fast doorstep delivery in refrigerated packing.',
    productName: 'Mini Jar Cakes (Assorted)',
    productId: 'jar-001',
    category: 'jars',
    location: 'Velachery, Chennai',
    verified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    helpfulCount: 16,
  },
  {
    id: 'rev-004',
    customerName: 'Vikram Chandran',
    customerEmail: 'vikram.c@example.com',
    rating: 5,
    headline: 'Classic Tiramisu done right with mascarpone cream.',
    comment: 'Finally found real Italian-style tiramisu! Proper espresso soaked biscuits, light mascarpone layer, and fine dark cocoa powder. Delivered in cold insulated packaging so it arrived in picture-perfect shape.',
    productName: 'Classic Italian Tiramisu',
    productId: 'tiramisu-001',
    category: 'tiramisu',
    location: 'RS Puram, Coimbatore',
    verified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    helpfulCount: 35,
  },
  {
    id: 'rev-005',
    customerName: 'Divya Natarajan',
    customerEmail: 'divya.natarajan@example.com',
    rating: 4,
    headline: 'Delicious Matilda Cake, arrived chilled and pristine',
    comment: 'Rich chocolate fudge cake with multiple layers. The taste was rich and not overly sweet. Only request is to add a small candle pack by default.',
    productName: 'Matilda Chocolate Fudge Cake',
    productId: 'cake-002',
    category: 'dream-cake',
    location: 'Gandhipuram, Coimbatore',
    verified: true,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    helpfulCount: 6,
  },
  {
    id: 'rev-006',
    customerName: 'Sanjay Sethuraman',
    customerEmail: 'sanjay.sethu@example.com',
    rating: 5,
    headline: 'Midnight delivery surprised my wife perfectly!',
    comment: 'Booked the 11:30 PM slot. The rider Karthik called before arriving and handed over the cake in an insulated chill-box. The presentation was gorgeous.',
    productName: 'Belgium Dark Truffle Cake',
    productId: 'cake-003',
    category: 'dream-cake',
    location: 'Adyar, Chennai',
    verified: true,
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    helpfulCount: 19,
  },
];

function loadReviews(): CustomerReview[] {
  if (typeof window === 'undefined') return [...INITIAL_SEED_REVIEWS];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load reviews from localStorage:', err);
  }
  return [...INITIAL_SEED_REVIEWS];
}

function persistReviews(reviews: CustomerReview[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn('Failed to persist reviews:', err);
  }
}

let memoryReviews: CustomerReview[] = loadReviews();

export function getAllReviews(): CustomerReview[] {
  return [...memoryReviews];
}

export function getApprovedReviews(): CustomerReview[] {
  return memoryReviews.filter((r) => r.status === 'approved');
}

export function updateReviewStatus(
  reviewId: string,
  newStatus: 'approved' | 'pending' | 'hidden'
): CustomerReview | null {
  const index = memoryReviews.findIndex((r) => r.id === reviewId);
  if (index === -1) return null;

  memoryReviews[index] = {
    ...memoryReviews[index],
    status: newStatus,
  };
  persistReviews(memoryReviews);
  return memoryReviews[index];
}

export function replyToReview(reviewId: string, replyText: string): CustomerReview | null {
  const index = memoryReviews.findIndex((r) => r.id === reviewId);
  if (index === -1) return null;

  memoryReviews[index] = {
    ...memoryReviews[index],
    adminResponse: replyText.trim(),
    adminResponseAt: new Date().toISOString(),
  };
  persistReviews(memoryReviews);
  return memoryReviews[index];
}

export function deleteReview(reviewId: string): boolean {
  const prevLen = memoryReviews.length;
  memoryReviews = memoryReviews.filter((r) => r.id !== reviewId);
  if (memoryReviews.length !== prevLen) {
    persistReviews(memoryReviews);
    return true;
  }
  return false;
}

export function addCustomerReview(
  data: Omit<CustomerReview, 'id' | 'createdAt' | 'helpfulCount' | 'status'> & {
    status?: 'approved' | 'pending';
  }
): CustomerReview {
  const newReview: CustomerReview = {
    ...data,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    helpfulCount: 0,
    status: data.status || 'pending', // Pending admin moderation by default
  };

  memoryReviews = [newReview, ...memoryReviews];
  persistReviews(memoryReviews);
  return newReview;
}

export function getReviewStats(list: CustomerReview[] = memoryReviews): {
  total: number;
  averageRating: number;
  pendingCount: number;
  approvedCount: number;
  hiddenCount: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarOrLowerCount: number;
} {
  const total = list.length;
  if (total === 0) {
    return {
      total: 0,
      averageRating: 5.0,
      pendingCount: 0,
      approvedCount: 0,
      hiddenCount: 0,
      fiveStarCount: 0,
      fourStarCount: 0,
      threeStarOrLowerCount: 0,
    };
  }

  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = Number((sum / total).toFixed(1));
  const pendingCount = list.filter((r) => r.status === 'pending').length;
  const approvedCount = list.filter((r) => r.status === 'approved').length;
  const hiddenCount = list.filter((r) => r.status === 'hidden').length;
  const fiveStarCount = list.filter((r) => r.rating === 5).length;
  const fourStarCount = list.filter((r) => r.rating === 4).length;
  const threeStarOrLowerCount = list.filter((r) => r.rating <= 3).length;

  return {
    total,
    averageRating,
    pendingCount,
    approvedCount,
    hiddenCount,
    fiveStarCount,
    fourStarCount,
    threeStarOrLowerCount,
  };
}

export function resetReviewsToDefault(): void {
  memoryReviews = [...INITIAL_SEED_REVIEWS];
  persistReviews(memoryReviews);
}

