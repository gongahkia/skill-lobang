import { Request, Response, NextFunction } from 'express';
import { sendServerError } from '@/utils/response';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  if (res.headersSent) {
    return next(error);
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    sendServerError(res, error.message);
  } else {
    sendServerError(res, 'Something went wrong');
  }
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
};