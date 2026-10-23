import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
  // Check for service account file candidates
  const keyPaths = [
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), '../functions/serviceAccountKey.json'),
    path.resolve(process.cwd(), 'functions/serviceAccountKey.json'),
    path.resolve(__dirname, '../../functions/serviceAccountKey.json'),
  ];

  let credentialFound = false;

  for (const kp of keyPaths) {
    if (fs.existsSync(kp)) {
      try {
        const serviceAccount = JSON.parse(fs.readFileSync(kp, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://yoyo-c46c3-default-rtdb.firebaseio.com',
          projectId: serviceAccount.project_id || 'yoyo-c46c3',
        });
        credentialFound = true;
        console.log(`[Firebase Admin] Initialized with credentials from: ${kp}`);
        break;
      } catch (err) {
        console.warn(`[Firebase Admin] Failed parsing ${kp}:`, err);
      }
    }
  }

  // Check for environment variable credentials (Render production deployment)
  if (!credentialFound && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || 'yoyo-c46c3',
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://yoyo-c46c3-default-rtdb.firebaseio.com',
      });
      credentialFound = true;
      console.log('[Firebase Admin] Initialized with environment credentials');
    } catch (err) {
      console.warn('[Firebase Admin] Failed initializing with environment credentials:', err);
    }
  }

  // Fallback to default application credentials
  if (!credentialFound) {
    try {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'yoyo-c46c3',
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://yoyo-c46c3-default-rtdb.firebaseio.com',
      });
      console.log('[Firebase Admin] Initialized with default project config');
    } catch (err) {
      console.warn('[Firebase Admin] Initialized with fallback config:', err);
    }
  }
}

import { getFirestore } from 'firebase-admin/firestore';
export const db = process.env.FIREBASE_DATABASE_ID ? getFirestore(process.env.FIREBASE_DATABASE_ID) : getFirestore();
export const auth = admin.auth();
export default admin;

