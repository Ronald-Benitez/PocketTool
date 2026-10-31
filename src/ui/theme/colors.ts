import brightBaseJson from './palettes/bright.base.json';
import darkBaseJson from './palettes/dark.base.json';
import type { ColorScheme, ThemeColorTokens } from '@/src/interfaces/colors';

export const brightBase = brightBaseJson as ThemeColorTokens;
export const darkBase = darkBaseJson as ThemeColorTokens;

export const THEME_COLOR_KEYS = Object.keys(brightBase) as (keyof ThemeColorTokens)[];

export const buildColorScheme = (tokens: ThemeColorTokens): ColorScheme => ({
  ...tokens,
  InputStroke: tokens.borderStrong,
  GoalColor: tokens.goal,
  BGPicker: tokens.surfaceMuted,
  ModalHeaderColor: tokens.modalHeaderBg,
  ConfirmColor: tokens.secondary,
  IncomeColor: tokens.income,
  ExpenseColor: tokens.expense,
  TransferColor: tokens.transfer,
  BGSimple: tokens.surfaceMuted,
  BGColor: tokens.background,
  Credit: tokens.credit,
  Debit: tokens.debit,
});

export const mergePalette = (
  base: ThemeColorTokens,
  overrides: Partial<ThemeColorTokens>
): ThemeColorTokens => ({ ...base, ...overrides });

export type ColorGroup = {
  key: string;
  tokens: (keyof ThemeColorTokens)[];
};

export const COLOR_GROUPS: ColorGroup[] = [
  {
    key: 'base',
    tokens: ['background', 'surface', 'surfaceMuted', 'surfaceElevated', 'overlay', 'shadow'],
  },
  {
    key: 'text',
    tokens: ['text', 'textMuted', 'textDisabled', 'textInverse', 'link'],
  },
  {
    key: 'inputs',
    tokens: ['border', 'borderStrong', 'inputBackground', 'placeholder', 'focusRing'],
  },
  {
    key: 'actions',
    tokens: [
      'primary',
      'primaryPressed',
      'onPrimary',
      'secondary',
      'onSecondary',
      'danger',
      'onDanger',
      'success',
      'onSuccess',
      'warning',
      'onWarning',
      'info',
      'onInfo',
    ],
  },
  {
    key: 'finance',
    tokens: ['income', 'expense', 'transfer', 'goal', 'neutral', 'saving', 'credit', 'debit'],
  },
  {
    key: 'charts',
    tokens: [
      'chartPlanned',
      'chartActual',
      'chartProjected',
      'chartFuelCost',
      'chartMaintenanceCost',
      'chartConsumption',
      'chartDistance',
    ],
  },
  {
    key: 'overlays',
    tokens: [
      'modalHeaderBg',
      'modalHeaderText',
      'toastSuccessBg',
      'toastSuccessText',
      'toastErrorBg',
      'toastErrorText',
      'toastWarningBg',
      'toastWarningText',
      'toastInfoBg',
      'toastInfoText',
    ],
  },
  {
    key: 'components',
    tokens: [
      'switchOn',
      'switchOff',
      'chipBg',
      'chipText',
      'tableHeaderBg',
      'rowAltBg',
      'badgeBg',
      'badgeText',
      'skeleton',
    ],
  },
];

export const COLOR_GROUP_LABELS: Record<string, { en: string; es: string }> = {
  base: { en: 'Base', es: 'Base' },
  text: { en: 'Text', es: 'Texto' },
  inputs: { en: 'Inputs and borders', es: 'Inputs y bordes' },
  actions: { en: 'Actions', es: 'Acciones' },
  finance: { en: 'Finance', es: 'Finanzas' },
  charts: { en: 'Charts', es: 'Gráficos' },
  overlays: { en: 'Modals and toasts', es: 'Modales y toasts' },
  components: { en: 'Components', es: 'Componentes' },
};

export const COLOR_LABELS_ES: Record<keyof ThemeColorTokens, string> = {
  background: 'Fondo',
  surface: 'Superficie',
  surfaceMuted: 'Superficie suave',
  surfaceElevated: 'Superficie elevada',
  overlay: 'Fondo de overlay',
  shadow: 'Sombra',
  text: 'Texto',
  textMuted: 'Texto secundario',
  textDisabled: 'Texto deshabilitado',
  textInverse: 'Texto inverso',
  link: 'Enlace',
  border: 'Borde',
  borderStrong: 'Borde fuerte',
  inputBackground: 'Fondo de input',
  placeholder: 'Placeholder',
  focusRing: 'Foco',
  primary: 'Primario',
  primaryPressed: 'Primario presionado',
  onPrimary: 'Texto sobre primario',
  secondary: 'Secundario',
  onSecondary: 'Texto sobre secundario',
  danger: 'Peligro',
  onDanger: 'Texto sobre peligro',
  success: 'Éxito',
  onSuccess: 'Texto sobre éxito',
  warning: 'Advertencia',
  onWarning: 'Texto sobre advertencia',
  info: 'Información',
  onInfo: 'Texto sobre información',
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
  goal: 'Meta',
  neutral: 'Neutro',
  saving: 'Ahorro',
  credit: 'Crédito',
  debit: 'Débito',
  chartPlanned: 'Planificado en gráficos',
  chartActual: 'Real en gráficos',
  chartProjected: 'Proyectado en gráficos',
  chartFuelCost: 'Costo de combustible',
  chartMaintenanceCost: 'Costo de mantenimiento',
  chartConsumption: 'Consumo',
  chartDistance: 'Distancia',
  modalHeaderBg: 'Fondo de encabezado de modal',
  modalHeaderText: 'Texto de encabezado de modal',
  toastSuccessBg: 'Fondo toast éxito',
  toastSuccessText: 'Texto toast éxito',
  toastErrorBg: 'Fondo toast error',
  toastErrorText: 'Texto toast error',
  toastWarningBg: 'Fondo toast advertencia',
  toastWarningText: 'Texto toast advertencia',
  toastInfoBg: 'Fondo toast info',
  toastInfoText: 'Texto toast info',
  switchOn: 'Switch activo',
  switchOff: 'Switch inactivo',
  chipBg: 'Fondo de chip',
  chipText: 'Texto de chip',
  tableHeaderBg: 'Fondo cabecera de tabla',
  rowAltBg: 'Fila alterna',
  badgeBg: 'Fondo de badge',
  badgeText: 'Texto de badge',
  skeleton: 'Skeleton',
};

export const humanizeColorKey = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (character) => character.toUpperCase())
    .trim();

export const getColorLabel = (key: keyof ThemeColorTokens, language: 'en' | 'es') =>
  language === 'es' ? COLOR_LABELS_ES[key] : humanizeColorKey(key);
