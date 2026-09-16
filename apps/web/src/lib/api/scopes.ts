import { verifyApiKey } from './server'
import type { ApiKey, ApiKeyScope } from './types'

/**
 * What one platform route demands of a key. Each flag maps to one scope
 * dimension from `ApiKeyScope` — a route only checks the dimensions it
 * names, so adding a route here is what keeps the key model in line with
 * the routes as they're built.
 */
export interface ApiRouteNeeds {
  /** Route touches one account — the key must cover it. */
  account?: boolean
  /** Route touches one community — the key must cover it. */
  community?: boolean
  /** Route sends outbound messages — the key needs the send bit. */
  send?: boolean
  /** Route reads messages/signals back — the key needs the receive bit. */
  receive?: boolean
  /** Route mutates marketplace listings — the key needs the listing bit. */
  listing?: boolean
}

export interface ApiRouteDef {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  needs: ApiRouteNeeds
  /**
   * No server route implements this yet — the scope bit exists ahead of
   * the route so keys minted today already carry the right permission when
   * the route lands.
   */
  planned?: boolean
}

/**
 * The platform route surface an API key may call, and what each route
 * demands. api-keys management itself stays dashboard-only and is
 * deliberately absent — keys never mint or revoke keys.
 */
export const API_ROUTES: ApiRouteDef[] = [
  { method: 'GET', path: '/accounts', needs: { account: true } },
  { method: 'POST', path: '/accounts', needs: { account: true } },
  { method: 'PATCH', path: '/accounts/:accountId', needs: { account: true } },
  { method: 'DELETE', path: '/accounts/:accountId', needs: { account: true } },
  { method: 'GET', path: '/communities', needs: { community: true } },
  { method: 'POST', path: '/communities/:id/join', needs: { account: true, community: true } },
  { method: 'POST', path: '/communities/join-by-url', needs: { account: true, community: true } },
  { method: 'POST', path: '/communities/resolve', needs: { community: true } },
  { method: 'POST', path: '/communities/resolve-reddit', needs: { community: true } },
  { method: 'POST', path: '/communities/:id/accept', needs: { community: true } },
  { method: 'DELETE', path: '/communities/:id', needs: { community: true } },
  {
    method: 'POST',
    path: '/communities/:id/submit-answers',
    needs: { account: true, community: true },
    // No server route implements this yet — POST /join already carries
    // SUBMIT today (open/abandoned modal rows submit from it). Keys minted
    // now carry the permission for when the dedicated route lands.
    planned: true,
  },
  { method: 'GET', path: '/keywords', needs: { community: true } },
  { method: 'POST', path: '/keywords', needs: { community: true } },
  { method: 'PATCH', path: '/keywords/:id', needs: { community: true } },
  { method: 'DELETE', path: '/keywords/:id', needs: { community: true } },
  { method: 'GET', path: '/listings', needs: { account: true } },
  { method: 'POST', path: '/listings', needs: { account: true, listing: true } },
  { method: 'PATCH', path: '/listings/:id', needs: { account: true, listing: true } },
  { method: 'PATCH', path: '/listings/:id/status', needs: { account: true, listing: true } },
  { method: 'GET', path: '/listings/:id/status', needs: { account: true } },
  { method: 'DELETE', path: '/listings/:id', needs: { account: true, listing: true } },
  { method: 'GET', path: '/feed', needs: { receive: true } },
  { method: 'GET', path: '/feed/:platform', needs: { receive: true } },
  { method: 'GET', path: '/threads', needs: { account: true, receive: true } },
  { method: 'POST', path: '/threads', needs: { account: true, send: true } },
  { method: 'GET', path: '/threads/:threadId/messages', needs: { account: true, receive: true } },
  { method: 'POST', path: '/threads/:threadId/messages', needs: { account: true, send: true } },
  { method: 'POST', path: '/threads/:threadId/ack', needs: { account: true, receive: true } },
]

export interface ApiAccessContext {
  accountId?: string
  communityId?: string
}

export type ApiAccessResult = { ok: true; key: ApiKey } | { ok: false; reason: string }

/**
 * Pure scope check — no I/O, so the activity feed can replay it over
 * recorded calls. Returns the denial reason, or null when allowed.
 */
export function checkAccess(
  scopes: ApiKeyScope,
  needs: ApiRouteNeeds,
  ctx: ApiAccessContext = {}
): string | null {
  if (needs.account && scopes.accountId !== null && scopes.accountId !== ctx.accountId) {
    return 'This key is not scoped to that account.'
  }
  if (
    needs.community &&
    (ctx.communityId === undefined || (scopes.communityIds.length > 0 && !scopes.communityIds.includes(ctx.communityId)))
  ) {
    return 'This key is not scoped to that community.'
  }
  if (needs.send && !scopes.canSendMessages) {
    return 'This key cannot send messages.'
  }
  if (needs.receive && !scopes.canReceiveMessages) {
    return 'This key cannot receive messages.'
  }
  if (needs.listing && !scopes.canPublishListings) {
    return 'This key cannot publish or modify marketplace listings.'
  }
  return null
}

/**
 * Gate a presented secret against one route's needs. Returns the key (and
 * stamps its last use) or the first failing reason. Route handlers consult
 * this before touching their stores — see API_ROUTES for the mapping.
 */
export async function authorizeApiKey(
  secret: string,
  needs: ApiRouteNeeds,
  ctx: ApiAccessContext = {}
): Promise<ApiAccessResult> {
  const key = await verifyApiKey(secret)
  if (!key) return { ok: false, reason: 'Unknown or revoked API key.' }
  const denial = checkAccess(key.scopes, needs, ctx)
  return denial ? { ok: false, reason: denial } : { ok: true, key }
}
