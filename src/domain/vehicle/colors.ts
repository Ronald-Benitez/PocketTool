const FALLBACK_COLOR = '#6B7280';

const NAMED_COLORS: Record<string, string> = {
  red: '#DC2626',
  rojo: '#DC2626',
  blue: '#2563EB',
  azul: '#2563EB',
  green: '#16A34A',
  verde: '#16A34A',
  black: '#111827',
  negro: '#111827',
  white: '#F8FAFC',
  blanco: '#F8FAFC',
  gray: '#6B7280',
  grey: '#6B7280',
  gris: '#6B7280',
  silver: '#CBD5E1',
  plata: '#CBD5E1',
  yellow: '#EAB308',
  amarillo: '#EAB308',
  orange: '#F97316',
  naranja: '#F97316',
  brown: '#92400E',
  marron: '#92400E',
  purple: '#7C3AED',
  morado: '#7C3AED',
  violeta: '#7C3AED',
  pink: '#DB2777',
  rosa: '#DB2777',
  cyan: '#0891B2',
  celeste: '#38BDF8',
  gold: '#D4AF37',
  dorado: '#D4AF37',
  turquoise: '#14B8A6',
  turquesa: '#14B8A6',
};

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const expandHex = (value: string) => {
  const hex = value.slice(1);
  if (hex.length === 3) {
    return `#${hex
      .split('')
      .map((char) => char + char)
      .join('')
      .toUpperCase()}`;
  }
  return `#${hex.slice(0, 6).toUpperCase()}`;
};

export const isHexColor = (value: string) =>
  /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(value.trim());

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    hue < 60
      ? [c, x, 0]
      : hue < 120
        ? [x, c, 0]
        : hue < 180
          ? [0, c, x]
          : hue < 240
            ? [0, x, c]
            : hue < 300
              ? [x, 0, c]
              : [c, 0, x];
  const toHex = (value: number) =>
    Math.round((value + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const hashHue = (value: string) => {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return hash;
};

export const resolveVehicleColor = (value?: string | null) => {
  const text = value?.trim();
  if (!text) return FALLBACK_COLOR;
  if (isHexColor(text)) return expandHex(text);

  const normalized = normalize(text);
  const exact = NAMED_COLORS[normalized];
  if (exact) return exact;

  const match = Object.entries(NAMED_COLORS).find(([name]) =>
    normalized.includes(name)
  );
  if (match) return match[1];

  return hslToHex(hashHue(normalized || 'vehicle'), 62, 45);
};

export const shadeVehicleColor = (hex: string, amount: number) => {
  const value = isHexColor(hex) ? expandHex(hex) : FALLBACK_COLOR;
  const channel = (start: number) =>
    Math.max(
      0,
      Math.min(
        255,
        Math.round(
          parseInt(value.slice(start, start + 2), 16) +
            amount * 255
        )
      )
    )
      .toString(16)
      .padStart(2, '0');
  return `#${channel(1)}${channel(3)}${channel(5)}`.toUpperCase();
};

export const VEHICLE_COLOR_FALLBACK = FALLBACK_COLOR;
