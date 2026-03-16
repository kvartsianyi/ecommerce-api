import { eq } from 'drizzle-orm';

import { cartItems, carts } from '../schema';
import { BaseModel } from './base.model';
import db from '..';

export class CartModel extends BaseModel {
  static async findById(id: number) {
    return db.query.carts.findFirst({
      where: { id },
    });
  }

  static async findByUserId(userId: number) {
    return db.query.carts.findFirst({
      where: { userId },
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

  static getCartDetails(userId: number) {
    return db.query.carts.findFirst({
      where: {
        userId,
      },
      with: {
        items: {
          orderBy: {
            id: 'asc',
          },
          with: {
            product: true,
          },
        },
      },
    });
  }
}
