import { expect, test } from 'bun:test'
import { roomFromRead, roomOf } from './index'

const now = new Date('2026-11-05T15:20:00Z')

test('a channel where only matt has spoken lately is talked to as a whole, never as one person', () => {
  const room = roomOf('paulchrisluke #general', 'channel', [
    { from: 'paulchrisluke', fromMe: false, at: '2026-10-11T00:52:48Z' },
    { from: 'matt', fromMe: true, at: '2026-11-05T15:04:40Z' },
    { from: 'matt', fromMe: true, at: '2026-11-05T15:05:10Z' },
  ], now)
  expect(room.nobodyElseLately).toBe(true)
  expect(room.mattsInARowAtTheEnd).toBe(2)
  expect(room.lastFromOthers?.who).toBe('paulchrisluke')
  expect(room.lastFromOthers?.daysAgo).toBe(25)
  expect(room.addressTo).toContain('the channel as a whole')
})

test('a group with people talking now is addressed to them', () => {
  const room = roomOf('log', 'group', [
    { from: 'aj', fromMe: false, at: '2026-11-05T15:10:00Z' },
    { from: 'deepman', fromMe: false, at: '2026-11-05T15:12:00Z' },
    { from: 'bot', fromMe: false, at: '2026-11-05T15:13:00Z', bot: true },
  ], now)
  expect(room.othersActiveLately).toEqual(['aj', 'deepman'])
  expect(room.addressTo).toBe('the people talking here now: aj, deepman')
})

test('a failed read gives no room rather than a wrong one', () => {
  expect(roomFromRead('aj', 'dm', { ok: false })).toBeUndefined()
  expect(roomFromRead('aj', 'dm', { ok: true, messages: [{ from: 'aj', fromMe: false, at: '2026-11-05T15:00:00Z' }] }, now)?.addressTo).toBe('the one person in this DM (aj)')
})
