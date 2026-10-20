/**
 * The warm-up activity machine (rule 49): one activity's steps run in the
 * account's open browser, each checked against what it must achieve
 * (`checkStep`). Its only side effect is `act`, one step sent to the open
 * inspect session, which the caller provides; tests script it.
 *
 *   next ─ a step left ─▶ acting (act, then check)
 *                            ├── as expected ─▶ next
 *                            ├── a checkpoint or a login ─▶ blocked (the account's issue: stop)
 *                            └── an issue ─▶ next (record: every step outlined) | stopped (run)
 *        └── none left ─▶ done
 *   a step it may not take (a like without --likes, a click without --live) is skipped and said so.
 */
import { assign, fromPromise, setup } from 'xstate'
import { pageProblem } from '../../camofox/flow/index'
import { checkStep } from './helpers/checkStep'
import type { AllowedActions, ReelRead } from './helpers/reelDecision'
import { planPost } from './helpers/feedOrderer'
import type { PostPlan } from './helpers/feedOrderer'
import { planReel } from './helpers/reelOrderer'
import type { ReelPlan } from './helpers/reelOrderer'
import type { PersonaPack } from '../persona/types'
import type { InterestEffect } from '../viewer/helpers/interestEffect'
import type { ReelViewer } from '../viewer/types'
import { seeded } from './helpers/reelSession'
import type { StepReply } from './helpers/checkStep'
import type { ActivityStep, StepOutcome } from './types'

export interface ActivityInput {
  account: string
  steps: ActivityStep[]
  /** Clicks allowed (rule 8's click gate). */
  live: boolean
  /** Likes allowed (rule 8). */
  likes: boolean
  /** Record: go on past an issue so every step is outlined. Run: stop at the first one. */
  continueOnIssue: boolean
}

export interface ActivityContext extends ActivityInput {
  index: number
  url: string | null
  /** The URL each step started from, by its id: `{urlBefore:openProfile}` in a later step's args is the reel's own URL. */
  urlBefore: Record<string, string>
  outcomes: StepOutcome[]
  blocked: { code: string; detail: string } | null
}

export interface ActivityOutput {
  account: string
  outcomes: StepOutcome[]
  issues: StepOutcome[]
  blocked: ActivityContext['blocked']
  /** Every step taken was as expected. */
  ok: boolean
}

/** A step with `{urlBefore:<id>}` in its args filled from the URLs recorded so far. Pure. */
export function resolveStep(step: ActivityStep, urlBefore: Record<string, string>): ActivityStep {
  if (!step.args.some((a) => a.includes('{urlBefore:'))) return step
  return { ...step, args: step.args.map((a) => a.replace(/\{urlBefore:(\w+)\}/g, (_, id: string) => urlBefore[id] ?? '')) }
}

const skipReason = (step: ActivityStep, context: ActivityContext): string | null =>
  step.likes && !context.likes ? 'a like acts on Facebook: --likes (rule 8)' : step.clicks && !context.live ? 'it clicks on the page: --live (rule 8)' : null

