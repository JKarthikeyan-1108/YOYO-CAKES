import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Package, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
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
      pathname.startsWith('/track') ||
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
  const user = useAuthStore((s) => s.user);

  // Hide on admin routes and focused checkout funnel to avoid obscuring place-order buttons
  if (location.pathname.startsWith('/admin') || location.pathname === '/checkout') {
    return null;
  }

  return (
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
  );
}
