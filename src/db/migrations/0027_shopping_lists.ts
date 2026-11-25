import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createIndexSql, createTableSql } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  for (const tableName of ['ShoppingLists', 'ShoppingListItems'] as const) {
    const table = APP_SCHEMA[tableName];
    await db.execAsync(createTableSql(table));
    for (const sql of createIndexSql(table)) {
      await db.execAsync(sql);
    }
  }
};

export default {
  version: 27,
  name: '0027_shopping_lists',
  up,
};
