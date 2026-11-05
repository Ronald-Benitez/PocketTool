import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { quoteIdent } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  const records = APP_SCHEMA.Records.sqlName;
  const columns = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${quoteIdent(records)})`
  );
  if (!columns.some((column) => column.name === 'saving_id')) {
    await db.execAsync(
      `ALTER TABLE ${quoteIdent(records)} ADD COLUMN ${quoteIdent('saving_id')} INTEGER;`
    );
  }

  // Legacy links were stored only on savings_history.record_id.
  await db.execAsync(`
    UPDATE ${quoteIdent(records)}
    SET saving_id = (
      SELECT h.savings_id
      FROM ${quoteIdent(APP_SCHEMA.SavingsHistory.sqlName)} h
      WHERE h.record_id = ${quoteIdent(records)}.id AND h.deleted_at IS NULL
      LIMIT 1
    )
    WHERE saving_id IS NULL;
  `);
};

export default {
  version: 19,
  name: '0019_records_saving_source',
  up,
};
