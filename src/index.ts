import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

import ENV from '@/env';
import logger from '@/logger';
import { HttpStatusCode } from '@/constants';
import { HttpException } from '@/exceptions';
import { notFoundMiddleware, wrapResponseMiddleware } from '@/middlewares';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(wrapResponseMiddleware);
app.use(notFoundMiddleware);

const server = app.listen(ENV.PORT, () =>
  logger.info('Server is running on port %d', ENV.PORT, { context: 'Bootstrap' }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpException) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.statusCode,
      },
    });
  } else {
    logger.error('Unhandled error occurred', { context: 'ErrorHandler', error: err });
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong!' });
  }
});

const gracefulShutdown = (err?: Error | null) => server.close(() => process.exit(err ? 1 : 0));

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', gracefulShutdown);
process.on('unhandledRejection', gracefulShutdown);
