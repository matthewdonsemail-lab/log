/**
 * Listing photos: loaded from a path, URL or data-URL, then varied so every
 * upload has new bytes (FB flags a repeated photo + title as a duplicate:
 * `docs/listingPublish/imagePipeline.md`).
 */

/** FB's own cap on photos per listing (the form shows `N/10`). */
export const MAX_PHOTOS = 10

export type PhotoSourceKind = 'path' | 'url' | 'dataUrl'

export type ImageType = 'jpeg' | 'png' | 'webp' | 'gif' | 'heic' | 'avif'

/**
 * One variation, ranges from Listaro `src/lib/variations/image-variation.ts`.
 * Kept as data so a run can log exactly what was done to each photo.
 */
export interface VariationParams {
  /** Fraction trimmed from each edge. */
  crop: { top: number; right: number; bottom: number; left: number }
  /** Degrees, white fill. */
  rotate: number
  brightness: number
  saturation: number
  /** Degrees. */
  hue: number
  contrast: number
  /** Blur sigma, or sharpen sigma (one of the two). */
  blur: number | null
  sharpen: number | null
  /** Final size as a fraction of the original. */
  scale: number
  /** Opacity of the grain layer, 0..1. */
  noise: number
  quality: number
}

export interface PreparedPhoto {
  /** What the caller passed (data-URLs are shortened). */
  source: string
  kind: PhotoSourceKind
  /** The varied JPEG on disk, ready for `setInputFiles`. */
  path: string
  sha256: string
  width: number
  height: number
  bytes: number
  params: VariationParams
}

export type PrepareResult =
  | { ok: true; photos: PreparedPhoto[]; dir: string }
  | { ok: false; code: 'noPhotos' | 'tooManyPhotos' | 'unreadablePhoto' | 'notAnImage' | 'variationFailed'; detail: string }
