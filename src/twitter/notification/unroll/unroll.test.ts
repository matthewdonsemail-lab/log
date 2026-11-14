import { describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createActor, toPromise } from 'xstate'
import type { TwitterEngineRun, TwitterEngineSpec, TwitterSessionAnswer } from '../../account/session/index'
import { engagerSummaryOf, postEngagerSummaryOf, unrollCandidatesOf } from '../feed/index'
import type { EngagerKind, NotificationStore, TwitterNotification } from '../feed/index'
import { engagerLine, notificationUnrollMachine, runNotificationUnroll, unrollReportOf } from './index'
import type { UnrollInput } from './index'

const python = join(import.meta.dir, '..', '..', '..', '..', 'python')

const SCRIPT = String.raw`
import asyncio, json, os, sys, types
sys.path.insert(0, os.path.join(os.getcwd(), "twitterApi"))
import engine
from twikit import Client
from twikit.client import gql
from twikit.errors import TooManyRequests
from twikit.utils import Result
from twitterApi import notifications as feed

ME = "100"
cookies = {"twid": "u%3D100"}

def user(i):
    return types.SimpleNamespace(id=i, screen_name=f"user{i}", name=f"User {i}", followers_count=int(i))

LIKERS = {None: (["2", "8", "9"], "c1"), "c1": (["10", ME], "c2"), "c2": ([], "c3")}
REPOSTERS = {None: (["6", "11"], None)}

calls = []

class FakeClient:
    def __init__(self, fail_on="never"):
        self.fail_on = fail_on
    async def page(self, kind, table, post_id, count, cursor):
        calls.append([kind, post_id, count, cursor])
        if cursor == self.fail_on:
            raise TooManyRequests("429")
        ids, nxt = table[cursor]
        return Result([user(i) for i in ids], None, nxt)
    async def get_favoriters(self, post_id, count=40, cursor=None):
        return await self.page("like", LIKERS, post_id, count, cursor)
    async def get_retweeters(self, post_id, count=40, cursor=None):
        return await self.page("repost", REPOSTERS, post_id, count, cursor)

class FakeGovernor:
    paced = 0
    def before_request(self, is_mutation=False, quiet=False):
        FakeGovernor.paced += 1

async def no_sleep(_):
    return None

engine.asyncio.sleep = no_sleep

def seed(account):
    rows = {
        "like:2:900": {"key": "like:2:900", "kind": "like", "at": "2026-11-01T10:00:00Z", "userId": "2", "handle": "user2", "followsYou": True, "postId": "900", "postText": "we got in", "postUrl": "https://x.com/xtwo/status/900", "notificationId": "n1", "message": "user2 and 4 others liked your post"},
        "like:3:900": {"key": "like:3:900", "kind": "like", "at": "2026-11-01T10:00:00Z", "userId": "3", "handle": "user3", "postId": "900", "postText": "we got in", "postUrl": "https://x.com/xtwo/status/900", "notificationId": "n1", "message": "user2 and 4 others liked your post"},
    }
    feed.write_store(engine.notifications_path(account), {"version": 1, "userId": ME, "bottomCursor": "b1", "historyDone": False, "syncedAt": "2026-11-01T11:00:00Z", "rows": rows})

def spec(account, kind, pages=None):
    return {"account": account, "screenName": "xtwo", "postId": "900", "kind": kind, **({"pages": pages} if pages else {})}

def user_entry(i):
    return {"entryId": f"user-{i}", "content": {"itemContent": {"user_results": {"result": {"rest_id": i, "core": {"screen_name": f"user{i}", "name": f"User {i}"}, "legacy": {"followers_count": 7}}}}}}

def cursor_entry(side, value):
    return {"entryId": f"cursor-{side}-1", "content": {"entryType": "TimelineTimelineCursor", "value": value, "cursorType": side.capitalize()}}

def timeline(entries):
    return {"data": {"favoriters_timeline": {"timeline": {"instructions": [{"type": "TimelineAddEntries", "entries": entries}]}}}}

async def parsed(entries):
    async def f(tweet_id, count, cursor):
        return (timeline(entries) if entries is not None else {"data": {}}), None
    page = await Client.__new__(Client)._get_tweet_engagements("900", 40, None, f)
    return {"ids": [u.id for u in page], "handles": [u.screen_name for u in page], "next": page.next_cursor}

out = {}

async def main():
    out["vendorPage"] = await parsed([user_entry("2"), user_entry("8"), cursor_entry("top", "t1"), cursor_entry("bottom", "c1")])
    out["vendorEnd"] = await parsed([cursor_entry("top", "t2"), cursor_entry("bottom", "c9")])
    out["vendorOneCursor"] = await parsed([user_entry("2"), cursor_entry("bottom", "c1")])
    out["vendorNoCursor"] = await parsed([user_entry("2")])
    out["vendorNothing"] = await parsed(None)

    seed("unknown")
    gql.set_live_operations({"operations": {"NotificationsTimeline": {"queryId": "q", "features": []}}})
    out["unknown"] = await engine.post_engagers(FakeClient(), cookies, spec("unknown", "like"), FakeGovernor())
    out["unknownCalls"] = list(calls); calls.clear()

    gql.set_live_operations({"operations": {"Favoriters": {"queryId": "f", "features": []}, "Retweeters": {"queryId": "r", "features": []}}})
    seed("whole")
    out["whole"] = await engine.post_engagers(FakeClient(), cookies, spec("whole", "like"), FakeGovernor())
    out["wholeCalls"] = list(calls); calls.clear()
    out["wholePaced"] = FakeGovernor.paced
    out["reposts"] = await engine.post_engagers(FakeClient(), cookies, spec("whole", "repost"), FakeGovernor())
    calls.clear()
    out["wholeStore"] = feed.read_store(engine.notifications_path("whole"))
    held = feed.read_store(engine.notifications_path("whole"))
    feed.add_rows(held, [{"key": "like:8:900", "kind": "like", "at": "2026-11-02T09:00:00Z", "userId": "8", "handle": "user8", "followsYou": True, "postId": "900", "notificationId": "n7", "message": "user8 liked your post", "source": "notification"}])
    out["namedLater"] = {"row": held["rows"]["like:8:900"], "counts": feed.engager_counts(held, "900", "like")}

    seed("capped")
    out["capped"] = await engine.post_engagers(FakeClient(), cookies, spec("capped", "like", 1), FakeGovernor())
    out["cappedProgress"] = feed.read_store(engine.notifications_path("capped"))["engagements"]["900"]["like"]
    calls.clear()
    out["resumed"] = await engine.post_engagers(FakeClient(), cookies, spec("capped", "like"), FakeGovernor())
    out["resumedCalls"] = list(calls); calls.clear()
    out["again"] = await engine.post_engagers(FakeClient(), cookies, spec("capped", "like", 1), FakeGovernor())
    out["againCalls"] = list(calls); calls.clear()

    seed("throttled")
    out["throttled"] = await engine.post_engagers(FakeClient(fail_on="c1"), cookies, spec("throttled", "like"), FakeGovernor())
    out["throttledStore"] = feed.read_store(engine.notifications_path("throttled"))
    calls.clear()
    out["afterThrottle"] = await engine.post_engagers(FakeClient(), cookies, spec("throttled", "like"), FakeGovernor())
    out["afterThrottleCalls"] = list(calls); calls.clear()

    out["refusedSpec"] = engine.refusal_of({"action": "postEngagers", "postId": "nope", "kind": "like"})
    out["isRead"] = "postEngagers" in engine.READS

asyncio.run(main())
print(json.dumps(out, default=str))
`

