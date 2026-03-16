import { and, count, eq, getTableColumns, sql } from 'drizzle-orm';

import db from '@/db';
import { cartItems, carts, orderItems, orders, payments, products } from '@/db/schema';
import { BadRequestException, ForbiddenException, NotFoundException } from '@/exceptions';
import {
  DEFAULT_ITEMS_PER_PAGE,
  DEFAULT_PAGE_NUMBER,
  ERROR_MESSAGES,
  OrderStatus,
  PaymentStatus,
} from '@/constants';
import {
  CartSummaryItem,
  CreateOrder,
  CreateOrderItem,
  FilterConfig,
  GetOrdersFilters,
  Order,
  OrderByConfig,
  OrderFilters,
  OrderItem,
  OrderOrderByFields,
  OrderSummary,
  OrderSummaryItem,
  PaginatedResult,
  QueryContext,
} from '@/models';
import { buildOrderBy, buildWhere, calcOffset, calcTotalPages, jsonAgg } from '@/utils';
import paymentService from './payment.service';
import webhookService from './webhook.service';
import { CartModel, ProductModel } from '@/db/models';

class OrderService {
  async getOrders(userId: number, filters: GetOrdersFilters): Promise<PaginatedResult<Order>> {
    const { page = DEFAULT_PAGE_NUMBER, perPage = DEFAULT_ITEMS_PER_PAGE } = filters;

    const filterConfig: FilterConfig<OrderFilters> = {
      status: value => eq(orders.status, value),
    };
    const orderByConfig: OrderByConfig<OrderOrderByFields> = {
      _default: orders.createdAt,
    };

    const whereConditions = and(eq(orders.userId, userId), buildWhere(filters, filterConfig));
    const orderByConditions = buildOrderBy(filters, orderByConfig);

    const query = db
      .select()
      .from(orders)
      .where(whereConditions)
      .limit(perPage)
      .offset(calcOffset(page, perPage))
      .orderBy(orderByConditions);
    const countQuery = db.select({ count: count() }).from(orders).where(whereConditions);

    const [data, [{ count: totalCount }]] = await Promise.all([query, countQuery]);

    const meta = {
      page,
      perPage,
      totalPages: calcTotalPages(totalCount, perPage),
    };

    return {
      data,
      meta,
    };
  }

  async checkout(userId: number): Promise<OrderSummary> {
    const order = await db.transaction(async tx => {
      const cartItemsQuery = tx
        .select({ id: cartItems.id })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .innerJoin(carts, eq(cartItems.cartId, carts.id))
        .where(eq(carts.userId, userId));
      await tx.execute(sql`${cartItemsQuery} for update of ${products}`);

      const cartDetails = await CartModel.getCartSummary(userId); // TODO: Need to pass transaction context or use drizzle API instead here

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
        await ProductModel.updateById(item.productId, {
          stock: item.stock - item.quantity,
        });
      }

      const newOrder: CreateOrder = {
        userId,
        status: OrderStatus.PENDING,
        totalAmount: cartDetails.totalAmount,
      };
      const order = await this.createOrder(newOrder, tx);

      await this.createOrderItems(order.id, cartDetails.items, tx);

      await CartModel.clear(cartDetails.id); // TODO: Need to pass transaction context or use drizzle API instead here

      return order;
    });

    const orderSummary = await this.getOrderSummary(order.id);

    return orderSummary!;
  }

  async getOrderById(orderId: number, userId: number): Promise<OrderSummary | null> {
    const orderSummary = await this.getOrderSummary(orderId);

    if (!orderSummary) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_DOES_NOT_EXIST);
    }

    if (orderSummary.userId !== userId) {
      throw new ForbiddenException();
    }

    return orderSummary;
  }

  async payOrder(orderId: number, userId: number): Promise<string> {
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
      with: { payment: true },
    });

    if (!order) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_DOES_NOT_EXIST);
    }

    if (order?.payment?.status === PaymentStatus.PAID) {
      throw new BadRequestException(ERROR_MESSAGES.ORDER_ALREADY_PAID);
    }

    await webhookService.ensureStripeWebhookExists();

    let paymentIntent;
    if (!order?.payment) {
      paymentIntent = await paymentService.createPaymentIntent({
        orderId,
        amount: order.totalAmount,
      });
    } else {
      paymentIntent = await paymentService.retrievePaymentIntent(order.payment.stripePaymentId);
    }

    return paymentIntent.id;
  }

  async markOrderPaid(orderId: number): Promise<void> {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { payment: true },
    });

    if (!order) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_DOES_NOT_EXIST);
    }

    if (order?.payment?.status === PaymentStatus.PAID) return;

    await db.transaction(async tx => {
      await this.updateOrderById(orderId, { status: PaymentStatus.PAID }, tx);
      await tx
        .update(payments)
        .set({ status: PaymentStatus.PAID })
        .where(eq(payments.orderId, orderId));
    });
  }

  async createOrder(orderData: CreateOrder, ctx: QueryContext = db): Promise<Order> {
    const [order] = await ctx.insert(orders).values(orderData).returning();

    return order;
  }

  async findOrderById(orderId: number): Promise<Order> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));

    return order;
  }

  async updateOrderById(
    orderId: number,
    orderData: Partial<Order>,
    ctx: QueryContext = db,
  ): Promise<Order> {
    const [order] = await ctx
      .update(orders)
      .set(orderData)
      .where(eq(orders.id, orderId))
      .returning();

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
