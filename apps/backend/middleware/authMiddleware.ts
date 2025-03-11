import { NextFunction, Request, Response } from 'express';
import * as admin from 'firebase-admin';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
