import { serial, pgTable, varchar, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';

import { UserRole } from '@/constants';

const userRoles = Object.values(UserRole) as [string, ...string[]];

export const userRoleEnum = pgEnum('user_role', userRoles);

const users = pgTable('users', {
  id: serial().primaryKey(),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: userRoleEnum().notNull().default(UserRole.USER),
  isEmailConfirmed: boolean('is_email_confirmed').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export default users;
