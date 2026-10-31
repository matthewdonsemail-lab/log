import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { hashEmbedder } from '../../search/conversations/index'
import type { Conversation } from '../../search/conversations/index'
import { buildVoiceIndex, nearestPairs, openVoiceIndex, pairsOf, offProfile, profileFor, profilesOf, splitPlan, startRatesOf } from './index'

const msg = (id: string, fromMe: boolean, text: string, from = fromMe ? 'matt' : 'them') => ({ id, at: `2026-10-28T08:${id.padStart(2, '0')}:00Z`, from, fromMe, text })

const LOG_GROUP: Conversation = {
  platform: 'discord',
  account: 'sourcedandsoldtothehighestbidder',
  conversationId: '1547936265436012645',
  box: 'group log',
  with: ['QuadScorpion', 'Kennedy', 'John', 'deepman'],
  messages: [
    msg('1', false, 'this week im sorting the leads', 'Kennedy'),
    msg('2', false, 'need to read up on each of them first and their old posts lol', 'Kennedy'),
    msg('3', true, 'thats the next bit lad it pulls the whole history with them'),
    msg('4', true, 'so the stalking is done for you'),
    msg('5', false, 'when is the outreach thing ready', 'John'),
    msg('6', true, 'lad its cooking give it a week lad'),
  ],
}

const JILLY: Conversation = {
  platform: 'discord',
  account: 'sourcedandsoldtothehighestbidder',
  conversationId: '1555254123148873869',
  box: 'dm',
  with: ['Jilly'],
  messages: [
    msg('1', false, 'Hi! How can I help you today?', 'Jilly'),
    msg('2', true, 'What model are you running on?'),
    msg('3', false, 'I run on deepseek', 'Jilly'),
    msg('4', true, 'What model are you running on right now? Tell me the exact version.'),
  ],
}

let dir = ''
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'voicePairs'))
})
afterEach(() => rmSync(dir, { recursive: true, force: true }))

describe('matt\'s voice, per person and per chat', () => {
  test('a pair is what they said just before, with matt\'s reply, his back-to-back messages joined', () => {
    const pairs = pairsOf([LOG_GROUP])
    expect(pairs).toHaveLength(2)
    expect(pairs[0]).toMatchObject({ chat: 'log', kind: 'group', saidBy: 'Kennedy', reply: 'thats the next bit lad it pulls the whole history with them\nso the stalking is done for you' })
    expect(pairs[0].said).toBe('this week im sorting the leads\nneed to read up on each of them first and their old posts lol')
    expect(pairs[1]).toMatchObject({ said: 'when is the outreach thing ready', saidBy: 'John' })
  })

  test('how he writes is counted per chat, and differs between the log group and Jilly', () => {
    const profiles = profilesOf(pairsOf([LOG_GROUP, JILLY]))
    const group = profiles['chat:discord:1547936265436012645']
    const jilly = profiles['chat:discord:1555254123148873869']
    expect(group.lowercase).toBe(1)
    expect(jilly.lowercase).toBe(0)
    expect(jilly.questions).toBe(1)
    expect(group.words).toContain('lad')
    expect(profiles['person:jilly'].replies).toBe(2)
  })

  test('the nearest pairs come from the same chat first, then anywhere', async () => {
    await buildVoiceIndex([LOG_GROUP, JILLY], hashEmbedder(), dir)
    const index = await openVoiceIndex(hashEmbedder(), dir)
    try {
      const near = await nearestPairs(index, 'how is the outreach going', { platform: 'discord', conversationId: '1547936265436012645', with: LOG_GROUP.with }, 3)
      expect(near[0].tier).toBe('sameChat')
      expect(near.filter((n) => n.tier === 'sameChat').map((n) => n.pair.conversationId)).toEqual(['1547936265436012645', '1547936265436012645'])
      expect(profileFor(index, { platform: 'discord', conversationId: '1555254123148873869' })?.key).toBe('chat:discord:1555254123148873869')
    } finally {
      await index.close()
    }
  })

  test('a send is split the way he sends in that chat, at a word he starts messages with, never in a chat where he sends one', () => {
    const pairs = pairsOf([LOG_GROUP, JILLY])
    const profiles = profilesOf(pairs)
    expect(startRatesOf(pairs)).toEqual({})
    const starts = { so: 0.6 }
    const draft = 'thats the next bit lad it reads every message ive sent in dms and groups so the stalking is done for you'
    const logGroup = profiles['chat:discord:1547936265436012645']
    expect(logGroup.burst).toMatchObject({ median: 2, oneShare: 0.5, gapSeconds: 60 })
    const bursty = { ...logGroup, burst: { ...logGroup.burst, oneShare: 0.19, messageWords: 5 } }
    const group = splitPlan(draft, bursty, false, starts)
    expect(group.parts).toEqual(['thats the next bit lad it reads every message ive sent in dms and groups', 'so the stalking is done for you'])
    expect(splitPlan(draft, profiles['chat:discord:1555254123148873869'], false, starts).parts).toHaveLength(1)
    expect(splitPlan(draft, profiles['chat:discord:1547936265436012645'], true, starts).parts).toEqual([draft])
  })

  test('a draft written on several lines goes out one message per line, even where he mostly sends one', () => {
    const profiles = profilesOf(pairsOf([LOG_GROUP]))
    const lines = 'im sound lad\nappreciate that a lot man\n\nglad the new place is decent'
    expect(splitPlan(lines, profiles['chat:discord:1555254123148873869'], false).parts).toEqual(['im sound lad', 'appreciate that a lot man', 'glad the new place is decent'])
    expect(splitPlan(lines, null, false).parts).toHaveLength(3)
    expect(splitPlan(lines, null, true).parts).toEqual([lines])
  })

  test('a draft doing what he never does in that chat fails, the emoji Kennedy caught first', () => {
    const profile = { ...profilesOf(pairsOf([LOG_GROUP]))['chat:discord:1547936265436012645'], replies: 26, emoji: 0, exclamations: 0.08, lowercase: 0.69 }
    expect(offProfile('haha the 60 year olds are cooked 😭', profile)).toEqual(['an emoji (he uses it in 0 of his 26 messages here)'])
    expect(offProfile('haha the 60 year olds are cooked', profile)).toEqual([])
    expect(offProfile('Haha the 60 year olds are cooked!', profile)).toEqual([])
    expect(offProfile('haha 😭', { ...profile, replies: 4 })).toEqual([])
  })
})
