import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';
import { ENV } from '@/config';
import logger from '@/logger';

const db = drizzle(ENV.DATABASE_URL, {
  schema,
});

try {
  await db.execute('select 1');
  logger.info('Database connected successfully!', { context: 'Bootstrap' });
} catch (error) {
  logger.error('Database connection failed!', { context: 'Bootstrap', error });
  process.exit(1);
}

export default db;
