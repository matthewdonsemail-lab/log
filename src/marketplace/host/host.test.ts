import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fromPromise } from 'xstate'
import type { AccountStanding, StepOutcome } from '../lifecycle/types'
import { readProgress, resumeFrom, runHost, sendControl } from './index'
import type { MilestoneField } from './index'

const FAST = { warmupMs: 5, activityGapMs: 1, watchIntervalMs: 1, retryMs: 1, limitedRestMs: 1 }
const fresh = (accountId: string): AccountStanding => ({
  accountId, status: 'needsLogin', hasProxy: true, hasSession: false, profileSet: false, wantsName: false,
  named: false, locationSet: false, warmupStartedAt: null, warmedAt: null
})

function steps(script: Record<string, (input: never, n: number) => StepOutcome | Promise<StepOutcome>> = {}) {
  const calls: { name: string; input: unknown }[] = []
  const count: Record<string, number> = {}
  const names = ['checkProxy', 'openBrowser', 'closeBrowser', 'signIn', 'checkAccount', 'setProfile', 'setName', 'setLocation', 'warmupActivity', 'watchCheck', 'act', 'waitForActiveHours']
  const actors = Object.fromEntries(names.map((name) => [name, fromPromise(async ({ input }: { input: unknown }) => {
    count[name] = (count[name] ?? 0) + 1
    calls.push({ name, input })
    return script[name] ? script[name](input as never, count[name]) : ({ kind: 'ok' } as StepOutcome)
  })]))
  return { actors, calls, count }
}

function host(account: string, s: ReturnType<typeof steps>, saved: Partial<Record<MilestoneField, string>>[] = []) {
  return runHost({
    account, standing: fresh(account), liveActions: false, actors: s.actors, today: '2026-10-19', timing: FAST, pollMs: 5,
    saveFields: async (fields) => void saved.push(fields)
  })
}

describe('the host runner (rule 35)', () => {
  test('runs the lifecycle in one browser, saving progress and each milestone to Twenty', async () => {
    process.env.LOG_HOST_DIR = mkdtempSync(join(tmpdir(), 'logHost'))
    const s = steps({ watchCheck: () => ({ kind: 'issue', issue: 'restrictedPolicy' }) })
    const saved: Partial<Record<MilestoneField, string>>[] = []
    const result = await host('reading', s, saved).done
    expect(result.state).toBe('restricted')
    expect(s.count.openBrowser).toBe(1)
    const progress = readProgress('reading')!
    expect(progress.state).toBe('restricted')
    expect(progress.resume.warmupDone).toHaveLength(5)
    expect(progress.resume.opensToday).toBe(1)
    const keys = saved.flatMap((f) => Object.keys(f))
    for (const k of ['profileSetAt', 'marketplaceLocationAt', 'warmupStartedAt', 'warmedAt', 'lifecycleState']) expect(keys).toContain(k)
    expect(saved.map((f) => f.lifecycleState).filter(Boolean)).toContain('host.watching')
  })

  test('a host stopped in the warm-up resumes at the next activity, in a fresh browser, with the day’s opens counted', async () => {
    process.env.LOG_HOST_DIR = mkdtempSync(join(tmpdir(), 'logHost'))
    const first = steps({ warmupActivity: (input: { activity: string }) => (input.activity === 'createAccessCheck' ? new Promise<StepOutcome>(() => {}) : { kind: 'ok' }) })
    const one = host('erie', first)
    await new Promise((r) => setTimeout(r, 60))
    sendControl('erie', { type: 'SHUTDOWN' })
    expect((await one.done).state).toBe('stopped')
    expect(readProgress('erie')!.resume.warmupDone).toEqual(['feedBrowse', 'marketplaceBrowse'])
    expect(readProgress('erie')!.closes.map((c) => c.reason)).toEqual(['shutdown'])

    const second = steps({ watchCheck: () => ({ kind: 'issue', issue: 'accountDisabled' }) })
    const result = await host('erie', second).done
    const activities = second.calls.filter((c) => c.name === 'warmupActivity').map((c) => (c.input as { activity: string }).activity)
    expect(activities).toEqual(['createAccessCheck', 'sellingVisit', 'messagesVisit'])
    expect(result.state).toBe('banned')
    expect(readProgress('erie')!.resume.opensToday).toBe(2)
  })

  test('resumeFrom: the warm-up carries over; the opens only within the same local day', () => {
    const p = { resume: { warmupDone: ['feedBrowse'], warmupStartedAt: 5, opensToday: 2 }, day: '2026-10-19' } as never
    expect(resumeFrom(p, '2026-10-19')).toEqual({ warmupDone: ['feedBrowse'], warmupStartedAt: 5, opensToday: 2 })
    expect(resumeFrom(p, '2026-10-20')).toEqual({ warmupDone: ['feedBrowse'], warmupStartedAt: 5, opensToday: 0 })
    expect(resumeFrom(null, '2026-10-19')).toBeUndefined()
  })

  test('a checkpoint waits for a person; PERSON_DONE through the control file carries on in the same browser', async () => {
    process.env.LOG_HOST_DIR = mkdtempSync(join(tmpdir(), 'logHost'))
    const s = steps({
      signIn: (_i, n) => (n === 1 ? { kind: 'issue', issue: 'checkpointed' } : { kind: 'ok' }),
      watchCheck: () => ({ kind: 'issue', issue: 'restrictedPolicy' })
    })
    const run = host('harrisburg', s)
    await new Promise((r) => setTimeout(r, 40))
    expect(readProgress('harrisburg')!.state).toBe('needsPerson')
    sendControl('harrisburg', { type: 'PERSON_DONE' })
    expect((await run.done).state).toBe('restricted')
    expect(s.count.openBrowser).toBe(1)
  })
})
