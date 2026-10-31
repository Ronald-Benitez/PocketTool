import { useSQLiteContext } from 'expo-sqlite';
import { z } from 'zod';

import { ORM, useORM } from '@/src/orm';
import { withExclusiveTransaction } from '@/src/db/transaction';
import { useConfigs } from '@/src/hooks/useConfigs';
import type {
  Category,
  Group,
  Insertable,
  PaymentMethod,
  RecordEntry,
  RecordType,
  Vehicle,
  VehicleExpenseLink,
  VehicleFuelEntry,
  VehicleMaintenanceEntry,
  VehicleMaintenanceItem,
  VehicleReminder,
  VehicleSetting,
} from '@/src/interfaces/schema';
import {
  recordInputSchema,
  vehicleExpenseLinkInputSchema,
  vehicleFuelEntryInputSchema,
  vehicleFuelEntryUpdateSchema,
  vehicleInputSchema,
  vehicleMaintenanceInputSchema,
  vehicleMaintenanceItemInputSchema,
  vehicleMaintenanceUpdateSchema,
  vehicleReminderInputSchema,
  vehicleReminderUpdateSchema,
  vehicleSettingInputSchema,
  vehicleUpdateSchema,
} from '@/src/validation/entities';
import { computeNextDue } from '@/src/domain/vehicle/reminders';
import { distanceUnitOf } from '@/src/domain/vehicle/units';

export type VehicleLinkMode = 'create' | 'link' | 'none';

export type VehicleFuelEntryView = VehicleFuelEntry & {
  record_id?: number | null;
  record_name?: string | null;
  record_amount?: number | null;
};

export type VehicleMaintenanceItemView = VehicleMaintenanceItem;

export type VehicleMaintenanceView = VehicleMaintenanceEntry & {
  items: VehicleMaintenanceItemView[];
  record_id?: number | null;
  record_name?: string | null;
  record_amount?: number | null;
};

export type VehicleExpenseOption = {
  id: number;
  name: string;
  date: number;
  amount: number;
  categoryId: number | null;
  categoryName: string;
  paymentMethodId: number | null;
  paymentMethodName: string;
  groupId: number | null;
  groupName: string;
};

export type VehicleEntryFinanceInput = {
  linkMode: VehicleLinkMode;
  recordId?: number | null;
  groupId?: number | null;
  categoryId?: number | null;
  paymentMethodId?: number | null;
};

const expenseTypeKey = (type: RecordType) =>
  (type.type_name ?? '').toLowerCase() === 'payments';

const resolveVehicle = async (
  db: Parameters<typeof withExclusiveTransaction>[0],
  vehicleId: number
) => {
  const orm = new ORM(db, 'Vehicles');
  return (await orm.getById(vehicleId)) as Vehicle | null;
};

const resolveSetting = async (
  db: Parameters<typeof withExclusiveTransaction>[0],
  key: string
) =>
  (await new ORM(db, 'VehicleSettings').where('setting_key', key).first()) as
    | VehicleSetting
    | null;

const resolveExpenseType = async (db: Parameters<typeof withExclusiveTransaction>[0]) => {
  const excluded = useConfigs.getState().configs.paymentCreditType;
  const types = (await new ORM(db, 'RecordTypes').getAll()) as RecordType[];
  return (
    types.find(
      (type) =>
        type.id !== undefined &&
        type.id !== excluded &&
        type.effect === '-' &&
        !expenseTypeKey(type)
    ) ?? null
  );
};

