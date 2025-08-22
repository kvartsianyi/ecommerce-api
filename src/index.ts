import express from 'express';
import morgan from 'morgan';

import '@/passport';
import routes from '@/routes';
import logger from '@/logger';
import { ENV } from '@/config';
import { notFoundMiddleware, errorHandlerMiddleware } from '@/middlewares';
import {
  API_PREFIX,
  PUBLIC_ASSETS_ENDPOINT,
  PUBLIC_ASSETS_FOLDER_PATH,
  UPLOADS_ENDPOINT,
  UPLOADS_FOLDER_PATH,
} from '@/constants';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(PUBLIC_ASSETS_ENDPOINT, express.static(PUBLIC_ASSETS_FOLDER_PATH));
app.use(UPLOADS_ENDPOINT, express.static(UPLOADS_FOLDER_PATH));

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
