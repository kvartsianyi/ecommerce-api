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
