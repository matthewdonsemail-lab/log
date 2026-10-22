import { describe, expect, test } from 'bun:test'
import { createActor, fromPromise, toPromise } from 'xstate'
import { classifySignal } from '../account/index'
import { detectHealth, evaluateRelist } from './helpers/index'
import { monitorMachine } from './machine'
import type { CheckOutcome, ListingHealth, MonitorInput, MonitorOutput, WatchedListing } from './index'
import { DEFAULT_RELIST_POLICY } from './types'

const FAST = { pollIntervalMs: 1, retryDelayMs: 1, limitedRestMs: 1 }
const listing = (listingId: string, generation = 0): WatchedListing => ({ listingId, title: listingId, knownStatus: 'active', generation })

async function runMonitor(outcomes: CheckOutcome[], input: Partial<MonitorInput> = {}) {
  let calls = 0
  const machine = monitorMachine.provide({
    actors: {
      check: fromPromise<CheckOutcome, { accountId: string }>(async () => {
        calls++
        const next = outcomes.shift()
        if (!next) throw new Error('no scripted outcome left')
        return next
      })
    }
  })
  const states: string[] = []
  const actor = createActor(machine, {
    input: { accountId: 'fbPacer', listings: [listing('a'), listing('b')], timing: FAST, ...input }
  })
  actor.subscribe((snapshot) => {
    const value = String(snapshot.value)
    if (states.at(-1) !== value) states.push(value)
  })
  actor.start()
  const output = (await toPromise(actor)) as MonitorOutput
  return { output, states, calls }
}

const ok = (seen: [string, ListingHealth][]): CheckOutcome => ({
  kind: 'ok',
  seen: seen.map(([listingId, health]) => ({ listingId, title: listingId, health })),
  needsAttention: [],
  issue: null
})

describe('evaluateRelist', () => {
  test('fatal states never repost', () => {
    for (const health of ['POLICY_VIOLATION', 'COMMERCE_BAN', 'CHECKPOINT_REQUIRED'] as const) {
      const decision = evaluateRelist(listing('a'), health, DEFAULT_RELIST_POLICY)
      expect(decision.shouldRepost).toBe(false)
      expect(decision.fatal).toBe(true)
    }
  })

  test('takedown reposts with a growing cooldown until the budget runs out', () => {
    expect(evaluateRelist(listing('a', 0), 'DUPLICATE_TAKEDOWN', DEFAULT_RELIST_POLICY)).toMatchObject({
      shouldRepost: true,
      cooldownMs: 3_600_000,
      nextGeneration: 1
    })
    expect(evaluateRelist(listing('a', 1), 'DELETED_BY_FB', DEFAULT_RELIST_POLICY).cooldownMs).toBe(10_800_000)
    expect(evaluateRelist(listing('a', 2), 'DELETED_BY_FB', DEFAULT_RELIST_POLICY)).toMatchObject({
      shouldRepost: false,
      health: 'RETRY_EXHAUSTED'
    })
  })

  test('dedup guard: no second repost while one is queued', () => {
    expect(evaluateRelist({ ...listing('a'), repostPending: true }, 'DELETED_BY_FB', DEFAULT_RELIST_POLICY).shouldRepost).toBe(false)
  })
})

describe('detectHealth', () => {
  test('missing listings are DELETED_BY_FB only when the scan looks complete', () => {
    expect(detectHealth([listing('a'), listing('b')], [{ listingId: 'a', health: 'ACTIVE' }])).toEqual([
      { listingId: 'a', health: 'ACTIVE' },
      { listingId: 'b', health: 'DELETED_BY_FB' }
    ])
    expect(detectHealth([listing('a')], [])[0].health).toBe('UNKNOWN')
    const many = ['a', 'b', 'c', 'd'].map((id) => listing(id))
    expect(detectHealth(many, [{ listingId: 'a', health: 'ACTIVE' }])[1].health).toBe('UNKNOWN')
  })
})

