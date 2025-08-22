import multer from 'multer';

export const ERROR_MESSAGES = {
  USER_ALREADY_EXIST: 'User already exist',
  USER_DOES_NOT_EXIST: 'User does not exist',
  EMAIL_ALREADY_CONFIRMED: 'Email is already confirmed',
  TOKEN_INVALID_OR_EXPIRED: 'Token is invalid or has expired',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_NOT_ACTIVATED: 'Account not activated. Please verify your email before logging in',
  ADMIN_ROLE_REQUIRED: 'Only administrators can perform this action',
  TOO_MANY_FILES_UPLOADED: 'Too many files uploaded',
  FILE_TOO_LARGE: 'File is too large',
  FILE_REQUIRED: 'File is required',
  WRONG_FILE_TYPE: 'File type is not allowed',
  PRODUCT_DOES_NOT_EXIST: 'Product does not exist',
} as const;

export const MULTER_ERROR_CODE_MESSAGES: Partial<Record<multer.ErrorCode, string>> = {
  LIMIT_UNEXPECTED_FILE: ERROR_MESSAGES.TOO_MANY_FILES_UPLOADED,
  LIMIT_FILE_SIZE: ERROR_MESSAGES.FILE_TOO_LARGE,
};
