import { describe, expect, test } from 'bun:test'
import { createActor, fromPromise, toPromise } from 'xstate'
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { answeringFixture } from '../../../browser/flow/helpers/answerFixture'
import type { StepExchange } from '../../../subq/stepReading/types'
import { answerWaitOf, checkStep, DEFAULT_SESSION, FACEBOOK_ACTIVITIES, FEED, parseRange, planSession, REEL, warmupActivityMachine } from './index'
import type { ActivityStep, StepReply } from './index'

const REEL_URL = 'https://www.facebook.com/reel/1075919665236018'
const step = (id: string) => REEL.steps.find((s) => s.id === id)!

describe('the reel activity, as its first recording showed it (Bethlehem, 2026-10-20)', () => {
  test('is Facebook\'s, and moves on with Next card, not the wheel (the wheel scrolled the page, the URL stayed)', () => {
    expect(FACEBOOK_ACTIVITIES.reel).toBe(REEL)
    expect(step('swipe')).toMatchObject({ action: 'clickRole', args: ['button', 'Next card'], expect: { urlChanges: true } })
    expect(step('openComments').expect).toEqual({ shows: { role: 'heading', name: 'Comments' } })
    expect(step('closeComments').expect).toEqual({ hides: { role: 'heading', name: 'Comments' } })
    expect(step('like')).toMatchObject({ likes: true, clicks: true })
    expect(REEL.knownIssues.length).toBeGreaterThan(0)
    expect(REEL.steps.slice(0, 3).map((s) => s.id)).toEqual(['openReels', 'unmute', 'watch'])
    expect(step('unmute')).toMatchObject({ action: 'clickRole', args: ['button', 'Unmute'], expect: { hides: { role: 'button', name: 'Unmute' } } })
  })
})

describe('checkStep: did the step do what it should?', () => {
  test('a swipe that left the URL as it was is an issue, saying so', () => {
    expect(checkStep(step('swipe'), REEL_URL, { ok: true, url: REEL_URL })).toMatchObject({ ok: false, issue: `the URL didn't change (still ${REEL_URL})` })
    expect(checkStep(step('swipe'), REEL_URL, { ok: true, url: 'https://www.facebook.com/reel/1049925804499764' }).ok).toBe(true)
  })

  test('the comments heading must show after opening and be gone after closing', () => {
    const open = '- heading "Comments" [level=2] [ref=e725]'
    expect(checkStep(step('openComments'), REEL_URL, { ok: true, url: REEL_URL, snapshot: open }).ok).toBe(true)
    expect(checkStep(step('openComments'), REEL_URL, { ok: true, url: REEL_URL, snapshot: '' }).issue).toBe('no heading "Comments" after it')
    expect(checkStep(step('closeComments'), REEL_URL, { ok: true, url: REEL_URL, snapshot: open }).issue).toBe('heading "Comments" is still there')
  })

  test('back to the reel landing on about:blank (as recorded) is an issue', () => {
    expect(checkStep(step('backToReel'), REEL_URL, { ok: true, url: 'about:blank' }).issue).toContain('not /reel/')
  })

  test("back to the reel goes to the reel's own URL, the one before openProfile, whatever the profile did", async () => {
    const { resolveStep } = await import('./index')
    expect(resolveStep(step('backToReel'), { openProfile: REEL_URL }).args).toEqual([REEL_URL])
  })
})

