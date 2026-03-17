import { dbContextStorage } from './db-context.storage';
import db from './index';

export async function withTransaction<T>(callback: () => Promise<T>): Promise<T> {
  const store = dbContextStorage.getStore();

  // prevent nested transaction
  if (store?.tx) {
    return callback();
  }

  return db.transaction(async tx => dbContextStorage.run({ tx }, callback));
}
