import { SQL } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  perPage: number;
  totalPages: number;
}

export type FilterConfig<T> = {
  [K in keyof T]?: (value: NonNullable<T[K]>) => SQL;
};

export type OrderByConfig<T extends string> = {
  _default: AnyPgColumn;
} & Record<T, AnyPgColumn>;

export interface PaginationParams {
  page?: number;
  perPage?: number;
}

export interface OrderByParams<AllowedFields> {
  orderBy?: AllowedFields;
  orderDir?: OrderDirection;
}
