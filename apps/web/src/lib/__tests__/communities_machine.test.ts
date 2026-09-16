import { describe, expect, it } from 'vitest'
import { communityActions, communityAllowedTransition } from '../communities/machine'
import { communitiesApp } from '../communities/server'
import type { Community } from '../communities/types'

const HEALTHY_FB_ACCOUNT = 'fb-galway-rubbish'
const FB_ANSWERS = ['answer one', 'answer two', 'answer three']

async function postJoin(id: string, body: Record<string, unknown> = {}) {
  return communitiesApp.request(`/communities/${id}/join`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
}

async function postRoute(id: string, route: 'accept' | 'decline' | 'remove') {
  return communitiesApp.request(`/communities/${id}/${route}`, { method: 'POST' })
}

async function deleteCommunity(id: string) {
  return communitiesApp.request(`/communities/${id}`, { method: 'DELETE' })
}

async function getRow(id: string): Promise<Community> {
  const res = await communitiesApp.request('/communities')
  const body = (await res.json()) as { communities: Community[] }
  const row = body.communities.find((community) => community.id === id)
  if (!row) throw new Error(`community ${id} not found`)
  return row
}

describe('communityAllowedTransition (pure)', () => {
  it('lets the user join, withdraw, leave, and re-ask', () => {
    expect(communityAllowedTransition('none', 'pending', 'user').allowed).toBe(true)
    expect(communityAllowedTransition('none', 'accepted', 'user').allowed).toBe(true)
    expect(communityAllowedTransition('pending', 'none', 'user').allowed).toBe(true)
    expect(communityAllowedTransition('accepted', 'removed', 'user').allowed).toBe(true)
    expect(communityAllowedTransition('limited', 'removed', 'user').allowed).toBe(true)
    expect(communityAllowedTransition('declined', 'pending', 'user').allowed).toBe(true)
    expect(communityAllowedTransition('removed', 'pending', 'user', { removedBy: 'user' }).allowed).toBe(true)
    // no provenance on record reads as a self-leave (legacy rows)
    expect(communityAllowedTransition('removed', 'accepted', 'user', {}).allowed).toBe(true)
  })

  it('gates the rejoin on who removed the member', () => {
    const refused = communityAllowedTransition('removed', 'pending', 'user', { removedBy: 'platform' })
    expect(refused.allowed).toBe(false)
    expect(refused.reason).toMatch(/discretion/i)
    expect(
      communityAllowedTransition('removed', 'accepted', 'user', { removedBy: 'platform' }).allowed
    ).toBe(false)
    // the platform observing the rejoin land is a platform move
    expect(
      communityAllowedTransition('removed', 'accepted', 'platform', { removedBy: 'platform' }).allowed
    ).toBe(true)
  })

  it('keeps admin moves platform-side', () => {
    expect(communityAllowedTransition('pending', 'accepted', 'platform').allowed).toBe(true)
    expect(communityAllowedTransition('pending', 'declined', 'platform').allowed).toBe(true)
    expect(communityAllowedTransition('limited', 'accepted', 'platform').allowed).toBe(true)
    expect(communityAllowedTransition('accepted', 'removed', 'platform').allowed).toBe(true)
    // the user can never self-approve, self-decline, or self-remove-as-admin
    expect(communityAllowedTransition('pending', 'accepted', 'user').allowed).toBe(false)
    expect(communityAllowedTransition('pending', 'declined', 'user').allowed).toBe(false)
    // a pending request is declined, never removed as a member
    expect(communityAllowedTransition('pending', 'removed', 'platform').allowed).toBe(false)
  })

  it('refuses all user writes under a suspended or limited account', () => {
    expect(
      communityAllowedTransition('none', 'pending', 'user', { accountIssue: 'suspended' }).allowed
    ).toBe(false)
    expect(
      communityAllowedTransition('accepted', 'removed', 'user', { accountIssue: 'read_only_limited' })
        .allowed
    ).toBe(false)
    // a checkpointed account is transient — its writes still go through
    expect(
      communityAllowedTransition('none', 'pending', 'user', { accountIssue: 'checkpointed' }).allowed
    ).toBe(true)
    // the poller keeps observing regardless of account state
    expect(
      communityAllowedTransition('accepted', 'removed', 'platform', { accountIssue: 'suspended' })
        .allowed
    ).toBe(true)
  })

  it('treats login-wall / unknown as platform-only observation states', () => {
    expect(communityAllowedTransition('accepted', 'login-wall', 'platform').allowed).toBe(true)
    expect(communityAllowedTransition('login-wall', 'accepted', 'platform').allowed).toBe(true)
    expect(communityAllowedTransition('login-wall', 'pending', 'user').allowed).toBe(false)
    expect(communityAllowedTransition('unknown', 'removed', 'user').allowed).toBe(false)
    // no same-state no-ops
    expect(communityAllowedTransition('pending', 'pending', 'user').allowed).toBe(false)
    expect(communityAllowedTransition('pending', 'pending', 'user').reason).toMatch(/already/i)
  })
})

describe('communityActions (UI gating)', () => {
  it('offers the same set the store will accept', () => {
    expect(communityActions('none')).toEqual({ join: true, withdraw: false, leave: false, observedOnly: false })
    expect(communityActions('pending')).toEqual({ join: false, withdraw: true, leave: false, observedOnly: false })
    expect(communityActions('accepted')).toEqual({ join: false, withdraw: false, leave: true, observedOnly: false })
    expect(communityActions('limited')).toEqual({ join: false, withdraw: false, leave: true, observedOnly: false })
    expect(communityActions('declined')).toEqual({ join: true, withdraw: false, leave: false, observedOnly: false })
    expect(communityActions('removed', { removedBy: 'user' })).toEqual({
      join: true, withdraw: false, leave: false, observedOnly: false
    })
    expect(communityActions('removed', { removedBy: 'platform' })).toEqual({
      join: false, withdraw: false, leave: false, observedOnly: false
    })
    expect(communityActions('login-wall')).toEqual({
      join: false, withdraw: false, leave: false, observedOnly: true
    })
    expect(communityActions('accepted', { accountIssue: 'suspended' })).toEqual({
      join: false, withdraw: false, leave: false, observedOnly: false
    })
  })
})

describe('POST /communities/:id/join (store enforcement)', () => {
  it('400s bad answers, 201s the join, 200s the rejoin as a no-op', async () => {
    const short = await postJoin('facebook-diy-plumbing', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: ['only', 'two']
    })
    expect(short.status).toBe(400)

    const joined = await postJoin('facebook-diy-plumbing', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: FB_ANSWERS
    })
    expect(joined.status).toBe(201)
    expect(((await joined.json()) as { community: Community }).community.joinState).toBe('pending')

    const again = await postJoin('facebook-diy-plumbing', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: FB_ANSWERS
    })
    expect(again.status).toBe(200)
  })

  it('declines a pending request, keeps the answers, and re-asks from them', async () => {
    const declined = await postRoute('facebook-diy-plumbing', 'decline')
    expect(declined.status).toBe(200)
    let row = (await declined.json()) as { community: Community }
    expect(row.community.joinState).toBe('declined')
    expect(row.community.answers).toEqual(FB_ANSWERS)

    // declining a declined row is a refused no-op, not a 400
    expect((await postRoute('facebook-diy-plumbing', 'decline')).status).toBe(409)

    const reasked = await postJoin('facebook-diy-plumbing', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: FB_ANSWERS
    })
    expect(reasked.status).toBe(201)
    row = (await reasked.json()) as { community: Community }
    expect(row.community.joinState).toBe('pending')
  })

  it('withdraws a pending request back to none and keeps the prefill', async () => {
    const withdrawn = await deleteCommunity('facebook-diy-plumbing')
    expect(withdrawn.status).toBe(200)
    const row = await getRow('facebook-diy-plumbing')
    expect(row.joinState).toBe('none')
    expect(row.answers).toEqual(FB_ANSWERS)
  })

  it('400s removing a member that was never accepted', async () => {
    const joined = await postJoin('facebook-diy-plumbing', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: FB_ANSWERS
    })
    expect(joined.status).toBe(201)
    // a pending request is declined, never removed as a member — the route
    // guards "not a member" with a 400 before the machine runs (the
    // pending → removed refusal itself is covered in the pure tests above)
    const removed = await postRoute('facebook-diy-plumbing', 'remove')
    expect(removed.status).toBe(400)
    const withdrawn = await deleteCommunity('facebook-diy-plumbing')
    expect(withdrawn.status).toBe(200)
    expect((await getRow('facebook-diy-plumbing')).joinState).toBe('none')
  })
})

