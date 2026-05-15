import { count as countFn, eq, SQL } from 'drizzle-orm';

import { BaseModel } from './base.model';
import { orders } from '../schema';
import { CreateOrder, Order } from '@/models';
import { calcOffset } from '@/utils';
import { OrderStatus, PaymentStatus } from '@/constants';

export class OrderModel extends BaseModel {
  static async findById(id: number) {
    return this.db.query.orders.findFirst({
      where: { id },
    });
  }

  static async findUnpaidById(id: number, userId?: number) {
    return this.db.query.orders.findFirst({
      where: {
        id,
        userId,
        status: OrderStatus.PENDING,
      },
      with: {
        payment: {
          where: {
            NOT: { status: PaymentStatus.PAID },
          },
        },
      },
    });
  }

  static async findActiveById(id: number, userId?: number) {
    return this.db.query.orders.findFirst({
      where: {
        id,
        userId,
        NOT: {
          status: OrderStatus.CANCELED,
        },
      },
    });
  }

  static async create(dto: CreateOrder) {
    const [order] = await this.db.insert(orders).values(dto).returning();

    return order;
  }

  static async updateById(id: number, dto: Partial<Order>) {
    const [product] = await this.db.update(orders).set(dto).where(eq(orders.id, id)).returning();

    return product;
  }

  static getOrderDetails(orderId: number) {
    return this.db.query.orders.findFirst({
      where: {
        id: orderId,
      },
      with: {
        items: true,
      },
    });
  }

  static list({
    whereConditions,
    orderByConditions,
    page = 1,
    perPage = 10,
  }: {
    whereConditions?: SQL;
    orderByConditions: SQL;
    page?: number;
    perPage?: number;
  }) {
    return this.db
      .select()
      .from(orders)
      .where(whereConditions)
      .limit(perPage)
      .offset(calcOffset(page, perPage))
      .orderBy(orderByConditions);
  }

  static async count(whereConditions: SQL | undefined): Promise<number> {
    const [{ count }] = await this.db
      .select({ count: countFn() })
      .from(orders)
      .where(whereConditions);

    return count;
  }
}
