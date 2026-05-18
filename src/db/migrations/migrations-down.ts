import fs from 'node:fs/promises';
import path from 'node:path';

import db from '@/db';

const MIGRATIONS_DIR = './src/db/migrations';
const COMMENT_SIGN = '-- ';
const DOWN_SIGN = '-- migrate:down';

let migration;

migration = '20260518180649_init';

const rollback = async (migration: string): Promise<void> => {
  if (!migration) {
    console.log('No migration files found.');
    return;
  }

  const migrationPath = path.join(MIGRATIONS_DIR, `${migration}/migration.sql`);

  const sql = await fs.readFile(migrationPath, 'utf-8');
  const migrationDownSql = sql.split(DOWN_SIGN)[1]?.trim().replaceAll(COMMENT_SIGN, '');

  if (!migrationDownSql) {
    console.log(`Down query not found for ${migration}`);
    return;
  }

  await db.transaction(async tx => {
    console.log(`Rolling back ${migration}...`);
    await tx.execute(migrationDownSql);

    console.log(`Removing record from migrations table...`);
    const migrationsTableSql = `DELETE FROM migrations WHERE name = '${migration}'`;
    await tx.execute(migrationsTableSql);

    console.log(`Rolling back ${migration} completed!`);
  });
};

await rollback(migration);
