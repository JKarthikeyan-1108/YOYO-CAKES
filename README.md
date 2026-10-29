# 🎂 YOYO CAKES — E-Commerce Platform

> **"Every bite, a little happiness."**

A complete, production-grade business e-commerce platform built for **YOYO CAKES**, an artisanal bakery specializing in handcrafted cakes, brownies, tiramisu, tea cakes, cookie pies, and mini jar cakes.

---

## 📋 Business Overview

- **Business Name**: YOYO CAKES
- **Tagline**: Every bite, a little happiness.
- **Currency**: Indian Rupee (₹ / INR)
- **Brand Colors**:
  - Primary Accent: `#C9A184` (Warm Caramel Gold)
  - Secondary / Heading: `#7F5643` (Rich Chocolate)
  - Dark Brown: `#3D2417`
  - Cream Background: `#FFF8F0`
- **Customer Contact Hotlines**:
  - `+91 84288 55444`
  - `+91 63796 03744`
- **Support Email**: `hello@yoyocakes.in`
- **Fulfillment**: Fresh Kitchen Counter Pickup (Anna Nagar Central Kitchen, T. Nagar Hub, Coimbatore Counter)
- **Pickup Cost**: 100% Complimentary (₹0) across all slots

---

## 🍰 Exact Product Catalog (27 Signature Items)

### 1. Cakes
1. **Dream Cake** — ₹150
2. **Matilda Cake** — ₹200
3. **Oreo Cake** — ₹200
4. **Crunch Cake** — ₹250
5. **Puddle Cake** — ₹199
6. **Japanese Cotton Cheese Cake with Triple Chocolate** — ₹160

### 2. Tiramisu and Desserts
7. **Classic Tiramisu** — ₹250
8. **Chocolate Tiramisu** — ₹300
9. **Triple Chocolate Mousse** — ₹99

### 3. Brownies
10. **Brownie** — ₹50
11. **Nuts Brownie** — ₹90
12. **Brownie Bites with Dark Chocolate Dip** — ₹100
13. **Lava Brownie** — ₹100
14. **Triple Chocolate Brownie** — ₹150
15. **Nutella Brownie** — ₹180
16. **Pista Brownie** — ₹180
17. **Biscoff Brownie** — ₹80
18. **Gunaffa Brownie** — ₹100
19. **Assorted Brownie** — ₹199

### 4. Tea Cakes and Pies
20. **Plain Tea Cake** — ₹100
21. **Marble Tea Cake** — ₹120
22. **Cookie Pie** — ₹150

### 5. Mini Jar Cakes
23. **Black Forest** — ₹50
24. **Black Current** — ₹50
25. **Butterscotch** — ₹50
26. **Strawberry** — ₹50
27. **Mango** — ₹50

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, React Router 7
- **State Management**: Zustand with persistent storage (`cartStore`, `wishlistStore`, `authStore`)
- **Backend & Database**: Firebase Authentication (Email/Password, Google OAuth), Cloud Firestore, Firebase Storage
- **Payments**: Razorpay Checkout SDK with test mode and verified callback lifecycle
- **Analytics & Admin**: Recharts for real-time sales trend visualizations
- **Testing**: Vitest with `@testing-library/jest-dom` and `jsdom`

---

## 🚀 Getting Started

### 1. Installation

```bash
# Clone or open workspace
cd YOYO

# Install dependencies
npm install
```

### 2. Environment Variables

