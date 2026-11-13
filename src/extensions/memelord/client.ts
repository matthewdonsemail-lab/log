import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { savedCredential } from '../../auth/credentials/index.ts'
import { MEMELORD_API, MEMELORD_TOOLS } from './types'
import type { MemelordAnswer, MemelordFetch, MemelordTool, MemeSearch, MemeTemplate } from './types'

export function memelordKey(env: Record<string, string | undefined> = process.env, home = homedir()): string | null {
  const saved = savedCredential('MEMELORD_API_KEY', env)
  if (saved) return saved
  if (env.MEMELORD_API_KEY?.trim()) return env.MEMELORD_API_KEY.trim()
  const repo = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
  for (const file of [join(repo, '.env.local'), join(repo, '..', '..', '.env.local'), join(home, '.config', 'listeningkit', 'memelord-api-key.txt')]) {
    if (!existsSync(file)) continue
    const text = readFileSync(file, 'utf8')
    const named = /^\s*MEMELORD_API_KEY\s*=\s*(.*)$/m.exec(text)?.[1]?.trim().replace(/^"|"$/g, '')
    const bare = text.includes('=') ? '' : text.trim()
    if (named || bare) return named || bare
  }
  return null
}

export function toolUrl(tool: MemelordTool, query: Record<string, string | number | undefined> = {}, id?: string): string {
  const path = tool === 'getMemeTemplate' ? `${MEMELORD_TOOLS.getMemeTemplate}${encodeURIComponent(id ?? '')}` : MEMELORD_TOOLS[tool]
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== '') params.set(k, String(v))
  const qs = params.toString()
  return `${MEMELORD_API}${path}${qs ? `?${qs}` : ''}`
}

const MEDIA_KEYS = ['media_url', 'mediaUrl', 'image_url', 'imageUrl', 'video_url', 'videoUrl', 'url', 'preview_url', 'previewUrl', 'thumbnail_url', 'gif_url']
const NAME_KEYS = ['name', 'title', 'template_name', 'slug']
const ID_KEYS = ['id', 'template_id', 'asset_id', 'slug']
const CONTEXT_KEYS = ['context', 'cultural_context', 'description', 'why_trending', 'usage', 'summary']

const firstString = (o: Record<string, unknown>, keys: readonly string[]): string | null => {
  for (const k of keys) {
    const v = o[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
    if (typeof v === 'number') return String(v)
  }
  return null
}

function nestedMedia(o: unknown, depth = 0): string | null {
  if (!o || typeof o !== 'object' || depth > 3) return null
  const rec = o as Record<string, unknown>
  const direct = firstString(rec, MEDIA_KEYS)
  if (direct && /^https:\/\//.test(direct)) return direct
  for (const v of Object.values(rec)) {
    const found = nestedMedia(v, depth + 1)
    if (found) return found
  }
  return null
}

export function templateOf(raw: Record<string, unknown>): MemeTemplate {
  const slots = raw.text_slot_count ?? raw.text_slots ?? raw.textSlots ?? raw.box_count
  return {
    id: firstString(raw, ID_KEYS) ?? '',
    name: firstString(raw, NAME_KEYS) ?? '',
    type: firstString(raw, ['type', 'asset_type', 'media_type']),
    mediaUrl: nestedMedia(raw),
    textSlots: Array.isArray(slots) ? slots.length : typeof slots === 'number' ? slots : null,
    context: firstString(raw, CONTEXT_KEYS),
    raw,
  }
}

export function templatesIn(body: unknown): MemeTemplate[] {
  if (Array.isArray(body)) return body.filter((x): x is Record<string, unknown> => !!x && typeof x === 'object').map(templateOf)
  if (!body || typeof body !== 'object') return []
  const rec = body as Record<string, unknown>
  for (const key of ['results', 'templates', 'memes', 'items', 'data', 'trending', 'assets']) if (Array.isArray(rec[key])) return templatesIn(rec[key])
  return []
}

export function createMemelordClient(key: string | null = memelordKey(), fetcher: MemelordFetch = fetch as unknown as MemelordFetch) {
  async function call<T>(url: string, read: (body: unknown) => T): Promise<MemelordAnswer<T>> {
    if (!key) return { ok: false, status: 0, code: 'memelordKeyMissing', error: 'MEMELORD_API_KEY is not set (.env.local, or ~/.config/listeningkit/memelord-api-key.txt): create one at https://www.memelord.com/settings/developer', data: null }
    const answer = await fetcher(url, { method: 'GET', headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' } })
    const body = (await answer.json().catch(() => null)) as Record<string, unknown> | null
    if (answer.status !== 200 || body?.success === false) return { ok: false, status: answer.status, code: typeof body?.code === 'string' ? body.code : `http${answer.status}`, error: typeof body?.error === 'string' ? body.error : null, data: null }
    return { ok: true, status: answer.status, code: null, error: null, data: read(body) }
  }
  return {
    searchMemes: (search: MemeSearch) => call(toolUrl('searchMemes', { query: search.query, type: search.type, method: search.method, limit: search.limit, offset: search.offset }), templatesIn),
    getMemeTemplate: (id: string) => call(toolUrl('getMemeTemplate', {}, id), (body) => templateOf((((body as Record<string, unknown> | null)?.template ?? body) ?? {}) as Record<string, unknown>)),
    getTrendingMemes: (limit?: number, mediaType?: string) => call(toolUrl('getTrendingMemes', { limit, media_type: mediaType }), templatesIn),
    listImageTools: (category?: string) => call(toolUrl('listImageTools', { category }), (body) => body),
  }
}

export type MemelordClient = ReturnType<typeof createMemelordClient>
