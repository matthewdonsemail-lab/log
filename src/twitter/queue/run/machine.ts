import { assign, fromPromise, setup } from 'xstate'
import type { TwitterSessionAnswer } from '../../account/session/index'
import { spaceOut } from '../plan/index'
import type { EventKind, PlanEvent, QueueItem } from '../plan/index'
import { ADDED, CANCELLED, atSeconds, awaitAdded, dropPost, failureOf, iso, mergeAdded, refusalOf, saidOf, sentUrlOf, succeeded, uniform, waitUntil } from './helpers/index'
import type { RunContext, RunDeps, RunEvent, RunInput, RunOutput, RunResult } from './types'
import { DROP_WAIT_MAX_SECONDS, DROP_WAIT_MIN_SECONDS, LATE_SECONDS, MAX_DROPS } from './types'

type Context = RunContext

const sentTotal = (context: Context) => context.queue.items.filter((i) => i.status === 'sent').length

const skippedTotal = (context: Context) => context.plan.events.filter((e) => e.kind === 'reply' && e.skipped).length

const who = (context: Context) => `@${context.item!.handle ?? '?'}`

const whatOf = (context: Context) => `${context.event!.kind} #${context.event!.n} ${who(context)}`

const dueOf = (context: Context) => atSeconds(context.event!)

const waitOf = (context: Context) => dueOf(context) - context.deps.nowMs() / 1000

const answerOf = ({ event }: { event: { output: TwitterSessionAnswer } }) => event.output

const waitedOf = ({ event }: { event: { output: number } }) => event.output

const changedOf = ({ event }: { event: { output: string[] } }) => event.output

const errorOf = ({ event }: { event: { error: unknown } }) => event.error

const crash = { target: '#twitterQueueRun.crashed', actions: { type: 'keepError' as const, params: errorOf } }

function initialContext({ queue, deps }: RunInput): Context {
  const plan = queue.randomRun!
  return {
    queue,
    plan,
    deps,
    todo: plan.events.filter((e) => !e.done && !e.skipped),
    nudged: 0,
    drops: 0,
    lastActed: Math.max(0, ...plan.events.filter((e) => e.done).map((e) => Date.parse(e.done!) / 1000)),
    event: null,
    item: null,
    pauseMs: 0,
    answer: null,
    answeredAt: '',
    stop: null,
    result: null,
    crashed: false,
  }
}

function replanDrop(context: Context): void {
  const { event, todo, deps, drops } = context
  const seconds = uniform(deps.rng, DROP_WAIT_MIN_SECONDS, DROP_WAIT_MAX_SECONDS)
  event!.at = iso(deps.nowMs() / 1000 + seconds)
  todo.push(event!)
  todo.sort((a, b) => atSeconds(a) - atSeconds(b))
  deps.log(`[retrying] ${whatOf(context)}: the connection dropped with no answer from x (${saidOf(context.answer!).slice(0, 160)}), a network error, not x refusing. planned again at ${event!.at} (drop ${drops} of ${MAX_DROPS})`)
}

