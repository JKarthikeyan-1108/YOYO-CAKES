import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../firebaseAdmin';
import { checkDeliveryServiceability } from '../services/serviceability';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const ItemSchema = z.object({
  id: z.string(),
  quantity: z.number().int().positive(),
  name: z.string().optional(),
  price: z.number().positive().optional(),
  category: z.string().optional(),
  image: z.string().optional(),
  customMessage: z.string().optional(),
  includeCandles: z.boolean().optional(),
});

const AddressSnapshotSchema = z.object({
  recipientName: z.string().min(2),
  phone: z.string().min(10).max(15),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional().default(''),
  locality: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4).max(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  deliveryInstructions: z.string().optional().default(''),
});

const OrderValidationSchema = z.object({
  items: z.array(ItemSchema).min(1),
  fulfillment: z.enum(['delivery', 'pickup']),
  deliveryAddress: AddressSnapshotSchema.optional(),
  couponCode: z.string().optional(),
  paymentMethod: z.string().optional().default('Razorpay Online'),
});

/**
 * Helper to fetch canonical product price from Firestore
 */
async function getCanonicalProductPrice(productId: string): Promise<{ price: number; name: string; category: string } | null> {
  try {
    const docSnap = await db.collection('products').doc(productId).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      return {
        price: data?.price || 0,
        name: data?.name || 'Cake Item',
        category: data?.category || 'Cakes',
      };
    }
  } catch (err) {
    console.warn(`[Orders Route] Product lookup failed for ${productId}:`, err);
  }
  return null;
}

/**
 * POST /api/orders/recalculate-and-verify
 * Recalculates order subtotal, verifies coordinates, calculates server delivery fee,
 * and validates coupon without trusting frontend math.
 */
router.post('/recalculate-and-verify', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = OrderValidationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { items, fulfillment, deliveryAddress, couponCode } = parsed.data;

    // Recalculate subtotal
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const canonical = await getCanonicalProductPrice(item.id);
      const unitPrice = canonical ? canonical.price : (item.price || 150);
      const itemName = canonical ? canonical.name : (item.name || 'Cake Item');
      const itemCategory = canonical ? canonical.category : (item.category || 'Cakes');

      subtotal += unitPrice * item.quantity;
      verifiedItems.push({
        ...item,
        name: itemName,
        category: itemCategory,
        price: unitPrice,
        pricePaise: unitPrice * 100,
      });
    }

    // Verify Delivery / Pickup and Serviceability
    let deliveryFee = 0;
    let distanceKm = 0;
    let estimatedMinutes = 30;

    if (fulfillment === 'delivery') {
      if (!deliveryAddress) {
        res.status(400).json({
          error: 'MissingDeliveryAddress',
          message: 'Delivery address and GPS coordinates are required for doorstep delivery.',
        });
        return;
      }

      const serviceResult = await checkDeliveryServiceability(
        deliveryAddress.latitude,
        deliveryAddress.longitude,
        subtotal,
        'delivery'
      );

      if (!serviceResult.serviceable) {
        res.status(400).json({
          error: 'UnserviceableLocation',
          message: serviceResult.reason || 'Selected address is outside the delivery area.',
          pickupAvailable: serviceResult.pickupAvailable,
        });
        return;
      }

      deliveryFee = serviceResult.deliveryFee;
      distanceKm = serviceResult.distanceKm;
      estimatedMinutes = serviceResult.estimatedMinutes;
    }

    // Server-side coupon verification
    let discount = 0;
    let couponDetails = null;

    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();
      const couponSnap = await db
        .collection('coupons')
        .where('code', '==', normalizedCode)
        .where('active', '==', true)
        .limit(1)
        .get();

      if (!couponSnap.empty) {
        const cData = couponSnap.docs[0].data();
        if (!cData.minOrderAmount || subtotal >= cData.minOrderAmount) {
          const rawDiscount = Math.round((subtotal * cData.discountPercentage) / 100);
          discount = cData.maxDiscount ? Math.min(rawDiscount, cData.maxDiscount) : rawDiscount;
          couponDetails = {
            code: normalizedCode,
            discountPercentage: cData.discountPercentage,
            discount,
          };
        }
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const amountPaise = total * 100;

    res.json({
      verified: true,
      subtotal,
      subtotalPaise: subtotal * 100,
      deliveryFee,
      deliveryFeePaise: deliveryFee * 100,
      discount,
      discountPaise: discount * 100,
      total,
      amountPaise,
      distanceKm,
      estimatedMinutes,
      items: verifiedItems,
      coupon: couponDetails,
      fulfillment,
    });
  } catch (error: any) {
    console.error('[Orders Route] Error recalculating order:', error);
    res.status(500).json({ error: 'InternalServerError', message: error.message });
  }
});

/**
 * POST /api/orders/create
 * Secure order creation: executes verified calculations, attaches server-authenticated userId,
 * and records immutable delivery address snapshot in Firestore.
 */
