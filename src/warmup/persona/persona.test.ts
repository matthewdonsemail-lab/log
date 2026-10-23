import { describe, expect, test } from 'bun:test'
import { answeringFixture } from '../../browser/flow/helpers/answerFixture'
import { createActor, fromPromise, toPromise } from 'xstate'
import { FEED, feedPersonaMachine, planPost, stepsForPost, postReadRequest, planReel, playAt, readReelRead, realPlay, REEL, REEL_LABELS, reelCaption, reelPersonaMachine, reelReadRequest, segmentWeight, stepsForPlan } from '../../facebook/warmup/activities/index'
import type { ActivityStep, AllowedActions, FeedLabel, ReelLabel, ReelPlan, ReelRead, StepReply } from '../../facebook/warmup/activities/index'
import { buildViewers, describeViewer, measureInterestEffect, viewersForSpeed, watchBands, watchRatio } from '../viewer/index'
import type { InterestEffect, KuaiRow, ReelViewer } from '../viewer/index'
import { buildPersonaPack, drawPersona, parseTable, segmentOf } from './index'
import type { DatasetFiles, PackDatasets, PersonaPack } from './index'

const files: DatasetFiles = {
  doomscrolling: [
    { respondent_id: 'D1', country: 'United States', primary_platform: 'Facebook', age: '31', gender: 'Female', occupation_category: 'Student', primary_motivation: 'Boredom/Habit', time_of_day_most_used: 'Evening', daily_scroll_sessions_count: '9', avg_session_length_minutes: '14', doomscrolling_frequency: 'Often' },
    { respondent_id: 'D2', country: 'India', primary_platform: 'Facebook', age: '40', gender: 'Male', occupation_category: 'Unemployed', primary_motivation: 'News & Current Events', time_of_day_most_used: 'Morning', daily_scroll_sessions_count: '2', avg_session_length_minutes: '5', doomscrolling_frequency: 'Rarely' }
  ],
  socialBehaviour: [
    { user_id: 'U1', country: 'USA', primary_platform: 'Instagram', preferred_content_type: 'Memes', primary_purpose: 'Entertainment', scroll_speed: 'Fast', likes_given_per_day: '30', comments_per_day: '2', mood_while_scrolling: 'Bored' },
    { user_id: 'U2', country: 'UK', primary_platform: 'LinkedIn', preferred_content_type: 'News', primary_purpose: 'Networking', scroll_speed: 'Slow', likes_given_per_day: '6', comments_per_day: '0', mood_while_scrolling: 'Neutral' }
  ],
  shortFormMemory: [
    { folder_id: '201', interrupt: 'tiktok', ENGAGE: '4', BSMARS: '18.0' },
    { folder_id: '101', interrupt: 'rest', ENGAGE: '5', BSMARS: '15.0' }
  ]
}

describe('drawPersona: a behaviour profile from the three datasets matt named (rule 50)', () => {
  test("the account's country and a Facebook or Instagram user where the data has them; a TikTok participant from DaRUS", () => {
    const persona = drawPersona(files, 'US', 1)
    expect(persona.rows.map((r) => r.source)).toEqual(['doomscrolling D1', 'socialBehaviour U1', 'shortFormMemory 201'])
    expect(persona.summary).toMatchObject({ age: '31', preferredContent: 'Memes', scrollSpeed: 'Fast', shortFormEngagement: '4' })
  })

  test('the same seed, the same persona', () => {
    expect(drawPersona(files, 'US', 9)).toEqual(drawPersona(files, 'US', 9))
  })

  test('tables read with their quoted fields whole', () => {
    expect(parseTable('a,b\n"x, y",2\n', ',')).toEqual([{ a: 'x, y', b: '2' }])
  })
})

