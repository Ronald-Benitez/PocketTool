import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useChartPreferencesRepository } from '@/src/db';
import type {
  ChartPreferencePatch,
  ChartPreferenceView,
} from '@/src/db';
import { useLanguage } from '@/src/lang/LanguageContext';
import { useToast } from '@/src/ui/feedback/ToastProvider';
import { mapDatabaseError } from '@/src/db/errors';

export type ChartPreferenceDefaults = Partial<
  Pick<
    ChartPreferenceView,
    'collapsed' | 'mode' | 'hiddenSeries' | 'dataLimit' | 'limitFromEnd' | 'zoom'
  >
>;

type ChartPreferencesContextValue = {
  loaded: boolean;
  get: (
    chartKey: string,
    defaults?: ChartPreferenceDefaults
  ) => ChartPreferenceView;
  update: (chartKey: string, patch: ChartPreferencePatch) => void;
  setCollapsed: (chartKey: string, collapsed: boolean) => void;
  setMode: (chartKey: string, mode: string | null) => void;
  setHiddenSeries: (chartKey: string, hiddenSeries: string[]) => void;
  setDataLimit: (chartKey: string, dataLimit: number | null) => void;
  setLimitFromEnd: (chartKey: string, limitFromEnd: boolean) => void;
  setZoom: (chartKey: string, zoom: number | null) => void;
  setAllCollapsed: (chartKeys: string[], collapsed: boolean) => void;
  reset: (chartKey: string) => void;
};

const EMPTY_PREFERENCE: ChartPreferenceView = {
  chartKey: '',
  collapsed: false,
  mode: null,
  hiddenSeries: [],
  dataLimit: null,
  limitFromEnd: true,
  zoom: 1,
};

const ChartPreferencesContext =
  createContext<ChartPreferencesContextValue | null>(null);

export const ChartPreferencesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const repository = useChartPreferencesRepository();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const repositoryRef = useRef(repository);
  repositoryRef.current = repository;
  const toastRef = useRef(showToast);
  toastRef.current = showToast;
  const tRef = useRef(t);
  tRef.current = t;

  const [preferences, setPreferences] = useState<
    Record<string, ChartPreferenceView>
  >({});
  const [loaded, setLoaded] = useState(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const reportSaveError = useCallback((cause: unknown, label: string) => {
    if (__DEV__) console.warn(`[charts] ${label} failed`, cause);
    const mapped = mapDatabaseError(cause, tRef.current('toast.error'));
    toastRef.current({
      message: tRef.current(`dbErrors.${mapped.code}` as never),
      type: 'error',
    });
  }, []);

  const enqueueSave = useCallback((task: () => Promise<void>) => {
    saveQueue.current = saveQueue.current.then(task).catch(() => {
      // Tasks handle their own errors; keep the queue alive.
    });
  }, []);

  useEffect(() => {
    let active = true;
    repositoryRef.current
      .fetchAll()
      .then((rows) => {
        if (!active) return;
        const next: Record<string, ChartPreferenceView> = {};
        for (const row of rows) next[row.chartKey] = row;
        setPreferences(next);
      })
      .catch((cause) => {
        if (!active) return;
        if (__DEV__) console.warn('[charts] preferences load failed', cause);
        const mapped = mapDatabaseError(cause, tRef.current('toast.error'));
        toastRef.current({
          message: tRef.current(`dbErrors.${mapped.code}` as never),
          type: 'error',
        });
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const get = useCallback(
    (
      chartKey: string,
      defaults: ChartPreferenceDefaults = {}
    ): ChartPreferenceView => ({
      ...EMPTY_PREFERENCE,
      ...defaults,
      ...(preferences[chartKey] ?? {}),
      chartKey,
    }),
    [preferences]
  );

  const update = useCallback(
    (chartKey: string, patch: ChartPreferencePatch) => {
      setPreferences((current) => {
        const base = current[chartKey] ?? {
          ...EMPTY_PREFERENCE,
          chartKey,
        };
        const next: ChartPreferenceView = {
          ...base,
          ...patch,
          chartKey,
          hiddenSeries:
            patch.hiddenSeries === undefined
              ? base.hiddenSeries
              : patch.hiddenSeries ?? [],
        };
        return { ...current, [chartKey]: next };
      });

      enqueueSave(async () => {
        try {
          const saved = await repositoryRef.current.save(chartKey, patch);
          setPreferences((current) => ({ ...current, [chartKey]: saved }));
        } catch (cause) {
          reportSaveError(cause, 'preferences save');
        }
      });
    },
    [enqueueSave, reportSaveError]
  );

  const value = useMemo<ChartPreferencesContextValue>(
    () => ({
      loaded,
      get,
      update,
      setCollapsed: (chartKey, collapsed) => update(chartKey, { collapsed }),
      setMode: (chartKey, mode) => update(chartKey, { mode }),
      setHiddenSeries: (chartKey, hiddenSeries) =>
        update(chartKey, { hiddenSeries }),
      setDataLimit: (chartKey, dataLimit) => update(chartKey, { dataLimit }),
      setLimitFromEnd: (chartKey, limitFromEnd) =>
        update(chartKey, { limitFromEnd }),
      setZoom: (chartKey, zoom) => update(chartKey, { zoom }),
      setAllCollapsed: (chartKeys, collapsed) => {
        setPreferences((current) => {
          const next = { ...current };
          for (const chartKey of chartKeys) {
            const base = next[chartKey] ?? {
              ...EMPTY_PREFERENCE,
              chartKey,
            };
            next[chartKey] = { ...base, collapsed, chartKey };
          }
          return next;
        });
        enqueueSave(async () => {
          try {
            const saved = await repositoryRef.current.saveMany(
              chartKeys.map((chartKey) => ({
                chartKey,
                patch: { collapsed },
              }))
            );
            setPreferences((current) => {
              const next = { ...current };
              for (const row of saved) next[row.chartKey] = row;
              return next;
            });
          } catch (cause) {
            reportSaveError(cause, 'preferences bulk save');
          }
        });
      },
      reset: (chartKey) => {
        setPreferences((current) => {
          const next = { ...current };
          delete next[chartKey];
          return next;
        });
        enqueueSave(async () => {
          try {
            await repositoryRef.current.remove(chartKey);
          } catch (cause) {
            reportSaveError(cause, 'preferences reset');
          }
        });
      },
    }),
    [enqueueSave, get, loaded, reportSaveError, update]
  );

  return (
    <ChartPreferencesContext.Provider value={value}>
      {children}
    </ChartPreferencesContext.Provider>
  );
};

const FALLBACK_CONTEXT: ChartPreferencesContextValue = {
  loaded: true,
  get: (chartKey, defaults = {}) => ({
    ...EMPTY_PREFERENCE,
    ...defaults,
    chartKey,
  }),
  update: () => {},
  setCollapsed: () => {},
  setMode: () => {},
  setHiddenSeries: () => {},
  setDataLimit: () => {},
  setLimitFromEnd: () => {},
  setZoom: () => {},
  setAllCollapsed: () => {},
  reset: () => {},
};

export const useChartPreferences = () =>
  useContext(ChartPreferencesContext) ?? FALLBACK_CONTEXT;
