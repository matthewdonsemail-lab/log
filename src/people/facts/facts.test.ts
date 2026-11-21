import { describe, expect, test } from 'bun:test'
import type { Database } from 'bun:sqlite'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDatabase } from '../../storage/schema/index'
import { derivedFingerprint, rebuildDerived } from '../../storage/platform/index'
import { scoreOf } from '../../voice/score/index'
import type { DecisionRequest, DecisionResponse } from '../../subq/decisions/index'
import { cardFor, linkIdentities } from '../index'
import { alreadyPromisedBlock, DECIDER_SETTING, extractFacts, factDecider, factsAbout, factsForChats, factStream, openPromises, queuedCount, recordFact, repeatedPromise, screenStream } from './index'
import type { Screener } from './index'

const NOW = Date.parse('2026-11-21T20:00:00Z')
const at = (hoursAgo: number): string => new Date(NOW - hoursAgo * 3_600_000).toISOString()
let seq = 0

function world(): Database {
  const on = openDatabase(join(mkdtempSync(join(tmpdir(), 'facts-')), 'log.db'))
  on.prepare('INSERT INTO accounts (platform, account, userId, learnedAt) VALUES (?, ?, ?, ?)').run('twitter', 'xAccount', '1000000001', at(900))
  on.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?)').run('twitter', '1000000007', 'grace_ships', 'Grace', at(500), at(1))
  on.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?)').run('discord', '9000000007', 'grace', 'Grace', at(500), at(1))
  return on
}

function chat(on: Database, platform: string, conversationId: string): string {
  const chatId = `${platform}:xAccount:${conversationId}`
  on.prepare('INSERT OR IGNORE INTO chats (chatId, platform, account, conversationId, kind, lastMessageAt, lastMessageAtMs) VALUES (?, ?, ?, ?, ?, ?, ?)').run(chatId, platform, 'xAccount', conversationId, 'dm', at(0), NOW)
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
      ms: texts.length * 2,
      marks: texts.map((t) => (/\bill (send|pay)\b/i.test(t) ? { kind: 'promise', confidence: 0.8, entities: [], relations: [] } : /\bwork(ing)? at\b/i.test(t) ? { kind: 'workplace', confidence: 0.8, entities: [{ label: 'company', text: 'x' }], relations: [] } : { kind: 'none', confidence: 0.9, entities: [], relations: [] })),
    }
  },
}

let calls = 0
async function decisions(request: DecisionRequest): Promise<DecisionResponse> {
  calls++
  const messages = (request.state as { messages: { n: number; from: string; text: string }[] }).messages
  const answers: DecisionResponse['answers'] = {}
  for (const m of messages) {
    const slot = /\bill (send|pay)\b/i.test(m.text) && m.from === 'the owner' ? 'promisedByOwner' : /\bwork(ing)? at\b/i.test(m.text) ? 'workplace' : 'none'
    answers[`slot${m.n}`] = { type: 'choice', choice: slot, probabilities: { [slot]: 0.9 }, confidence: 0.9 }
    answers[`op${m.n}`] = { type: 'choice', choice: 'ADD', probabilities: { ADD: 0.9 }, confidence: 0.9 }
  }
  return { model: 'fake', answers, usage: { input_tokens: 100, output_tokens: 0 } }
}

function promiseWorld(): { on: Database; dm: string; first: string; second: string } {
  const on = world()
  const dm = chat(on, 'twitter', '1000000001-1000000007')
  say(on, dm, 'twitter', '1000000007', false, 'do you know anyone hiring remote right now', 30)
  say(on, dm, 'twitter', '1000000001', true, 'not off the top of my head', 20)
  const first = say(on, dm, 'twitter', '1000000001', true, 'ill send anything i see your way', 20)
  say(on, dm, 'twitter', '1000000007', false, 'lots of praise but no offers so far', 3)
  const second = say(on, dm, 'twitter', '1000000001', true, 'ill send anything i see your way', 2)
  return { on, dm, first, second }
}

