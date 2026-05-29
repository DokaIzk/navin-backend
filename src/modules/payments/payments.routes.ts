import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler.js';
import { validateRequest } from '../../shared/validation/validate.js';
import {
  CreatePaymentBodySchema,
  UpdatePaymentStatusBodySchema,
  PaymentIdParamSchema,
  GetPaymentsQuerySchema,
} from './payments.validation.js';
import {
  createPaymentController,
  getPaymentController,
  getPaymentsController,
  updatePaymentStatusController,
} from './payments.controller.js';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { UserRole } from '../../shared/constants/index.js';
import { requireRole } from '../../shared/middleware/requireRole.js';

export const paymentsRouter = Router();

// Require authentication for all payment routes
paymentsRouter.use(requireAuth);

paymentsRouter.post(
  '/',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest({ body: CreatePaymentBodySchema }),
  asyncHandler(createPaymentController)
);

paymentsRouter.get(
  '/',
  validateRequest({ query: GetPaymentsQuerySchema }),
  asyncHandler(getPaymentsController)
);

paymentsRouter.get(
  '/:id',
  validateRequest({ params: PaymentIdParamSchema }),
  asyncHandler(getPaymentController)
);

paymentsRouter.patch(
  '/:id/status',
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest({ params: PaymentIdParamSchema, body: UpdatePaymentStatusBodySchema }),
  asyncHandler(updatePaymentStatusController)
);
