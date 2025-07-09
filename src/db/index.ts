import { drizzle } from 'drizzle-orm/node-postgres';

import ENV from '@/env';

export const db = drizzle(ENV.DATABASE_URL, {
  logger: true,
});

try {
  await db.execute('select 1');
  console.log('Database connection successfully!');
} catch (error) {
  console.error('Database connection failed!\n', error);
  process.exit(1);
}
