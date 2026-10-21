import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { isFirebaseConfigured } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, error, clearError, loading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await register(email, password);
      setRegisteredSuccess(true);
      toast.success('Registration successful! Verification email sent.');
    } catch {
      // Error handled by store
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/');
    } catch {
      // Error handled by store
    }
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
            Create an Account
          </h1>
          <p className="text-sm text-[var(--color-brand-muted)] mt-1">
            Join YOYO CAKES for faster checkout & sweet rewards
          </p>
        </div>

        {!isFirebaseConfigured && (
          <div className="bg-[var(--color-brand-warning)]/10 border border-[var(--color-brand-warning)]/30 rounded-xl p-4 mb-6 flex gap-3">
            <AlertCircle size={18} className="text-[var(--color-brand-warning)] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--color-brand-chocolate-light)]">
              <span className="font-semibold">Demo Mode:</span> Firebase credentials are not yet configured in environment variables. Live accounts will be enabled upon Firebase setup.
            </div>
          </div>
        )}

        {registeredSuccess ? (
          <div className="bg-white rounded-2xl shadow-elevated p-8 text-center border border-[var(--color-brand-primary-light)]/20">
            <CheckCircle size={48} className="mx-auto text-[var(--color-brand-success)] mb-4" />
            <h2 className="font-heading text-xl font-bold text-[var(--color-brand-chocolate)] mb-2">
              Account Created!
            </h2>
            <p className="text-sm text-[var(--color-brand-muted)] mb-6">
              A verification email has been dispatched to <strong>{email}</strong>. Please verify your email before logging in.
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">
              Sign In to Your Account
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-elevated p-8 border border-[var(--color-brand-primary-light)]/20">
            {error && (
              <div className="bg-[var(--color-brand-error)]/10 border border-[var(--color-brand-error)]/30 text-[var(--color-brand-error)] text-sm rounded-xl p-3 mb-6 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={clearError} className="text-xs font-bold ml-2">Dismiss</button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--color-brand-chocolate)] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-brand-chocolate)] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-brand-chocolate)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--color-brand-chocolate)] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-brand-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="input-field pl-10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-sm mt-2"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-xs text-[var(--color-brand-muted)] uppercase">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-[var(--color-brand-chocolate)] shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign up with Google
            </button>

            <p className="text-center text-xs text-[var(--color-brand-muted)] mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[var(--color-brand-primary-dark)] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
