import { expect, test } from 'bun:test'

test('an id is never a label: X, Discord and Slack ids are bare ids, names are not', async () => {
  const { isBareId } = await import('./client')
  expect(isBareId('2305857931')).toBe(true)
  expect(isBareId('@1749464605405958144')).toBe(true)
  expect(isBareId('U0C4VCD06MR')).toBe(true)
  expect(isBareId(['3f2b8c1e', '1a2b', '4c3d', '8e9f', '0a1b2c3d4e5f'].join('-'))).toBe(true)
  expect(isBareId('RVAClassic')).toBe(false)
  expect(isBareId('Wonderfuldude')).toBe(false)
  expect(isBareId('aj')).toBe(false)
})

test('an event that names its sender teaches the store, and a later one sent by id alone is named from it', async () => {
  const { appendEvent, eventsAfter, namedLabel } = await import('./client')
  appendEvent({ platform: 'twitter', account: 'matthewsoldit', conversationId: 'gPeopleTest', type: 'message', with: 'VinhTheOverlord', text: 'Ok bro', payload: { senderId: '2037498762453491712', from: 'VinhTheOverlord' } })
  appendEvent({ platform: 'twitter', account: 'matthewsoldit', conversationId: 'gPeopleTest', type: 'message', with: '2037498762453491712', text: 'Nah bro', payload: { senderId: '2037498762453491712' } })
  const rows = eventsAfter(0, { type: 'message' }).filter((r) => r.conversationId === 'gPeopleTest')
  expect(rows.map((r) => r.withWho)).toEqual(['VinhTheOverlord', 'VinhTheOverlord'])
  expect(namedLabel('twitter', 'matthewsoldit', '2037498762453491712')).toBe('VinhTheOverlord')
})

test('someone nobody has named yet is never shown as their id', async () => {
  const { namedLabel } = await import('./client')
  expect(namedLabel('twitter', 'matthewsoldit', '999999999999')).toBe('someone not named yet')
  expect(namedLabel('twitter', 'matthewsoldit', 'RVAClassic')).toBe('RVAClassic')
})

test('someone known only from the X inbox (no notification, no event) is named from its handle map, and kept', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync } = await import('node:fs')
  const { join } = await import('node:path')
  const { tmpdir } = await import('node:os')
  const { personOf, xInboxHandleOf } = await import('./client')
  const root = mkdtempSync(join(tmpdir(), 'xInbox-'))
  mkdirSync(join(root, 'matthewsoldit'), { recursive: true })
  writeFileSync(join(root, 'matthewsoldit', 'inboxSync.json'), JSON.stringify({ xchat: { '1852784336640331777:1974596626342686720': { handles: { '1852784336640331777': 'alex_whedon' } } } }))
  expect(xInboxHandleOf('matthewsoldit', '1852784336640331777', root)).toBe('alex_whedon')
  expect(xInboxHandleOf('matthewsoldit', '111', root)).toBeNull()
  const before = process.env.LOG_TWITTER_STATE
  process.env.LOG_TWITTER_STATE = root
  expect(personOf('twitter', 'matthewsoldit', '1852784336640331777')).toBe('alex_whedon')
  process.env.LOG_TWITTER_STATE = join(root, 'gone')
  expect(personOf('twitter', 'matthewsoldit', '1852784336640331777')).toBe('alex_whedon')
  if (before === undefined) delete process.env.LOG_TWITTER_STATE
  else process.env.LOG_TWITTER_STATE = before
})
