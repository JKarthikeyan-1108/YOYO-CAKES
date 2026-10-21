import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

admin.initializeApp();
const db = admin.firestore();

// 1. TRUSTED BACKEND OPERATION: ASSIGN ADMIN ROLE
export const setAdminClaim = functions.https.onCall(async (data, context) => {
  // Only existing admins or the designated master bootstrap email can assign admin roles
  const callerUid = context.auth?.uid;
  const callerEmail = context.auth?.token.email;
  const isMasterAdmin = callerEmail === 'admin@yoyocakes.com';
  const hasAdminClaim = context.auth?.token.admin === true;

  if (!context.auth || (!hasAdminClaim && !isMasterAdmin)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only authorized administrators can assign administrative privileges.'
    );
  }

  const { targetUid, isAdmin } = data;
  if (!targetUid) {
    throw new functions.https.HttpsError('invalid-argument', 'targetUid is required.');
  }

  await admin.auth().setCustomUserClaims(targetUid, { admin: Boolean(isAdmin) });

  // Update user document role
  await db.collection('users').doc(targetUid).set(
    {
      role: isAdmin ? 'admin' : 'customer',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { success: true, message: `Admin claim set to ${isAdmin} for ${targetUid}` };
});

// 2. TRUSTED BACKEND OPERATION: CREATE RAZORPAY ORDER WITH PAISE ACCURACY
export const createRazorpayOrder = functions.https.onCall(async (data, context) => {
  const { amountPaise, currency = 'INR', receipt } = data;

  if (!amountPaise || amountPaise <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Valid amount in paise is required.');
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || functions.config().razorpay?.key_id;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || functions.config().razorpay?.key_secret;

  if (!razorpayKeyId || !razorpayKeySecret) {
    // If running in development/demo mode without live Razorpay keys, return a test order
    const testOrderId = `order_test_${Date.now().toString(36)}`;
    return {
      id: testOrderId,
      amount: amountPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      status: 'created',
      mode: 'test_simulation',
    };
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Razorpay API error: ${errBody}`);
    }

    const orderData = await response.json();
    return orderData;
  } catch (error: any) {
    throw new functions.https.HttpsError('internal', error.message || 'Razorpay order creation failed.');
  }
});

// 3. TRUSTED BACKEND OPERATION: VERIFY PAYMENT SIGNATURE
export const verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = data;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required.'
    );
  }

  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || functions.config().razorpay?.key_secret;

  let isValid = false;
  if (!razorpayKeySecret) {
    // In demo environment without configured secret, verify formatted IDs
    isValid = razorpayPaymentId.startsWith('pay_');
  } else {
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    isValid = generatedSignature === razorpaySignature;
  }

  if (!isValid) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid payment signature.');
  }

  // Update order in Firestore
  if (orderId) {
    await db.collection('orders').doc(orderId).set(
      {
        paymentStatus: 'paid',
        orderStatus: 'confirmed',
        razorpayOrderId,
        razorpayPaymentId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Save payment document
    await db.collection('payments').doc(`pay-${orderId}`).set({
      id: `pay-${orderId}`,
      orderId,
      userId: context.auth?.uid || null,
      razorpayOrderId,
      razorpayPaymentId,
      status: 'captured',
      currency: 'INR',
      createdAt: new Date().toISOString(),
    });
  }

  return { verified: true, orderId };
});

// 4. TRUSTED BACKEND OPERATION: SERVER-SIDE COUPON VALIDATION
export const validateCoupon = functions.https.onCall(async (data, context) => {
  const { code, orderAmount } = data;
  if (!code) {
    throw new functions.https.HttpsError('invalid-argument', 'Coupon code is required.');
  }

  const normalized = code.trim().toUpperCase();
  const snap = await db
    .collection('coupons')
    .where('code', '==', normalized)
    .where('active', '==', true)
    .limit(1)
    .get();

  if (snap.empty) {
    return { valid: false, message: 'Invalid or inactive coupon code.' };
  }

  const coupon = snap.docs[0].data();
  if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${coupon.minOrderAmount} required.`,
    };
  }

  let discount = Math.round((orderAmount * coupon.discountPercentage) / 100);
  if (coupon.maxDiscount && discount > coupon.maxDiscount) {
    discount = coupon.maxDiscount;
  }

  return {
    valid: true,
    code: normalized,
    discount,
    discountPercentage: coupon.discountPercentage,
    message: `${coupon.discountPercentage}% discount applied successfully.`,
  };
});

// 5. FIRESTORE TRIGGER: AUDIT ORDER STATUS CHANGES
export const onOrderStatusChanged = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    if (beforeData.orderStatus !== afterData.orderStatus) {
      const orderId = context.params.orderId;
      const historyId = `hist-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      await db.collection('orderStatusHistory').doc(historyId).set({
        id: historyId,
        orderId,
        userId: afterData.userId || null,
        status: afterData.orderStatus,
        previousStatus: beforeData.orderStatus,
        notes: `Status transitioned from ${beforeData.orderStatus} to ${afterData.orderStatus}`,
        updatedBy: 'system-trigger',
        timestamp: new Date().toISOString(),
      });
    }
  });
