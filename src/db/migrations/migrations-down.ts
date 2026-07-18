import fs from 'node:fs/promises';
import path from 'node:path';

import db from '@/db';

const MIGRATIONS_DIR = './src/db/migrations';
const COMMENT_SIGN = '-- ';
const DOWN_SIGN = '-- migrate:down';

const rollback = async (): Promise<void> => {
  const entries = await fs.readdir(MIGRATIONS_DIR, {
    withFileTypes: true,
  });
  const folders = await Promise.all(
    entries
      .filter(entry => entry.isDirectory())
      .map(async entry => {
        const fullPath = path.join(MIGRATIONS_DIR, entry.name);

        const stats = await fs.stat(fullPath);

        return {
          name: entry.name,
          createdAt: stats.birthtime,
        };
      }),
  );
  const [latestMigration] = folders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  if (!latestMigration) {
    console.log('No migration files found.');
    return;
  }

  const migration = latestMigration.name;
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

await rollback();
