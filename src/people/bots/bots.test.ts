import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDatabase } from '../../storage/schema/index'
import { markAutomatedIdentity } from '../../storage/platform/index'
import { buildGraph } from '../../relate/graph/index'
import { relateMachine } from '../../relate/machine/index'
import { botKnowledge } from '../../relate/machine/helpers/bots'
import { DISCORD_CHANNELS, DISCORD_PEOPLE, seedDiscordWorld } from '../../relate/machine/fixtures/discordWorld'
import { DEMO_OWNER } from '../../relate/graph/fixtures/demoWorld'
import { MACHINE_NOW } from '../../relate/machine/fixtures/machineWorld'
import { backfillBots } from './client'
import type { BotSources } from './types'

const iso = (ms: number): string => new Date(ms).toISOString()

const said = (on: ReturnType<typeof openDatabase>, userId: string, text: string): void => {
  const chatId = `discord:${DEMO_OWNER.discordAccount}:${DISCORD_CHANNELS.talk.id}`
  on.prepare("INSERT INTO messages (messageKey, chatId, senderPlatform, senderUserId, fromOwner, sentAt, sentAtMs, text, source, receivedAt) VALUES (?, ?, 'discord', ?, 0, ?, ?, ?, 'live', ?)").run(`botsFixture:${userId}:${text.length}`, chatId, userId, iso(MACHINE_NOW), MACHINE_NOW, text, iso(MACHINE_NOW))
  on.prepare("INSERT OR IGNORE INTO memberships (platform, roomId, userId, firstSeenAt, lastSeenAt) VALUES ('discord', ?, ?, ?, ?)").run(chatId, userId, iso(MACHINE_NOW), iso(MACHINE_NOW))
}

describe("a bot the platform names and nothing else does", () => {
  const quiet = { userId: '9100000399', handle: 'night_owl' }
  const path = join(mkdtempSync(join(tmpdir(), 'botFlag-')), 'log.db')
  const on = openDatabase(path)
  seedDiscordWorld(on)
  on.prepare("INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES ('discord', ?, ?, 'Night Owl', ?, ?)").run(quiet.userId, quiet.handle, iso(MACHINE_NOW), iso(MACHINE_NOW))
  said(on, quiet.userId, 'standing by for the build to finish')
  markAutomatedIdentity(on, 'discord', quiet.userId, new Date(MACHINE_NOW))
  buildGraph(path, new Date(MACHINE_NOW))

  test('its name holds no bot word, no chat says bot, and only the platform flag knows', () => {
    const knowledge = botKnowledge(openDatabase(path))
    expect(knowledge.keys.has(`discord:${quiet.userId}`)).toBe(true)
    expect(knowledge.why.get(`discord:${quiet.userId}`)).toBe('the platform marks it automated')
  })

  test('the network view drops it while the person view still answers for it', async () => {
    const network = await relateMachine({ view: 'network', platform: 'discord' }, path, MACHINE_NOW)
    if (!network.ok) throw new Error(`${network.code}: ${network.problem}`)
    const handles = network.block.states.flatMap((s) => s.people ?? []).map((p) => p.handle)
    expect(handles).not.toContain(quiet.handle)
    expect(handles).toContain(DISCORD_PEOPLE.regular.handle)
    const everyone = (on.prepare("SELECT COUNT(*) AS n FROM identities WHERE platform = 'discord'").get() as { n: number }).n
    expect(network.block.states.reduce((n, s) => n + (s.count ?? 0), 0)).toBe(everyone - 3)
    const person = await relateMachine({ person: `discord:${quiet.handle}` }, path, MACHINE_NOW)
    if (!person.ok) throw new Error(`${person.code}: ${person.problem}`)
    expect(person.block.view).toBe('person')
    expect(person.block.states.find((s) => s.current)).toBeTruthy()
  })
})

describe('backfilling the flag from a member list', () => {
  const bot = { userId: '159985870458322944', username: 'MEE6', bot: true }
  const human = { userId: '792842038332358656', username: 'Robin', bot: false }
  const calls: string[] = []
  const sources: BotSources = {
    accounts: () => [{ platform: 'discord', account: 'sourcedand', session: true }, { platform: 'slack', account: 'teamSlack', session: false }],
    sources: [
      {
        platform: 'discord',
        sweep: async () => {
          calls.push('discord')
          return { ok: true, members: [bot, human], requests: 1, places: 2, stopped: null }
        },
      },
      {
        platform: 'slack',
        sweep: async () => {
          calls.push('slack')
          return { ok: true, members: [], places: 0, stopped: null }
        },
      },
    ],
  }

  test('marks the members the platform says are bots, not the ones whose name looks human, and says why a platform was skipped', async () => {
    const on = openDatabase(join(mkdtempSync(join(tmpdir(), 'botsBackfill-')), 'log.db'))
    const report = await backfillBots(on, sources, { now: new Date(MACHINE_NOW) })
    expect(report.flagged).toBe(1)
    expect(report.bots).toBe(1)
    expect(report.read).toBe(2)
    expect(botKnowledge(on).keys.has(`discord:${bot.userId}`)).toBe(true)
    expect(botKnowledge(on).keys.has(`discord:${human.userId}`)).toBe(false)
    const discord = report.platforms.find((p) => p.platform === 'discord')!
    expect(discord.accounts[0]).toMatchObject({ account: 'sourcedand', read: 2, bots: 1, flagged: 1, already: 0, places: 2 })
    const slack = report.platforms.find((p) => p.platform === 'slack')!
    expect(slack.accounts[0].refused?.code).toBe('noPlatformSession')
    expect(calls).toEqual(['discord'])
    expect(report.platforms.find((p) => p.platform === 'x')?.skipped).toContain('no automated flag')
    expect(report.refused).toBe(1)
  })

  test('running it again marks nothing and counts what was already known', async () => {
    const on = openDatabase(join(mkdtempSync(join(tmpdir(), 'botsAgain-')), 'log.db'))
    await backfillBots(on, sources, { now: new Date(MACHINE_NOW) })
    const again = await backfillBots(on, sources, { now: new Date(MACHINE_NOW) })
    expect(again.flagged).toBe(0)
    expect(again.already).toBe(1)
    expect(on.prepare("SELECT COUNT(*) AS n FROM identityProfiles WHERE platform = 'discord'").get()).toEqual({ n: 1 } as unknown as Record<string, unknown>)
  })
})
