import { Request, Response, NextFunction } from 'express';

export const wrapResponseMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const originalJson = res.json;

  res.json = function (body: unknown) {
    return originalJson.call(this, { data: body });
  };

  next();
};
