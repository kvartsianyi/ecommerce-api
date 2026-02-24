import { eq, sql } from 'drizzle-orm';

import { cartItems, carts, products } from '../schema';
import { BaseModel } from './base.model';
import { CartSummaryItem } from '@/models';
import { jsonAgg } from '@/utils';
import db from '..';

export class CartModel extends BaseModel {
  static async findById(id: number) {
    return db.query.carts.findFirst({
      where: eq(carts.id, id),
    });
  }

  static async findByUserId(userId: number) {
    return db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });
  }

  static async create(userId: number) {
    const [cart] = await db.insert(carts).values({ userId }).returning();

    return cart;
  }

  static async clear(cartId: number) {
    const deletedCartItems = await db
      .delete(cartItems)
      .where(eq(cartItems.cartId, cartId))
      .returning();

    return deletedCartItems;
  }

  static async findOrCreateCart(userId: number) {
    let cart = await CartModel.findByUserId(userId);

    if (!cart) {
      cart = await CartModel.create(userId);
    }

    return cart;
  }

  static async getCartSummary(userId: number) {
    const [cartSummary] = await db
      .select({
        id: carts.id,
        totalAmount: sql<number>`COALESCE(SUM(${cartItems.quantity} * ${products.price})::int, 0)`,
        items: jsonAgg<CartSummaryItem[]>({
          id: cartItems.id,
          productId: products.id,
          title: products.title,
          price: products.price,
          stock: products.stock,
          quantity: cartItems.quantity,
        }),
      })
      .from(carts)
      .leftJoin(cartItems, eq(cartItems.cartId, carts.id))
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(carts.userId, userId))
      .groupBy(carts.id);

    return cartSummary ?? null;
  }
}
