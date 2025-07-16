import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import morgan from 'morgan';

import routes from '@/routes';
import logger from '@/logger';
import { ENV } from '@/config';
import { API_PREFIX } from '@/constants';
import { notFoundMiddleware, errorHandlerMiddleware } from '@/middlewares';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/public', express.static(resolve(__dirname, './public')));

app.use(API_PREFIX, routes);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const server = app.listen(ENV.PORT, () =>
  logger.info('Server is running on port %d', ENV.PORT, { context: 'Bootstrap' }),
);

const gracefulShutdown = (err?: Error | null) => server.close(() => process.exit(err ? 1 : 0));

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', gracefulShutdown);
process.on('unhandledRejection', gracefulShutdown);
