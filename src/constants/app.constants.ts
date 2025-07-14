export const DEFAULT_PORT = 3000 as const;

export const API_PREFIX = '/api' as const;

export enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}
