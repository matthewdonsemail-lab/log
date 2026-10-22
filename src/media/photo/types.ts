export const MAX_PHOTOS = 10

export type PhotoSourceKind = 'path' | 'url' | 'dataUrl'

export type ImageType = 'jpeg' | 'png' | 'webp' | 'gif' | 'heic' | 'avif'

export interface VariationParams {
  crop: { top: number; right: number; bottom: number; left: number }
  rotate: number
  brightness: number
  saturation: number
  hue: number
  contrast: number
  blur: number | null
  sharpen: number | null
  scale: number
  noise: number
  quality: number
}

export interface PreparedPhoto {
  source: string
  kind: PhotoSourceKind
  path: string
  sha256: string
  width: number
  height: number
  bytes: number
  params: VariationParams
}

export type PrepareResult =
  | { ok: true; photos: PreparedPhoto[]; dir: string }
  | { ok: false; code: 'noPhotos' | 'tooManyPhotos' | 'unreadablePhoto' | 'notAnImage' | 'variationFailed' | 'photoNeedsProxy'; detail: string }
