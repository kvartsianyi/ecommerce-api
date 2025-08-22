import path from 'node:path';
import crypto from 'node:crypto';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { cloudinaryConfig } from '@/config';
import { BadRequestException } from '@/exceptions';
import { ERROR_MESSAGES, MULTER_ERROR_CODE_MESSAGES, PRODUCT_IMAGE_CONFIG } from '@/constants';

const DEFAULT_FILES_MAX_COUNT = 5;

export type UploadConfig = {
  folder: string;
  multiple?: boolean;
  maxCount?: number;
  options?: multer.Options;
};

const createCloudinaryStorage = (folder: string) =>
  new CloudinaryStorage({
    cloudinary: cloudinaryConfig,
    params: (req, file) => {
      const fileExtension = path.extname(file.originalname).substring(1);

      return {
        public_id: crypto.randomUUID(),
        format: fileExtension,
        folder,
      };
    },
  });

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
  const { multiple = false, folder, maxCount = DEFAULT_FILES_MAX_COUNT, options } = config;

  const upload = multer({
    storage: createCloudinaryStorage(folder),
    ...options,
  });

  const uploadMiddleware: RequestHandler = multiple
    ? upload.array('files', maxCount)
    : upload.single('file');

  return multerErrorHandler(uploadMiddleware);
};

export const uploadProductImage = fileUpload({
  folder: PRODUCT_IMAGE_CONFIG.FOLDER,
  options: {
    fileFilter: filterByType(PRODUCT_IMAGE_CONFIG.ALLOWED_MIME_TYPES),
    limits: { fileSize: PRODUCT_IMAGE_CONFIG.MAX_FILE_SIZE },
  },
});
