import { communitiesApp } from './server'
import type { Community, CommunitiesResponse, CommunityResponse } from './types'
import type { ConnectionPlatform } from '../connections'

export type { Community, CommunityJoinState } from './types'
export { communitiesApp, type CommunitiesApp } from './server'
export { COMMUNITIES_BASE, SEED_JOINED, COMMUNITY_TOPICS, resolveAccountLabel } from './mock'
export { parseFacebookGroupUrl, parseSubredditName } from './mock'

async function request(path: string, init?: RequestInit): Promise<Response> {
  return communitiesApp.request(path, init)
}

/**
 * All community reads and writes flow through the communities Hono app —
 * the same route surface the platform clients will expose, so swapping the
 * mock for the live backend is a transport change only.
 */

/** List communities, optionally filtered by platform, through `GET /communities`. */
export async function getCommunities(params?: { platform?: ConnectionPlatform }): Promise<Community[]> {
  const query = params?.platform ? `?platform=${params.platform}` : ''
  const res = await request(`/communities${query}`)
  if (!res.ok) throw new Error(`Communities request failed (${res.status})`)
  const body = (await res.json()) as CommunitiesResponse
  return body.communities
}

/**
 * Join a community through `POST /communities/:id/join`. Facebook groups
 * require the connected account that joins them. Declined and self-removed
 * rows re-join through the machine; a suspended joining account or a
 * platform-removed group is refused (409) and surfaces the machine reason.
 */
export async function joinCommunity(id: string, opts?: { accountId?: string }): Promise<Community> {
  const res = await request(`/communities/${id}/join`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(opts ?? {}),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not join the community (${res.status})`)
  }
  const body = (await res.json()) as { community: Community }
  return body.community
}

/**
 * Join a Facebook group by pasted URL through `POST /communities/join-by-url`.
 * The API resolves the link to a tracked community (registering it from the
 * slug when unseen) and sends the join request through the given account —
 * this is the form → client handoff, so the sheet only ever passes a URL.
 * Entry-question answers ride along in the same payload.
 */
export async function joinCommunityByUrl(
  url: string,
  opts?: { accountId?: string; answers?: string[] }
): Promise<CommunityResponse> {
  const res = await request('/communities/join-by-url', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url, ...(opts ?? {}) }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not join the group (${res.status})`)
  }
  return (await res.json()) as CommunityResponse
}

/**
 * Resolve a pasted group link into its community through
 * `POST /communities/resolve` — no join state changes, so the form can
 * read the entry questions before the user answers and joins.
 */
export async function resolveCommunityByUrl(url: string): Promise<Community> {
  const res = await request('/communities/resolve', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not resolve the group (${res.status})`)
  }
  return ((await res.json()) as { community: Community }).community
}

/**
 * Resolve a typed subreddit through `POST /communities/resolve-reddit` —
 * unknown names register and join immediately (subreddits don't gate), so
 * the returned community is always usable as a keyword scope.
 */
export async function resolveRedditCommunity(name: string): Promise<Community> {
  const res = await request('/communities/resolve-reddit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not resolve the subreddit (${res.status})`)
  }
  return ((await res.json()) as { community: Community }).community
}

/**
 * Mock admin accept through `POST /communities/:id/accept` — the platform
 * side of the machine. `pending` (and `limited`, when the group opens full
 * membership) move to `accepted`; anything else 409s with the machine reason.
 * Stands in for the live client reporting the group's approval.
 */
export async function acceptCommunity(id: string): Promise<Community> {
  const res = await request(`/communities/${id}/accept`, { method: 'POST' })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not accept the join request (${res.status})`)
  }
  const body = (await res.json()) as { community: Community }
  return body.community
}

/**
 * Mock admin decline through `POST /communities/:id/decline` — the group
 * rejects a pending request. The row keeps its answers so the edit +
 * re-ask path starts from what the admin actually saw.
 */
export async function declineCommunity(id: string): Promise<Community> {
  const res = await request(`/communities/${id}/decline`, { method: 'POST' })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not decline the join request (${res.status})`)
  }
  const body = (await res.json()) as { community: Community }
  return body.community
}