const row = (i: number, at: number): KuaiRow => ({ userId: 7, timeMs: at, tab: 1, playMs: 500 + i * 1000, durationMs: 20_000, commentMs: i === 3 ? 6000 : 0, profileMs: 0, liked: i === 6 ? 1 : 0 })
const sessionRows = (start: number) => {
  const rows: KuaiRow[] = []
  let at = start
  for (let i = 0; i < 10; i++) {
    rows.push(row(i, at))
    at += 500 + i * 1000 + 2000
  }
  return rows
}
const viewer: ReelViewer = buildViewers([...sessionRows(0), ...sessionRows(10_000_000), ...sessionRows(20_000_000)], 'kuaiRand1k')[0]

describe('the real viewer, from KuaiRand-1K (rule 50)', () => {
  test("a user's plays in the swipe feed, cut into sessions where the next play didn't follow on", () => {
    expect(viewer.source).toBe('kuaiRand1k 7')
    expect(viewer.sessions).toHaveLength(3)
    expect(viewer.sessions[0].map((w) => w[0])).toEqual([500, 1500, 2500, 3500, 4500, 5500, 6500, 7500, 8500, 9500])
    expect(viewer.stats).toMatchObject({ swipes: 30, sessions: 3, under1s: 0.1, under2s: 0.2, commentRate: 0.1, commentMs: 6000, likeRate: 0.1, sessionSwipes: 10 })
  })

  test('other feeds and plays of 0 ms are left out; too few sessions, no viewer', () => {
    expect(buildViewers([{ ...row(0, 0), tab: 0 }], 'kuaiRand1k')).toEqual([])
    expect(buildViewers(sessionRows(0), 'kuaiRand1k')).toEqual([])
  })

  test("the persona's scroll speed picks from the quickest, middle or slowest third of viewers", () => {
    const at = (median: number, n: number): ReelViewer => ({ ...viewer, source: `v${n}`, stats: { ...viewer.stats, swipes: 200, playMs: [0, 0, median, 0, 0] } })
    const pool = [at(9000, 1), at(1000, 2), at(5000, 3)]
    expect(viewersForSpeed(pool, 'Fast').map((v) => v.source)).toEqual(['v2'])
    expect(viewersForSpeed(pool, 'Slow').map((v) => v.source)).toEqual(['v1'])
    expect(viewersForSpeed(pool, undefined)).toHaveLength(3)
  })

  test("SubQ's context: their numbers and one real session, swipe by swipe; the watch bands are their own fifths", () => {
    const text = describeViewer(viewer, 0)
    expect(text).toContain('half by 5.5 s')
    expect(text).toContain('3.5 s (comments 6.0 s), 4.5 s, 5.5 s, 6.5 s (liked)')
    const bands = watchBands(viewer)
    expect(bands).toHaveLength(5)
    expect(bands[0].plays).toEqual([500, 500, 500, 1500, 1500, 1500])
    expect(bands[0].label).toContain('Swipe straight past it (0.5 s-1.5 s')
  })
})

const steps: Record<string, ActivityStep> = {}
for (const step of REEL.steps) steps[step.id] ??= step

const allowAll: AllowedActions = { comments: true, profile: true, like: true }

const packData: PackDatasets = {
  brainRot: [{ participant_id: 'ROT-1', age: '30', gender: 'Female', primary_platform: 'Instagram Reels', sustained_attention_span_sec: '40', attention_retention_pct: '55', swipes_per_minute: '6', scroll_sessions_day: '8' }],
  global2026: [{ user_id: 'G1', age: '31', gender: 'Female', country: 'United States', primary_platform: 'Facebook', likes_per_day: '40', comments_per_day: '6', engagement_rate_pct: '4', ad_click_frequency: 'Weekly', weekly_sessions: '30', preferred_content_type: 'Meme' }],
  adEngagement: [
    { user_id: 'A1', age: '30', gender: '0', impressions: '100', clicks: '50', previous_interaction_score: '0.5' },
    { user_id: 'A2', age: '60', gender: '1', impressions: '100', clicks: '50', previous_interaction_score: '0.5' }
  ],
  fbConversions: [{ ad_id: 'F1', age: '30-34', gender: 'F', Impressions: '10000', Clicks: '2' }],
  customerPersonality: [{ ID: 'C1', Year_Birth: '1984', NumWebVisitsMonth: '6', NumWebPurchases: '3' }],
  instagramComments: ['unde at dolorem', 'quae ea ducimus est'],
  movieLens: [{ id: '7', age: 31, gender: 'F', occupation: 'writer' }, { id: '8', age: 60, gender: 'M', occupation: 'retired' }],
  kuaiRandPureCommentMs: [4000, 6000, 8000]
}