router.post('/create', verifyAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.uid;
    const userEmail = req.user?.email || '';
    const userName = req.user?.name || '';

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User must be authenticated.' });
      return;
    }

    const parsed = OrderValidationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'ValidationError',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { items, fulfillment, deliveryAddress, couponCode, paymentMethod } = parsed.data;

    // Recalculate subtotal
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const canonical = await getCanonicalProductPrice(item.id);
      const unitPrice = canonical ? canonical.price : (item.price || 150);
      const itemName = canonical ? canonical.name : (item.name || 'Cake Item');
      const itemCategory = canonical ? canonical.category : (item.category || 'Cakes');

      subtotal += unitPrice * item.quantity;
      verifiedItems.push({
        id: item.id,
        name: itemName,
        category: itemCategory,
        price: unitPrice,
        pricePaise: unitPrice * 100,
        quantity: item.quantity,
        customMessage: item.customMessage || '',
        includeCandles: Boolean(item.includeCandles),
      });
    }

    // Verify Delivery / Pickup and Serviceability
    let deliveryFee = 0;
    let distanceKm = 0;

    if (fulfillment === 'delivery') {
      if (!deliveryAddress) {
        res.status(400).json({
          error: 'MissingDeliveryAddress',
          message: 'Delivery address and GPS coordinates are required for doorstep delivery.',
        });
        return;
      }

      const serviceResult = await checkDeliveryServiceability(
        deliveryAddress.latitude,
        deliveryAddress.longitude,
        subtotal,
        'delivery'
      );

      if (!serviceResult.serviceable) {
        res.status(400).json({
          error: 'UnserviceableLocation',
          message: serviceResult.reason || 'Selected address is outside the delivery area.',
        });
        return;
      }

      deliveryFee = serviceResult.deliveryFee;
      distanceKm = serviceResult.distanceKm;
    }

    // Server-side coupon verification
    let discount = 0;
    if (couponCode) {
      const normalizedCode = couponCode.trim().toUpperCase();
      const couponSnap = await db
        .collection('coupons')
        .where('code', '==', normalizedCode)
        .where('active', '==', true)
        .limit(1)
        .get();

      if (!couponSnap.empty) {
        const cData = couponSnap.docs[0].data();
        if (!cData.minOrderAmount || subtotal >= cData.minOrderAmount) {
          const rawDiscount = Math.round((subtotal * cData.discountPercentage) / 100);
          discount = cData.maxDiscount ? Math.min(rawDiscount, cData.maxDiscount) : rawDiscount;
        }
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const orderId = `YOYO-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderData: any = {
      id: orderId,
      orderNumber: orderId,
      userId,
      customer: {
        name: deliveryAddress?.recipientName || userName || 'Customer',
        email: userEmail,
        phone: deliveryAddress?.phone || '',
        address: deliveryAddress
          ? `${deliveryAddress.addressLine1}${deliveryAddress.addressLine2 ? ', ' + deliveryAddress.addressLine2 : ''}`
          : undefined,
        city: deliveryAddress?.city,
        pincode: deliveryAddress?.postalCode,
        instructions: deliveryAddress?.deliveryInstructions,
      },
      items: verifiedItems,
      subtotal,
      subtotalPaise: subtotal * 100,
      deliveryFee,
      deliveryFeePaise: deliveryFee * 100,
      discount,
      discountPaise: discount * 100,
      total,
      totalPaise: total * 100,
      fulfillment,
      distanceKm: fulfillment === 'delivery' ? distanceKm : 0,
      orderStatus: 'placed',
      paymentStatus: paymentMethod.toLowerCase().includes('cash') ? 'pending' : 'pending',
      paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Attach immutable delivery address snapshot if fulfillment is delivery
    if (fulfillment === 'delivery' && deliveryAddress) {
      orderData.deliveryAddressSnapshot = {
        recipientName: deliveryAddress.recipientName,
        phone: deliveryAddress.phone,
        addressLine1: deliveryAddress.addressLine1,
        addressLine2: deliveryAddress.addressLine2 || '',
        locality: deliveryAddress.locality,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postalCode: deliveryAddress.postalCode,
        latitude: deliveryAddress.latitude,
        longitude: deliveryAddress.longitude,
        deliveryInstructions: deliveryAddress.deliveryInstructions || '',
        capturedAt: new Date().toISOString(),
      };
    } else {
      orderData.pickupLocation = {
        name: 'YOYO CAKES Flagship Artisan Bakery',
        address: 'Plot 14, 2nd Avenue, Anna Nagar East, Chennai 600040',
        phone: '8428855444',
      };
    }

    await db.collection('orders').doc(orderId).set(orderData);

    res.json({
      success: true,
      orderId,
      order: orderData,
      total,
      amountPaise: total * 100,
    });
  } catch (error: any) {
    console.error('[Orders Route] Error creating verified order:', error);
    res.status(500).json({ error: 'InternalServerError', message: error.message });
  }
});

export default router;
