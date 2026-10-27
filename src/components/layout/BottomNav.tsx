import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Package, User, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { formatPrice } from '@/data/products';
import { triggerHaptic } from '@/services/mobileService';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  match: (pathname: string, search: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Home',
    icon: Home,
    match: (pathname) => pathname === '/',
  },
  {
    to: '/shop',
    label: 'Search',
    icon: Search,
    match: (pathname) => pathname === '/shop' || pathname.startsWith('/product/'),
  },
  {
    to: '/orders',
    label: 'Orders',
    icon: Package,
    match: (pathname, search) =>
      pathname === '/orders' ||
      (pathname === '/account' && (search.includes('tab=orders') || !search.includes('tab='))),
  },
  {
    to: '/account?tab=profile',
    label: 'Profile',
    icon: User,
    match: (pathname, search) =>
      pathname === '/account' && (search.includes('tab=profile') || search.includes('tab=settings') || search.includes('tab=addresses')),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const cartCount = useCartStore((s) => s.getItemCount());
  const subtotal = useCartStore((s) => s.getSubtotal());
  const user = useAuthStore((s) => s.user);

  // Hide on admin routes and focused checkout funnel to avoid obscuring place-order buttons
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  const showFloatingCart = cartCount > 0 && location.pathname !== '/cart';

  return (
    <>
      {/* Dedicated Floating Quick-Cart Action Bar (Swiggy/Zomato style) */}
      {showFloatingCart && (
        <aside
          aria-label="Active cart summary"
          className="lg:hidden fixed left-3 right-3 z-40 animate-slide-up max-w-lg mx-auto"
          style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <Link
            to="/cart"
            className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-[var(--color-brand-primary-dark)] text-white shadow-xl hover:bg-[var(--color-brand-chocolate)] transition-all border border-amber-800/20 active:scale-[0.99]"
            aria-label={`View cart with ${cartCount} items, total ${formatPrice(subtotal)}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/15">
                <ShoppingCart size={16} className="text-white" />
                <span className="absolute -top-1 -right-1 bg-white text-[var(--color-brand-primary-dark)] text-[10px] font-black rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              </div>
              <div className="truncate">
                <p className="text-xs font-bold leading-tight truncate">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
                </p>
                <p className="text-[11px] font-extrabold text-[var(--color-brand-cream-light)] leading-tight">
                  Subtotal: {formatPrice(subtotal)}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-extrabold tracking-wide bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl flex-shrink-0 transition-colors">
              View Cart <ArrowRight size={13} />
            </span>
          </Link>
        </aside>
      )}

      {/* Primary Mobile Bottom Navigation */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-brand-surface)] border-t border-[var(--color-brand-border)] shadow-[0_-2px_10px_rgba(0,0,0,0.06)] transition-colors"
        aria-label="Mobile navigation"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, match }) => {
            const active = match(location.pathname, location.search);
            // If user is not logged in and taps profile/orders, deep link to login with return redirect
            const href =
              !user && (label === 'Profile' || label === 'Orders')
                ? `/login?redirect=${encodeURIComponent(to)}`
                : to;

            return (
              <Link
                key={label}
                to={href}
                onClick={() => triggerHaptic('light')}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all relative min-h-[44px] active:scale-95 ${
                  active
                    ? 'text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]'
                    : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
                }`}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 2}
                    className={active ? 'text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)]' : ''}
                  />
                </div>
                <span
                  className={`text-[10px] leading-tight ${
                    active ? 'font-bold' : 'font-medium'
                  }`}
                >
                  {label}
                </span>
                {/* Active indicator bar */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[var(--color-brand-primary-dark)] dark:bg-[var(--color-brand-primary)] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
