import { defineRelationsPart } from 'drizzle-orm';

import * as schema from '../schema';

export const productRelations = defineRelationsPart(schema, r => ({
  products: {
    user: r.one.users({
      from: r.products.userId,
      to: r.users.id,
    }),
  },
}));
