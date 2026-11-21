import type { Database } from 'bun:sqlite'
import { DEMO_NOW, DEMO_OWNER, seedDemoWorld } from '../../graph/fixtures/demoWorld'

export const MACHINE_NOW = DEMO_NOW

const daysAgo = (d: number): number => MACHINE_NOW - d * 86_400_000

const iso = (ms: number): string => new Date(ms).toISOString()

export const MACHINE_PEOPLE = {
  walker: { userId: '2000000010', handle: 'ivy_ops', name: 'Ivy' },
  waiting: { userId: '2000000011', handle: 'nora_writes', name: 'Nora' },
}

export const MACHINE_TARGET = 'kai_new'

let n = 0

function interaction(on: Database, kind: string, actor: string, ref: string | null, text: string | null, at: number): void {
  n += 1
  on.prepare("INSERT INTO interactions (interactionKey, platform, account, kind, actorUserId, targetRef, targetText, at, atMs) VALUES (?, 'twitter', ?, ?, ?, ?, ?, ?, ?)").run(`machine:i${n}`, DEMO_OWNER.xAccount, kind, actor, ref, text, iso(at), at)
}

function message(on: Database, chatId: string, userId: string, fromOwner: boolean, text: string, at: number): void {
  n += 1
  on.prepare("INSERT INTO messages (messageKey, chatId, senderPlatform, senderUserId, fromOwner, sentAt, sentAtMs, text, source, receivedAt) VALUES (?, ?, 'twitter', ?, ?, ?, ?, ?, 'live', ?)").run(`machine:m${n}`, chatId, userId, fromOwner ? 1 : 0, iso(at), at, text, iso(at))
}

function member(on: Database, chatId: string, userId: string, at: number): void {
  on.prepare("INSERT OR IGNORE INTO memberships (platform, roomId, userId, firstSeenAt, lastSeenAt) VALUES ('twitter', ?, ?, ?, ?)").run(chatId, userId, iso(at), iso(at))
}

function dmChat(on: Database, userId: string, lastAt: number): string {
  const conversationId = `${DEMO_OWNER.xUserId}-${userId}`
  const chatId = `twitter:${DEMO_OWNER.xAccount}:${conversationId}`
  on.prepare("INSERT INTO chats (chatId, platform, account, conversationId, kind, name, lastMessageAt, lastMessageAtMs) VALUES (?, 'twitter', ?, ?, 'dm', NULL, ?, ?)").run(chatId, DEMO_OWNER.xAccount, conversationId, iso(lastAt), lastAt)
  return chatId
}

function network(on: Database): void {
  const people = [
    { handle: 'ada_codes', ring: 1, follows: 0, circles: ['chart_lead'] },
    { handle: 'maya_ml', ring: 2, follows: 1, circles: ['chart_lead', 'loop_lead'] },
    { handle: MACHINE_TARGET, ring: 2, follows: 0, circles: ['chart_lead', 'loop_lead'] },
    { handle: 'zed_quiet', ring: 3, follows: 1, circles: ['loop_lead'] },
    { handle: 'rio_far', ring: 4, follows: 0, circles: [] as string[] },
  ]
  for (const p of people) {
    on.prepare("INSERT INTO networkPeople (handleLower, handle, name, followers, degree, ring, band, score, topThemes, passesGates, followsOwner) VALUES (?, ?, ?, 120, ?, ?, 'collaborator', 0.8, '[\"graphs\"]', 1, ?)").run(p.handle, p.handle, p.handle, p.ring, p.ring, p.follows)
    for (const c of p.circles) on.prepare('INSERT INTO networkCircles (personLower, leaderLower) VALUES (?, ?)').run(p.handle, c)
  }
  for (const [handle, name] of [['chart_lead', 'Chart Lead'], ['loop_lead', 'Loop Lead']]) on.prepare('INSERT INTO networkLeaders (handleLower, handle, name, followers, world) VALUES (?, ?, ?, 4000, NULL)').run(handle, handle, name)
  on.prepare('INSERT INTO networkMentions (fromLower, toLower, times, lastAtMs) VALUES (?, ?, 2, ?)').run('ada_codes', MACHINE_TARGET, daysAgo(3))
  on.prepare("INSERT INTO networkImports (id, formatVersion, mapVersion, generatedAt, source, account, counts, ms, importedAt) VALUES (1, 1, 'demo', ?, 'demo', ?, '{}', 1, ?)").run(iso(daysAgo(1)), DEMO_OWNER.xAccount, iso(daysAgo(1)))
}

export function seedMachineWorld(on: Database): void {
  seedDemoWorld(on)
  const now = iso(MACHINE_NOW)
  for (const p of Object.values(MACHINE_PEOPLE)) on.prepare("INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES ('twitter', ?, ?, ?, ?, ?)").run(p.userId, p.handle, p.name, now, now)
  const ivy = MACHINE_PEOPLE.walker
  interaction(on, 'follow', ivy.userId, null, null, daysAgo(20))
  const builders = `twitter:${DEMO_OWNER.xAccount}:groupAgentBuilders`
  member(on, builders, ivy.userId, daysAgo(15))
  interaction(on, 'like', ivy.userId, 'postLaunch', 'introducing log: your agent reads every inbox from one local database', daysAgo(10))
  const ivyDm = dmChat(on, ivy.userId, daysAgo(4))
  member(on, ivyDm, ivy.userId, daysAgo(5))
  message(on, ivyDm, DEMO_OWNER.xUserId, true, 'saw you in the builders group, want to swap notes on graph views?', daysAgo(5))
  message(on, ivyDm, ivy.userId, false, 'yes! send me the demo', daysAgo(4))
  const nora = MACHINE_PEOPLE.waiting
  interaction(on, 'like', nora.userId, 'postGraphs', 'graphs beat vectors for who-knows-whom questions', daysAgo(30))
  const noraDm = dmChat(on, nora.userId, daysAgo(25))
  member(on, noraDm, nora.userId, daysAgo(25))
  message(on, noraDm, DEMO_OWNER.xUserId, true, 'thanks for the like, what are you building?', daysAgo(25))
  network(on)
}