describe('the persona pack: every dataset gives a trait, said in provenance', () => {
  const persona = drawPersona(files, 'US', 1)
  const pack = buildPersonaPack(persona, viewer, packData)
  test('traits from the real viewer, the synthetic sets and the real ones; the demographic shell from MovieLens', () => {
    expect(pack.traits).toMatchObject({ ageBand: '30-34', gender: 'F', occupation: 'writer', attentionCapS: 40, completionP: 0.55, skipP: 0.2, likeCooldownReels: 3 })
    expect(pack.traits.commentMs).toBe(6000)
    expect(pack.interests).toEqual(['memes'])
    expect(pack.traits.likeP).toBeGreaterThan(0)
    expect(pack.provenance.join(' ')).toContain('movieLens100k 7 (real)')
    expect(pack.provenance.join(' ')).toContain('brainRot ROT-1 (synthetic)')
  })

  test('the same persona, viewer and data, the same pack; small enough for one SubQ call', () => {
    expect(buildPersonaPack(persona, viewer, packData)).toEqual(pack)
    expect(JSON.stringify(pack).length).toBeLessThan(2000)
  })

  test('the segment from the traits', () => {
    expect(segmentOf({ skipP: 0.5, likeP: 0.01, commentP: 0, profileP: 0.01 })).toBe('skipper')
    expect(segmentOf({ skipP: 0.1, likeP: 0.1, commentP: 0.05, profileP: 0 })).toBe('social')
    expect(segmentOf({ skipP: 0.1, likeP: 0.01, commentP: 0, profileP: 0.1 })).toBe('commerce')
    expect(segmentOf({ skipP: 0.1, likeP: 0.01, commentP: 0, profileP: 0.01 })).toBe('lurker')
  })
})

const basePack = (over: Partial<PersonaPack['traits']> = {}, segment: PersonaPack['segment'] = 'social'): PersonaPack => ({
  personaId: 'p',
  segment,
  interests: ['memes', 'entertainment'],
  traits: { ageBand: '30-34', gender: 'F', occupation: 'writer', attentionCapS: 60, completionP: 0.5, skipP: 0.3, likeP: 0.3, commentP: 0.3, profileP: 0.05, commentMs: 6000, profileMs: 6000, sessionReels: 10, adSkipP: 1, likeCooldownReels: 3, ...over },
  provenance: []
})

const effect: InterestEffect = { watchIn: [1.1, 1.23, 1.4, 1.67], watchOut: [0.99, 0.97, 0.94, 0.9], likeIn: 1.28, likeOut: 0.95, commentIn: 1.4, commentOut: 0.93, skipIn: 0.4, skipOut: 0.49, plays: { in: 1, out: 1 }, source: 'test' }
const read = (interest: number, pick: ReelRead['pick'] = 'none'): ReelRead => ({ label: 'memes', labelConfidence: 0.9, interest, pick, pickProbabilities: {}, inputTokens: 500 })

describe('the interest effect, measured on real viewers', () => {
  test("each user's top categories from their feed; random plays in them against outside them", () => {
    const play = (user: string, video: string, playMs: number, liked = false) => ({ user, video, playMs, durationMs: 10_000, liked, commented: false })
    const tags: Record<string, string> = { a: 'cats', b: 'cars', c: 'cats', d: 'cars' }
    const measured = measureInterestEffect([play('u', 'a', 9000, true)], [play('u', 'c', 8000, true), play('u', 'd', 1000), play('u', 'b', 2000)], (v) => tags[v], 1)
    expect(measured.plays).toEqual({ in: 1, out: 2 })
    expect(measured.likeIn).toBeGreaterThan(measured.likeOut)
    expect(measured.watchIn[1]).toBeGreaterThan(measured.watchOut[1])
  })

  test('a play scaled at its own percentile', () => {
    expect(watchRatio(effect, 0.1, true)).toBe(1.1)
    expect(watchRatio(effect, 0.9, true)).toBe(1.67)
    expect(watchRatio(effect, 0.5, false)).toBe(0.97)
  })
})

