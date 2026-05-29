import { AppError } from '../../shared/http/errors.js';
import * as paymentsService from '../payments/payments.service.js';
import { PaymentStatus } from '../payments/payments.model.js';
import type { StellarWebhookPayload } from './stellar.webhook.validation.js';

export async function handleStellarWebhookEvent(payload: StellarWebhookPayload) {
  const { type, paymentId, transactionHash } = payload;

  // Log webhook event
  console.log(`[Stellar Webhook] Received ${type} event for payment ${paymentId}`);

  try {
    switch (type) {
      case 'release':
        return await handleReleaseEvent(paymentId, transactionHash);
      case 'escrow':
        return await handleEscrowEvent(paymentId, transactionHash);
      case 'failed':
        return await handleFailedEvent(paymentId);
      default:
        throw new AppError(400, `Unknown webhook event type: ${type}`, 'UNKNOWN_EVENT_TYPE');
    }
  } catch (error) {
    console.error(`[Stellar Webhook] Error processing event:`, error);
    throw error;
  }
}

async function handleReleaseEvent(paymentId: string, transactionHash: string) {
  await paymentsService.updatePaymentStatusService(paymentId, {
    status: PaymentStatus.RELEASED,
    stellarTxHash: transactionHash,
  });

  console.log(
    `[Stellar Webhook] Payment ${paymentId} marked as RELEASED ` +
      `with tx ${transactionHash}`,
  );

  return {
    event: 'release',
    paymentId,
    status: PaymentStatus.RELEASED,
    transactionHash,
  };
}

async function handleEscrowEvent(paymentId: string, transactionHash: string) {
  await paymentsService.updatePaymentStatusService(paymentId, {
    status: PaymentStatus.ESCROWED,
    stellarTxHash: transactionHash,
  });

  console.log(
    `[Stellar Webhook] Payment ${paymentId} marked as ESCROWED ` +
      `with tx ${transactionHash}`,
  );

  return {
    event: 'escrow',
    paymentId,
    status: PaymentStatus.ESCROWED,
    transactionHash,
  };
}

async function handleFailedEvent(paymentId: string) {
  await paymentsService.updatePaymentStatusService(paymentId, {
    status: PaymentStatus.FAILED,
  });

  console.log(`[Stellar Webhook] Payment ${paymentId} marked as FAILED`);

  return {
    event: 'failed',
    paymentId,
    status: PaymentStatus.FAILED,
  };
}
