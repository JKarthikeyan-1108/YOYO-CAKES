import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

// Existing Firebase Project: yoyo-c46c3
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDgRMJkxuxWw10EHaINvVXyR8ltRLM5wCs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'yoyo-c46c3.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'yoyo-c46c3',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://yoyo-c46c3-default-rtdb.firebaseio.com',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'yoyo-c46c3.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '959364820411',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:959364820411:web:a6e8a4756de0c5171ae89e',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-N4VKNQK1LY',
};

// Firebase is always configured — real credentials are hardcoded as fallback
export const isFirebaseConfigured = true;


// Avoid duplicate initialization
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth: Auth = getAuth(app);
export const googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Export the Firestore database instance as db
const firestoreDatabaseId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
export const db: Firestore = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);

// Export the Realtime Database instance as rtdb
export const rtdb: Database = getDatabase(app);

// Export Firebase Storage instance
export const storage: FirebaseStorage = getStorage(app);

// Initialize Firebase Analytics with browser-support checking
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported && firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics unsupported in this browser environment
    });
}

// Initialize Firebase App Check with reCAPTCHA v3 in production if configured
if (typeof window !== 'undefined' && import.meta.env.VITE_RECAPTCHA_SITE_KEY && import.meta.env.PROD) {
  import('firebase/app-check')
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true,
        });
      } catch (err) {
        console.warn('Firebase App Check initialization skipped:', err);
      }
    })
    .catch(() => {
      // App Check unsupported in current browser environment
    });
}

export default app;
