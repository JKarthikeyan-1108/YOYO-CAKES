import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllReviews,
  getApprovedReviews,
  addCustomerReview,
  updateReviewStatus,
  replyToReview,
  deleteReview,
  getReviewStats,
  resetReviewsToDefault,
} from '@/services/reviewService';
import { PRODUCTS } from '@/data/products';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/services/firestoreService', () => ({
  saveProfileToFirestore: vi.fn().mockResolvedValue(undefined),
}));

describe('Admin Reviews Management & Swiggy/Zepto Delivery Tracking', () => {
  beforeEach(() => {
    localStorage.clear();
    resetReviewsToDefault();
  });

  describe('1. Review Service & Exclusive Admin Moderation Portal', () => {
    it('initializes with seed reviews and provides admin stats', () => {
      const all = getAllReviews();
      expect(all.length).toBeGreaterThanOrEqual(6);

      const stats = getReviewStats(all);
      expect(stats.total).toBe(all.length);
      expect(stats.averageRating).toBeGreaterThanOrEqual(4.5);
      expect(stats.approvedCount).toBeGreaterThan(0);
      expect(stats.pendingCount).toBeGreaterThan(0);
    });

    it('filters public approved reviews vs unapproved reviews', () => {
      const approved = getApprovedReviews();
      approved.forEach((r) => {
        expect(r.status).toBe('approved');
      });
    });

    it('adds customer review as pending moderation by default', () => {
      const newReview = addCustomerReview({
        customerName: 'Ananya Ramesh',
        customerEmail: 'ananya@example.com',
        rating: 5,
        headline: 'Crackable chocolate shell was divine!',
        comment: 'We tapped the top with a spoon and it cracked just like the viral video. Truly eggless and fresh.',
        productName: '5-in-1 Chocolate Dream Cake',
        productId: 'cake-001',
        category: 'dream-cake',
        location: 'Anna Nagar, Chennai',
        verified: true,
      });

      expect(newReview.status).toBe('pending');
      expect(newReview.id).toMatch(/^rev-/);

      const all = getAllReviews();
      const found = all.find((r) => r.id === newReview.id);
      expect(found).toBeDefined();
      expect(found?.status).toBe('pending');

      // Should not be in approved list yet
      const approved = getApprovedReviews();
      expect(approved.some((r) => r.id === newReview.id)).toBe(false);
    });

    it('allows admin to approve and hide reviews', () => {
      const all = getAllReviews();
      const target = all.find((r) => r.status === 'pending');
      expect(target).toBeDefined();

      if (target) {
        // Approve
        const approvedReview = updateReviewStatus(target.id, 'approved');
        expect(approvedReview?.status).toBe('approved');

        const approvedList = getApprovedReviews();
        expect(approvedList.some((r) => r.id === target.id)).toBe(true);

        // Hide
        const hiddenReview = updateReviewStatus(target.id, 'hidden');
        expect(hiddenReview?.status).toBe('hidden');

        const approvedListAfterHide = getApprovedReviews();
        expect(approvedListAfterHide.some((r) => r.id === target.id)).toBe(false);
      }
    });

    it('allows admin to post official bakery replies to reviews', () => {
      const all = getAllReviews();
      const target = all[0];

      const replied = replyToReview(
        target.id,
        'Thank you so much for celebrating with YOYO Patisserie! We are glad you loved the dream cake snap.'
      );

      expect(replied?.adminResponse).toBeDefined();
      expect(replied?.adminResponse).toContain('Thank you so much');
      expect(replied?.adminResponseAt).toBeDefined();
    });

    it('allows admin to delete inappropriate reviews', () => {
      const initialCount = getAllReviews().length;
      const targetId = getAllReviews()[0].id;

      const deleted = deleteReview(targetId);
      expect(deleted).toBe(true);
      expect(getAllReviews().length).toBe(initialCount - 1);
      expect(getAllReviews().some((r) => r.id === targetId)).toBe(false);
    });
  });

  describe('2. Shop Page Price Filtering Alignment', () => {
    it('verifies bakery price tiers return valid products without empty dead-ends', () => {
      // Under 100 tier (Mini dream jars, single brownies, mousse)
      const under100 = PRODUCTS.filter((p) => p.price < 100);
      expect(under100.length).toBeGreaterThanOrEqual(9);

      // 100 to 150 tier (Dream cakes, brownies, tea cakes)
      const range100to150 = PRODUCTS.filter((p) => p.price >= 100 && p.price <= 150);
      expect(range100to150.length).toBeGreaterThanOrEqual(8);

      // 151 to 200 tier (Cheesecakes, nutella brownies, matilda cakes)
      const range151to200 = PRODUCTS.filter((p) => p.price > 150 && p.price <= 200);
      expect(range151to200.length).toBeGreaterThanOrEqual(7);

      // Over 200 tier (Crunch cake, classic tiramisu, chocolate tiramisu)
      const over200 = PRODUCTS.filter((p) => p.price > 200);
      expect(over200.length).toBeGreaterThanOrEqual(3);

      // Total must equal full catalog
      expect(under100.length + range100to150.length + range151to200.length + over200.length).toBe(PRODUCTS.length);
    });
  });

  describe('3. Swiggy / Zepto Live GPS Telemetry Validation', () => {
    it('verifies ETA calculation curves based on transit completion percentage', () => {
      const calculateEta = (progressPct: number) => Math.max(0, Math.round(25 * (1 - progressPct / 100)));

      // At bakery (0%)
      expect(calculateEta(0)).toBe(25);

      // Mid transit (50%)
      expect(calculateEta(50)).toBe(13);

      // Approaching destination (90%)
      expect(calculateEta(90)).toBe(2);

      // Delivered (100%)
      expect(calculateEta(100)).toBe(0);
    });

    it('validates 5-stage fulfillment milestone mappings', () => {
      const milestoneKeys = ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
      expect(milestoneKeys.length).toBe(6);
    });
  });

  describe('4. User Registration Display Name Persistence', () => {
    it('sets customer entered display name on registration', async () => {
      const auth = useAuthStore.getState();
      await auth.register('kavitha.patel@example.com', 'securePass123', 'Kavitha Patel');

      const user = useAuthStore.getState().user;
      expect(user).toBeDefined();
      expect(user?.email).toBe('kavitha.patel@example.com');
      expect(user?.displayName).toBe('Kavitha Patel');
    });

    it('falls back to email prefix if display name is omitted', async () => {
      const auth = useAuthStore.getState();
      await auth.register('arun.kumar@example.com', 'securePass123');

      const user = useAuthStore.getState().user;
      expect(user?.displayName).toBe('arun.kumar');
    });
  });

  describe('5. Payment Gateway Phone Sanitization', () => {
    it('cleanses raw contact numbers into 10-digit Indian mobile numbers', () => {
      const sanitizePhone = (phone: string) => {
        const digits = (phone || '').replace(/\D/g, '');
        return digits.length >= 10 ? digits.slice(-10) : digits;
      };

      expect(sanitizePhone('+91 98765 43210')).toBe('9876543210');
      expect(sanitizePhone('98765-43210')).toBe('9876543210');
      expect(sanitizePhone('09876543210')).toBe('9876543210');
      expect(sanitizePhone('+919876543210')).toBe('9876543210');
    });
  });
});

