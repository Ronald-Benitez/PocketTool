import { useMemo } from 'react';

import { useTheme } from '@/src/ui/theme/ThemeProvider';
import baseStyles from './styles';

/**
 * Adapta los estilos legacy de `styles.ts` al tema activo. Solo se reemplazan
 * los valores que dependen del color; layout y tipografía base se mantienen.
 */
export const useThemedStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () => ({
      ...baseStyles,
      smallText: [baseStyles.smallText, { color: colors.textMuted }],
      middleText: [baseStyles.middleText, { color: colors.text }],
      title: [baseStyles.title, { color: colors.text }],
      text: [baseStyles.text, { color: colors.text }],
      label: [baseStyles.label, { color: colors.textMuted }],
      textColor: [
        baseStyles.textColor,
        { color: colors.text, borderColor: colors.borderStrong },
      ],
      enfasizedText: [baseStyles.enfasizedText, { color: colors.text }],
      bgPrimary: [baseStyles.bgPrimary, { backgroundColor: colors.background }],
      container: [baseStyles.container, { backgroundColor: colors.background }],
      dropdowmContainer: [
        baseStyles.dropdowmContainer,
        { backgroundColor: colors.surface },
      ],
      modalBackdrop: [baseStyles.modalBackdrop, { backgroundColor: colors.overlay }],
      modalContent: [baseStyles.modalContent, { backgroundColor: colors.surface }],
      input: [
        baseStyles.input,
        {
          backgroundColor: colors.inputBackground,
          borderColor: colors.border,
          color: colors.text,
        },
      ],
      inputContainer: [
        baseStyles.inputContainer,
        { backgroundColor: colors.inputBackground, borderColor: colors.border },
      ],
      button: [baseStyles.button, { backgroundColor: colors.surface }],
      enfasizedButton: [
        baseStyles.enfasizedButton,
        { backgroundColor: colors.surfaceMuted },
      ],
      backgroundButton: [
        baseStyles.backgroundButton,
        { backgroundColor: colors.surface },
      ],
      disabledButton: [
        baseStyles.disabledButton,
        { backgroundColor: colors.textDisabled },
      ],
      divider: [baseStyles.divider, { backgroundColor: colors.border }],
      horizontalBlock: [
        baseStyles.horizontalBlock,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ],
      fixedBottom: [baseStyles.fixedBottom, { backgroundColor: colors.surface }],
      fixedTop: [baseStyles.fixedTop, { backgroundColor: colors.surface }],
      underBlock: [baseStyles.underBlock, { backgroundColor: colors.surface }],
      selector: [baseStyles.selector, { backgroundColor: colors.surface }],
      indicatorText: [baseStyles.indicatorText, { color: colors.text }],
      modalContainer: [
        baseStyles.modalContainer,
        { backgroundColor: colors.surface },
      ],
      toastContent: [baseStyles.toastContent, { backgroundColor: colors.surface }],
      textPrimary: { color: colors.text },
      textMuted: { color: colors.textMuted },
      textDanger: { color: colors.danger },
      textSuccess: { color: colors.success },
      textWarning: { color: colors.warning },
      textInfo: { color: colors.info },
      surface: { backgroundColor: colors.surface },
      surfaceMuted: { backgroundColor: colors.surfaceMuted },
      border: { borderColor: colors.border },
    }),
    [colors]
  );
};
