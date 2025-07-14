export const PASSWORD_SALT = 10 as const;

export const USER_VALITATION_CONDITIONS = {
  FIRST_NAME: {
    MIN: 3,
    MAX: 50,
  },
  LAST_NAME: {
    MIN: 3,
    MAX: 50,
  },
  PASSWORD: {
    MIN: 8,
    MAX: 50,
  },
} as const;
