import { users } from '@/db/schema';

export type User = typeof users.$inferInsert;

export type PublicUser = Omit<User, 'password'>;
