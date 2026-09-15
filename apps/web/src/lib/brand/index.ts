import { isRecord, loadPersistedState, savePersistedState } from '../persist'
import type { BrandEntity, BrandPage, KeywordStrategyMapping } from './types'
import { brandApp, clearBrandRecord, getBrandRecord, setBrandRecord } from './server'
import { defaultChannels } from './types'
import { seedSourcesFor } from './sources'
import type { BrandIntelligenceInput } from './server'

export type {
  AiFollowUpAction,
  AiQuery,
  BrandChannel,
  BrandEntity,
  BrandFormality,
  BrandIdentity,
  BrandIntelligence,
  BrandLocation,
  BrandMemory,
  BrandOffering,
  BrandPage,
  BrandPageStatus,
  BrandSourceRef,
  BrandVoice,
  BrandVoiceExample,
  ChannelProfile,
  ChannelStyle,
  CommunityPick,
  KeywordStrategyMapping,
  KeywordTargetEntry,
  SearchStrategyEntry,
} from './types'
export { defaultChannels } from './types'
export { brandApp, type BrandApp } from './server'
export type { BrandIntelligenceInput } from './server'
export {
  PROMPT_VERSION,
  buildBrandSystemPrompt,
  buildReplyContext,
  retrieveSourceRefs,
  simulateOutbound
} from './prompt'
export { resolveSitemap, seedSourcesFor } from './sources'

/**
 * Read the brand entity; null when skipped or never set. One key, one
 * record — the legacy 'brand-profile' rows are intentionally not carried
 * over (the old mount effect wiped that key on every onboarding visit, so
 * nothing durable ever lived there). Reads the same memory the Hono
 * routes serve, so onboarding writes show up in the dashboard instantly.
 */
export function getBrand(): BrandEntity | null {
  return getBrandRecord()
}

/** Persist the brand entity (stamps updatedAt). */
export function saveBrand(entity: Omit<BrandEntity, 'updatedAt'>): BrandEntity {
  return setBrandRecord(entity)
}

/** Forget the brand entity (user reset it — nothing calls this on mount). */
export function clearBrand(): void {
  clearBrandRecord()
}

/** Fetch the brand through `GET /brand` (the route the dashboard uses). */
export async function getBrandAsync(): Promise<BrandEntity | null> {
  const res = await brandApp.request('/brand')
  if (!res.ok) throw new Error(`Brand request failed (${res.status})`)
  const body = (await res.json()) as { brand: BrandEntity | null }
  return body.brand
}

/** Upsert identity/location/voice/offerings through `PUT /brand`. */
export async function saveBrandAsync(patch: Partial<BrandEntity>): Promise<BrandEntity> {
  const res = await brandApp.request('/brand', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not save the brand (${res.status})`)
  }
  const parsed = (await res.json()) as { brand: BrandEntity }
  return parsed.brand
}

/** Append reveal discoveries through `POST /brand/intelligence`. */
export async function appendBrandIntelligenceAsync(input: BrandIntelligenceInput): Promise<BrandEntity> {
  const res = await brandApp.request('/brand/intelligence', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not save brand intelligence (${res.status})`)
  }
  const parsed = (await res.json()) as { brand: BrandEntity }
  return parsed.brand
}

/** Clear the brand through `DELETE /brand`. */
export async function clearBrandAsync(): Promise<void> {
  const res = await brandApp.request('/brand', { method: 'DELETE' })
  if (!res.ok) throw new Error(`Could not clear the brand (${res.status})`)
}

/** List indexed pages through `GET /brand/sources`. */
export async function getSourcesAsync(): Promise<BrandPage[]> {
  const res = await brandApp.request('/brand/sources')
  if (!res.ok) throw new Error(`Sources request failed (${res.status})`)
  const body = (await res.json()) as { sources: BrandPage[] }
  return body.sources
}

/** Run the sitemap index through `POST /brand/index`. */
export async function indexBrandAsync(input?: { urls?: string[]; sitemap?: boolean }): Promise<BrandEntity> {
  const res = await brandApp.request('/brand/index', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input ?? { sitemap: true }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not index the brand site (${res.status})`)
  }
  const parsed = (await res.json()) as { brand: BrandEntity }
  return parsed.brand
}

/** Remove one indexed page through `DELETE /brand/sources`. */
export async function removeSourceAsync(url: string): Promise<BrandEntity> {
  const res = await brandApp.request('/brand/sources', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not remove the source (${res.status})`)
  }
  const parsed = (await res.json()) as { brand: BrandEntity }
  return parsed.brand
}

