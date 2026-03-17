import { eq } from 'drizzle-orm';

import { BaseModel } from './base.model';
import { payments } from '../schema';
import { Payment } from '@/models';

export class PaymentModel extends BaseModel {
  static async updateByOrderId(id: number, dto: Partial<Payment>) {
    return this.db.update(payments).set(dto).where(eq(payments.orderId, id));
  }
}
