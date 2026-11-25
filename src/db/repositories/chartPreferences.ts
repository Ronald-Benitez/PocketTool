import { useSQLiteContext } from 'expo-sqlite';

import { ORM, useORM } from '@/src/orm';
import { withExclusiveTransaction } from '@/src/db/transaction';
import { mapDatabaseError } from '@/src/db/errors';
import { chartPreferenceInputSchema } from '@/src/validation/entities';
import type { ChartPreference } from '@/src/interfaces/schema';

export type ChartPreferenceView = {
  chartKey: string;
  collapsed: boolean;
  mode: string | null;
  hiddenSeries: string[];
  dataLimit: number | null;
  limitFromEnd: boolean;
  zoom: number | null;
};

export type ChartPreferencePatch = {
  collapsed?: boolean;
  mode?: string | null;
  hiddenSeries?: string[] | null;
  dataLimit?: number | null;
  limitFromEnd?: boolean;
  zoom?: number | null;
};

export type ChartPreferenceSave = {
  chartKey: string;
  patch: ChartPreferencePatch;
};

const parseHiddenSeries = (value: string | null | undefined): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
};

export const toChartPreferenceView = (
  row: ChartPreference
): ChartPreferenceView => ({
  chartKey: row.chart_key,
  collapsed: Boolean(row.collapsed),
  mode: row.mode ?? null,
  hiddenSeries: parseHiddenSeries(row.hidden_series),
  dataLimit: row.data_limit ?? null,
  limitFromEnd: row.limit_from_end !== 0,
  zoom: row.zoom ?? null,
});

const applyPreferenceSave = async (
  preferences: ORM<'ChartPreferences'>,
  chartKey: string,
  patch: ChartPreferencePatch
): Promise<ChartPreferenceView> => {
  const existing = (await preferences
    .where('chart_key', chartKey)
    .first()) as ChartPreference | null;

  const current: ChartPreferenceView | null = existing
    ? toChartPreferenceView(existing)
    : null;

  const input = chartPreferenceInputSchema.parse({
    chart_key: chartKey,
    collapsed: patch.collapsed ?? current?.collapsed ?? false,
    mode: patch.mode !== undefined ? patch.mode : current?.mode ?? null,
    hidden_series:
      patch.hiddenSeries !== undefined
        ? patch.hiddenSeries
        : current?.hiddenSeries ?? [],
    data_limit:
      patch.dataLimit !== undefined
        ? patch.dataLimit
        : current?.dataLimit ?? null,
    limit_from_end:
      patch.limitFromEnd !== undefined
        ? patch.limitFromEnd
        : current?.limitFromEnd ?? true,
    zoom: patch.zoom !== undefined ? patch.zoom : current?.zoom ?? null,
  });

  const payload = {
    chart_key: input.chart_key,
    collapsed: input.collapsed ? 1 : 0,
    mode: input.mode ?? null,
    hidden_series:
      input.hidden_series == null
        ? null
        : JSON.stringify(input.hidden_series),
    data_limit: input.data_limit ?? null,
    limit_from_end: input.limit_from_end ? 1 : 0,
    zoom: input.zoom ?? null,
  };

  if (existing?.id !== undefined) {
    await preferences.update(existing.id, payload);
  } else {
    await preferences.insert(payload);
  }

  const saved = (await preferences
    .where('chart_key', chartKey)
    .first()) as ChartPreference | null;
  if (!saved) throw new Error('CHART_PREFERENCE_SAVE_FAILED');
  return toChartPreferenceView(saved);
};

export const useChartPreferencesRepository = () => {
  const db = useSQLiteContext();
  const preferencesOrm = useORM('ChartPreferences');

  const fetchAll = async (): Promise<ChartPreferenceView[]> => {
    try {
      const rows = (await preferencesOrm.getAll()) as ChartPreference[];
      return rows.map(toChartPreferenceView);
    } catch (error) {
      throw mapDatabaseError(error, 'Could not load chart preferences');
    }
  };

  const save = async (
    chartKey: string,
    patch: ChartPreferencePatch
  ): Promise<ChartPreferenceView> => {
    try {
      return await withExclusiveTransaction(db, async (txn) => {
        const preferences = new ORM(txn, 'ChartPreferences');
        return applyPreferenceSave(preferences, chartKey, patch);
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not save chart preference');
    }
  };

  /**
   * Saves several preferences in one exclusive transaction. Used by
   * "expand all"/"collapse all" so the app never opens concurrent transactions.
   */
  const saveMany = async (
    entries: ChartPreferenceSave[]
  ): Promise<ChartPreferenceView[]> => {
    if (entries.length === 0) return [];
    try {
      return await withExclusiveTransaction(db, async (txn) => {
        const preferences = new ORM(txn, 'ChartPreferences');
        const saved: ChartPreferenceView[] = [];
        for (const entry of entries) {
          saved.push(
            await applyPreferenceSave(preferences, entry.chartKey, entry.patch)
          );
        }
        return saved;
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not save chart preferences');
    }
  };

  const remove = async (chartKey: string): Promise<void> => {
    try {
      await withExclusiveTransaction(db, async (txn) => {
        const preferences = new ORM(txn, 'ChartPreferences');
        const existing = (await preferences
          .where('chart_key', chartKey)
          .first()) as ChartPreference | null;
        if (existing?.id !== undefined) await preferences.delete(existing.id);
      });
    } catch (error) {
      throw mapDatabaseError(error, 'Could not remove chart preference');
    }
  };

  return { fetchAll, save, saveMany, remove };
};
