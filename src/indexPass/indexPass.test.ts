import { describe, expect, test, beforeAll, afterAll } from 'bun:test'
import type { Database } from 'bun:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDatabase } from '../storage/schema/index'
import { hashEmbedder } from '../search/conversations/helpers/embed'
import type { Screener } from '../people/facts/types'
import { indexStream } from './helpers/stream'
import { cursorOf, headOf, saveCursor, sliceOf } from './helpers/queue'
import { runIndexPass } from './client'
import { chatOffsetOf } from './helpers/facts'
import { tickLine } from './helpers/tick'
import { keepCorrection, examplesOf, correctionsOf } from './helpers/corrections'
import { datasetOf, latestRevision, revisionsOf, recordRevision } from './helpers/train'
import { EMPTY_TICK, PASS_SETTING } from './types'

const NOW = Date.parse('2026-11-22T06:00:00Z')
const at = (hoursAgo: number): string => new Date(NOW - hoursAgo * 3_600_000).toISOString()
let seq = 0
let root = ''
const saved: { logHome: string | undefined } = { logHome: undefined }

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'indexpass-'))
  saved.logHome = process.env.LOG_HOME
  process.env.LOG_HOME = join(root, '.logCli')
})

afterAll(() => {
  if (saved.logHome === undefined) delete process.env.LOG_HOME
  else process.env.LOG_HOME = saved.logHome
  try {
    rmSync(root, { recursive: true, force: true })
  } catch {
  }
})

function world(name: string): { on: Database; dirs: { search: string; voice: string } } {
  const dir = mkdtempSync(join(root, `${name}-`))
  process.env.LOG_HOME = dir
  const on = openDatabase(join(dir, 'log.db'))
  on.prepare('INSERT INTO accounts (platform, account, userId, learnedAt) VALUES (?, ?, ?, ?)').run('discord', 'builder', '9000000001', at(900))
  on.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?)').run('discord', '9000000002', 'grace', 'Grace', at(500), at(1))
  return { on, dirs: { search: join(dir, 'search', 'conversations'), voice: join(dir, 'search', 'voice') } }
}

function chat(on: Database, platform: string, account: string, conversationId: string, kind: string): string {
  const chatId = `${platform}:${account}:${conversationId}`
  on.prepare('INSERT OR IGNORE INTO chats (chatId, platform, account, conversationId, kind, lastMessageAt, lastMessageAtMs) VALUES (?, ?, ?, ?, ?, ?, ?)').run(chatId, platform, account, conversationId, kind, at(0), NOW)
  return chatId
}

function say(on: Database, chatId: string, platform: string, userId: string, fromOwner: boolean, text: string, hoursAgo: number): string {
  seq++
  const key = `test:${seq}`
  on.prepare("INSERT INTO messages (messageKey, chatId, senderPlatform, senderUserId, fromOwner, sentAt, sentAtMs, text, source, receivedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'live', ?)").run(key, chatId, platform, userId, fromOwner ? 1 : 0, at(hoursAgo), NOW - hoursAgo * 3_600_000, text, at(hoursAgo))
  return key
}

const screener: Screener = {
  model: 'fakeScreen',
  async screen(texts) {
    return {
      ms: texts.length,
      marks: texts.map((t) => (/\bwork(ing)? at\b/i.test(t) ? { kind: 'workplace', confidence: 0.8, entities: [], relations: [] } : { kind: 'none', confidence: 0.9, entities: [], relations: [] })),
    }
  },
}

const session = (): Set<string> => new Set(['discord:builder'])

describe('the slice after the cursor', () => {
  test('reads whole conversations only, and never half of one', () => {
    const { on } = world('slice')
    const dm = chat(on, 'discord', 'builder', '111', 'dm')
    const group = chat(on, 'discord', 'builder', '222', 'group')
    for (let n = 0; n < 3; n++) say(on, dm, 'discord', '9000000002', false, `dm line ${n}`, 10 - n)
    for (let n = 0; n < 3; n++) say(on, group, 'discord', 'unknown:member', false, `group line ${n}`, 9 - n)
    const whole = sliceOf(on, 0, {})
    expect(whole.chats.length).toBe(2)
    expect(whole.chats.map((c) => c.lines.length)).toEqual([3, 3])
    expect(whole.throughSeq).toBe(headOf(on))
    const cut = sliceOf(on, 0, { lines: 4 })
    expect(cut.chats.length).toBe(1)
    expect(cut.chats[0].lines.length).toBe(3)
    expect(cut.throughSeq).toBe(3)
    const next = sliceOf(on, cut.throughSeq, { lines: 4 })
    expect(next.chats.length).toBe(1)
    expect(next.throughSeq).toBe(6)
    on.close()
  })

  test('a filter reads only that platform or that account', () => {
    const { on } = world('filter')
    chat(on, 'discord', 'builder', '111', 'dm')
    const slack = chat(on, 'slack', 'builder', '222', 'channel')
    say(on, slack, 'slack', 'unknown:member', false, 'in the channel', 2)
    expect(sliceOf(on, 0, { platform: 'discord' }).chats.length).toBe(0)
    expect(sliceOf(on, 0, { platform: 'slack' }).chats.length).toBe(1)
    expect(sliceOf(on, 0, { account: 'other' }).chats.length).toBe(0)
    on.close()
  })
})

