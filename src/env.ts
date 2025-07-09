import Joi from 'joi';

const DEFAULT_PORT = 3000;

enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(...Object.values(NodeEnv))
    .default(NodeEnv.DEVELOPMENT)
    .required(),
  PORT: Joi.number().default(DEFAULT_PORT),
  DATABASE_URL: Joi.string().uri().required(),
}).unknown(true);

const { value: envConfig, error } = schema.validate(process.env, { abortEarly: false });

if (error) {
  console.log('Config error:');
  for (const err of error.details) {
    console.log(`- ${err.message}`);
  }

  process.exit(1);
}

export default envConfig;