const createOrUpdateRecord = async ({
  db,
  recordId,
  amount,
  date,
  groupId,
  categoryId,
  paymentMethodId,
  name,
}: {
  db: Parameters<typeof withExclusiveTransaction>[0];
  recordId?: number | null;
  amount: number;
  date: number;
  groupId: number;
  categoryId: number;
  paymentMethodId: number;
  name: string;
}) => {
  const records = new ORM(db, 'Records');
  if (recordId) {
    await records.update(recordId, {
      amount,
      record_name: name,
      date,
    });
    return recordId;
  }

  const type = await resolveExpenseType(db);
  if (!type?.id) throw new Error('No expense record type configured');
  const payload = recordInputSchema.parse({
    amount,
    record_name: name,
    date,
    record_type_id: type.id,
    group_id: groupId,
    category_id: categoryId,
    payment_method_id: paymentMethodId,
  });
  return records.insert(payload as Insertable<RecordEntry>);
};

const replaceLink = async ({
  db,
  recordId,
  fuelEntryId,
  maintenanceId,
}: {
  db: Parameters<typeof withExclusiveTransaction>[0];
  recordId: number;
  fuelEntryId?: number | null;
  maintenanceId?: number | null;
}) => {
  const links = new ORM(db, 'VehicleExpenseLinks');
  const existingRecord = (await links
    .where('record_id', recordId)
    .first()) as VehicleExpenseLink | null;
  if (existingRecord) {
    const sameFuel =
      fuelEntryId != null && existingRecord.fuel_entry_id === fuelEntryId;
    const sameMaintenance =
      maintenanceId != null && existingRecord.maintenance_id === maintenanceId;
    if (!sameFuel && !sameMaintenance) {
      throw new Error('RECORD_ALREADY_LINKED');
    }
    await links.deleteWhere('record_id', recordId);
  }
  if (fuelEntryId) {
    const existingFuel = (await links
      .where('fuel_entry_id', fuelEntryId)
      .first()) as VehicleExpenseLink | null;
    if (existingFuel) await links.deleteWhere('fuel_entry_id', fuelEntryId);
  }
  if (maintenanceId) {
    const existingMaintenance = (await links
      .where('maintenance_id', maintenanceId)
      .first()) as VehicleExpenseLink | null;
    if (existingMaintenance) {
      await links.deleteWhere('maintenance_id', maintenanceId);
    }
  }

  await links.insert(
    vehicleExpenseLinkInputSchema.parse({
      record_id: recordId,
      fuel_entry_id: fuelEntryId ?? null,
      maintenance_id: maintenanceId ?? null,
    }) as Insertable<VehicleExpenseLink>
  );
};

const unlinkEntry = async (
  db: Parameters<typeof withExclusiveTransaction>[0],
  field: 'fuel_entry_id' | 'maintenance_id',
  id: number
) => {
  await new ORM(db, 'VehicleExpenseLinks').deleteWhere(field, id);
};

const requireFinanceFields = async (
  db: Parameters<typeof withExclusiveTransaction>[0],
  settingKey: string,
  input: VehicleEntryFinanceInput
) => {
  const setting = await resolveSetting(db, settingKey);
  const categoryId = input.categoryId ?? setting?.category_id ?? null;
  const paymentMethodId =
    input.paymentMethodId ?? setting?.payment_method_id ?? null;
  if (!input.groupId) throw new Error('GROUP_REQUIRED');
  if (!categoryId) throw new Error('CATEGORY_REQUIRED');
  if (!paymentMethodId) throw new Error('PAYMENT_METHOD_REQUIRED');
  return {
    groupId: input.groupId,
    categoryId,
    paymentMethodId,
  };
};

