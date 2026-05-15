export const PASSWORD_SALT = 10 as const;

export const USER_VALIDATION_CONDITIONS = {
  NAME: {
    MIN: 3,
    MAX: 50,
  },
  PASSWORD: {
    MIN: 8,
    MAX: 50,
  },
} as const;
