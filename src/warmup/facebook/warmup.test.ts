import { describe, expect, test } from 'bun:test'
import { createActor, fromPromise, toPromise } from 'xstate'
import { checkStep, DEFAULT_SESSION, FACEBOOK_ACTIVITIES, parseRange, planSession, REEL, warmupActivityMachine } from './index'
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
    // The sound goes on before anything is watched (matt: you can't watch a video with the audio off).
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
          // a glanced reel gets nothing else
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
        return replies.shift() ?? { ok: true, url: REEL_URL }
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
    expect(feed.steps.map((s) => s.id)).toEqual(['openFeed', 'settle', 'readFeed', 'nextPost', 'likePost', 'openMarketplace', 'lookMarketplace', 'scrollMarketplace', 'openListings'])
    expect(feed.steps.find((s) => s.id === 'likePost')).toMatchObject({ likes: true, clicks: true, expect: { shows: { role: 'button', name: 'Remove Like' } } })
    expect(feed.steps.filter((s) => s.recorded).map((s) => s.id)).toEqual(['openFeed', 'readFeed', 'nextPost', 'likePost', 'openMarketplace', 'scrollMarketplace'])
  })
})