describe('planReel: the action orderer on SubQ\'s read, deterministic first', () => {
  const input = { pack: basePack(), viewer, effect, read: read(0), seed: 0, allowed: allowAll, lastLikeReel: null, sponsored: false }
  test("the watch is the real viewer's next play, scaled by the interest effect: longer on their kind", () => {
    expect(realPlay(viewer, 0, 1)).toEqual({ ms: 500, from: 'kuaiRand1k 7 session 1 swipe 1' })
    expect(realPlay(viewer, 0, 11)).toEqual({ ms: 500, from: 'kuaiRand1k 7 session 2 swipe 1' })
    const theirs = planReel({ ...input, read: read(1), reel: 4 })
    const notTheirs = planReel({ ...input, read: read(0), reel: 4 })
    expect(theirs.match).toBe(true)
    expect(notTheirs.match).toBe(false)
    expect(theirs.watchMs).toBe(Math.round(7500 * 1.4))
    expect(notTheirs.watchMs).toBe(Math.round(2500 * 0.99))
    expect(playAt(viewer, 0.75)).toBe(7500)
    expect(planReel({ ...input, read: null, reel: 4 }).match).toBe(false)
  })

  test('the same pack, viewer, read, seed and reel, the same plan', () => {
    expect(planReel({ ...input, reel: 7, read: read(0.6) })).toEqual(planReel({ ...input, reel: 7, read: read(0.6) }))
  })

  test('scores are p × interest effect × segment weight × attention fit', () => {
    const long = planReel({ ...input, reel: 10, read: read(1) })
    expect(long.scores.like).toBe(Math.round(0.3 * 1.28 * 10_000) / 10_000)
    expect(long.scores.openComments).toBe(Math.round(0.3 * 1.4 * 0.8 * 10_000) / 10_000)
    const notTheirs = planReel({ ...input, reel: 10, read: read(0) })
    expect(notTheirs.scores.like).toBe(Math.round(0.3 * 0.95 * Math.min(1, notTheirs.watchMs / 5500) * 10_000) / 10_000)
    expect(notTheirs.scores.like).toBeLessThan(long.scores.like)
    expect(planReel({ ...input, reel: 1 }).scores.like).toBeLessThan(long.scores.like)
  })

  test("the like cooldown, the run's allowed actions (rule 8), the attention cap, a sponsored reel skipped", () => {
    expect(planReel({ ...input, reel: 10, lastLikeReel: 8 }).scores.like).toBe(0)
    expect(planReel({ ...input, reel: 10, allowed: { comments: false, profile: false, like: false } }).action).toBeNull()
    expect(planReel({ ...input, reel: 10, pack: basePack({ attentionCapS: 2 }) })).toMatchObject({ watchMs: 2000, capped: true })
    expect(planReel({ ...input, reel: 10, sponsored: true })).toMatchObject({ adSkip: true, watchMs: 1500, action: null })
  })

  test("a close call is settled by the read's pick when it names one of the two; a clear one never is", () => {
    const plansFor = (pack: PersonaPack, r: ReelRead) => Array.from({ length: 40 }, (_, i) => planReel({ ...input, pack, read: r, reel: 10, seed: i * 10 }))
    expect(plansFor(basePack({ likeP: 0.3, commentP: 0.05 }), read(0)).every((p) => p.closeCall === null)).toBe(true)
    const close = plansFor(basePack({ likeP: 0.3, commentP: 0.34 }), read(0, 'openComments')).filter((p) => p.closeCall)
    expect(close.length).toBeGreaterThan(0)
    expect(close.every((p) => p.action === 'openComments' && p.closeCall?.by === 'read')).toBe(true)
    expect(segmentWeight('social', 'like')).toBe(1)
    expect(segmentWeight('skipper', 'like')).toBe(0.3)
  })
})

