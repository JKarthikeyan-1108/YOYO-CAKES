import { Router, Request, Response } from 'express';
import { z } from 'zod';
import {
  getDeliverySettings,
  updateDeliverySettings,
  checkDeliveryServiceability,
} from '../services/serviceability';
import { verifyAuth, requireAdmin, optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Validation schema for checking serviceability
const CheckServiceabilitySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  subtotal: z.number().nonnegative().optional().default(0),
  fulfillment: z.enum(['delivery', 'pickup']).optional().default('delivery'),
});

// Validation schema for updating delivery settings
const UpdateSettingsSchema = z.object({
  storeName: z.string().min(2).optional(),
  storeAddress: z.string().min(5).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  maxRadiusKm: z.number().positive().max(100).optional(),
  minOrderValue: z.number().nonnegative().optional(),
  freeDeliveryThreshold: z.number().nonnegative().optional(),
  baseDeliveryFee: z.number().nonnegative().optional(),
  baseRadiusKm: z.number().positive().optional(),
  ratePerKmBeyondBase: z.number().nonnegative().optional(),
  deliveryEnabled: z.boolean().optional(),
  pickupEnabled: z.boolean().optional(),
  pickupAddress: z.string().min(5).optional(),
  pickupInstructions: z.string().optional(),
});

/**
 * GET /api/delivery/settings
 * Fetch current store location, delivery radius, and fee rules
 */
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getDeliverySettings();
    res.json(settings);
  } catch (error: any) {
    console.error('[Delivery Routes] Error getting settings:', error);
    res.status(500).json({ error: 'InternalServerError', message: error.message });
  }
});

/**
 * POST /api/delivery/settings
 * Update delivery settings in Firestore (Restricted to Authorized Admins)
 */
router.post('/settings', verifyAuth, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = UpdateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const updated = await updateDeliverySettings(parsed.data, req.user?.uid);
    res.json({
      success: true,
      message: 'Delivery settings updated successfully in Firestore.',
      settings: updated,
    });
  } catch (error: any) {
    console.error('[Delivery Routes] Error updating settings:', error);
    res.status(500).json({ error: 'InternalServerError', message: error.message });
  }
});

/**
 * POST /api/delivery/check-serviceability
 * Validates coordinates, calculates road distance and authoritative delivery fee
 */
router.post('/check-serviceability', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = CheckServiceabilitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Invalid coordinate parameters. Latitude and Longitude are required.',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { latitude, longitude, subtotal, fulfillment } = parsed.data;
    const result = await checkDeliveryServiceability(latitude, longitude, subtotal, fulfillment);
    res.json(result);
  } catch (error: any) {
    console.error('[Delivery Routes] Serviceability check error:', error);
    res.status(500).json({ error: 'InternalServerError', message: error.message });
  }
});

/**
 * POST /api/delivery/reverse-geocode
 * Reverse geocodes coordinates to street, locality, city, state, postal code
 */
router.post('/reverse-geocode', optionalAuth, async (req: Request, res: Response) => {
  const { latitude, longitude } = req.body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    res.status(400).json({ error: 'ValidationError', message: 'Valid latitude and longitude required.' });
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const first = data.results[0];
          let postalCode = '';
          let city = '';
          let locality = '';
          let state = '';
          let street = '';

          for (const comp of first.address_components) {
            if (comp.types.includes('postal_code')) postalCode = comp.long_name;
            if (comp.types.includes('locality')) city = comp.long_name;
            if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) locality = comp.long_name;
            if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
            if (comp.types.includes('route') || comp.types.includes('street_number')) {
              street += (street ? ' ' : '') + comp.long_name;
            }
          }

          res.json({
            formattedAddress: first.formatted_address,
            street,
            locality: locality || city,
            city: city || 'Chennai',
            state: state || 'Tamil Nadu',
            postalCode,
            latitude,
            longitude,
          });
          return;
        }
      }
    } catch (err) {
      console.warn('[Geocoding API] Server reverse-geocoding failed, falling back:', err);
    }
  }

  // Graceful fallback response if Google Maps API key is not configured on server
  res.json({
    formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}, Chennai, Tamil Nadu`,
    street: '',
    locality: 'Selected Location',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600001',
    latitude,
    longitude,
  });
});

export default router;
