import { and, asc, desc, DrizzleError, sql, SQL } from 'drizzle-orm';
import { AnyPgColumn, PgColumn } from 'drizzle-orm/pg-core';

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

export const jsonAgg = <T>(fields: Record<string, PgColumn>) => {
  const chunks: SQL[] = [];
  const entries = Object.entries(fields);

  if (!entries.length) {
    throw new DrizzleError({ message: 'Cannot aggregate an empty object' });
  }

  entries.forEach(([key, column], index) => {
    if (index > 0) chunks.push(sql`,`);
    chunks.push(sql.raw(`'${key}',`), sql`${column}`);
  });

  return sql<T>`
      COALESCE(json_agg(json_build_object(${sql.join(chunks)})), '[]')
    `;
};
