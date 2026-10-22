import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../firebaseAdmin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    admin?: boolean;
    name?: string;
  };
}

export async function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid Authorization header. Please sign in to YOYO CAKES.',
    });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: Boolean(decodedToken.admin),
      name: decodedToken.name,
    };
    next();
  } catch (err: any) {
    console.error('[Auth Middleware] Token verification failed:', err.message);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired authentication session. Please sign in again.',
    });
  }
}

export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        admin: Boolean(decodedToken.admin),
        name: decodedToken.name,
      };
    } catch {
      // Continue without user if token is expired/invalid
    }
  }
  next();
}

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
    return;
  }

  // Check admin claim or master bootstrap email
  if (req.user.admin || req.user.email === 'admin@yoyocakes.com') {
    next();
    return;
  }

  // Also check Firestore user document role as secondary confirmation
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (userDoc.exists && userDoc.data()?.role === 'admin') {
      req.user.admin = true;
      next();
      return;
    }
  } catch (err) {
    console.error('[Auth Middleware] Admin check error:', err);
  }

  res.status(403).json({
    error: 'Forbidden',
    message: 'Access restricted to authorized YOYO CAKES administrators.',
  });
}