describe('the read asked of SubQ', () => {
  const frame = { mediaType: 'image/png' as const, base64: 'iVBORw0KGgo=' }
  test('the frame as the image, the caption and the persona as state; the pick only among what the run allows', () => {
    const request = reelReadRequest(basePack(), { age: '31' }, frame, { caption: '4 am roadtrip', creator: 'Shady', sessionSoFar: 'The first reel of the session.', allowed: { comments: true, profile: false, like: false } })
    expect(request.images).toHaveLength(1)
    expect(String((request.state as { reel: string }).reel)).toContain('Caption: 4 am roadtrip')
    expect(String((request.state as { personaPack: string }).personaPack)).toContain('"interests":["memes","entertainment"]')
    expect(Object.keys(request.questions)).toEqual(['label', 'interest', 'pick'])
    expect(Object.keys((request.questions.pick as { criteria: object }).criteria)).toEqual(['openComments', 'none'])
    expect(Object.keys((request.questions.label as { criteria: object }).criteria)).toEqual(Object.keys(REEL_LABELS))
  })

  test("SubQ's answers read; a missing answer is not theirs, nothing picked", () => {
    const answered = readReelRead({ model: 'subq-snap-preview', answers: { label: { type: 'choice', choice: 'memes', probabilities: {}, confidence: 0.8 }, interest: { type: 'noul', noul: 0.7 }, pick: { type: 'choice', choice: 'like', probabilities: { like: 0.6 }, confidence: 0.6 } }, usage: { input_tokens: 600, output_tokens: 0 } })
    expect(answered).toMatchObject({ label: 'memes', interest: 0.7, pick: 'like', inputTokens: 600 })
    expect(readReelRead({ model: 'm', answers: {}, usage: { input_tokens: 0, output_tokens: 0 } })).toMatchObject({ interest: 0, pick: 'none', label: 'other' })
  })
})

describe('stepsForPlan: the watch, one action, then Next card', () => {
  const plan = (action: ReelPlan['action']) => ({ ...planReel({ pack: basePack(), viewer, effect, read: read(0), reel: 10, seed: 0, allowed: allowAll, lastLikeReel: null, sponsored: false }), action })
  test("each action its steps, with the pack's times; the last reel has no Next card", () => {
    expect(stepsForPlan(plan(null), { steps, pack: basePack() }, false, 'u').map((s) => s.id)).toEqual(['watch', 'swipe'])
    expect(stepsForPlan(plan('openComments'), { steps, pack: basePack() }, true, 'u').map((s) => s.id)).toEqual(['watch', 'openComments', 'scrollComments', 'inComments', 'closeComments'])
    expect(stepsForPlan(plan('like'), { steps, pack: basePack() }, true, 'u').map((s) => s.id)).toEqual(['watch', 'like'])
    expect(stepsForPlan(plan('openProfile'), { steps, pack: basePack() }, true, 'https://www.facebook.com/reel/1').at(-1)?.args).toEqual(['https://www.facebook.com/reel/1'])
  })
})

describe('reelCaption: the current reel\'s creator and caption from its snapshot', () => {
  test('the one "see owner profile" heading, then its text', () => {
    const snapshot = ['- heading "Shady Hebish, see owner profile" [level=2] [ref=e1]:', '  - link "Shady Hebish, see owner profile" [ref=e2]:', '    - text: Shady Hebish', '- button "Follow Shady Hebish" [ref=e3]: Follow', '- generic [ref=e4]:', '  - text: 4 am roadtrip in the lotus emira …'].join('\n')
    expect(reelCaption(snapshot)).toEqual({ creator: 'Shady Hebish', caption: '4 am roadtrip in the lotus emira …' })
    expect(reelCaption('- button "Next card"')).toEqual({ creator: '', caption: '' })
  })
})