describe('accept / remove / leave (provenance + rejoin gate)', () => {
  it('accepts a pending request and 409s accepting it twice', async () => {
    const accepted = await postRoute('facebook-texas-trades', 'accept')
    expect(accepted.status).toBe(200)
    expect(((await accepted.json()) as { community: Community }).community.joinState).toBe('accepted')
    expect((await postRoute('facebook-texas-trades', 'accept')).status).toBe(409)
  })

  it('stamps a platform removal and gates the rejoin on the group', async () => {
    const removed = await postRoute('facebook-texas-trades', 'remove')
    expect(removed.status).toBe(200)
    const body = (await removed.json()) as { community: Community }
    expect(body.community.joinState).toBe('removed')
    expect(body.community.removedBy).toBe('platform')

    const rejoin = await postJoin('facebook-texas-trades', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: FB_ANSWERS
    })
    expect(rejoin.status).toBe(409)
    expect(((await rejoin.json()) as { error: string }).error).toMatch(/discretion/i)
    // the refused write rolls back — the row still reads removed-by-platform
    const row = await getRow('facebook-texas-trades')
    expect(row.joinState).toBe('removed')
    expect(row.removedBy).toBe('platform')
  })

  it('lets a self-leave rejoin freely', async () => {
    const left = await deleteCommunity('facebook-dallas-homeowners')
    expect(left.status).toBe(200)
    let row = await getRow('facebook-dallas-homeowners')
    expect(row.joinState).toBe('removed')
    expect(row.removedBy).toBe('user')

    const rejoined = await postJoin('facebook-dallas-homeowners', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: ['live on Oak Street', 'homeowner', 'yes, always']
    })
    expect(rejoined.status).toBe(201)
    row = await getRow('facebook-dallas-homeowners')
    expect(row.joinState).toBe('pending')
    expect(row.removedBy).toBeUndefined()
  })

  it('joins and leaves reddit rows without an account', async () => {
    const joined = await postJoin('reddit-diy', {})
    expect(joined.status).toBe(201)
    expect(((await joined.json()) as { community: Community }).community.joinState).toBe('accepted')

    const left = await deleteCommunity('reddit-diy')
    expect(left.status).toBe(200)
    expect((await getRow('reddit-diy')).removedBy).toBe('user')

    const rejoined = await postJoin('reddit-diy', {})
    expect(rejoined.status).toBe(201)
    expect((await getRow('reddit-diy')).joinState).toBe('accepted')
  })

  it('no-ops joining an already-accepted row', async () => {
    expect((await postJoin('reddit-plumbing', {})).status).toBe(200)
  })
})
