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
  register: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  checkAdminClaim: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  loading: true,
  error: null,
  isAdmin: false,
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

  logout: async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      set({ user: null, isAdmin: false });
    } catch (err: any) {
      set({ error: err.message });
    }
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
