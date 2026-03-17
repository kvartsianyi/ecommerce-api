import { AsyncLocalStorage } from 'node:async_hooks';

import { QueryContext } from '@/models';

export type Store = {
  tx?: QueryContext;
};

export const dbContextStorage = new AsyncLocalStorage<Store>();
