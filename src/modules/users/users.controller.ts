import type { RequestHandler } from 'express';
import { registerUser } from './users.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';

export const createUserController: RequestHandler = async (req, res) => {
  const user = await registerUser(req.body);
  sendResponse(res, 201, true, 'User registered successfully', user);
};
