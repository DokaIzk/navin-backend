import type { RequestHandler } from 'express';
import * as usersService from './users.service.js';
import { sendResponse } from '../../shared/http/sendResponse.js';

export const createUserController: RequestHandler = async (req, res) => {
  const user = await usersService.registerUser(req.body);
  sendResponse(res, 201, true, 'User registered successfully', user);
};

export const deleteUserController: RequestHandler = async (req, res) => {
  await usersService.deleteUser(req.params.id);
  res.json({ success: true, message: 'User deleted successfully' });
};
