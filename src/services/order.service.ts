import { and, eq } from 'drizzle-orm';

import db from '@/db';
import { orders } from '@/db/schema';
import { BadRequestException, ForbiddenException, NotFoundException } from '@/exceptions';
import {
  DEFAULT_ITEMS_PER_PAGE,
  DEFAULT_PAGE_NUMBER,
  ERROR_MESSAGES,
  OrderStatus,
  PaymentStatus,
} from '@/constants';
import {
  CreateOrderItem,
  FilterConfig,
  GetOrdersFilters,
  Order,
  OrderByConfig,
  OrderFilters,
  OrderOrderByFields,
  OrderDetails,
  OrderDetailsItem,
  PaginatedResult,
} from '@/models';
import { buildOrderBy, buildWhere, calcTotalPages } from '@/utils';
import { CartModel, OrderItemModel, OrderModel, PaymentModel } from '@/db/models';
import cartService from './cart.service';
import paymentService from './payment.service';
import webhookService from './webhook.service';
import { withTransaction } from '@/db/transaction';

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

    const listQuery = OrderModel.list({
      whereConditions,
      orderByConditions,
      page,
      perPage,
    });
    const countQuery = OrderModel.count(whereConditions);

    const [data, totalCount] = await Promise.all([listQuery, countQuery]);

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

  async checkout(userId: number): Promise<OrderDetails> {
    const orderId = await withTransaction<number>(async () => {
      const cartDetails = await cartService.getCartDetails(userId);

      if (!cartDetails?.items?.length) {
        throw new BadRequestException(ERROR_MESSAGES.CART_IS_EMPTY);
      }

      const order = await OrderModel.create({
        userId,
        status: OrderStatus.PENDING,
        totalAmount: cartDetails.totalAmount,
      });

      const orderItemsToInsert: CreateOrderItem[] = cartDetails.items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      await OrderItemModel.createMany(orderItemsToInsert);
      await CartModel.clear(cartDetails.id);

      return order.id;
    });

    const orderDetails = await this.getOrderDetails(orderId);

    return orderDetails!;
  }

  async getOrderById(orderId: number, userId: number): Promise<OrderDetails | null> {
    const orderDetails = await this.getOrderDetails(orderId);

    if (!orderDetails) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_DOES_NOT_EXIST);
    }

    if (orderDetails.userId !== userId) {
      throw new ForbiddenException();
    }

    return orderDetails;
  }

  async payOrder(orderId: number, userId: number): Promise<string> {
    const order = await db.query.orders.findFirst({
      where: {
        id: orderId,
        userId,
      },
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
      where: { id: orderId },
      with: { payment: true },
    });

    if (!order) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_DOES_NOT_EXIST);
    }

    if (order?.payment?.status === PaymentStatus.PAID) return;

    await withTransaction<void>(async () => {
      await OrderModel.updateById(orderId, { status: PaymentStatus.PAID });
      await PaymentModel.updateByOrderId(orderId, { status: PaymentStatus.PAID });
    });
  }

  async getOrderDetails(orderId: number): Promise<OrderDetails | null> {
    const orderDetails = await OrderModel.getOrderDetails(orderId);

    if (!orderDetails) {
      return null;
    }

    const items: OrderDetailsItem[] = orderDetails.items.map(item => ({
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      title: item.product!.title,
      picture: item.product!.picture,
    }));

    return {
      ...orderDetails,
      items,
    };
  }
}

export default new OrderService();
