import { SignOptions } from 'jsonwebtoken';
import Joi from 'joi';

import logger from '@/logger';
import { NodeEnv, DEFAULT_PORT } from '@/constants';

interface EnvConfig {
  NODE_ENV: NodeEnv;
  PORT: number;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM: string;
  JWT_EMAIL_CONFIRM_SECRET: string;
  JWT_EMAIL_CONFIRM_LIFETIME: SignOptions['expiresIn'];
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_LIFETIME: SignOptions['expiresIn'];
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_LIFETIME: SignOptions['expiresIn'];
}

const schema = Joi.object<EnvConfig>({
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .default(NodeEnv.DEVELOPMENT)
    .required(),
  PORT: Joi.number().default(DEFAULT_PORT),
  FRONTEND_URL: Joi.string().uri().required(),
  DATABASE_URL: Joi.string().uri().required(),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().integer().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_FROM: Joi.string().required(),
  JWT_EMAIL_CONFIRM_SECRET: Joi.string().required(),
  JWT_EMAIL_CONFIRM_LIFETIME: Joi.string().required(),
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_LIFETIME: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_LIFETIME: Joi.string().required(),
});

const { value: envConfig, error } = schema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

if (error) {
  const errorObj: Record<string, string> = {};

  for (const { path, message } of error.details) {
    const key = path.join('.');
    errorObj[key] = message;
  }

  logger.error('Config error:', errorObj, { context: 'Config' });
  process.exit(1);
}

export default envConfig as EnvConfig;
