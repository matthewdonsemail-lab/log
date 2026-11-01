import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const web = fileURLToPath(new URL('../../../', import.meta.url))
const landing = join(web, 'src/landing')
const pub = join(web, 'public')

const sources = readdirSync(landing).filter((f) => /\.(tsx?|css)$/.test(f)).map((f) => ({ f, text: readFileSync(join(landing, f), 'utf8') }))

/** Every public/ path the landing source writes out in full, e.g. '/images/x.webp'. */
function literalPaths(): { f: string; path: string }[] {
  const out: { f: string; path: string }[] = []
  for (const { f, text } of sources) {
    for (const m of text.matchAll(/['"`(](\/(?:images|logos|video|fonts)\/[^'"`)\s${}<>]+\.(?:png|webp|jpe?g|svg|gif|webm|mp4|woff2?|json))['"`)]/g)) out.push({ f, path: m[1] })
  }
  return out
}

/** The ears are listed by bare name ('ear3.webp') and joined to /images/ears/ when drawn. */
function earPaths(): { f: string; path: string }[] {
  const out: { f: string; path: string }[] = []
  for (const { f, text } of sources) {
    if (!text.includes('/images/ears/${')) continue
    for (const m of text.matchAll(/['"](ear\d+\.(?:png|webp))['"]/g)) out.push({ f, path: `/images/ears/${m[1]}` })
  }
  return out
}

describe('landing page assets', () => {
  it('every image, logo, video and font the landing source names exists in public/', () => {
    const missing = [...literalPaths(), ...earPaths()].filter(({ path }) => !existsSync(join(pub, path))).map(({ f, path }) => `${f}: ${path}`)
    expect(missing).toEqual([])
  })

  it('the numbered use-case videos exist (their names are built in a template, so list them here)', () => {
    for (const n of [1, 2, 3, 4]) expect(existsSync(join(pub, `video/usecase/${n}.webm`)), `video/usecase/${n}.webm`).toBe(true)
  })

  it('no PNG the landing page loads is large (use WebP: the page downloaded 26 MB before)', () => {
    const big = [...literalPaths(), ...earPaths()]
      .filter(({ path }) => /\.png$/i.test(path) && existsSync(join(pub, path)) && statSync(join(pub, path)).size > 300 * 1024)
      .map(({ f, path }) => `${f}: ${path} (${Math.round(statSync(join(pub, path)).size / 1024)} KB)`)
    expect(big).toEqual([])
  })
})
