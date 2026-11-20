import { describe, expect, test } from 'bun:test'
import { storeRead } from '../catchUp/index'
import { labelList, labelOfChat, setLabel } from '../label/index'
import type { LabelEntry } from '../label/index'
import type { LastWordMessage } from '../lastWord/index'
import { againstTheDb } from '../pending/index'
import { pushLoop } from '../push/index'
import { hashEmbedder } from '../../search/conversations/index'
import { db } from '../store/index'
import {
  applyLayer,
  botSignal,
  drainTeacher,
  fallbackReason,
  humanTalk,
  queueForTeacher,
  teachQueue,
  teachSpend,
  buildPrototypes,
  FEATURE_NAMES,
  emotionsSettled,
  featuresOf,
  guessOf,
  labelChats,
  labelQueue,
  latestHead,
  pipelineLabels,
  pipelineLine,
  pushLabeller,
  refreshPipeline,
  storedRow,
  teach,
  teachPlan,
  trainAndSave,
  teachState,
  trainingSet,
  WHERE_LABELS,
  WHO_LABELS,
  windowOf,
  windowText,
} from './index'
import type { Features, PipelineHead, PipelineRow } from './index'

const NOW = Date.parse('2026-11-18T12:00:00Z')
const DAY = 86_400_000
const labels = { who: { ...WHO_LABELS }, where: { ...WHERE_LABELS } }
const embedder = hashEmbedder(256)

let seq = 0
const said = (lines: [boolean, string, number][], from = 'grace_ships'): LastWordMessage[] => lines.map(([fromOwner, text, msAgo]) => ({ conversationId: 'grace', seq: ++seq, ms: NOW - msAgo, at: new Date(NOW - msAgo).toISOString(), fromOwner, senderUserId: fromOwner ? 'owner' : 'grace', senderLabel: fromOwner ? null : from, text, files: 0 }))

const features = (over: Partial<Features> = {}): Features => ({ turns: 6, daysQuiet: 1, openAsk: 0, lastFromMe: 0, theirShare: 0.5, botScore: 0, neverWroteBack: 0, feelsGood: 0, feelsBad: 0, feelsCurious: 0, ...over })

const row = (over: Partial<PipelineRow>): PipelineRow => ({ platform: 'discord', account: 'discordAccount', person: 'p', lastSeq: 1, who: 'lead', where: 'warming', confidence: 0.5, margin: 0.1, movedBySeq: 1, movedById: null, source: 'prototype', scores: { who: { lead: 0.5, friend: 0.4, bot: 0.1 }, where: { warming: 0.6, new: 0.4 } }, features: features(), emotions: null, vector: null, labelledAt: '2026-11-18T12:00:00Z', ...over })