describe("the engine pages a post's likers and reposters into the notifications store", () => {
  const state = mkdtempSync(join(tmpdir(), 'unroll'))
  const run = spawnSync(process.env.LOG_PYTHON || 'python', ['-c', SCRIPT], { cwd: python, encoding: 'utf8', env: { ...process.env, LOG_TWITTER_STATE: state } })
  const out = JSON.parse(run.stdout.trim().split('\n').pop() || '{}')

  test("the vendored engagements page gives its people and its bottom cursor, and a page with no people, one cursor or none never breaks", () => {
    expect(run.stderr.includes('Traceback') ? run.stderr : '').toBe('')
    expect(run.status).toBe(0)
    expect(out.vendorPage).toEqual({ ids: ['2', '8'], handles: ['user2', 'user8'], next: 'c1' })
    expect(out.vendorEnd).toEqual({ ids: [], handles: [], next: 'c9' })
    expect(out.vendorOneCursor).toEqual({ ids: ['2'], handles: ['user2'], next: 'c1' })
    expect(out.vendorNoCursor).toMatchObject({ ids: ['2'], next: null })
    expect(out.vendorNothing).toEqual({ ids: [], handles: [], next: null })
  })

  test("without X's live Favoriters operation the read refuses and X is not called", () => {
    expect(out.unknown).toMatchObject({ ok: false, code: 'engagersOperationUnknown', postId: '900', kind: 'like' })
    expect(out.unknownCalls).toEqual([])
  })

  test("the unroll adds the people the notification did not name, to the end of the list, one governor check between pages", () => {
    expect(out.wholeCalls).toEqual([['like', '900', 40, null], ['like', '900', 40, 'c1'], ['like', '900', 40, 'c2']])
    expect(out.wholePaced).toBe(2)
    expect(out.whole).toMatchObject({ ok: true, postId: '900', kind: 'like', engagerSync: { pages: 3, newRows: 3, resumed: false, done: true, stoppedBy: 'end', counts: { fromNotifications: 2, addedByUnroll: 3, total: 5 } } })
    const rows = out.wholeStore.rows as Record<string, TwitterNotification>
    expect(rows['like:9:900']).toMatchObject({ kind: 'like', at: null, handle: 'user9', postId: '900', postText: 'we got in', postUrl: 'https://x.com/xtwo/status/900', source: 'engagements' })
    expect(rows['like:100:900']).toBeUndefined()
    expect(out.wholeStore.engagements['900'].like).toMatchObject({ cursor: null, done: true, pages: 3, seen: 5, added: 3, ownAction: true })
    expect(out.reposts.engagerSync).toMatchObject({ pages: 1, done: true, counts: { fromNotifications: 0, addedByUnroll: 2, total: 2 } })
  })

  test("a person in both the notification and the list is one row that keeps its time, and the version 1 store's rows are all kept", () => {
    const rows = out.wholeStore.rows as Record<string, TwitterNotification>
    expect(Object.keys(rows).filter((key) => key.startsWith('like:2:'))).toEqual(['like:2:900'])
    expect(rows['like:2:900']).toMatchObject({ at: '2026-11-01T10:00:00Z', followsYou: true, notificationId: 'n1' })
    expect(rows['like:2:900']!.source).toBeUndefined()
    expect(rows['like:3:900']).toMatchObject({ at: '2026-11-01T10:00:00Z' })
    expect(out.wholeStore).toMatchObject({ version: 1, bottomCursor: 'b1', syncedAt: '2026-11-01T11:00:00Z' })
    expect(out.namedLater.row).toMatchObject({ at: '2026-11-02T09:00:00Z', source: 'notification', notificationId: 'n7', followsYou: true })
    expect(out.namedLater.counts).toEqual({ fromNotifications: 3, addedByUnroll: 2, total: 5 })
  })

  test("a read stopped by its page cap keeps its cursor and the next read goes on from it; a finished list is read again from the top", () => {
    expect(out.capped.engagerSync).toMatchObject({ pages: 1, done: false, stoppedBy: 'pageCap', counts: { fromNotifications: 2, addedByUnroll: 2, total: 4 } })
    expect(out.cappedProgress).toMatchObject({ cursor: 'c1', done: false, pages: 1 })
    expect(out.resumedCalls).toEqual([['like', '900', 40, 'c1'], ['like', '900', 40, 'c2']])
    expect(out.resumed.engagerSync).toMatchObject({ pages: 2, newRows: 1, resumed: true, done: true, counts: { total: 5 } })
    expect(out.againCalls).toEqual([['like', '900', 40, null]])
    expect(out.again.engagerSync).toMatchObject({ resumed: false, newRows: 0 })
  })

  test("a 429 ends the read there with the rows and the place kept, and nothing is asked again in that call", () => {
    expect(out.throttled).toMatchObject({ ok: false, code: 'rateLimited', event: 'throttled', postId: '900', kind: 'like' })
    expect(out.throttled.detail).toContain('4 likers of it are kept')
    expect(Object.keys(out.throttledStore.rows).sort()).toEqual(['like:2:900', 'like:3:900', 'like:8:900', 'like:9:900'])
    expect(out.throttledStore.engagements['900'].like).toMatchObject({ cursor: 'c1', done: false })
    expect(out.afterThrottleCalls[0]).toEqual(['like', '900', 40, 'c1'])
    expect(out.afterThrottle.engagerSync).toMatchObject({ resumed: true, done: true })
  })

  test("the engine counts it as a read and refuses a call without a post id", () => {
    expect(out.isRead).toBe(true)
    expect(out.refusedSpec).toMatchObject({ ok: false, code: 'targetMissing' })
  })
})

