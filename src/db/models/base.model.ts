import { DEFAULT_ITEMS_PER_PAGE } from '@/constants';

export abstract class BaseModel {
  public defaultLimit: number = DEFAULT_ITEMS_PER_PAGE;
  public defaultOffset: number = 0;
}
