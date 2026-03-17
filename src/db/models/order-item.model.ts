import { BaseModel } from './base.model';
import { orderItems } from '../schema';
import { CreateOrderItem } from '@/models';

export class OrderItemModel extends BaseModel {
  static async createMany(dtos: CreateOrderItem[]) {
    const createdItems = await this.db.insert(orderItems).values(dtos).returning();

    return createdItems;
  }
}
