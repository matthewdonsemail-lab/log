import { Database } from 'bun:sqlite'
import { beforeEach, describe, expect, test } from 'bun:test'
import { migrate } from '../schema'
import { writeEngineStore } from '../engineStore'
import { channelSendersOf, forgetOwners, placeNameOf, repairChatPlaces, typeEvent } from './index'
import type { EventInput } from './index'

const SERVER = { id: '7100000001', name: 'Lantern Guild' }
const CHANNEL = '7200000001'

function event(over: Partial<EventInput>): EventInput {
  return { eventId: 'e1', platform: 'discord', account: 'acct', conversationId: CHANNEL, type: 'message', with: 'Copper Kettle', text: 'hi', box: 'dm', payload: { id: '1', senderId: '9100000001' }, sourceAt: '2026-11-08T00:00:00Z', receivedAt: '2026-11-08T00:00:01Z', source: 'live', ...over }
}

function catalog(on: Database): void {
  writeEngineStore('discordServers', 'acct', { savedAt: 1, from: 'gateway', channels: [{ id: CHANNEL, kind: 'channel', name: `${SERVER.name} #buildNight`, members: [], server: SERVER.name, serverId: SERVER.id }] }, on, 1000)
}

const stored = (on: Database) => on.prepare('SELECT kind, name, serverId FROM chats WHERE conversationId = ?').get(CHANNEL)

let handle: Database

beforeEach(() => {
  forgetOwners()
  handle = new Database(':memory:')
  migrate(handle)
})

describe('a chat takes its kind and name from the best source that knows them', () => {
  test('a server channel first stored as a dm named after a speaker becomes the channel once the catalog knows it', () => {
    typeEvent(handle, event({}))
    expect(stored(handle)).toEqual({ kind: 'dm', name: 'Copper Kettle', serverId: null })
    catalog(handle)
    typeEvent(handle, event({ eventId: 'e2', with: 'Brass Owl', payload: { id: '2', senderId: '9100000002' } }))
    expect(stored(handle)).toEqual({ kind: 'channel', name: 'buildNight', serverId: SERVER.id })
    expect(placeNameOf(handle, 'discord', 'acct', CHANNEL)).toBe('Lantern Guild #buildNight')
  })

  test('a guild id on the message makes it a channel and drops the speaker name, and a later dm-looking event never turns it back', () => {
    typeEvent(handle, event({}))
    typeEvent(handle, event({ eventId: 'e2', payload: { id: '2', senderId: '9100000001', guildId: SERVER.id } }))
    expect(stored(handle)).toEqual({ kind: 'channel', name: null, serverId: SERVER.id })
    typeEvent(handle, event({ eventId: 'e3', with: 'Brass Owl', payload: { id: '3', senderId: '9100000002' } }))
    expect(stored(handle)).toEqual({ kind: 'channel', name: null, serverId: SERVER.id })
  })

  test('a real dm keeps its kind and name', () => {
    catalog(handle)
    typeEvent(handle, event({ conversationId: '7300000001' }))
    expect(handle.prepare('SELECT kind, name FROM chats WHERE conversationId = ?').get('7300000001')).toEqual({ kind: 'dm', name: 'Copper Kettle' })
  })
})

describe('who spoke in a channel', () => {
  test('lists the latest distinct senders of each server channel, never the owner', () => {
    catalog(handle)
    typeEvent(handle, event({}))
    typeEvent(handle, event({ eventId: 'e2', with: 'Brass Owl', payload: { id: '2', senderId: '9100000002' }, sourceAt: '2026-11-08T00:01:00Z' }))
    typeEvent(handle, event({ eventId: 'e3', type: 'ownMessage', with: 'me', payload: { id: '3' }, sourceAt: '2026-11-08T00:02:00Z' }))
    expect(channelSendersOf(handle, 'discord', 'acct').get(CHANNEL)).toEqual(['Brass Owl', 'Copper Kettle'])
  })
})

describe('the chatPlaces repair', () => {
  test('corrects rows stored before the catalog was known, once, and counts them', () => {
    typeEvent(handle, event({}))
    typeEvent(handle, event({ eventId: 'g1', conversationId: '7200000009', payload: { id: '9', senderId: '9100000003' } }))
    handle.prepare("UPDATE chats SET serverId = ? WHERE conversationId = '7200000009'").run(SERVER.id)
    typeEvent(handle, event({ eventId: 'd1', conversationId: '7300000001' }))
    catalog(handle)
    expect(stored(handle)).toEqual({ kind: 'dm', name: 'Copper Kettle', serverId: null })
    expect(repairChatPlaces(handle)).toBe(2)
    expect(stored(handle)).toEqual({ kind: 'channel', name: 'buildNight', serverId: SERVER.id })
    expect(handle.prepare("SELECT kind, name FROM chats WHERE conversationId = '7200000009'").get()).toEqual({ kind: 'channel', name: null })
    expect(handle.prepare("SELECT kind, name FROM chats WHERE conversationId = '7300000001'").get()).toEqual({ kind: 'dm', name: 'Copper Kettle' })
    expect(repairChatPlaces(handle)).toBe(0)
  })

  test('runs as migration 28 on a db left at 27', () => {
    typeEvent(handle, event({}))
    catalog(handle)
    handle.exec('PRAGMA user_version = 27')
    expect(migrate(handle).map((m) => m.name)).toEqual(['chatPlaces', 'networkRings', 'networkFit', 'chatGroups', 'personFacts'])
    expect(stored(handle)).toEqual({ kind: 'channel', name: 'buildNight', serverId: SERVER.id })
  })
})
