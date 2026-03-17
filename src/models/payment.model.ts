import { payments } from '@/db/schema';

export type Payment = typeof payments.$inferSelect;