export const warmupActivityMachine = setup({
  types: { context: {} as ActivityContext, input: {} as ActivityInput, output: {} as ActivityOutput },
  actors: {
    act: fromPromise<StepReply, { account: string; step: ActivityStep }>(async () => {
      throw new Error('warmupActivityMachine: provide an `act` actor')
    })
  },
  guards: {
    stepsLeft: ({ context }) => context.index < context.steps.length,
    skip: ({ context }) => skipReason(context.steps[context.index], context) !== null,
    blocked: ({ context }) => context.blocked !== null,
    stopAtIssue: ({ context }) => !context.continueOnIssue && context.outcomes.at(-1)?.ok === false
  }
}).createMachine({
  id: 'warmupActivity',
  context: ({ input }) => ({ ...input, index: 0, url: null, urlBefore: {}, outcomes: [], blocked: null }),
  initial: 'next',
  states: {
    next: {
      always: [
        { guard: 'blocked', target: 'blocked' },
        { guard: 'stopAtIssue', target: 'stopped' },
        { guard: ({ context }) => context.index >= context.steps.length, target: 'done' },
        {
          guard: 'skip',
          target: 'next',
          reenter: true,
          actions: assign(({ context }) => {
            const step = context.steps[context.index]
            return { index: context.index + 1, outcomes: [...context.outcomes, { id: step.id, ok: true, skipped: skipReason(step, context)! }] }
          })
        },
        { target: 'acting' }
      ]
    },
    acting: {
      invoke: {
        src: 'act',
        input: ({ context }) => ({ account: context.account, step: resolveStep(context.steps[context.index], context.urlBefore) }),
        onDone: {
          target: 'next',
          actions: assign(({ context, event }) => {
            const step = resolveStep(context.steps[context.index], context.urlBefore)
            const reply = event.output as StepReply
            const landed = pageProblem({ action: step.action, url: step.action === 'goto' ? step.args[0] : undefined }, reply)
            const outcome = landed && (landed.code === 'checkpointed' || landed.code === 'loginWall') ? { id: step.id, ok: false, issue: `${landed.code}: ${landed.detail}`, url: reply.url, folder: reply.folder } : checkStep(step, context.url, reply)
            return {
              index: context.index + 1,
              url: reply.url ?? context.url,
              urlBefore: context.url ? { ...context.urlBefore, [step.id]: context.url } : context.urlBefore,
              outcomes: [...context.outcomes, outcome],
              blocked: landed && (landed.code === 'checkpointed' || landed.code === 'loginWall') ? { code: landed.code, detail: landed.detail } : null
            }
          })
        },
        onError: {
          target: 'next',
          actions: assign(({ context, event }) => ({ index: context.index + 1, outcomes: [...context.outcomes, { id: context.steps[context.index].id, ok: false, error: String(event.error) }] }))
        }
      }
    },
    done: { type: 'final' },
    stopped: { type: 'final' },
    blocked: { type: 'final' }
  },
  output: ({ context }) => {
    const issues = context.outcomes.filter((o) => !o.ok)
    return { account: context.account, outcomes: context.outcomes, issues, blocked: context.blocked, ok: issues.length === 0 && !context.blocked }
  }
})

/**
 * A Reels session for a persona pack and its real viewer (rule 50): the
 * persona's For you feed built by engaging with what it would engage with.
 * Each reel, the moment it lands, is read by SubQ from its frame (what it
 * is, whether it is this persona's kind, the one action they'd pick); the
 * action orderer (`planReel`, deterministic from the seed) then plans the
 * watch, longer on their kind and shorter outside it as measured on real
 * viewers, and at most one action. SubQ's answer time is the glance: the
 * watch counts from when the reel landed. Its side effects are `act` (a step
 * in the open browser) and `read` (one SubQ request per reel), which the
 * caller provides; tests script both.
 *
 *   acting (openReels, unmute) ─▶ reading (SubQ, the frame it landed on) ─▶ the plan's steps:
 *     watch, one action, Next card ─▶ reading …
 *   a checkpoint or a login ─▶ blocked; a step that didn't do what it should ─▶ stopped
 */
export interface ReelLabel {
  reel: number
  url: string | null
  /** SubQ's read; null when it couldn't answer (the reel then taken as not theirs). */
  read: ReelRead | null
  plan: ReelPlan
}

export interface PersonaSessionInput {
  account: string
  reels: number
  seed: number
  live: boolean
  likes: boolean
  /** The steps by id, from the activity's definition (`REEL`). */
  steps: Record<string, ActivityStep>
  viewer: ReelViewer
  pack: PersonaPack
  effect: InterestEffect
}

type QueueItem = ActivityStep | { id: 'decide' }

interface PersonaSessionContext extends PersonaSessionInput {
  queue: QueueItem[]
  reel: number
  url: string | null
  /** The step folder whose screenshot is this reel as it landed, and whether it said Sponsored. */
  frame: string | null
  sponsored: boolean
  lastLikeReel: number | null
  outcomes: StepOutcome[]
  labels: ReelLabel[]
  blocked: { code: string; detail: string } | null
  problem: string | null
}

