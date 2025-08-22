import { ImageMimeType } from './file.constant';

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

export const PRODUCT_IMAGE_CONFIG = {
  ALLOWED_MIME_TYPES: [ImageMimeType.JPEG, ImageMimeType.PNG, ImageMimeType.WEBP],
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  FOLDER: 'products',
};