describe('who each person is and where they are (the pipeline labeller)', () => {
  test('the bot detector reads names, templates, replies faster than typing and one-way notices, and leaves a person alone', () => {
    expect(botSignal('VIBE BOT', said([[true, 'hey', 9000], [false, 'hi there how can I help', 8000]])).score).toBeGreaterThanOrEqual(0.7)
    expect(botSignal('MEE6', []).score).toBeGreaterThanOrEqual(0.7)
    expect(botSignal('PostUpdates', []).score).toBeGreaterThanOrEqual(0.7)
    const templated = said([[false, 'GG grace, you just advanced to level 3!', 5000], [false, 'GG grace, you just advanced to level 4!', 4000], [false, 'GG grace, you just advanced to level 5!', 3000]], 'levels')
    expect(botSignal('levels', templated).score).toBeGreaterThanOrEqual(0.6)
    const instant = said(Array.from({ length: 10 }, (_, i) => [i % 2 === 0, i % 2 ? 'Sure! Here is a detailed answer to your question, with three steps to follow.' : 'what about this', (10 - i) * 1500] as [boolean, string, number]), 'helper')
    expect(botSignal('helper', instant).why.join(' ')).toContain('faster than a person types')
    const human = said([[true, 'yo whats good', 3 * DAY], [false, 'not much, shipping the app', 2 * DAY], [true, 'nice', DAY], [false, 'haha yeah', 1000]])
    expect(botSignal('grace_ships', human).score).toBe(0)
    expect(botSignal('Abbot', human).score).toBe(0)
  })

  test('the window marks the owner\'s lines and the counting signals become features', () => {
    const lines = said([[true, 'would you be interested in working together', 2 * DAY], [false, 'tell me more', DAY], [true, 'here is the calendly link', 1000]])
    expect(windowText(windowOf(lines))).toBe('me: would you be interested in working together\nthem: tell me more\nme: here is the calendly link')
    expect(featuresOf(lines, { score: 0, why: [] }, NOW)).toMatchObject({ turns: 2, openAsk: 1, lastFromMe: 1, daysQuiet: 0, neverWroteBack: 0 })
  })

  test('day one: the nearest prototype on the embedder picks who, and the counting rules shape where', async () => {
    const prototypes = await buildPrototypes(labels, embedder)
    const [lead] = await embedder.embed(['how much would you charge for this, we are looking for someone to build our outreach'])
    const guess = guessOf(lead, features({ turns: 1 }), labels, prototypes, null)
    expect(guess).toMatchObject({ who: 'lead', source: 'prototype' })
    expect(guess.where).toBe('new')
    expect(guessOf(lead, features({ daysQuiet: 40 }), labels, prototypes, null).where).toBe('goneQuiet')
    expect(Object.values(guess.whoScores).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 2)
  })

  test('a bot, a friend or a partner never gets a sales stage, from the labeller or by hand', async () => {
    const prototypes = await buildPrototypes(labels, embedder)
    const [friendly] = await embedder.embed(['haha miss you man, how is the family, lets grab food this weekend'])
    expect(guessOf(friendly, features(), labels, prototypes, null)).toMatchObject({ who: 'friend', where: null })
    expect(guessOf(friendly, features({ botScore: 0.95 }), labels, prototypes, null, ['the name reads as a bot'], { teacherSaysBot: true })).toMatchObject({ who: 'bot', where: null, source: 'bot' })
    const chat = { platform: 'discord', account: 'discordAccount', storedAsGroup: false, with: 'linus_k', personKey: 'linus', conversationIds: ['linus'], messages: said([[false, 'lets ship it', 1000]], 'linus_k') }
    expect(labelOfChat(chat, [], NOW, row({ person: 'linus', who: 'partner', where: 'offered' }))).toMatchObject({ who: 'partner', where: null, label: 'friend' })
    expect(labelOfChat(chat, [], NOW, row({ person: 'linus', who: 'bot', where: null, source: 'bot', features: features({ botScore: 0.95 }) }))).toMatchObject({ who: 'bot', label: 'skip' })
  })

  test('old labels map onto the two fields, and the owner\'s hand label always wins over the labeller and the teacher', () => {
    const chat = { platform: 'discord', account: 'discordAccount', storedAsGroup: false, with: 'grace_ships', personKey: 'grace', conversationIds: ['grace'], messages: said([[true, 'whats good', 2000], [false, 'haha fair', 1000]]) }
    const friend: LabelEntry[] = [{ platform: 'discord', account: 'discordAccount', person: 'grace', label: 'friend', by: 'the owner', at: '2026-11-18T00:00:00Z' }]
    expect(labelOfChat(chat, friend, NOW, row({ person: 'grace', who: 'lead', where: 'offered', confidence: 0.9 }))).toMatchObject({ label: 'friend', who: 'friend', where: null, set: true })
    const client: LabelEntry[] = [{ platform: 'discord', account: 'discordAccount', person: 'grace', label: 'client', by: 'the owner', at: '2026-11-18T00:00:00Z' }]
    expect(labelOfChat(chat, client, NOW, null)).toMatchObject({ label: 'client', who: 'client' })
    const teacher: LabelEntry[] = [{ platform: 'discord', account: 'discordAccount', person: 'grace', who: 'lead', where: 'needFound', confidence: 0.9, by: 'subq', at: '2026-11-18T00:00:00Z' }]
    expect(labelOfChat(chat, teacher, NOW, row({ person: 'grace', who: 'community', where: null, confidence: 0.4 }))).toMatchObject({ who: 'lead', where: 'needFound', set: false, labelledBy: 'subq' })
    expect(labelOfChat(chat, teacher, NOW, row({ person: 'grace', who: 'community', where: null, confidence: 0.95 }))).toMatchObject({ who: 'community', labelledBy: 'prototype' })
    expect(labelOfChat(chat, [], NOW, row({ person: 'grace', who: 'lead', where: 'won' }))?.label).toBe('client')
    expect(labelOfChat(chat, [], NOW, null)).toMatchObject({ who: null, label: 'warming' })
  })

  test('setting who and where by hand keeps a stage only for a lead or client, and the teacher never overwrites the owner', () => {
    const target = { platform: 'slack', account: 'slackAccount', chat: 'D0PIPE1' }
    setLabel(target, { who: 'partner', where: 'offered' }, 'the owner')
    expect(labelList().find((e) => e.person === 'D0PIPE1')).toMatchObject({ who: 'partner', where: null, by: 'the owner' })
    setLabel(target, { who: 'lead', where: 'callBooked', confidence: 0.99 }, 'subq')
    expect(labelList().find((e) => e.person === 'D0PIPE1')).toMatchObject({ who: 'partner', by: 'the owner' })
    setLabel(target, { who: 'client', where: 'won' }, 'the owner')
    expect(labelList().find((e) => e.person === 'D0PIPE1')).toMatchObject({ who: 'client', where: 'won' })
    setLabel(target, null, 'the owner')
  })

  test('a trained head is applied on the CPU, and the labeller falls back to prototypes when its labels do not match', async () => {
    const prototypes = await buildPrototypes(labels, embedder)
    const width = 256 + 7
    const weights = (hot: number) => Array.from({ length: width }, (_, i) => (i === 256 + hot ? 10 : 0))
    const head: PipelineHead = { model: 'hash', features: ['turns', 'daysQuiet', 'openAsk', 'lastFromMe', 'theirShare', 'botScore', 'neverWroteBack'], featureScale: [10, 30, 1, 1, 1, 1, 1], who: { labels: ['client', 'friend', 'lead'], weights: [weights(2), weights(5), weights(6)], bias: [0, 0, 0] }, where: { labels: ['offered', 'won'], weights: [weights(2), weights(3)], bias: [0, 0] }, trainedAt: '2026-11-18T00:00:00Z', counts: { rows: 2 }, trainer: 'test' }
    expect(applyLayer(head.who, [...new Array(256).fill(0), 0, 0, 1, 0, 0, 0, 0]).client).toBeGreaterThan(0.99)
    const [v] = await embedder.embed(['anything at all'])
    expect(guessOf(v, features({ openAsk: 1 }), labels, prototypes, head)).toMatchObject({ who: 'client', where: 'offered', source: 'head' })
    const foreign = { ...head, who: { ...head.who, labels: ['customer', 'friend', 'lead'] } }
    const narrow = { ...head, who: { labels: ['client', 'friend'], weights: [weights(2), weights(5)], bias: [0, 0] } }
    expect(guessOf(v, features({ openAsk: 1 }), labels, prototypes, narrow).source).toBe('prototype')
    expect(guessOf(v, features({ openAsk: 1 }), labels, prototypes, foreign).source).toBe('prototype')
  })

  test('the queue takes the least sure chats, spread across platforms, and skips what the owner labelled', () => {
    const rows = [
      row({ platform: 'discord', person: 'a', margin: 0.05 }),
      row({ platform: 'discord', person: 'b', margin: 0.06 }),
      row({ platform: 'discord', person: 'c', margin: 0.07 }),
      row({ platform: 'twitter', person: 'd', margin: 0.5 }),
      row({ platform: 'slack', person: 'e', margin: 0.01 }),
      row({ platform: 'slack', person: 'f', margin: 0.9, scores: { who: { lead: 0.95, friend: 0.05 }, where: { warming: 1 } } }),
      row({ platform: 'discord', person: 'g', source: 'group' }),
    ]
    const queue = labelQueue(rows, (r) => r.person === 'b', 3)
    expect(queue.map((q) => q.person)).toEqual(['e', 'a', 'd'])
    expect(labelQueue(rows, () => false, 10).map((q) => q.person)).not.toContain('g')
  })

  test('the teacher pass is a cost estimate until applied, and keeps candidate labels when SubQ is unsure', async () => {
    const plan = teachPlan([{ platform: 'discord', account: 'discordAccount', person: 'grace', with: 'grace_ships', state: 'x'.repeat(4000) }], labels)
    expect(plan.inputTokens).toBeGreaterThan(1000)
    expect(plan.usd).toBeLessThan(0.01)
    const client = async () => ({ model: 'fake', usage: { input_tokens: 1200, output_tokens: 0 }, answers: { who: { type: 'choice' as const, choice: 'lead', probabilities: { lead: 0.55, friend: 0.45 }, confidence: 0.55 }, where: { type: 'choice' as const, choice: 'needFound', probabilities: { needFound: 0.9 }, confidence: 0.9 } } })
    const [answer] = await teach(plan, client, labels)
    expect(answer).toMatchObject({ who: 'lead', where: 'needFound', confidence: 0.55, candidates: ['lead', 'friend'], inputTokens: 1200 })
  })

  test('the teacher is told who the owner is and the people he labelled himself', () => {
    const state = teachState({ platform: 'discord', with: 'linus_k' }, 'them: hey me: yo', { about: 'a builder who sells content work', examples: [{ with: 'grace_ships', platform: 'twitter', who: 'client' }] })
    expect(state).toContain('About the owner: a builder who sells content work')
    expect(state).toContain('grace_ships on twitter is client')
    expect(state.endsWith('them: hey me: yo')).toBe(true)
  })

  test('training rows come from owner labels and teacher labels above the floor, weighted by how sure the teacher was', () => {
    const v = new Float32Array([0.1, 0.2])
    const rows = [row({ person: 'a', vector: v }), row({ person: 'b', vector: v }), row({ person: 'c', vector: v }), row({ person: 'e', vector: v }), row({ person: 'd', vector: null })]
    const entries: LabelEntry[] = [
      { platform: 'discord', account: 'discordAccount', person: 'a', who: 'friend', by: 'the owner', at: 'x' },
      { platform: 'discord', account: 'discordAccount', person: 'b', who: 'lead', where: 'offered', confidence: 0.9, by: 'subq', at: 'x' },
      { platform: 'discord', account: 'discordAccount', person: 'c', who: 'lead', confidence: 0.5, by: 'subq', at: 'x' },
      { platform: 'discord', account: 'discordAccount', person: 'e', who: 'lead', confidence: 0.2, by: 'subq', at: 'x' },
      { platform: 'discord', account: 'discordAccount', person: 'd', who: 'lead', by: 'the owner', at: 'x' },
    ]
    const set = trainingSet(rows, entries, labels)
    expect(set.map((r) => [r.who, r.where, r.weight, r.source])).toEqual([['friend', null, 1, 'owner'], ['lead', 'offered', 0.5, 'teacher'], ['lead', null, 0.313, 'teacher']])
    expect(set[0].x).toHaveLength(2 + FEATURE_NAMES.length)
  })

  test('training is refused until enough kinds are labelled, then the head is stored in log.db', async () => {
    const v = new Float32Array([0.1, 0.2])
    const kinds = ['lead', 'friend', 'partner']
    const rows = Array.from({ length: 21 }, (_, i) => row({ account: 'trainAcct', person: `t${i}`, vector: v }))
    const entries: LabelEntry[] = rows.map((r, i) => ({ platform: r.platform, account: r.account, person: r.person, who: kinds[i % 3], by: 'the owner', at: 'x' }))
    let calls = 0
    const trainer = async () => {
      calls++
      return { model: 'hash', features: [...FEATURE_NAMES], featureScale: FEATURE_NAMES.map(() => 1), who: { labels: kinds, weights: [], bias: [] }, where: { labels: [], weights: [], bias: [] }, trainedAt: '2026-11-18T00:00:00Z', counts: { rows: 21, owner: 21, teacher: 0 }, trainer: 'fake' }
    }
    expect(await trainAndSave(rows.slice(0, 5), entries, labels, 'hash', db(), trainer)).toMatchObject({ owner: 5 })
    const saved = await trainAndSave(rows, entries, labels, 'hash', db(), trainer)
    expect(calls).toBe(1)
    expect('id' in saved && latestHead(db())?.trainer).toBe('fake')
    db().exec('DELETE FROM pipelineHeads WHERE 1 = 1')
  })

  test('labels are stored per chat with what moved them, cached by the last message, and refreshed on each new message in the push', async () => {
    const now = new Date('2026-11-18T12:00:00Z')
    storeRead('discord', 'pipelineAcct', 'pipe1', 'dm', { id: 'm1', at: '2026-11-18T10:00:00Z', from: 'grace_ships', fromId: 'g1', fromMe: false, text: 'how much would you charge to build our outreach' }, now, 'live')
    storeRead('discord', 'pipelineAcct', 'pipe1', 'dm', { id: 'm2', at: '2026-11-18T10:05:00Z', from: 'me', fromMe: true, text: 'depends on the volume, what do you need' }, now, 'live')
    const emotions = async (texts: string[]) => texts.map(() => [{ label: 'curiosity', score: 0.7 }, { label: 'neutral', score: 0.2 }, { label: 'joy', score: 0.1 }])
    const first = await refreshPipeline({ platform: 'discord', account: 'pipelineAcct' }, { embedder, emotions, labels, head: null, now: NOW })
    expect(first).toHaveLength(1)
    expect(first[0].movedById).toBe('m2')
    expect(first[0].emotions?.map((e) => e.label)).toEqual(['curiosity', 'neutral', 'joy'])
    expect(await refreshPipeline({ platform: 'discord', account: 'pipelineAcct' }, { embedder, labels, head: null, now: NOW })).toHaveLength(0)
    const label = pushLabeller(() => ({ embedder, labels, head: null, now: NOW }))
    expect(await label()).toBe(0)
    storeRead('discord', 'pipelineAcct', 'pipe1', 'dm', { id: 'm3', at: '2026-11-18T10:10:00Z', from: 'grace_ships', fromId: 'g1', fromMe: false, text: 'about 500 leads a month' }, now, 'live')
    expect(await label()).toBe(1)
    expect(storedRow(db(), 'discord', 'pipelineAcct', 'pipe1')?.lastSeq).toBeGreaterThan(first[0].lastSeq)
    expect(pipelineLine('discord', 'pipelineAcct', 'pipe1')).toMatch(/^ {2}who \w+/)
    storeRead('discord', 'pipelineAcct', 'pipe1', 'dm', { id: 'm4', at: '2026-11-18T10:12:00Z', from: 'grace_ships', fromId: 'g1', fromMe: false, text: 'thanks, that helps a lot' }, now, 'live')
    const grateful = async (texts: string[]) => texts.map(() => [{ label: 'gratitude', score: 0.9 }])
    const [later] = await refreshPipeline({ platform: 'discord', account: 'pipelineAcct' }, { embedder, emotions: grateful, emotionsLater: true, labels, head: null, now: NOW })
    expect(later.emotions?.[0].label).toBe('curiosity')
    await emotionsSettled()
    expect(storedRow(db(), 'discord', 'pipelineAcct', 'pipe1')?.emotions?.[0].label).toBe('gratitude')
  })

  test('a stored group is community with no stage and is never embedded', async () => {
    const rows = await labelChats([{ platform: 'discord', account: 'groupAcct', storedAsGroup: true, with: 'the crew', personKey: 'grp1', messages: said([[false, 'gm all', 1000]]) }], { embedder: { model: 'never', embed: async () => { throw new Error('a group is never embedded') } }, labels, head: null, now: NOW })
    expect(rows[0]).toMatchObject({ who: 'community', where: null, source: 'group' })
  })

  test('the push waits briefly for the labeller and the conversation block carries log\'s read of them', async () => {
    let calls = 0
    const sent = await pushLoop('pipelineReader', 'hermes', () => {}, { read: () => ({ messages: [], alerts: [], text: null }), wait: async () => {}, mark: null, rounds: 2, quiet: () => 0, label: async () => ++calls })
    expect([sent, calls]).toEqual([0, 2])
    const message = { platform: 'discord', account: 'discordAccount', conversationId: 'grace', with: 'grace_ships', text: 'hi', at: '2026-11-18T11:00:00Z', box: 'dm', seenAt: '2026-11-18T11:00:00Z' }
    const { conversations } = againstTheDb([message as never], () => [{ at: '2026-11-18T11:00:00Z', fromMe: false, from: 'grace_ships', text: 'hi' } as never], () => '  log\'s read of them: who lead, where needFound (72% sure, head)')
    expect(conversations[0]).toContain("log's read of them: who lead, where needFound")
  })

  test('the owner edits both lists in settings.json, each label with a one-line meaning', async () => {
    const file = `${process.env.LOG_INBOX_STATE}/pipelineSettings.json`
    await Bun.write(file, JSON.stringify({ pipelineLabels: { who: { buyer: 'pays for things', friend: 'a friend' } } }))
    expect(Object.keys(pipelineLabels(file).who)).toEqual(['buyer', 'friend'])
    expect(pipelineLabels(file).where).toEqual(WHERE_LABELS)
    expect(pipelineLabels(`${file}.missing`).who).toEqual(WHO_LABELS)
  })

  test('a bot needs the bot signal and the teacher, and never a chat the owner is talking in both ways', async () => {
    const prototypes = await buildPrototypes(labels, embedder)
    const [v] = await embedder.embed(['hey there, what are you building these days'])
    expect(guessOf(v, features({ botScore: 0.95 }), labels, prototypes, null, ['the name reads as a bot']).who).not.toBe('bot')
    expect(guessOf(v, features({ botScore: 0.95 }), labels, prototypes, null, [], { teacherSaysBot: true, humanTalk: true }).who).not.toBe('bot')
    const width = 256 + FEATURE_NAMES.length
    const hot = Array.from({ length: width }, (_, i) => (i === 256 + 4 ? 20 : 0))
    const botHead: PipelineHead = { model: 'hash', features: [...FEATURE_NAMES], featureScale: FEATURE_NAMES.map(() => 1), who: { labels: ['bot', 'friend', 'lead'], weights: [hot, hot.map(() => 0), hot.map(() => 0)], bias: [5, 0, 0] }, where: { labels: [], weights: [], bias: [] }, trainedAt: '2026-11-18T00:00:00Z', counts: { rows: 3 }, trainer: 'test' }
    expect(guessOf(v, features({ botScore: 0 }), labels, prototypes, botHead, [], { teacherSaysBot: true }).who).not.toBe('bot')
    const talk = said([[true, 'yo', 5000], [false, 'hey', 4000], [true, 'whats up', 3000], [false, 'shipping', 2000]], 'linus_k')
    expect(humanTalk(talk)).toBe(true)
    expect(humanTalk(said([[false, 'gm', 1000]], 'linus_k'))).toBe(false)
    const chat = { platform: 'discord', account: 'discordAccount', storedAsGroup: false, with: 'linus_k', personKey: 'linus2', conversationIds: ['linus2'], messages: talk }
    const teacherBot: LabelEntry[] = [{ platform: 'discord', account: 'discordAccount', person: 'linus2', who: 'bot', confidence: 0.99, by: 'subq', at: '2026-11-18T00:00:00Z' }]
    const headBot = row({ person: 'linus2', who: 'bot', where: null, source: 'head', confidence: 0.6, scores: { who: { bot: 0.6, friend: 0.3, lead: 0.1 }, where: {} }, features: features({ botScore: 0 }) })
    expect(labelOfChat(chat, teacherBot, NOW, headBot)).toMatchObject({ who: 'friend' })
    const realBot = row({ person: 'linus2', who: 'bot', where: null, source: 'bot', confidence: 0.97, scores: { who: { bot: 0.97, friend: 0.03 }, where: {} }, features: features({ botScore: 0.95 }) })
    const notice = { ...chat, messages: said([[false, 'you have reached level 5', 2000], [false, 'you have reached level 6', 1000]], 'levels') }
    expect(labelOfChat(notice, teacherBot, NOW, realBot)).toMatchObject({ who: 'bot' })
  })

  test('a chat goes to SubQ when the head is unsure, has no teacher label, the label is stale or the stage moved', () => {
    const lines = said([[false, 'hey', 5000], [true, 'yo', 4000], [false, 'we need 500 leads a month', 3000], [false, 'can you help', 2000], [false, 'budget is fine', 1000]])
    const base = { confidence: 0.3, where: 'needFound', whereScores: { needFound: 0.6, warming: 0.4 }, botScore: 0, said: lines, ownerLabelled: false }
    expect(fallbackReason(base)).toBe('noTeacherLabel')
    expect(fallbackReason({ ...base, ownerLabelled: true })).toBeNull()
    const old = { platform: 'discord', account: 'a', person: 'p', who: 'lead', where: 'warming', confidence: 0.9, by: 'subq', at: '2026-11-01T00:00:00Z' }
    expect(fallbackReason({ ...base, teacher: old })).toBe('stageChange')
    expect(fallbackReason({ ...base, teacher: { ...old, where: 'needFound' } })).toBe('unsure')
    expect(fallbackReason({ ...base, confidence: 0.9, teacher: { ...old, where: 'needFound' } })).toBeNull()
    expect(fallbackReason({ ...base, teacher: { ...old, throughSeq: lines[lines.length - 1].seq } })).toBeNull()
    const many = said(Array.from({ length: 13 }, (_, i) => [i % 2 === 0, `line ${i}`, 20_000 - i * 1000] as [boolean, string, number]))
    expect(fallbackReason({ ...base, confidence: 0.9, said: many, teacher: { ...old, where: 'needFound', throughSeq: many[0].seq - 1 } })).toBe('staleTeacher')
  })

  test('new messages queue unsure chats for SubQ off the push path, and the drain keeps to the daily cap, stores what it read up to and tries a retrain once enough new teacher labels arrived', async () => {
    db().exec("DELETE FROM state WHERE scope = 'pipelineTeach'")
    const now = new Date('2026-11-18T12:00:00Z')
    for (const c of ['fb1', 'fb2', 'fb3']) {
      storeRead('discord', 'fallbackAcct', c, 'dm', { id: `${c}a`, at: '2026-11-18T10:00:00Z', from: 'grace_ships', fromId: `${c}g`, fromMe: false, text: 'we need someone to build our outreach' }, now, 'live')
      storeRead('discord', 'fallbackAcct', c, 'dm', { id: `${c}b`, at: '2026-11-18T10:01:00Z', from: 'me', fromMe: true, text: 'what volume do you need' }, now, 'live')
    }
    await refreshPipeline({ platform: 'discord', account: 'fallbackAcct' }, { embedder, labels, head: null, now: NOW })
    const queued = teachQueue().filter((q) => q.account === 'fallbackAcct')
    expect(queued.map((q) => q.reason)).toEqual(['noTeacherLabel', 'noTeacherLabel', 'noTeacherLabel'])
    let asked = 0
    const client = async () => {
      asked++
      return { model: 'fake', usage: { input_tokens: 400_000, output_tokens: 0 }, answers: { who: { type: 'choice' as const, choice: 'lead', probabilities: { lead: 0.9, friend: 0.1 }, confidence: 0.9 }, where: { type: 'choice' as const, choice: 'needFound', probabilities: { needFound: 0.9 }, confidence: 0.9 } } }
    }
    let trained = 0
    const trainer = async () => {
      trained++
      return { model: 'hash', features: [...FEATURE_NAMES], featureScale: FEATURE_NAMES.map(() => 1), who: { labels: ['lead', 'friend', 'partner'], weights: [], bias: [] }, where: { labels: [], weights: [], bias: [] }, trainedAt: '2026-11-18T12:00:01Z', counts: { rows: 3 }, trainer: 'fake' }
    }
    const first = await drainTeacher({ client, labels, embedderModel: 'hash', trainer, capUsd: 0.04, now: NOW, retrainAfter: 1000 })
    expect(first.chats).toBe(3)
    expect(first.retrainedHead).toBeNull()
    expect(teachQueue().filter((q) => q.account === 'fallbackAcct')).toHaveLength(0)
    const taught = labelList().filter((e) => e.account === 'fallbackAcct')
    expect(taught.every((e) => e.by === 'subq' && typeof e.throughSeq === 'number')).toBe(true)
    expect(teachSpend(new Date(NOW).toISOString().slice(0, 10)).chats).toBe(3)
    queueForTeacher(taught.map((e) => ({ platform: e.platform, account: e.account, person: e.person, reason: 'unsure' as const, confidence: 0.2, throughSeq: 0, queuedAt: '2026-11-18T12:00:00Z' })))
    const capped = await drainTeacher({ client, labels, embedderModel: 'hash', trainer, capUsd: 0.04, now: NOW, retrainAfter: 1000 })
    expect([capped.chats, asked]).toEqual([0, 3])
    expect(capped.stopped).toContain('daily SubQ cap')
    const again = await drainTeacher({ client, labels, embedderModel: 'hash', trainer, capUsd: 1, now: NOW + 86_400_000, retrainAfter: 1, batch: 1 })
    expect([again.chats, again.left]).toEqual([1, 2])
    expect(trained).toBe(0)
    expect(again.retrain).toContain('needs at least')
    for (const e of taught) setLabel({ platform: e.platform, account: e.account, chat: e.person }, null, 'the owner')
    db().exec("DELETE FROM pipelineHeads WHERE 1 = 1; DELETE FROM state WHERE scope = 'pipelineTeach'")
  })
})
