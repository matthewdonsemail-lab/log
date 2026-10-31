import { z } from 'zod'
import { convexClient, convexErrorMessage, webhooksCreateRef, webhooksRemoveRef, webhooksTestRef, webhooksUpdateRef } from './convex'

const platformSchema = z.enum(['reddit', 'x', 'facebook'])

export const webhookSchema = z.object({
  id: z.string(),
  url: z.string(),
  minScore: z.number(),
  platforms: z.array(platformSchema),
  active: z.boolean(),
  failureStreak: z.number(),
  disabledReason: z.string().nullable(),
  lastDeliveryAt: z.number().nullable(),
  createdAt: z.number(),
})
export const webhookListSchema = z.object({ limit: z.number(), webhooks: z.array(webhookSchema) })
export const deliveriesSchema = z.array(z.object({
  id: z.string(),
  event: z.enum(['match.created', 'ping']),
  status: z.enum(['pending', 'delivered', 'failed']),
  attempts: z.number(),
  statusCode: z.number().nullable(),
  error: z.string().nullable(),
  at: z.number(),
}))
const createdSchema = z.object({ webhook: webhookSchema, secret: z.string() })
const outcomeSchema = z.object({ delivered: z.boolean(), statusCode: z.number().optional(), error: z.string().optional() })

export type Webhook = z.infer<typeof webhookSchema>
export type Delivery = z.infer<typeof deliveriesSchema>[number]
export type CreatedWebhook = z.infer<typeof createdSchema>
export type TestOutcome = z.infer<typeof outcomeSchema>

/** What a person picks when adding one. */
export const MIN_SCORE_CHOICES = [
  { value: 50, label: 'Maybe (50 and up)' },
  { value: 70, label: 'Strong (70 and up)' },
  { value: 80, label: 'Very strong (80 and up)' },
  { value: 90, label: 'Only the best (90 and up)' },
]

/** True when this plan allows webhooks at all: none on Free, which is why the panel shows the Pro notice. */
export function webhooksAllowed(limit: number): boolean {
  return limit > 0
}

/** One line for a delivery log row. */
export function describeDelivery(entry: Delivery): string {
  const kind = entry.event === 'ping' ? 'Test' : 'Match'
  if (entry.status === 'delivered') return `${kind} delivered${entry.statusCode ? ` (HTTP ${entry.statusCode})` : ''}`
  if (entry.status === 'pending') return `${kind} waiting to retry (try ${entry.attempts})`
  return `${kind} failed after ${entry.attempts} ${entry.attempts === 1 ? 'try' : 'tries'}${entry.error ? `: ${entry.error}` : ''}`
}

/** The status line under a webhook's address. */
export function describeWebhook(hook: Webhook): string {
  if (!hook.active) return hook.disabledReason ?? 'Switched off'
  const platforms = hook.platforms.length === 0 ? 'every platform' : hook.platforms.join(', ')
  return `Sends matches scored ${hook.minScore} and up from ${platforms}`
}

async function run<T>(schema: z.ZodType<T>, fallback: string, call: (client: Awaited<ReturnType<typeof convexClient>>) => Promise<unknown>): Promise<T> {
  const client = await convexClient()
  let data: unknown
  try { data = await call(client) } catch (error) { throw convexErrorMessage(error, fallback) }
  const parsed = schema.safeParse(data)
  if (!parsed.success) throw new Error('Webhooks returned an invalid response')
  return parsed.data
}

/** The secret comes back once; the caller shows it now and never stores it. */
export async function createWebhook(input: { url: string; minScore: number; platforms: string[] }): Promise<CreatedWebhook> {
  return await run(createdSchema, 'Could not create the webhook', client => client.mutation(webhooksCreateRef, {
    url: input.url.trim(), minScore: input.minScore, ...(input.platforms.length ? { platforms: input.platforms } : {}),
  }))
}

export async function setWebhookActive(id: string, active: boolean): Promise<Webhook> {
  return await run(webhookSchema, 'Could not update the webhook', client => client.mutation(webhooksUpdateRef, { id, active }))
}

export async function removeWebhook(id: string): Promise<void> {
  await run(z.object({ id: z.string(), deleted: z.literal(true) }), 'Could not remove the webhook', client => client.mutation(webhooksRemoveRef, { id }))
}

export async function testWebhook(id: string): Promise<TestOutcome> {
  return await run(outcomeSchema, 'Could not send the test', client => client.action(webhooksTestRef, { id }))
}
