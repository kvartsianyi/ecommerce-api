import { products } from '@/db/schema';
import { OrderByParams, PaginationParams } from './api.model';

export type Product = typeof products.$inferSelect;

export interface ProductFilters {
  title?: string;
  priceGt?: number;
  priceLt?: number;
}

export const PRODUCT_ORDER_BY_FIELDS = ['title', 'price'] as const;

export type ProductOrderByFields = (typeof PRODUCT_ORDER_BY_FIELDS)[number];

export type GetProductsFilters = ProductFilters &
  PaginationParams &
  OrderByParams<ProductOrderByFields>;