const NOTE = 'someone and 12 others liked your post'

function row(kind: EngagerKind, userId: string, postId: string, extra: Partial<TwitterNotification> = {}): TwitterNotification {
  return { key: `${kind}:${userId}:${postId}`, kind, at: '2026-11-01T10:00:00Z', userId, handle: `user${userId}`, postId, postUrl: `https://x.com/xTwo/status/${postId}`, notificationId: `n${postId}${kind}`, message: NOTE, source: 'notification', ...extra }
}

function storeOf(rows: TwitterNotification[], engagements: NotificationStore['engagements'] = {}): NotificationStore {
  return { version: 1, userId: '100', bottomCursor: null, historyDone: false, syncedAt: '2026-11-01T13:00:00Z', rows: Object.fromEntries(rows.map((r) => [r.key, r])), engagements }
}

const FEED: TwitterSessionAnswer = { ok: true, loginState: 'loggedIn', notificationSync: { mode: 'newest', pages: 1, newRows: 0, total: 2, historyDone: false, stoppedBy: 'caughtUp', syncedAt: '2026-11-01T13:00:00Z' } }

type Script = (spec: TwitterEngineSpec, store: NotificationStore) => TwitterSessionAnswer

function stubbed(store: NotificationStore, script: Script) {
  const calls: TwitterEngineSpec[] = []
  const lines: string[] = []
  const engine = async (spec: TwitterEngineSpec): Promise<TwitterEngineRun> => {
    calls.push(spec)
    return { answer: script(spec, store), refreshed: null }
  }
  return { calls, lines, deps: { engine, readStore: () => store, log: (line: string) => lines.push(line) } }
}

