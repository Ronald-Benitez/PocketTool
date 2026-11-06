import type { SQLiteDatabase } from 'expo-sqlite';

import { APP_SCHEMA } from '../schema/tables';
import { createTableSql } from '../schema/sql';

const up = async (db: SQLiteDatabase) => {
  await db.execAsync(createTableSql(APP_SCHEMA.SharedPaymentAllocations));
};

export default {
  version: 16,
  name: '0016_shared_payment_allocations',
  up,
};
