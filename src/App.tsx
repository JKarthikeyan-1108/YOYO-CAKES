import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';

// Layouts & Boundary
import Layout from '@/components/layout/Layout';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

// Customer Pages (Lazy loaded for optimal bundle size and page load speed)
const HomePage = lazy(() => import('@/pages/HomePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));
const WishlistPage = lazy(() => import('@/pages/WishlistPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const AccountPage = lazy(() => import('@/pages/AccountPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const PolicyPage = lazy(() => import('@/pages/PolicyPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Admin Pages (Code-split so regular customers never download admin code)
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'));

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[var(--color-brand-cream)]">
      <div className="w-10 h-10 border-3 border-[var(--color-brand-primary-light)] border-t-[var(--color-brand-primary-dark)] rounded-full animate-spin mb-4" />
      <span className="font-heading text-sm text-[var(--color-brand-chocolate)] font-medium tracking-wide">
        YOYO CAKES
      </span>
    </div>
  );
}

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
      return () => unsubscribe();
    } else {
      // Set initialized when running in demo/offline mode
      useAuthStore.setState({ initialized: true, loading: false });
    }
  }, [setUser]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Customer Storefront Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order/:id" element={<OrderConfirmationPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/privacy-policy" element={<PolicyPage />} />
              <Route path="/terms" element={<PolicyPage />} />
              <Route path="/shipping-policy" element={<PolicyPage />} />
              <Route path="/cancellation-policy" element={<PolicyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Portal Authentication Route */}
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Protected / Admin Portal Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
        <SpeedInsights />
        <Analytics />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
