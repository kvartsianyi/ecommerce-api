import { eq, getTableColumns, sql } from 'drizzle-orm';

import db from '@/db';
import { cartItems, carts, orderItems, orders, products } from '@/db/schema';
import { BadRequestException } from '@/exceptions';
import cartService from './cart.service';
import { ERROR_MESSAGES, OrderStatus } from '@/constants';
import {
  CartSummaryItem,
  CreateOrder,
  CreateOrderItem,
  Order,
  OrderItem,
  OrderSummary,
  OrderSummaryItem,
  OrderWithItems,
  QueryContext,
} from '@/models';
import productService from './product.service';
import { jsonAgg } from '@/utils';

class OrderService {
  async checkout(userId: number): Promise<OrderSummary> {
    const order = await db.transaction(async tx => {
      const cartItemsQuery = tx
        .select({ id: cartItems.id })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .innerJoin(carts, eq(cartItems.cartId, carts.id))
        .where(eq(carts.userId, userId));
      await tx.execute(sql`${cartItemsQuery} for update of ${products}`);

      const cartDetails = await cartService.getCartSummary(userId, tx);

      if (!cartDetails?.items?.length) {
        throw new BadRequestException(ERROR_MESSAGES.CART_IS_EMPTY);
      }

      const insufficientStockProducts = cartDetails.items.filter(
        item => item.quantity > item.stock,
      );

      if (insufficientStockProducts.length) {
        const details = insufficientStockProducts.map(item => ({
          productId: item.productId,
          requestedQuantity: item.quantity,
          availableStock: item.stock,
        }));
        throw new BadRequestException(ERROR_MESSAGES.INSUFFICIENT_STOCK, details);
      }

      for (const item of cartDetails.items) {
        await productService.updateByParams(
          { stock: sql<number>`${products.stock} - ${item.quantity}` },
          eq(products.id, item.productId),
          tx,
        );
      }

      const newOrder: CreateOrder = {
        userId,
        status: OrderStatus.PENDING,
        totalAmount: cartDetails.totalAmount,
      };
      const order = await this.createOrder(newOrder, tx);

      await this.createOrderItems(order.id, cartDetails.items, tx);

      await cartService.clearCart(cartDetails.id, tx);

      return order;
    });

    const orderSummary = await this.getOrderSummary(order.id);

    return orderSummary!;
  }

  async findOrderById(orderId: number): Promise<OrderWithItems | undefined> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
      },
    });

    return order;
  }

  async createOrder(orderData: CreateOrder, ctx: QueryContext = db): Promise<Order> {
    const [order] = await ctx.insert(orders).values(orderData).returning();

    return order;
  }

  async createOrderItems(
    orderId: number,
    cartItems: CartSummaryItem[],
    ctx: QueryContext = db,
  ): Promise<OrderItem[]> {
    const orderItemsToInsert: CreateOrderItem[] = cartItems.map(item => ({
      orderId: orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
    }));

    const createdOrderItems = await ctx.insert(orderItems).values(orderItemsToInsert).returning();

    return createdOrderItems;
  }

  async getOrderSummary(orderId: number): Promise<OrderSummary | null> {
    const itemFields = {
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: products.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      createdAt: orderItems.createdAt,
      updatedAt: orderItems.updatedAt,
      title: products.title,
      picture: products.picture,
    };

    const [orderSummary] = await db
      .select({
        ...getTableColumns(orders),
        items: jsonAgg<OrderSummaryItem[]>(itemFields),
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.id, orderId))
      .groupBy(orders.id);

    return orderSummary ?? null;
  }
}

export default new OrderService();
