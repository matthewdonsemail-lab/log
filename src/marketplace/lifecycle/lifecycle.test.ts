import { describe, expect, test } from 'bun:test'
import { createActor, fromPromise, waitFor } from 'xstate'
import { lifecycleMachine, nextOnboardingStep } from './index'
import type { AccountStanding, LifecycleActorInputs, StepOutcome } from './types'

const FAST = { warmupMs: 5, activityGapMs: 1, watchIntervalMs: 1, retryMs: 1, limitedRestMs: 1 }

const fresh: AccountStanding = {
  accountId: 'erie',
  status: 'needsLogin',
  hasProxy: false,
  hasSession: false,
  profileSet: false,
  wantsName: true,
  named: false,
  locationSet: false,
  warmupStartedAt: null,
  warmedAt: null
}

type Script = Partial<Record<keyof LifecycleActorInputs, (input: never, call: number) => StepOutcome | Promise<StepOutcome>>>

/** Runs the machine with scripted actors: each returns ok unless the script says otherwise. */
function run(standing: AccountStanding, script: Script = {}, liveActions = false) {
  const calls: { name: string; input: unknown }[] = []
  const count: Record<string, number> = {}
  const actor = (name: keyof LifecycleActorInputs) =>
    fromPromise(async ({ input }: { input: unknown }) => {
      count[name] = (count[name] ?? 0) + 1
      calls.push({ name, input })
      const scripted = script[name]
      return scripted ? scripted(input as never, count[name]) : ({ kind: 'ok' } as StepOutcome)
    })
  const names: (keyof LifecycleActorInputs)[] = [
    'checkProxy', 'openBrowser', 'closeBrowser', 'signIn', 'checkAccount', 'setProfile', 'setName',
    'setLocation', 'warmupActivity', 'watchCheck', 'act', 'waitForActiveHours'
  ]
  const machine = lifecycleMachine.provide({ actors: Object.fromEntries(names.map((n) => [n, actor(n)])) as never })
  const a = createActor(machine, { input: { standing, liveActions, timing: FAST } })
  a.start()
  return { actor: a, calls, count, names: () => calls.map((c) => c.name) }
}

const inState = (a: ReturnType<typeof run>['actor'], path: string) => waitFor(a, (s) => s.matches(path as never), { timeout: 3000 })

