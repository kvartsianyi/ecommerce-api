import path from 'node:path';

import { UPLOADS_ENDPOINT, UPLOADS_FOLDER_PATH } from './app.constant';

export const PRODUCT_VALIDATION_CONDITIONS = {
  TITLE: {
    MIN: 3,
    MAX: 50,
  },
  DESCRIPTION: {
    MIN: 3,
    MAX: 500,
  },
  PRICE: {
    MIN: 0,
    MAX: 100_000_000,
  },
  STOCK: {
    MIN: 0,
    MAX: 100_000_000,
  },
} as const;

export const PRODUCT_UPLOADS_FOLDER = 'products';
export const PRODUCT_IMAGE_UPLOADS_FOLDER = 'images';

export const PRODUCT_IMAGE = {
  UPLOAD_PATH: path.resolve(
    UPLOADS_FOLDER_PATH,
    PRODUCT_UPLOADS_FOLDER,
    PRODUCT_IMAGE_UPLOADS_FOLDER,
  ),
  BASE_URL: `${UPLOADS_ENDPOINT}/${PRODUCT_UPLOADS_FOLDER}/${PRODUCT_IMAGE_UPLOADS_FOLDER}`,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  FILE_SIZE: 5 * 1024 * 1024, // 5 MB
};