export interface PersonaSessionOutput {
  account: string
  outcomes: StepOutcome[]
  labels: ReelLabel[]
  blocked: PersonaSessionContext['blocked']
  problem: string | null
  ok: boolean
}

/** What the run allows a reel beyond watching and swiping: clicks need --live, a like --likes too (rule 8). Pure. */
export const allowedActions = (input: Pick<PersonaSessionInput, 'live' | 'likes'>): AllowedActions => ({ comments: input.live, profile: input.live, like: input.live && input.likes })

/** Steps that land on a reel: their screenshot is the reel as it landed. */
const LANDS = new Set(['openReels', 'unmute', 'swipe'])

const dwell = (step: ActivityStep, id: string, ms: number, why: string): ActivityStep => ({ ...step, id, action: 'dwell', args: [(ms / 1000).toFixed(2)], why, expect: undefined, clicks: undefined })

/** The steps for one reel's plan: the watch (from when it landed), its action, then Next card. Pure. */
export function stepsForPlan(plan: ReelPlan, input: Pick<PersonaSessionInput, 'steps' | 'pack'>, lastReel: boolean, reelUrl: string | null): ActivityStep[] {
  const s = input.steps
  const t = input.pack.traits
  const why = `watch ${(plan.watchMs / 1000).toFixed(1)} s from when it landed (${plan.match ? 'their kind' : 'not theirs'}): ${plan.watchFrom}${plan.capped ? ', capped at the attention span' : ''}${plan.adSkip ? ', a sponsored reel skipped' : ''}`
  const queue: ActivityStep[] = [dwell(s.watch, 'watch', plan.watchMs, why)]
  if (plan.action === 'openComments') queue.push(s.openComments, s.scrollComments, dwell(s.watch, 'inComments', t.commentMs, `${(t.commentMs / 1000).toFixed(1)} s in the comments (the pack's comment time)`), s.closeComments)
  if (plan.action === 'like') queue.push(s.like)
  if (plan.action === 'openProfile' && reelUrl) queue.push(s.openProfile, dwell(s.watch, 'onProfile', t.profileMs, `${(t.profileMs / 1000).toFixed(1)} s on the profile`), { ...s.backToReel, args: [reelUrl] })
  if (!lastReel) queue.push(s.swipe)
  return queue
}

const SPONSORED = /\bSponsored\b/

/** The reel's plan from SubQ's read (or none), and its steps queued ahead of the rest. */
const planned = (context: PersonaSessionContext, read: ReelRead | null) => {
  const plan = planReel({ pack: context.pack, viewer: context.viewer, effect: context.effect, read, reel: context.reel, seed: context.seed, allowed: allowedActions(context), lastLikeReel: context.lastLikeReel, sponsored: context.sponsored })
  const queue = stepsForPlan(plan, context, context.reel >= context.reels, context.url)
  return { queue: [...queue, ...context.queue.slice(1)], labels: [...context.labels, { reel: context.reel, url: context.url, read, plan }] }
}

