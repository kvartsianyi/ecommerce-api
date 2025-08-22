import { products } from '@/db/schema';

export type Product = typeof products.$inferInsert;
