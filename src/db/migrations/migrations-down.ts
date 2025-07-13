import fs from 'node:fs/promises';
import path from 'node:path';

import db from '@/db';

const MIGRATIONS_DIR = './src/db/migrations';
const JOURNAL_PATH = path.join(MIGRATIONS_DIR, 'meta/_journal.json');
const COMMENT_SIGN = '-- ';
const DOWN_SIGN = '-- migrate:down';
const SQL_EXT = '.sql';

interface JournalEntry {
  tag: string;
  when: number;
}

// const migration = '0000_init.sql';

const rollback = async (migration?: string): Promise<void> => {
  if (!migration) {
    const files = await fs.readdir(MIGRATIONS_DIR, { withFileTypes: true });
    const sqlFiles = files
      .filter(file => file.isFile() && file.name.endsWith(SQL_EXT))
      .map(file => file.name);

    migration = sqlFiles.at(-1);
  }

  if (!migration) {
    console.log('No migration files found.');
    return;
  }

  migration = migration.endsWith(SQL_EXT) ? migration : `${migration}${SQL_EXT}`;
  const migrationPath = path.join(MIGRATIONS_DIR, migration);

  const sql = await fs.readFile(migrationPath, 'utf-8');
  const migrationDownSql = sql.split(DOWN_SIGN)[1]?.trim().replaceAll(COMMENT_SIGN, '');

  if (!migrationDownSql) {
    console.log(`Down query not found for ${migration}`);
    return;
  }

  const journal = JSON.parse(await fs.readFile(JOURNAL_PATH, 'utf-8'));
  const entry = journal.entries.find(
    (entry: JournalEntry) => entry.tag === migration.replace(SQL_EXT, ''),
  );

  await db.transaction(async tx => {
    console.log(`Rolling back ${migration}...`);
    await tx.execute(migrationDownSql);

    if (entry) {
      console.log(`Removing record from migrations table...`);
      const migrationsTableSql = `DELETE FROM migrations WHERE created_at = ${entry.when}`;
      await tx.execute(migrationsTableSql);
    } else {
      console.log("Can't remove record from migrations table!");
    }
    console.log(`Rolling back ${migration} completed!`);
  });
};

await rollback();
