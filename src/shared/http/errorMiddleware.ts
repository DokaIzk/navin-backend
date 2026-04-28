// src/shared/http/errorMiddleware.ts
import type { ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError, ErrorCodes } from './errors.js';

export function errorMiddleware(): ErrorRequestHandler {
  return (err, _req, res, _next) => {
    const isDev = (process.env.NODE_ENV || 'development') !== 'production';

    // Helper to keep the payload consistent
    const respond = (status: number, message: string, code: string) => {
      return res.status(status).json({
        success: false,
        message,
        error: { code }, // Standardized envelope for frontend
        ...(isDev && { stack: err.stack }),
      });
    };

    // Malformed JSON body
    if (
      err instanceof SyntaxError &&
      'status' in err &&
      (err as { status?: number }).status === 400
    ) {
      return respond(400, 'Invalid JSON payload', ErrorCodes.BAD_REQUEST);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
      return respond(400, `Duplicate value for ${field}.`, ErrorCodes.DUPLICATE_KEY);
    }

    // Mongoose validation error
    if (err instanceof mongoose.Error.ValidationError) {
      const message = Object.values(err.errors)
        .map((e: mongoose.Error.ValidatorError | mongoose.Error.CastError) => e.message)
        .join(', ');
      return respond(422, message, ErrorCodes.VALIDATION_ERROR);
    }

    // App-level operational errors
    if (err instanceof AppError) {
      return respond(err.statusCode, err.message, err.code);
    }

    // CORS origin rejection
    if (err instanceof Error && err.message === 'Not allowed by CORS') {
      return respond(403, 'CORS origin denied', ErrorCodes.FORBIDDEN);
    }

    // Fallback
    return respond(500, 'Internal Server Error', ErrorCodes.INTERNAL_ERROR);
  };
}
