import { useCallback } from 'react';

import type { ColorScheme } from '@/src/interfaces/colors';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import { modeToPalette } from '@/src/ui/theme/settings';

/**
 * Adaptador de compatibilidad para el código heredado que todavía consume
 * `useColorStore`. El estado real vive en `ThemeProvider`; este hook solo
 * expone `colors` y conserva la API anterior durante la migración a `useTheme`.
 */
const useColorStore = () => {
  const { colors, resolvedMode, isReady, replacePalette, resetPalette } = useTheme();

  const initializeColors = useCallback(async () => {
    // ThemeProvider carga y migra la configuración al montarse.
    if (!isReady) return;
  }, [isReady]);

  const saveColors = useCallback(
    async (newColors: ColorScheme) => {
      replacePalette(modeToPalette(resolvedMode), newColors);
    },
    [replacePalette, resolvedMode]
  );

  const resetColors = useCallback(async () => {
    resetPalette(modeToPalette(resolvedMode));
  }, [resetPalette, resolvedMode]);

  return { colors, initializeColors, saveColors, resetColors };
};

export default useColorStore;