describe('the account lifecycle (rule 35)', () => {
  test('a fresh account goes through onboarding and a day of warm-up in ONE open browser, then to its host', async () => {
    const r = run(fresh, {
      // The host's second check ends the day; the morning never comes in this test, so the night can be looked at.
      watchCheck: (_i, n) => (n >= 2 ? { kind: 'ok', endOfDay: true } : { kind: 'ok' }),
      waitForActiveHours: () => new Promise<StepOutcome>(() => {})
    })
    await inState(r.actor, 'host.overnight.rest')
    const ctx = r.actor.getSnapshot().context
    expect(r.names().slice(0, 7)).toEqual(['checkProxy', 'openBrowser', 'signIn', 'checkAccount', 'setProfile', 'setName', 'setLocation'])
    expect(ctx.trail.filter((t) => t.startsWith('warmup:'))).toEqual([
      'warmup:feedBrowse', 'warmup:marketplaceBrowse', 'warmup:createAccessCheck', 'warmup:sellingVisit', 'warmup:messagesVisit'
    ])
    // The whole of onboarding and the warm-up day ran in one browser: opened once, never closed until the night.
    expect(r.count.openBrowser).toBe(1)
    expect(ctx.browser.closes.map((c) => c.reason)).toEqual(['endOfActiveHours'])
    expect(ctx.trail).toContain('attached')
    expect(ctx.standing.warmedAt).not.toBeNull()
    r.actor.stop()
  })

  test('the night closes for a reason, the morning reopens, and the host carries on', async () => {
    const r = run({ ...fresh, hasProxy: true, hasSession: true, status: 'active', profileSet: true, named: true, locationSet: true, warmedAt: '2026-10-18T10:00:00Z' }, {
      watchCheck: (_i, n) => (n === 1 ? { kind: 'ok', endOfDay: true } : { kind: 'ok' })
    })
    await waitFor(r.actor, (s) => s.matches({ host: 'watching' } as never) && s.context.trail.includes('newDay'), { timeout: 3000 })
    const ctx = r.actor.getSnapshot().context
    expect(r.count.openBrowser).toBe(2)
    expect(ctx.browser.opensToday).toBe(1)
    expect(ctx.browser.closes.map((c) => c.reason)).toEqual(['endOfActiveHours'])
    r.actor.stop()
  })

  test('a checkpoint in the warm-up waits for a person, then resumes at the same activity, in the same browser', async () => {
    const r = run(fresh, {
      warmupActivity: (input: LifecycleActorInputs['warmupActivity'], n) =>
        input.activity === 'createAccessCheck' && n === 3 ? { kind: 'issue', issue: 'checkpointed' } : { kind: 'ok' }
    })
    await inState(r.actor, 'needsPerson')
    expect(r.actor.getSnapshot().context.warmup.done).toEqual(['feedBrowse', 'marketplaceBrowse'])
    r.actor.send({ type: 'PERSON_DONE' })
    await inState(r.actor, 'host')
    const ctx = r.actor.getSnapshot().context
    const activities = r.calls.filter((c) => c.name === 'warmupActivity').map((c) => (c.input as { activity: string }).activity)
    expect(activities).toEqual(['feedBrowse', 'marketplaceBrowse', 'createAccessCheck', 'createAccessCheck', 'sellingVisit', 'messagesVisit'])
    // The account was checked again after the person, and no second browser was opened.
    expect(r.count.checkAccount).toBe(2)
    expect(r.count.openBrowser).toBe(1)
    expect(ctx.browser.closes).toEqual([])
    r.actor.stop()
  })

  test("a restriction ends the lifecycle: the browser closes for that reason and the record stays (rule 13)", async () => {
    const r = run(fresh, { checkAccount: () => ({ kind: 'issue', issue: 'restrictedPolicy', detail: 'You can no longer request a review' }) })
    await inState(r.actor, 'restricted')
    const snap = r.actor.getSnapshot()
    expect(snap.status).toBe('done')
    expect(snap.context.browser.closes.map((c) => c.reason)).toEqual(['restricted'])
    expect(r.names()).not.toContain('setProfile')
  })

  test('a lost sign-in inside the host is fixed in the same browser and goes back to watching', async () => {
    const warmed = { ...fresh, hasProxy: true, hasSession: true, status: 'active', profileSet: true, named: true, locationSet: true, warmedAt: '2026-10-18T10:00:00Z' }
    const r = run(warmed, { watchCheck: (_i, n) => (n === 1 ? { kind: 'issue', issue: 'loginWall' } : { kind: 'ok' }) })
    await waitFor(r.actor, (s) => s.matches({ host: 'watching' } as never) && s.context.checks >= 2, { timeout: 3000 })
    expect(r.names().filter((n) => n === 'signIn')).toHaveLength(1)
    expect(r.count.openBrowser).toBe(1)
    r.actor.stop()
  })

  test('a crash reopens once; a second crash the same day needs a person (one open plus one reopen)', async () => {
    const warmed = { ...fresh, hasProxy: true, hasSession: true, status: 'active', profileSet: true, named: true, locationSet: true, warmedAt: '2026-10-18T10:00:00Z' }
    const r = run(warmed, { watchCheck: () => ({ kind: 'error', code: 'browserGone', retryable: false }) })
    await inState(r.actor, 'stuck')
    const ctx = r.actor.getSnapshot().context
    expect(r.count.openBrowser).toBe(2)
    expect(ctx.browser.closes.map((c) => c.reason)).toEqual(['crash', 'crash'])
    expect(ctx.lastError?.code).toBe('opensSpent')
  })

  test('an action is a tab in the open browser, never a launch', async () => {
    const warmed = { ...fresh, hasProxy: true, hasSession: true, status: 'active', profileSet: true, named: true, locationSet: true, warmedAt: '2026-10-18T10:00:00Z' }
    const r = run(warmed)
    await inState(r.actor, 'host.watching')
    r.actor.send({ type: 'ACT', action: { kind: 'publish', agencyListingId: 'readyOne', live: false } })
    await waitFor(r.actor, (s) => s.context.actions.length === 1, { timeout: 3000 })
    expect(r.names()).toContain('act')
    expect(r.count.openBrowser).toBe(1)
    r.actor.stop()
  })

  test('the likes in the warm-up only act when liveActions (rule 8)', async () => {
    const dry = run(fresh)
    await inState(dry.actor, 'host')
    expect(dry.calls.filter((c) => c.name === 'warmupActivity').every((c) => (c.input as { live: boolean }).live === false)).toBe(true)
    dry.actor.stop()
    const live = run(fresh, {}, true)
    await inState(live.actor, 'host')
    expect(live.calls.find((c) => c.name === 'warmupActivity')!.input).toMatchObject({ activity: 'feedBrowse', live: true })
    live.actor.stop()
  })

  test('a retryable error is tried once more, then the step is stuck', async () => {
    const r = run(fresh, { setName: () => ({ kind: 'error', code: 'formNotFound', retryable: true }) })
    await inState(r.actor, 'stuck')
    expect(r.count.setName).toBe(2)
  })

  test('accounts loaded from Twenty start where they are', async () => {
    const banned = run({ ...fresh, status: 'banned' })
    expect(banned.actor.getSnapshot().value).toBe('banned')
    expect(banned.calls).toEqual([])
    const paused = run({ ...fresh, status: 'paused', hasProxy: true })
    expect(paused.actor.getSnapshot().value).toBe('paused')
    paused.actor.send({ type: 'RESUME' })
    await waitFor(paused.actor, (s) => s.context.trail.includes('openBrowser'), { timeout: 3000 })
    paused.actor.stop()
  })

  test('SHUTDOWN closes the browser for that reason', async () => {
    const warmed = { ...fresh, hasProxy: true, hasSession: true, status: 'active', profileSet: true, named: true, locationSet: true, warmedAt: '2026-10-18T10:00:00Z' }
    const r = run(warmed)
    await inState(r.actor, 'host.watching')
    r.actor.send({ type: 'SHUTDOWN' })
    await inState(r.actor, 'stopped')
    expect(r.actor.getSnapshot().context.browser.closes.map((c) => c.reason)).toEqual(['shutdown'])
  })
})