describe('person facts are events, read back with their source (REQ-FACTS-01..03)', () => {
  test('an extracted fact keeps the exact message it came from, and a fact with no source is refused', async () => {
    const { on, first, second } = promiseWorld()
    calls = 0
    const report = await extractFacts(on, { screener, decisions, now: new Date(NOW) })
    if ('problem' in report) throw new Error(report.problem)
    const facts = factsAbout(on, { personId: null, identities: [{ platform: 'twitter', userId: '1000000007' }] })
    expect(facts).toHaveLength(1)
    expect(facts[0].slot).toBe('promisedByOwner')
    expect(facts[0].sourceMessageKeys).toEqual([first])
    expect(facts[0].quote).toBe('ill send anything i see your way')
    expect(facts[0].source?.fromOwner).toBe(true)
    expect(report.people[0].repeats.map((r) => r.messageKey)).toEqual([second])
    expect(report.marked).toBe(2)
    expect(calls).toBe(1)
    const unsourced = recordFact(on, { platform: 'twitter', userId: '1000000007', slot: 'job', text: 'a job nobody said', quote: 'a job nobody said', sourceMessageKeys: [], validFrom: at(1), confidence: 1, extractedBy: 'test' })
    expect(unsourced.ok).toBe(false)
    const wrongQuote = recordFact(on, { platform: 'twitter', userId: '1000000007', slot: 'job', text: 'pilot', quote: 'i fly planes', sourceMessageKeys: [first], validFrom: at(1), confidence: 1, extractedBy: 'test' })
    expect(wrongQuote.ok).toBe(false)
  })

  test('only new lines are read: a second run reads nothing and asks no one', async () => {
    const { on } = promiseWorld()
    await extractFacts(on, { screener, decisions, now: new Date(NOW) })
    calls = 0
    const again = await extractFacts(on, { screener, decisions, now: new Date(NOW) })
    if ('problem' in again) throw new Error(again.problem)
    expect(again.messages).toBe(0)
    expect(calls).toBe(0)
  })

  test('a later fact in the same slot supersedes the earlier one, which is kept but no longer current, and rebuild gives the same rows', () => {
    const on = world()
    const dm = chat(on, 'twitter', '1000000001-1000000007')
    const old = say(on, dm, 'twitter', '1000000007', false, 'i work at a bakery', 48)
    const fresh = say(on, dm, 'twitter', '1000000007', false, 'just started working at a shipyard', 2)
    const a = recordFact(on, { platform: 'twitter', userId: '1000000007', slot: 'workplace', text: 'i work at a bakery', quote: 'i work at a bakery', sourceMessageKeys: [old], validFrom: at(48), confidence: 0.9, extractedBy: 'test' }, new Date(NOW - 40 * 3_600_000))
    const b = recordFact(on, { platform: 'twitter', userId: '1000000007', slot: 'workplace', text: 'just started working at a shipyard', quote: 'just started working at a shipyard', sourceMessageKeys: [fresh], validFrom: at(2), confidence: 0.9, extractedBy: 'test' }, new Date(NOW))
    if (!a.ok || !b.ok) throw new Error('not recorded')
    const current = factsAbout(on, { personId: null, identities: [{ platform: 'twitter', userId: '1000000007' }] })
    expect(current.map((f) => f.factId)).toEqual([b.factId])
    const all = factsAbout(on, { personId: null, identities: [{ platform: 'twitter', userId: '1000000007' }] }, { all: true })
    const before = all.find((f) => f.factId === a.factId)!
    expect(before.closedAt).not.toBeNull()
    expect(before.supersededBy).toBe(b.factId)
    expect(before.validTo).toBe(at(2))
    const print = derivedFingerprint(on).personFacts
    rebuildDerived(on)
    expect(derivedFingerprint(on).personFacts).toEqual(print)
  })

  test('a fact on an identity moves to the person when the identity is linked, and the newest wins its slot', () => {
    const on = world()
    const x = chat(on, 'twitter', '1000000001-1000000007')
    const d = chat(on, 'discord', 'dmGrace')
    const onX = say(on, x, 'twitter', '1000000007', false, 'i live by the harbour', 50)
    const onDiscord = say(on, d, 'discord', '9000000007', false, 'moved inland last week', 5)
    recordFact(on, { platform: 'twitter', userId: '1000000007', slot: 'location', text: 'i live by the harbour', quote: 'i live by the harbour', sourceMessageKeys: [onX], validFrom: at(50), confidence: 0.9, extractedBy: 'test' }, new Date(NOW - 49 * 3_600_000))
    const moved = recordFact(on, { platform: 'discord', userId: '9000000007', slot: 'location', text: 'moved inland last week', quote: 'moved inland last week', sourceMessageKeys: [onDiscord], validFrom: at(5), confidence: 0.9, extractedBy: 'test' }, new Date(NOW - 4 * 3_600_000))
    if (!moved.ok) throw new Error(moved.problem)
    const linked = linkIdentities(on, ['twitter:1000000007', 'discord:9000000007'], 'the owner said yes', { name: 'Grace', now: new Date(NOW) })
    if (!linked.ok) throw new Error(linked.problem)
    const current = factsAbout(on, { personId: linked.personId!, identities: [] })
    expect(current.map((f) => f.factId)).toEqual([moved.factId])
    expect(current[0].personId).toBe(linked.personId!)
    const card = cardFor(on, 'Grace', NOW)
    if (!card.ok) throw new Error(card.problem)
    expect(card.card.text).toContain('moved inland last week')
    const print = derivedFingerprint(on).personFacts
    rebuildDerived(on)
    expect(derivedFingerprint(on).personFacts).toEqual(print)
  })

  test('a draft that repeats an open promise is held by the voice gate as already promised', async () => {
    const { on, dm } = promiseWorld()
    await extractFacts(on, { screener, decisions, now: new Date(NOW) })
    const promises = openPromises(factsForChats(on, [dm]))
    expect(promises).toHaveLength(1)
    const repeat = await repeatedPromise('haha ill send anything i see ur way man', promises)
    expect(repeat?.fact.slot).toBe('promisedByOwner')
    const block = alreadyPromisedBlock(repeat!)
    expect(block).toContain('already promised')
    expect(scoreOf({ phrasing: 1, nearest: 1, notAiTell: 1, subqVoice: 1, answersThem: 1, convergence: 1 }, [block], 0.5).pass).toBe(false)
    expect(await repeatedPromise('fair, the market is rough right now', promises)).toBeNull()
  })
})

