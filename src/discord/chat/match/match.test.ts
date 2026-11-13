import { describe, expect, test } from 'bun:test'
import { matchChat, normalizedName } from './index'
import type { DiscordChat } from './index'

const CHATS: DiscordChat[] = [
  { id: '1000000000000000001', kind: 'group', name: 'log', members: ['QuietSparrow', 'Kira', 'Jon', 'dex'] },
  { id: '1555254123148873869', kind: 'dm', name: null, members: ['Jinny'] },
  { id: '1486058706532827228', kind: 'group', name: 'InferenceSaver x Listaro', members: ['Mommi Live', 'Afreca'] },
  { id: '1491844115107680287', kind: 'group', name: 'InferenceSaver x Client Example', members: ['Mommi Live'] },
  { id: '1000000000000000002', kind: 'dm', name: 'Jon', members: ['Jon'] },
  { id: '1000000000000000003', kind: 'dm', name: 'Jon', members: ['Jon'] },
  { id: '1547711712906448947', kind: 'group', name: 'Shit and chat shit', members: ['Tin', 'x'] },
  { id: '1481763504003354704', kind: 'group', name: null, members: ['Tin', 'Careless'] },
]

describe('a chat said the way matt says it', () => {
  test('filler words go, the name stays', () => {
    expect(normalizedName('the log community group chat')).toBe('log')
    expect(normalizedName('DM with Jinny')).toBe('jinny')
    expect(normalizedName('Shit and chat shit')).toBe('shit shit')
  })

  test('the log group, however it is said', () => {
    for (const said of ['log', 'the log group chat', 'log community group chat', 'LOG gc'])
      expect(matchChat(CHATS, said)).toMatchObject({ ok: true, chat: { id: '1000000000000000001' } })
  })

  test('a DM with no name is found by who it is with', () => {
    expect(matchChat(CHATS, 'jinny')).toMatchObject({ ok: true, chat: { id: '1555254123148873869' }, label: 'Jinny' })
    expect(matchChat(CHATS, 'my dm with jinny')).toMatchObject({ ok: true, chat: { id: '1555254123148873869' } })
  })

  test('one word of a longer name finds it when only one chat has it', () => {
    expect(matchChat(CHATS, 'listaro')).toMatchObject({ ok: true, chat: { id: '1486058706532827228' }, how: 'words' })
    expect(matchChat(CHATS, 'client')).toMatchObject({ ok: true, chat: { id: '1491844115107680287' } })
  })

  test('the start of a word is enough', () => {
    expect(matchChat(CHATS, 'lista')).toMatchObject({ ok: true, chat: { id: '1486058706532827228' }, how: 'prefix' })
  })

  test('two chats that fit equally are refused with both, never guessed', () => {
    const r = matchChat(CHATS, 'jon')
    expect(r).toMatchObject({ ok: false, code: 'chatAmbiguous' })
    expect(!r.ok && r.candidates.map((c) => c.id)).toEqual(['1000000000000000002', '1000000000000000003'])
    expect(matchChat(CHATS, 'inferencesaver')).toMatchObject({ ok: false, code: 'chatAmbiguous' })
  })

  test('an unnamed group is found by its members', () => {
    expect(matchChat(CHATS, 'tin and careless')).toMatchObject({ ok: true, chat: { id: '1481763504003354704' } })
    expect(matchChat(CHATS, 'careless')).toMatchObject({ ok: true, chat: { id: '1481763504003354704' }, label: 'Tin, Careless' })
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