/**
 * Mock platform removal through `POST /communities/:id/remove` — the group
 * kicks its member (`accepted`/`limited` → `removed`, stamped
 * `removedBy: "platform"`). This is what the poller will observe against a
 * real account; the user cannot rejoin such a row at will (the machine
 * gates it on the group's discretion).
 */
export async function removeCommunityMember(id: string): Promise<Community> {
  const res = await request(`/communities/${id}/remove`, { method: 'POST' })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not remove the member (${res.status})`)
  }
  const body = (await res.json()) as { community: Community }
  return body.community
}

/**
 * User-initiated exit through `DELETE /communities/:id`, machines as source
 * "user": `pending` withdraws to `none` (account + answers kept),
 * `accepted`/`limited` become `removed` stamped `removedBy: "user"` (a
 * self-leave — rejoins freely). Already-exited rows are a no-op; rows the
 * poller last saw as login-wall / unclassified refuse the move (409) until
 * the next clean observation.
 */
export async function leaveCommunity(id: string): Promise<Community[]> {
  const res = await request(`/communities/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not leave the community (${res.status})`)
  }
  const body = (await res.json()) as CommunitiesResponse
  return body.communities
}

/**
 * Camoufox client webhook through `POST /communities/:id/form` (platform
 * source): the browser intercepted the Facebook entry-question modal and
 * reports its phase. The row stays `none` until submit; drafts survive
 * abandon for resume. Facebook rows only.
 */
export async function reportCommunityForm(
  id: string,
  payload: {
    accountId: string
    phase: 'rendered' | 'incomplete' | 'abandoned'
    questions?: string[]
    questionsHash?: string
    draftAnswers?: string[]
  }
): Promise<Community> {
  const res = await request(`/communities/${id}/form`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not report the form (${res.status})`)
  }
  return ((await res.json()) as { community: Community }).community
}

/**
 * Resume an abandoned Facebook entry form through `POST /communities/:id/resume`
 * — the modal reopens with the preserved drafts. Facebook rows only.
 */
export async function resumeCommunityForm(id: string): Promise<Community> {
  const res = await request(`/communities/${id}/resume`, { method: 'POST' })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not resume the form (${res.status})`)
  }
  return ((await res.json()) as { community: Community }).community
}

export interface CommunityObservation {
  subredditType?: string
  subscribed?: boolean
  contributor?: boolean
  quarantineOptIn?: boolean
  karmaGated?: boolean
  karmaEvidence?: string
  wallType?: 'login' | 'challenge' | 'unclassified'
  cleared?: boolean
}

/**
 * Poller observation webhook through `POST /communities/:id/observe`
 * (platform source): report what the client actually saw — subscription
 * metadata, karma gates, walls, or a cleared wall. Observations always
 * land; the poller reports regardless of session health.
 */
export async function observeCommunity(id: string, observation: CommunityObservation): Promise<Community> {
  const res = await request(`/communities/${id}/observe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(observation)
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not record the observation (${res.status})`)
  }
  return ((await res.json()) as { community: Community }).community
}

/**
 * Dispatch a modmail access request for a private-gated subreddit through
 * `POST /communities/:id/request-access`. Records the request; the approval
 * arrives later through the observe webhook. Reddit rows only.
 */
export async function requestCommunityAccess(id: string): Promise<Community> {
  const res = await request(`/communities/${id}/request-access`, { method: 'POST' })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not request access (${res.status})`)
  }
  return ((await res.json()) as { community: Community }).community
}

/**
 * Opt in to a quarantined subreddit through
 * `POST /communities/:id/quarantine-opt-in` — records the intent; the
 * unlocked read stream is confirmed when the poller observes the
 * subscription. Reddit rows only.
 */
export async function optInCommunityQuarantine(id: string): Promise<Community> {
  const res = await request(`/communities/${id}/quarantine-opt-in`, { method: 'POST' })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Could not opt in (${res.status})`)
  }
  return ((await res.json()) as { community: Community }).community
}