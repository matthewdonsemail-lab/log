import { Hono } from 'hono'
import { describeRoute } from 'hono-openapi'
import { isRecord, loadPersistedState, savePersistedState } from '../persist'
import { isBrandEntity, migrateBrandEntity } from './types'
import type { BrandChannel, BrandEntity, BrandOffering, BrandPage, ChannelProfile, CommunityPick } from './types'
import { defaultChannels } from './types'
import { resolveSitemap } from './sources'
import { BrandResponseJson, BrandWithSourcesJson, SourcesResponseJson, errorResponse } from '../openapi'
import { requestLogger } from '../request-log'

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
  .use('*', requestLogger())
  .get('/brand', describeRoute({ operationId: 'getBrand', tags: ['Brand'], summary: 'Get brand', description: 'Returns the single workspace BrandEntity or `null` when onboarding was skipped or the brand was cleared. This is the source-of-truth the Brand tab, onboarding reveal, and AI reply drafts all read — polling here is how the dashboard knows whether to show the brand form. No parameters. Code: apps/web/src/lib/brand/server.ts:67', responses: { 200: { description: 'Brand record (or null).', content: { 'application/json': { schema: BrandResponseJson } } } } }), (c) => c.json({ brand }))
  .put('/brand', describeRoute({ operationId: 'upsertBrand', tags: ['Brand'], summary: 'Upsert brand', description: 'Creates the brand if none exists or deep-merges the `Partial<BrandEntity>` patch into the existing record. Merges identity, location, voice (formality/dos/donts/examples), channels per platform (facebook/x/reddit), offerings filtered by `isBrandOffering`, memory.rules, intelligence, and sources by URL. Stamps `updatedAt`, persists to `brand-entity` in localStorage, and validates the merged result with `isBrandEntity` — returns `400 Invalid brand payload` if validation fails. Code: apps/web/src/lib/brand/server.ts:68', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', description: 'Partial<BrandEntity> — unknown fields ignored, offerings filtered, channels merged per platform' } } } }, responses: { 200: { description: 'Saved brand.', content: { 'application/json': { schema: BrandResponseJson } } }, 400: errorResponse('Invalid request body / Invalid brand payload') } }), async (c) => {
    const body = await c.req.json<Partial<BrandEntity>>().catch(() => null)
    if (!body) return c.json({ error: 'Invalid request body' }, 400)
    const base: Omit<BrandEntity, 'updatedAt'> = brand ?? {
      id: 'brand-default',
      identity: { name: '', website: '', tagline: '' },
      location: { label: '', lat: 53.2707, lng: -9.0568, radiusKm: 10 },
      voice: { tone: 'Friendly, plain-spoken local pro', formality: 'professional', dos: [], donts: [], examples: [] },
      offerings: [],
      sources: [],
      channels: defaultChannels(),
      memory: { rules: [] },
      intelligence: { competitors: [], targetCommunities: [] },
      sourceUrl: '',
    }
    const channelPatch = (isRecord(body.channels) ? body.channels : {}) as Partial<Record<BrandChannel, Partial<ChannelProfile>>>
    const mergedChannels = { ...base.channels }
    for (const channel of ['facebook', 'x', 'reddit'] as const) {
      const patch = channelPatch[channel]
      if (patch) mergedChannels[channel] = { ...mergedChannels[channel], ...patch }
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
      channels: mergedChannels,
      memory: {
        rules: Array.isArray(body.memory?.rules)
          ? (body.memory.rules as unknown[]).filter((line): line is string => typeof line === 'string')
          : base.memory.rules,
      },
      intelligence: { ...base.intelligence, ...body.intelligence },
    })
    if (!isBrandEntity(next)) return c.json({ error: 'Invalid brand payload' }, 400)
    brand = next
    persistBrand()
    return c.json({ brand })
  })
  .post('/brand/intelligence', describeRoute({ operationId: 'appendBrandIntelligence', tags: ['Brand'], summary: 'Append brand intelligence', description: 'Appends reveal discoveries to the brand\'s intelligence block. `competitors` are deduped by exact string (trimmed), `targetCommunities` are merged by `id` via `isCommunityPick`, and `selectedKeyword` overwrites if provided. Returns `404 No brand yet` if onboarding hasn\'t created a record yet. Stamps `updatedAt` and persists. Code: apps/web/src/lib/brand/server.ts:113', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { competitors: { type: 'array', items: { type: 'string' }, description: 'Competitor domains to append (deduped).' }, targetCommunities: { type: 'array', items: { type: 'object' }, description: 'CommunityPick[] merged by id.' }, selectedKeyword: { type: 'string', description: 'Keyword chosen in reveal.' } } } } } }, responses: { 200: { description: 'Updated brand.', content: { 'application/json': { schema: BrandResponseJson } } }, 400: errorResponse('Invalid request body'), 404: errorResponse('No brand yet — complete onboarding first') } }), async (c) => {
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
  .get('/brand/sources', describeRoute({ operationId: 'listBrandSources', tags: ['Brand'], summary: 'List brand sources', description: 'Returns the indexed `BrandPage[]` for the brand\'s website — each page has `url`, `title`, `headings`, `text`, `status` (`indexed`/`pending`/`failed`), and `fetchedAt`. Returns an empty array when no brand exists yet (the brand itself is the guard, not the sources). Code: apps/web/src/lib/brand/server.ts:142', responses: { 200: { description: 'Indexed pages.', content: { 'application/json': { schema: SourcesResponseJson } } } } }), (c) => c.json({ sources: brand?.sources ?? [] }))
  .post('/brand/index', describeRoute({ operationId: 'indexBrand', tags: ['Brand'], summary: 'Index brand site', description: 'Mock sitemap indexer. With `{ urls: string[] }` it registers each new URL as a `pending` BrandPage (deduped by URL). Without `urls` (or with `{ sitemap: true }` / empty body) it re-resolves the brand site (`identity.website` or `sourceUrl`) into the deterministic seed pages via `resolveSitemap` and merges them by URL as `indexed`. Always stamps and persists. Returns `404` if no brand exists. Code: apps/web/src/lib/brand/server.ts:143', requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', properties: { urls: { type: 'array', items: { type: 'string' }, description: 'Explicit URLs to register as pending.' }, sitemap: { type: 'boolean', description: 'When true (or no urls), re-resolve the sitemap.' } } } } } }, responses: { 200: { description: 'Indexed pages.', content: { 'application/json': { schema: BrandWithSourcesJson } } }, 404: errorResponse('No brand yet — complete onboarding first') } }), async (c) => {
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
  .delete('/brand/sources', describeRoute({ operationId: 'deleteBrandSource', tags: ['Brand'], summary: 'Delete brand source', description: 'Removes a single indexed page by exact `url` string match. Filters `brand.sources` by URL, stamps `updatedAt`, and persists. Returns `404` if no brand exists — the URL itself is not validated beyond string match (unknown URLs are a no-op that still returns the filtered list). Code: apps/web/src/lib/brand/server.ts:178', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { url: { type: 'string', description: 'Exact URL of the page to remove.' } }, required: ['url'] } } } }, responses: { 200: { description: 'Remaining sources.', content: { 'application/json': { schema: BrandWithSourcesJson } } }, 404: errorResponse('No brand yet — complete onboarding first') } }), async (c) => {
    if (!brand) return c.json({ error: 'No brand yet — complete onboarding first' }, 404)
    const body = await c.req.json<{ url?: unknown }>().catch(() => null)
    const url = typeof body?.url === 'string' ? body.url : ''
    brand = stamp({ ...brand, sources: brand.sources.filter((page) => page.url !== url) })
    persistBrand()
    return c.json({ brand, sources: brand.sources })
  })
  .delete('/brand', describeRoute({ operationId: 'deleteBrand', tags: ['Brand'], summary: 'Delete brand', description: 'Clears the entire workspace brand record — identity, location, voice, offerings, sources, channels, memory, and intelligence are discarded (sets `brand` to `null`). Persists the cleared state so the dashboard returns to the onboarding prompt. Idempotent. Code: apps/web/src/lib/brand/server.ts:186', responses: { 200: { description: 'Cleared (brand is null).', content: { 'application/json': { schema: BrandResponseJson } } } } }), (c) => {
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
