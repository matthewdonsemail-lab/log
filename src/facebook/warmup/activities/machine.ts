import { assign, fromPromise, setup } from 'xstate'
import { pageProblem } from '../../../browser/flow/index'
import { checkStep } from './helpers/checkStep'
import type { AllowedActions, ReelRead } from './helpers/reelDecision'
import { planPost } from './helpers/feedOrderer'
import type { PostPlan } from './helpers/feedOrderer'
import { planReel } from './helpers/reelOrderer'
import type { ReelPlan } from './helpers/reelOrderer'
import type { PersonaPack } from '../../../warmup/persona/types'
import type { InterestEffect } from '../../../warmup/viewer/helpers/interestEffect'
import type { ReelViewer } from '../../../warmup/viewer/types'
import { seeded } from './helpers/reelSession'
import type { StepReply } from './helpers/checkStep'
import type { ActivityStep, StepOutcome } from './types'

export interface ActivityInput {
  account: string
  steps: ActivityStep[]
  live: boolean
  likes: boolean
  continueOnIssue: boolean
}

export interface ActivityContext extends ActivityInput {
  index: number
  url: string | null
  urlBefore: Record<string, string>
  outcomes: StepOutcome[]
  blocked: { code: string; detail: string } | null
}

export interface ActivityOutput {
  account: string
  outcomes: StepOutcome[]
  issues: StepOutcome[]
  blocked: ActivityContext['blocked']
  ok: boolean
}

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

export interface ReelLabel {
  reel: number
  url: string | null
  read: ReelRead | null
  plan: ReelPlan
}

export interface PersonaSessionInput {
  account: string
  reels: number
  seed: number
  live: boolean
  likes: boolean
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

export const allowedActions = (input: Pick<PersonaSessionInput, 'live' | 'likes'>): AllowedActions => ({ comments: input.live, profile: input.live, like: input.live && input.likes })

const LANDS = new Set(['openReels', 'unmute', 'swipe'])

const dwell = (step: ActivityStep, id: string, ms: number, why: string): ActivityStep => ({ ...step, id, action: 'dwell', args: [(ms / 1000).toFixed(2)], why, expect: undefined, clicks: undefined })

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
    skip: ({ context }) => {
      const step = context.queue[0] as ActivityStep
      return (step.likes === true && !context.likes) || (step.clicks === true && !context.live)
    }
  }
}).createMachine({
  id: 'reelPersona',
  context: ({ input }) => ({
    ...input,
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

export function feedQueue(steps: Record<string, ActivityStep>, posts: number): FeedQueueItem[] {
  const perPost: FeedQueueItem[] = []
  for (let i = 0; i < posts; i++) perPost.push(steps.nextPost, { id: 'readPost' })
  return [steps.openFeed, steps.dismissPrompt, steps.settle, ...perPost, steps.openMarketplace, steps.lookMarketplace, steps.scrollMarketplace, steps.openListings]
}

export function stepsForPost(plan: PostPlan, steps: Record<string, ActivityStep>): ActivityStep[] {
  const queue: ActivityStep[] = []
  if (plan.seeMore) queue.push(steps.seeMore)
  queue.push(dwell(steps.settle, 'onPost', plan.dwellMs, `${(plan.dwellMs / 1000).toFixed(1)} s on it from when it came into view (${plan.match ? 'theirs' : 'not theirs'}): ${plan.from}`))
  if (plan.action === 'like') queue.push(steps.likePost)
  if (plan.action === 'openComments') queue.push(steps.openComments, steps.scrollComments, dwell(steps.settle, 'inComments', plan.commentMs, `${(plan.commentMs / 1000).toFixed(1)} s in the comments (the pack's comment time)`), steps.closeComments)
  return queue
}

const plannedPost = (context: FeedSessionContext, read: ReelRead | null) => {
  if (!context.post) return { queue: context.queue.slice(1), labels: [...context.labels, { index: context.index, post: null, read: null, plan: null }] }
  const plan = planPost({ pack: context.pack, effect: context.effect, read, post: { ...context.post, truncated: context.post.text.includes('See more') }, index: context.index, seed: context.seed, allowLike: context.live && context.likes, allowClicks: context.live, lastLikeIndex: context.lastLikeIndex })
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
        onError: { target: 'next', actions: assign(({ context }) => plannedPost(context, null)) }
      }
    },
    done: { type: 'final' },
    stopped: { type: 'final' }
  },
  output: ({ context }) => ({ account: context.account, outcomes: context.outcomes, labels: context.labels, blocked: context.blocked, problem: context.problem, ok: !context.blocked && !context.problem })
})
