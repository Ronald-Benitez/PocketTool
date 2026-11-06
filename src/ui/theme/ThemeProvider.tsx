import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import type { ColorScheme, ThemeColorTokens } from '@/src/interfaces/colors';
import { buildColorScheme } from './colors';
import {
  DEFAULT_SETTINGS,
  LEGACY_THEME_STORAGE_KEY,
  THEME_STORAGE_KEY,
  migrateLegacyColors,
  modeToPalette,
  normalizeSettings,
  pickTokens,
  resolveMode,
  resolvePalettes,
  type PaletteName,
  type ResolvedMode,
  type ThemeMode,
  type ThemeSettings,
} from './settings';

export type { PaletteName, ResolvedMode, ThemeMode, ThemeSettings };

type ThemeContextValue = {
  settings: ThemeSettings;
  mode: ThemeMode;
  resolvedMode: ResolvedMode;
  colors: ColorScheme;
  palettes: Record<PaletteName, ThemeColorTokens>;
  isReady: boolean;
  setMode: (mode: ThemeMode) => void;
  setPaletteColor: (palette: PaletteName, key: keyof ThemeColorTokens, value: string) => void;
  replacePalette: (palette: PaletteName, colors: ColorScheme) => void;
  setUseBase: (palette: PaletteName, useBase: boolean) => void;
  resetColor: (palette: PaletteName, key: keyof ThemeColorTokens) => void;
  resetPalette: (palette: PaletteName) => void;
  resetAll: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<ThemeSettings>(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (mounted) setSettings(normalizeSettings(parsed));
        } else {
          const legacy = await AsyncStorage.getItem(LEGACY_THEME_STORAGE_KEY);
          if (legacy) {
            const parsed = JSON.parse(legacy) as Record<string, unknown>;
            const migrated: ThemeSettings = {
              ...DEFAULT_SETTINGS,
              useBase: { bright: false, dark: true },
              bright: migrateLegacyColors(parsed),
            };
            if (mounted) setSettings(migrated);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(migrated));
            await AsyncStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('No se pudo cargar la configuración de tema:', error);
      } finally {
        if (mounted) setIsReady(true);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const timeout = setTimeout(() => {
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(settings)).catch((error) => {
        console.error('No se pudo guardar la configuración de tema:', error);
      });
    }, 150);

    return () => clearTimeout(timeout);
  }, [settings, isReady]);

  const resolvedMode = resolveMode(settings.mode, systemScheme);
  const palettes = useMemo(() => resolvePalettes(settings), [settings]);
  const activePalette = palettes[modeToPalette(resolvedMode)];
  const colors = useMemo(() => buildColorScheme(activePalette), [activePalette]);

  const setMode = useCallback((mode: ThemeMode) => {
    setSettings((current) => ({ ...current, mode }));
  }, []);

  const setPaletteColor = useCallback(
    (palette: PaletteName, key: keyof ThemeColorTokens, value: string) => {
      setSettings((current) => ({
        ...current,
        useBase: { ...current.useBase, [palette]: false },
        [palette]: { ...current[palette], [key]: value },
      }));
    },
    []
  );

  const replacePalette = useCallback((palette: PaletteName, nextColors: ColorScheme) => {
    const tokens = pickTokens(nextColors as Record<string, unknown>);
    setSettings((current) => ({
      ...current,
      useBase: { ...current.useBase, [palette]: false },
      [palette]: tokens,
    }));
  }, []);

  const setUseBase = useCallback((palette: PaletteName, useBase: boolean) => {
    setSettings((current) => ({
      ...current,
      useBase: { ...current.useBase, [palette]: useBase },
      [palette]: useBase ? {} : current[palette],
    }));
  }, []);

  const resetColor = useCallback((palette: PaletteName, key: keyof ThemeColorTokens) => {
    setSettings((current) => {
      const nextOverrides = { ...current[palette] };
      delete nextOverrides[key];
      return {
        ...current,
        [palette]: nextOverrides,
        useBase: {
          ...current.useBase,
          [palette]: Object.keys(nextOverrides).length === 0 ? true : current.useBase[palette],
        },
      };
    });
  }, []);

  const resetPalette = useCallback((palette: PaletteName) => {
    setSettings((current) => ({
      ...current,
      [palette]: {},
      useBase: { ...current.useBase, [palette]: true },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setSettings((current) => ({ ...DEFAULT_SETTINGS, mode: current.mode }));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      settings,
      mode: settings.mode,
      resolvedMode,
      colors,
      palettes,
      isReady,
      setMode,
      setPaletteColor,
      replacePalette,
      setUseBase,
      resetColor,
      resetPalette,
      resetAll,
    }),
    [
      settings,
      resolvedMode,
      colors,
      palettes,
      isReady,
      setMode,
      setPaletteColor,
      replacePalette,
      setUseBase,
      resetColor,
      resetPalette,
      resetAll,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};
