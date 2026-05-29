import { AppError } from '../../shared/http/errors.js';
import * as paymentsRepo from './payments.repo.js';
import { PaymentStatus } from './payments.model.js';
import type { CreatePaymentInput, UpdatePaymentStatusInput } from './payments.validation.js';

export async function createPaymentService(input: CreatePaymentInput & { organizationId: string }) {
  try {
    const payment = await paymentsRepo.createPayment({
      shipmentId: input.shipmentId,
      organizationId: input.organizationId,
      amount: input.amount,
      tokenType: input.tokenType,
      status: input.status || PaymentStatus.PENDING,
    });

    return payment;
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      throw new AppError(400, 'Invalid payment data', 'INVALID_PAYMENT_DATA');
    }
    throw new AppError(500, 'Failed to create payment', 'PAYMENT_CREATE_FAILED');
  }
}

export async function getPaymentByIdService(id: string) {
  const payment = await paymentsRepo.getPaymentById(id);
  if (!payment) {
    throw new AppError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }
  return payment;
}

export async function getPaymentsService(input: {
  organizationId: string;
  status?: PaymentStatus;
  limit?: number;
  cursor?: string;
}) {
  return paymentsRepo.getPaymentsByOrganization(input.organizationId, {
    status: input.status,
    limit: input.limit,
    cursor: input.cursor,
  });
}

export async function updatePaymentStatusService(id: string, input: UpdatePaymentStatusInput) {
  const payment = await paymentsRepo.getPaymentById(id);
  if (!payment) {
    throw new AppError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }

  const updated = await paymentsRepo.updatePaymentStatus(id, input.status, input.stellarTxHash);
  if (!updated) {
    throw new AppError(500, 'Failed to update payment status', 'PAYMENT_UPDATE_FAILED');
  }

  return updated;
}

export async function getPaymentByShipmentService(shipmentId: string) {
  const payment = await paymentsRepo.getPaymentByShipmentId(shipmentId);
  return payment;
}

export async function releasePaymentService(paymentId: string, stellarTxHash: string) {
  return updatePaymentStatusService(paymentId, {
    status: PaymentStatus.RELEASED,
    stellarTxHash,
  });
}
