// src/shared/middleware/requireAuth.ts
import type { RequestHandler } from 'express';
import { AppError, ErrorCodes } from '../http/errors.js';
import { verifyToken, type TokenPayload } from '../../modules/auth/auth.service.js';

// We explicitly use 'declare module' or 'namespace' to extend Express
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError(401, 'Missing or invalid authorization header', ErrorCodes.UNAUTHORIZED)
    );
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    // TypeScript should now recognize .user thanks to the declare global block
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token', ErrorCodes.UNAUTHORIZED));
  }
};
