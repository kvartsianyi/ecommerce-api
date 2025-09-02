import { users } from '@/db/schema';

export type User = typeof users.$inferSelect;

export type PublicUser = Omit<User, 'password'>;
