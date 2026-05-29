import type { RequestHandler } from 'express';
import { sendResponse } from '../../shared/http/sendResponse.js';
import * as stellarWebhookService from './stellar.webhook.service.js';

export const handleStellarWebhookController: RequestHandler = async (req, res) => {
  const result = await stellarWebhookService.handleStellarWebhookEvent(req.body);
  sendResponse(res, 200, true, 'Webhook processed successfully', result);
};
