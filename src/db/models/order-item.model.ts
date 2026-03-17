import { BaseModel } from './base.model';
import { orderItems } from '../schema';
import { CreateOrderItem, QueryContext } from '@/models';
import db from '..';

export class OrderItemModel extends BaseModel {
  static async createMany(dtos: CreateOrderItem[], ctx: QueryContext = db) {
    const createdOrderItems = await ctx.insert(orderItems).values(dtos).returning();

    return createdOrderItems;
  }
}
