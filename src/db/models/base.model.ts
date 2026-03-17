import { DEFAULT_ITEMS_PER_PAGE } from '@/constants';
import { getDb } from '..';

export abstract class BaseModel {
  public defaultLimit: number = DEFAULT_ITEMS_PER_PAGE;
  public defaultOffset: number = 0;

  protected static get db() {
    return getDb();
  }
}
