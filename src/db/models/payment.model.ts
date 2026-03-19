import { eq } from 'drizzle-orm';

import { BaseModel } from './base.model';
import { payments } from '../schema';
import { Payment } from '@/models';

export class PaymentModel extends BaseModel {
  static async create(dto: Omit<Payment, 'id' | 'stripePaymentId' | 'createdAt' | 'updatedAt'>) {
    return this.db.insert(payments).values(dto).returning();
  }

  static async updateByOrderId(id: number, dto: Partial<Payment>) {
    return this.db.update(payments).set(dto).where(eq(payments.orderId, id)).returning();
  }
}
