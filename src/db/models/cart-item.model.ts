import { and, eq, getTableColumns, sql } from 'drizzle-orm';

import { cartItems, carts } from '../schema';
import { BaseModel } from './base.model';
import db from '..';
import { CartItem, UpsertCartItem } from '@/models';

export class CartItemModel extends BaseModel {
  static async findByCartId(cartId: number) {
    const cartItemsList = await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));

    return cartItemsList;
  }

  static async findByIdAndUserId(id: number, userId: number) {
    const [cartItem] = await db
      .select(getTableColumns(cartItems))
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(and(eq(cartItems.id, id), eq(carts.userId, userId)));

    return cartItem;
  }

  static async updateById(id: number, dto: Partial<CartItem>) {
    const [cartItem] = await db.update(cartItems).set(dto).where(eq(cartItems.id, id)).returning();

    return cartItem;
  }

  static async upsertCartItem(cartItemData: UpsertCartItem) {
    const [cartItem] = await db
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
    const [cartItem] = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();

    return cartItem;
  }
}
