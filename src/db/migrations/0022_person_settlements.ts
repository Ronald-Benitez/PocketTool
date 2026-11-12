import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createIndexSql, createTableSql } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  await db.execAsync(createTableSql(APP_SCHEMA.PersonSettlements));
  for (const sql of createIndexSql(APP_SCHEMA.PersonSettlements)) {
    await db.execAsync(sql);
  }
};

export default {
  version: 22,
  name: '0022_person_settlements',
  up,
};
