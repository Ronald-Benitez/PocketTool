import type { SQLiteDatabase } from 'expo-sqlite';

import baseline from './0001_baseline';
import auditTimestamps from './0002_audit_timestamps';
import timestampTriggers from './0003_timestamp_triggers';
import budgetPlans from './0004_budget_plans';
import dropBudgetLegacy from './0005_drop_budget_legacy';
import dropBudgetPlanStatus from './0006_drop_budget_plan_status';
import vehicleModule from './0007_vehicle_module';
import fuelBaseline from './0008_fuel_baseline';
import vehicleType from './0009_vehicle_type';
import vehicleTypeModels from './0010_vehicle_type_models';
import creditCardsAndFinancings from './0011_credit_cards_and_financings';
import financingPaymentCents from './0012_financing_payment_cents';
import vehicleSettingsRecordType from './0013_vehicle_settings_record_type';
import peopleAndSharedParticipants from './0014_people_and_shared_participants';
import recordsSharedAmounts from './0015_records_shared_amounts';
import sharedPaymentAllocations from './0016_shared_payment_allocations';
import savingsGoalsAndSharing from './0017_savings_goals_and_sharing';
import savingsMovements from './0018_savings_movements';

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
  vehicleModule,
  fuelBaseline,
  vehicleType,
  vehicleTypeModels,
  creditCardsAndFinancings,
  financingPaymentCents,
  vehicleSettingsRecordType,
  peopleAndSharedParticipants,
  recordsSharedAmounts,
  sharedPaymentAllocations,
  savingsGoalsAndSharing,
  savingsMovements,
];
