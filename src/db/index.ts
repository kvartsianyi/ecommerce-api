import { drizzle } from 'drizzle-orm/node-postgres';

import { ENV } from '@/config';
import logger from '@/logger';
import { LoggerContext } from '@/constants';
import { relations } from './relations';
import { dbContextStorage } from './db-context.storage';

const db = drizzle(ENV.DATABASE_URL, {
  relations,
  logger: process.stdout.isTTY,
});

try {
  await db.execute('select 1');
  logger.info('Database connected successfully!', { context: LoggerContext.BOOTSTRAP });
} catch (error) {
  logger.error('Database connection failed!', { context: LoggerContext.BOOTSTRAP, error });
  process.exit(1);
}

export const getDb = () => {
  const store = dbContextStorage.getStore();

  return store?.tx ?? db;
};

export default db;
