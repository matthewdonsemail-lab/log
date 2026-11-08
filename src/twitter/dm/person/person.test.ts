import { describe, expect, test } from 'bun:test'
import type { TwitterDmThread } from '../../account/session/index'
import { onePerPerson } from '../../../search/conversations/helpers/index'
import { newMessages } from '../../../inbox/watch/client'
import { dropMirrors, followUpDue, mergeThreads, openedNoReply, personKeyOf, reactedOnly, storedThreads, waitingOnYou } from './index'

const thread = (conversationId: string, lastAt: string, over: Partial<TwitterDmThread> = {}): TwitterDmThread => ({
  conversationId,
  box: conversationId.includes(':') ? 'xchat' : 'inbox',
  type: 'oneToOne',
  with: [{ userId: '1653922877803036672', handle: 'brad_agi' }],
  lastAt,
  lastFromMe: false,
  lastText: 'hi',
  unread: false,
  messagesLoaded: 2,
  ...over,
})

describe('one conversation per person', () => {
  test('the old thread and its X Chat mirror have one key, either order', () => {
    expect(personKeyOf('1653922877803036672-1974596626342686720')).toBe(personKeyOf('1653922877803036672:1974596626342686720'))
    expect(personKeyOf('1974596626342686720:1653922877803036672')).toBe('1653922877803036672-1974596626342686720')
    expect(personKeyOf('1580000000000000000')).toBe('1580000000000000000')
  })

  test('a mirrored pair is one row with the newest message from either thread', () => {
    const rows = mergeThreads([
      thread('1653922877803036672-1974596626342686720', '2026-10-27T12:25:00Z', { lastFromMe: true, lastText: 'nice one mate' }),
      thread('1653922877803036672:1974596626342686720', '2026-10-26T20:39:56Z', { unread: true, lastText: 'news processing' }),
      thread('1413126935912325128-1974596626342686720', '2026-10-26T11:18:30Z', { with: [{ userId: '1413126935912325128', handle: 'gabesweats' }] }),
    ])
    expect(rows).toHaveLength(2)
    expect(rows[0].lastText).toBe('nice one mate')
    expect(rows[0].lastFromMe).toBe(true)
    expect(rows[0].unread).toBe(true)
    expect(rows[0].conversationIds).toEqual(['1653922877803036672-1974596626342686720', '1653922877803036672:1974596626342686720'])
    expect(rows[0].boxes).toEqual(['inbox', 'xchat'])
  })

  test('a message mirrored into both threads is shown once, even with its link rewritten', () => {
    const kept = dropMirrors([
      { time: '2026-10-26T03:43:21.565Z', fromMe: true, text: 'https://x.com/brad_agi/status/1 saw this you using treg yet' },
      { time: '2026-10-26T03:43:21.565Z', fromMe: true, text: 'https://t.co/jLYW4cDzs8 saw this you using treg yet' },
      { time: '2026-10-26T20:39:56Z', fromMe: false, from: 'brad_agi', text: 'news processing' },
      { time: '2026-10-26T20:45:00Z', fromMe: false, from: 'brad_agi', text: 'news processing' },
    ])
    expect(kept).toHaveLength(3)
  })

  test('search indexes the pair as one conversation, so one hit', () => {
    const base = { platform: 'twitter', account: 'matthewsoldit', with: ['travis'], box: 'inbox' }
    const said = { id: 'a', at: '2026-10-26T08:00:00Z', from: 'travis', fromMe: false, text: 'affiliate program referral fee' }
    const merged = onePerPerson([
      { ...base, conversationId: '1-2', messages: [said] },
      { ...base, box: 'xchat', conversationId: '1:2', messages: [{ ...said, id: 'b' }] },
    ])
    expect(merged).toHaveLength(1)
    expect(merged[0].messages).toHaveLength(1)
    expect(merged[0].box).toBe('inbox+xchat')
  })

  test('the watcher alerts once for one reply seen in both threads', () => {
    const now = new Date('2026-10-27T00:00:00Z')
    const reply = { with: 'brad_agi', lastAt: '2026-10-26T20:39:56Z', lastFromMe: false, lastText: 'news processing' }
    const seen = { '1-2': '2026-10-26T00:00:00Z' }
    const first = newMessages('twitter', 'matthewsoldit', [{ ...reply, conversationId: '1:2', box: 'xchat' }, { ...reply, conversationId: '1-2', box: 'inbox' }], seen, now)
    expect(first.messages).toHaveLength(1)
    const again = newMessages('twitter', 'matthewsoldit', [{ ...reply, conversationId: '1-2', box: 'inbox' }], first.seen, now)
    expect(again.messages).toHaveLength(0)
  })
})

