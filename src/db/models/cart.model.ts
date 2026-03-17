import { eq } from 'drizzle-orm';

import { cartItems, carts } from '../schema';
import { Cart } from '@/models';
import { BaseModel } from './base.model';

export class CartModel extends BaseModel {
  static async findById(id: number) {
    return this.db.query.carts.findFirst({
      where: { id },
    });
  }

  static async findByUserId(userId: number) {
    return this.db.query.carts.findFirst({
      where: { userId },
    });
  }

  static async create(userId: number) {
    const [cart] = await this.db.insert(carts).values({ userId }).returning();

    return cart;
  }

  static async clear(cartId: number) {
    const deletedCartItems = await this.db
      .delete(cartItems)
      .where(eq(cartItems.cartId, cartId))
      .returning();

    return deletedCartItems;
  }

  static async ensureCartExists(userId: number): Promise<Cart> {
    let cart = await CartModel.findByUserId(userId);

    if (!cart) {
      cart = await CartModel.create(userId);
    }

    return cart;
  }

  static async getCartDetails(userId: number) {
    return this.db.query.carts.findFirst({
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
