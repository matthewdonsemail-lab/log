import { afterAll, afterEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Database } from 'bun:sqlite'
import { insertEventRow } from '../../storage/platform/index'
import { migrate, openDatabase } from '../../storage/schema/index'
import { linkIdentities } from '../../people/index'
import { networkCommand } from '../../cli/network/index'
import { WHO_TO_TALK_TO, buildGraph, queryGraph } from '../graph/index'
import { ensureRings, networkRings, rebuildRings } from './index'

const root = mkdtempSync(join(tmpdir(), 'networkPeople-'))
const dbPath = join(root, 'log.db')
const savedDb = process.env.LOG_DB

afterEach(() => {
  if (savedDb === undefined) delete process.env.LOG_DB
  else process.env.LOG_DB = savedDb
})

afterAll(() => {
  openDatabase(dbPath).close()
  Bun.gc(true)
  rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 })
})

let minute = 0
const at = (): string => new Date(Date.parse('2026-11-20T10:00:00Z') + 60_000 * minute++).toISOString()

function notify(handle: Database, userId: string, name: string, kind: string): void {
  const when = at()
  insertEventRow(handle, { platform: 'twitter', account: 'xAccount', conversationId: '', type: 'notification', with: name, text: `${name} ${kind}`, box: '', payload: { userId, handle: name, kind, key: `${kind}${userId}${minute}`, postId: kind === 'follow' ? null : 'postOne', at: when }, sourceAt: when, receivedAt: when, source: 'live' })
}

function say(handle: Database, platform: string, conversationId: string, box: string, senderId: string, name: string, id: string, text: string, replyTo: string | null = null): void {
  const when = at()
  const account = `${platform}Account`
  insertEventRow(handle, { platform, account, conversationId, type: 'message', with: name, text, box, payload: { id, senderId, ...(replyTo ? { replyTo } : {}) }, sourceAt: when, receivedAt: when, source: 'live' })
}

const kindOf = (handle: Database, conversationId: string) => (handle.prepare('SELECT kind FROM chats WHERE conversationId = ?').get(conversationId) as { kind: string } | null)?.kind
const ringOf = (handle: Database, platform: string, userId: string) => (handle.prepare('SELECT ring, reason, via FROM networkRings WHERE platform = ? AND userId = ?').get(platform, userId) as { ring: number; reason: string; via: string | null } | null) ?? null

describe('a chat with more than two members is a group, so ring 1 means a real one-to-one chat', () => {
  const handle = openDatabase(dbPath)
  handle.prepare("INSERT INTO accounts (platform, account, userId, learnedAt) VALUES ('twitter', 'xAccount', '100', '2026-11-20T00:00:00Z'), ('discord', 'discordAccount', '9000000001', '2026-11-20T00:00:00Z'), ('instagram', 'instagramAccount', '7000000001', '2026-11-20T00:00:00Z')").run()
  ensureRings(handle)

  test('a 3-member Instagram chat is stored as a group and makes none of its members ring 1', () => {
    say(handle, 'instagram', 'igCrew', 'dm', '7000000011', 'nova_draws', 'i1', 'welcome to the crew chat')
    expect(kindOf(handle, 'igCrew')).toBe('dm')
    say(handle, 'instagram', 'igCrew', 'dm', '7000000012', 'remy_cuts', 'i2', 'hey all')
    expect(kindOf(handle, 'igCrew')).toBe('group')
    expect(ringOf(handle, 'instagram', '7000000011')).toBeNull()
    expect(ringOf(handle, 'instagram', '7000000012')).toBeNull()
  })

  test('a one-to-one Instagram chat stays a dm and its person is ring 1; replying to them in the group is ring 2, counted live', () => {
    say(handle, 'instagram', 'igNova', 'dm', '7000000011', 'nova_draws', 'i3', 'loved your reel')
    expect(kindOf(handle, 'igNova')).toBe('dm')
    expect(ringOf(handle, 'instagram', '7000000011')).toEqual({ ring: 1, reason: 'dm', via: null })
    say(handle, 'instagram', 'igCrew', 'dm', '7000000013', 'tess_pins', 'i5', 'agreed', 'i1')
    expect(ringOf(handle, 'instagram', '7000000013')).toEqual({ ring: 2, reason: 'talksTo', via: '7000000011' })
    expect(networkRings(handle, { platform: 'instagram' }).counts).toEqual({ '1': 1, '2': 1, '3': 0, '4': 1 })
  })
})

