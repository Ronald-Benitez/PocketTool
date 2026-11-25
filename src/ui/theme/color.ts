const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

const clampAlpha = (alpha: number) => Math.min(1, Math.max(0, alpha));

const expandHex = (hex: string) => {
  if (hex.length === 3 || hex.length === 4) {
    return hex
      .split('')
      .map((value) => `${value}${value}`)
      .join('');
  }
  return hex;
};

/**
 * Replaces the alpha channel of a hex color.
 *
 * Supports `#RGB`, `#RGBA`, `#RRGGBB` and `#RRGGBBAA`. Any other color format
 * (named colors, `rgb()`, `hsl()`) is returned unchanged so callers can fall
 * back to the original token instead of rendering an invalid color.
 */
export const withAlpha = (color: string, alpha: number) => {
  const normalized = color.trim();
  if (!HEX_COLOR.test(normalized)) return color;

  const expanded = expandHex(normalized.slice(1)).toUpperCase();
  const rgb = expanded.slice(0, 6);
  const value = Math.round(clampAlpha(alpha) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  return `#${rgb}${value}`;
};

/** Returns true when the value is a supported hex color. */
export const isHexColor = (color: string) => HEX_COLOR.test(color.trim());
