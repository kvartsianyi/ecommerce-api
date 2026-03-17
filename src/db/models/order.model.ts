import { count as countFn, eq, SQL } from 'drizzle-orm';

import { BaseModel } from './base.model';
import { orders } from '../schema';
import db from '..';
import { CreateOrder, Order, QueryContext } from '@/models';
import { calcOffset } from '@/utils';

export class OrderModel extends BaseModel {
  static async findById(id: number) {
    return db.query.orders.findFirst({
      where: { id },
    });
  }

  static async create(dto: CreateOrder, ctx: QueryContext = db) {
    const [order] = await ctx.insert(orders).values(dto).returning();

    return order;
  }

  static async updateById(id: number, dto: Partial<Order>, ctx: QueryContext = db) {
    const [product] = await ctx.update(orders).set(dto).where(eq(orders.id, id)).returning();

    return product;
  }

  static getOrderDetails(orderId: number) {
    return db.query.orders.findFirst({
      where: {
        id: orderId,
      },
      with: {
        items: {
          with: {
            product: true,
          },
        },
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
    return db
      .select()
      .from(orders)
      .where(whereConditions)
      .limit(perPage)
      .offset(calcOffset(page, perPage))
      .orderBy(orderByConditions);
  }

  static async count(whereConditions: SQL | undefined): Promise<number> {
    const [{ count }] = await db.select({ count: countFn() }).from(orders).where(whereConditions);

    return count;
  }
}
