import Joi from 'joi';

import logger from '@/logger';
import { NodeEnv, DEFAULT_PORT } from '@/constants';

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .default(NodeEnv.DEVELOPMENT)
    .required(),
  PORT: Joi.number().default(DEFAULT_PORT),
  DATABASE_URL: Joi.string().uri().required(),
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

export default envConfig;
