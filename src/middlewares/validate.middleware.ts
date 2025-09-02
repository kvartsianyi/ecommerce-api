import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

import { idParamSchema } from '@/validators';

type ValidationPath = 'body' | 'params' | 'query';

const validate =
  (schema: ObjectSchema, path: ValidationPath = 'body') =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const value = await schema.validateAsync(req[path], {
        abortEarly: false,
        stripUnknown: true,
      });

      Object.defineProperty(req, path, {
        get: () => value,
      });

      next();
    } catch (e) {
      next(e);
    }
  };

export const validateBody = validate;
export const validateParams = (schema: ObjectSchema) => validate(schema, 'params');
export const validateQuery = (schema: ObjectSchema) => validate(schema, 'query');

export const validateIdParam = validateParams(idParamSchema);