export const reelPersonaMachine = setup({
  types: { context: {} as PersonaSessionContext, input: {} as PersonaSessionInput, output: {} as PersonaSessionOutput },
  actors: {
    act: fromPromise<StepReply, { account: string; step: ActivityStep }>(async () => {
      throw new Error('reelPersonaMachine: provide an `act` actor')
    }),
    read: fromPromise<ReelRead, { account: string; reel: number; frame: string | null; labels: ReelLabel[]; allowed: AllowedActions }>(async () => {
      throw new Error('reelPersonaMachine: provide a `read` actor')
    })
  },
  guards: {
    halted: ({ context }) => context.blocked !== null || context.problem !== null,
    empty: ({ context }) => context.queue.length === 0,
    deciding: ({ context }) => context.queue[0]?.id === 'decide',
    // Likes and clicks it may not take are skipped, as in the activity machine (rule 8).
    skip: ({ context }) => {
      const step = context.queue[0] as ActivityStep
      return (step.likes === true && !context.likes) || (step.clicks === true && !context.live)
    }
  }
}).createMachine({
  id: 'reelPersona',
  context: ({ input }) => ({
    ...input,
    // Reels and the sound once; then each reel read and planned the moment it lands.
    queue: [input.steps.openReels, input.steps.unmute, { id: 'decide' }],
    reel: 1,
    url: null,
    frame: null,
    sponsored: false,
    lastLikeReel: null,
    outcomes: [],
    labels: [],
    blocked: null,
    problem: null
  }),
  initial: 'next',
  states: {
    next: {
      always: [
        { guard: 'halted', target: 'stopped' },
        { guard: 'empty', target: 'done' },
        { guard: 'deciding', target: 'reading' },
        {
          guard: 'skip',
          target: 'next',
          reenter: true,
          actions: assign(({ context }) => {
            const step = context.queue[0] as ActivityStep
            return { queue: context.queue.slice(1), outcomes: [...context.outcomes, { id: step.id, ok: true, skipped: step.likes ? 'a like acts on Facebook: --likes (rule 8)' : 'it clicks on the page: --live (rule 8)' }] }
          })
        },
        { target: 'acting' }
      ]
    },
    acting: {
      invoke: {
        src: 'act',
        input: ({ context }) => ({ account: context.account, step: context.queue[0] as ActivityStep }),
        onDone: {
          target: 'next',
          actions: assign(({ context, event }) => {
            const step = context.queue[0] as ActivityStep
            const reply = event.output as StepReply
            const landed = pageProblem({ action: step.action, url: step.action === 'goto' ? step.args[0] : undefined }, reply)
            const walled = landed !== null && (landed.code === 'checkpointed' || landed.code === 'loginWall')
            const outcome: StepOutcome = walled ? { id: step.id, ok: false, issue: `${landed!.code}: ${landed!.detail}`, url: reply.url, folder: reply.folder } : checkStep(step, context.url, reply)
            const swiped = step.id === 'swipe' && outcome.ok
            const lands = LANDS.has(step.id) && reply.folder
            return {
              queue: [...context.queue.slice(1), ...(swiped ? [{ id: 'decide' as const }] : [])],
              reel: swiped ? context.reel + 1 : context.reel,
              url: reply.url ?? context.url,
              frame: lands ? reply.folder! : context.frame,
              sponsored: lands ? SPONSORED.test(reply.snapshot ?? '') : context.sponsored,
              lastLikeReel: step.id === 'like' && outcome.ok ? context.reel : context.lastLikeReel,
              outcomes: [...context.outcomes, outcome],
              blocked: walled ? { code: landed!.code, detail: landed!.detail } : null,
              problem: outcome.ok ? null : `${step.id}: ${outcome.issue ?? outcome.error}`
            }
          })
        },
        onError: { target: 'stopped', actions: assign(({ context, event }) => ({ problem: `${(context.queue[0] as ActivityStep).id}: ${String(event.error)}` })) }
      }
    },
    reading: {
      invoke: {
        src: 'read',
        input: ({ context }) => ({ account: context.account, reel: context.reel, frame: context.frame, labels: context.labels, allowed: allowedActions(context) }),
        onDone: { target: 'next', actions: assign(({ context, event }) => planned(context, event.output as ReelRead)) },
        // SubQ down: the reel is planned as not theirs and the run goes on, said so in its label (read: null).
        onError: { target: 'next', actions: assign(({ context }) => planned(context, null)) }
      }
    },
    done: { type: 'final' },
    stopped: { type: 'final' }
  },
  output: ({ context }) => ({
    account: context.account,
    outcomes: context.outcomes,
    labels: context.labels,
    blocked: context.blocked,
    problem: context.problem,
    ok: !context.blocked && !context.problem
  })
})

