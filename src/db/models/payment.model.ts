import { eq } from 'drizzle-orm';

import { BaseModel } from './base.model';
import { payments } from '../schema';
import db from '..';
import { Payment, QueryContext } from '@/models';

export class PaymentModel extends BaseModel {
  static async updateByOrderId(id: number, dto: Partial<Payment>, ctx: QueryContext = db) {
    return ctx.update(payments).set(dto).where(eq(payments.orderId, id));
  }
}
