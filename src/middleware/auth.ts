import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getUserByUid } from '../db/users.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  try {
    const dbUser = await getUserByUid(req.user.uid);
    if (dbUser) {
        req.dbUser = dbUser;
    }
    next();
  } catch (error) {
    console.error('Database query failed:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  await requireAuth(req, res, () => {
    if (req.user?.admin === true || req.dbUser?.role === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  });
};
