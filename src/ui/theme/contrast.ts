import type { ThemeColorTokens } from '@/src/interfaces/colors';

const parseHex = (color: string): [number, number, number] | null => {
  const value = color.trim();
  if (!value.startsWith('#')) return null;
  const hex = value.slice(1);
  if (hex.length === 3) {
    return [
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16),
    ];
  }
  if (hex.length === 6 || hex.length === 8) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  return null;
};

const luminance = ([red, green, blue]: [number, number, number]) => {
  const channel = (value: number) => {
    const normalized = value / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
};

export const contrastRatio = (foreground: string, background: string): number | null => {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return null;
  const lighter = Math.max(luminance(fg), luminance(bg));
  const darker = Math.min(luminance(fg), luminance(bg));
  return (lighter + 0.05) / (darker + 0.05);
};

export type ContrastWarning = {
  /** Clave de traducción bajo `theme.contrast`. */
  key: string;
  ratio: number;
};

const CONTRAST_PAIRS: {
  key: string;
  foreground: keyof ThemeColorTokens;
  background: keyof ThemeColorTokens;
}[] = [
  { key: 'textBackground', foreground: 'text', background: 'background' },
  { key: 'textSurface', foreground: 'text', background: 'surface' },
  { key: 'mutedSurface', foreground: 'textMuted', background: 'surface' },
  { key: 'onPrimary', foreground: 'onPrimary', background: 'primary' },
  { key: 'onDanger', foreground: 'onDanger', background: 'danger' },
  { key: 'onSuccess', foreground: 'onSuccess', background: 'success' },
  { key: 'onWarning', foreground: 'onWarning', background: 'warning' },
  { key: 'onInfo', foreground: 'onInfo', background: 'info' },
];

export const MIN_CONTRAST_RATIO = 4.5;

export const getContrastWarnings = (palette: ThemeColorTokens): ContrastWarning[] =>
  CONTRAST_PAIRS.flatMap((pair) => {
    const ratio = contrastRatio(palette[pair.foreground], palette[pair.background]);
    if (ratio === null || ratio >= MIN_CONTRAST_RATIO) return [];
    return [{ key: pair.key, ratio: Number(ratio.toFixed(2)) }];
  });
