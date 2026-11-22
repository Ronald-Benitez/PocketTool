import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';

import { mapDatabaseError } from '@/src/db/errors';
import { calculateShoppingTotal } from '@/src/domain/shopping/totals';
import { ORM } from '@/src/orm';
import type {
  Financing,
  FinancingPayment,
  FixedRecord,
  PaidCredit,
  PaymentMethod,
  RecordEntry,
  Saving,
  SavingsHistoryEntry,
  ShoppingList,
  ShoppingListItem,
  Vehicle,
  VehicleExpenseLink,
  VehicleFuelEntry,
  VehicleMaintenanceEntry,
  VehicleMaintenanceItem,
} from '@/src/interfaces/schema';

export type RecordSource =
  | {
      kind: 'fixed';
      id: number;
      name: string;
      date: number;
      amountCents: number;
    }
  | {
      kind: 'saving';
      id: number;
      name: string;
      movementKind: string;
      date: number;
      amountCents: number;
      previousAmountCents: number;
      newAmountCents: number;
      note: string | null;
    }
  | {
      kind: 'financing';
      id: number;
      name: string;
      date: number;
      amountCents: number;
      principalCents: number;
      interestCents: number;
      insuranceCents: number;
      feesCents: number;
    }
  | {
      kind: 'vehicle_fuel';
      id: number;
      name: string;
      date: number;
      odometer: number | null;
      distanceUnit: string;
      volume: number | null;
      volumeUnit: string;
      totalCostCents: number | null;
      isFullTank: boolean;
    }
  | {
      kind: 'vehicle_maintenance';
      id: number;
      name: string;
      date: number;
      serviceType: string;
      title: string;
      costCents: number;
      odometer: number | null;
      distanceUnit: string;
      items: { id: number; name: string; costCents: number | null }[];
    }
  | {
      kind: 'shopping';
      id: number;
      name: string;
      status: string;
      date: number | null;
      totalCents: number;
      checkedCount: number;
      items: {
        id: number;
        name: string;
        priceCents: number | null;
        isChecked: boolean;
      }[];
    }
  | {
      kind: 'credit';
      id: number;
      name: string;
      methodName: string | null;
      date: number;
      amountCents: number;
    };

