import { z } from 'zod';
import { ANOMALY_SEVERITIES } from '../../shared/types/anomaly.js';

export const AnomalyQuerySchema = z.object({
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  shipmentId: z.string().trim().optional(),
  severity: z.enum(ANOMALY_SEVERITIES).optional(),
});

export const ResolveAnomalyParamsSchema = z.object({
  id: z.string().trim().min(1),
});