describe('reelPersonaMachine', () => {
  const REEL_URL = (n: number) => `https://www.facebook.com/reel/${1000 + n}`
  const actScript = (acted: string[]) => {
    let page = 0
    return fromPromise<StepReply, { account: string; step: ActivityStep }>(async ({ input }) => {
      acted.push(input.step.id)
      if (input.step.id === 'swipe') page++
      return { ok: true, url: REEL_URL(page), folder: `steps/${acted.length}`, snapshot: input.step.id === 'unmute' ? '' : input.step.id === 'like' ? '- button "Remove Like"' : '- button "Unmute"', exchanges: answeringFixture(input.step.expect?.answers, { uid: input.account }) }
    })
  }
  test('Reels and the sound, then each reel read by SubQ on the frame it landed on, then planned', async () => {
    const acted: string[] = []
    const frames: (string | null)[] = []
    const machine = reelPersonaMachine.provide({
      actors: {
        act: actScript(acted),
        read: fromPromise<ReelRead, { account: string; reel: number; frame: string | null; labels: ReelLabel[]; allowed: AllowedActions }>(async ({ input }) => {
          frames.push(input.frame)
          return read(input.reel === 2 ? 1 : 0)
        })
      }
    })
    const actor = createActor(machine, { input: { account: 'bethlehem', reels: 3, seed: 0, live: true, likes: false, steps, viewer, pack: basePack({ likeP: 0, commentP: 0, profileP: 0 }), effect } })
    actor.start()
    const output = await toPromise(actor)
    expect(acted).toEqual(['openReels', 'unmute', 'watch', 'swipe', 'watch', 'swipe', 'watch'])
    expect(frames).toEqual(['steps/2', 'steps/4', 'steps/6'])
    expect(output.labels.map((l) => [l.reel, l.plan.match])).toEqual([[1, false], [2, true], [3, false]])
    expect(output.ok).toBe(true)
  })

  test("SubQ not answering: the reel is planned as not theirs and the run goes on", async () => {
    const machine = reelPersonaMachine.provide({
      actors: {
        act: actScript([]),
        read: fromPromise<ReelRead, { account: string; reel: number; frame: string | null; labels: ReelLabel[]; allowed: AllowedActions }>(async () => {
          throw new Error('SubQ 503')
        })
      }
    })
    const actor = createActor(machine, { input: { account: 'bethlehem', reels: 2, seed: 1, live: true, likes: false, steps, viewer, pack: basePack(), effect } })
    actor.start()
    const output = await toPromise(actor)
    expect(output.labels.map((l) => [l.read, l.plan.match])).toEqual([[null, false], [null, false]])
    expect(output.ok).toBe(true)
  })
})

