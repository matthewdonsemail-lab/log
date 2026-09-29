import { API_ROUTES, checkAccess } from './scopes'
import type { ApiKey } from './types'

export interface ApiActivityEvent {
  id: string
  keyId: string
  ts: string
  method: string
  path: string
  allowed: boolean
  /** Denial reason when blocked, null when the call went through. */
  reason: string | null
}

// Deterministic PRNG (mulberry32) off a string hash — the same key always
// replays the same activity, so refreshes read stable.
function hashSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Mocked scope-activity firehose for one key: sampled route calls across
 * the registry, each replayed through the same `checkAccess` the live gate
 * uses — so allowed rows show what the key actually does and denied rows
 * show exactly which scope dimension stopped it. Mostly the key's own
 * account/groups (allowed), sometimes foreign ones (denied) for contrast.
 * Newest first.
 */
export function apiActivityFor(key: ApiKey, count = 60): ApiActivityEvent[] {
  const rand = mulberry32(hashSeed(key.id || 'fallback'))
  const liveRoutes = API_ROUTES.filter((route) => !route.planned)
  const ownAccount = key.scopes.accountId ?? 'fb-galway-rubbish'
  const ownCommunities = key.scopes.communityIds.length > 0 ? key.scopes.communityIds : ['facebook-dallas-homeowners']

  const events: ApiActivityEvent[] = Array.from({ length: count }, (_, index) => {
    const route = liveRoutes[Math.floor(rand() * liveRoutes.length)]
    // Foreign ids ~30% of the time so denies appear in the stream.
    const accountId = rand() < 0.7 ? ownAccount : 'fb-unknown-account'
    const communityId = rand() < 0.7 ? ownCommunities[Math.floor(rand() * ownCommunities.length)] : 'community-unknown'
    const reason = checkAccess(key.scopes, route.needs, { accountId, communityId })
    return {
      id: `${key.id.slice(0, 8)}-act-${String(index).padStart(4, '0')}`,
      keyId: key.id,
      ts: new Date(Date.now() - Math.floor(rand() * 14 * 24 * 60 * 60 * 1000)).toISOString(),
      method: route.method,
      path: route.path,
      allowed: reason === null,
      reason,
    }
  }).sort((a, b) => (a.ts < b.ts ? 1 : -1))

  return events
}