/**
 * The home feed for a persona pack (rule 50; matt 2026-10-20: use the
 * platform as the persona would, not a scroll and away). Each post is brought
 * into view by the wheel (`nextPost`), read by SubQ from its screen, heading,
 * text and image descriptions (`read`), and planned (`planPost`): a glance or a
 * read, timed from when it came into view, and a like where they would (only
 * with --live and --likes, rule 8). Then Marketplace, a look and a scroll, and
 * a few listings opened. Its side effects are `act` and `read`, provided by the
 * caller; tests script both.
 *
 *   openFeed, settle ─▶ per post: nextPost ─▶ reading (SubQ) ─▶ the time on it [, likePost] ─▶ …
 *     ─▶ openMarketplace, lookMarketplace, scrollMarketplace, openListings
 *   a checkpoint or a login ─▶ blocked; a step that didn't do what it should ─▶ stopped
 */
export interface FeedLabel {
  index: number
  post: { heading: string; words: number; images: number } | null
  read: ReelRead | null
  plan: PostPlan | null
}

export interface FeedSessionInput {
  account: string
  posts: number
  seed: number
  live: boolean
  likes: boolean
  steps: Record<string, ActivityStep>
  pack: PersonaPack
  effect: InterestEffect
}

type FeedQueueItem = ActivityStep | { id: 'readPost' }
type FeedPostSeen = NonNullable<StepReply['post']>

interface FeedSessionContext extends FeedSessionInput {
  queue: FeedQueueItem[]
  index: number
  post: FeedPostSeen | null
  frame: string | null
  lastLikeIndex: number | null
  outcomes: StepOutcome[]
  labels: FeedLabel[]
  blocked: { code: string; detail: string } | null
  problem: string | null
}

export interface FeedSessionOutput {
  account: string
  outcomes: StepOutcome[]
  labels: FeedLabel[]
  blocked: FeedSessionContext['blocked']
  problem: string | null
  ok: boolean
}

/** The feed session's queue: the feed opened, each post found and read, then Marketplace. Pure. */
export function feedQueue(steps: Record<string, ActivityStep>, posts: number): FeedQueueItem[] {
  const perPost: FeedQueueItem[] = []
  for (let i = 0; i < posts; i++) perPost.push(steps.nextPost, { id: 'readPost' })
  return [steps.openFeed, steps.settle, ...perPost, steps.openMarketplace, steps.lookMarketplace, steps.scrollMarketplace, steps.openListings]
}

/** The steps for one post's plan: the time on it (from when it came into view), then its like. Pure. */
export function stepsForPost(plan: PostPlan, steps: Record<string, ActivityStep>): ActivityStep[] {
  const queue: ActivityStep[] = [dwell(steps.settle, 'onPost', plan.dwellMs, `${(plan.dwellMs / 1000).toFixed(1)} s on it from when it came into view (${plan.match ? 'theirs' : 'not theirs'}): ${plan.from}`)]
  if (plan.like) queue.push(steps.likePost)
  return queue
}

const plannedPost = (context: FeedSessionContext, read: ReelRead | null) => {
  if (!context.post) return { queue: context.queue.slice(1), labels: [...context.labels, { index: context.index, post: null, read: null, plan: null }] }
  const plan = planPost({ pack: context.pack, effect: context.effect, read, post: context.post, index: context.index, seed: context.seed, allowLike: context.live && context.likes, lastLikeIndex: context.lastLikeIndex })
  return {
    queue: [...stepsForPost(plan, context.steps), ...context.queue.slice(1)],
    labels: [...context.labels, { index: context.index, post: { heading: context.post.heading, words: context.post.words, images: context.post.images.length }, read, plan }],
    lastLikeIndex: plan.like ? context.index : context.lastLikeIndex
  }
}