function pageOf(store: NotificationStore, spec: TwitterEngineSpec, userIds: string[], done: boolean): TwitterSessionAnswer {
  const kind = spec.kind!
  let newRows = 0
  for (const id of userIds) {
    const key = `${kind}:${id}:${spec.postId}`
    if (store.rows[key]) continue
    store.rows[key] = { key, kind, at: null, userId: id, handle: `user${id}`, postId: spec.postId!, source: 'engagements' }
    newRows += 1
  }
  const held = store.engagements![spec.postId!] ?? {}
  const pages = (held[kind]?.pages ?? 0) + 1
  store.engagements![spec.postId!] = { ...held, [kind]: { cursor: done ? null : `c${pages}`, done, pages, seen: userIds.length, added: newRows, syncedAt: '2026-11-04T00:00:00Z' } }
  return { ok: true, loginState: 'loggedIn', postId: spec.postId, kind, engagerSync: { postId: spec.postId!, kind, pages: 1, newRows, resumed: pages > 1, done, stoppedBy: done ? 'end' : 'pageCap', counts: { fromNotifications: 0, addedByUnroll: 0, total: 0 }, syncedAt: '2026-11-04T00:00:00Z' } }
}

const INPUT: UnrollInput = { account: 'xTwo', storePath: 'unused', full: false, everyPost: false, unrollPages: 40 }

async function statesOf(deps: Parameters<typeof notificationUnrollMachine>[0], input: UnrollInput) {
  const actor = createActor(notificationUnrollMachine(deps), { input })
  const states: string[] = []
  actor.subscribe((snapshot) => {
    const value = String(snapshot.value)
    if (states[states.length - 1] !== value) states.push(value)
  })
  const ended = toPromise(actor)
  actor.start()
  return { states, run: await ended }
}

