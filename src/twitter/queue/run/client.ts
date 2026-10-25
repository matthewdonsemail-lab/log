import { createActor } from 'xstate'
import type { InspectionEvent } from 'xstate'
import type { TwitterSessionAnswer } from '../../account/session/index'
import type { PlanEvent, Queue, QueueItem, Rng } from '../plan/index'
import { approvalProblem } from '../plan/index'
import { queueRunMachine } from './machine'
import type { FailureKind, RunDeps, RunEvent, RunResult } from './types'
import { COOL_BASE_SECONDS, COOL_CAP_SECONDS, DAY_SECONDS, LATE_SECONDS, MAX_COOLS, POLL_SECONDS } from './types'

const uniform = (rng: Rng, low: number, high: number) => low + rng() * (high - low)

const iso = (seconds: number) => new Date(Math.round(seconds) * 1000).toISOString()

const atSeconds = (event: PlanEvent) => new Date(event.at).getTime() / 1000

export function coolSeconds(k: number, nowSeconds: number, rng: Rng, reset?: number | null, daily = false): number {
  if (reset) return Math.max(reset - nowSeconds, 60) + uniform(rng, 30, 180)
  if (daily) return DAY_SECONDS + uniform(rng, 0, 1800)
  const step = Math.min(COOL_CAP_SECONDS, COOL_BASE_SECONDS * 2 ** k)
  return step / 2 + uniform(rng, 0, step / 2)
}

export function failureOf(answer: TwitterSessionAnswer): FailureKind {
  if (answer.event === 'sessionDead' || answer.event === 'restricted' || answer.code === 'noSession') return 'auth'
  if (answer.event === 'gone') return 'gone'
  if (answer.event || answer.code === 'governorBlocked' || answer.code === 'rateLimited') return 'throttle'
  return 'broken'
}

export function succeeded(answer: TwitterSessionAnswer, kind: PlanEvent['kind']): boolean {
  if (!answer.ok || answer.event !== 'sent') return false
  return kind === 'like' ? answer.liked === true : Boolean(answer.tweetId || answer.conversationId)
}

export function shiftRest(todo: PlanEvent[], nowSeconds: number, rng: Rng): void {
  if (!todo.length) return
  const by = nowSeconds + uniform(rng, 60, 300) - atSeconds(todo[0])
  if (by <= 0) return
  for (const e of todo) e.at = iso(atSeconds(e) + by)
}

export function requeue(todo: PlanEvent[], events: PlanEvent[], n: number, minGap: number, nowSeconds: number, rng: Rng): void {
  const mine = todo.filter((e) => e.n === n)
  for (const e of mine) todo.splice(todo.indexOf(e), 1)
  const gap = Math.max(minGap, 60)
  let last = Math.max(...todo.map(atSeconds), nowSeconds)
  for (const e of mine) {
    last += uniform(rng, gap, 2 * gap)
    e.at = iso(last)
    events.splice(events.indexOf(e), 1)
    events.push(e)
  }
  todo.push(...mine)
}

export function dropPost(todo: PlanEvent[], n: number, why: string): void {
  for (const e of todo.filter((x) => x.n === n)) {
    e.skipped = why
    todo.splice(todo.indexOf(e), 1)
  }
}