export const resolveRecordSources = async (
  db: SQLiteDatabase,
  recordId: number
): Promise<RecordSource[]> => {
  try {
    const recordsOrm = new ORM(db, 'Records');
    const fixedsOrm = new ORM(db, 'Fixed');
    const savingsOrm = new ORM(db, 'Savings');
    const savingsHistoryOrm = new ORM(db, 'SavingsHistory');
    const financingPaymentsOrm = new ORM(db, 'FinancingPayments');
    const financingsOrm = new ORM(db, 'Financings');
    const vehiclesOrm = new ORM(db, 'Vehicles');
    const vehicleLinksOrm = new ORM(db, 'VehicleExpenseLinks');
    const fuelOrm = new ORM(db, 'VehicleFuelEntries');
    const maintenanceOrm = new ORM(db, 'VehicleMaintenance');
    const maintenanceItemsOrm = new ORM(db, 'VehicleMaintenanceItems');
    const shoppingListsOrm = new ORM(db, 'ShoppingLists');
    const shoppingItemsOrm = new ORM(db, 'ShoppingListItems');
    const paidCreditsOrm = new ORM(db, 'PaidCredits');
    const paymentMethodsOrm = new ORM(db, 'PaymentMethods');

    const record = (await recordsOrm.getById(recordId)) as RecordEntry | null;
    if (!record) return [];

    const [vehicleLink, shoppingList, savingMovement, financingPayment] =
      await Promise.all([
        vehicleLinksOrm.where('record_id', recordId).first() as Promise<
          VehicleExpenseLink | null
        >,
        shoppingListsOrm.where('record_id', recordId).first() as Promise<
          ShoppingList | null
        >,
        savingsHistoryOrm.where('record_id', recordId).first() as Promise<
          SavingsHistoryEntry | null
        >,
        financingPaymentsOrm.where('record_id', recordId).first() as Promise<
          FinancingPayment | null
        >,
      ]);

    const sources: RecordSource[] = [];

    if (record.fixed_id != null) {
      const fixed = (await fixedsOrm.getById(record.fixed_id)) as
        | FixedRecord
        | null;
      if (fixed?.id != null) {
        sources.push({
          kind: 'fixed',
          id: fixed.id,
          name: fixed.fixed_name,
          date: record.date,
          amountCents: record.amount,
        });
      }
    }

    if (savingMovement?.savings_id != null) {
      const saving = (await savingsOrm.getById(savingMovement.savings_id)) as
        | Saving
        | null;
      if (saving?.id != null) {
        sources.push({
          kind: 'saving',
          id: saving.id,
          name: saving.saving_name,
          movementKind: savingMovement.kind,
          date: savingMovement.change_date,
          amountCents: savingMovement.amount_cents,
          previousAmountCents: savingMovement.previous_amount,
          newAmountCents: savingMovement.new_amount,
          note: savingMovement.note ?? null,
        });
      }
    } else if (record.saving_id != null) {
      const saving = (await savingsOrm.getById(record.saving_id)) as
        | Saving
        | null;
      if (saving?.id != null) {
        sources.push({
          kind: 'saving',
          id: saving.id,
          name: saving.saving_name,
          movementKind: 'payment',
          date: record.date,
          amountCents: record.amount,
          previousAmountCents: 0,
          newAmountCents: saving.amount,
          note: null,
        });
      }
    }

    if (financingPayment?.financing_id != null) {
      const financing = (await financingsOrm.getById(
        financingPayment.financing_id
      )) as Financing | null;
      if (financing?.id != null) {
        sources.push({
          kind: 'financing',
          id: financing.id,
          name: financing.name,
          date: financingPayment.date,
          amountCents: financingPayment.amount_cents,
          principalCents: financingPayment.principal_cents,
          interestCents: financingPayment.interest_cents,
          insuranceCents: financingPayment.insurance_cents,
          feesCents: financingPayment.fees_cents,
        });
      }
    }

    if (vehicleLink?.fuel_entry_id != null) {
      const fuel = (await fuelOrm.getById(vehicleLink.fuel_entry_id)) as
        | VehicleFuelEntry
        | null;
      const vehicle = fuel
        ? ((await vehiclesOrm.getById(fuel.vehicle_id)) as Vehicle | null)
        : null;
      if (fuel?.id != null) {
        sources.push({
          kind: 'vehicle_fuel',
          id: fuel.id,
          name: vehicle?.name ?? '',
          date: fuel.date,
          odometer: fuel.odometer ?? null,
          distanceUnit: fuel.distance_unit,
          volume: fuel.volume ?? null,
          volumeUnit: fuel.volume_unit,
          totalCostCents: fuel.total_cost ?? null,
          isFullTank: Boolean(fuel.is_full_tank),
        });
      }
    } else if (vehicleLink?.maintenance_id != null) {
      const maintenance = (await maintenanceOrm.getById(
        vehicleLink.maintenance_id
      )) as VehicleMaintenanceEntry | null;
      const vehicle = maintenance
        ? ((await vehiclesOrm.getById(maintenance.vehicle_id)) as Vehicle | null)
        : null;
      const items = maintenance?.id
        ? ((await maintenanceItemsOrm
            .where('maintenance_id', maintenance.id)
            .getAll()) as VehicleMaintenanceItem[])
        : [];
      if (maintenance?.id != null) {
        sources.push({
          kind: 'vehicle_maintenance',
          id: maintenance.id,
          name: vehicle?.name ?? '',
          date: maintenance.date,
          serviceType: maintenance.service_type,
          title: maintenance.title,
          costCents: maintenance.cost,
          odometer: maintenance.odometer ?? null,
          distanceUnit: maintenance.distance_unit,
          items: items.flatMap((item) =>
            item.id == null
              ? []
              : [
                  {
                    id: item.id,
                    name: item.name,
                    costCents: item.cost ?? null,
                  },
                ]
          ),
        });
      }
    }

    if (shoppingList?.id != null) {
      const items = (await shoppingItemsOrm
        .where('shopping_list_id', shoppingList.id)
        .order('sort_order', 'ASC')
        .getAll()) as ShoppingListItem[];
      const total = calculateShoppingTotal(
        items.map((item) => ({
          priceCents: item.price_cents ?? null,
          isChecked: Boolean(item.is_checked),
        }))
      );
      sources.push({
        kind: 'shopping',
        id: shoppingList.id,
        name: shoppingList.list_name,
        status: shoppingList.status,
        date: shoppingList.purchase_date ?? null,
        totalCents: total.totalCents,
        checkedCount: total.checkedCount,
        items: items.flatMap((item) =>
          item.id == null
            ? []
            : [
                {
                  id: item.id,
                  name: item.item_name,
                  priceCents: item.price_cents ?? null,
                  isChecked: Boolean(item.is_checked),
                },
              ]
        ),
      });
    }

    if (record.paid_credit_id != null) {
      const credit = (await paidCreditsOrm.getById(
        record.paid_credit_id
      )) as PaidCredit | null;
      const method =
        credit?.payment_method_id != null
          ? ((await paymentMethodsOrm.getById(
              credit.payment_method_id
            )) as PaymentMethod | null)
          : null;
      if (credit?.id != null) {
        sources.push({
          kind: 'credit',
          id: credit.id,
          name: method?.method_name ?? record.record_name,
          methodName: method?.method_name ?? null,
          date: credit.date,
          amountCents: credit.amount,
        });
      }
    }

    return sources;
  } catch (error) {
    throw mapDatabaseError(error, 'Could not load record sources');
  }
};

export const useRecordSourcesRepository = () => {
  const db = useSQLiteContext();

  const getRecordSources = (recordId: number) =>
    resolveRecordSources(db, recordId);

  return { getRecordSources };
};

export type RecordSourcesRepository = ReturnType<
  typeof useRecordSourcesRepository
>;

/** Route the record's "open source" action should navigate to. */
export const recordSourceRoute = (source: RecordSource): string => {
  switch (source.kind) {
    case 'fixed':
      return '/(fixeds)';
    case 'saving':
      return `/(savings)?savingId=${source.id}`;
    case 'financing':
      return '/(fixeds)/FinancingsScreen';
    case 'vehicle_fuel':
      return '/(vehicle)/fuel';
    case 'vehicle_maintenance':
      return '/(vehicle)/maintenance';
    case 'shopping':
      return `/(shopping)?listId=${source.id}`;
    case 'credit':
      return '/(credits)';
    default:
      return '/';
  }
};
