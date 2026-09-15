import { Hono } from 'hono'
import { isRecord, loadPersistedState, savePersistedState } from '../persist'
import { isBrandEntity, migrateBrandEntity } from './types'
import type { BrandEntity, BrandOffering, BrandPage, CommunityPick } from './types'
import { resolveSitemap } from './sources'

const BRAND_KEY = 'brand-entity'

function isCommunityPick(value: unknown): value is CommunityPick {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.platform === 'string' &&
    typeof value.name === 'string' &&
    typeof value.detail === 'string'
  )
}

function isBrandOffering(value: unknown): value is BrandOffering {
  return isRecord(value) && typeof value.name === 'string' && typeof value.detail === 'string'
}

/**
 * In-memory brand store. Seeds empty (onboarding creates the base record);
 * rehydrates from the same `brand-entity` key the onboarding write path
 * uses — v1 rows migrate on load — and persists on every mutation so the
 * dashboard brand view, the reveal step and the reply drafts all read one
 * record.
 */
const rawStored = loadPersistedState<unknown>(BRAND_KEY, (_value): _value is unknown => true)
let brand: BrandEntity | null = migrateBrandEntity(rawStored)

function persistBrand(): void {
  savePersistedState(BRAND_KEY, brand)
}

// Write migrated v1 rows back so the next load is already v2-clean.
if (brand !== null && rawStored !== null && !isBrandEntity(rawStored)) {
  persistBrand()
}

function stamp(entity: Omit<BrandEntity, 'updatedAt'>): BrandEntity {
  return { ...entity, updatedAt: new Date().toISOString() }
}

export interface BrandIntelligenceInput {
  competitors?: string[]
  targetCommunities?: CommunityPick[]
  selectedKeyword?: string
}

/**
 * Hono-shaped brand API. Mock-backed for now — when the real backend lands,
 * point the client at it; routes and response shapes stay the same.
 *
 * - `GET /brand` → `{ brand }` (null when onboarding was skipped)
 * - `PUT /brand` → upserts identity/location/voice/offerings/sources
 * - `POST /brand/intelligence` → appends reveal discoveries
 *   (competitors deduped, communities merged by id)
 * - `GET /brand/sources` → `{ sources }` (indexed pages)
 * - `POST /brand/index` → resolves the sitemap (or explicit urls) into pages
 * - `DELETE /brand/sources` → removes one page by url
 * - `DELETE /brand` → clears the record
 */
export const brandApp = new Hono()
  .get('/brand', (c) => c.json({ brand }))
  .put('/brand', async (c) => {
    const body = await c.req.json<Partial<BrandEntity>>().catch(() => null)
    if (!body) return c.json({ error: 'Invalid request body' }, 400)
    const base: Omit<BrandEntity, 'updatedAt'> = brand ?? {
      id: 'brand-default',
      identity: { name: '', website: '', tagline: '' },
      location: { label: '', lat: 53.2707, lng: -9.0568, radiusKm: 10 },
      voice: { tone: 'Friendly, plain-spoken local pro', formality: 'professional', dos: [], donts: [], examples: [] },
      offerings: [],
      sources: [],
      intelligence: { competitors: [], targetCommunities: [] },
      sourceUrl: '',
    }
    const next = stamp({
      ...base,
      ...body,
      id: 'brand-default',
      identity: { ...base.identity, ...body.identity },
      location: { ...base.location, ...body.location },
      voice: { ...base.voice, ...body.voice },
      offerings: Array.isArray(body.offerings)
        ? (body.offerings as unknown[]).filter(isBrandOffering)
        : base.offerings,
      sources: Array.isArray(body.sources) ? body.sources : base.sources,
      intelligence: { ...base.intelligence, ...body.intelligence },
    })
    if (!isBrandEntity(next)) return c.json({ error: 'Invalid brand payload' }, 400)
    brand = next
    persistBrand()
    return c.json({ brand })
  })
  .post('/brand/intelligence', async (c) => {
    const body = await c.req.json<BrandIntelligenceInput>().catch(() => null)
    if (!body) return c.json({ error: 'Invalid request body' }, 400)
    if (!brand) return c.json({ error: 'No brand yet — complete onboarding first' }, 404)
    const competitors = [...brand.intelligence.competitors]
    for (const domain of body.competitors ?? []) {
      const clean = domain.trim()
      if (clean && !competitors.includes(clean)) competitors.push(clean)
    }
    const seen = new Set(brand.intelligence.targetCommunities.map((pick) => pick.id))
    const targetCommunities = [...brand.intelligence.targetCommunities]
    for (const pick of body.targetCommunities ?? []) {
      if (isCommunityPick(pick) && !seen.has(pick.id)) {
        seen.add(pick.id)
        targetCommunities.push(pick)
      }
    }
    brand = stamp({
      ...brand,
      intelligence: {
        ...brand.intelligence,
        ...(body.selectedKeyword !== undefined ? { selectedKeyword: body.selectedKeyword } : {}),
        competitors,
        targetCommunities,
      },
    })
    persistBrand()
    return c.json({ brand })
  })
  .get('/brand/sources', (c) => c.json({ sources: brand?.sources ?? [] }))
  .post('/brand/index', async (c) => {
    // Mock sitemap resolution: explicit urls register as pending rows, the
    // `{ sitemap: true }` (or empty) form re-resolves the brand site into
    // the deterministic seed pages, marked indexed. Merge by url — the live
    // indexer swaps this resolution step only.
    if (!brand) return c.json({ error: 'No brand yet — complete onboarding first' }, 404)
    const body = await c.req.json<{ urls?: unknown; sitemap?: unknown }>().catch(() => null)
    const seen = new Set(brand.sources.map((page) => page.url))
    const next: BrandPage[] = [...brand.sources]
    if (body && Array.isArray(body.urls)) {
      for (const url of body.urls) {
        if (typeof url !== 'string' || !url.trim() || seen.has(url.trim())) continue
        seen.add(url.trim())
        next.push({
          url: url.trim(),
          title: url.trim(),
          headings: [],
          text: '',
          status: 'pending',
          fetchedAt: new Date().toISOString(),
        })
      }
    } else {
      const site = brand.identity.website || brand.sourceUrl
      const name = brand.identity.name || 'Your brand'
      for (const page of resolveSitemap(site || 'https://example.com', name)) {
        if (seen.has(page.url)) continue
        seen.add(page.url)
        next.push(page)
      }
    }
    brand = stamp({ ...brand, sources: next })
    persistBrand()
    return c.json({ brand, sources: next })
  })
  .delete('/brand/sources', async (c) => {
    if (!brand) return c.json({ error: 'No brand yet — complete onboarding first' }, 404)
    const body = await c.req.json<{ url?: unknown }>().catch(() => null)
    const url = typeof body?.url === 'string' ? body.url : ''
    brand = stamp({ ...brand, sources: brand.sources.filter((page) => page.url !== url) })
    persistBrand()
    return c.json({ brand, sources: brand.sources })
  })
  .delete('/brand', (c) => {
    brand = null
    persistBrand()
    return c.json({ brand })
  })

export type BrandApp = typeof brandApp

/** Sync read for legacy call sites (onboarding) — same memory as the routes. */
export function getBrandRecord(): BrandEntity | null {
  return brand
}

/** Sync write for legacy call sites — stamps updatedAt and persists. */
export function setBrandRecord(entity: Omit<BrandEntity, 'updatedAt'>): BrandEntity {
  brand = stamp(entity)
  persistBrand()
  return brand
}

/** Sync clear for legacy call sites. */
export function clearBrandRecord(): void {
  brand = null
  persistBrand()
}
