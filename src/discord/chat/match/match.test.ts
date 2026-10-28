import { describe, expect, test } from 'bun:test'
import { matchChat, normalizedName } from './index'
import type { DiscordChat } from './index'

const CHATS: DiscordChat[] = [
  { id: '1547936265436012645', kind: 'group', name: 'log', members: ['QuadScorpion', 'Kennedy', 'John', 'deepman'] },
  { id: '1555254123148873869', kind: 'dm', name: null, members: ['Jilly'] },
  { id: '1486058706532827228', kind: 'group', name: 'InferenceSaver x Listaro', members: ['Mommi Live', 'Afreca'] },
  { id: '1491844115107680287', kind: 'group', name: 'InferenceSaver x Roger Holden', members: ['Mommi Live'] },
  { id: '1445349429094649991', kind: 'dm', name: 'John', members: ['John'] },
  { id: '1477596248683839538', kind: 'dm', name: 'John', members: ['John'] },
  { id: '1547711712906448947', kind: 'group', name: 'Shit and chat shit', members: ['Tin', 'x'] },
  { id: '1481763504003354704', kind: 'group', name: null, members: ['Tin', 'Careless'] },
]

describe('a chat said the way matt says it', () => {
  test('filler words go, the name stays', () => {
    expect(normalizedName('the log community group chat')).toBe('log')
    expect(normalizedName('DM with Jilly')).toBe('jilly')
    expect(normalizedName('Shit and chat shit')).toBe('shit shit')
  })

  test('the log group, however it is said', () => {
    for (const said of ['log', 'the log group chat', 'log community group chat', 'LOG gc'])
      expect(matchChat(CHATS, said)).toMatchObject({ ok: true, chat: { id: '1547936265436012645' } })
  })

  test('a DM with no name is found by who it is with', () => {
    expect(matchChat(CHATS, 'jilly')).toMatchObject({ ok: true, chat: { id: '1555254123148873869' }, label: 'Jilly' })
    expect(matchChat(CHATS, 'my dm with jilly')).toMatchObject({ ok: true, chat: { id: '1555254123148873869' } })
  })

  test('one word of a longer name finds it when only one chat has it', () => {
    expect(matchChat(CHATS, 'listaro')).toMatchObject({ ok: true, chat: { id: '1486058706532827228' }, how: 'words' })
    expect(matchChat(CHATS, 'roger')).toMatchObject({ ok: true, chat: { id: '1491844115107680287' } })
  })

  test('the start of a word is enough', () => {
    expect(matchChat(CHATS, 'lista')).toMatchObject({ ok: true, chat: { id: '1486058706532827228' }, how: 'prefix' })
  })

  test('two chats that fit equally are refused with both, never guessed', () => {
    const r = matchChat(CHATS, 'john')
    expect(r).toMatchObject({ ok: false, code: 'chatAmbiguous' })
    expect(!r.ok && r.candidates.map((c) => c.id)).toEqual(['1445349429094649991', '1477596248683839538'])
    expect(matchChat(CHATS, 'inferencesaver')).toMatchObject({ ok: false, code: 'chatAmbiguous' })
  })

  test('an unnamed group is found by its members', () => {
    expect(matchChat(CHATS, 'tin and careless')).toMatchObject({ ok: true, chat: { id: '1481763504003354704' } })
    expect(matchChat(CHATS, 'careless')).toMatchObject({ ok: true, chat: { id: '1481763504003354704' }, label: 'Tin, Careless' })
  })

  test('an id is taken as it is, and nothing matching is said so', () => {
    expect(matchChat(CHATS, '1547936265436012645')).toMatchObject({ ok: true, how: 'id' })
    expect(matchChat(CHATS, 'nobody here')).toMatchObject({ ok: false, code: 'chatNotFound' })
  })
})
