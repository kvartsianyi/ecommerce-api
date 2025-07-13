import { Request, Response, NextFunction } from 'express';

import { NotFoundException } from '@/exceptions';

export function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  next(new NotFoundException('Resource not found'));
}
