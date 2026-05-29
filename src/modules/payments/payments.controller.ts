import type { Request, Response } from 'express';
import * as paymentsService from './payments.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';
import { asyncHandler } from '../../shared/http/asyncHandler.js';

export const createPaymentController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const payment = await paymentsService.createPaymentService({
      ...req.body,
      organizationId: req.user?.organizationId ?? '',
    });
    sendResponse(res, 201, true, 'Payment created successfully', payment);
  },
);

export const getPaymentController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const payment = await paymentsService.getPaymentByIdService(req.params.id);
    sendResponse(res, 200, true, 'Payment retrieved successfully', payment);
  },
);

export const getPaymentsController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const payments = await paymentsService.getPaymentsService({
      organizationId: req.user?.organizationId ?? '',
      status:
        (req.query.status as string | undefined) as
          | import('./payments.model.js').PaymentStatus
          | undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      cursor: req.query.cursor as string | undefined,
    });
    sendResponse(res, 200, true, 'Payments retrieved successfully', payments, {
      count: payments.length,
    });
  },
);

export const updatePaymentStatusController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const payment = await paymentsService.updatePaymentStatusService(
      req.params.id,
      req.body,
    );
    sendResponse(
      res,
      200,
      true,
      'Payment status updated successfully',
      payment,
    );
  },
);
