import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createIndexSql, createTableSql } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  const table = APP_SCHEMA.ChartPreferences;
  await db.execAsync(createTableSql(table));
  for (const sql of createIndexSql(table)) {
    await db.execAsync(sql);
  }
};

export default {
  version: 26,
  name: '0026_chart_preferences',
  up,
};
