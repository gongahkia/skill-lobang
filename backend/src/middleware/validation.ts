import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { sendValidationError } from '@/utils/response';

export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      sendValidationError(res, errorMessage);
      return;
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      sendValidationError(res, errorMessage);
      return;
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      sendValidationError(res, errorMessage);
      return;
    }

    req.params = value;
    next();
  };
};