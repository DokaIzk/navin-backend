import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler.js';
import { validateRequest } from '../../shared/validation/validate.js';
import { getTelemetry } from './telemetry.controller.js';
import { TelemetryQuerySchema } from './telemetry.validation.js';

export const telemetryRouter = Router();

telemetryRouter.get(
  '/',
  validateRequest({ query: TelemetryQuerySchema }),
  asyncHandler(getTelemetry)
);
