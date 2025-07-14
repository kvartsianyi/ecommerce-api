import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

export const validateBody =
  (schema: ObjectSchema) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true });

      next();
    } catch (e) {
      next(e);
    }
  };
