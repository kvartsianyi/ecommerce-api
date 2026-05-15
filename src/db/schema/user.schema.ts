import { sql } from 'drizzle-orm';
import { serial, pgTable, varchar, timestamp, boolean, pgEnum, check } from 'drizzle-orm/pg-core';

import { REGEXP, UserRole } from '@/constants';

const userRoles = Object.values(UserRole) as [string, ...string[]];

export const userRoleEnum = pgEnum('user_role', userRoles);

const users = pgTable(
  'users',
  {
    id: serial().primaryKey(),
    name: varchar({ length: 50 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    phone: varchar({ length: 20 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    role: userRoleEnum().notNull().default(UserRole.USER),
    isEmailConfirmed: boolean('is_email_confirmed').default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  table => [check('users_phone_check', sql`${table.phone} ~ '${REGEXP.PHONE_NUMBER}'`)],
);

export default users;