export const useVehiclesRepository = () => {
  const db = useSQLiteContext();
  const vehiclesOrm = useORM('Vehicles');

  const fetchVehicles = async (): Promise<Vehicle[]> =>
    (await vehiclesOrm.getAll()) as Vehicle[];

  const fetchDefaultVehicle = async (): Promise<Vehicle | null> =>
    (await vehiclesOrm.where('is_default', 1).first()) as Vehicle | null;

  const setDefault = async (id: number) => {
    await withExclusiveTransaction(db, async (txn) => {
      const orm = new ORM(txn, 'Vehicles');
      const rows = (await orm.getAll()) as Vehicle[];
      for (const row of rows) {
        if (row.id === undefined) continue;
        await orm.update(row.id, { is_default: row.id === id ? 1 : 0 });
      }
    });
  };

  const addVehicle = async (input: z.infer<typeof vehicleInputSchema>) => {
    const payload = vehicleInputSchema.parse(input);
    return withExclusiveTransaction(db, async (txn) => {
      const orm = new ORM(txn, 'Vehicles');
      const rows = (await orm.getAll()) as Vehicle[];
      const shouldDefault =
        payload.is_default === true || payload.is_default === 1 || rows.length === 0;
      if (shouldDefault) {
        for (const row of rows) {
          if (row.id !== undefined) await orm.update(row.id, { is_default: 0 });
        }
      }
      return orm.insert({
        ...payload,
        is_default: shouldDefault ? 1 : 0,
      } as Insertable<Vehicle>);
    });
  };

  const updateVehicle = async (id: number, input: Partial<z.infer<typeof vehicleInputSchema>>) => {
    const payload = vehicleUpdateSchema.parse(input);
    await withExclusiveTransaction(db, async (txn) => {
      const orm = new ORM(txn, 'Vehicles');
      if (payload.is_default === true || payload.is_default === 1) {
        const rows = (await orm.getAll()) as Vehicle[];
        for (const row of rows) {
          if (row.id !== undefined && row.id !== id) {
            await orm.update(row.id, { is_default: 0 });
          }
        }
      }
      await orm.update(id, payload);
    });
  };

  const deleteVehicle = async (id: number) => {
    await withExclusiveTransaction(db, async (txn) => {
      const fuel = new ORM(txn, 'VehicleFuelEntries');
      const maintenance = new ORM(txn, 'VehicleMaintenance');
      const items = new ORM(txn, 'VehicleMaintenanceItems');
      const reminders = new ORM(txn, 'VehicleReminders');
      const links = new ORM(txn, 'VehicleExpenseLinks');
      const vehicles = new ORM(txn, 'Vehicles');

      const fuelEntries = (await fuel
        .where('vehicle_id', id)
        .getAll()) as VehicleFuelEntry[];
      const maintenanceEntries = (await maintenance
        .where('vehicle_id', id)
        .getAll()) as VehicleMaintenanceEntry[];

      for (const entry of fuelEntries) {
        if (entry.id !== undefined) {
          await links.deleteWhere('fuel_entry_id', entry.id);
          await fuel.delete(entry.id);
        }
      }
      for (const entry of maintenanceEntries) {
        if (entry.id === undefined) continue;
        await items.deleteWhere('maintenance_id', entry.id);
        await links.deleteWhere('maintenance_id', entry.id);
        await maintenance.delete(entry.id);
      }
      await reminders.deleteWhere('vehicle_id', id);
      await vehicles.delete(id);
    });
  };

  return {
    fetchVehicles,
    fetchDefaultVehicle,
    setDefault,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  };
};

