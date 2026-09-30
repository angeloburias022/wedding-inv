import { readFileSync } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

/**
 * Frame limits, as Instagram does: tall phone portraits are trimmed to 4:5,
 * wide shots show whole up to 1.91:1. Anything in between keeps its own shape.
 */
const MIN_RATIO = 4 / 5;
const MAX_RATIO = 1.91;
export const DEFAULT_RATIO = MIN_RATIO;

/**
 * Width / height for a photo in `public/`, clamped to the frame limits.
 * Read at build time (pages are prerendered), so frames never shift on load.
 * Returns `fallback` (4:5 by default) when there is no photo or it can't be read.
 */
export function photoRatio(src: string | null | undefined, fallback = DEFAULT_RATIO): number {
  if (!src || /^https?:\/\//.test(src)) return fallback;

  try {
    const { width, height, orientation } = imageSize(readFileSync(path.join(process.cwd(), "public", src)));
    if (!width || !height) return fallback;
    // EXIF orientations 5–8 are rotated 90°: phone portraits often store landscape pixels.
    const ratio = orientation && orientation >= 5 ? height / width : width / height;
    return Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio));
  } catch {
    return fallback;
  }
}
