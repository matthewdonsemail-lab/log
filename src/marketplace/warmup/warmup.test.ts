import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createActor, fromPromise, toPromise } from 'xstate'
import { WARMUP_ACTIVITIES } from '../lifecycle/types'
import { ACTIVITY_SCRIPTS, appendFeed, pickActivities, readFeed, renderFeedLine, SCRIPTS_IN_ORDER, warmupMachine } from './index'
import type { ActivityOutcome, WarmupActivity } from './index'

function run(outcomes: Partial<Record<WarmupActivity, ActivityOutcome>> = {}, activities: WarmupActivity[] = [...WARMUP_ACTIVITIES]) {
  const ran: WarmupActivity[] = []
  const machine = warmupMachine.provide({
    actors: {
      runActivity: fromPromise(async ({ input }: { input: { accountId: string; activity: WarmupActivity } }) => {
        ran.push(input.activity)
        return outcomes[input.activity] ?? ({ ok: true, steps: 3 } as ActivityOutcome)
      })
    }
  })
  const actor = createActor(machine, { input: { accountId: 'erie', activities, gapMs: 1 } })
  actor.start()
  return { actor, ran }
}

describe('the warm-up machine (rule 35)', () => {
  test("runs Listaro's five activities in its stage order, one after another", async () => {
    const { actor, ran } = run()
    const output = await toPromise(actor)
    expect(ran).toEqual(['feedBrowse', 'marketplaceBrowse', 'createAccessCheck', 'sellingVisit', 'messagesVisit'])
    expect(output).toEqual({ done: ran, failure: null, stopped: false, blocked: false })
  })

  test('a failed step stops the warm-up there, and says which activity and step', async () => {
    const { actor, ran } = run({ createAccessCheck: { ok: false, failedAt: 's03_gotoMarketplaceCreateItem', error: 'redirected' } })
    const output = await toPromise(actor)
    expect(ran).toEqual(['feedBrowse', 'marketplaceBrowse', 'createAccessCheck'])
    expect(output.failure).toEqual({ activity: 'createAccessCheck', failedAt: 's03_gotoMarketplaceCreateItem', error: 'redirected' })
    expect(output.stopped).toBe(true)
  })

  test("Erie's case: the first page was a checkpoint, so the warm-up is blocked there and goes no further", async () => {
    const { actor, ran } = run({ feedBrowse: { ok: false, failedAt: 's01_goto', error: 'checkpointed: Facebook sent the page to /checkpoint/1501092823525282/', issue: 'checkpointed' } })
    const output = await toPromise(actor)
    expect(ran).toEqual(['feedBrowse'])
    expect(output).toMatchObject({ blocked: true, failure: { activity: 'feedBrowse', issue: 'checkpointed' } })
    expect(actor.getSnapshot().value).toBe('blocked')
  })

  test('--only runs just those, and STOP ends it', async () => {
    const only = run({}, ['sellingVisit'])
    expect((await toPromise(only.actor)).done).toEqual(['sellingVisit'])
    const machine = warmupMachine.provide({ actors: { runActivity: fromPromise(() => new Promise<ActivityOutcome>(() => {})) } })
    const actor = createActor(machine, { input: { accountId: 'erie', activities: [...WARMUP_ACTIVITIES], gapMs: 1 } })
    actor.start()
    actor.send({ type: 'STOP' })
    expect((await toPromise(actor)).stopped).toBe(true)
  })
})

describe('the recording scripts', () => {
  test("follow Listaro's stages, and only the likes act on Facebook (rule 8)", () => {
    expect(SCRIPTS_IN_ORDER.map((s) => s.flow)).toEqual(['warmupFeedBrowse', 'warmupMarketplaceBrowse', 'warmupCreateAccessCheck', 'warmupSellingVisit', 'warmupMessagesVisit'])
    const live = SCRIPTS_IN_ORDER.flatMap((s) => s.steps.filter((x) => x.live).map((x) => `${s.activity}:${x.action} ${x.args.join(' ')}`))
    expect(live).toEqual(['feedBrowse:clickAny button ^Like$ 2-3'])
    expect(ACTIVITY_SCRIPTS.marketplaceBrowse.steps.find((s) => s.action === 'openAny')?.args).toEqual(['/marketplace/item/', '2-4'])
    // Every step only goes to Facebook.
    for (const s of SCRIPTS_IN_ORDER) for (const step of s.steps) if (step.action === 'goto') expect(step.args[0]).toMatch(/^https:\/\/www\.facebook\.com\//)
  })

  test('pickActivities keeps the stage order and names anything unknown', () => {
    expect(pickActivities('sellingVisit,feedBrowse')).toEqual({ ok: true, activities: ['feedBrowse', 'sellingVisit'] })
    expect(pickActivities('feedBrowse,dance')).toMatchObject({ ok: false, error: expect.stringContaining('dance') })
    expect(pickActivities(undefined)).toEqual({ ok: true, activities: [...WARMUP_ACTIVITIES] })
  })
})

describe('the activity feed', () => {
  test('lines are appended as they happen and read back per account', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'warmupFeed')), 'feed.jsonl')
    appendFeed({ at: '2026-10-19T18:00:00.000Z', account: 'erie', run: 'r1', event: 'activity', activity: 'feedBrowse', detail: '7 steps' }, path)
    appendFeed({ at: '2026-10-19T18:00:05.000Z', account: 'erie', run: 'r1', event: 'step', activity: 'feedBrowse', step: 's03_scroll', ok: true }, path)
    appendFeed({ at: '2026-10-19T18:00:06.000Z', account: 'reading', run: 'r2', event: 'start' }, path)
    expect(readFeed({ account: 'erie' }, path).map((l) => l.event)).toEqual(['activity', 'step'])
    expect(readFeed({}, path)).toHaveLength(3)
    expect(renderFeedLine(readFeed({ account: 'erie' }, path)[1])).toBe('18:00:05  erie            ✓ step     feedBrowse s03_scroll')
  })
})
