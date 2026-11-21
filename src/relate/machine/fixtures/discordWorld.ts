import type { Database } from 'bun:sqlite'
import { writeEngineStore } from '../../../storage/engineStore/client'
import { DEMO_OWNER } from '../../graph/fixtures/demoWorld'
import { MACHINE_NOW, seedMachineWorld } from './machineWorld'

const minutesAgo = (m: number): number => MACHINE_NOW - m * 60_000

const iso = (ms: number): string => new Date(ms).toISOString()

export const DISCORD_SERVER = { id: '7100000301', name: 'Lantern Guild' }

export const DISCORD_CHANNELS = { talk: { id: '7200000301', name: 'buildNight' }, quiet: { id: '7200000302', name: 'showcase' } }

export const DISCORD_PEOPLE = {
  regular: { userId: '9100000301', handle: 'skyline_dev', xUserId: '2000000301' },
  lurker: { userId: '9100000302', handle: 'quiet_owl' },
  replier: { userId: '9100000303', handle: 'reply_rex' },
  waiting: { userId: '9100000304', handle: 'cold_case' },
  introducer: { userId: '9100000305', handle: 'bridge_bea' },
}

let n = 0

function chat(on: Database, conversationId: string, kind: string, name: string | null, serverId: string | null, lastAt: number): string {
  const chatId = `discord:${DEMO_OWNER.discordAccount}:${conversationId}`
  on.prepare("INSERT INTO chats (chatId, platform, account, conversationId, kind, name, serverId, lastMessageAt, lastMessageAtMs) VALUES (?, 'discord', ?, ?, ?, ?, ?, ?, ?)").run(chatId, DEMO_OWNER.discordAccount, conversationId, kind, name, serverId, iso(lastAt), lastAt)
  return chatId
}

function say(on: Database, chatId: string, userId: string, fromOwner: boolean, at: number, replyTo: string | null = null): string {
  n += 1
  const key = `discordWorld:m${n}`
  on.prepare("INSERT INTO messages (messageKey, chatId, senderPlatform, senderUserId, fromOwner, sentAt, sentAtMs, text, source, receivedAt, replyToKey) VALUES (?, ?, 'discord', ?, ?, ?, ?, ?, 'live', ?, ?)").run(key, chatId, userId, fromOwner ? 1 : 0, iso(at), at, `message ${n}`, iso(at), replyTo)
  if (!fromOwner) on.prepare("INSERT OR IGNORE INTO memberships (platform, roomId, userId, firstSeenAt, lastSeenAt) VALUES ('discord', ?, ?, ?, ?)").run(chatId, userId, iso(at), iso(at))
  return key
}

function dm(on: Database, conversationId: string, name: string, lastAt: number): string {
  return chat(on, conversationId, 'dm', name, null, lastAt)
}

export function seedDiscordWorld(on: Database, linkX = false): void {
  seedMachineWorld(on)
  const owner = DEMO_OWNER.discordUserId
  const p = DISCORD_PEOPLE
  const channels = Object.values(DISCORD_CHANNELS).map((c) => ({ id: c.id, kind: 'channel', name: `${DISCORD_SERVER.name} #${c.name}`, members: [], server: DISCORD_SERVER.name, serverId: DISCORD_SERVER.id }))
  writeEngineStore('discordServers', DEMO_OWNER.discordAccount, { savedAt: 1, from: 'gateway', channels }, on, MACHINE_NOW)
  const at = iso(MACHINE_NOW)
  for (const person of Object.values(p)) on.prepare("INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES ('discord', ?, ?, NULL, ?, ?)").run(person.userId, person.handle, at, at)
  const talk = chat(on, DISCORD_CHANNELS.talk.id, 'channel', null, DISCORD_SERVER.id, minutesAgo(70))
  const quiet = chat(on, DISCORD_CHANNELS.quiet.id, 'channel', null, DISCORD_SERVER.id, minutesAgo(500))
  for (let i = 0; i < 18; i++) say(on, talk, owner, true, minutesAgo(5000 - i * 60))
  for (let i = 0; i < 14; i++) say(on, talk, p.regular.userId, false, minutesAgo(3000 - i * 60))
  const ownerMessage = say(on, talk, owner, true, minutesAgo(900))
  say(on, talk, p.replier.userId, false, minutesAgo(800), ownerMessage)
  say(on, talk, p.introducer.userId, false, minutesAgo(700))
  say(on, quiet, p.lurker.userId, false, minutesAgo(500))
  const regularDm = dm(on, '7300000301', p.regular.handle, minutesAgo(30))
  say(on, regularDm, p.regular.userId, false, minutesAgo(64))
  say(on, regularDm, owner, true, minutesAgo(63))
  say(on, regularDm, p.regular.userId, false, minutesAgo(30))
  const waitingDm = dm(on, '7300000302', p.waiting.handle, minutesAgo(400))
  say(on, waitingDm, owner, true, minutesAgo(400))
  on.prepare("INSERT OR IGNORE INTO memberships (platform, roomId, userId, firstSeenAt, lastSeenAt) VALUES ('discord', ?, ?, ?, ?)").run(waitingDm, p.waiting.userId, iso(minutesAgo(400)), iso(minutesAgo(400)))
  const bridgeDm = dm(on, '7300000303', p.introducer.handle, minutesAgo(600))
  say(on, bridgeDm, p.introducer.userId, false, minutesAgo(610))
  say(on, bridgeDm, owner, true, minutesAgo(600))
  if (!linkX) return
  on.prepare("INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES ('twitter', ?, ?, NULL, ?, ?)").run(p.regular.xUserId, p.regular.handle, at, at)
  on.prepare("INSERT INTO interactions (interactionKey, platform, account, kind, actorUserId, targetRef, targetText, at, atMs) VALUES ('discordWorld:like', 'twitter', ?, 'like', ?, 'postLaunch', 'a launch post', ?, ?)").run(DEMO_OWNER.xAccount, p.regular.xUserId, iso(minutesAgo(9000)), minutesAgo(9000))
  on.prepare('INSERT INTO persons (personId, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run('personSkyline', 'Skyline', at, at)
  for (const [platform, userId] of [['twitter', p.regular.xUserId], ['discord', p.regular.userId]]) on.prepare("INSERT INTO identityLinks (personId, platform, userId, evidence, linkedBy, linkedAt, linkedEventId) VALUES ('personSkyline', ?, ?, NULL, 'owner', ?, ?)").run(platform, userId, at, `discordWorld:${platform}`)
}
