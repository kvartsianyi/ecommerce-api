import { and, eq } from 'drizzle-orm';

import { orders } from '@/db/schema';
import { BadRequestException, ForbiddenException, NotFoundException } from '@/exceptions';
import {
  DEFAULT_ITEMS_PER_PAGE,
  DEFAULT_PAGE_NUMBER,
  DELIVERY_COSTS,
  ERROR_MESSAGES,
  OrderStatus,
  PickupMethod,
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
  PaginatedResult,
  CheckoutSessionDetails,
  CheckoutPayload,
  CartDetailsItem,
} from '@/models';
import { buildOrderBy, buildWhere, calcTotalPages } from '@/utils';
import { CartModel, OrderItemModel, OrderModel } from '@/db/models';
import cartService from './cart.service';
import { paymentService } from './payment';
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

  async checkout(userId: number, checkoutData: CheckoutPayload): Promise<CheckoutSessionDetails> {
    const orderId = await this.createFromCart(userId, checkoutData);
    const orderDetails = await OrderModel.getOrderDetails(orderId);

    if (!orderDetails) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_DOES_NOT_EXIST);
    }

    const { paymentUrl } = await paymentService.createPayment(
      orderId,
      orderDetails.totalAmount,
      checkoutData.paymentMethod,
    );

    return { paymentUrl, orderId };
  }

  async getOrderById(orderId: number, userId: number): Promise<OrderDetails | null> {
    const orderDetails = await OrderModel.getOrderDetails(orderId);

    if (!orderDetails) {
      throw new NotFoundException(ERROR_MESSAGES.ORDER_DOES_NOT_EXIST);
    }

    if (orderDetails.userId !== userId) {
      throw new ForbiddenException();
    }

    return orderDetails;
  }

  private async createFromCart(
    userId: number,
    // prettier-ignore
    {
      recipientName,
      recipientPhone,
      pickupMethod,
      deliveryAddress,
      comment,
    }: CheckoutPayload,
  ): Promise<number> {
    const orderId = await withTransaction<number>(async () => {
      const cartDetails = await cartService.getCartDetails(userId);

      if (!cartDetails?.items?.length) {
        throw new BadRequestException(ERROR_MESSAGES.CART_IS_EMPTY);
      }

      const totalAmount = this.calculateTotalAmount(cartDetails.items, pickupMethod);
      const order = await OrderModel.create({
        userId,
        status: OrderStatus.PENDING,
        totalAmount,
        recipientName,
        recipientPhone,
        pickupMethod,
        deliveryAddress,
        comment,
      });

      const orderItemsToInsert: CreateOrderItem[] = cartDetails.items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        productTitle: item.productTitle,
        productDescription: item.productDescription,
        productImage: item.productImage,
        unitPrice: item.productPrice,
        quantity: item.quantity,
      }));

      await OrderItemModel.createMany(orderItemsToInsert);
      await CartModel.clear(cartDetails.id);

      return order.id;
    });

    return orderId;
  }

  private calculateTotalAmount(items: CartDetailsItem[], pickupMethod: PickupMethod): number {
    const subtotal = items.reduce((total, item) => total + item.productPrice * item.quantity, 0);
    const deliveryCost = DELIVERY_COSTS[pickupMethod];

    return subtotal + deliveryCost;
  }
}

export default new OrderService();