describe('one pass per conversation', () => {
  test('every room kind is indexed, voiced and screened in order, then the cursor moves', async () => {
    const { on, dirs } = world('pass')
    const dm = chat(on, 'discord', 'builder', '111', 'dm')
    const group = chat(on, 'discord', 'builder', '222', 'group')
    const channel = chat(on, 'discord', 'builder', '333', 'channel')
    say(on, dm, 'discord', '9000000002', false, 'i am working at vercel now', 5)
    say(on, dm, 'discord', '9000000001', true, 'nice, congrats', 4)
    say(on, group, 'discord', '9000000002', false, 'anyone here working at a startup', 3)
    say(on, channel, 'discord', '9000000002', false, 'we are working at a bank this week', 2)
    const report = await runIndexPass(on, { only: 'facts', screener: () => screener, decider: () => ({ ok: false, code: 'factDeciderUnavailable', problem: 'no key' }), signedIn: session, embedder: () => hashEmbedder(), from: 'start' })
    expect(report.chats).toBe(3)
    expect(report.screened).toBe(4)
    expect(report.queued).toBeGreaterThan(0)
    expect(cursorOf(on)).toBe(headOf(on))
    for (const id of [dm, group, channel]) expect(chatOffsetOf(on, id)).toBeGreaterThan(0)
    const again = await runIndexPass(on, { only: 'facts', screener: () => screener, decider: () => ({ ok: false, code: 'factDeciderUnavailable', problem: 'no key' }), signedIn: session, embedder: () => hashEmbedder() })
    expect(again.chats).toBe(0)
    expect(again.screened).toBe(0)
    on.close()
    void dirs
  })

  test('search and voice work off the same read of the conversation', async () => {
    const { on, dirs } = world('stages')
    const dm = chat(on, 'discord', 'builder', '111', 'dm')
    say(on, dm, 'discord', '9000000002', false, 'do you know anyone hiring in berlin', 5)
    say(on, dm, 'discord', '9000000001', true, 'i might know someone, let me ask around', 4)
    const embedder = hashEmbedder()
    const report = await runIndexPass(on, { only: 'search', embedder: () => embedder, signedIn: session, from: 'start' })
    expect(report.embedded).toBeGreaterThan(0)
    const voiced = await runIndexPass(on, { only: 'voice', embedder: () => embedder, signedIn: session, from: 'start' })
    expect(voiced.voiced).toBeGreaterThan(0)
    on.close()
    void dirs
  })

  test('an account with no signed-in session is left alone, and the cursor still passes it', async () => {
    const { on } = world('session')
    const dm = chat(on, 'discord', 'builder', '111', 'dm')
    say(on, dm, 'discord', '9000000002', false, 'i am working at vercel now', 5)
    const report = await runIndexPass(on, { only: 'facts', screener: () => screener, decider: () => ({ ok: false, code: 'factDeciderUnavailable', problem: 'no key' }), signedIn: () => new Set(), embedder: () => hashEmbedder(), from: 'start' })
    expect(report.chats).toBe(0)
    expect(report.waiting).toContain('no signed-in session')
    expect(cursorOf(on)).toBe(headOf(on))
    on.close()
  })
})

