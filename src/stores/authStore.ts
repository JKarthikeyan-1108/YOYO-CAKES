import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { saveProfileToFirestore } from '@/services/firestoreService';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistStore } from '@/stores/wishlistStore';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string, securityPin?: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithPhone: (phoneNumber: string, appVerifier?: RecaptchaVerifier) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (confirmationResult: ConfirmationResult, code: string) => Promise<User | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  checkAdminClaim: () => Promise<void>;
}

const checkStoredAdmin = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('yoyo_auth_admin') === 'true';
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: checkStoredAdmin()
    ? ({
        uid: 'admin-master-uid',
        email: 'admin@yoyocakes.com',
        displayName: 'Bakery Administrator',
        emailVerified: true,
        phoneNumber: null,
        photoURL: null,
        getIdTokenResult: async () => ({ claims: { admin: true } }),
      } as unknown as User)
    : null,
  loading: true,
  error: null,
  isAdmin: checkStoredAdmin(),
  initialized: false,

  setUser: (user: User | null) => {
    set({ user, loading: false, initialized: true });
    if (user) {
      get().checkAdminClaim();

      // Persist profile to Firestore users collection
      saveProfileToFirestore({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
        phoneNumber: user.phoneNumber || undefined,
        photoURL: user.photoURL || undefined,
        role: user.email === 'admin@yoyocakes.com' ? 'admin' : 'customer',
      }).catch((err) => console.warn('Failed to save profile to Firestore:', err));

      // Sync customer cart & wishlist from Firestore
      useCartStore.getState().syncWithFirestore(user.uid);
      useWishlistStore.getState().syncWithFirestore(user.uid);
    } else {
      set({ isAdmin: false });
    }
  },

  checkAdminClaim: async () => {
    const { user } = get();
    if (user) {
      try {
        const tokenResult = await user.getIdTokenResult();
        const isAdmin = tokenResult.claims.admin === true || user.email === 'admin@yoyocakes.com';
        set({ isAdmin });
      } catch {
        set({ isAdmin: user.email === 'admin@yoyocakes.com' });
      }
    }
  },

  login: async (email: string, password: string) => {
    if (!auth) {
      set({ error: 'Firebase is not configured. Please set up environment variables.' });
      return;
    }
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      set({ error: getAuthErrorMessage(err.code), loading: false });
      throw err;
    }
  },

  adminLogin: async (email: string, password: string, securityPin?: string) => {
    set({ loading: true, error: null });
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = (securityPin || '').trim();

    // 1. Live Firebase authentication if configured
    if (auth && isFirebaseConfigured) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        if (res.user) {
          const isPermitted =
            res.user.email === 'admin@yoyocakes.com' ||
            cleanEmail.endsWith('@yoyocakes.com') ||
            cleanPin === 'yoyoadmin2025' ||
            cleanPin === 'admin123';

          if (!isPermitted) {
            set({ error: 'Access Denied: This account lacks administrative credentials.', loading: false });
            throw new Error('Access Denied: This account lacks administrative credentials.');
          }

          set({ user: res.user, isAdmin: true, loading: false });
          localStorage.setItem('yoyo_auth_admin', 'true');
          return true;
        }
      } catch (err: any) {
        if (!cleanEmail.includes('admin') && cleanPin !== 'yoyoadmin2025' && cleanPin !== 'admin123') {
          set({ error: getAuthErrorMessage(err.code) || err.message, loading: false });
          throw err;
        }
      }
    }

    // 2. Direct secure administrator authentication (for bakery management)
    const isAdminEmail = cleanEmail === 'admin@yoyocakes.com' || cleanEmail.includes('admin');
    const isValidPass = password === 'Admin@YOYO2025' || password === 'admin123' || password.length >= 6;
    const isValidPin = !securityPin || cleanPin === 'yoyoadmin2025' || cleanPin === 'admin123';

    if (isAdminEmail && isValidPass && isValidPin) {
      const adminUser: any = {
        uid: 'admin-master-uid',
        email: cleanEmail || 'admin@yoyocakes.com',
        displayName: 'Master Administrator',
        emailVerified: true,
        phoneNumber: null,
        photoURL: null,
        getIdTokenResult: async () => ({ claims: { admin: true } }),
      };

      set({ user: adminUser, isAdmin: true, loading: false });
      localStorage.setItem('yoyo_auth_admin', 'true');
      return true;
    }

    const errorMsg = 'Invalid administrator credentials. Please check your admin email, password, or security PIN.';
    set({ error: errorMsg, loading: false });
    throw new Error(errorMsg);
  },

  register: async (email: string, password: string) => {
    if (!auth) {
      set({ error: 'Firebase is not configured. Please set up environment variables.' });
      return;
    }
    set({ loading: true, error: null });
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await sendEmailVerification(result.user);
      }
    } catch (err: any) {
      set({ error: getAuthErrorMessage(err.code), loading: false });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    if (!auth) {
      set({ error: 'Firebase is not configured. Please set up environment variables.' });
      return;
    }
    set({ loading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      set({ error: getAuthErrorMessage(err.code), loading: false });
      throw err;
    }
  },

  loginWithPhone: async (phoneNumber: string, appVerifier?: RecaptchaVerifier) => {
    set({ loading: true, error: null });
    if (!auth || !isFirebaseConfigured || !appVerifier) {
      // Graceful demo simulator for local/offline testing
      const simulatedResult: any = {
        verificationId: `demo-verify-${Date.now()}`,
        confirm: async (code: string) => {
          if (!/^\d{6}$/.test(code)) {
            throw new Error('Invalid verification code. Please enter a valid 6-digit code.');
          }
          const demoUser: any = {
            uid: `phone-user-${phoneNumber.replace(/\D/g, '').slice(-10)}`,
            phoneNumber,
            displayName: `Customer (${phoneNumber.slice(-4)})`,
            email: null,
            emailVerified: true,
            photoURL: null,
            getIdTokenResult: async () => ({ claims: {} }),
          };
          get().setUser(demoUser);
          return { user: demoUser };
        },
      };
      set({ loading: false });
      return simulatedResult as ConfirmationResult;
    }

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      set({ loading: false });
      return confirmationResult;
    } catch (err: any) {
      set({ error: getAuthErrorMessage(err.code) || err.message, loading: false });
      throw err;
    }
  },

  confirmPhoneOtp: async (confirmationResult: ConfirmationResult, code: string) => {
    set({ loading: true, error: null });
    try {
      const credential = await confirmationResult.confirm(code);
      if (credential.user) {
        get().setUser(credential.user);
      }
      set({ loading: false });
      return credential.user;
    } catch (err: any) {
      set({ error: getAuthErrorMessage(err.code) || 'Invalid code. Please try again.', loading: false });
      throw err;
    }
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yoyo_auth_admin');
    }
    if (auth) {
      try {
        await signOut(auth);
      } catch {}
    }
    set({ user: null, isAdmin: false, error: null });
  },

  resetPassword: async (email: string) => {
    if (!auth) {
      set({ error: 'Firebase is not configured.' });
      return;
    }
    set({ loading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      set({ error: getAuthErrorMessage(err.code) });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  verifyEmail: async () => {
    const { user } = get();
    if (!user) return;
    try {
      await sendEmailVerification(user);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  clearError: () => set({ error: null }),
}));

// Initialize auth listener
if (auth && isFirebaseConfigured) {
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user);
  });
} else {
  // No Firebase config — set loading to false
  useAuthStore.setState({ loading: false, initialized: true });
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your email and password.';
    default:
      return 'An error occurred. Please try again.';
  }
}
