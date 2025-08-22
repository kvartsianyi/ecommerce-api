import path from 'node:path';
import crypto from 'node:crypto';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';

import { BadRequestException } from '@/exceptions';
import { ERROR_MESSAGES, MULTER_ERROR_CODE_MESSAGES, PRODUCT_IMAGE } from '@/constants';

const DEFAULT_FILES_MAX_COUNT = 5;

export type UploadConfig = {
  destination: string;
  multiple?: boolean;
  maxCount?: number;
  options?: multer.Options;
};

const getUniqueFilename = (file: Express.Multer.File): string =>
  crypto.randomUUID() + path.extname(file.originalname).toLowerCase();

const filterByType =
  (types: string[]) => (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (types.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(ERROR_MESSAGES.WRONG_FILE_TYPE));
    }
  };

const multerErrorHandler =
  (middleware: RequestHandler) => (req: Request, res: Response, next: NextFunction) => {
    middleware(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        const message = MULTER_ERROR_CODE_MESSAGES[err.code] ?? err.message;

        return next(new BadRequestException(message));
      } else if (err instanceof Error) {
        return next(err);
      }

      return next();
    });
  };

export const fileUpload = (config: UploadConfig): RequestHandler => {
  const { multiple = false, maxCount = DEFAULT_FILES_MAX_COUNT, destination, options } = config;

  const storage = multer.diskStorage({
    destination,
    filename: (req, file, cb) => cb(null, getUniqueFilename(file)),
  });

  const upload = multer({
    storage,
    ...options,
  });

  const uploadMiddleware: RequestHandler = multiple
    ? upload.array('files', maxCount)
    : upload.single('file');

  return multerErrorHandler(uploadMiddleware);
};

export const uploadProductImage = fileUpload({
  destination: PRODUCT_IMAGE.UPLOAD_PATH,
  options: {
    fileFilter: filterByType(PRODUCT_IMAGE.ALLOWED_TYPES),
    limits: { fileSize: PRODUCT_IMAGE.FILE_SIZE },
  },
});