describe('one person across platforms, and the network by platform', () => {
  const handle = openDatabase(dbPath)

  test('a person with a linked X and Discord identity appears once, at the closer ring, with both accounts and where each tie came from', () => {
    notify(handle, '201', 'grace_ships', 'follow')
    say(handle, 'discord', 'dmGrace', 'dm', '9000000021', 'grace_ships', 'd1', 'saw your demo')
    expect(ringOf(handle, 'twitter', '201')).toEqual({ ring: 3, reason: 'follow', via: null })
    expect(ringOf(handle, 'discord', '9000000021')).toEqual({ ring: 1, reason: 'dm', via: null })
    const before = networkRings(handle)
    const linked = linkIdentities(handle, ['twitter:grace_ships', 'discord:grace_ships'], 'the owner', { name: 'Grace' })
    expect(linked.ok).toBe(true)
    const after = networkRings(handle)
    expect(after.people).toBe(before.people - 1)
    expect(after.linked).toHaveLength(1)
    expect(after.linked[0]).toMatchObject({ name: 'Grace', ring: 1, reason: 'dm', platform: 'discord', platforms: ['discord', 'twitter'] })
    expect(after.linked[0]!.accounts.map((a) => [a.platform, a.handle, a.ring, a.reason])).toEqual([['discord', 'grace_ships', 1, 'dm'], ['twitter', 'grace_ships', 3, 'follow']])
    expect(after.counts['3']).toBe(before.counts['3'] - 1)
  })

  test('a platform filter gives that platform alone: its accounts, its rings, its counts', () => {
    const discord = networkRings(handle, { platform: 'discord' })
    expect(discord.platform).toBe('discord')
    expect(discord.counts).toEqual({ '1': 1, '2': 0, '3': 0, '4': 0 })
    expect(discord.identities).toBe(1)
    const twitter = networkRings(handle, { platform: 'twitter' })
    expect(twitter.counts).toEqual({ '1': 0, '2': 0, '3': 1, '4': 0 })
    expect(networkRings(handle).byPlatform.map((p) => p.platform).sort()).toEqual(['discord', 'instagram', 'twitter'])
  })

  test('someone who replies on Discord to a person whose linked X account follows the owner is ring 2, and the rings match a full recompute', () => {
    say(handle, 'discord', 'groupBuild', 'group', '9000000022', 'maya_ml', 'g1', 'hello builders')
    say(handle, 'discord', 'groupBuild', 'group', '9000000023', 'linus_k', 'g2', 'shipping tonight')
    notify(handle, '202', 'maya_ml', 'follow')
    expect(linkIdentities(handle, ['twitter:maya_ml', 'discord:maya_ml'], 'the owner').ok).toBe(true)
    say(handle, 'discord', 'groupBuild', 'group', '9000000023', 'linus_k', 'g3', 'nice', 'g1')
    expect(ringOf(handle, 'discord', '9000000023')).toEqual({ ring: 2, reason: 'talksTo', via: '9000000022' })
    const all = (): unknown[] => handle.prepare('SELECT platform, userId, ring, reason, follows, via FROM networkRings ORDER BY platform, userId').all()
    const live = all()
    rebuildRings(handle)
    expect(all()).toEqual(live)
  })

  test('log network status shows the per-platform breakdown, the combined view and the linked people; --platform shows one platform', async () => {
    process.env.LOG_DB = dbPath
    const all = await networkCommand.run({ err: () => {} } as never, ['status'])
    expect(all.code).toBe(0)
    expect(all.stdout).toContain('by platform: ')
    expect(all.stdout).toContain('discord 1: ')
    expect(all.stdout).toContain('linked across platforms: 2 people')
    expect(all.stdout).toContain('Grace: ring 1 from discord; discord:grace_ships ring 1 (dm), twitter:grace_ships ring 3 (follow)')
    expect(all.stdout).toContain('suggested, not linked: ')
    const one = await networkCommand.run({ err: () => {} } as never, ['status', '--platform', 'instagram', '--json'])
    const parsed = JSON.parse(one.stdout ?? '{}') as { rings: { platform: string; counts: Record<string, number>; linked: unknown[] } }
    expect(parsed.rings.platform).toBe('instagram')
    expect(parsed.rings.counts).toEqual({ '1': 1, '2': 1, '3': 0, '4': 1 })
    expect(parsed.rings.linked).toEqual([])
  })

  test('who to talk to lists a linked person once with their accounts, and a platform filter keeps only that platform', async () => {
    buildGraph(dbPath)
    const rows = (await queryGraph(WHO_TO_TALK_TO, {}, dbPath)).rows
    const maya = rows.filter((r) => r.who === 'maya_ml' || r.handle === 'maya_ml')
    expect(maya).toHaveLength(1)
    expect(maya[0]).toMatchObject({ ring: 3, tieFrom: 'twitter' })
    expect([...(maya[0]!.accounts as string[])].sort()).toEqual(['discord:maya_ml ring 4 (known)', 'twitter:maya_ml ring 3 (follow)'])
    expect(rows.some((r) => r.who === 'Grace')).toBe(false)
    const discordOnly = (await queryGraph(WHO_TO_TALK_TO, { platform: 'discord' }, dbPath)).rows
    expect(discordOnly.length).toBeGreaterThan(0)
    expect(discordOnly.every((r) => r.platform === 'discord')).toBe(true)
    expect(discordOnly.map((r) => [r.handle, r.ring, r.why])).toEqual([['linus_k', 2, 'talksTo']])
  })
})

describe('the chatGroups repair', () => {
  test('turns dm rows with more than two members into groups on a db left at 30, and moves the rings with them', () => {
    const repairPath = join(root, 'repair.db')
    const handle = openDatabase(repairPath)
    handle.prepare("INSERT INTO accounts (platform, account, userId, learnedAt) VALUES ('instagram', 'instagramAccount', '7000000001', '2026-11-20T00:00:00Z')").run()
    ensureRings(handle)
    say(handle, 'instagram', 'igOld', 'dm', '7000000031', 'ivy_knits', 'o1', 'hi all')
    say(handle, 'instagram', 'igOld', 'dm', '7000000032', 'ben_bakes', 'o2', 'hello')
    say(handle, 'instagram', 'igPair', 'dm', '7000000033', 'otto_runs', 'o3', 'hey you')
    handle.exec("UPDATE chats SET kind = 'dm' WHERE conversationId = 'igOld'")
    rebuildRings(handle)
    expect(ringOf(handle, 'instagram', '7000000031')).toEqual({ ring: 1, reason: 'dm', via: null })
    handle.exec('PRAGMA user_version = 30')
    expect(migrate(handle).map((m) => m.name)).toEqual(['chatGroups', 'personFacts'])
    expect(kindOf(handle, 'igOld')).toBe('group')
    expect(kindOf(handle, 'igPair')).toBe('dm')
    expect(ringOf(handle, 'instagram', '7000000031')).toBeNull()
    expect(ringOf(handle, 'instagram', '7000000033')).toEqual({ ring: 1, reason: 'dm', via: null })
    handle.close()
  })
})