describe('the feed, post by post (planPost, feedPersonaMachine)', () => {
  const pack = basePack({ likeP: 0.3, attentionCapS: 60 })
  const post = { words: 119, liked: false }
  test("a post that isn't theirs gets a glance around Facebook's 2.5 s; theirs its reading time, longer by the interest effect", () => {
    const glance = planPost({ pack, effect, read: read(0), post, index: 1, seed: 1, allowLike: false, lastLikeIndex: null })
    expect(glance.match).toBe(false)
    expect(glance.dwellMs).toBeGreaterThanOrEqual(1250)
    expect(glance.dwellMs).toBeLessThanOrEqual(3000)
    const theirs = planPost({ pack, effect, read: read(1), post, index: 1, seed: 1, allowLike: false, lastLikeIndex: null })
    expect(theirs.match).toBe(true)
    expect(theirs.dwellMs).toBe(Math.round(((119 / 238) * 60_000 + 2500) * effect.watchIn[1]))
    expect(planPost({ pack: basePack({ attentionCapS: 5 }), effect, read: read(1), post, index: 1, seed: 1, allowLike: false, lastLikeIndex: null }).dwellMs).toBe(5000)
  })

  test('a like only when allowed (rule 8), never on a post already liked, never in the cooldown', () => {
    const plans = (over: Partial<Parameters<typeof planPost>[0]>) => Array.from({ length: 30 }, (_, i) => planPost({ pack, effect, read: read(1, 'like'), post, index: 10, seed: i, allowLike: true, lastLikeIndex: null, ...over }))
    expect(plans({}).some((p) => p.like)).toBe(true)
    expect(plans({ allowLike: false }).every((p) => !p.like)).toBe(true)
    expect(plans({ post: { words: 5, liked: true } }).every((p) => !p.like)).toBe(true)
    expect(plans({ lastLikeIndex: 9 }).every((p) => !p.like && p.likeScore === 0)).toBe(true)
  })

  test("the post's read sent to SubQ: its frame, heading, text and image descriptions; a like asked only when allowed", () => {
    const frame = { mediaType: 'image/png' as const, base64: 'iVBORw0KGgo=' }
    const request = postReadRequest(pack, { age: '31' }, frame, { heading: 'Blue Ridge Parkway Photography', text: 'Fall colors this morning', images: ['May be an image of road and nature'], sessionSoFar: 'The first post of the session.', allowLike: false })
    expect(String((request.state as { post: string }).post)).toContain('From: Blue Ridge Parkway Photography')
    expect(String((request.state as { post: string }).post)).toContain('May be an image of road and nature')
    expect(Object.keys((request.questions.pick as { criteria: object }).criteria)).toEqual(['none'])
  })

  test('the session: the feed, each post into view then read, then Marketplace and listings; without --likes no like', async () => {
    const feedSteps: Record<string, ActivityStep> = {}
    for (const step of FEED.steps) feedSteps[step.id] ??= step
    const acted: string[] = []
    const machine = feedPersonaMachine.provide({
      actors: {
        act: fromPromise<StepReply, { account: string; step: ActivityStep }>(async ({ input }) => {
          acted.push(input.step.id)
          const url = input.step.id.toLowerCase().includes('marketplace') ? 'https://www.facebook.com/marketplace/' : 'https://www.facebook.com/'
          return { ok: true, url, folder: `steps/${acted.length}`, post: input.step.id === 'nextPost' ? { heading: `Post ${acted.length}`, text: 'a few words here', images: [], words: 4, liked: false } : undefined, exchanges: answeringFixture(input.step.expect?.answers, { uid: input.account }) }
        }),
        read: fromPromise<ReelRead, { account: string; index: number; frame: string | null; post: { heading: string; text: string; images: string[]; words: number; liked: boolean }; labels: FeedLabel[] }>(async ({ input }) => read(input.index === 1 ? 1 : 0, 'like'))
      }
    })
    const actor = createActor(machine, { input: { account: 'reading', posts: 2, seed: 3, live: true, likes: false, steps: feedSteps, pack, effect } })
    actor.start()
    const output = await toPromise(actor)
    expect(acted).toEqual(['openFeed', 'dismissPrompt', 'settle', 'nextPost', 'onPost', 'nextPost', 'onPost', 'openMarketplace', 'lookMarketplace', 'scrollMarketplace', 'openListings'])
    expect(output.labels.map((l) => [l.index, l.plan?.match, l.plan?.like])).toEqual([[1, true, false], [2, false, false]])
    const commenter = basePack({ likeP: 0, commentP: 1 })
    const opened = planPost({ pack: commenter, effect, read: read(1, 'openComments'), post: { words: 20, liked: false, truncated: true }, index: 2, seed: 1, allowLike: false, allowClicks: true, lastLikeIndex: null })
    expect(opened).toMatchObject({ match: true, seeMore: true, action: 'openComments', like: false })
    expect(stepsForPost(opened, feedSteps).map((s) => s.id)).toEqual(['seeMore', 'onPost', 'openComments', 'scrollComments', 'inComments', 'closeComments'])
    expect(output.ok).toBe(true)
  })
})
