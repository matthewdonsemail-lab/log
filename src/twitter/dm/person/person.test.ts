import { describe, expect, test } from 'bun:test'
import type { TwitterDmThread } from '../../account/session/index'
import { onePerPerson } from '../../../search/conversations/helpers/index'
import { newMessages } from '../../../inbox/watch/client'
import { dropMirrors, mergeThreads, personKeyOf, reactedOnly, waitingOnYou } from './index'

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
