import { drizzle } from 'drizzle-orm/node-postgres';

import { users } from '@/db/schema';
import { ENV } from '@/config';
import logger from '@/logger';
import { LoggerContext, UserRole } from '@/constants';

const db = drizzle(ENV.DATABASE_URL);

try {
  await db.insert(users).values({
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'admin-email@domain.com',
    password: '$2b$10$WwvROkO1gvDi0UEkGEDSl.n2zm9wHlL9DXtlwoDCfxzTkIOAR5Y1C',
    role: UserRole.ADMIN,
    isEmailConfirmed: true,
  });

  logger.info('Database seeding completed successfully!', { context: LoggerContext.BOOTSTRAP });
  process.exit(0);
} catch (error) {
  logger.error('Database seeding failed!', { context: LoggerContext.BOOTSTRAP, error });
  process.exit(1);
}
