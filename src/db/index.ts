import { drizzle } from 'drizzle-orm/node-postgres';

import ENV from '@/env';
import logger from '@/logger';

export const db = drizzle(ENV.DATABASE_URL, {
  logger: true,
});

try {
  await db.execute('select 1');
  logger.info('Database connection successfully!', { context: 'Bootstrap' });
} catch (error) {
  logger.error('Database connection failed!', { context: 'Bootstrap', error });
  process.exit(1);
}
