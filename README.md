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
- **Fulfillment**: Local City Delivery & Bakery Kitchen Pickup
- **Free Delivery**: Complimentary on orders above ₹500 (Standard ₹40 fee otherwise)

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
- `/cart` — Cart & Checkout summary (quantity updates, coupon `YOYO10`, free delivery indicator)
- `/checkout` — Checkout (Local delivery vs Store pickup toggle, address form, Razorpay checkout)
- `/order/:id` — Real-time Order Confirmation & Status Tracking timeline
- `/wishlist` — Saved customer favorites
- `/account` — Profile overview, order history, and saved addresses
- `/login` & `/register` — Authentication with Google OAuth option & verification
- `/about` — The YOYO Story, artisanal baking techniques, quality values
- `/contact` — Phone hotlines (+91 84288 55444 / +91 63796 03744) & inquiry form
- `/faq` — Categorized bakery FAQs
- `/privacy-policy`, `/terms`, `/shipping-policy`, `/cancellation-policy` — Business policies

### Admin Management Portal (`/admin`)
- `/admin` — KPI metrics (Revenue, orders, pending, delivered, low stock alerts, Recharts sales trends)
- `/admin/products` — Catalog table, stock counter adjustments, price edits, add new dessert
- `/admin/orders` — Kitchen order processing, step-by-step status transitions (Placed → Confirmed → Baking → Ready → Out for Delivery → Delivered)
- `/admin/settings` — Business contact numbers, pickup address, delivery fee rules, and 1-click Firestore database sync

---

## 🔒 Firebase Security Rules & Admin Provisioning

### Firestore Rules (`firestore.rules`)
- **Products & Categories**: Public read; write restricted to authenticated admins (`token.admin == true`).
- **Orders**: Customers can read only their own orders (`customer.email == request.auth.token.email`); admins can read and update all orders.
- **Profiles**: Customers can update personal details, but cannot alter `role` or `admin` claims.

### Admin Provisioning
To grant administrator access to a user email in production, set a custom claim via Firebase Admin SDK script:

```javascript
// admin-provision.js (Node.js server with firebase-admin)
const admin = require('firebase-admin');
admin.initializeApp();

async function makeAdmin(email) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`Admin claim granted to ${email}`);
}

makeAdmin('admin@yoyocakes.in');
```

---

## 💳 Razorpay Payment Lifecycle

1. Customer proceeds to checkout and selects Delivery or Pickup.
2. Orders above ₹500 receive automatic free delivery (₹40 applied for smaller orders).
3. The order triggers Razorpay Checkout with the computed amount in paise.
4. On payment completion, the verified `razorpay_payment_id` is recorded and the order status is updated to `confirmed` and `paid`.
5. Order data is persisted locally and synchronized to Cloud Firestore.
6. The customer is redirected to their live tracking page (`/order/:id`).

---

## 🚢 Deployment

### Deploying Frontend to Vercel
1. Push the repository to GitHub.
2. Import project into [Vercel](https://vercel.com).
3. Framework preset: **Vite**.
4. Configure environment variables (`VITE_FIREBASE_*`, `VITE_RAZORPAY_KEY_ID`).
5. Click **Deploy**.

© 2026 YOYO CAKES. Every bite, a little happiness.
