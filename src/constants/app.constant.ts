import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DEFAULT_PORT = 3000 as const;

export const API_PREFIX = '/api' as const;

export const PUBLIC_ASSETS_ENDPOINT = '/public' as const;
export const PUBLIC_ASSETS_FOLDER_PATH = resolve(__dirname, '../../', 'public');

export enum NodeEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

export enum TokenAction {
  USER_ACCESS_TOKEN = 'user-access-token',
  USER_REFRESH_TOKEN = 'user-refresh-token',
  USER_CONFIRMATION_TOKEN = 'user-confirmation-token',
}