export const useVehicleFuelRepository = () => {
  const db = useSQLiteContext();
  const fuelOrm = useORM('VehicleFuelEntries');
  const linksOrm = useORM('VehicleExpenseLinks');
  const recordsOrm = useORM('Records');

  const fetchFuelEntries = async (vehicleId?: number): Promise<VehicleFuelEntryView[]> => {
    let entries = (await fuelOrm.getAll()) as VehicleFuelEntry[];
    if (vehicleId) entries = entries.filter((entry) => entry.vehicle_id === vehicleId);
    const links = (await linksOrm.getAll()) as VehicleExpenseLink[];
    const fuelLinks = links.filter((link) => link.fuel_entry_id != null);
    const recordIds = fuelLinks
      .map((link) => link.record_id)
      .filter((id): id is number => typeof id === 'number');
    const records = recordIds.length
      ? ((await recordsOrm.join('Categories').where('id', recordIds, 'IN').getAll()) as RecordEntry[])
      : [];
    const linkByEntry = new Map(
      fuelLinks.flatMap((link) =>
        link.fuel_entry_id == null ? [] : [[link.fuel_entry_id, link] as const]
      )
    );
    const recordById = new Map(
      records.flatMap((record) =>
        record.id === undefined ? [] : [[record.id, record] as const]
      )
    );

    return entries.map((entry) => {
      const link = linkByEntry.get(entry.id as number);
      const record = link ? recordById.get(link.record_id) : null;
      return {
        ...entry,
        record_id: link?.record_id ?? null,
        record_name: record?.record_name ?? null,
        record_amount: record?.amount ?? null,
      };
    });
  };

  const saveFuelEntry = async (
    input: z.infer<typeof vehicleFuelEntryInputSchema> & {
      id?: number;
      finance?: VehicleEntryFinanceInput;
    }
  ) => {
    const { finance: financeInput, id, ...entryValues } = input;
    const finance = financeInput ?? { linkMode: 'none' as const };
    return withExclusiveTransaction(db, async (txn) => {
      const fuel = new ORM(txn, 'VehicleFuelEntries');
      const vehicle = await resolveVehicle(txn, entryValues.vehicle_id);
      if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');

      const payload =
        id !== undefined
          ? vehicleFuelEntryUpdateSchema.parse(entryValues)
          : vehicleFuelEntryInputSchema.parse(entryValues);
      const entryId =
        id !== undefined
          ? (await fuel.update(id, payload), id)
          : await fuel.insert(payload as Insertable<VehicleFuelEntry>);
      const saved = (await fuel.getById(entryId)) as VehicleFuelEntry;

      if (finance.linkMode === 'none') {
        await unlinkEntry(txn, 'fuel_entry_id', entryId);
        return entryId;
      }

      if (finance.linkMode === 'link') {
        if (!finance.recordId) throw new Error('RECORD_REQUIRED');
        await replaceLink({
          db: txn,
          recordId: finance.recordId,
          fuelEntryId: entryId,
        });
        return entryId;
      }

      const existingLink = (await new ORM(txn, 'VehicleExpenseLinks')
        .where('fuel_entry_id', entryId)
        .first()) as VehicleExpenseLink | null;
      const fields = existingLink
        ? { groupId: 0, categoryId: 0, paymentMethodId: 0 }
        : await requireFinanceFields(txn, 'fuel', finance);
      const recordId = await createOrUpdateRecord({
        db: txn,
        recordId: existingLink?.record_id,
        amount: saved.total_cost,
        date: saved.date,
        groupId: fields.groupId,
        categoryId: fields.categoryId,
        paymentMethodId: fields.paymentMethodId,
        name: `Fuel · ${vehicle.name}`,
      });
      await replaceLink({
        db: txn,
        recordId,
        fuelEntryId: entryId,
      });
      return entryId;
    });
  };

  const deleteFuelEntry = async (id: number, deleteRecord = false) => {
    await withExclusiveTransaction(db, async (txn) => {
      const links = new ORM(txn, 'VehicleExpenseLinks');
      const link = (await links.where('fuel_entry_id', id).first()) as VehicleExpenseLink | null;
      await links.deleteWhere('fuel_entry_id', id);
      await new ORM(txn, 'VehicleFuelEntries').delete(id);
      if (deleteRecord && link?.record_id) {
        await new ORM(txn, 'Records').delete(link.record_id);
      }
    });
  };

  return { fetchFuelEntries, saveFuelEntry, deleteFuelEntry };
};

