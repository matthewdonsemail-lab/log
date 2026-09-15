import { isRecord, loadPersistedState, savePersistedState } from '../persist'
import type { BrandEntity, KeywordStrategyMapping } from './types'

export type {
  AiFollowUpAction,
  AiQuery,
  BrandEntity,
  BrandIdentity,
  BrandIntelligence,
  BrandLocation,
  BrandVoice,
  CommunityPick,
  KeywordStrategyMapping,
  KeywordTargetEntry,
  SearchStrategyEntry,
} from './types'

const STORAGE_KEY = 'brand-entity'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isBrandEntity(value: unknown): value is BrandEntity {
  if (!isRecord(value)) return false
  const { id, identity, location, voice, offerings, intelligence, sourceUrl, updatedAt } = value
  if (typeof id !== 'string') return false
  if (!isRecord(identity) || typeof identity.name !== 'string' || typeof identity.website !== 'string') return false
  if (typeof identity.tagline !== 'string') return false
  if (
    !isRecord(location) ||
    typeof location.label !== 'string' ||
    typeof location.lat !== 'number' ||
    typeof location.lng !== 'number' ||
    typeof location.radiusKm !== 'number'
  )
    return false
  if (!isStringArray(offerings)) return false
  if (!isRecord(voice) || typeof voice.tone !== 'string' || !isStringArray(voice.serviceAreas)) return false
  if (!isRecord(intelligence) || !isStringArray(intelligence.competitors)) return false
  if (
    intelligence.selectedKeyword !== undefined &&
    typeof intelligence.selectedKeyword !== 'string'
  )
    return false
  if (!Array.isArray(intelligence.targetCommunities)) return false
  return typeof sourceUrl === 'string' && typeof updatedAt === 'string'
}

/**
 * Read the brand entity; null when skipped or never set. One key, one
 * record — the legacy 'brand-profile' rows are intentionally not carried
 * over (the old mount effect wiped that key on every onboarding visit, so
 * nothing durable ever lived there).
 */
export function getBrand(): BrandEntity | null {
  return loadPersistedState(STORAGE_KEY, isBrandEntity)
}

/** Persist the brand entity (stamps updatedAt). */
export function saveBrand(entity: Omit<BrandEntity, 'updatedAt'>): BrandEntity {
  const next: BrandEntity = { ...entity, updatedAt: new Date().toISOString() }
  savePersistedState(STORAGE_KEY, next)
  return next
}

/** Forget the brand entity (user reset it — nothing calls this on mount). */
export function clearBrand(): void {
  savePersistedState(STORAGE_KEY, null)
}

const MAPPING_KEY = 'keyword-strategy-mapping'

function isPage(value: unknown): value is { title: string; href: string } {
  return isRecord(value) && typeof value.title === 'string' && typeof value.href === 'string'
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
 * the house default, location the Galway default, intelligence empty for the
 * reveal to fill in. Offerings come back empty — inventing services would
 * be fake data, so the follow-up drafts fall back to generic phrasing until
 * real ones are added. Throws a human-readable error for unparseable input.
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
  return {
    id: 'brand-default',
    identity: {
      name,
      website: url.origin + (url.pathname === '/' ? '' : url.pathname),
      tagline: `${name} — heard across social`,
    },
    location: { label: '', lat: 53.2707, lng: -9.0568, radiusKm: 10 },
    offerings: [],
    voice: {
      tone: 'Friendly, plain-spoken local pro',
      serviceAreas: [],
    },
    intelligence: { competitors: [], targetCommunities: [] },
    sourceUrl: url.href,
  }
}
