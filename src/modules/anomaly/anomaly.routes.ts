import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler.js';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { requireRole } from '../../shared/middleware/requireRole.js';
import { validateRequest } from '../../shared/validation/validate.js';
import { getAnomalies, resolveAnomaly } from './anomaly.controller.js';
import { AnomalyQuerySchema, ResolveAnomalyParamsSchema } from './anomaly.validation.js';

export const anomaliesRouter = Router();

anomaliesRouter.get(
  '/',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validateRequest({ query: AnomalyQuerySchema }),
  asyncHandler(getAnomalies)
);

anomaliesRouter.patch(
  '/:id/resolve',
  requireAuth,
  requireRole('ADMIN', 'MANAGER'),
  validateRequest({ params: ResolveAnomalyParamsSchema }),
  asyncHandler(resolveAnomaly)
);
