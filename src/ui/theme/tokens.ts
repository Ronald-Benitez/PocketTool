export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  pill: 999,
} as const;

export const controlHeight = {
  sm: 40,
  md: 48,
  lg: 56,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  subtitle: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  helper: { fontSize: 12, lineHeight: 18, fontWeight: '400' },
} as const;

export const shadows = {
  none: {},
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const zIndex = {
  base: 0,
  dropdown: 10,
  modal: 20,
  toast: 30,
} as const;

export type Spacing = keyof typeof spacing;
export type Radius = keyof typeof radii;
export type ControlHeight = keyof typeof controlHeight;
export type Typography = keyof typeof typography;
export type Shadow = keyof typeof shadows;
