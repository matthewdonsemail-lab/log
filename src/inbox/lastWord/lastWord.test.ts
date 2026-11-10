import { describe, expect, test } from 'bun:test'
import { storeRead } from '../catchUp/index'
import { lastWordOf, lastWordOfMessages, personKeyOf, waitingOf, withoutMirrors } from './index'
import type { LastWordMessage } from './index'

const chat = { platform: 'twitter', account: 'me', kind: 'dm' as const, with: 'them', conversationIds: ['1-2'] }
let seq = 0
const msg = (at: string, fromOwner: boolean, text: string, over: Partial<LastWordMessage> = {}): LastWordMessage => ({ conversationId: '1-2', seq: ++seq, ms: Date.parse(at), at, fromOwner, senderUserId: fromOwner ? '1' : '2', senderLabel: null, text, files: 0, ...over })

describe('who wrote last is decided by time, from the .db, the same on every platform', () => {
  test('their message after mine means they are waiting; mine after theirs means I wrote last', () => {
    expect(lastWordOfMessages(chat, [msg('2026-11-01T01:00:00Z', true, 'hey'), msg('2026-11-01T02:00:00Z', false, 'yo whats good')])).toMatchObject({ lastFromMe: false, waiting: true, lastText: 'yo whats good' })
    expect(lastWordOfMessages(chat, [msg('2026-11-01T01:00:00Z', false, 'yo'), msg('2026-11-01T02:00:00Z', true, 'all good lad')])).toMatchObject({ lastFromMe: true, waiting: false })
  })

  test('time decides, never the order rows were stored in: a backfilled older message stored later is not the last word', () => {
    const live = msg('2026-11-07T14:11:00Z', false, 'i am locked', { seq: 10 })
    const backfilled = msg('2026-07-12T06:13:00Z', true, 'old one from the backfill', { seq: 900 })
    expect(lastWordOfMessages(chat, [backfilled, live])).toMatchObject({ lastFromMe: false, lastText: 'i am locked' })
  })

  test('my message mirrored into X Chat as theirs is mine: the earliest copy of a text decides whose it is', () => {
    const opener = 'hey saw the follow but we aint chatted yet whats good'
    const kept = withoutMirrors([msg('2026-10-26T03:41:04Z', true, opener), msg('2026-10-26T05:59:35Z', false, opener, { conversationId: '1:2' })])
    expect(kept).toHaveLength(1)
    expect(lastWordOfMessages(chat, kept)).toMatchObject({ lastFromMe: true, waiting: false })
  })

  test('a short line both sides happen to say is not taken for a mirror', () => {
    expect(withoutMirrors([msg('2026-11-01T01:00:00Z', true, 'yo'), msg('2026-11-01T01:01:00Z', false, 'yo')])).toHaveLength(2)
  })

  test('their reaction after my last message is a follow-up, not a reply they wait on', () => {
    const word = lastWordOfMessages(chat, [msg('2026-11-07T17:12:00Z', true, 'star my repo when you can bro'), msg('2026-11-08T02:18:00Z', false, '(reacted 🫡)')])
    expect(word).toMatchObject({ lastFromMe: false, waiting: false, followUp: true, theyReacted: '🫡', lastText: '(reacted 🫡)' })
  })

  test('my reaction alone after their message leaves them waiting, marked as only reacted', () => {
    expect(lastWordOfMessages(chat, [msg('2026-11-05T21:57:00Z', false, 'mostly financial reconciliation'), msg('2026-11-06T13:26:00Z', true, '(reacted 🔥)')])).toMatchObject({ waiting: true, youReactedOnly: true })
  })

  test('an empty message is still something sent (a voice note, image or sticker); read markers and call notices are not', () => {
    expect(lastWordOfMessages(chat, [msg('2026-11-07T14:21:00Z', false, 'try promoting it'), msg('2026-11-07T14:26:00Z', true, '')])).toMatchObject({ lastFromMe: true })
    expect(lastWordOfMessages(chat, [msg('2026-11-07T14:21:00Z', false, 'you there'), msg('2026-11-07T14:26:00Z', true, '> *Started a call.*'), msg('2026-11-07T14:27:00Z', true, '(read)')])).toMatchObject({ lastFromMe: false, waiting: true })
  })

  test('an X user\'s old DM and X Chat threads are one person', () => {
    expect(personKeyOf('2-1')).toBe(personKeyOf('1:2'))
    expect(personKeyOf('g2004865989830476207')).toBe('g2004865989830476207')
  })
})

describe('the .db answers who wrote last for every chat at once', () => {
  test('one person\'s two X chats are judged together, in time order', () => {
    const now = new Date('2026-11-08T00:00:00Z')
    storeRead('twitter', 'lastWordAcct', '11-22', 'dm', { id: 'a1', at: '2026-10-26T04:12:17Z', from: '22', fromMe: false, text: 'oh sick, i will check it out' }, now, 'live')
    storeRead('twitter', 'lastWordAcct', '22:11', 'dm', { id: 'a2', at: '2026-10-31T06:43:07Z', from: 'me', fromMe: true, text: 'you out in sf then lad' }, now, 'backfill')
    storeRead('twitter', 'lastWordAcct', '11-33', 'dm', { id: 'b1', at: '2026-11-07T15:34:50Z', from: '33', fromMe: false, text: 'grew it from 60 to 8300' }, now, 'live')
    const words = lastWordOf({ platform: 'twitter', account: 'lastWordAcct' })
    expect(words).toHaveLength(2)
    expect(words.find((w) => w.personKey === '11-22')).toMatchObject({ lastFromMe: true, waiting: false, conversationIds: expect.arrayContaining(['11-22', '22:11']) })
    expect(waitingOf(words).waiting.map((w) => w.personKey)).toEqual(['11-33'])
  })
})
