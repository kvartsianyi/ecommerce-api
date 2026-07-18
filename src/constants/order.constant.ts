export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELED = 'canceled',
}

export enum PickupMethod {
  DELIVERY = 'delivery',
  PICKUP = 'pickup',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  CASH = 'cash',
}

export const ORDER_VALIDATION_CONDITIONS = {
  DELIVERY_ADDRESS: {
    MIN: 3,
    MAX: 100,
  },
  COMMENT: {
    MIN: 3,
    MAX: 200,
  },
} as const;

export const DELIVERY_COSTS: Record<PickupMethod, number> = {
  [PickupMethod.DELIVERY]: 9900,
  [PickupMethod.PICKUP]: 0,
};
