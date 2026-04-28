import { Router } from 'express';

import { validateRequest } from '../../shared/validation/validate.js';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { requireRole } from '../../shared/middleware/requireRole.js';
import { asyncHandler } from '../../shared/http/asyncHandler.js';

import { PerformanceQuerySchema } from './analytics.validation.js';
import { getPerformanceController } from './analytics.controller.js';

export const analyticsRouter = Router();

analyticsRouter.get(
  '/performance',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validateRequest({ query: PerformanceQuerySchema }),
  asyncHandler(getPerformanceController)
);
