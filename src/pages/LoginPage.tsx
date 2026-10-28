import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw, 
  Sparkles, 
  Truck, 
  Star, 
  Heart,
  CheckCircle2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import BrandLogo from '@/components/common/BrandLogo';
import { triggerHaptic } from '@/services/mobileService';

type LoginTab = 'email' | 'admin';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectParam = new URLSearchParams(location.search).get('redirect');
  const from = redirectParam || (location.state as any)?.from?.pathname || '/';

  const { user, isAdmin, login, adminLogin, loginWithGoogle, error, clearError, loading } = useAuthStore();

  const isAdminIntent = new URLSearchParams(location.search).get('admin') === 'true' || location.pathname.includes('/admin');
  const [selectedTab, setSelectedTab] = useState<LoginTab | null>(null);
  const activeTab: LoginTab = selectedTab ?? (isAdminIntent ? 'admin' : 'email');
  
  const setActiveTab = (tab: LoginTab) => {
    triggerHaptic('selection');
    setSelectedTab(tab);
    clearError();
  };

  // Clear any previous errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // If already authenticated, redirect immediately away from login
  useEffect(() => {
    if (user) {
      if (isAdmin && isAdminIntent) {
        navigate('/admin/products', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [user, isAdmin, isAdminIntent, from, navigate]);

  // Email Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Admin Form
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Handle Customer Email / Password Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('heavy');
    try {
      await login(email, password);
      triggerHaptic('success');
      toast.success('Welcome back to YOYO CAKES!');
      navigate(from, { replace: true });
    } catch {
      triggerHaptic('error');
    }
  };

  // Handle Admin Portal Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('heavy');
    if (!adminEmail.trim() || !adminPassword) {
      triggerHaptic('error');
      toast.error('Please enter both administrator email and password.');
      return;
    }
    try {
      await adminLogin(adminEmail, adminPassword);
      triggerHaptic('success');
      toast.success('Administrator verified! Redirecting to Management Panel...', { icon: '🛡️' });
      navigate('/admin/products', { replace: true });
    } catch {
      triggerHaptic('error');
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    triggerHaptic('medium');
    try {
      await loginWithGoogle();
      triggerHaptic('success');
      toast.success('Signed in with Google!');
      navigate(from, { replace: true });
    } catch {
      triggerHaptic('error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[var(--color-brand-cream)] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl mx-auto">
        {/* Main Grid: Split Layout on Desktop */}
        <div className="bg-[var(--color-brand-surface)] rounded-3xl shadow-2xl border border-[var(--color-brand-border)] overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT HERO SHOWCASE PANEL (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-[#2E180E] via-[#3E2114] to-[#1C0D07] text-white p-8 sm:p-10 flex-col justify-between relative overflow-hidden">
            {/* Ambient decorative glowing orbs */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-[#FFD814]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-amber-700/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand Header */}
            <div className="relative z-10">
              <Link to="/" className="inline-block group mb-8">
                <BrandLogo variant="white" size="lg" showTagline={true} />
              </Link>

              <div className="space-y-4 mb-8">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD814]/20 text-[#FFD814] text-xs font-bold border border-[#FFD814]/30 backdrop-blur-xs">
                  <Star size={12} className="fill-[#FFD814]" />
                  <span>Chennai's Artisanal Patisserie</span>
                </span>
                <h2 className="font-heading text-3xl font-black leading-tight tracking-tight text-white">
                  Handcrafted Celebration Bakes
                </h2>
                <p className="text-xs text-white/80 leading-relaxed">
                  Join thousands of dessert lovers enjoying 100% eggless cakes, rich cocoa brownies, and signature jar cakes made fresh to order.
                </p>
              </div>

              {/* Bestseller highlight */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                    <img
                      src="/images/products/dream-cake.jpg"
                      alt="Dream Cake"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#FFD814] font-extrabold">
                      ⭐ Viral Bestseller
                    </span>
                    <h4 className="text-xs font-bold text-white font-heading">
                      5-in-1 Chocolate Dream Cake
                    </h4>
                    <p className="text-[11px] text-white/70 line-clamp-1">
                      Chennai's favorite cracked chocolate shell torte
                    </p>
                  </div>
                </div>
              </div>

              {/* Value Pillars */}
              <div className="space-y-3 text-xs text-white/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#FFD814]">
                    <Truck size={13} />
                  </div>
                  <span>Fast Express Slots & Kitchen Pickup Across Chennai</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#FFD814]">
                    <Sparkles size={13} />
                  </div>
                  <span>100% Belgian Cocoa, Real Cream & Eggless Varieties</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-[#FFD814]">
                    <CheckCircle2 size={13} />
                  </div>
                  <span>FSSAI Certified Artisanal Kitchen • Zero Artificial Additives</span>
                </div>
              </div>
            </div>

            {/* Bottom Testimonial */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/10 text-xs text-white/60 italic flex items-center gap-2">
              <Heart size={14} className="text-red-400 fill-red-400 flex-shrink-0" />
              <span>"The freshest, richest brownies and dream cakes in Chennai."</span>
            </div>
          </div>

          {/* RIGHT AUTHENTICATION PANEL */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {activeTab === 'admin' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <ShieldCheck size={12} className="text-amber-700" /> Bakery Staff Access
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-brand-cream-dark)] text-[var(--color-brand-chocolate)]">
                        Customer Portal
                      </span>
                    )}
                  </div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-brand-chocolate)] tracking-tight">
                    {activeTab === 'admin' ? 'Administrator Login' : 'Welcome to YOYO'}
                  </h1>
                  <p className="text-xs text-[var(--color-brand-muted)] mt-1">
                    {activeTab === 'admin'
                      ? 'Secure dashboard access to manage products, pricing & orders.'
                      : 'Sign in to access your account, saved orders & express checkout.'}
                  </p>
                </div>

                <Link to="/" className="lg:hidden flex-shrink-0">
                  <BrandLogo variant="icon" size="sm" />
                </Link>
              </div>

              {/* Segmented Tab Switcher */}
              <div className="grid grid-cols-2 p-1.5 bg-[var(--color-brand-cream-dark)] rounded-2xl mb-6 border border-[var(--color-brand-border)] shadow-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('email')}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'email'
                      ? 'bg-[var(--color-brand-surface)] text-[var(--color-brand-chocolate)] shadow-sm'
                      : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
                  }`}
                >
                  <Mail size={14} />
                  <span>Customer Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin')}
                  className={`py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-[var(--color-brand-primary)] text-[#1E1008] shadow-sm'
                      : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
                  }`}
                >
                  <ShieldCheck size={15} className={activeTab === 'admin' ? 'text-amber-900' : ''} />
                  <span>Admin Staff</span>
                </button>
              </div>

              {/* Error Alert Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex items-start gap-2.5 animate-shake">
                  <AlertCircle size={16} className="text-[var(--color-brand-error)] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs text-[var(--color-brand-error)] font-medium leading-relaxed">
                    {error}
                  </div>
                  <button onClick={clearError} className="text-red-400 hover:text-red-700 text-sm font-bold">
                    ×
                  </button>
                </div>
              )}

              {/* TAB 1: CUSTOMER EMAIL & PASSWORD */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4" autoComplete="off">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] mb-1.5 block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                      <input
                        type="email"
                        autoComplete="off"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full pl-10 pr-10 py-3.5 rounded-xl bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none text-base sm:text-sm text-[var(--color-brand-chocolate)] transition-all font-medium shadow-xs disabled:opacity-60"
                        placeholder="name@example.com"
                      />
                      {email && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setEmail('');
                          }}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]"
                          title="Clear email"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)]">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-[var(--color-brand-primary-dark)] dark:text-[var(--color-brand-primary)] font-semibold hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="off"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full pl-10 pr-11 py-3.5 rounded-xl bg-[var(--color-brand-surface-elevated)] border border-[var(--color-brand-border)] focus:border-[var(--color-brand-primary)] focus:ring-2 focus:ring-[var(--color-brand-primary)]/20 outline-none text-base sm:text-sm text-[var(--color-brand-chocolate)] transition-all font-medium shadow-xs disabled:opacity-60"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setShowPassword(!showPassword);
                        }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Action */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 text-[var(--color-brand-muted)] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => {
                          triggerHaptic('light');
                          setRememberMe(e.target.checked);
                        }}
                        className="rounded border-[var(--color-brand-border)] text-amber-600 focus:ring-amber-500"
                      />
                      <span>Remember this browser</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FFD814] to-[#F7CA00] hover:from-[#F7CA00] hover:to-[#E5B500] text-[#0F1111] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-[#FCD200] disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Sign In'}
                  </button>
                </form>
              )}

              {/* TAB 2: DEDICATED ADMIN PORTAL */}
              {activeTab === 'admin' && (
                <form onSubmit={handleAdminSubmit} className="space-y-4 animate-fade-in" autoComplete="off">
                  <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/40 flex items-start gap-3 shadow-xs">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex-shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                        Bakery Operations & Catalog Management
                      </h3>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                        Authorized staff portal to manage products, pricing, stock levels, and customer orders.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] mb-1.5 block">
                      Admin Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                      <input
                        type="email"
                        autoComplete="off"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-[var(--color-brand-input-bg)] border border-[var(--color-brand-border)] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/25 outline-none text-base sm:text-sm text-[var(--color-brand-chocolate)] transition-all font-medium shadow-xs disabled:opacity-60"
                        placeholder="Enter administrator email"
                      />
                      {adminEmail && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setAdminEmail('');
                          }}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]"
                          title="Clear admin email"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] mb-1.5 block">
                      Admin Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        autoComplete="off"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        disabled={loading}
                        required
                        className="w-full pl-10 pr-11 py-3 rounded-xl bg-[var(--color-brand-input-bg)] border border-[var(--color-brand-border)] focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/25 outline-none text-base sm:text-sm text-[var(--color-brand-chocolate)] transition-all font-medium shadow-xs disabled:opacity-60"
                        placeholder="Enter your administrator password"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setShowAdminPassword(!showAdminPassword);
                        }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]"
                      >
                        {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#E5B88F] hover:from-[#C79361] hover:to-[#D9A779] active:scale-[0.99] text-[#1E1008] font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-[#C59262] disabled:opacity-60 cursor-pointer min-h-[48px]"
                  >
                    {loading ? (
                      <RefreshCw size={16} className="animate-spin text-[#1E1008]" />
                    ) : (
                      <>
                        <ShieldCheck size={16} className="text-[#1E1008]" />
                        <span>Sign In to Admin Dashboard</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Customer Google 1-Click Sign-In & Divider */}
              {activeTab !== 'admin' && (
                <>
                  <div className="relative my-6 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--color-brand-border)]" />
                    </div>
                    <span className="relative bg-[var(--color-brand-surface)] px-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-brand-muted)]">
                      or sign in with
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-elevated)] hover:bg-[var(--color-brand-cream-dark)] transition-all text-xs sm:text-sm font-bold text-[var(--color-brand-chocolate)] shadow-xs active:scale-[0.99] cursor-pointer"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.183l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.04l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </>
              )}
            </div>

            {/* Bottom Footer Section */}
            <div className="mt-8 pt-5 border-t border-[var(--color-brand-primary-light)]/20 text-center">
              {activeTab !== 'admin' ? (
                <div className="space-y-3">
                  <p className="text-xs text-[var(--color-brand-muted)]">
                    New to YOYO CAKES?{' '}
                    <Link to="/register" className="text-[var(--color-brand-primary-dark)] font-extrabold hover:underline">
                      Create your free account
                    </Link>
                  </p>
                  <p className="text-[11px] text-[var(--color-brand-muted)]">
                    Bakery staff or store owner?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('admin')}
                      className="text-[var(--color-brand-chocolate)] font-bold underline hover:text-[var(--color-brand-primary-dark)] cursor-pointer"
                    >
                      Sign in via Admin Portal
                    </button>
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveTab('email')}
                  className="text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  ← Return to Customer Sign In
                </button>
              )}

              <p className="text-[10px] text-[var(--color-brand-muted)] mt-4">
                By signing in, you agree to YOYO CAKES'{' '}
                <Link to="/terms" className="underline hover:text-[var(--color-brand-chocolate)]">
                  Conditions of Use
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" className="underline hover:text-[var(--color-brand-chocolate)]">
                  Privacy Notice
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