async function waitUntil(deps: RunDeps, dueSeconds: number): Promise<number> {
  let left = dueSeconds - deps.nowMs() / 1000
  while (left > 0) {
    await deps.sleep(Math.min(POLL_SECONDS, left) * 1000)
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
  const byN = new Map(queue.items.map((it) => [it.n, it]))
  const sentTotal = () => queue.items.filter((i) => i.status === 'sent').length
  const halt = (message: string): RunResult => {
    send({ type: 'FAIL' })
    deps.save()
    deps.alert(`[${state()}] ${message} (${sentTotal()} sent in total)`, true)
    return { state: 'halted', reason: message, sent: sentTotal(), skipped: plan.events.filter((e) => e.kind === 'reply' && e.skipped).length }
  }
  const todo = plan.events.filter((e) => !e.done && !e.skipped)
  deps.log(`random run: ${todo.length} events from @${queue.account}, approved by ${queue.approval!.by}, window ${plan.window}, cool-off on blocks`)
  send({ type: 'BEGIN' })
  let nudged = deps.takeNudge()
  let cools = 0
  while (todo.length) {
    const event = todo.shift()!
    const item = byN.get(event.n)
    if (!item) return halt(`#${event.n} is in the plan but not in the queue: plan it again`)
    const due = atSeconds(event)
    if (nudged) {
      await deps.sleep(uniform(deps.rng, 20, 60) * 1000)
      deps.log(`[${state()}] nudged: ${event.kind} #${event.n} @${item.handle ?? '?'} now (was ${event.at}, ${nudged} replies left in the nudge)`)
    } else {
      const wait = due - deps.nowMs() / 1000
      if (wait < -LATE_SECONDS) return halt(`fell behind: ${event.kind} #${event.n} was due at ${event.at}, plan it again before running`)
      if (wait > 0) {
        deps.log(`[${state()}] next ${event.kind} #${event.n} @${item.handle ?? '?'} at ${event.at}`)
        nudged = await waitUntil(deps, due)
        if (nudged) deps.log(`[${state()}] nudged: ${event.kind} #${event.n} @${item.handle ?? '?'} now (was ${event.at}, ${nudged} replies in the nudge)`)
      }
    }
    const ready = event.kind === 'like' && item.sentAtRun === plan.planned ? 'sent' : 'pending'
    if (item.status !== ready) return halt(`#${event.n} is ${item.status}, not ready for its ${event.kind}: plan it again`)
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
      cools = 0
      event.done = now
      send({ type: 'ACTED' })
      deps.save()
      continue
    }
    const said = `${answer.code ?? answer.event ?? 'failed'}: ${(answer.detail ?? '').slice(0, 200)}`
    item.result = said
    const what = `${event.kind} #${event.n} @${item.handle ?? '?'}`
    const failure = failureOf(answer)
    if (failure === 'auth') return halt(`${what}: the session failed, log in to x again by hand. ${said}`)
    if (failure === 'broken') return halt(`${what}: the engine refused it, nothing was sent. ${said}`)
    if (failure === 'gone') {
      if (item.status === 'pending') item.status = 'gone'
      event.skipped = 'gone'
      dropPost(todo, event.n, 'gone')
      deps.log(`GONE ${what}: post deleted, hidden or replies off, skipping it`)
      send({ type: 'ACTED' })
      deps.save()
      continue
    }
    event.fails = (event.fails ?? 0) + 1
    let retry: string
    if (event.fails >= 2) {
      event.skipped = 'blocked'
      if (event.kind === 'reply') {
        item.status = 'blocked'
        dropPost(todo, event.n, 'blocked')
      }
      retry = 'failed twice, skipping it'
    } else {
      todo.unshift(event)
      requeue(todo, plan.events, event.n, plan.minGap, deps.nowMs() / 1000, deps.rng)
      retry = 'retrying it once at the end'
    }
    if (cools >= MAX_COOLS) return halt(`${what} still blocked after ${MAX_COOLS} cool-offs in a row with nothing out. ${said}`)
    const reset = answer.rateLimitReset ?? null
    const seconds = coolSeconds(cools, deps.nowMs() / 1000, deps.rng, reset, answer.event === 'dailyLimit')
    cools += 1
    send({ type: 'COOL' })
    deps.save()
    const back = new Date(deps.nowMs() + seconds * 1000).toISOString().slice(11, 16)
    deps.alert(`[cooling] ${what}: x made no tweet or throttled (${retry}). cool-off ${cools} of ${MAX_COOLS}: ${Math.round(seconds / 60)} min${reset ? ' (x reset time)' : ''}, back at ${back} UTC. x said: ${said.slice(0, 160)}`, false)
    nudged = await waitUntil(deps, deps.nowMs() / 1000 + seconds)
    if (nudged) deps.log(`nudge ended the cool-off early (${nudged} replies)`)
    shiftRest(todo, deps.nowMs() / 1000, deps.rng)
    send({ type: 'RESUME' })
    deps.save()
    deps.log(`[${state()}] back from cool-off ${cools}, ${todo.length} events left, next at ${todo[0]?.at ?? '-'}`)
  }
  send({ type: 'COMPLETE' })
  const sent = plan.events.filter((e) => e.kind === 'reply' && e.done).length
  const skipped = plan.events.filter((e) => e.kind === 'reply' && e.skipped).length
  deps.save()
  deps.log(`[${state()}] random run done: ${sent} replies sent, ${skipped} skipped`)
  return { state: 'finished', reason: null, sent, skipped }
}
