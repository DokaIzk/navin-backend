import type { RequestHandler } from 'express';
import { AppError } from '../http/errors.js';
import { verifyToken, type TokenPayload } from '../../modules/auth/auth.service.js';
import { isTokenBlocked } from '../../infra/redis/tokenBlocklist.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const requireAuth: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing or invalid authorization header', 'UNAUTHORIZED');
  }

  const token = authHeader.substring(7);

  let payload: TokenPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError(401, 'Invalid or expired token', 'UNAUTHORIZED');
  }

  if (await isTokenBlocked(payload.jti)) {
    throw new AppError(401, 'Token has been revoked', 'TOKEN_REVOKED');
  }

  req.user = payload;
  next();
};