describe('two tiers: marks queue up, the decider drains them (REQ-FACTS-04)', () => {
  test('with no decider the screen still marks and moves on, the marks stay queued, and a later run decides them without screening again', async () => {
    const { on, first } = promiseWorld()
    const held = await extractFacts(on, { screener, decisions: null, now: new Date(NOW) })
    if ('problem' in held) throw new Error(held.problem)
    expect(held.marked).toBe(2)
    expect(held.queued).toBe(2)
    expect(factsAbout(on, { personId: null, identities: [{ platform: 'twitter', userId: '1000000007' }] })).toHaveLength(0)
    calls = 0
    const drained = await extractFacts(on, { screener, decisions, decideModel: 'subq-snap-1.1', now: new Date(NOW) })
    if ('problem' in drained) throw new Error(drained.problem)
    expect(drained.messages).toBe(0)
    expect(drained.queued).toBe(0)
    expect(calls).toBe(1)
    const facts = factsAbout(on, { personId: null, identities: [{ platform: 'twitter', userId: '1000000007' }] })
    expect(facts.map((f) => f.sourceMessageKeys)).toEqual([[first]])
    expect(facts[0].extractedBy).toBe('fakeScreen+subq-snap-1.1')
  })

  test('the decider is one setting: a SubQ model with a key is used, no key or an unwired model is a coded refusal', () => {
    expect(factDecider({}, 'k')).toMatchObject({ ok: true, model: 'subq-snap-1.1' })
    expect(factDecider({ [DECIDER_SETTING]: 'subq-snap-preview' }, 'k')).toMatchObject({ ok: true, model: 'subq-snap-preview' })
    expect(factDecider({}, null)).toMatchObject({ ok: false, code: 'factDeciderUnavailable' })
    expect(factDecider({ [DECIDER_SETTING]: 'localModel' }, 'k')).toMatchObject({ ok: false, code: 'factDeciderUnavailable' })
  })

  test('the stream screen starts at the newest line, marks only dm lines that arrive after it, and leaves them for the decider', async () => {
    const on = world()
    const dm = chat(on, 'twitter', '1000000001-1000000007')
    say(on, dm, 'twitter', '1000000001', true, 'ill send the old deck later', 40)
    const first = await screenStream(on, screener, new Date(NOW))
    expect(first.lines).toBe(0)
    const fresh = say(on, dm, 'twitter', '1000000001', true, 'ill send you the intro tonight', 1)
    say(on, dm, 'twitter', '1000000007', false, 'sounds good', 1)
    const next = await screenStream(on, screener, new Date(NOW))
    expect(next).toMatchObject({ lines: 2, marked: 1 })
    expect(queuedCount(on)).toBe(1)
    expect((await screenStream(on, screener, new Date(NOW))).lines).toBe(0)
    const report = await extractFacts(on, { screener, decisions, now: new Date(NOW) })
    if ('problem' in report) throw new Error(report.problem)
    const facts = factsAbout(on, { personId: null, identities: [{ platform: 'twitter', userId: '1000000007' }] })
    expect(facts.map((f) => f.sourceMessageKeys[0])).toContain(fresh)
    expect(report.queued).toBe(0)
  })

  test('the stream is off by setting, and a screen that fails backs off instead of retrying every batch', async () => {
    const on = world()
    expect(factStream(on, { env: { LOG_FACTS_SCREEN: 'off' }, screener: () => screener })).toBeNull()
    let now = NOW
    let made = 0
    const broken = factStream(on, { env: {}, clock: () => now, screener: () => {
      made++
      return { model: 'broken', screen: async () => { throw new Error('no model') } }
    } })!
    await broken.tick()
    const dm = chat(on, 'twitter', '1000000001-1000000007')
    say(on, dm, 'twitter', '1000000001', true, 'ill send it', 0)
    expect(await broken.tick()).toBeNull()
    expect(await broken.tick()).toBeNull()
    expect(made).toBe(1)
    now += 3_600_000
    expect(await broken.tick()).toBeNull()
    expect(made).toBe(2)
  })

  test('asking for one person reads only the chats where they are the other side', async () => {
    const { on } = promiseWorld()
    on.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?)').run('twitter', '1000000009', 'linus_k', 'Linus', at(500), at(1))
    const other = chat(on, 'twitter', '1000000001-1000000009')
    say(on, other, 'twitter', '1000000009', false, 'i work at a sawmill these days', 5)
    say(on, other, 'twitter', '1000000009', false, 'busy week', 4)
    say(on, other, 'twitter', '1000000007', false, 'hey both', 3)
    const report = await extractFacts(on, { screener, decisions, who: 'twitter:1000000007', now: new Date(NOW) })
    if ('problem' in report) throw new Error(report.problem)
    expect(report.chats).toBe(1)
    expect(report.people.map((p) => p.subject.userId)).toEqual(['1000000007'])
  })
})
