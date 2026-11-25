export type DropIndexInput = {
  from: number;
  translationY: number;
  heights: number[];
  count: number;
  estimatedHeight?: number;
};

/**
 * Resolves the target index for a vertical drag.
 *
 * The list uses measured row heights when available and falls back to an
 * estimate for rows that have not rendered yet. The result is always clamped to
 * the list bounds.
 */
export const resolveDropIndex = ({
  from,
  translationY,
  heights,
  count,
  estimatedHeight = 72,
}: DropIndexInput) => {
  if (count <= 0) return from;

  const start = Math.max(0, Math.min(count - 1, from));
  if (translationY === 0) return start;

  let target = start;

  if (translationY > 0) {
    let offset = translationY;
    for (let index = start + 1; index < count; index += 1) {
      const height = heights[index] ?? estimatedHeight;
      if (offset <= height / 2) break;
      offset -= height;
      target = index;
    }
  } else {
    let offset = -translationY;
    for (let index = start - 1; index >= 0; index -= 1) {
      const height = heights[index] ?? estimatedHeight;
      if (offset <= height / 2) break;
      offset -= height;
      target = index;
    }
  }

  return Math.max(0, Math.min(count - 1, target));
};
