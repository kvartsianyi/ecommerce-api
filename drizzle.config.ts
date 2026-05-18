import { defineConfig } from 'drizzle-kit';
import { register } from 'tsconfig-paths';

import tsConfig from './tsconfig.json';

const baseUrl = '.';
register({
  baseUrl,
  paths: tsConfig.compilerOptions.paths,
});

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: 'migrations',
    schema: 'public',
  },
  verbose: true,
  strict: true,
});