export const useVehicleMaintenanceRepository = () => {
  const db = useSQLiteContext();
  const maintenanceOrm = useORM('VehicleMaintenance');
  const itemsOrm = useORM('VehicleMaintenanceItems');
  const linksOrm = useORM('VehicleExpenseLinks');
  const recordsOrm = useORM('Records');

  const fetchMaintenance = async (vehicleId?: number): Promise<VehicleMaintenanceView[]> => {
    let entries = (await maintenanceOrm.getAll()) as VehicleMaintenanceEntry[];
    if (vehicleId) entries = entries.filter((entry) => entry.vehicle_id === vehicleId);
    const ids = entries
      .map((entry) => entry.id)
      .filter((id): id is number => typeof id === 'number');
    const items = ids.length
      ? ((await itemsOrm.where('maintenance_id', ids, 'IN').getAll()) as VehicleMaintenanceItem[])
      : [];
    const links = (await linksOrm.getAll()) as VehicleExpenseLink[];
    const maintenanceLinks = links.filter((link) => link.maintenance_id != null);
    const recordIds = maintenanceLinks
      .map((link) => link.record_id)
      .filter((id): id is number => typeof id === 'number');
    const records = recordIds.length
      ? ((await recordsOrm.where('id', recordIds, 'IN').getAll()) as RecordEntry[])
      : [];
    const linkByEntry = new Map(
      maintenanceLinks.flatMap((link) =>
        link.maintenance_id == null
          ? []
          : [[link.maintenance_id, link] as const]
      )
    );
    const recordById = new Map(
      records.flatMap((record) =>
        record.id === undefined ? [] : [[record.id, record] as const]
      )
    );

    return entries.map((entry) => {
      const link = linkByEntry.get(entry.id as number);
      const record = link ? recordById.get(link.record_id) : null;
      return {
        ...entry,
        items: items.filter((item) => item.maintenance_id === entry.id),
        record_id: link?.record_id ?? null,
        record_name: record?.record_name ?? null,
        record_amount: record?.amount ?? null,
      };
    });
  };

  const saveMaintenance = async (
    input: z.infer<typeof vehicleMaintenanceInputSchema> & {
      id?: number;
      items?: Omit<z.infer<typeof vehicleMaintenanceItemInputSchema>, 'maintenance_id'>[];
      finance?: VehicleEntryFinanceInput;
    }
  ) => {
    const {
      finance: financeInput,
      items: itemsInput,
      id,
      ...entryValues
    } = input;
    const finance = financeInput ?? { linkMode: 'none' as const };
    return withExclusiveTransaction(db, async (txn) => {
      const maintenance = new ORM(txn, 'VehicleMaintenance');
      const vehicle = await resolveVehicle(txn, entryValues.vehicle_id);
      if (!vehicle) throw new Error('VEHICLE_NOT_FOUND');

      const payload =
        id !== undefined
          ? vehicleMaintenanceUpdateSchema.parse(entryValues)
          : vehicleMaintenanceInputSchema.parse(entryValues);
      const entryId =
        id !== undefined
          ? (await maintenance.update(id, payload), id)
          : await maintenance.insert(payload as Insertable<VehicleMaintenanceEntry>);
      const saved = (await maintenance.getById(entryId)) as VehicleMaintenanceEntry;

      if (itemsInput) {
        const items = new ORM(txn, 'VehicleMaintenanceItems');
        await items.deleteWhere('maintenance_id', entryId);
        for (const item of itemsInput) {
          await items.insert(
            vehicleMaintenanceItemInputSchema.parse({
              ...item,
              maintenance_id: entryId,
            }) as Insertable<VehicleMaintenanceItem>
          );
        }
      }

      if (finance.linkMode === 'none') {
        await unlinkEntry(txn, 'maintenance_id', entryId);
      } else if (finance.linkMode === 'link') {
        if (!finance.recordId) throw new Error('RECORD_REQUIRED');
        await replaceLink({
          db: txn,
          recordId: finance.recordId,
          maintenanceId: entryId,
        });
      } else {
        const settingKey =
          saved.service_type === 'repair' || saved.service_type === 'tires'
            ? saved.service_type
            : saved.service_type === 'oil_change'
              ? 'oil_change'
              : 'maintenance';
        const existingLink = (await new ORM(txn, 'VehicleExpenseLinks')
          .where('maintenance_id', entryId)
          .first()) as VehicleExpenseLink | null;
        const fields = existingLink
          ? { groupId: 0, categoryId: 0, paymentMethodId: 0 }
          : await requireFinanceFields(txn, settingKey, finance);
        const recordId = await createOrUpdateRecord({
          db: txn,
          recordId: existingLink?.record_id,
          amount: saved.cost,
          date: saved.date,
          groupId: fields.groupId,
          categoryId: fields.categoryId,
          paymentMethodId: fields.paymentMethodId,
          name: `${saved.title} · ${vehicle.name}`,
        });
        await replaceLink({
          db: txn,
          recordId,
          maintenanceId: entryId,
        });
      }

      if (saved.service_type === 'oil_change') {
        const reminders = new ORM(txn, 'VehicleReminders');
        const rows = (await reminders
          .where('vehicle_id', saved.vehicle_id)
          .where('service_type', 'oil_change')
          .getAll()) as VehicleReminder[];
        for (const reminder of rows) {
          if (reminder.id === undefined) continue;
          const next = computeNextDue({
            ...reminder,
            last_service_date: saved.date,
            last_service_odometer: saved.odometer ?? reminder.last_service_odometer,
            odometer_unit: saved.distance_unit,
          });
          await reminders.update(reminder.id, {
            last_service_date: saved.date,
            last_service_odometer: saved.odometer ?? reminder.last_service_odometer,
            odometer_unit: saved.distance_unit,
            next_due_date: next.nextDate,
            next_due_odometer: next.nextOdometer,
          });
        }
      }

      return entryId;
    });
  };

  const deleteMaintenance = async (id: number, deleteRecord = false) => {
    await withExclusiveTransaction(db, async (txn) => {
      const links = new ORM(txn, 'VehicleExpenseLinks');
      const link = (await links.where('maintenance_id', id).first()) as VehicleExpenseLink | null;
      await links.deleteWhere('maintenance_id', id);
      await new ORM(txn, 'VehicleMaintenanceItems').deleteWhere('maintenance_id', id);
      await new ORM(txn, 'VehicleMaintenance').delete(id);
      if (deleteRecord && link?.record_id) {
        await new ORM(txn, 'Records').delete(link.record_id);
      }
    });
  };

  return { fetchMaintenance, saveMaintenance, deleteMaintenance };
};

