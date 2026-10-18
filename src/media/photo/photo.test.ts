import { describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { decodeDataUrl, photoSourceKind, preparePhotos, sniffImageType, variationParams } from './index'

/** Deterministic rng so the variation ranges can be checked. */
function seeded(seed = 1) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const samplePng = () =>
  sharp({ create: { width: 200, height: 150, channels: 3, background: { r: 40, g: 120, b: 200 } } }).png().toBuffer()

describe('photo helpers', () => {
  test('photoSourceKind', () => {
    expect(photoSourceKind('https://x.supabase.co/a.jpg')).toBe('url')
    expect(photoSourceKind('data:image/png;base64,AAAA')).toBe('dataUrl')
    expect(photoSourceKind('C:/photos/van.jpg')).toBe('path')
  })

  test('sniffImageType reads magic bytes, not names', async () => {
    expect(sniffImageType(new Uint8Array(await samplePng()))).toBe('png')
    expect(sniffImageType(new Uint8Array(await sharp(await samplePng()).jpeg().toBuffer()))).toBe('jpeg')
    expect(sniffImageType(new TextEncoder().encode('definitely not an image'))).toBeNull()
  })

  test('decodeDataUrl', async () => {
    const png = await samplePng()
    const bytes = decodeDataUrl(`data:image/png;base64,${png.toString('base64')}`)
    expect(bytes && sniffImageType(bytes)).toBe('png')
    expect(decodeDataUrl('data:image/png,notbase64')).toBeNull()
  })

  test('variationParams stays inside Listaro ranges', () => {
    const rng = seeded(7)
    for (let i = 0; i < 50; i++) {
      const p = variationParams(rng)
      for (const edge of Object.values(p.crop)) expect(edge >= 0.02 && edge <= 0.05).toBe(true)
      expect(Math.abs(p.rotate) >= 1 && Math.abs(p.rotate) <= 3).toBe(true)
      expect(p.brightness >= 0.9 && p.brightness <= 1.1).toBe(true)
      expect(p.quality >= 80 && p.quality <= 95).toBe(true)
      expect((p.blur === null) !== (p.sharpen === null)).toBe(true)
    }
  })
})

describe('preparePhotos', () => {
  test('writes a varied JPEG per source, each with a different hash', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'logCliPhotos'))
    const png = await samplePng()
    const path = join(dir, 'in.png')
    writeFileSync(path, png)
    const result = await preparePhotos([path, path, `data:image/png;base64,${png.toString('base64')}`], { dir: join(dir, 'out'), rng: seeded(3) })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.photos).toHaveLength(3)
    expect(new Set(result.photos.map((p) => p.sha256)).size).toBe(3)
    for (const photo of result.photos) {
      expect(photo.path.endsWith('.jpg')).toBe(true)
      const meta = await sharp(photo.path).metadata()
      expect(meta.format).toBe('jpeg')
      expect(meta.exif).toBeUndefined()
    }
    expect(result.photos[2].kind).toBe('dataUrl')
  })

  test('refuses non-images, missing files, none and more than 10', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'logCliPhotos'))
    const text = join(dir, 'note.jpg')
    writeFileSync(text, 'this is text with a .jpg name')
    expect(await preparePhotos([], { dir })).toMatchObject({ ok: false, code: 'noPhotos' })
    expect(await preparePhotos(Array(11).fill(text), { dir })).toMatchObject({ ok: false, code: 'tooManyPhotos' })
    expect(await preparePhotos([text], { dir })).toMatchObject({ ok: false, code: 'notAnImage' })
    expect(await preparePhotos([join(dir, 'gone.jpg')], { dir })).toMatchObject({ ok: false, code: 'unreadablePhoto' })
  })

  test('downloads URLs through the injected fetch', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'logCliPhotos'))
    const png = await samplePng()
    const fetchFn = (async () => new Response(png)) as unknown as typeof fetch
    const result = await preparePhotos(['https://example.test/a.png'], { dir, fetchFn, rng: seeded(5) })
    expect(result).toMatchObject({ ok: true })
  })
})
