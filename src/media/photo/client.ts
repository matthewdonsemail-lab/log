/**
 * Load each photo and write a varied JPEG to disk. The only I/O in media/photo.
 *
 * Pipeline per photo (Listaro's sharp variation, plus EXIF orientation first
 * so phone photos don't post sideways once the EXIF is gone):
 * rotate(EXIF) → crop each edge → small rotate (white) → modulate →
 * contrast → blur | sharpen → resize → grain → JPEG (mozjpeg, no metadata).
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { decodeDataUrl, describeSource, photoSourceKind, sniffImageType, variationParams } from './helpers/index'
import { MAX_PHOTOS } from './types'
import type { PreparedPhoto, PrepareResult, VariationParams } from './types'

export interface PrepareOptions {
  /** Where the varied files go. Default `~/.logCli/media/<runId>`. */
  dir?: string
  runId?: string
  rng?: () => number
  fetchFn?: typeof fetch
  /**
   * The account's own HTTP proxy (`fetchProxyUrl`). URL photos are only ever
   * fetched through it, so the photo host sees the account's exit, never this
   * machine. No proxy and a URL photo means `photoNeedsProxy`.
   */
  proxy?: string | null
}

export function mediaDir(runId: string, env: Record<string, string | undefined> = process.env): string {
  return join(env.LOG_MEDIA_DIR || join(homedir(), '.logCli', 'media'), runId)
}

async function loadBytes(source: string, fetchFn: typeof fetch, proxy: string): Promise<Uint8Array> {
  const kind = photoSourceKind(source)
  if (kind === 'dataUrl') {
    const bytes = decodeDataUrl(source)
    if (!bytes) throw new Error('not a base64 data-URL')
    return bytes
  }
  if (kind === 'url') {
    // Listaro retried 3× with backoff; same here.
    let last: unknown
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        // Bun's fetch takes `proxy`; nothing else in the request says where it came from.
        const res = await fetchFn(source, { proxy } as RequestInit)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return new Uint8Array(await res.arrayBuffer())
      } catch (error) {
        last = error
        if (attempt < 3) await new Promise((r) => setTimeout(r, 500 * attempt))
      }
    }
    throw last instanceof Error ? last : new Error(String(last))
  }
  return new Uint8Array(readFileSync(source))
}

/** Apply one variation. Exported for tests. */
export async function varyPhoto(input: Uint8Array, params: VariationParams, rng: () => number = Math.random) {
  const upright = await sharp(input).rotate().toBuffer()
  const meta = await sharp(upright).metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0
  if (width < 50 || height < 50) throw new Error(`photo too small (${width}x${height})`)

  const left = Math.round(width * params.crop.left)
  const top = Math.round(height * params.crop.top)
  const cropWidth = width - left - Math.round(width * params.crop.right)
  const cropHeight = height - top - Math.round(height * params.crop.bottom)
  const outWidth = Math.round(cropWidth * params.scale)
  const outHeight = Math.round(cropHeight * params.scale)

  let pipeline = sharp(upright)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .rotate(params.rotate, { background: '#ffffff' })
    .modulate({ brightness: params.brightness, saturation: params.saturation, hue: params.hue })
    .linear(params.contrast, 128 * (1 - params.contrast))
  pipeline = params.blur !== null ? pipeline.blur(params.blur) : pipeline.sharpen({ sigma: params.sharpen ?? 0.8 })
  // Rotating grows the canvas; resize back to a fixed box so the white corners are cropped away.
  const shaped = await pipeline.resize(outWidth, outHeight, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })

  // Grain: a grey noise layer blended over at low opacity, so every file's pixels differ.
  const { info } = shaped
  const grain = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < grain.length; i += 4) {
    const v = Math.floor(rng() * 256)
    grain[i] = v
    grain[i + 1] = v
    grain[i + 2] = v
    grain[i + 3] = Math.round(params.noise * 255)
  }
  const out = await sharp(shaped.data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .composite([{ input: grain, raw: { width: info.width, height: info.height, channels: 4 } }])
    .jpeg({ quality: params.quality, mozjpeg: true })
    .toBuffer()
  return { bytes: out, width: info.width, height: info.height }
}

export async function preparePhotos(sources: string[], options: PrepareOptions = {}): Promise<PrepareResult> {
  if (sources.length === 0) return { ok: false, code: 'noPhotos', detail: 'a Marketplace listing needs at least 1 photo' }
  if (sources.length > MAX_PHOTOS) {
    return { ok: false, code: 'tooManyPhotos', detail: `${sources.length} photos; Facebook takes at most ${MAX_PHOTOS}` }
  }
  const rng = options.rng ?? Math.random
  const runId = options.runId ?? new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)
  const dir = options.dir ?? mediaDir(runId)
  mkdirSync(dir, { recursive: true })

  const proxy = options.proxy ?? null
  const remote = sources.filter((source) => photoSourceKind(source) === 'url')
  if (remote.length && !proxy) {
    return {
      ok: false,
      code: 'photoNeedsProxy',
      detail: `${remote.length} photo URL(s) (${describeSource(remote[0])}) and no HTTP proxy to fetch them through: never fetched from this machine`
    }
  }

  const photos: PreparedPhoto[] = []
  for (const [index, source] of sources.entries()) {
    const label = describeSource(source)
    let bytes: Uint8Array
    try {
      bytes = await loadBytes(source, options.fetchFn ?? fetch, proxy ?? '')
    } catch (error) {
      return { ok: false, code: 'unreadablePhoto', detail: `${label}: ${error instanceof Error ? error.message : String(error)}` }
    }
    const type = sniffImageType(bytes)
    if (!type) return { ok: false, code: 'notAnImage', detail: `${label}: the bytes are not a JPEG/PNG/WebP/GIF/HEIC/AVIF image` }

    const params = variationParams(rng)
    try {
      const varied = await varyPhoto(bytes, params, rng)
      const path = join(dir, `photo${index + 1}.jpg`)
      writeFileSync(path, varied.bytes)
      photos.push({
        source: label,
        kind: photoSourceKind(source),
        path,
        sha256: createHash('sha256').update(varied.bytes).digest('hex'),
        width: varied.width,
        height: varied.height,
        bytes: varied.bytes.length,
        params
      })
    } catch (error) {
      return { ok: false, code: 'variationFailed', detail: `${label}: ${error instanceof Error ? error.message : String(error)}` }
    }
  }
  return { ok: true, photos, dir }
}
