import { and, asc, desc, SQL } from 'drizzle-orm';
import { AnyPgColumn } from 'drizzle-orm/pg-core';

import { FilterConfig, OrderByConfig, OrderByParams, OrderDirection } from '@/models';

export const buildWhere = <T>(filters: Partial<T>, config: FilterConfig<T>): SQL | undefined => {
  const conditions: SQL[] = [];

  for (const key in filters) {
    const value = filters[key];
    if (value && config[key]) {
      conditions.push(config[key](value));
    }
  }

  return conditions.length ? and(...conditions) : undefined;
};

export const buildOrderBy = <T extends string>(
  filters: OrderByParams<T>,
  config: OrderByConfig<T>,
  defaultColumn: AnyPgColumn,
) => {
  const { orderBy: column, orderDir: direction = OrderDirection.ASC } = filters;

  if (!column || !config[column]) return asc(defaultColumn);

  const columnConfig = config[column];

  return direction === OrderDirection.DESC ? desc(columnConfig) : asc(columnConfig);
};