export const feedPersonaMachine = setup({
  types: { context: {} as FeedSessionContext, input: {} as FeedSessionInput, output: {} as FeedSessionOutput },
  actors: {
    act: fromPromise<StepReply, { account: string; step: ActivityStep }>(async () => {
      throw new Error('feedPersonaMachine: provide an `act` actor')
    }),
    read: fromPromise<ReelRead, { account: string; index: number; frame: string | null; post: FeedPostSeen; labels: FeedLabel[] }>(async () => {
      throw new Error('feedPersonaMachine: provide a `read` actor')
    })
  },
  guards: {
    halted: ({ context }) => context.blocked !== null || context.problem !== null,
    empty: ({ context }) => context.queue.length === 0,
    // No post came into view (none left on the page, it scrolled for more): nothing to read.
    nothingToRead: ({ context }) => context.queue[0]?.id === 'readPost' && context.post === null,
    reading: ({ context }) => context.queue[0]?.id === 'readPost',
    skip: ({ context }) => {
      const step = context.queue[0] as ActivityStep
      return (step.likes === true && !context.likes) || (step.clicks === true && !context.live)
    }
  }
}).createMachine({
  id: 'feedPersona',
  context: ({ input }) => ({ ...input, queue: feedQueue(input.steps, input.posts), index: 0, post: null, frame: null, lastLikeIndex: null, outcomes: [], labels: [], blocked: null, problem: null }),
  initial: 'next',
  states: {
    next: {
      always: [
        { guard: 'halted', target: 'stopped' },
        { guard: 'empty', target: 'done' },
        { guard: 'nothingToRead', target: 'next', reenter: true, actions: assign(({ context }) => plannedPost(context, null)) },
        { guard: 'reading', target: 'reading' },
        {
          guard: 'skip',
          target: 'next',
          reenter: true,
          actions: assign(({ context }) => {
            const step = context.queue[0] as ActivityStep
            return { queue: context.queue.slice(1), outcomes: [...context.outcomes, { id: step.id, ok: true, skipped: step.likes ? 'a like acts on Facebook: --likes (rule 8)' : 'it clicks on the page: --live (rule 8)' }] }
          })
        },
        { target: 'acting' }
      ]
    },
    acting: {
      invoke: {
        src: 'act',
        input: ({ context }) => ({ account: context.account, step: context.queue[0] as ActivityStep }),
        onDone: {
          target: 'next',
          actions: assign(({ context, event }) => {
            const step = context.queue[0] as ActivityStep
            const reply = event.output as StepReply
            const landed = pageProblem({ action: step.action, url: step.action === 'goto' ? step.args[0] : undefined }, reply)
            const walled = landed !== null && (landed.code === 'checkpointed' || landed.code === 'loginWall')
            const outcome: StepOutcome = walled ? { id: step.id, ok: false, issue: `${landed!.code}: ${landed!.detail}`, url: reply.url, folder: reply.folder } : checkStep(step, null, reply)
            const isPost = step.id === 'nextPost'
            return {
              queue: context.queue.slice(1),
              index: isPost ? context.index + 1 : context.index,
              post: isPost ? (reply.post ?? null) : context.post,
              frame: isPost && reply.folder ? reply.folder : context.frame,
              outcomes: [...context.outcomes, outcome],
              blocked: walled ? { code: landed!.code, detail: landed!.detail } : null,
              problem: outcome.ok ? null : `${step.id}: ${outcome.issue ?? outcome.error}`
            }
          })
        },
        onError: { target: 'stopped', actions: assign(({ context, event }) => ({ problem: `${(context.queue[0] as ActivityStep).id}: ${String(event.error)}` })) }
      }
    },
    reading: {
      invoke: {
        src: 'read',
        input: ({ context }) => ({ account: context.account, index: context.index, frame: context.frame, post: context.post!, labels: context.labels }),
        onDone: { target: 'next', actions: assign(({ context, event }) => plannedPost(context, event.output as ReelRead)) },
        // SubQ down: the post is planned as not theirs and the session goes on.
        onError: { target: 'next', actions: assign(({ context }) => plannedPost(context, null)) }
      }
    },
    done: { type: 'final' },
    stopped: { type: 'final' }
  },
  output: ({ context }) => ({ account: context.account, outcomes: context.outcomes, labels: context.labels, blocked: context.blocked, problem: context.problem, ok: !context.blocked && !context.problem })
})
