import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Star,
  Settings,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import BrandLogo from '@/components/common/BrandLogo';
import ThemeToggle from '@/components/common/ThemeToggle';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Security gate: only verified administrators can view admin routes
  if (!isAdmin) {
    return <Navigate to="/login?admin=true" replace />;
  }

  const handleSignOut = async () => {
    await logout();
    toast.success('Signed out of Administrator Portal');
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products & Stock', icon: ShoppingBag },
    { to: '/admin/orders', label: 'Orders & Kitchen', icon: ShoppingCart },
    { to: '/admin/reviews', label: 'Customer Reviews', icon: Star },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];


  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1C0E07] via-[#170B05] to-[#120803] text-amber-50">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-[#351E10]/80">
        <BrandLogo variant="white" size="md" />
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-2 h-2 rounded-full bg-[#D4A373] animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest text-[#D4A373] uppercase font-bold">
            Executive Admin Portal
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3.5 py-5 space-y-1.5" aria-label="Admin navigation">
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm transition-all min-h-[44px] ${
                isActive
                  ? 'bg-gradient-to-r from-[#D4A373] to-[#E6BA8E] text-[#1A0E07] font-black shadow-md shadow-[#D4A373]/20 ring-1 ring-amber-200/50'
                  : 'text-amber-100/70 hover:bg-white/10 hover:text-white font-medium'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} className={isActive ? 'text-[#1A0E07]' : 'text-amber-200/70'} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-5 border-t border-[#351E10]/80 space-y-2.5 bg-[#140A04]/60">
        <div className="bg-[#24130A] border border-[#422513] rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2 text-amber-200 font-semibold mb-1">
            <ShieldCheck size={14} className="text-[#D4A373]" aria-hidden="true" />
            <span>Admin Access Active</span>
          </div>
          <p className="text-[11px] text-amber-100/60 truncate font-mono">
            {user?.email || 'admin@yoyocakes.com'}
          </p>
        </div>

        <div className="pt-1">
          <ThemeToggle variant="mobile" />
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 hover:text-white transition-colors min-h-[44px]"
        >
          <LogOut size={14} aria-hidden="true" /> Sign Out
        </button>

        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-amber-100/80 hover:bg-white/10 hover:text-white transition-colors min-h-[44px]"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Back to Storefront
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] flex flex-col lg:flex-row antialiased transition-colors">
      {/* === MOBILE HEADER === */}
      <header className="lg:hidden sticky top-0 z-40 bg-gradient-to-r from-[#1C0E07] to-[#2B160B] text-white flex items-center justify-between px-4 py-3 shadow-md border-b border-[#3A2011]">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-xl text-amber-100/80 hover:text-white hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Open admin navigation menu"
          aria-expanded={sidebarOpen}
        >
          <Menu size={22} />
        </button>

        <div className="flex items-center gap-2">
          <BrandLogo variant="white" size="sm" />
          <span className="text-xs font-mono font-bold tracking-wider text-[#D4A373] bg-[#381E10] px-2 py-0.5 rounded-full border border-amber-900/40">
            ADMIN
          </span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle variant="compact" />
          <Link
            to="/"
            className="p-2 rounded-xl text-amber-100/80 hover:text-white hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Back to customer storefront"
          >
            <ArrowLeft size={18} />
          </Link>
        </div>
      </header>

      {/* === MOBILE SIDEBAR OVERLAY === */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[90] bg-black/60 backdrop-blur-xs animate-fadeIn"
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* === MOBILE SIDEBAR DRAWER === */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin Navigation"
        className={`lg:hidden fixed top-0 left-0 h-full w-72 z-[100] shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Close */}
        <div className="flex items-center justify-end p-3 bg-[#1C0E07] border-b border-[#351E10]/80">
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
      <aside className="hidden lg:flex w-64 flex-shrink-0 shadow-xl border-r border-[#351E10]/80">
        {renderSidebarContent()}
      </aside>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 overflow-y-auto min-h-0 bg-[var(--color-brand-cream)] transition-colors">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
