import { describe, expect, test } from 'bun:test'
import { storeRead } from '../catchUp/index'
import { cachedChatList, forgetChatList, chatMessageCount, chatMessages, findInChatList, isVisualAttachment, markBackfilled, mediaNotSaved, readSourceDeps, readSourceFor } from './index'
import type { ReadSourceDeps } from './index'

const deps = (over: Partial<ReadSourceDeps> = {}): ReadSourceDeps => ({ live: () => true, behind: () => null, backfilledAt: () => null, ...over })

describe('a read for one chat answers from the .db whenever the .db is current', () => {
  test('no live owner means the .db may be stale, so the platform is read', async () => {
    expect(await readSourceFor('discord', 'a', 'c1', 50, 20, deps({ live: () => false }))).toEqual({ from: 'platform', reason: 'noLiveOwner' })
  })

  test('a refused catch-up is never read around (rule 94)', async () => {
    const source = await readSourceFor('discord', 'a', 'c1', 50, 20, deps({ behind: () => ({ status: 'refused', fromAt: '2026-11-07T11:00:00Z', detail: '429' }) }))
    expect(source.from).toBe('refused')
    expect(source.from === 'refused' && source.refused).toContain('rule 94')
  })

  test('an owner still catching up never makes a read wait: the one chat is read from the platform at once', async () => {
    const started = Date.now()
    expect(await readSourceFor('discord', 'a', 'c1', 50, 20, deps({ behind: () => ({ status: 'catchingUp', fromAt: '2026-11-07T11:29:20Z' }), backfilledAt: () => '2026-11-07T00:00:00Z' }))).toEqual({ from: 'platform', reason: 'catchingUp' })
    expect(Date.now() - started).toBeLessThan(50)
  })

  test('a chat backfilled once, or one the .db holds enough of, is answered from the .db', async () => {
    expect(await readSourceFor('discord', 'a', 'c1', 2, 20, deps({ backfilledAt: () => '2026-11-07T00:00:00Z' }))).toEqual({ from: 'db', reason: 'backfilled' })
    expect(await readSourceFor('discord', 'a', 'c1', 20, 20, deps())).toEqual({ from: 'db', reason: 'enoughInDb' })
  })

  test('a chat never backfilled with too little in the .db is read from the platform once', async () => {
    expect(await readSourceFor('discord', 'a', 'c1', 3, 20, deps())).toEqual({ from: 'platform', reason: 'notBackfilled' })
  })

  test('marking a chat backfilled is what the next read sees', async () => {
    markBackfilled('discord', 'acct', 'chatX', new Date('2026-11-07T01:00:00Z'))
    expect(readSourceDeps.backfilledAt('discord', 'acct', 'chatX')).toBe('2026-11-07T01:00:00.000Z')
  })
})

describe('the .db gives back a chat oldest first, with who wrote each', () => {
  test('the newest n messages of one chat, the account\'s own marked as mine', () => {
    const now = new Date('2026-11-07T02:00:00Z')
    storeRead('discord', 'reader', 'chat1', 'dm', { id: '101', at: '2026-11-07T01:00:00Z', from: 'deepman', fromMe: false, text: 'yo' }, now, 'live')
    storeRead('discord', 'reader', 'chat1', 'dm', { id: '102', at: '2026-11-07T01:01:00Z', from: 'me', fromMe: true, text: 'whats good' }, now, 'live')
    storeRead('discord', 'reader', 'chat1', 'dm', { id: '103', at: '2026-11-07T01:02:00Z', from: 'deepman', fromMe: false, text: 'all good' }, now, 'live')
    storeRead('discord', 'reader', 'chat2', 'dm', { id: '201', at: '2026-11-07T01:03:00Z', from: 'abel', fromMe: false, text: 'other chat' }, now, 'live')
    expect(chatMessageCount('discord', 'reader', 'chat1')).toBe(3)
    const two = chatMessages('discord', 'reader', 'chat1', 2)
    expect(two.map((m) => m.id)).toEqual(['102', '103'])
    expect(two[0]).toMatchObject({ fromMe: true, from: 'me', text: 'whats good' })
  })
})

describe('a chat is found by name from the kept list, and the platform only when the name is new', () => {
  test('the first lookup lists from the platform and keeps the list; the next one asks nothing', () => {
    forgetChatList('discord', 'lister')
    let calls = 0
    const list = () => {
      calls++
      return { ok: true as const, chats: [{ id: '1', name: 'deepman' }] }
    }
    const match = (chats: { id: string; name: string }[], said: string) => {
      const chat = chats.find((c) => c.name === said)
      return chat ? { ok: true as const, chat } : { ok: false as const }
    }
    expect(findInChatList('discord', 'lister', 'deepman', match, list)).toMatchObject({ from: 'platform', found: { ok: true } })
    expect(findInChatList('discord', 'lister', 'deepman', match, list)).toMatchObject({ from: 'cache', found: { ok: true } })
    expect(calls).toBe(1)
    expect(cachedChatList('discord', 'lister')).toHaveLength(1)
    findInChatList('discord', 'lister', 'someone new', match, list)
    expect(calls).toBe(2)
  })
})

describe('a Discord image is read with where it was saved', () => {
  test('a stored image keeps its saved path, and the .db answers it', () => {
    const now = new Date('2026-11-07T11:00:00Z')
    storeRead('discord', 'imgAcct', 'imgChat', 'dm', { id: '9001', at: '2026-11-07T10:59:00Z', from: 'Kennedy', fromMe: false, text: '', attachments: [{ name: 'shot.png', type: 'image/png', path: '/tmp/shot.png' }] }, now, 'backfill')
    const [m] = chatMessages('discord', 'imgAcct', 'imgChat', 5)
    expect(m.id).toBe('9001')
    expect(m.attachments).toEqual([{ name: 'shot.png', type: 'image/png', path: '/tmp/shot.png' }])
    expect(mediaNotSaved([m])).toBe(false)
  })

  test('a message stored before its image was saved gets the path added on the next read', () => {
    const now = new Date('2026-11-07T11:00:00Z')
    storeRead('discord', 'imgAcct', 'imgChat2', 'dm', { at: '2026-11-07T10:58:00Z', from: 'Kennedy', fromMe: false, text: '' }, now, 'live')
    expect(mediaNotSaved(chatMessages('discord', 'imgAcct', 'imgChat2', 5))).toBe(true)
    storeRead('discord', 'imgAcct', 'imgChat2', 'dm', { id: '9002', at: '2026-11-07T10:58:00Z', from: 'Kennedy', fromMe: false, text: '', attachments: [{ name: 'a.jpg', type: 'image/jpeg', path: '/tmp/a.jpg' }] }, now, 'backfill')
    const [m] = chatMessages('discord', 'imgAcct', 'imgChat2', 5)
    expect(m.id).toBe('9002')
    expect(m.attachments?.[0]?.path).toBe('/tmp/a.jpg')
    expect(mediaNotSaved([m])).toBe(false)
  })

  test('an image with neither a path nor a reason sends the read back to Discord', () => {
    expect(mediaNotSaved([{ id: '1', conversationId: 'c', at: 'x', from: 'k', fromMe: false, text: 'look', attachments: [{ name: 'b.webp' }] }])).toBe(true)
    expect(mediaNotSaved([{ id: '1', conversationId: 'c', at: 'x', from: 'k', fromMe: false, text: 'look', attachments: [{ name: 'notes.pdf' }] }])).toBe(false)
    expect(isVisualAttachment({ name: 'clip.MP4' })).toBe(true)
    expect(isVisualAttachment({ name: 'x', type: 'image/gif' })).toBe(true)
  })
})