describe('classifySignal', () => {
  test('maps Listaro signals onto one account issue each', () => {
    expect(classifySignal({ url: 'https://www.facebook.com/checkpoint/123' })).toBe('checkpointed')
    expect(classifySignal({ url: 'https://www.facebook.com/login/?next=x' })).toBe('sessionExpired')
    expect(classifySignal({ text: "You can't buy or sell on Facebook" })).toBe('suspended')
    expect(classifySignal({ text: 'Please verify your identity' })).toBe('checkpointed')
    expect(classifySignal({ text: 'Limit reached, try again later' })).toBe('rateLimited')
    expect(classifySignal({ text: 'Your listings  Junk Clearance  Active' })).toBeNull()
    expect(classifySignal({ text: "What happened 9 Sep 2026 You can no longer request a review You couldn't create multiple sessions" })).toBe('restrictedPolicy')
    expect(classifySignal({ text: 'We added a restriction to your account. See why.' })).toBe('restrictedPolicy')
  })
})

describe('monitorMachine', () => {
  test('one healthy check ends in done with decisions', async () => {
    const { output, states } = await runMonitor([ok([['a', 'ACTIVE'], ['b', 'DUPLICATE_TAKEDOWN']])])
    expect(states).toEqual(['checking', 'done'])
    expect(output.stopReason).toBe('checks done')
    expect(output.decisions.find((d) => d.listingId === 'b')?.shouldRepost).toBe(true)
  })

  test('loops, and the second check does not queue the same repost again', async () => {
    const { output, states, calls } = await runMonitor(
      [ok([['a', 'ACTIVE'], ['b', 'DUPLICATE_TAKEDOWN']]), ok([['a', 'ACTIVE'], ['b', 'DUPLICATE_TAKEDOWN']])],
      { maxChecks: 2 }
    )
    expect(calls).toBe(2)
    expect(states).toEqual(['checking', 'waiting', 'checking', 'done'])
    expect(output.decisions.find((d) => d.listingId === 'b')).toMatchObject({ shouldRepost: false, reason: 'repost already queued' })
  })

  test('a transient error gets one quick retry, which does not count as a new check', async () => {
    const error: CheckOutcome = { kind: 'error', code: 'crashed', detail: 'TimeoutError: nav timeout', retryable: true }
    const { output, states, calls } = await runMonitor([error, ok([['a', 'ACTIVE'], ['b', 'ACTIVE']])])
    expect(calls).toBe(2)
    expect(states).toEqual(['checking', 'retrying', 'checking', 'done'])
    expect(output.checks).toBe(1)
  })

  test('circuit breaker trips after the same error 3 times in a row', async () => {
    const error = (): CheckOutcome => ({ kind: 'error', code: 'crashed', detail: 'x', retryable: true })
    const { output, calls } = await runMonitor([error(), error(), error()], { maxChecks: 0 })
    expect(calls).toBe(3)
    expect(output.stopReason).toContain('circuit breaker')
  })

  test('account issues stop the account; a rate limit rests, then checks again', async () => {
    const blocked = await runMonitor([{ kind: 'issue', issue: 'checkpointed', detail: 'x' }])
    expect(blocked.states.at(-1)).toBe('blocked')
    expect(blocked.output.issue).toBe('checkpointed')
    const limited = await runMonitor(
      [{ kind: 'issue', issue: 'rateLimited', detail: 'x' }, ok([['a', 'ACTIVE'], ['b', 'ACTIVE']])],
      { maxChecks: 2 }
    )
    expect(limited.states).toEqual(['checking', 'resting', 'checking', 'done'])
  })

  test('STOP ends a forever loop', async () => {
    const machine = monitorMachine.provide({
      actors: { check: fromPromise<CheckOutcome, { accountId: string }>(async () => ok([])) }
    })
    const actor = createActor(machine, {
      input: { accountId: 'fbPacer', listings: [], maxChecks: 0, timing: { ...FAST, pollIntervalMs: 60_000 } }
    })
    actor.start()
    await new Promise((resolve) => setTimeout(resolve, 10))
    actor.send({ type: 'STOP' })
    expect(((await toPromise(actor)) as MonitorOutput).stopReason).toBe('stopped')
  })
})
