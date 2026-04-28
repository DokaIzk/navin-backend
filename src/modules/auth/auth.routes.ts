import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler.js';
import { validateRequest } from '../../shared/validation/validate.js';
import { requireAuth } from '../../shared/middleware/requireAuth.js';
import { SignupBodySchema, LoginBodySchema } from './auth.validation.js';
import { signupController, loginController, logoutController } from './auth.controller.js';
import {
  createApiKeyController,
  listApiKeysController,
  revokeApiKeyController,
} from './apiKey.controller.js';
import {
  ApiKeyIdParamSchema,
  CreateApiKeyBodySchema,
  OrganizationIdParamSchema,
} from './apiKey.validation.js';

export const authRouter = Router();

authRouter.post(
  '/signup',
  validateRequest({ body: SignupBodySchema }),
  asyncHandler(signupController)
);
authRouter.post(
  '/login',
  validateRequest({ body: LoginBodySchema }),
  asyncHandler(loginController)
);
authRouter.post('/logout', asyncHandler(requireAuth), asyncHandler(logoutController));

// API Key management routes (protected by JWT auth)
authRouter.post(
  '/api-keys',
  asyncHandler(requireAuth),
  validateRequest({ body: CreateApiKeyBodySchema }),
  asyncHandler(createApiKeyController)
);
authRouter.get(
  '/api-keys/:organizationId',
  asyncHandler(requireAuth),
  validateRequest({ params: OrganizationIdParamSchema }),
  asyncHandler(listApiKeysController)
);
authRouter.delete(
  '/api-keys/:apiKeyId',
  asyncHandler(requireAuth),
  validateRequest({ params: ApiKeyIdParamSchema }),
  asyncHandler(revokeApiKeyController)
);
