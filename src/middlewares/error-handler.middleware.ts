import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

import { HttpException } from '@/exceptions';
import { HttpStatusCode } from '@/constants';
import logger from '@/logger';

export const errorHandlerMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.statusCode,
      },
    });
  } else if (err instanceof Joi.ValidationError) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      error: {
        message: 'Validation Error',
        code: HttpStatusCode.BAD_REQUEST,
        errors: err.details.map(({ message, path }) => ({ field: path.join('.'), message })),
      },
    });
  } else {
    logger.error('Unhandled error occurred', { context: 'ErrorHandler', error: err });
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Something went wrong!',
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
      },
    });
  }
};
