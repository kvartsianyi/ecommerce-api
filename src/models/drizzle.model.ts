import db from '@/db';

export type QueryContext = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface FindOptions {
  ctx?: QueryContext;
  forUpdate?: boolean;
}
