import { OrderStatus } from '@/constants';
import { orderItems, orders } from '@/db/schema';
import { OrderByParams, PaginationParams } from './api.model';

export type Order = typeof orders.$inferSelect;

export type OrderItem = typeof orderItems.$inferSelect;

export interface OrderSummaryItem {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  title: string;
  picture: string;
}

export interface OrderSummary {
  id: number;
  userId: number;
  status: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  items: OrderSummaryItem[];
}

export interface CreateOrder {
  userId: number;
  status: OrderStatus.PENDING;
  totalAmount: number;
}

export interface CreateOrderItem {
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface OrderFilters {
  status?: string;
}

export const ORDER_ORDER_BY_FIELDS = [] as const;

export type OrderOrderByFields = (typeof ORDER_ORDER_BY_FIELDS)[number];

export type GetOrdersFilters = OrderFilters & PaginationParams & OrderByParams<OrderOrderByFields>;
