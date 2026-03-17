import { eq, sql } from 'drizzle-orm';

import { cartItems } from '../schema';
import { BaseModel } from './base.model';
import { CartItem, UpsertCartItem } from '@/models';

export class CartItemModel extends BaseModel {
  static async findManyByCartId(cartId: number) {
    return this.db.query.cartItems.findMany({
      where: {
        cartId,
      },
    });
  }

  static async findByIdAndUserId(id: number, userId: number) {
    return this.db.query.cartItems.findFirst({
      where: {
        id,
        cart: {
          userId,
        },
      },
    });
  }

  static async updateById(id: number, dto: Partial<CartItem>) {
    const [cartItem] = await this.db
      .update(cartItems)
      .set(dto)
      .where(eq(cartItems.id, id))
      .returning();

    return cartItem;
  }

  static async upsertCartItem(cartItemData: UpsertCartItem) {
    const [cartItem] = await this.db
      .insert(cartItems)
      .values(cartItemData)
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.productId],
        set: {
          quantity: sql<number>`${cartItems.quantity} + ${cartItemData.quantity}`,
        },
      })
      .returning();

    return cartItem;
  }

  static async deleteById(id: number) {
    const [cartItem] = await this.db.delete(cartItems).where(eq(cartItems.id, id)).returning();

    return cartItem;
  }
}
