import { z } from 'zod'
import {
  convexClient, convexErrorMessage, convexSiteUrl, convexUrl,
  ingestCreateRef, ingestListRef, ingestRevokeRef,
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

export type IngestKey = z.infer<typeof keySchema>
export type CreatedIngestKey = z.infer<typeof createdSchema>

/** Ingest keys live in Convex, so they exist only in live mode with a deployment configured. */
export function ingestAvailable(): boolean {
  return apiMode() === 'live' && convexUrl() !== undefined
}

/** Where platform clients POST batches of posts. */
export function ingestEndpoint(): string | undefined {
  const site = convexSiteUrl()
  return site ? `${site}/ingest` : undefined
}

export async function listIngestKeys(): Promise<IngestKey[]> {
  const client = await convexClient()
  let data: unknown
  try { data = await client.query(ingestListRef, {}) } catch (error) {
    throw convexErrorMessage(error, 'Could not load ingest keys')
  }
  const parsed = z.array(keySchema).safeParse(data)
  if (!parsed.success) throw new Error('Ingest keys returned an invalid response')
  return parsed.data
}

/** The secret is returned once; the caller must show it now and never store it. */
export async function createIngestKey(label: string): Promise<CreatedIngestKey> {
  const trimmed = label.trim()
  if (!trimmed || trimmed.length > 80) throw new Error('Name the key with 1-80 characters')
  const client = await convexClient()
  let data: unknown
  try { data = await client.mutation(ingestCreateRef, { label: trimmed }) } catch (error) {
    throw convexErrorMessage(error, 'Could not create the ingest key')
  }
  const parsed = createdSchema.safeParse(data)
  if (!parsed.success) throw new Error('Ingest key creation returned an invalid response')
  return parsed.data
}

export async function revokeIngestKey(id: string): Promise<void> {
  const client = await convexClient()
  try { await client.mutation(ingestRevokeRef, { id }) } catch (error) {
    throw convexErrorMessage(error, 'Could not revoke the ingest key')
  }
}
