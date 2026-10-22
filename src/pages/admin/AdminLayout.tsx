import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Settings,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import BrandLogo from '@/components/common/BrandLogo';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Guard: not authenticated as admin
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
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-white/10">
        <BrandLogo variant="white" size="md" />
        <span className="text-[10px] font-mono tracking-widest text-amber-200/60 uppercase block mt-1">
          Admin Portal
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1" aria-label="Admin navigation">
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
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-brand-primary)] text-[var(--color-brand-chocolate)] font-bold shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-6 border-t border-white/10 space-y-3">
        <div className="bg-white/5 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2 text-white/90 font-medium mb-1">
            <ShieldCheck size={14} className="text-[var(--color-brand-primary)]" aria-hidden="true" />
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
          <LogOut size={14} aria-hidden="true" /> Sign Out of Admin
        </button>

        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to Storefront
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* === MOBILE HEADER === */}
      <header className="lg:hidden sticky top-0 z-40 bg-[var(--color-brand-chocolate)] text-white flex items-center justify-between px-4 py-3 shadow-lg">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open admin navigation"
          aria-expanded={sidebarOpen}
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-amber-400" />
          <span className="text-sm font-bold">Admin Portal</span>
        </div>

        <Link
          to="/"
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Back to storefront"
        >
          <ArrowLeft size={20} />
        </Link>
      </header>

      {/* === MOBILE SIDEBAR OVERLAY === */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[90] bg-black/60"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* === MOBILE SIDEBAR DRAWER === */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin Navigation"
        className={`lg:hidden fixed top-0 left-0 h-full w-72 z-[100] bg-[var(--color-brand-chocolate)] text-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Close */}
        <div className="flex items-center justify-end p-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>
        {renderSidebarContent()}
      </div>

      {/* === DESKTOP SIDEBAR === */}
      <aside className="hidden lg:flex w-64 bg-[var(--color-brand-chocolate)] text-white flex-shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
