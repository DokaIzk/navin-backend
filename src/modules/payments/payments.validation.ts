import { z } from 'zod';
import { PaymentStatus } from './payments.model.js';

export const CreatePaymentBodySchema = z.object({
  shipmentId: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
  tokenType: z.enum(['XLMN', 'USDC', 'Other']),
  status: z.nativeEnum(PaymentStatus).optional().default(PaymentStatus.PENDING),
});

export const UpdatePaymentStatusBodySchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  stellarTxHash: z.string().optional(),
});

export const PaymentIdParamSchema = z.object({
  id: z.string().min(1),
});

export const GetPaymentsQuerySchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  organizationId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentBodySchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusBodySchema>;
export type GetPaymentsQuery = z.infer<typeof GetPaymentsQuerySchema>;
