import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken } from '@/utils/auth';
import { sendUnauthorized } from '@/utils/response';
import { JWTPayload } from '@/types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      sendUnauthorized(res, 'No token provided');
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    sendUnauthorized(res, 'Invalid token');
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const token = extractToken(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    next();
  }
};