export const queueRunMachine = setup({
  types: {
    context: {} as Context,
    input: {} as RunInput,
    events: {} as RunEvent,
    output: {} as RunOutput,
  },
  actors: {
    awaitAdded: fromPromise(async ({ input }: { input: { deps: RunDeps; todo: PlanEvent[] } }): Promise<boolean> => awaitAdded(input.deps, input.todo)),
    pause: fromPromise(async ({ input }: { input: { deps: RunDeps; ms: number } }): Promise<void> => input.deps.sleep(input.ms)),
    waitDue: fromPromise(async ({ input }: { input: { deps: RunDeps; due: number; todo: PlanEvent[]; minGap: number } }): Promise<number> => waitUntil(input.deps, input.due, input.todo, input.minGap)),
    checkContext: fromPromise(async ({ input }: { input: { deps: RunDeps; item: QueueItem } }): Promise<string[]> => input.deps.contextChanged(input.item)),
    replanDrop: fromPromise(async ({ input }: { input: Context }): Promise<void> => replanDrop(input)),
    sendItem: fromPromise(async ({ input }: { input: { deps: RunDeps; item: QueueItem; kind: EventKind } }): Promise<TwitterSessionAnswer> => input.deps.send(input.item, input.kind)),
  },
  guards: {
    hasNext: ({ context }) => context.todo.length > 0,
    cannotTakeAdded: ({ context }) => !context.deps.takeAdded,
    notKeptOpen: ({ context }) => !context.deps.keepOpen,
    gotAdded: (_, added: boolean) => added,
    itemMissing: ({ context }) => !context.item,
    tooSoon: ({ context }) => !context.nudged && Boolean(context.lastActed) && dueOf(context) < context.lastActed + context.plan.minGap,
    nudgedNow: ({ context }) => Boolean(context.nudged),
    fellBehind: ({ context }) => waitOf(context) < -LATE_SECONDS,
    notYetDue: ({ context }) => waitOf(context) > 0,
    waitCancelled: (_, waited: number) => waited === CANCELLED,
    waitAdded: (_, waited: number) => waited === ADDED,
    waitNudged: (_, waited: number) => Boolean(waited),
    notReady: ({ context }) => context.item!.status !== (context.event!.kind === 'like' && context.item!.sentAtRun === context.plan.planned ? 'sent' : 'pending'),
    cancelled: ({ context }) => Boolean(context.deps.cancelled?.()),
    isLike: ({ context }) => context.event!.kind === 'like',
    contextMoved: (_, changed: string[]) => changed.length > 0,
    answerSent: ({ context }, answer: TwitterSessionAnswer) => succeeded(answer, context.event!.kind),
    postGone: (_, answer: TwitterSessionAnswer) => failureOf(answer) === 'gone',
    authorTooBig: (_, answer: TwitterSessionAnswer) => failureOf(answer) === 'tooBig',
    refusedByX: (_, answer: TwitterSessionAnswer) => failureOf(answer) !== 'network',
    droppedTooOften: ({ context }) => context.drops > MAX_DROPS,
  },
  actions: {
    mergeFirstAdded: ({ context }) => {
      if (context.deps.takeAdded) mergeAdded(context.todo, context.deps.takeAdded())
    },
    logStart: ({ context }) => context.deps.log(`random run: ${context.todo.length} events from @${context.queue.account}, approved by ${context.queue.approval!.by}, window ${context.plan.window}, stops on any refusal from x`),
    takeFirstNudge: assign(({ context }) => ({ nudged: context.deps.takeNudge() })),
    mergeTakenAdded: ({ context }) => mergeAdded(context.todo, context.deps.takeAdded!()),
    logKeptOpen: ({ context }) => context.deps.log('[waiting] nothing left to send: kept open for what gets added (queue add), stop it with jobCancel'),
    logAddedWhileOpen: ({ context }) => context.deps.log(`[waiting] ${context.todo.length} added, next at ${context.todo[0].at}`),
    takeEvent: assign(({ context }) => {
      const event = context.todo.shift()!
      return { event, item: context.queue.items.find((it) => it.n === event.n) ?? null }
    }),
    moveForGap: ({ context }) => {
      const { event, plan, todo, lastActed, deps } = context
      const due = atSeconds(event!)
      event!.at = iso(lastActed + plan.minGap + uniform(deps.rng, 0, Math.min(60, plan.minGap)))
      todo.push(event!)
      todo.sort((a, b) => atSeconds(a) - atSeconds(b))
      deps.log(`[waiting] #${event!.n} was due ${Math.round(lastActed + plan.minGap - due)}s too soon after the last send, moved to ${event!.at} to keep the ${plan.minGap}s gap`)
    },
    saveQueue: ({ context }) => context.deps.save(),
    drawPause: assign(({ context }) => ({ pauseMs: uniform(context.deps.rng, 20, 60) * 1000 })),
    logNudgedNow: ({ context }) => context.deps.log(`[waiting] nudged: ${context.event!.kind} #${context.event!.n} ${who(context)} now (was ${context.event!.at}, ${context.nudged} replies left in the nudge)`),
    logNext: ({ context }) => context.deps.log(`[waiting] next ${context.event!.kind} #${context.event!.n} ${who(context)} at ${context.event!.at}`),
    keepNudge: assign((_, waited: number) => ({ nudged: waited })),
    logNudgedWhileWaiting: ({ context }) => context.deps.log(`[waiting] nudged: ${context.event!.kind} #${context.event!.n} ${who(context)} now (was ${context.event!.at}, ${context.nudged} replies in the nudge)`),
    putBackForAdded: assign(({ context }) => {
      const due = dueOf(context)
      const added = context.todo.filter((e) => atSeconds(e) < due + context.plan.minGap)
      context.todo.push(context.event!)
      spaceOut(context.todo, context.plan.minGap, new Set(added))
      return { nudged: 0 }
    }),
    holdItem: ({ context }, changed: string[]) => {
      const { item, event, todo, deps } = context
      item!.status = 'held'
      item!.heldFor = changed
      item!.result = `contextChanged: ${changed.length} new since the draft`
      event!.skipped = 'held'
      dropPost(todo, event!.n, 'held')
      deps.alert(`HELD #${event!.n} ${who(context)}: something happened with them since the draft, so it wasn't sent. Redraft it from their full context (\`twitterDms\` { with }) and put it back with \`twitterQueueEdit\`. What changed: ${changed.join(' | ')}`, false)
    },
    keepAnswer: assign(({ context }, answer: TwitterSessionAnswer) => ({ answer, answeredAt: new Date(context.deps.nowMs()).toISOString() })),
    markAttempt: ({ context }) => {
      if (context.event!.kind === 'reply') context.item!.attemptedAt = context.answeredAt
    },
    recordSent: ({ context }) => {
      const { item, event, answer, answeredAt, queue, plan, deps } = context
      if (event!.kind === 'like') {
        item!.likedAt = answeredAt
        deps.log(`LIKED #${event!.n} ${who(context)}`)
        return
      }
      item!.status = 'sent'
      item!.sentId = answer!.tweetId ?? answer!.conversationId ?? null
      item!.sentUrl = sentUrlOf(queue, item!, answer!)
      item!.sentAtRun = plan.planned
      item!.result = JSON.stringify({ event: answer!.event, tweetId: answer!.tweetId, conversationId: answer!.conversationId })
      deps.log(`SENT #${event!.n} ${who(context)} ${item!.sentUrl ?? `dm ${item!.sentId}`}`)
    },
    countSent: assign(({ context }) => ({ nudged: context.event!.kind === 'like' ? context.nudged : Math.max(context.nudged - 1, 0), drops: 0, lastActed: context.deps.nowMs() / 1000 })),
    markDone: ({ context }) => {
      context.event!.done = context.answeredAt
    },
    noteFailure: ({ context }) => {
      context.item!.result = saidOf(context.answer!)
    },
    skipGone: ({ context }) => {
      const { item, event, todo, deps } = context
      if (item!.status === 'pending') item!.status = 'gone'
      event!.skipped = 'gone'
      dropPost(todo, event!.n, 'gone')
      deps.log(`GONE ${whatOf(context)}: post deleted, hidden or replies off, skipping it`)
    },
    skipTooBig: ({ context }) => {
      const { item, event, todo, deps, answer } = context
      if (item!.status === 'pending') item!.status = 'skipped'
      event!.skipped = 'tooBig'
      dropPost(todo, event!.n, 'tooBig')
      deps.log(`TOO BIG ${whatOf(context)}: ${answer!.detail ?? 'the author is over the follower cap'}, skipping it`)
    },
    keepRefusal: assign(({ context }) => ({ stop: { kind: 'refused' as const, what: whatOf(context), n: context.event!.n, failure: failureOf(context.answer!), refusal: refusalOf(context.answer!, context.deps.nowMs()) } })),
    countDrop: assign(({ context }) => ({ drops: context.drops + 1 })),
    haltDropped: assign(({ context }) => ({ stop: { kind: 'halt' as const, message: `${whatOf(context)}: the connection to x dropped ${context.drops} times in a row with no answer from x, the last at ${new Date(context.deps.nowMs()).toISOString().slice(0, 19).replace('T', ' ')} UTC: ${saidOf(context.answer!)}. #${context.event!.n} stays pending` } })),
    haltItemMissing: assign(({ context }) => ({ stop: { kind: 'halt' as const, message: `#${context.event!.n} is in the plan but not in the queue: plan it again` } })),
    haltFellBehind: assign(({ context }) => ({ stop: { kind: 'halt' as const, message: `fell behind: ${context.event!.kind} #${context.event!.n} was due at ${context.event!.at}, plan it again before running` } })),
    haltNotReady: assign(({ context }) => ({ stop: { kind: 'halt' as const, message: `#${context.event!.n} is ${context.item!.status}, not ready for its ${context.event!.kind}: plan it again` } })),
    stopWhileWaiting: assign(({ context }) => ({ stop: { kind: 'cancelled' as const, where: `while waiting for ${context.event!.kind} #${context.event!.n}` } })),
    stopBeforeSend: assign(({ context }) => ({ stop: { kind: 'cancelled' as const, where: `before ${context.event!.kind} #${context.event!.n}` } })),
    alertHalted: ({ context }) => {
      const stop = context.stop!
      if (stop.kind === 'refused') {
        const by = stop.failure === 'broken' ? 'the engine' : 'x'
        const why = stop.failure === 'auth' ? ' The session failed: log in to x again by hand.' : ''
        context.deps.alert(`REFUSED ${stop.what}: ${by} answered at ${stop.refusal.at.slice(0, 19).replace('T', ' ')} UTC: ${stop.refusal.code}: ${stop.refusal.detail.slice(0, 200)}.${why} The run stopped here: #${stop.n} stays pending and nothing more was sent. Nothing goes out on @${context.queue.account} until matt starts a run again (rule 94). (${sentTotal(context)} sent in total)`, true)
      } else if (stop.kind === 'halt') context.deps.alert(`[halted] ${stop.message} (${sentTotal(context)} sent in total)`, true)
    },
    settleHalted: assign(({ context }): { result: RunResult } => {
      const stop = context.stop!
      if (stop.kind !== 'refused') return { result: { state: 'halted', reason: stop.kind === 'halt' ? stop.message : 'cancelled', sent: sentTotal(context), skipped: skippedTotal(context) } }
      const by = stop.failure === 'broken' ? 'the engine' : 'x'
      return { result: { state: 'halted', reason: `${by} refused ${stop.what}: ${stop.refusal.code}: ${stop.refusal.detail.slice(0, 200)}`, sent: sentTotal(context), skipped: skippedTotal(context), refusal: stop.refusal } }
    }),
    logStopped: ({ context }) => {
      const stop = context.stop!
      if (stop.kind === 'cancelled') context.deps.log(`[waiting] cancelled ${stop.where}: nothing more is sent, ${sentTotal(context)} sent in total. Running it again resumes.`)
    },
    logFinished: ({ context }) => context.deps.log(`[finished] random run done: ${context.plan.events.filter((e) => e.kind === 'reply' && e.done).length} replies sent, ${skippedTotal(context)} skipped`),
    settleFinished: assign(({ context }): { result: RunResult } => ({ result: { state: 'finished', reason: null, sent: context.plan.events.filter((e) => e.kind === 'reply' && e.done).length, skipped: skippedTotal(context) } })),
    keepError: assign((_, error: unknown) => ({ crashed: true, error })),
  },
}).createMachine({
  id: 'twitterQueueRun',
  initial: 'planned',
  context: ({ input }) => initialContext(input),
  states: {
    planned: {
      on: { BEGIN: { target: 'waiting', actions: ['mergeFirstAdded', 'logStart', 'takeFirstNudge'] } },
    },
    waiting: {
      initial: 'taking',
      states: {
        taking: {
          always: [
            { guard: 'hasNext', target: 'choosing' },
            { guard: 'cannotTakeAdded', target: '#twitterQueueRun.finished' },
            { target: 'topped', actions: 'mergeTakenAdded' },
          ],
        },
        topped: {
          always: [
            { guard: 'hasNext', target: 'choosing' },
            { guard: 'notKeptOpen', target: '#twitterQueueRun.finished' },
            { target: 'keptOpen', actions: 'logKeptOpen' },
          ],
        },
        keptOpen: {
          invoke: {
            id: 'awaitAdded',
            src: 'awaitAdded',
            input: ({ context }) => ({ deps: context.deps, todo: context.todo }),
            onDone: [
              { guard: { type: 'gotAdded', params: ({ event }: { event: { output: boolean } }) => event.output }, target: 'choosing', actions: 'logAddedWhileOpen' },
              { target: '#twitterQueueRun.finished' },
            ],
            onError: crash,
          },
        },
        choosing: {
          entry: 'takeEvent',
          always: [
            { guard: 'itemMissing', target: '#twitterQueueRun.halted', actions: 'haltItemMissing' },
            { guard: 'tooSoon', target: 'taking', actions: ['moveForGap', 'saveQueue'] },
            { guard: 'nudgedNow', target: 'pausing', actions: 'drawPause' },
            { guard: 'fellBehind', target: '#twitterQueueRun.halted', actions: 'haltFellBehind' },
            { guard: 'notYetDue', target: 'sleeping', actions: 'logNext' },
            { target: 'ready' },
          ],
        },
        pausing: {
          invoke: {
            id: 'pause',
            src: 'pause',
            input: ({ context }) => ({ deps: context.deps, ms: context.pauseMs }),
            onDone: { target: 'ready', actions: 'logNudgedNow' },
            onError: crash,
          },
        },
        sleeping: {
          invoke: {
            id: 'waitDue',
            src: 'waitDue',
            input: ({ context }) => ({ deps: context.deps, due: dueOf(context), todo: context.todo, minGap: context.plan.minGap }),
            onDone: [
              { guard: { type: 'waitCancelled', params: waitedOf }, target: '#twitterQueueRun.stopped', actions: 'stopWhileWaiting' },
              { guard: { type: 'waitAdded', params: waitedOf }, target: 'taking', actions: 'putBackForAdded' },
              { guard: { type: 'waitNudged', params: waitedOf }, target: 'ready', actions: [{ type: 'keepNudge', params: waitedOf }, 'logNudgedWhileWaiting'] },
              { target: 'ready', actions: { type: 'keepNudge', params: waitedOf } },
            ],
            onError: crash,
          },
        },
        ready: {
          always: [
            { guard: 'notReady', target: '#twitterQueueRun.halted', actions: 'haltNotReady' },
            { guard: 'cancelled', target: '#twitterQueueRun.stopped', actions: 'stopBeforeSend' },
            { guard: 'isLike', target: '#twitterQueueRun.liking' },
            { target: 'checking' },
          ],
        },
        checking: {
          invoke: {
            id: 'checkContext',
            src: 'checkContext',
            input: ({ context }) => ({ deps: context.deps, item: context.item! }),
            onDone: [
              { guard: { type: 'contextMoved', params: changedOf }, target: 'taking', actions: [{ type: 'holdItem', params: changedOf }, 'saveQueue'] },
              { target: '#twitterQueueRun.replying' },
            ],
            onError: crash,
          },
        },
      },
    },
    liking: {
      invoke: {
        id: 'sendItem',
        src: 'sendItem',
        input: ({ context }) => ({ deps: context.deps, item: context.item!, kind: 'like' as const }),
        onDone: [
          { guard: { type: 'answerSent', params: answerOf }, target: 'waiting', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'recordSent', 'countSent', 'markDone', 'saveQueue'] },
          { guard: { type: 'postGone', params: answerOf }, target: 'waiting', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'noteFailure', 'skipGone', 'saveQueue'] },
          { guard: { type: 'authorTooBig', params: answerOf }, target: 'waiting', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'noteFailure', 'skipTooBig', 'saveQueue'] },
          { guard: { type: 'refusedByX', params: answerOf }, target: 'halted', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'noteFailure', 'keepRefusal'] },
          { target: 'retrying', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'noteFailure', 'countDrop'] },
        ],
        onError: crash,
      },
    },
    replying: {
      invoke: {
        id: 'sendItem',
        src: 'sendItem',
        input: ({ context }) => ({ deps: context.deps, item: context.item!, kind: 'reply' as const }),
        onDone: [
          { guard: { type: 'answerSent', params: answerOf }, target: 'waiting', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'recordSent', 'countSent', 'markDone', 'saveQueue'] },
          { guard: { type: 'postGone', params: answerOf }, target: 'waiting', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'noteFailure', 'skipGone', 'saveQueue'] },
          { guard: { type: 'authorTooBig', params: answerOf }, target: 'waiting', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'noteFailure', 'skipTooBig', 'saveQueue'] },
          { guard: { type: 'refusedByX', params: answerOf }, target: 'halted', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'noteFailure', 'keepRefusal'] },
          { target: 'retrying', actions: [{ type: 'keepAnswer', params: answerOf }, 'markAttempt', 'noteFailure', 'countDrop'] },
        ],
        onError: crash,
      },
    },
    retrying: {
      always: { guard: 'droppedTooOften', target: 'halted', actions: 'haltDropped' },
      invoke: {
        id: 'replanDrop',
        src: 'replanDrop',
        input: ({ context }) => context,
        onDone: { target: 'waiting', actions: 'saveQueue' },
        onError: crash,
      },
    },
    stopped: { type: 'final', entry: ['saveQueue', 'logStopped', 'settleHalted'] },
    halted: { type: 'final', entry: ['saveQueue', 'alertHalted', 'settleHalted'] },
    finished: { type: 'final', entry: ['saveQueue', 'logFinished', 'settleFinished'] },
    crashed: { type: 'final' },
  },
  output: ({ context }) => ({ result: context.result, crashed: context.crashed, ...(context.crashed ? { error: context.error } : {}) }),
})