describe("a like passes on Facebook's answer, not on the button (rule 73)", () => {
  const LIKE_ID = '1635855486666999'
  const react = (status: number, saved: string | null, sent = LIKE_ID): StepExchange => ({ offsetMs: 7240, kind: 'api', name: 'CometUFIFeedbackReactMutation', method: 'POST', host: 'www.facebook.com', path: '/api/graphql/', status, ms: 1024, sent: { variables: { input: { feedback_reaction_id: sent, feedback_source: 'NEWS_FEED' } } }, answer: { data: { feedback_react: { feedback: { reaction_count: { count: 1 }, viewer_feedback_reaction_info: saved === null ? null : { id: saved } } } } }, errors: [], known: true })
  const removeLike = '- button "Remove Like" [active] [ref=e1874]'

  for (const s of [step('like'), FEED.steps.find((x) => x.id === 'likePost')!]) {
    test(`${s.id}: it waits for CometUFIFeedbackReactMutation, and passes only when the answer saves the reaction we sent`, () => {
      expect(answerWaitOf(s)).toEqual({ name: 'CometUFIFeedbackReactMutation', ms: 15_000 })
      expect(checkStep(s, REEL_URL, { ok: true, url: REEL_URL, snapshot: removeLike, exchanges: [react(200, LIKE_ID)] }).ok).toBe(true)
      expect(checkStep(s, REEL_URL, { ok: true, url: REEL_URL, snapshot: removeLike, exchanges: [] }).issue).toBe('Facebook never answered CometUFIFeedbackReactMutation in this step (rule 73: its answer decides, not the screen)')
      expect(checkStep(s, REEL_URL, { ok: true, url: REEL_URL, snapshot: removeLike, exchanges: [react(500, LIKE_ID)] }).issue).toBe('CometUFIFeedbackReactMutation answered 500, never 2xx')
      expect(checkStep(s, REEL_URL, { ok: true, url: REEL_URL, snapshot: removeLike, exchanges: [react(200, null)] }).issue).toBe('CometUFIFeedbackReactMutation answered data.feedback_react.feedback.viewer_feedback_reaction_info.id = nothing, not "1635855486666999" (what we sent as variables.input.feedback_reaction_id)')
      expect(checkStep(s, REEL_URL, { ok: true, url: REEL_URL, snapshot: '', exchanges: [react(200, '1678524932434102', '1678524932434102')] }).ok).toBe(true)
    })
  }

  test("the answer is read from the step's own recording when the reply carries none, and kept as exchanges.json", () => {
    const folder = mkdtempSync(join(tmpdir(), 'likeStep'))
    const har = { log: { entries: [{ startedDateTime: '2026-10-23T05:19:12.000Z', time: 1024, request: { method: 'POST', url: 'https://www.facebook.com/api/graphql/', headers: [{ name: 'sec-fetch-dest', value: 'empty' }, { name: 'sec-fetch-site', value: 'same-origin' }, { name: 'x-fb-friendly-name', value: 'CometUFIFeedbackReactMutation' }], postData: { mimeType: 'application/x-www-form-urlencoded', text: `variables=${encodeURIComponent(JSON.stringify({ input: { feedback_reaction_id: LIKE_ID } }))}` } }, response: { status: 200, content: { mimeType: 'text/html', text: JSON.stringify({ data: { feedback_react: { feedback: { viewer_feedback_reaction_info: { id: LIKE_ID } } } } }) } } }] } }
    writeFileSync(join(folder, 'network.har'), JSON.stringify(har))
    expect(checkStep(step('like'), REEL_URL, { ok: true, url: REEL_URL, folder }).ok).toBe(true)
    expect(existsSync(join(folder, 'exchanges.json'))).toBe(true)
  })
})

describe("the other activity steps read Facebook's answers too (rule 73)", () => {
  const FEED_URL = 'https://www.facebook.com/'
  const composer = (id: string): StepExchange => ({ offsetMs: 1710, kind: 'api', name: 'MAWVerifyThreadCutover_ContactCapabilities2Query', method: 'POST', host: 'www.facebook.com', path: '/api/graphql/', status: 200, ms: 658, sent: {}, answer: { data: { user: { message_capabilities2_str: '252060841644982528', id } } }, errors: [], known: true })
  const openFeed = FEED.steps.find((x) => x.id === 'openFeed')!

  test('the home feed passes only when MAWVerifyThreadCutover_ContactCapabilities2Query answers this account as the one signed in', () => {
    expect(checkStep(openFeed, null, { ok: true, url: FEED_URL, exchanges: [composer('61594063207669')] }, { uid: '61594063207669' }).ok).toBe(true)
    expect(checkStep(openFeed, null, { ok: true, url: FEED_URL, exchanges: [composer('61500000000001')] }, { uid: '61594063207669' }).issue).toBe("MAWVerifyThreadCutover_ContactCapabilities2Query answered data.user.id = \"61500000000001\", not the account's id (61594063207669)")
  })

  test('the steps checked are the ones whose recordings show a call that answers them; dwells and the rest have none to read', () => {
    const checked = (steps: { id: string; expect?: { answers?: unknown[] } }[]) => [...new Set(steps.filter((x) => x.expect?.answers?.length).map((x) => x.id))]
    expect(checked(FEED.steps)).toEqual(['openFeed', 'readFeed', 'likePost', 'openMarketplace', 'openListings'])
    expect(checked(REEL.steps)).toEqual(['openReels', 'like'])
  })
})

describe('skipping as a thumb does (matt, 2026-10-20)', () => {
  test('most reels get a glance and a skip, often several in a row; only watched reels get comments, a profile or a like', () => {
    let glances = 0
    let watched = 0
    let streaks = 0
    for (let seed = 1; seed <= 40; seed++) {
      const steps = planSession({ ...DEFAULT_SESSION, comments: 1, profile: 1, like: 1, likes: true }, seed)
      const byReel = new Map<number, string[]>()
      for (const s of steps) byReel.set(s.reel, [...(byReel.get(s.reel) ?? []), s.step.id])
      let run = 0
      for (const ids of byReel.values()) {
        if (ids.includes('glance')) {
          glances++
          run++
          if (run === 2) streaks++
          expect(ids.filter((id) => !['openReels', 'unmute', 'glance', 'swipe'].includes(id))).toEqual([])
        } else {
          watched++
          run = 0
        }
      }
    }
    expect(glances).toBeGreaterThan(watched)
    expect(streaks).toBeGreaterThan(0)
  })

  test('a glance is 1-3 s', () => {
    for (const s of planSession(DEFAULT_SESSION, 5).filter((s) => s.step.id === 'glance')) expect(Number(s.step.args[0])).toBeLessThanOrEqual(3)
  })
})

