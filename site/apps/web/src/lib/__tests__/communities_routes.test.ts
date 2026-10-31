import { describe, expect, it } from 'vitest'
import { communitiesApp } from '../communities/server'
import type { Community } from '../communities/types'

const HEALTHY_FB_ACCOUNT = 'fb-galway-rubbish'
const FB_ANSWERS = ['Dallas', 'help', 'yes, always']

async function postJoin(id: string, body: Record<string, unknown> = {}) {
  return communitiesApp.request(`/communities/${id}/join`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
}

async function postRoute(id: string, route: string, body: Record<string, unknown> = {}) {
  return communitiesApp.request(`/communities/${id}/${route}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  })
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

describe('facebook join (partial answers accepted and flagged)', () => {
  it('201s a full join with provenance stamped', async () => {
    const joined = await postJoin('facebook-diy-plumbing', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: FB_ANSWERS
    })
    expect(joined.status).toBe(201)
    const community = ((await joined.json()) as { community: Community }).community
    expect(community.joinState).toBe('pending')
    expect(community.answersComplete).toBe(true)
    expect(community.questionsHash).toMatch(/^[0-9a-f]{8}$/)
    expect(community.questionsScrapedAt).not.toBeNull()
    expect(community.notice).toBeNull()
  })

  it('201s a partial join flagged incomplete instead of 400', async () => {
    const joined = await postJoin('facebook-dfw-repairs', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: ['Dallas']
    })
    expect(joined.status).toBe(201)
    const community = ((await joined.json()) as { community: Community }).community
    expect(community.joinState).toBe('pending')
    expect(community.answersComplete).toBe(false)
    expect(community.notice).toMatch(/1 of 3 answers/)
  })

  it('400s a missing account and 200s a rejoin as a no-op', async () => {
    expect((await postJoin('facebook-dallas-renovations', { answers: FB_ANSWERS })).status).toBe(400)
    expect(
      (await postJoin('facebook-diy-plumbing', { accountId: HEALTHY_FB_ACCOUNT, answers: FB_ANSWERS })).status
    ).toBe(200)
  })
})

describe('facebook form webhook lifecycle', () => {
  const form = (phase: string, extra: Record<string, unknown> = {}) =>
    postRoute('facebook-texas-plumbing-pros', 'form', {
      accountId: HEALTHY_FB_ACCOUNT,
      phase,
      ...extra
    })

  it('renders, drafts, abandons, resumes, then submits from the modal', async () => {
    let res = await form('rendered', { questions: ['q1', 'q2'] })
    expect(res.status).toBe(200)
    let row = ((await res.json()) as { community: Community }).community
    expect(row.joinState).toBe('none')
    expect(row.formPhase).toBe('rendered')
    expect(row.entryQuestions).toEqual(['q1', 'q2'])

    res = await form('incomplete', { questions: ['q1', 'q2'], draftAnswers: ['partial', ''] })
    row = ((await res.json()) as { community: Community }).community
    expect(row.formPhase).toBe('incomplete')
    expect(row.draftAnswers).toEqual(['partial', ''])

    res = await form('abandoned', { questions: ['q1', 'q2'], draftAnswers: ['partial', ''] })
    row = ((await res.json()) as { community: Community }).community
    expect(row.formPhase).toBe('abandoned')
    expect(row.notice).toMatch(/paused/)
    expect(row.draftAnswers).toEqual(['partial', ''])

    res = await postRoute('facebook-texas-plumbing-pros', 'resume')
    expect(res.status).toBe(200)
    row = ((await res.json()) as { community: Community }).community
    expect(row.formPhase).toBe('incomplete')

    // join submits from the open modal instead of restarting it
    const joined = await postJoin('facebook-texas-plumbing-pros', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: ['full', 'answers']
    })
    expect(joined.status).toBe(201)
    row = ((await joined.json()) as { community: Community }).community
    expect(row.joinState).toBe('pending')
    expect(row.answersComplete).toBe(true)
    expect(row.formPhase).toBe('idle')
  })

  it('409s the form past the modal and rejects bad phases', async () => {
    // diy-plumbing is pending — the modal is gone
    const pendingForm = await communitiesApp.request('/communities/facebook-diy-plumbing/form', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accountId: HEALTHY_FB_ACCOUNT, phase: 'rendered' })
    })
    expect(pendingForm.status).toBe(409)
    expect(
      (
        await postRoute('facebook-texas-plumbing-pros', 'form', {
          accountId: HEALTHY_FB_ACCOUNT,
          phase: 'bogus'
        })
      ).status
    ).toBe(400)
  })
})

describe('facebook approve / decline / remove / leave', () => {
  it('accepts once, then 409s the double accept', async () => {
    expect((await postRoute('facebook-texas-trades', 'accept')).status).toBe(200)
    expect((await getRow('facebook-texas-trades')).joinState).toBe('accepted')
    expect((await postRoute('facebook-texas-trades', 'accept')).status).toBe(409)
  })

  it('stamps platform removals and gates the rejoin', async () => {
    expect((await postRoute('facebook-texas-trades', 'remove')).status).toBe(200)
    let row = await getRow('facebook-texas-trades')
    expect(row.joinState).toBe('removed')
    expect(row.removedBy).toBe('platform')
    const rejoin = await postJoin('facebook-texas-trades', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: FB_ANSWERS
    })
    expect(rejoin.status).toBe(409)
    expect(((await rejoin.json()) as { error: string }).error).toMatch(/discretion/)
    row = await getRow('facebook-texas-trades')
    expect(row.joinState).toBe('removed')
  })

  it('lets a self-leave rejoin and withdraws pending rows', async () => {
    expect((await deleteCommunity('facebook-dallas-homeowners')).status).toBe(200)
    let row = await getRow('facebook-dallas-homeowners')
    expect(row.joinState).toBe('removed')
    expect(row.removedBy).toBe('user')
    const rejoined = await postJoin('facebook-dallas-homeowners', {
      accountId: HEALTHY_FB_ACCOUNT,
      answers: ['Oak Street', 'homeowner', 'yes']
    })
    expect(rejoined.status).toBe(201)
    expect((await getRow('facebook-dallas-homeowners')).joinState).toBe('pending')

    expect((await deleteCommunity('facebook-dfw-repairs')).status).toBe(200)
    row = await getRow('facebook-dfw-repairs')
    expect(row.joinState).toBe('none')
    expect(row.answers).toEqual(['Dallas'])
  })

  it('400s admin routes on non-facebook rows', async () => {
    expect((await postRoute('reddit-diy', 'accept')).status).toBe(400)
    expect((await postRoute('reddit-plumbing', 'decline')).status).toBe(400)
    expect((await postRoute('reddit-diy', 'remove')).status).toBe(400)
  })
})

describe('reddit observations and gates', () => {
  it('reads restricted subs as limited; member rows no-op the join', async () => {
    const observed = await postRoute('reddit-homerepair', 'observe', { subredditType: 'restricted' })
    expect(observed.status).toBe(200)
    const row = ((await observed.json()) as { community: Community }).community
    expect(row.joinState).toBe('limited')
    expect(row.notice).toMatch(/read-only/)
    expect((await postJoin('reddit-homerepair', {})).status).toBe(200)
    expect((await postRoute('reddit-homerepair', 'request-access')).status).toBe(409)
    expect((await postRoute('reddit-homerepair', 'quarantine-opt-in')).status).toBe(409)
  })

  it('requests private access over modmail and lands the approval', async () => {
    let res = await postRoute('reddit-askaplumber', 'observe', { subredditType: 'private' })
    expect((((await res.json()) as { community: Community }).community).notice).toMatch(/modmail/)
    expect((await getRow('reddit-askaplumber')).joinState).toBe('none')
    expect((await postJoin('reddit-askaplumber', {})).status).toBe(409)
    res = await postRoute('reddit-askaplumber', 'request-access')
    expect(res.status).toBe(200)
    expect(((await res.json()) as { community: Community }).community.notice).toMatch(/waiting on the mods/)
    res = await postRoute('reddit-askaplumber', 'observe', { subredditType: 'public', subscribed: true })
    expect((((await res.json()) as { community: Community }).community).joinState).toBe('accepted')
  })

  it('opts in to quarantine and confirms on observation', async () => {
    let res = await postRoute('reddit-fixit', 'observe', { subredditType: 'quarantined' })
    expect((((await res.json()) as { community: Community }).community).notice).toMatch(/opt in/)
    expect((await getRow('reddit-fixit')).joinState).toBe('limited')
    res = await postRoute('reddit-fixit', 'quarantine-opt-in')
    expect(res.status).toBe(200)
    res = await postRoute('reddit-fixit', 'observe', { subredditType: 'quarantined', subscribed: true })
    expect((((await res.json()) as { community: Community }).community).joinState).toBe('accepted')
  })

  it('tags karma gates with evidence and unsubscribes cleanly', async () => {
    expect((await postJoin('reddit-diy', {})).status).toBe(201)
    const tagged = await postRoute('reddit-diy', 'observe', {
      karmaGated: true,
      karmaEvidence: 't1_abc invisible to alt observer'
    })
    expect(tagged.status).toBe(200)
    expect((((await tagged.json()) as { community: Community }).community).notice).toMatch(/Karma-gated/)
    expect((await deleteCommunity('reddit-diy')).status).toBe(200)
    expect((await getRow('reddit-diy')).joinState).toBe('none')
  })

  it('marks banned subs gone and refuses the rejoin', async () => {
    const res = await postRoute('reddit-homerepair', 'observe', { subredditType: 'banned' })
    expect((((await res.json()) as { community: Community }).community).notice).toMatch(/untrack/)
    expect((await getRow('reddit-homerepair')).joinState).toBe('none')
    const rejoin = await postJoin('reddit-homerepair', {})
    expect(rejoin.status).toBe(409)
    expect(((await rejoin.json()) as { error: string }).error).toMatch(/nothing to act on|gone/)
  })

  it('400s empty observations and no-ops the accepted join', async () => {
    expect((await postRoute('reddit-diy', 'observe', {})).status).toBe(400)
    expect((await postJoin('reddit-plumbing', {})).status).toBe(200)
  })
})

describe('observation walls and restore', () => {
  it('walls dallas-homeowners and restores pending on clear', async () => {
    // dallas is pending after the leave/rejoin test above
    expect((await getRow('facebook-dallas-homeowners')).joinState).toBe('pending')
    await postRoute('facebook-dallas-homeowners', 'observe', { wallType: 'login' })
    expect((await getRow('facebook-dallas-homeowners')).joinState).toBe('login-wall')
    await postRoute('facebook-dallas-homeowners', 'observe', { cleared: true })
    expect((await getRow('facebook-dallas-homeowners')).joinState).toBe('pending')
  })

  it('resolves communities and registers unknown links', async () => {
    const res = await communitiesApp.request('/communities/resolve-reddit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'r/routetest' })
    })
    expect(res.status).toBe(200)
    expect((((await res.json()) as { community: Community }).community).joinState).toBe('accepted')

    const fb = await communitiesApp.request('/communities/resolve', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: 'https://facebook.com/groups/route-test-group' })
    })
    expect(fb.status).toBe(200)
    const resolved = ((await fb.json()) as { community: Community }).community
    expect(resolved.joinState).toBe('none')
    expect(resolved.questionsHash).toMatch(/^[0-9a-f]{8}$/)
  })

  it('dedupes join-by-url on tracked rows', async () => {
    const res = await communitiesApp.request('/communities/join-by-url', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        url: 'https://facebook.com/groups/dallas-homeowners',
        accountId: HEALTHY_FB_ACCOUNT,
        answers: FB_ANSWERS
      })
    })
    expect(res.status).toBe(200)
  })
})
