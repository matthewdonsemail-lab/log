import { createActor } from 'xstate'
import type { InspectionEvent } from 'xstate'
import type { TwitterSessionAnswer } from '../../account/session/index'
import type { PlanEvent, Queue, QueueItem, Rng } from '../plan/index'
import { approvalProblem, spaceOut } from '../plan/index'
import { queueRunMachine } from './machine'
import { networkError } from '../../live/feed/index'
import type { FailureKind, RunDeps, RunEvent, RunResult, XRefusal } from './types'
import { DROP_WAIT_MAX_SECONDS, DROP_WAIT_MIN_SECONDS, LATE_SECONDS, MAX_DROPS, POLL_SECONDS } from './types'

const uniform = (rng: Rng, low: number, high: number) => low + rng() * (high - low)

const iso = (seconds: number) => new Date(Math.round(seconds) * 1000).toISOString()

const atSeconds = (event: PlanEvent) => new Date(event.at).getTime() / 1000

export function failureOf(answer: TwitterSessionAnswer): FailureKind {
  if (answer.event === 'sessionDead' || answer.event === 'restricted' || answer.code === 'noSession') return 'auth'
  if (answer.event === 'gone') return 'gone'
  if (answer.event && answer.event !== 'failed') return 'refused'
  const said = `${answer.code ?? ''} ${answer.detail ?? ''}`
  if (answer.code === 'governorBlocked' || answer.code === 'rateLimited' || answer.httpStatus === 429 || /(?<!\d)429(?!\d)/.test(said)) return 'refused'
  if (networkError(said)) return 'network'
  return 'broken'
}

export function refusalOf(answer: TwitterSessionAnswer, nowMs: number): XRefusal {
  return { code: answer.code ?? answer.event ?? 'failed', detail: (answer.detail ?? '').slice(0, 300), at: new Date(nowMs).toISOString() }
}

export function succeeded(answer: TwitterSessionAnswer, kind: PlanEvent['kind']): boolean {
  if (!answer.ok || answer.event !== 'sent') return false
  return kind === 'like' ? answer.liked === true : Boolean(answer.tweetId || answer.conversationId)
}

export function dropPost(todo: PlanEvent[], n: number, why: string): void {
  for (const e of todo.filter((x) => x.n === n)) {
    e.skipped = why
    todo.splice(todo.indexOf(e), 1)
  }
}

const CANCELLED = -1

const ADDED = -2

export function mergeAdded(todo: PlanEvent[], added: readonly PlanEvent[], minGap = 0): void {
  todo.push(...added)
  if (minGap > 0 && added.length) spaceOut(todo, minGap, new Set(added))
  todo.sort((a, b) => atSeconds(a) - atSeconds(b))
}