describe('planSession, drawn from the activity\'s own steps', () => {
  test('the same seed, the same session; Next card between reels; no like without --likes (rule 8)', () => {
    expect(planSession(DEFAULT_SESSION, 7)).toEqual(planSession(DEFAULT_SESSION, 7))
    const steps = planSession(DEFAULT_SESSION, 4)
    expect(steps.slice(0, 2).map((s) => s.step.id)).toEqual(['openReels', 'unmute'])
    expect(steps.filter((s) => s.step.id === 'unmute')).toHaveLength(1)
    const reels = Math.max(...steps.map((s) => s.reel))
    expect(steps.filter((s) => s.step.id === 'swipe')).toHaveLength(reels - 1)
    expect(planSession({ ...DEFAULT_SESSION, like: 1, likes: false }, 9).some((s) => s.step.id === 'like')).toBe(false)
    expect(planSession({ ...DEFAULT_SESSION, like: 1, likes: true }, 9).some((s) => s.step.id === 'like')).toBe(true)
    expect(parseRange('5-12')).toEqual({ min: 5, max: 12 })
  })
})

function run(steps: ActivityStep[], replies: StepReply[], options: { live?: boolean; likes?: boolean; continueOnIssue?: boolean } = {}) {
  const acted: string[] = []
  const machine = warmupActivityMachine.provide({
    actors: {
      act: fromPromise<StepReply, { account: string; step: ActivityStep }>(async ({ input }) => {
        acted.push(input.step.id)
        const reply = replies.shift() ?? { ok: true, url: REEL_URL }
        return reply.exchanges ? reply : { ...reply, exchanges: answeringFixture(input.step.expect?.answers, { uid: input.account }) }
      })
    }
  })
  const actor = createActor(machine, { input: { account: 'bethlehem', steps, live: options.live ?? true, likes: options.likes ?? false, continueOnIssue: options.continueOnIssue ?? true } })
  actor.start()
  return toPromise(actor).then((output) => ({ output, acted }))
}

describe('warmupActivityMachine', () => {
  test('record: every step taken and outlined, the wheel-like swipe issue listed, the like skipped without --likes', async () => {
    const steps = [step('openReels'), step('swipe'), step('like')]
    const { output, acted } = await run(steps, [{ ok: true, url: REEL_URL }, { ok: true, url: REEL_URL }])
    expect(acted).toEqual(['openReels', 'swipe'])
    expect(output.outcomes.map((o) => [o.id, o.ok, o.skipped ? 'skipped' : o.issue ?? ''])).toEqual([
      ['openReels', true, ''],
      ['swipe', false, `the URL didn't change (still ${REEL_URL})`],
      ['like', true, 'skipped']
    ])
    expect(output).toMatchObject({ ok: false, blocked: null })
  })

  test('run: stops at the first step that did not do what it should', async () => {
    const { acted } = await run([step('openReels'), step('swipe'), step('watch')], [{ ok: true, url: REEL_URL }, { ok: true, url: REEL_URL }], { continueOnIssue: false })
    expect(acted).toEqual(['openReels', 'swipe'])
  })

  test('without --live the clicks are skipped, never taken (rule 8)', async () => {
    const { acted, output } = await run([step('openReels'), step('swipe')], [{ ok: true, url: REEL_URL }], { live: false })
    expect(acted).toEqual(['openReels'])
    expect(output.outcomes[1].skipped).toContain('--live')
  })

  test('a checkpoint stops the activity as the account\'s issue', async () => {
    const { output, acted } = await run([step('openReels'), step('swipe')], [{ ok: true, url: 'https://www.facebook.com/checkpoint/1501092823525282/' }])
    expect(acted).toEqual(['openReels'])
    expect(output.blocked?.code).toBe('checkpointed')
  })
})

describe('the feed: Listaro stage 1 as a warm-up activity', () => {
  test('its steps in Listaro order, each saying what it must achieve; the like only with --likes (rule 8)', () => {
    const feed = FACEBOOK_ACTIVITIES.feed
    expect(feed.steps.map((s) => s.id)).toEqual(['openFeed', 'dismissPrompt', 'settle', 'readFeed', 'nextPost', 'likePost', 'seeMore', 'openComments', 'scrollComments', 'closeComments', 'openMarketplace', 'lookMarketplace', 'scrollMarketplace', 'openListings'])
    expect(feed.steps.find((s) => s.id === 'likePost')).toMatchObject({ likes: true, clicks: true, expect: { answers: [{ call: 'CometUFIFeedbackReactMutation' }] } })
    expect(feed.steps.filter((s) => s.recorded).map((s) => s.id)).toEqual(['openFeed', 'dismissPrompt', 'readFeed', 'nextPost', 'likePost', 'seeMore', 'openComments', 'closeComments', 'openMarketplace', 'scrollMarketplace'])
  })
})
