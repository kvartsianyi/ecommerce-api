import { count as countFn, eq, SQL } from 'drizzle-orm';

import { Product } from '@/models';
import { products } from '../schema';
import { BaseModel } from './base.model';
import db from '..';
import { calcOffset } from '@/utils';

export class ProductModel extends BaseModel {
  static async findById(id: number) {
    return db.query.products.findFirst({
      where: { id },
    });
  }

  static async create(dto: Product) {
    const [product] = await db.insert(products).values(dto).returning();

    return product;
  }

  static async updateById(id: number, dto: Partial<Product>) {
    const [product] = await db.update(products).set(dto).where(eq(products.id, id)).returning();

    return product;
  }

  static async deleteById(id: number) {
    const [product] = await db.delete(products).where(eq(products.id, id)).returning();

    return product;
  }

  static async list({
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
      .from(products)
      .where(whereConditions)
      .limit(perPage)
      .offset(calcOffset(page, perPage))
      .orderBy(orderByConditions);
  }

  static async count(whereConditions: SQL | undefined): Promise<number> {
    const [{ count }] = await db.select({ count: countFn() }).from(products).where(whereConditions);

    return count;
  }
}