describe('the unroll machine: the feed, which posts, likers page by page, reposters page by page', () => {
  test('one post: syncs the feed, reads likers until the end, then reposters, and ends done', async () => {
    const store = storeOf([row('like', '2', '900')])
    const likers = [['2', '8'], ['9']]
    const h = stubbed(store, (spec, s) => (spec.action === 'notifications' ? FEED : spec.kind === 'like' ? pageOf(s, spec, likers.shift()!, likers.length === 0) : pageOf(s, spec, ['6'], true)))
    const { states, run } = await statesOf(h.deps, { ...INPUT, postId: '900' })
    expect(states).toEqual(['syncingFeed', 'choosingPosts', 'readingLikers', 'readingReposters', 'done'])
    expect(h.calls).toEqual([
      { action: 'notifications', screenName: 'xTwo' },
      { action: 'postEngagers', screenName: 'xTwo', postId: '900', kind: 'like', pages: 5 },
      { action: 'postEngagers', screenName: 'xTwo', postId: '900', kind: 'like', pages: 5 },
      { action: 'postEngagers', screenName: 'xTwo', postId: '900', kind: 'repost', pages: 5 },
    ])
    expect(run).toMatchObject({ outcome: 'done', stop: null, pagesRead: 3, posts: [{ postId: '900', like: { done: true, pages: 2, newRows: 2 }, repost: { done: true, pages: 1, newRows: 1 } }] })
    const report = unrollReportOf(run, store)
    expect(report).toMatchObject({ state: 'done', stoppedBeforeTheEnd: false, posts: [{ postId: '900', likes: { fromNotifications: 1, addedByUnroll: 2, total: 3, state: 'readToTheEnd' }, reposts: { fromNotifications: 0, addedByUnroll: 1, total: 1, state: 'readToTheEnd' } }] })
    expect(engagerLine(report.posts[0]!)).toBe('  post 900: likers 1 from notifications + 2 added by unrolling = 3 (read to the end); reposters 0 from notifications + 1 added by unrolling = 1 (read to the end)')
    expect(h.lines.some((l) => l.includes('post 900 likers: 2 pages read, 2 added, read to the end'))).toBe(true)
  })

  test('with neither --post nor --full it syncs the feed and ends done without unrolling', async () => {
    const h = stubbed(storeOf([row('like', '2', '900')]), () => FEED)
    const { states, run } = await statesOf(h.deps, INPUT)
    expect(states).toEqual(['syncingFeed', 'choosingPosts', 'done'])
    expect(h.calls).toEqual([{ action: 'notifications', screenName: 'xTwo' }])
    expect(run).toMatchObject({ outcome: 'done', posts: [], feed: { ok: true } })
  })

  test('a refused feed read ends stopped and no list is asked for', async () => {
    const h = stubbed(storeOf([row('like', '2', '900')]), () => ({ ok: false, code: 'rateLimited', event: 'throttled', detail: 'X answered 429 to a notifications page' }))
    const { states, run } = await statesOf(h.deps, { ...INPUT, postId: '900', full: true, pages: 7 })
    expect(states).toEqual(['syncingFeed', 'stopped'])
    expect(h.calls).toEqual([{ action: 'notifications', screenName: 'xTwo', full: true, pages: 7 }])
    expect(run).toMatchObject({ outcome: 'stopped', stop: { stage: 'feed', code: 'rateLimited', postId: null }, posts: [] })
  })

  test('a 429 on a likers page ends stopped with what was kept: no retry, no reposters, no next post', async () => {
    const store = storeOf([row('like', '2', '900'), row('like', '3', '901')])
    let likerCalls = 0
    const h = stubbed(store, (spec, s) => {
      if (spec.action === 'notifications') return FEED
      likerCalls += 1
      return likerCalls === 1 ? pageOf(s, spec, ['8', '9'], false) : { ok: false, code: 'rateLimited', event: 'throttled', detail: 'X answered 429 to a page of the likers of post 900', postId: '900', kind: 'like' }
    })
    const { states, run } = await statesOf(h.deps, { ...INPUT, postId: '900', everyPost: true })
    expect(states).toEqual(['syncingFeed', 'choosingPosts', 'readingLikers', 'stopped'])
    expect(h.calls.map((c) => `${c.action}:${c.postId ?? ''}:${c.kind ?? ''}`)).toEqual(['notifications::', 'postEngagers:900:like', 'postEngagers:900:like'])
    expect(run).toMatchObject({ outcome: 'stopped', refusal: { code: 'rateLimited' }, stop: { stage: 'likers', code: 'rateLimited', postId: '900' }, pagesRead: 1 })
    expect(run.posts.map((p) => p.postId)).toEqual(['900', '901'])
    const report = unrollReportOf(run, store)
    expect(report.stoppedBeforeTheEnd).toBe(true)
    expect(report.posts[0]).toMatchObject({ likes: { fromNotifications: 1, addedByUnroll: 2, total: 3, state: 'stoppedBeforeTheEnd' }, reposts: { state: 'notUnrolled' } })
    expect(engagerLine(report.posts[0]!)).toContain('likers 1 from notifications + 2 added by unrolling = 3 (stopped before the end after 1 page, more left)')
    expect(h.lines.some((l) => l.includes('stopped before the end (likers, post 900): rateLimited'))).toBe(true)
  })

  test('a governor stop on the reposters ends stopped after the likers were read to the end', async () => {
    const store = storeOf([row('like', '2', '900')])
    const h = stubbed(store, (spec, s) => (spec.action === 'notifications' ? FEED : spec.kind === 'like' ? pageOf(s, spec, ['8'], true) : { ok: false, code: 'governorBlocked', detail: 'the governor stopped the read' }))
    const { states, run } = await statesOf(h.deps, { ...INPUT, postId: '900' })
    expect(states).toEqual(['syncingFeed', 'choosingPosts', 'readingLikers', 'readingReposters', 'stopped'])
    expect(run).toMatchObject({ outcome: 'stopped', stop: { stage: 'reposters', code: 'governorBlocked', postId: '900' }, posts: [{ like: { done: true }, repost: { done: false } }] })
  })

  test('the run page cap stops it before the end with the place held, and each call asks for no more pages than are left', async () => {
    const store = storeOf([row('like', '2', '900')])
    const h = stubbed(store, (spec, s) => (spec.action === 'notifications' ? FEED : pageOf(s, spec, [String(50 + h.calls.length)], false)))
    const { states, run } = await statesOf(h.deps, { ...INPUT, postId: '900', unrollPages: 2 })
    expect(states).toEqual(['syncingFeed', 'choosingPosts', 'readingLikers', 'stopped'])
    expect(h.calls.filter((c) => c.action === 'postEngagers').map((c) => c.pages)).toEqual([2, 1])
    expect(run).toMatchObject({ outcome: 'stopped', refusal: null, stop: { stage: 'pageCap', code: null, postId: '900' }, pagesRead: 2 })
    expect(engagerSummaryOf(store, '900', 'like')).toMatchObject({ state: 'stoppedBeforeTheEnd', pages: 2 })
  })

  test('an engine that throws, or answers ok without a page, ends crashed', async () => {
    const thrown = stubbed(storeOf([]), () => {
      throw new Error('host gone')
    })
    expect(await statesOf(thrown.deps, { ...INPUT, postId: '900' })).toMatchObject({ states: ['syncingFeed', 'crashed'], run: { outcome: 'crashed' } })
    const empty = stubbed(storeOf([]), (spec) => (spec.action === 'notifications' ? FEED : { ok: true }))
    const ended = await runNotificationUnroll(empty.deps, { ...INPUT, postId: '900' })
    expect(ended.outcome).toBe('crashed')
    expect(String(ended.error)).toContain('without a page read')
    expect(empty.calls).toHaveLength(2)
  })

  test('--full takes every own post with an aggregated like or repost, newest first, each kind only where it is aggregated', async () => {
    const store = storeOf([
      row('like', '2', '900', { at: '2026-11-01T10:00:00Z' }),
      row('repost', '3', '901', { at: '2026-11-03T10:00:00Z' }),
      row('like', '4', '902', { message: 'user4 liked your post' }),
      row('like', '5', '903', { postUrl: 'https://x.com/i/status/903' }),
      row('like', '6', '904', { at: '2026-10-01T10:00:00Z' }),
    ])
    const h = stubbed(store, (spec, s) => (spec.action === 'notifications' ? FEED : pageOf(s, spec, ['8'], true)))
    const run = await runNotificationUnroll(h.deps, { ...INPUT, everyPost: true, since: '2026-10-15' })
    expect(h.calls.filter((c) => c.action === 'postEngagers').map((c) => `${c.postId}:${c.kind}`)).toEqual(['901:repost', '900:like'])
    expect(run).toMatchObject({ outcome: 'done', pagesRead: 2 })
    expect(unrollCandidatesOf(store, 'xTwo')).toEqual([{ postId: '904', kinds: ['like'], latestAt: '2026-10-01T10:00:00Z' }])
    store.rows['like:7:900'] = row('like', '7', '900', { at: '2026-11-05T10:00:00Z' })
    expect(unrollCandidatesOf(store, 'xtwo').map((c) => c.postId)).toEqual(['900', '904'])
  })

  test('two rows that share one notification count as aggregated even without the words', () => {
    const store = storeOf([row('like', '2', '900', { message: '' }), row('like', '3', '900', { message: '' })])
    expect(unrollCandidatesOf(store, 'xTwo')).toEqual([{ postId: '900', kinds: ['like'], latestAt: '2026-11-01T10:00:00Z' }])
    expect(postEngagerSummaryOf(store, '900')).toMatchObject({ likes: { fromNotifications: 2, addedByUnroll: 0, total: 2, state: 'notUnrolled' } })
  })
})
