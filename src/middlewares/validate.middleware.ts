import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

import { idParamSchema } from '@/validators';

type ValidationPath = 'body' | 'params' | 'query';

const validate =
  (schema: ObjectSchema, path: ValidationPath = 'body') =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.validateAsync(req[path], { abortEarly: false, stripUnknown: true });

      next();
    } catch (e) {
      next(e);
    }
  };

export const validateBody = validate;
export const validateParams = (schema: ObjectSchema) => validate(schema, 'params');

export const validateIdParam = validateParams(idParamSchema);
