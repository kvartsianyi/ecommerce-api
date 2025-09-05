import { and, eq, getTableColumns, sql } from 'drizzle-orm';

import db from '@/db';
import { cartItems, carts, products } from '@/db/schema';
import {
  Cart,
  CartItem,
  UpsertCartItem,
  CartSummary,
  CartSummaryItem,
  QueryContext,
} from '@/models';
import { NotFoundException } from '@/exceptions';
import { ERROR_MESSAGES } from '@/constants';
import productService from './product.service';

class CartService {
  async addItemToCart(
    userId: number,
    cartItemData: Omit<UpsertCartItem, 'cartId'>,
  ): Promise<CartSummary> {
    const { productId } = cartItemData;

    const product = await productService.findById(productId);

    if (!product) {
      throw new NotFoundException(ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST);
    }

    const cart = await this.findOrCreateCart(userId);

    const upsertCartItem: UpsertCartItem = {
      ...cartItemData,
      cartId: cart.id,
    };
    await this.upsertCartItem(upsertCartItem);

    const cartSummary = await this.getCartSummary(userId);

    return cartSummary!;
  }

  async updateCartItem(
    userId: number,
    id: number,
    cartItemData: Pick<CartItem, 'quantity'>,
  ): Promise<CartSummary> {
    const cartItem = await this.findCartItemByUser(userId, id);

    if (!cartItem) {
      throw new NotFoundException(ERROR_MESSAGES.CART_ITEM_DOES_NOT_EXIST);
    }

    await this.updateCartItemById(id, cartItemData);

    const cartSummary = await this.getCartSummary(userId);

    return cartSummary!;
  }

  async deleteCartItem(userId: number, id: number): Promise<CartItem> {
    const cartItem = await this.findCartItemByUser(userId, id);

    if (!cartItem) {
      throw new NotFoundException(ERROR_MESSAGES.CART_ITEM_DOES_NOT_EXIST);
    }

    const deletedCartItem = await this.deleteCartItemById(cartItem.id);

    return deletedCartItem;
  }

  async findCart(userId: number, ctx: QueryContext = db): Promise<Cart | undefined> {
    const cart = await ctx.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });

    return cart;
  }

  async createCart(userId: number, ctx: QueryContext = db): Promise<Cart> {
    const [cart] = await ctx.insert(carts).values({ userId }).returning();

    return cart;
  }

  async findOrCreateCart(userId: number, ctx: QueryContext = db): Promise<Cart> {
    let cart = await this.findCart(userId, ctx);

    if (!cart) {
      cart = await this.createCart(userId, ctx);
    }

    return cart;
  }

  async getCartSummary(userId: number): Promise<CartSummary | null> {
    const cartItemFields = sql<CartSummaryItem[]>`
      json_agg(json_build_object(
        'id', ${cartItems}.id,
        'productId', ${products}.id,
        'title', ${products}.title,
        'price', ${products}.price,
        'stock', ${products}.stock,
        'quantity', ${cartItems}.quantity
      )) FILTER (WHERE ${cartItems}.id IS NOT NULL)`;

    const [cartSummary] = await db
      .select({
        id: carts.id,
        totalAmount: sql<number>`COALESCE(SUM(${cartItems.quantity} * ${products.price})::int, 0)`,
        items: sql<CartSummaryItem[]>`COALESCE(${cartItemFields}, '[]'::json)`,
      })
      .from(carts)
      .leftJoin(cartItems, eq(cartItems.cartId, carts.id))
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(carts.userId, userId))
      .groupBy(carts.id);

    return cartSummary ?? null;
  }

  async findCartItemByUser(userId: number, cartItemId: number): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .select(getTableColumns(cartItems))
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(and(eq(cartItems.id, cartItemId), eq(carts.userId, userId)));

    return cartItem;
  }

  async updateCartItemById(
    id: number,
    cartItemData: Partial<CartItem>,
    ctx: QueryContext = db,
  ): Promise<CartItem> {
    const [cartItem] = await ctx
      .update(cartItems)
      .set(cartItemData)
      .where(eq(cartItems.id, id))
      .returning();

    return cartItem;
  }

  async upsertCartItem(cartItemData: UpsertCartItem, ctx: QueryContext = db): Promise<CartItem> {
    const [cartItem] = await ctx
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

  async deleteCartItemById(id: number): Promise<CartItem> {
    const [cartItem] = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();

    return cartItem;
  }
}

export default new CartService();
