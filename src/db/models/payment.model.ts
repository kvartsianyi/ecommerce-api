import { eq } from 'drizzle-orm';

import { BaseModel } from './base.model';
import { payments } from '../schema';
import { CreatePayment, Payment } from '@/models';

export class PaymentModel extends BaseModel {
  static async findByOrderId(id: number) {
    return this.db.query.payments.findFirst({
      where: { id },
    });
  }

  static async create(dto: CreatePayment) {
    return this.db.insert(payments).values(dto).returning();
  }

  static async updateByOrderId(id: number, dto: Partial<Payment>) {
    return this.db.update(payments).set(dto).where(eq(payments.orderId, id)).returning();
  }
}
