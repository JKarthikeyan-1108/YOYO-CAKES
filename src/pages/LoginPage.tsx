import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Phone, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, RefreshCw, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { RecaptchaVerifier, type ConfirmationResult } from 'firebase/auth';

type LoginTab = 'phone' | 'email' | 'admin';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const { login, adminLogin, loginWithGoogle, loginWithPhone, confirmPhoneOtp, error, clearError, loading } = useAuthStore();

  const isAdminIntent = new URLSearchParams(location.search).get('admin') === 'true' || location.pathname.includes('/admin');
  const [selectedTab, setSelectedTab] = useState<LoginTab | null>(null);
  const activeTab: LoginTab = selectedTab ?? (isAdminIntent ? 'admin' : 'phone');
  const setActiveTab = (tab: LoginTab) => setSelectedTab(tab);

  // Email Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Phone Form
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Admin Form
  const [adminEmail, setAdminEmail] = useState('admin@yoyocakes.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {}
      }
    };
  }, []);

  // Timer for OTP resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const initRecaptcha = () => {
    if (!recaptchaVerifierRef.current && auth) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
        });
      } catch (err) {
        console.warn('RecaptchaVerifier init error:', err);
      }
    }
    return recaptchaVerifierRef.current;
  };

  // Handle Customer Email / Password Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back to YOYO CAKES!');
      navigate(from, { replace: true });
    } catch {}
  };

  // Handle Admin Portal Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLogin(adminEmail, adminPassword, adminPin);
      toast.success('Administrator verified! Redirecting to Management Panel...', { icon: '🛡️' });
      navigate('/admin/products', { replace: true });
    } catch {}
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google!');
      navigate(from, { replace: true });
    } catch {}
  };

  // Handle Phone OTP Send
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    const formattedPhone = cleaned.startsWith('91') && cleaned.length === 12 
      ? `+${cleaned}` 
      : `+91${cleaned.slice(-10)}`;

    try {
      const appVerifier = isFirebaseConfigured ? initRecaptcha() : undefined;
      const result = await loginWithPhone(formattedPhone, appVerifier || undefined);
      setConfirmationResult(result);
      setOtpSent(true);
      setResendCountdown(30);
      toast.success(`Verification code sent to ${formattedPhone}`);

      // Focus first OTP field
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch {
      // Error handled by store
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Pasting full OTP
      const digits = val.replace(/\D/g, '').slice(0, 6).split('');
      const updated = [...otpCode];
      digits.forEach((d, i) => {
        if (i < 6) updated[i] = d;
      });
      setOtpCode(updated);
      const nextIndex = Math.min(digits.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = val.replace(/\D/g, '');
    const updated = [...otpCode];
    updated[index] = digit;
    setOtpCode(updated);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join('');
    if (fullCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }

    if (!confirmationResult) {
      toast.error('Session expired. Please request a new verification code.');
      setOtpSent(false);
      return;
    }

    try {
      await confirmPhoneOtp(confirmationResult, fullCode);
      toast.success('Phone verified successfully!');
      navigate(from, { replace: true });
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] flex flex-col justify-center items-center px-4 py-12">
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-12 h-12 rounded-full bg-[var(--color-brand-primary-dark)] text-white flex items-center justify-center font-heading text-xl font-bold shadow-sm transition-transform group-hover:scale-105">
              Y
            </div>
            <div className="text-left">
              <span className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)] leading-none block">
                YOYO CAKES
              </span>
              <span className="text-[11px] tracking-wider text-[var(--color-brand-muted)] font-medium">
                Every bite, a little happiness
              </span>
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-elevated border border-[var(--color-brand-primary-light)]/30 p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)] tracking-tight">
              {activeTab === 'admin' ? 'Administrator Login' : 'Sign in'}
            </h1>
            <p className="text-xs text-[var(--color-brand-muted)] mt-1">
              {activeTab === 'admin'
                ? 'Authorized management portal to add, edit, and delete products, manage stock, and track orders.'
                : 'Access your saved addresses, track fresh cake orders, and check out faster.'}
            </p>
          </div>

          {/* Login Mode Switcher */}
          <div className="grid grid-cols-3 p-1 bg-[var(--color-brand-cream)] rounded-xl mb-6 border border-[var(--color-brand-primary-light)]/30">
            <button
              type="button"
              onClick={() => {
                setActiveTab('phone');
                clearError();
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'phone'
                  ? 'bg-white text-[var(--color-brand-chocolate)] shadow-sm'
                  : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
              }`}
            >
              <Phone size={13} />
              <span>Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('email');
                clearError();
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-white text-[var(--color-brand-chocolate)] shadow-sm'
                  : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]'
              }`}
            >
              <Mail size={13} />
              <span>Email</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                clearError();
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-[var(--color-brand-chocolate)] text-white shadow-sm'
                  : 'text-[var(--color-brand-chocolate)]/70 hover:text-[var(--color-brand-chocolate)]'
              }`}
            >
              <ShieldCheck size={14} className={activeTab === 'admin' ? 'text-[#FFD814]' : ''} />
              <span>Admin</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-[var(--color-brand-error)] flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-[var(--color-brand-error)] font-medium leading-relaxed">
                {error}
              </div>
              <button onClick={clearError} className="text-red-400 hover:text-red-700 text-sm">
                ×
              </button>
            </div>
          )}

          {/* TAB 1: PHONE NUMBER WITH REAL OTP */}
          {activeTab === 'phone' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] mb-1.5 block">
                      Mobile Number
                    </label>
                    <div className="relative flex rounded-xl border border-[var(--color-brand-primary-light)]/40 focus-within:border-[var(--color-brand-primary-dark)] focus-within:ring-2 focus-within:ring-[var(--color-brand-primary-dark)]/15 transition-all overflow-hidden bg-white">
                      <span className="inline-flex items-center px-3.5 bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] text-sm font-semibold border-r border-[var(--color-brand-primary-light)]/40 select-none">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        required
                        className="w-full px-3.5 py-3 text-sm text-[var(--color-brand-chocolate)] placeholder:text-[var(--color-brand-muted)]/60 outline-none font-medium"
                        placeholder="Enter 10-digit mobile"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-[var(--color-brand-muted)] mt-1.5">
                      We'll send a 6-digit one-time verification code via SMS.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phoneNumber.length < 10}
                    className="w-full py-3.5 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F0B800] text-[#0F1111] font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-[#FCD200]"
                  >
                    {loading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>
                        Continue <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
                  <div className="text-center">
                    <span className="text-xs text-[var(--color-brand-muted)] block">
                      Verification code sent to
                    </span>
                    <span className="text-sm font-bold text-[var(--color-brand-chocolate)] font-mono">
                      +91 {phoneNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode(['', '', '', '', '', '']);
                      }}
                      className="text-xs text-[var(--color-brand-primary-dark)] hover:underline ml-2 font-medium"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] mb-2 block text-center">
                      Enter 6-Digit OTP
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-2.5">
                      {otpCode.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => {
                            otpInputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 text-center text-lg font-bold font-mono rounded-xl border border-[var(--color-brand-primary-light)]/60 focus:border-[var(--color-brand-primary-dark)] focus:ring-2 focus:ring-[var(--color-brand-primary-dark)]/20 outline-none bg-[var(--color-brand-cream)] text-[var(--color-brand-chocolate)] transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-brand-muted)]">Didn't receive SMS?</span>
                    {resendCountdown > 0 ? (
                      <span className="text-[var(--color-brand-muted)] font-mono">
                        Resend in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-[var(--color-brand-primary-dark)] font-bold hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.some((d) => !d)}
                    className="w-full py-3.5 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-[#FCD200]"
                  >
                    {loading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      'Verify & Sign In'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-brand-cream)] border border-[var(--color-brand-primary-light)]/40 focus:border-[var(--color-brand-primary-dark)] focus:bg-white outline-none text-sm text-[var(--color-brand-chocolate)] transition-all font-medium"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[var(--color-brand-primary-dark)] font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[var(--color-brand-cream)] border border-[var(--color-brand-primary-light)]/40 focus:border-[var(--color-brand-primary-dark)] focus:bg-white outline-none text-sm text-[var(--color-brand-chocolate)] transition-all font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 border border-[#FCD200]"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* TAB 3: DEDICATED ADMIN PORTAL */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-900 flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Bakery Administration Portal
                  </h3>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Authorized staff access to add, edit, or delete items, update stock counts, and fulfill orders.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)] mb-1.5 block">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-brand-cream)] border border-[var(--color-brand-primary-light)]/40 focus:border-[var(--color-brand-chocolate)] focus:bg-white outline-none text-sm text-[var(--color-brand-chocolate)] transition-all font-medium"
                    placeholder="admin@yoyocakes.com"
                  />
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
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-[var(--color-brand-cream)] border border-[var(--color-brand-primary-light)]/40 focus:border-[var(--color-brand-chocolate)] focus:bg-white outline-none text-sm text-[var(--color-brand-chocolate)] transition-all font-medium"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)]"
                  >
                    {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-chocolate)]">
                    Security PIN (Optional)
                  </label>
                  <span className="text-[10px] text-gray-400 font-medium">Backup PIN</span>
                </div>
                <div className="relative">
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                  <input
                    type="password"
                    maxLength={15}
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--color-brand-cream)] border border-[var(--color-brand-primary-light)]/40 focus:border-[var(--color-brand-chocolate)] focus:bg-white outline-none text-sm text-[var(--color-brand-chocolate)] transition-all font-medium font-mono"
                    placeholder="e.g. yoyoadmin2025"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/70 text-[11px] text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-800">Verified Credentials: </span>
                <span className="font-mono text-gray-700">admin@yoyocakes.com</span> • Password: <span className="font-mono text-gray-700">yoyoadmin2025</span> (or your custom admin credentials)
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[var(--color-brand-chocolate)] hover:bg-[#32170d] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 border border-black/20"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin text-[#FFD814]" />
                ) : (
                  <>
                    <ShieldCheck size={16} className="text-[#FFD814]" />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Customer Google 1-Click Sign-In & Divider (Only for customer tabs) */}
          {activeTab !== 'admin' && (
            <>
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--color-brand-primary-light)]/30" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-[var(--color-brand-muted)]">
                  or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-brand-primary-light)]/60 bg-white hover:bg-[var(--color-brand-cream)] transition-all text-xs sm:text-sm font-semibold text-[var(--color-brand-chocolate)] shadow-soft active:scale-[0.99]"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.183l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.04l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </>
          )}

          {/* Legal / Terms */}
          <div className="mt-6 pt-5 border-t border-[var(--color-brand-primary-light)]/20 text-center">
            <p className="text-[11px] text-[var(--color-brand-muted)] leading-relaxed">
              By continuing, you agree to YOYO CAKES'{' '}
              <Link to="/terms" className="text-[var(--color-brand-primary-dark)] underline">
                Conditions of Use
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-[var(--color-brand-primary-dark)] underline">
                Privacy Notice
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Customer vs Admin Context Switcher */}
        {activeTab !== 'admin' ? (
          <div className="mt-8 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-brand-primary-light)]/40" />
              </div>
              <span className="relative bg-[var(--color-brand-cream)] px-4 text-xs font-semibold text-[var(--color-brand-muted)]">
                New to YOYO CAKES?
              </span>
            </div>

            <Link
              to="/register"
              className="w-full inline-block py-3 rounded-xl border border-[var(--color-brand-primary-light)]/80 bg-white hover:bg-[var(--color-brand-cream-dark)] text-xs sm:text-sm font-bold text-[var(--color-brand-chocolate)] shadow-sm transition-all"
            >
              Create your YOYO CAKES account
            </Link>

            <div className="mt-4 text-xs text-[var(--color-brand-muted)]">
              Bakery Staff or Store Owner?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="text-[var(--color-brand-chocolate)] font-bold underline hover:text-[var(--color-brand-primary-dark)]"
              >
                Sign in via Admin Portal
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setActiveTab('phone')}
              className="text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-chocolate)] font-medium inline-flex items-center gap-1.5"
            >
              ← Back to Customer Sign In
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-[var(--color-brand-muted)]">
          <ShieldCheck size={14} className="text-[var(--color-brand-success)]" />
          <span>100% Secure Authentication & Verified Bakery Management</span>
        </div>
      </div>
    </div>
  );
}
