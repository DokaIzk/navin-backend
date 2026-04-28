// src/shared/middleware/requireRole.ts
import type { RequestHandler } from 'express';
import { AppError, ErrorCodes } from '../http/errors.js';

/**
 * Middleware to require a user to have one of the specified roles.
 */
export function requireRole(...roles: string[]): RequestHandler {
  return (req, res, next) => {
    // req.user will be recognized once requireAuth.ts is saved with the global declaration
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden: insufficient role', ErrorCodes.FORBIDDEN));
    }
    next();
  };
}