export const useVehicleRemindersRepository = () => {
  const db = useSQLiteContext();
  const remindersOrm = useORM('VehicleReminders');

  const fetchReminders = async (vehicleId?: number): Promise<VehicleReminder[]> => {
    const rows = (await remindersOrm.getAll()) as VehicleReminder[];
    return vehicleId ? rows.filter((row) => row.vehicle_id === vehicleId) : rows;
  };

  const saveReminder = async (
    input: z.infer<typeof vehicleReminderInputSchema> & { id?: number }
  ) => {
    const { id, ...values } = input;
    const payload =
      id !== undefined
        ? vehicleReminderUpdateSchema.parse(values)
        : vehicleReminderInputSchema.parse(values);
    const next = computeNextDue({
      ...values,
      service_type: values.service_type,
      title: values.title,
    } as z.infer<typeof vehicleReminderInputSchema>);
    const merged = {
      ...payload,
      next_due_date: values.next_due_date ?? next.nextDate,
      next_due_odometer: values.next_due_odometer ?? next.nextOdometer,
    };
    if (id !== undefined) {
      await remindersOrm.update(id, merged);
      return id;
    }
    return remindersOrm.insert(merged as Insertable<VehicleReminder>);
  };

  const deleteReminder = async (id: number) => remindersOrm.delete(id);

  return { fetchReminders, saveReminder, deleteReminder };
};

