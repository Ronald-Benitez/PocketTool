import type { SQLiteDatabase } from 'expo-sqlite';

import baseline from './0001_baseline';
import auditTimestamps from './0002_audit_timestamps';
import timestampTriggers from './0003_timestamp_triggers';
import budgetPlans from './0004_budget_plans';
import dropBudgetLegacy from './0005_drop_budget_legacy';
import dropBudgetPlanStatus from './0006_drop_budget_plan_status';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

/**
 * Migrations are the single source of schema evolution after the baseline.
 * `0001_baseline` creates the consolidated schema; later migrations only alter.
 */
export const migrations: Migration[] = [
  baseline,
  auditTimestamps,
  timestampTriggers,
  budgetPlans,
  dropBudgetLegacy,
  dropBudgetPlanStatus,
];
