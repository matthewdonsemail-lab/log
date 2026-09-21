import { z } from 'zod'
import { brandExtractRef, convexClient, convexErrorMessage } from './convex'
import type { BrandEntity } from './brand'
import { keywordsOnConvex } from './live-keywords'

/** Reading a website is done by the backend (Firecrawl), so it exists only on the live backend. */
export const brandOnConvex = keywordsOnConvex

export const websiteFactsSchema = z.object({
  name: z.string(),
  tagline: z.string(),
  offerings: z.array(z.object({ name: z.string(), detail: z.string() })),
  tone: z.string().optional(),
  formality: z.enum(['casual', 'professional', 'formal']).optional(),
  locationLabel: z.string().optional(),
  logoUrl: z.string().optional(),
  sourceUrl: z.string(),
})

export type WebsiteFacts = z.infer<typeof websiteFactsSchema>

/** Ask the backend to read the person's own website. Throws a plain-words error. */
export async function readWebsite(url: string): Promise<WebsiteFacts> {
  const client = await convexClient()
  let data: unknown
  try { data = await client.action(brandExtractRef, { url: url.trim() }) } catch (error) {
    throw convexErrorMessage(error, 'Could not read that website')
  }
  const parsed = websiteFactsSchema.safeParse(data)
  if (!parsed.success) throw new Error('Reading the website returned an invalid response')
  return parsed.data
}

/** True when the backend says website reading is not switched on, so the caller can fall back instead of failing. */
export function readingIsOff(error: unknown): boolean {
  return error instanceof Error && error.message.includes('not switched on')
}

/**
 * Lay what the website actually said over the starting brand. Only fields the site provided replace the
 * defaults; nothing is invented, so a thin page leaves the rest as it was.
 */
export function applyWebsiteFacts(base: Omit<BrandEntity, 'updatedAt'>, facts: WebsiteFacts): Omit<BrandEntity, 'updatedAt'> {
  const website = (() => { try { return new URL(facts.sourceUrl).origin } catch { return base.identity.website } })()
  return {
    ...base,
    identity: {
      ...base.identity,
      name: facts.name,
      website,
      tagline: facts.tagline || base.identity.tagline,
      ...(facts.logoUrl ? { logoUrl: facts.logoUrl } : {}),
    },
    location: facts.locationLabel ? { ...base.location, label: facts.locationLabel } : base.location,
    voice: {
      ...base.voice,
      ...(facts.tone ? { tone: facts.tone } : {}),
      ...(facts.formality ? { formality: facts.formality } : {}),
    },
    offerings: facts.offerings.length > 0 ? facts.offerings : base.offerings,
    sourceUrl: facts.sourceUrl,
  }
}
