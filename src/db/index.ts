import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';
import { ENV } from '@/config';
import logger from '@/logger';
import { LoggerContext } from '@/constants';

const db = drizzle(ENV.DATABASE_URL, {
  schema,
});

try {
  await db.execute('select 1');
  logger.info('Database connected successfully!', { context: LoggerContext.BOOTSTRAP });
} catch (error) {
  logger.error('Database connection failed!', { context: LoggerContext.BOOTSTRAP, error });
  process.exit(1);
}

export default db;