describe('a reaction is a follow-up, not a reply waiting on matt', () => {
  test('their reaction as the last event means they opened it: a follow-up, never waiting on you', () => {
    const reacted = { lastFromMe: false, lastText: '(reacted ❤️)' }
    expect(reactedOnly(reacted)).toBe(true)
    expect(waitingOnYou(reacted)).toBe(false)
  })

  test('their words are waiting on you, and matt sending last is neither', () => {
    expect(waitingOnYou({ lastFromMe: false, lastText: 'Sweet will do!' })).toBe(true)
    expect(reactedOnly({ lastFromMe: false, lastText: 'they (reacted 🔥) to it lol' })).toBe(false)
    expect(reactedOnly({ lastFromMe: true, lastText: '(reacted 😂)' })).toBe(false)
    expect(waitingOnYou({ lastFromMe: true, lastText: 'yo' })).toBe(false)
  })
})

describe('an opened message with no reply is a follow-up too', () => {
  test('matt sent last and their read receipt is past it: opened, a follow-up', () => {
    const opened = { lastFromMe: true, lastText: 'saw this', openedByThem: true }
    expect(openedNoReply(opened)).toBe(true)
    expect(followUpDue(opened)).toBe(true)
    expect(waitingOnYou(opened)).toBe(false)
  })

  test('no read receipt, or they replied after it, is not an opened follow-up', () => {
    expect(followUpDue({ lastFromMe: true, lastText: 'saw this', openedByThem: false })).toBe(false)
    expect(followUpDue({ lastFromMe: true, lastText: 'saw this' })).toBe(false)
    expect(openedNoReply({ lastFromMe: false, openedByThem: true })).toBe(false)
  })
})

describe('every stored chat in the waiting list', () => {
  const chat = (conversationId: string, handle: string, messages: { at: string; fromMe: boolean; text: string }[]) => ({ conversationId, box: 'xchat', with: [handle], messages })

  test('one thread per person, its last real message deciding who wrote last', () => {
    const threads = storedThreads([
      chat('1:2', 'aymanemsi', [{ at: '2026-11-07T19:01:05Z', fromMe: true, text: 'never do i trust any service like revolut' }, { at: '2026-11-07T20:14:27Z', fromMe: false, text: 'But what can we do' }]),
      chat('1-2', 'aymanemsi', [{ at: '2026-11-07T18:00:00Z', fromMe: false, text: 'old dm' }]),
      chat('3:2', 'claudeebum', [{ at: '2026-11-07T17:12:59Z', fromMe: true, text: 'star my repo when you can bro' }, { at: '2026-11-08T02:18:21Z', fromMe: false, text: '(reacted 🫡)' }]),
      chat('4:2', 'seanlongden', [{ at: '2026-10-30T00:00:00Z', fromMe: true, text: 'yo' }, { at: '2026-11-01T16:05:00Z', fromMe: false, text: '(could not open: Crypto error: Signature verification failed: ReadReceipt)' }]),
    ])
    expect(threads.map((t) => [t.with[0].handle, t.lastFromMe])).toEqual([['aymanemsi', false], ['claudeebum', true], ['seanlongden', true]])
    expect(threads.filter(waitingOnYou).map((t) => t.with[0].handle)).toEqual(['aymanemsi'])
  })

  test('a person the newest thread could not name keeps the name a stored chat has', () => {
    const fromX = { conversationId: '362012227:1974596626342686720', box: 'xchat' as const, type: 'oneToOne' as const, with: [{ userId: '362012227' }], lastAt: '2026-11-07T20:25:49Z', lastFromMe: false, lastText: 'Idk. Team manages that.', unread: true, messagesLoaded: 1 }
    const stored = storedThreads([chat('362012227-1974596626342686720', 'honeydreamss', [{ at: '2026-11-06T21:21:47Z', fromMe: false, text: 'Nope.' }])])
    expect(mergeThreads([fromX, ...stored])[0].with[0].handle).toBe('honeydreamss')
  })
})

describe('your own reaction is not a reply', () => {
  test('a person you only reacted to is still waiting on you, marked so', () => {
    const fromX = { conversationId: '1797030036727611392:1974596626342686720', box: 'xchat' as const, type: 'oneToOne' as const, with: [{ userId: '1797030036727611392', handle: 'tahaha_a' }], lastAt: '2026-11-02T13:28:31Z', lastFromMe: true, lastText: '(reacted 😂)', unread: false, messagesLoaded: 1 }
    const stored = storedThreads([{ conversationId: '1797030036727611392:1974596626342686720', box: 'xchat', with: ['tahaha_a'], messages: [{ at: '2026-11-02T10:20:00Z', fromMe: false, text: 'Yea bro, respect the grind' }] }])
    const [merged] = mergeThreads([fromX, ...stored])
    expect(waitingOnYou(merged)).toBe(true)
    expect(merged.youReactedOnly).toBe(true)
  })
})
