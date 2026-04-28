import { z } from 'zod';

export const TelemetryQuerySchema = z.object({
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  shipmentId: z.string().trim().optional(),
});
