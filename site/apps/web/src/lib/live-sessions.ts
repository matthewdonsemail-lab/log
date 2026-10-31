import { z } from 'zod'
import {
  convexClient, convexErrorMessage, sessionsListRef, sessionsRemoveRef, sessionsSaveRef,
} from './convex'
import { keywordsOnConvex } from './live-keywords'
import type { Platform } from './platform'

const platformSchema = z.enum(['facebook', 'x', 'reddit'])
const savedSchema = z.object({ platform: platformSchema, cookieCount: z.number(), expiresAt: z.number().nullable() })
export const liveSessionsSchema = z.object({
  sessions: z.array(z.object({ platform: platformSchema, cookieCount: z.number(), expiresAt: z.number().nullable(), savedAt: z.number() })),
})

export type SavedSession = z.infer<typeof savedSchema>
export type SessionSummary = z.infer<typeof liveSessionsSchema>['sessions'][number]

/** Connected logins live in Convex, so they exist only on the live backend. */
export const sessionsOnConvex = keywordsOnConvex

/** Send a token from the extension. The server checks it and seals it; only a summary comes back. */
export async function saveSession(token: string): Promise<SavedSession> {
  const client = await convexClient()
  let data: unknown
  try { data = await client.mutation(sessionsSaveRef, { token: token.trim() }) } catch (error) {
    throw convexErrorMessage(error, 'Could not connect the account')
  }
  const parsed = savedSchema.safeParse(data)
  if (!parsed.success) throw new Error('Connecting returned an invalid response')
  return parsed.data
}

export async function listSessions(): Promise<SessionSummary[]> {
  const client = await convexClient()
  let data: unknown
  try { data = await client.query(sessionsListRef, {}) } catch (error) {
    throw convexErrorMessage(error, 'Could not load connected accounts')
  }
  const parsed = liveSessionsSchema.safeParse(data)
  if (!parsed.success) throw new Error('Connected accounts returned an invalid response')
  return parsed.data.sessions
}

export async function removeSession(platform: Platform): Promise<void> {
  const client = await convexClient()
  try { await client.mutation(sessionsRemoveRef, { platform }) } catch (error) {
    throw convexErrorMessage(error, 'Could not disconnect the account')
  }
}

export function describeExpiry(expiresAt: number | null, now = Date.now()): string {
  if (expiresAt === null) return 'stays connected until you log out'
  const days = Math.round((expiresAt - now) / 86_400_000)
  if (days < 1) return 'expires today'
  return days === 1 ? 'expires tomorrow' : `expires in ${days} days`
}

/** The platform a token was copied for, read from the token itself, so a mix-up is caught before sending. */
export function tokenPlatform(token: string): Platform | null {
  const text = token.trim()
  if (!text.startsWith('lk1.')) return null
  try {
    const padded = text.slice(4).replace(/-/g, '+').replace(/_/g, '/')
    const body = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '=')), (c) => c.charCodeAt(0)))) as { platform?: unknown }
    return platformSchema.safeParse(body.platform).data ?? null
  } catch {
    return null
  }
}
