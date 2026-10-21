import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, error, clearError, loading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch {}
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-cream)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 rounded-full bg-[var(--color-brand-primary)] text-[var(--color-brand-chocolate)] flex items-center justify-center font-heading text-2xl font-black shadow-sm mx-auto mb-4">
              Y
            </div>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-brand-chocolate)]">
            Welcome Back
          </h1>
          <p className="text-sm text-[var(--color-brand-muted)] mt-1">
            Sign in to your YOYO CAKES account
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="bg-[var(--color-brand-warning)]/10 border border-[var(--color-brand-warning)]/30 rounded-xl p-4 mb-6 flex gap-3">
            <AlertCircle size={18} className="text-[var(--color-brand-warning)] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-brand-chocolate-light)]">
              Firebase is not configured. Please set up your Firebase environment variables to enable authentication.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-elevated p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-[var(--color-brand-error)] flex-shrink-0" />
              <p className="text-sm text-[var(--color-brand-error)]">{error}</p>
              <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-600">
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[var(--color-brand-chocolate)] mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-lg bg-[var(--color-brand-cream)] border border-transparent focus:border-[var(--color-brand-primary)] outline-none text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-[var(--color-brand-primary-dark)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 justify-center" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[var(--color-brand-primary-light)]/30" />
            <span className="text-xs text-[var(--color-brand-muted)]">or</span>
            <div className="flex-1 h-px bg-[var(--color-brand-primary-light)]/30" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-[var(--color-brand-primary-light)]/40 hover:bg-[var(--color-brand-cream)] transition-colors text-sm font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.183l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.04l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.96L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-sm text-[var(--color-brand-muted)] text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[var(--color-brand-primary-dark)] font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
