import { z } from 'zod'
import {
  apiKeysCreateRef, apiKeysListRef, apiKeysRevokeRef, convexClient, convexErrorMessage, convexSiteUrl, convexUrl,
} from './convex'
import { apiMode } from './transport'

const keySchema = z.object({
  id: z.string(),
  label: z.string(),
  prefix: z.string(),
  createdAt: z.number().finite(),
  lastUsedAt: z.number().finite().nullable(),
})
const createdSchema = z.object({ id: z.string(), secret: z.string(), prefix: z.string() })

export type ApiKeyRow = z.infer<typeof keySchema>
export type CreatedApiKey = z.infer<typeof createdSchema>

/** Real API keys live in Convex, so they exist only in live mode with a deployment configured. */
export function apiKeysAvailable(): boolean {
  return apiMode() === 'live' && convexUrl() !== undefined
}

/** The address of the public API on this deployment. */
export function apiBaseUrl(): string | undefined {
  const site = convexSiteUrl()
  return site ? `${site}/api/v1` : undefined
}

export async function listApiKeys(): Promise<ApiKeyRow[]> {
  const client = await convexClient()
  let data: unknown
  try { data = await client.query(apiKeysListRef, {}) } catch (error) {
    throw convexErrorMessage(error, 'Could not load API keys')
  }
  const parsed = z.array(keySchema).safeParse(data)
  if (!parsed.success) throw new Error('API keys returned an invalid response')
  return parsed.data
}

/** The secret is returned once; the caller must show it now and never store it. */
export async function createApiKey(label: string): Promise<CreatedApiKey> {
  const trimmed = label.trim()
  if (!trimmed || trimmed.length > 80) throw new Error('Name the key with 1-80 characters')
  const client = await convexClient()
  let data: unknown
  try { data = await client.mutation(apiKeysCreateRef, { label: trimmed }) } catch (error) {
    throw convexErrorMessage(error, 'Could not create the API key')
  }
  const parsed = createdSchema.safeParse(data)
  if (!parsed.success) throw new Error('API key creation returned an invalid response')
  return parsed.data
}

export async function revokeApiKey(id: string): Promise<void> {
  const client = await convexClient()
  try { await client.mutation(apiKeysRevokeRef, { id }) } catch (error) {
    throw convexErrorMessage(error, 'Could not revoke the API key')
  }
}

/** The one-line example shown next to a fresh key. */
export function exampleCurl(base: string, secret: string): string {
  return [`curl "${base}/matches?limit=5&min_score=70" \\`, `  -H "Authorization: Bearer ${secret}"`].join('\n')
}

/** What the reference table on the API page lists. Kept here so the page and its test read the same thing. */
export const API_ENDPOINTS: { path: string; what: string; params: string }[] = [
  { path: 'GET /me', what: 'Your plan, its limits and how much of it you use.', params: 'none' },
  { path: 'GET /keywords', what: 'Your phrases, with match counts and when each was last checked.', params: 'none' },
  {
    path: 'GET /matches',
    what: 'Your matches, newest first, with the post and its score.',
    params: 'limit (1-100, default 25), platform (reddit, x, facebook), min_score (0-100), before (the nextCursor of the previous page)',
  },
]

export const RATE_LIMIT_TEXT = '60 requests per minute per key. Past that you get 429 and a Retry-After header.'
