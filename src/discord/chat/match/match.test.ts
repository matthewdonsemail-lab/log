import { describe, expect, test } from 'bun:test'
import { matchChat, normalizedName } from './index'
import type { DiscordChat } from './index'

const CHATS: DiscordChat[] = [
  { id: '1000000000000000001', kind: 'group', name: 'log', members: ['QuietSparrow', 'Kira', 'Jon', 'dex'] },
  { id: '1000000000000000011', kind: 'dm', name: null, members: ['Wren'] },
  { id: '1000000000000000012', kind: 'group', name: 'Studio x Partners', members: ['Robin Vale', 'Mika'] },
  { id: '1000000000000000013', kind: 'group', name: 'Studio x Client Example', members: ['Robin Vale'] },
  { id: '1000000000000000002', kind: 'dm', name: 'Jon', members: ['Jon'] },
  { id: '1000000000000000003', kind: 'dm', name: 'Jon', members: ['Jon'] },
  { id: '1000000000000000014', kind: 'group', name: 'Fun and chat fun', members: ['Ash', 'x'] },
  { id: '1000000000000000015', kind: 'group', name: null, members: ['Ash', 'Breeze'] },
]

describe('a chat said the way matt says it', () => {
  test('filler words go, the name stays', () => {
    expect(normalizedName('the log community group chat')).toBe('log')
    expect(normalizedName('DM with Wren')).toBe('wren')
    expect(normalizedName('Fun and chat fun')).toBe('fun fun')
  })

  test('the log group, however it is said', () => {
    for (const said of ['log', 'the log group chat', 'log community group chat', 'LOG gc'])
      expect(matchChat(CHATS, said)).toMatchObject({ ok: true, chat: { id: '1000000000000000001' } })
  })

  test('a DM with no name is found by who it is with', () => {
    expect(matchChat(CHATS, 'wren')).toMatchObject({ ok: true, chat: { id: '1000000000000000011' }, label: 'Wren' })
    expect(matchChat(CHATS, 'my dm with wren')).toMatchObject({ ok: true, chat: { id: '1000000000000000011' } })
  })

  test('one word of a longer name finds it when only one chat has it', () => {
    expect(matchChat(CHATS, 'partners')).toMatchObject({ ok: true, chat: { id: '1000000000000000012' }, how: 'words' })
    expect(matchChat(CHATS, 'client')).toMatchObject({ ok: true, chat: { id: '1000000000000000013' } })
  })

  test('the start of a word is enough', () => {
    expect(matchChat(CHATS, 'partn')).toMatchObject({ ok: true, chat: { id: '1000000000000000012' }, how: 'prefix' })
  })

  test('two chats that fit equally are refused with both, never guessed', () => {
    const r = matchChat(CHATS, 'jon')
    expect(r).toMatchObject({ ok: false, code: 'chatAmbiguous' })
    expect(!r.ok && r.candidates.map((c) => c.id)).toEqual(['1000000000000000002', '1000000000000000003'])
    expect(matchChat(CHATS, 'studio')).toMatchObject({ ok: false, code: 'chatAmbiguous' })
  })

  test('an unnamed group is found by its members', () => {
    expect(matchChat(CHATS, 'ash and breeze')).toMatchObject({ ok: true, chat: { id: '1000000000000000015' } })
    expect(matchChat(CHATS, 'breeze')).toMatchObject({ ok: true, chat: { id: '1000000000000000015' }, label: 'Ash, Breeze' })
  })

  test('a person named exactly is their DM, never an unnamed group they are in', () => {
    const chats = [
      { id: '1000000000000000004', kind: 'dm', name: null, members: ['Lars'] },
      { id: '1000000000000000005', kind: 'group', name: null, members: ['bea', 'Lars', 'dex', 'ORCAFAN'] },
    ] as never
    expect(matchChat(chats, 'lars')).toMatchObject({ ok: true, chat: { id: '1000000000000000004' }, how: 'exact' })
    expect(matchChat(chats, 'dex')).toMatchObject({ ok: true, chat: { id: '1000000000000000005' } })
  })

  test('an id is taken as it is, and nothing matching is said so', () => {
    expect(matchChat(CHATS, '1000000000000000001')).toMatchObject({ ok: true, how: 'id' })
    expect(matchChat(CHATS, 'nobody here')).toMatchObject({ ok: false, code: 'chatNotFound' })
  })
})
