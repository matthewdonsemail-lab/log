import { Database } from 'bun:sqlite'
import { beforeEach, describe, expect, test } from 'bun:test'
import { migrate } from '../schema'
import { EXTENDERS, chatIdOf, countsOf, forgetOwners, lastMessagesOf, messagesFromIdentity, ownerIdFromPairs, typeEvent } from './index'
import type { EventInput } from './index'

function event(over: Partial<EventInput>): EventInput {
  return { eventId: 'e1', platform: 'discord', account: 'acct', conversationId: 'c1', type: 'message', with: 'dex', text: 'hi', box: 'dm', payload: {}, sourceAt: '2026-11-08T00:00:00Z', receivedAt: '2026-11-08T00:00:01Z', source: 'live', ...over }
}

let handle: Database

beforeEach(() => {
  forgetOwners()
  handle = new Database(':memory:')
  migrate(handle)
})

describe('platform extenders', () => {
  test('every chat platform has an extender with every to function', () => {
    for (const platform of ['twitter', 'discord', 'slack', 'instagram', 'reddit']) {
      const extender = EXTENDERS[platform]
      expect(extender.platform).toBe(platform)
      for (const fn of ['toChat', 'toIdentities', 'toMessage', 'toAttachments', 'toInteraction'] as const) expect(typeof extender[fn]).toBe('function')
    }
  })

  test('a Discord voice message and an X Chat audio message land as one message and one audio attachment each', () => {
    typeEvent(handle, event({ eventId: 'd1', payload: { id: '111', senderId: '42', attachments: [{ name: 'voice-message.ogg', type: 'audio/ogg', duration: 3.5 }] } }))
    typeEvent(handle, event({ eventId: 'x1', platform: 'twitter', conversationId: '9:1974', with: 'handle_h1', box: 'xchat', payload: { id: 'm1', attachments: [{ name: 'note.m4a', type: 'audio/mp4' }] } }))
    const rows = handle.prepare('SELECT kind, durationMs FROM attachments ORDER BY messageKey').all() as { kind: string; durationMs: number | null }[]
    expect(rows.map((r) => r.kind)).toEqual(['audio', 'audio'])
    expect(rows.find((r) => r.durationMs !== null)?.durationMs).toBe(3500)
    expect(countsOf(handle).messages).toBe(2)
  })

  test('a message pushed by the watch and the same message read later are one row', () => {
    typeEvent(handle, event({ eventId: 'live', payload: { id: '111', senderId: '42' }, source: 'live' }))
    typeEvent(handle, event({ eventId: 'later', payload: { id: '111', senderId: '42' }, source: 'catchUp' }))
    expect(countsOf(handle).messages).toBe(1)
  })

  test('the sender id the watcher keeps becomes the identity, named by its handle', () => {
    typeEvent(handle, event({ payload: { id: '111', senderId: '42' } }))
    expect(handle.prepare('SELECT userId, handle FROM identities').all()).toEqual([{ userId: '42', handle: 'dex' }])
    expect(messagesFromIdentity(handle, 'discord', '42').map((m) => m.text)).toEqual(['hi'])
  })

  test('without an id the sender is kept by handle, never dropped', () => {
    typeEvent(handle, event({ platform: 'instagram', payload: {} }))
    expect(handle.prepare('SELECT senderUserId FROM messages').get()).toEqual({ senderUserId: '@dex' })
  })

  test('own messages are from the owner and add no membership', () => {
    typeEvent(handle, event({ type: 'ownMessage', with: 'me', payload: { id: '5' } }))
    const [message] = lastMessagesOf(handle, chatIdOf('discord', 'acct', 'c1'))
    expect(message.fromOwner).toBe(true)
    expect(message.senderUserId).toBe('self:acct')
    expect(countsOf(handle).identities).toBe(0)
  })

  test('an X dm names the other side of the pair once the owner is known from the account\'s chats', () => {
    expect(ownerIdFromPairs(['1:900', '2:900', '3:900'])).toBe('900')
    expect(ownerIdFromPairs(['1:900'])).toBeNull()
    for (const [i, cid] of ['1:900', '2:900'].entries()) handle.prepare("INSERT INTO events (eventId, platform, account, conversationId, type, receivedAt, appendedAt) VALUES (?, 'twitter', 'acct', ?, 'message', 'now', 'now')").run(`p${i}`, cid)
    typeEvent(handle, event({ platform: 'twitter', conversationId: '1:900', with: 'someone', payload: { id: 'm1' } }))
    expect(handle.prepare('SELECT senderUserId FROM messages').get()).toEqual({ senderUserId: '1' })
  })

  test('an X notification is one interaction and teaches who the actor is', () => {
    typeEvent(handle, event({ platform: 'twitter', type: 'notification', conversationId: '', with: 'dex_1', payload: { key: 'like:1:2', kind: 'like', userId: '2039', handle: 'dex_1', name: 'Mandy', postId: '77', postText: 'my post', at: '2026-11-07T19:23:14Z' } }))
    expect(handle.prepare('SELECT kind, actorUserId, targetRef FROM interactions').get()).toEqual({ kind: 'like', actorUserId: '2039', targetRef: '77' })
    expect(handle.prepare('SELECT handle, displayName FROM identities').get()).toEqual({ handle: 'dex_1', displayName: 'Mandy' })
    expect(countsOf(handle).messages).toBe(0)
  })

  test('a Discord server channel is a channel with its server, and a reply points at its message', () => {
    typeEvent(handle, event({ box: 'mention', payload: { id: '2', senderId: '42', serverId: '777', replyTo: '1' } }))
    expect(handle.prepare('SELECT kind, serverId FROM chats').get()).toEqual({ kind: 'channel', serverId: '777' })
    expect(handle.prepare('SELECT replyToKey FROM messages').get()).toEqual({ replyToKey: `${chatIdOf('discord', 'acct', 'c1')}:1` })
  })
})

describe('X shapes', () => {
  test('a group message given as a bare id is from that id, and an old dash pair names the other side', () => {
    typeEvent(handle, event({ platform: 'twitter', conversationId: 'g2116', with: '2037498762453491712', payload: { id: 'g1' } }))
    for (const [i, cid] of ['1-900', '2-900'].entries()) handle.prepare("INSERT INTO events (eventId, platform, account, conversationId, type, receivedAt, appendedAt) VALUES (?, 'twitter', 'acct', ?, 'message', 'now', 'now')").run(`d${i}`, cid)
    typeEvent(handle, event({ platform: 'twitter', conversationId: '1-900', with: 'HandleT2', payload: { id: 'd1' } }))
    expect((handle.prepare('SELECT senderUserId FROM messages ORDER BY seq').all() as { senderUserId: string }[]).map((r) => r.senderUserId)).toEqual(['2037498762453491712', '1'])
  })
})
