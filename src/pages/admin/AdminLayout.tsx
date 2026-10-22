import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Settings, ArrowLeft, ShieldCheck, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import BrandLogo from '@/components/common/BrandLogo';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuthStore();

  // Guard: if not authenticated as admin, redirect to Admin login portal
  if (!isAdmin) {
    return <Navigate to="/login?admin=true" state={{ from: location }} replace />;
  }

  const handleSignOut = async () => {
    await logout();
    toast.success('Signed out of Administrator Portal');
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products & Stock', icon: ShoppingBag },
    { to: '/admin/orders', label: 'Orders & Fulfillment', icon: ShoppingCart },
    { to: '/admin/settings', label: 'Business Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full lg:w-64 bg-[var(--color-brand-chocolate)] text-white flex-shrink-0 flex flex-col justify-between p-6">
        <div>
          {/* Brand */}
          <div className="mb-8 pb-6 border-b border-white/10">
            <BrandLogo variant="white" size="md" />
            <span className="text-[10px] font-mono tracking-widest text-amber-200/60 uppercase block mt-1">
              Admin Portal
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-chocolate)] font-bold shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          <div className="bg-white/5 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2 text-white/90 font-medium mb-1">
              <ShieldCheck size={14} className="text-[var(--color-brand-primary)]" />
              <span>Admin Access Active</span>
            </div>
            <p className="text-[11px] text-white/70 truncate font-mono">
              {user?.email || 'admin@yoyocakes.com'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-500/20 text-red-200 hover:bg-red-500/30 hover:text-white transition-colors"
          >
            <LogOut size={14} /> Sign Out of Admin
          </button>

          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
