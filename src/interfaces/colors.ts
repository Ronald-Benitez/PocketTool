export type ThemeColorTokens = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;
  overlay: string;
  shadow: string;

  text: string;
  textMuted: string;
  textDisabled: string;
  textInverse: string;
  link: string;

  border: string;
  borderStrong: string;
  inputBackground: string;
  placeholder: string;
  focusRing: string;

  primary: string;
  primaryPressed: string;
  onPrimary: string;
  secondary: string;
  onSecondary: string;

  danger: string;
  onDanger: string;
  success: string;
  onSuccess: string;
  warning: string;
  onWarning: string;
  info: string;
  onInfo: string;

  income: string;
  expense: string;
  transfer: string;
  goal: string;
  neutral: string;
  saving: string;
  credit: string;
  debit: string;

  modalHeaderBg: string;
  modalHeaderText: string;

  toastSuccessBg: string;
  toastSuccessText: string;
  toastErrorBg: string;
  toastErrorText: string;
  toastWarningBg: string;
  toastWarningText: string;
  toastInfoBg: string;
  toastInfoText: string;

  switchOn: string;
  switchOff: string;
  chipBg: string;
  chipText: string;
  tableHeaderBg: string;
  rowAltBg: string;
  badgeBg: string;
  badgeText: string;
  skeleton: string;
};

/**
 * Aliases legacy mantenidos para los componentes existentes.
 * Se derivan de los tokens nuevos en `buildColorScheme`.
 */
export type LegacyColorAliases = {
  InputStroke: string;
  GoalColor: string;
  BGPicker: string;
  ModalHeaderColor: string;
  ConfirmColor: string;
  IncomeColor: string;
  ExpenseColor: string;
  TransferColor: string;
  BGSimple: string;
  BGColor: string;
  Credit: string;
  Debit: string;
};

export type ColorScheme = ThemeColorTokens & LegacyColorAliases;

export const LEGACY_COLOR_KEYS = [
  'InputStroke',
  'GoalColor',
  'BGPicker',
  'ModalHeaderColor',
  'ConfirmColor',
  'IncomeColor',
  'ExpenseColor',
  'TransferColor',
  'BGSimple',
  'BGColor',
  'Credit',
  'Debit',
] as const;

export type LegacyColorKey = (typeof LEGACY_COLOR_KEYS)[number];
