import { and, eq } from 'drizzle-orm';

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
  CheckoutSessionDetails,
} from '@/models';
import { buildOrderBy, buildWhere, calcTotalPages } from '@/utils';
import { CartModel, OrderItemModel, OrderModel, PaymentModel } from '@/db/models';
import cartService from './cart.service';
import paymentService from './payment.service';
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

  async checkout(userId: number): Promise<CheckoutSessionDetails> {
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

    const {
      url: paymentUrl,
      id: stripeSessionId,
      amount_total,
    } = await paymentService.createCheckoutSession(orderDetails!);

    await PaymentModel.create({
      orderId,
      status: PaymentStatus.UNPAID,
      amount: amount_total || 0,
      stripeSessionId,
    });

    return { paymentUrl };
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

  async payOrder(orderId: number, userId: number): Promise<CheckoutSessionDetails> {
    const order = await OrderModel.findUnpaidById(orderId, userId);

    if (!order) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_DOES_NOT_EXIST);
    }

    if (!order.payment?.stripeSessionId) {
      throw new BadRequestException(ERROR_MESSAGES.MISSING_PAYMENT_INFO);
    }

    const session = await paymentService.retrieveCheckoutSession(order.payment.stripeSessionId);

    if (session.status === 'complete') {
      throw new BadRequestException(ERROR_MESSAGES.ORDER_ALREADY_PAID);
    }

    if (session.status === 'expired') {
      throw new BadRequestException(ERROR_MESSAGES.PAYMENT_SESSION_HAS_EXPIRED);
    }

    return {
      paymentUrl: session.url,
    };
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