describe('nextOnboardingStep', () => {
  const ctx = (standing: Partial<AccountStanding>, extra: { checked?: boolean; done?: string[]; startedAt?: number | null } = {}) => ({
    standing: { ...fresh, hasProxy: true, ...standing },
    checked: extra.checked ?? true,
    warmup: { startedAt: extra.startedAt ?? null, done: (extra.done ?? []) as never },
    timing: { ...FAST, warmupMs: 1000 },
    now: () => 10_000
  })
  test('the lane order: sign in, check, profile, name, location, warm-up, attached', () => {
    expect(nextOnboardingStep(ctx({}))).toBe('signingIn')
    expect(nextOnboardingStep(ctx({ hasSession: true, status: 'active' }, { checked: false }))).toBe('checkingAccount')
    expect(nextOnboardingStep(ctx({ hasSession: true, status: 'active' }))).toBe('settingProfile')
    expect(nextOnboardingStep(ctx({ hasSession: true, status: 'active', profileSet: true }))).toBe('settingName')
    expect(nextOnboardingStep(ctx({ hasSession: true, status: 'active', profileSet: true, wantsName: false }))).toBe('settingLocation')
    const ready = { hasSession: true, status: 'active', profileSet: true, named: true, locationSet: true }
    expect(nextOnboardingStep(ctx(ready))).toBe('warming')
    // Every activity ran but the day isn't over yet: still warming.
    const all = ['feedBrowse', 'marketplaceBrowse', 'createAccessCheck', 'sellingVisit', 'messagesVisit']
    expect(nextOnboardingStep({ ...ctx(ready, { done: all, startedAt: 9_500 }) })).toBe('warming')
    expect(nextOnboardingStep({ ...ctx(ready, { done: all, startedAt: 8_000 }) })).toBe('attached')
    expect(nextOnboardingStep(ctx({ ...ready, warmedAt: '2026-10-18T10:00:00Z' }))).toBe('attached')
  })
})