describe('the stream in the owner', () => {
  test('LOG_INDEX_STREAM=off means no pass at all', () => {
    const { on } = world('off')
    const stream = indexStream(on, { env: { [PASS_SETTING]: 'off' }, signedIn: session, embedder: () => hashEmbedder() })
    expect(stream).toBeNull()
    on.close()
  })

  test('a tick reports what it did and how long a conversation took', async () => {
    const { on } = world('tick')
    const dm = chat(on, 'discord', 'builder', '111', 'dm')
    say(on, dm, 'discord', '9000000002', false, 'i am working at vercel now', 5)
    saveCursor(on, 0, NOW)
    const stream = indexStream(on, { env: {}, screener: () => screener, decider: () => ({ ok: false, code: 'factDeciderUnavailable', problem: 'no key' }), signedIn: session, embedder: () => hashEmbedder(), sliceMs: 1000 })
    expect(stream).not.toBeNull()
    const tick = await stream!.tick()
    expect(tick!.chats).toBe(1)
    expect(tick!.screened).toBe(1)
    expect(tick!.queued).toBe(1)
    expect(tick!.p50).toBeGreaterThanOrEqual(0)
    expect(tick!.throughSeq).toBe(headOf(on))
    expect(stream!.last()!.chats).toBe(1)
    stream!.stop()
    on.close()
  })
})

describe('the corrections the screen learns from', () => {
  test('a rejection and an acceptance are kept once each, and the owner wins', () => {
    const { on } = world('corrections')
    keepCorrection(on, { text: 'i am working at vercel now', label: 'workplace', kind: 'workplace', from: 'decider', at: new Date(NOW) })
    keepCorrection(on, { text: 'I am working at Vercel now', label: 'none', kind: 'workplace', from: 'screen', at: new Date(NOW) })
    expect(correctionsOf(on).length).toBe(1)
    keepCorrection(on, { text: 'i am working at vercel now', label: 'job', kind: 'job', from: 'owner', at: new Date(NOW) })
    expect(correctionsOf(on)[0].label).toBe('job')
    keepCorrection(on, { text: 'i am working at vercel now', label: 'none', kind: 'none', from: 'decider', at: new Date(NOW) })
    expect(correctionsOf(on)[0].label).toBe('job')
    keepCorrection(on, { text: 'ok', label: 'none', kind: 'none', from: 'decider', at: new Date(NOW) })
    expect(correctionsOf(on).length).toBe(1)
    on.close()
  })

  test('the decider decisions already in log.db become examples too', () => {
    const { on } = world('examples')
    const dm = chat(on, 'discord', 'builder', '111', 'dm')
    const key = say(on, dm, 'discord', '9000000002', false, 'i am working at vercel now', 5)
    on.prepare('INSERT INTO factCandidates (messageKey, chatId, kind, confidence, marks, model, decided, markedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(key, dm, 'workplace', 0.8, '{"entities":[],"relations":[]}', 'gliner2', 'ADD', at(1))
    const examples = examplesOf(on)
    expect(examples.length).toBe(1)
    expect(examples[0].label).toBe('workplace')
    on.close()
  })

  test('a held-out slice is every k-th correction, and a revision is recorded like a model', () => {
    const examples = Array.from({ length: 20 }, (_, n) => ({ text: `line ${n} about something lasting`, label: 'job', from: 'decider' as const }))
    const { train, held } = datasetOf(examples, 5)
    expect(held.length).toBe(4)
    expect(train.length).toBe(16)
    const file = join(root, 'revisions.json')
    recordRevision({ revision: 'abc123', base: 'fastino/gliner2.5-small-v1@b5d42bf', dir: 'python/facts/revisions/abc123/adapter.safetensors', examples: 16, heldOut: 4, accuracyBefore: 0.4, accuracyAfter: 0.9, bytes: 1024, trainedAt: new Date(NOW).toISOString(), epochs: 3 }, file, join(root, 'revisions'))
    expect(revisionsOf(file)[0].accuracyAfter).toBe(0.9)
    expect(latestRevision({}, file)).toBeNull()
  })
})

describe('the pass line a person reads', () => {
  test('it names what the last tick did, and says nothing new when there was nothing', () => {
    expect(tickLine(null)).toBe('index pass: not in this owner')
    expect(tickLine({ ...EMPTY_TICK, throughSeq: 7, head: 9, backlog: 2, at: at(1) })).toBe('index pass: nothing new (through event 7 of 9, 2 conversation(s) behind)')
    const line = tickLine({ ...EMPTY_TICK, chats: 2, embedded: 5, voiced: 3, screened: 40, decided: 2, p50: 12, p95: 30, ms: 200, backlog: 9, overran: 1, at: at(1) })
    expect(line).toContain('2 conversation(s) queued, 5 embedded, 3 voiced, 40 screened, 2 decided')
    expect(line).toContain('12 ms p50 / 30 ms p95')
    expect(line).toContain('9 behind, carried over')
  })
})