async function waitUntil(deps: RunDeps, dueSeconds: number, todo?: PlanEvent[], minGap = 0): Promise<number> {
  let left = dueSeconds - deps.nowMs() / 1000
  while (left > 0) {
    await deps.sleep(Math.min(POLL_SECONDS, left) * 1000)
    if (deps.cancelled?.()) return CANCELLED
    const added = todo && deps.takeAdded ? deps.takeAdded() : []
    if (added.length) {
      mergeAdded(todo!, added, minGap)
      deps.log(`added ${added.length} to the queue while it runs, each fitted in its window and what was planned after it moved back to keep the gap: ${added.map((e) => `#${e.n} at ${e.at}`).join(', ')}`)
      if (added.some((e) => atSeconds(e) < dueSeconds + minGap)) return ADDED
    }
    const nudged = deps.takeNudge()
    if (nudged) return nudged
    left = dueSeconds - deps.nowMs() / 1000
  }
  return 0
}

export function sentUrlOf(queue: Queue, item: QueueItem, answer: TwitterSessionAnswer): string | null {
  return item.action === 'dm' ? null : `https://x.com/${queue.account}/status/${answer.tweetId}`
}

export async function runQueue(queue: Queue, deps: RunDeps, trace?: (event: InspectionEvent) => void): Promise<RunResult> {
  const refused = approvalProblem(queue)
  if (refused) throw new Error(refused)
  const plan = queue.randomRun
  if (!plan) throw new Error('no random plan: run queue plan first')
  const actor = createActor(queueRunMachine, trace ? { inspect: trace } : {})
  actor.start()
  const send = (event: RunEvent) => {
    actor.send(event)
    return String(actor.getSnapshot().value)
  }
  const state = () => String(actor.getSnapshot().value)
  const byN = { get: (n: number) => queue.items.find((it) => it.n === n) }
  const sentTotal = () => queue.items.filter((i) => i.status === 'sent').length
  const halt = (message: string): RunResult => {
    send({ type: 'FAIL' })
    deps.save()
    deps.alert(`[${state()}] ${message} (${sentTotal()} sent in total)`, true)
    return { state: 'halted', reason: message, sent: sentTotal(), skipped: plan.events.filter((e) => e.kind === 'reply' && e.skipped).length }
  }
  const stop = (where: string): RunResult => {
    deps.save()
    deps.log(`[${state()}] cancelled ${where}: nothing more is sent, ${sentTotal()} sent in total. Running it again resumes.`)
    return { state: 'halted', reason: 'cancelled', sent: sentTotal(), skipped: plan.events.filter((e) => e.kind === 'reply' && e.skipped).length }
  }
  const refusedStop = (what: string, n: number, answer: TwitterSessionAnswer, failure: FailureKind): RunResult => {
    const refusal = refusalOf(answer, deps.nowMs())
    send({ type: 'FAIL' })
    deps.save()
    const who = failure === 'broken' ? 'the engine' : 'x'
    const why = failure === 'auth' ? ' The session failed: log in to x again by hand.' : ''
    deps.alert(`REFUSED ${what}: ${who} answered at ${refusal.at.slice(0, 19).replace('T', ' ')} UTC: ${refusal.code}: ${refusal.detail.slice(0, 200)}.${why} The run stopped here: #${n} stays pending and nothing more was sent. Nothing goes out on @${queue.account} until matt starts a run again (rule 94). (${sentTotal()} sent in total)`, true)
    return { state: 'halted', reason: `${who} refused ${what}: ${refusal.code}: ${refusal.detail.slice(0, 200)}`, sent: sentTotal(), skipped: plan.events.filter((e) => e.kind === 'reply' && e.skipped).length, refusal }
  }
  const todo = plan.events.filter((e) => !e.done && !e.skipped)
  if (deps.takeAdded) mergeAdded(todo, deps.takeAdded())
  deps.log(`random run: ${todo.length} events from @${queue.account}, approved by ${queue.approval!.by}, window ${plan.window}, stops on any refusal from x`)
  send({ type: 'BEGIN' })
  let nudged = deps.takeNudge()
  let drops = 0
  let lastActed = Math.max(0, ...plan.events.filter((e) => e.done).map((e) => Date.parse(e.done!) / 1000))
  const more = async (): Promise<boolean> => {
    if (todo.length || !deps.takeAdded) return todo.length > 0
    mergeAdded(todo, deps.takeAdded())
    if (todo.length || !deps.keepOpen) return todo.length > 0
    deps.log(`[${state()}] nothing left to send: kept open for what gets added (queue add), stop it with jobCancel`)
    while (!todo.length) {
      await deps.sleep(POLL_SECONDS * 1000)
      if (deps.cancelled?.()) return false
      mergeAdded(todo, deps.takeAdded())
    }
    deps.log(`[${state()}] ${todo.length} added, next at ${todo[0].at}`)
    return true
  }
  while (await more()) {
    const event = todo.shift()!
    const item = byN.get(event.n)
    if (!item) return halt(`#${event.n} is in the plan but not in the queue: plan it again`)
    const due = atSeconds(event)
    if (!nudged && lastActed && due < lastActed + plan.minGap) {
      event.at = iso(lastActed + plan.minGap + uniform(deps.rng, 0, Math.min(60, plan.minGap)))
      todo.push(event)
      todo.sort((a, b) => atSeconds(a) - atSeconds(b))
      deps.log(`[${state()}] #${event.n} was due ${Math.round(lastActed + plan.minGap - due)}s too soon after the last send, moved to ${event.at} to keep the ${plan.minGap}s gap`)
      deps.save()
      continue
    }
    if (nudged) {
      await deps.sleep(uniform(deps.rng, 20, 60) * 1000)
      deps.log(`[${state()}] nudged: ${event.kind} #${event.n} @${item.handle ?? '?'} now (was ${event.at}, ${nudged} replies left in the nudge)`)
    } else {
      const wait = due - deps.nowMs() / 1000
      if (wait < -LATE_SECONDS) return halt(`fell behind: ${event.kind} #${event.n} was due at ${event.at}, plan it again before running`)
      if (wait > 0) {
        deps.log(`[${state()}] next ${event.kind} #${event.n} @${item.handle ?? '?'} at ${event.at}`)
        nudged = await waitUntil(deps, due, todo, plan.minGap)
        if (nudged === CANCELLED) return stop(`while waiting for ${event.kind} #${event.n}`)
        if (nudged === ADDED) {
          nudged = 0
          const added = todo.filter((e) => atSeconds(e) < due + plan.minGap)
          todo.push(event)
          spaceOut(todo, plan.minGap, new Set(added))
          continue
        }
        if (nudged) deps.log(`[${state()}] nudged: ${event.kind} #${event.n} @${item.handle ?? '?'} now (was ${event.at}, ${nudged} replies in the nudge)`)
      }
    }
    const ready = event.kind === 'like' && item.sentAtRun === plan.planned ? 'sent' : 'pending'
    if (item.status !== ready) return halt(`#${event.n} is ${item.status}, not ready for its ${event.kind}: plan it again`)
    if (deps.cancelled?.()) return stop(`before ${event.kind} #${event.n}`)
    if (event.kind === 'reply') {
      const changed = await deps.contextChanged(item)
      if (changed.length) {
        item.status = 'held'
        item.heldFor = changed
        item.result = `contextChanged: ${changed.length} new since the draft`
        event.skipped = 'held'
        dropPost(todo, event.n, 'held')
        deps.alert(`HELD #${event.n} @${item.handle ?? '?'}: something happened with them since the draft, so it wasn't sent. Redraft it from their full context (\`twitterDms\` { with }) and put it back with \`twitterQueueEdit\`. What changed: ${changed.join(' | ')}`, false)
        deps.save()
        continue
      }
    }
    send({ type: event.kind === 'like' ? 'LIKE_DUE' : 'REPLY_DUE' })
    const answer = await deps.send(item, event.kind)
    const now = new Date(deps.nowMs()).toISOString()
    if (event.kind === 'reply') item.attemptedAt = now
    if (succeeded(answer, event.kind)) {
      if (event.kind === 'like') {
        item.likedAt = now
        deps.log(`LIKED #${event.n} @${item.handle ?? '?'}`)
      } else {
        item.status = 'sent'
        item.sentId = answer.tweetId ?? answer.conversationId ?? null
        item.sentUrl = sentUrlOf(queue, item, answer)
        item.sentAtRun = plan.planned
        item.result = JSON.stringify({ event: answer.event, tweetId: answer.tweetId, conversationId: answer.conversationId })
        deps.log(`SENT #${event.n} @${item.handle ?? '?'} ${item.sentUrl ?? `dm ${item.sentId}`}`)
        nudged = Math.max(nudged - 1, 0)
      }
      drops = 0
      lastActed = deps.nowMs() / 1000
      event.done = now
      send({ type: 'ACTED' })
      deps.save()
      continue
    }
    const said = `${answer.code ?? answer.event ?? 'failed'}: ${(answer.detail ?? '').slice(0, 200)}`
    item.result = said
    const what = `${event.kind} #${event.n} @${item.handle ?? '?'}`
    const failure = failureOf(answer)
    if (failure === 'gone') {
      if (item.status === 'pending') item.status = 'gone'
      event.skipped = 'gone'
      dropPost(todo, event.n, 'gone')
      deps.log(`GONE ${what}: post deleted, hidden or replies off, skipping it`)
      send({ type: 'ACTED' })
      deps.save()
      continue
    }
    if (failure !== 'network') return refusedStop(what, event.n, answer, failure)
    drops += 1
    if (drops > MAX_DROPS) return halt(`${what}: the connection to x dropped ${drops} times in a row with no answer from x, the last at ${new Date(deps.nowMs()).toISOString().slice(0, 19).replace('T', ' ')} UTC: ${said}. #${event.n} stays pending`)
    const seconds = uniform(deps.rng, DROP_WAIT_MIN_SECONDS, DROP_WAIT_MAX_SECONDS)
    send({ type: 'DROPPED' })
    event.at = iso(deps.nowMs() / 1000 + seconds)
    todo.push(event)
    todo.sort((a, b) => atSeconds(a) - atSeconds(b))
    deps.log(`[retrying] ${what}: the connection dropped with no answer from x (${said.slice(0, 160)}), a network error, not x refusing. planned again at ${event.at} (drop ${drops} of ${MAX_DROPS})`)
    send({ type: 'RESUME' })
    deps.save()
  }
  send({ type: 'COMPLETE' })
  const sent = plan.events.filter((e) => e.kind === 'reply' && e.done).length
  const skipped = plan.events.filter((e) => e.kind === 'reply' && e.skipped).length
  deps.save()
  deps.log(`[${state()}] random run done: ${sent} replies sent, ${skipped} skipped`)
  return { state: 'finished', reason: null, sent, skipped }
}
