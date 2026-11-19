import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createIndexSql, createTableSql } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  for (const table of [APP_SCHEMA.GroupClosings, APP_SCHEMA.GroupClosingLines]) {
    await db.execAsync(createTableSql(table));
    for (const sql of createIndexSql(table)) {
      await db.execAsync(sql);
    }
  }
};

export default {
  version: 24,
  name: '0024_group_closings',
  up,
};