export const useVehicleSettingsRepository = () => {
  const settingsOrm = useORM('VehicleSettings');

  const fetchSettings = async (): Promise<VehicleSetting[]> =>
    (await settingsOrm.getAll()) as VehicleSetting[];

  const saveSetting = async (
    input: z.infer<typeof vehicleSettingInputSchema>
  ): Promise<number> => {
    const payload = vehicleSettingInputSchema.parse(input);
    const existing = (await settingsOrm
      .where('setting_key', payload.setting_key)
      .first()) as VehicleSetting | null;
    if (existing?.id) {
      await settingsOrm.update(existing.id, payload);
      return existing.id;
    }
    return settingsOrm.insert(payload as Insertable<VehicleSetting>);
  };

  return { fetchSettings, saveSetting };
};

export const useVehicleExpenseLinksRepository = () => {
  const db = useSQLiteContext();
  const recordsOrm = useORM('Records');
  const linksOrm = useORM('VehicleExpenseLinks');
  const groupsOrm = useORM('Groups');

  const listGroupsForDate = async (date: number): Promise<Group[]> => {
    const value = new Date(date);
    return (await groupsOrm
      .where('year', value.getFullYear())
      .where('month', value.getMonth() + 1)
      .getAll()) as Group[];
  };

  const searchRecords = async ({
    from,
    to,
    amountMin,
    amountMax,
    categoryId,
    paymentMethodId,
    search,
    excludeLinked = true,
  }: {
    from?: number;
    to?: number;
    amountMin?: number;
    amountMax?: number;
    categoryId?: number;
    paymentMethodId?: number;
    search?: string;
    excludeLinked?: boolean;
  }): Promise<VehicleExpenseOption[]> => {
    const links = (await linksOrm.getAll()) as VehicleExpenseLink[];
    const linked = new Set(links.map((link) => link.record_id));
    let query = recordsOrm
      .joinMany(['Categories', 'PaymentMethods', 'RecordTypes', 'Groups'])
      .where('RecordTypes.effect', '-');
    if (from != null) query = query.where('date', from, '>=');
    if (to != null) query = query.where('date', to, '<=');
    if (amountMin != null) query = query.where('amount', amountMin, '>=');
    if (amountMax != null) query = query.where('amount', amountMax, '<=');
    if (categoryId) query = query.where('category_id', categoryId);
    if (paymentMethodId) query = query.where('payment_method_id', paymentMethodId);
    if (search?.trim()) query = query.where('record_name', `%${search.trim()}%`, 'LIKE');
    const rows = (await query.order('date', 'DESC').getAll()) as any[];

    return rows
      .filter((row) => !excludeLinked || !linked.has(row.id))
      .map((row) => ({
        id: row.id as number,
        name: row.record_name as string,
        date: row.date as number,
        amount: row.amount as number,
        categoryId: row.category_id ?? null,
        categoryName: row.Categories?.category_name ?? '',
        paymentMethodId: row.payment_method_id ?? null,
        paymentMethodName: row.PaymentMethods?.method_name ?? '',
        groupId: row.group_id ?? null,
        groupName: row.Groups?.group_name ?? '',
      }));
  };

  const linkRecord = async ({
    recordId,
    fuelEntryId,
    maintenanceId,
  }: {
    recordId: number;
    fuelEntryId?: number;
    maintenanceId?: number;
  }) =>
    withExclusiveTransaction(db, (txn) =>
      replaceLink({
        db: txn,
        recordId,
        fuelEntryId,
        maintenanceId,
      })
    );

  const unlinkFuel = async (entryId: number) =>
    withExclusiveTransaction(db, (txn) => unlinkEntry(txn, 'fuel_entry_id', entryId));

  const unlinkMaintenance = async (entryId: number) =>
    withExclusiveTransaction(db, (txn) =>
      unlinkEntry(txn, 'maintenance_id', entryId)
    );

  return {
    listGroupsForDate,
    searchRecords,
    linkRecord,
    unlinkFuel,
    unlinkMaintenance,
  };
};