Create `.env` in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your configuration:
```env
# Firebase Web Client (from Firebase Console -> Project Settings)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_APP_ID=your_app_id

# Razorpay Test Key ID (from Razorpay Dashboard -> API Keys)
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

> **Note**: In local development without `.env` credentials, the app gracefully operates in full demo mode with offline persistence and mock payment verification.

### 3. Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### 4. Run Automated Tests

```bash
# Run unit & calculation test suite
npm run test
```

### 5. Build for Production

```bash
# Compile and build production bundle
npm run build
```

---

## 📱 Application Routes

### Customer Storefront
- `/` — Homepage (Hero, Bestsellers, Brownies, Mini Jar cakes, Why Choose Us, Reviews, Hotline)
- `/shop` — Shop catalog (27 products, search, category pills, sorting, quick view, add to cart)
- `/product/:id` — Product Detail (image preview, ingredient notice, quantity selector, tabs)
- `/cart` — Cart & Checkout summary (quantity updates, coupon `YOYO10`, free kitchen pickup indicator)
- `/checkout` — Checkout (Kitchen Counter selector, batch date/time slots, free cake message card, Pay at Counter / Razorpay)
- `/order/:id` — Real-time Order Confirmation & Kitchen Pickup Status timeline
- `/wishlist` — Saved customer favorites
- `/account` — Profile overview, order history, and saved address coordinates
- `/login` & `/register` — Authentication with clean email/password flow
- `/about` — The YOYO Story, artisanal baking techniques, quality values
- `/contact` — Phone hotlines (+91 84288 55444 / +91 63796 03744), WhatsApp Head Chef button & inquiry form
- `/faq` — Categorized bakery FAQs
- `/privacy-policy`, `/terms`, `/pickup-policy`, `/cancellation-policy` — Business policies

### Admin Management Portal (`/admin`)
- `/admin` — KPI metrics (Revenue, orders, pending, kitchen batches, low stock alerts, Recharts sales trends)
- `/admin/products` — Catalog table, stock counter adjustments, price edits, add new dessert
- `/admin/orders` — Kitchen order processing, step-by-step status transitions (Placed → Confirmed → Baking → Ready at Counter → Collected)
- `/admin/settings` — Business contact numbers, kitchen counter addresses, and 1-click Firestore database sync

---

## 🗄️ Cloud Firestore Architecture (11 Collections)

Cloud Firestore is configured as the **sole application database** for YOYO CAKES (Project ID: `yoyo-c46c3`). No external SQL, MongoDB, or Prisma databases are used.

### Schema & Collections:

1. **`users`** — Customer & Admin profiles (`uid`, `email`, `displayName`, `photoURL`, `phoneNumber`, `role`, timestamps).
2. **`userSettings`** — Preferences (`userId`, `theme: cream|dark|system`, `emailNotifications`, `orderUpdates`, `smsAlerts`).
3. **`addresses`** — Saved customer delivery addresses (`id`, `userId`, `name`, `phone`, `addressLine`, `city`, `pincode`, `isDefault`).
4. **`categories`** — Bakery categories (`id`, `name`, `slug`, `description`, `image`).
5. **`products`** — All 27 signature bakery items with integer paise (`pricePaise = price * 100`), stock counts, categories, tags.
6. **`carts`** — Persistent customer carts synchronized across sessions (`userId`, `items: [{ productId, quantity, snapshot }]`).
7. **`wishlists`** — Persistent customer wishlists (`userId`, `productIds: []`).
8. **`orders`** — Historical and active orders (`id`, `orderNumber`, `userId`, `customer`, `items`, `subtotalPaise`, `deliveryFeePaise`, `discountPaise`, `totalPaise`, `orderStatus`, `paymentStatus`, `fulfillment`, `razorpayOrderId`, `razorpayPaymentId`).
9. **`payments`** — Payment audit logs (`id`, `orderId`, `userId`, `amountPaise`, `currency: INR`, `razorpayPaymentId`, `status: captured`).
10. **`coupons`** — Discount codes (`id`, `code`, `discountPercentage`, `maxDiscount`, `minOrderAmount`, `active`).
11. **`orderStatusHistory`** — Status audit log (`id`, `orderId`, `userId`, `status`, `notes`, `updatedBy`, `timestamp`).

---

## 🔒 Security Rules & Trusted Operations

### Firestore Rules (`firestore.rules`)
- **Customer Privacy**: Users can read and write only their own records in `users`, `userSettings`, `addresses`, `carts`, `wishlists`, and `orders`.
- **Admin Isolation**: Role escalation is strictly prohibited. Customers cannot grant themselves admin roles or alter order statuses.
- **Public Catalog**: Products and categories are publicly readable; only administrators can create, update, or delete items.

### Storage Rules (`storage.rules`)
- Validates image MIME types (`image/*`).
- Product images: Admin-only uploads, maximum 5MB.
- Customer avatar/profile images: Authenticated owner only, maximum 2MB.

### Trusted Cloud Functions (`functions/src/index.ts`)
- **`createRazorpayOrder`**: Generates Razorpay orders with integer paise validation without exposing backend secrets.
- **`verifyRazorpayPayment`**: Computes HMAC SHA256 signature verification server-side using `RAZORPAY_KEY_SECRET`.
- **`setAdminClaim`**: Grants custom Firebase Auth admin claims (`{ admin: true }`).
- **`validateCoupon`**: Validates coupons against Firestore `coupons` collection.
- **`onOrderStatusChanged`**: Automatic background trigger auditing all order transitions into `orderStatusHistory`.

---

## ⚡ Firebase CLI & Deployment Guide

### 1. Authenticate & Select Project

```bash
# Login to Firebase
firebase login

# Set active project
firebase use yoyo-c46c3
```

### 2. Deploy Firestore Rules & Indexes

```bash
# Deploy security rules and compound indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### 3. Deploy Storage Rules

```bash
# Deploy storage security rules
firebase deploy --only storage
```

### 4. Deploy Cloud Functions

```bash
# Deploy trusted backend functions
firebase deploy --only functions
```

### 5. Build & Deploy Frontend

```bash
# Build frontend with Vite
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

*(Alternatively, deploy the frontend to Vercel and deploy rules/functions to Firebase separately).*

---

## 📌 Manual Firebase Console Checklist

Complete these one-time steps in the [Firebase Console](https://console.firebase.google.com/project/yoyo-c46c3):

1. **Authentication**:
   - Go to **Build > Authentication > Sign-in method**.
   - Enable **Email/Password**.
   - Enable **Google** (add support email).
2. **Cloud Firestore**:
   - Go to **Build > Firestore Database**.
   - Ensure the database is created in **Native mode**.
   - Location: Default region (e.g., `asia-south1` or `us-central1`).
3. **Firebase Storage**:
   - Go to **Build > Storage**.
   - Ensure bucket `yoyo-c46c3.firebasestorage.app` is enabled.
4. **Environment Variables**:
   - Go to **Project Settings > General > Your apps > Web app**.
   - Copy `apiKey` and `appId` into `.env` as `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_APP_ID`.
5. **Initial Data Seeding**:
   - In the YOYO CAKES Admin Portal (`/admin/settings`), click **"Sync 27 Items to Firestore"** to automatically populate all products, categories, and initial coupons into Cloud Firestore.

---

© 2026 YOYO CAKES. Every bite, a little happiness.
