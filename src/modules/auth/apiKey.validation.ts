import { z } from 'zod';

export const CreateApiKeyBodySchema = z.object({
  name: z.string().trim().min(1),
  organizationId: z.string().trim().min(1),
  shipmentId: z.string().trim().optional(),
});

export const OrganizationIdParamSchema = z.object({
  organizationId: z.string().trim().min(1),
});

export const ApiKeyIdParamSchema = z.object({
  apiKeyId: z.string().trim().min(1),
});
