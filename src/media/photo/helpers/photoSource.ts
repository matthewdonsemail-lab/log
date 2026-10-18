import type { ImageType, PhotoSourceKind } from '../types'

/** `https://…` → url, `data:image/…` → dataUrl, anything else → path. Pure. */
export function photoSourceKind(source: string): PhotoSourceKind {
  if (/^https?:\/\//i.test(source)) return 'url'
  if (/^data:/i.test(source)) return 'dataUrl'
  return 'path'
}

/** Decode a base64 data-URL (the dashboard's create form stores photos this way). Pure. */
export function decodeDataUrl(source: string): Uint8Array | null {
  const match = source.match(/^data:([^;,]*)(;base64)?,(.*)$/is)
  if (!match || !match[2]) return null
  try {
    return Uint8Array.from(Buffer.from(match[3], 'base64'))
  } catch {
    return null
  }
}

/** What the bytes are, from their magic numbers (never the file extension). Pure. */
export function sniffImageType(bytes: Uint8Array): ImageType | null {
  const at = (i: number) => bytes[i]
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end))
  if (bytes.length < 12) return null
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return 'jpeg'
  if (at(0) === 0x89 && ascii(1, 4) === 'PNG') return 'png'
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp'
  if (ascii(0, 3) === 'GIF') return 'gif'
  if (ascii(4, 8) === 'ftyp') {
    const brand = ascii(8, 12)
    if (brand.startsWith('avi')) return 'avif'
    if (/^(heic|heix|hevc|mif1|msf1)$/.test(brand)) return 'heic'
  }
  return null
}

/** Short label for logs: data-URLs are huge, so only their head is kept. Pure. */
export function describeSource(source: string): string {
  return photoSourceKind(source) === 'dataUrl' ? `${source.slice(0, 30)}… (${source.length} chars)` : source
}
