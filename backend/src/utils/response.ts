import { Response } from 'express';
import { ApiResponse } from '@/types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400,
  data?: unknown
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    data,
  };
  return res.status(statusCode).json(response);
};

export const sendValidationError = (res: Response, error: string): Response => {
  return sendError(res, error, 422);
};

export const sendNotFound = (res: Response, message: string = 'Resource not found'): Response => {
  return sendError(res, message, 404);
};

export const sendUnauthorized = (res: Response, message: string = 'Unauthorized'): Response => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res: Response, message: string = 'Forbidden'): Response => {
  return sendError(res, message, 403);
};

export const sendServerError = (res: Response, message: string = 'Internal server error'): Response => {
  return sendError(res, message, 500);
};