const MAPPING_KEY = 'keyword-strategy-mapping'

function isPage(value: unknown): value is { title: string; href: string } {
  return isRecord(value) && typeof value.title === 'string' && typeof value.href === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isKeywordStrategyMapping(value: unknown): value is KeywordStrategyMapping {
  if (!isRecord(value) || !Array.isArray(value.targets) || !Array.isArray(value.strategies)) return false
  if (typeof value.savedAt !== 'string') return false
  if (value.selectedPhrase !== undefined && typeof value.selectedPhrase !== 'string') return false
  for (const target of value.targets) {
    if (!isRecord(target) || typeof target.phrase !== 'string' || typeof target.intent !== 'string') return false
    if (!Array.isArray(target.pages) || !target.pages.every(isPage)) return false
  }
  for (const strategy of value.strategies) {
    if (!isRecord(strategy) || typeof strategy.id !== 'string' || typeof strategy.title !== 'string') return false
    if (typeof strategy.category !== 'string' || typeof strategy.dork !== 'string') return false
  }
  if (value.groups !== undefined) {
    if (!Array.isArray(value.groups)) return false
    for (const group of value.groups) {
      if (!isRecord(group) || typeof group.id !== 'string' || typeof group.platform !== 'string') return false
      if (typeof group.name !== 'string' || typeof group.detail !== 'string') return false
    }
  }
  if (value.interested !== undefined && !isStringArray(value.interested)) return false
  return true
}

/** Read the saved keyword + search-strategy mapping; null when never saved. */
export function getKeywordMapping(): KeywordStrategyMapping | null {
  return loadPersistedState(MAPPING_KEY, isKeywordStrategyMapping)
}

/** Persist the keyword + search-strategy mapping for the rest of the workflow. */
export function saveKeywordMapping(
  mapping: Omit<KeywordStrategyMapping, 'savedAt'>
): KeywordStrategyMapping {
  const next: KeywordStrategyMapping = { ...mapping, savedAt: new Date().toISOString() }
  savePersistedState(MAPPING_KEY, next)
  return next
}

/** Fill a strategy dork template with the keyword and brand site. */
export function fillDork(template: string, keyword: string, site: string): string {
  return template.split('{keyword}').join(keyword).split('{site}').join(site)
}

function humanizeHost(host: string): string {
  const cleaned = host
    .replace(/^www\./, '')
    .split('.')
    .slice(0, -1)
    .join(' ')
  return cleaned
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Mock brand extraction from a website URL: normalizes the URL, derives a
 * display name from the hostname, and seeds a base BrandEntity — voice gets
 * the house default, location the Galway default, sources the deterministic
 * seed pages, intelligence empty for the reveal to fill in. Offerings come
 * back empty — inventing services would be fake data, so the follow-up
 * drafts fall back to generic phrasing until real ones are added. Throws a
 * human-readable error for unparseable input.
 */
export function extractBrandFromUrl(input: string): Omit<BrandEntity, 'updatedAt'> {
  const trimmed = input.trim()
  if (!trimmed) throw new Error('Paste your website URL first.')
  const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let url: URL
  try {
    url = new URL(normalized)
  } catch {
    throw new Error('That URL does not parse — check it and try again.')
  }
  if (!url.hostname.includes('.')) throw new Error('That URL needs a domain, e.g. acmeplumbing.com.')
  const name = humanizeHost(url.hostname) || url.hostname
  const website = url.origin + (url.pathname === '/' ? '' : url.pathname)
  return {
    id: 'brand-default',
    identity: {
      name,
      website,
      tagline: `${name} — heard across social`,
    },
    location: { label: '', lat: 53.2707, lng: -9.0568, radiusKm: 10 },
    offerings: [],
    voice: {
      tone: 'Friendly, plain-spoken local pro',
      formality: 'professional',
      dos: [],
      donts: [],
      examples: [],
    },
    sources: seedSourcesFor(website, name),
    channels: defaultChannels(),
    memory: { rules: [] },
    intelligence: { competitors: [], targetCommunities: [] },
    sourceUrl: url.href,
  }
}
