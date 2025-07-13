import { NextFunction, Request, Response } from 'express';

type Controller = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response | void> | Response | void;

export const wrapAsyncErrors =
  (controller: Controller) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
