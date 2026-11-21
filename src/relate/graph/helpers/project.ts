import type { Database } from 'bun:sqlite'
import { channelNameOf, roomCatalog } from '../../../storage/platform/helpers/places'
import { TOKEN_MIN } from '../types'
import { applyPersonRings, applyRings, networkProjectionOf } from './network'
import { memoryProjectionOf } from './memory'
import type { AccountRow, EngagedRow, IdentityRow, LinkRow, MemberRow, PersonRow, PointedRow, PostRow, Projection, ProjectionScope, RoomRow, SaidRow, ServerRow } from '../types'
import { nameKeyOf, namesOf, pointedAt } from './mentions'

const identityKeyOf = (platform: string, userId: string): string => `${platform}:${userId}`

const accountKeyOf = (platform: string, account: string): string => `${platform}:${account}`

const serverKeyOf = (platform: string, serverId: string): string => `${platform}:server:${serverId}`

const personKeyOf = (personId: string): string => `person:${personId}`

const isSelf = (userId: string): boolean => userId.startsWith('self:')

const usable = (userId: string | null | undefined): userId is string => Boolean(userId) && !String(userId).startsWith('unknown:')

function readOnce<T>(handle: Database, work: () => T): T {
  if (handle.inTransaction) return work()
  handle.exec('BEGIN')
  try {
    return work()
  } finally {
    handle.exec('COMMIT')
  }
}

const inList = (column: string): string => `${column} IN (SELECT value FROM json_each(?))`

const scoped = <T>(scope: ProjectionScope | undefined, keys: () => Iterable<T>): unknown[] => (scope ? [JSON.stringify([...keys()])] : [])

export function projectionOf(handle: Database, scope?: ProjectionScope): Projection {
  return readOnce(handle, () => {
    const throughSeq = (handle.prepare('SELECT COALESCE(MAX(seq), 0) AS seq FROM events').get() as { seq: number }).seq
    const schemaVersion = (handle.prepare('PRAGMA user_version').get() as { user_version: number }).user_version
    const accountRows = handle.prepare('SELECT platform, account, userId FROM accounts').all() as { platform: string; account: string; userId: string }[]
    const chatRows = handle.prepare('SELECT chatId, platform, account, conversationId, kind, name, serverId, lastMessageAtMs FROM chats').all() as { chatId: string; platform: string; account: string; conversationId: string; kind: string; name: string | null; serverId: string | null; lastMessageAtMs: number | null }[]
    const identityRows = handle.prepare('SELECT platform, userId, handle, displayName FROM identities').all() as { platform: string; userId: string; handle: string | null; displayName: string | null }[]
    const aliasRows = handle.prepare('SELECT platform, handle, userId FROM handleAliases').all() as { platform: string; handle: string; userId: string }[]
    const linkRows = handle.prepare('SELECT l.platform, l.userId, l.personId, l.linkedBy, l.linkedAt, p.name FROM identityLinks l LEFT JOIN persons p ON p.personId = l.personId WHERE l.revokedAt IS NULL').all() as { platform: string; userId: string; personId: string; linkedBy: string | null; linkedAt: string | null; name: string | null }[]
    const rooms = () => scope!.rooms
    const memberRows = handle.prepare(`SELECT platform, roomId, userId, firstSeenAt, lastSeenAt FROM memberships${scope ? ` WHERE ${inList('roomId')}` : ''}`).all(...(scoped(scope, rooms) as never[])) as { platform: string; roomId: string; userId: string; firstSeenAt: string; lastSeenAt: string }[]
    const saidRows = handle.prepare(`SELECT m.chatId, m.senderPlatform AS platform, m.senderUserId AS userId, m.fromOwner, c.account, COUNT(*) AS messages, MIN(m.sentAtMs) AS firstAtMs, MAX(m.sentAtMs) AS lastAtMs FROM messages m JOIN chats c ON c.chatId = m.chatId${scope ? ` WHERE ${inList('m.chatId')}` : ''} GROUP BY m.chatId, m.senderPlatform, m.senderUserId, m.fromOwner`).all(...(scoped(scope, rooms) as never[])) as { chatId: string; platform: string; userId: string; fromOwner: number; account: string; messages: number; firstAtMs: number | null; lastAtMs: number | null }[]
    const replyRows = handle.prepare(`SELECT r.chatId, r.senderPlatform AS platform, r.senderUserId AS fromId, r.fromOwner AS fromOwner, t.senderUserId AS toId, t.fromOwner AS toOwner, c.account, COUNT(*) AS times, MIN(r.sentAtMs) AS firstAtMs, MAX(r.sentAtMs) AS lastAtMs FROM messages r JOIN messages t ON t.messageKey = r.replyToKey JOIN chats c ON c.chatId = r.chatId WHERE r.replyToKey IS NOT NULL${scope ? ` AND ${inList('r.chatId')}` : ''} GROUP BY r.chatId, r.senderPlatform, r.senderUserId, r.fromOwner, t.senderUserId, t.fromOwner`).all(...(scoped(scope, rooms) as never[])) as { chatId: string; platform: string; fromId: string; fromOwner: number; toId: string; toOwner: number; account: string; times: number; firstAtMs: number | null; lastAtMs: number | null }[]
    const mentionRows = handle.prepare(`SELECT m.chatId, m.senderPlatform AS platform, m.senderUserId AS fromId, m.fromOwner, c.account, m.text, m.sentAtMs FROM messages m JOIN chats c ON c.chatId = m.chatId WHERE m.text LIKE '%@%'${scope ? ` AND ${inList('m.chatId')}` : ''}`).all(...(scoped(scope, rooms) as never[])) as { chatId: string; platform: string; fromId: string; fromOwner: number; account: string; text: string; sentAtMs: number | null }[]
    const interactionRows = handle.prepare(`SELECT platform, account, kind, actorUserId, targetRef, MAX(targetText) AS targetText, COUNT(*) AS times, MAX(atMs) AS lastAtMs FROM interactions${scope ? ` WHERE ${inList("platform || ':' || actorUserId")}` : ''} GROUP BY platform, account, kind, actorUserId, targetRef`).all(...(scoped(scope, () => scope!.actors) as never[])) as { platform: string; account: string; kind: string; actorUserId: string | null; targetRef: string | null; targetText: string | null; times: number; lastAtMs: number | null }[]
    const interactionAccounts = handle.prepare('SELECT DISTINCT platform, account FROM interactions ORDER BY platform, account').all() as { platform: string; account: string }[]
    const catalog = roomCatalog(handle)

    const ownerIds = new Set(accountRows.map((a) => identityKeyOf(a.platform, a.userId)))
    const accounts: AccountRow[] = []
    const accountKeys = new Set<string>()
    const addAccount = (platform: string, account: string, userId: string | null) => {
      const key = accountKeyOf(platform, account)
      if (accountKeys.has(key)) return
      accountKeys.add(key)
      accounts.push({ key, platform, account, userId })
    }
    for (const a of accountRows) addAccount(a.platform, a.account, a.userId)
    for (const c of chatRows) addAccount(c.platform, c.account, null)
    for (const i of interactionAccounts) addAccount(i.platform, i.account, null)
    const ownerHandles = new Set(accounts.map((a) => `${a.platform}:${a.account.replace(/^@/, '').toLowerCase()}`))

    const identities = new Map<string, IdentityRow>()
    const marked = new Set<string>(scope?.identities ?? [])
    const aliasesOf = new Map<string, Set<string>>()
    for (const a of aliasRows) {
      const key = identityKeyOf(a.platform, a.userId)
      aliasesOf.set(key, (aliasesOf.get(key) ?? new Set()).add(a.handle.replace(/^@/, '').toLowerCase()))
    }
    const touch = (platform: string, userId: string, mark = true): string => {
      const key = identityKeyOf(platform, userId)
      if (!identities.has(key)) identities.set(key, { key, platform, userId, handle: null, handleLower: null, name: null, nameLower: null, labels: [], aliases: [], owner: ownerIds.has(key) || isSelf(userId), personId: null, personNames: [] })
      if (mark) marked.add(key)
      return key
    }
    const handleIndex = new Map<string, { platform: string; userId: string }>()
    for (const i of identityRows) {
      const key = touch(i.platform, i.userId, false)
      const row = identities.get(key)!
      row.handle = i.handle ? i.handle.replace(/^@/, '') : null
      row.handleLower = row.handle ? row.handle.toLowerCase() : null
      row.name = i.displayName
      row.nameLower = nameKeyOf(i.displayName)
      if (row.handleLower && !handleIndex.has(`${i.platform}:${row.handleLower}`)) handleIndex.set(`${i.platform}:${row.handleLower}`, { platform: i.platform, userId: i.userId })
    }
    for (const a of aliasRows) {
      const h = `${a.platform}:${a.handle.replace(/^@/, '').toLowerCase()}`
      if (!handleIndex.has(h)) handleIndex.set(h, { platform: a.platform, userId: a.userId })
    }
    const knownIds = new Set([...identityRows.map((i) => identityKeyOf(i.platform, i.userId)), ...aliasRows.map((a) => identityKeyOf(a.platform, a.userId))])

    const persons = new Map<string, PersonRow>()
    const links: LinkRow[] = []
    for (const l of linkRows) {
      const key = touch(l.platform, l.userId)
      const row = identities.get(key)!
      row.personId = l.personId
      row.personNames = (l.name ?? '').toLowerCase().split(/[^\p{L}\p{N}_]+/u).filter((w) => w.length >= TOKEN_MIN)
      const person = personKeyOf(l.personId)
      if (!persons.has(person)) persons.set(person, { key: person, personId: l.personId, name: l.name })
      links.push({ identity: key, person, linkedBy: l.linkedBy, linkedAt: l.linkedAt })
    }

    const servers = new Map<string, ServerRow>()
    const allRooms: RoomRow[] = chatRows.map((c) => {
      const entry = catalog.get(`${c.account}:${c.conversationId}`) ?? catalog.get(c.conversationId) ?? null
      const serverId = c.serverId ?? entry?.serverId ?? null
      const kind = entry?.kind ?? (serverId && c.platform === 'discord' ? 'channel' : c.kind)
      const name = kind !== 'dm' && entry ? channelNameOf(entry) : kind !== c.kind ? null : (c.name ?? entry?.name ?? null)
      const serverKey = serverId ? serverKeyOf(c.platform, serverId) : null
      if (serverKey) {
        const held = servers.get(serverKey)
        if (!held) servers.set(serverKey, { key: serverKey, platform: c.platform, serverId: serverId!, name: entry?.server ?? null })
        else held.name ??= entry?.server ?? null
      }
      return { key: c.chatId, platform: c.platform, account: c.account, accountKey: accountKeyOf(c.platform, c.account), conversationId: c.conversationId, kind, name, server: serverKey ? (entry?.server ?? servers.get(serverKey)!.name) : null, serverKey, lastAtMs: c.lastMessageAtMs }
    })
    for (const r of allRooms) if (r.serverKey && !r.server) r.server = servers.get(r.serverKey)!.name
    const rooms_ = scope ? allRooms.filter((r) => scope.rooms.has(r.key)) : allRooms
    const roomKeys = new Set(rooms_.map((r) => r.key))

    const members: MemberRow[] = memberRows.filter((m) => usable(m.userId) && roomKeys.has(m.roomId)).map((m) => ({ identity: touch(m.platform, m.userId), room: m.roomId, firstSeenAt: m.firstSeenAt, lastSeenAt: m.lastSeenAt }))

    const saidAll: SaidRow[] = saidRows.filter((s) => roomKeys.has(s.chatId) && (s.fromOwner === 1 || usable(s.userId))).map((s) => ({ identity: s.fromOwner === 1 ? '' : touch(s.platform, s.userId), room: s.chatId, messages: s.messages, firstAtMs: s.firstAtMs, lastAtMs: s.lastAtMs, fromOwner: s.fromOwner === 1, accountKey: accountKeyOf(s.platform, s.account) }))
    const ownerSaid = new Map<string, SaidRow>()
    for (const s of saidAll.filter((x) => x.fromOwner)) {
      const held = ownerSaid.get(s.room)
      if (!held) ownerSaid.set(s.room, { ...s })
      else {
        held.messages += s.messages
        held.firstAtMs = Math.min(held.firstAtMs ?? Infinity, s.firstAtMs ?? Infinity)
        if (!Number.isFinite(held.firstAtMs)) held.firstAtMs = null
        held.lastAtMs = Math.max(held.lastAtMs ?? 0, s.lastAtMs ?? 0) || null
      }
    }
    const said: SaidRow[] = [...saidAll.filter((x) => !x.fromOwner), ...ownerSaid.values()]

    const endOf = (platform: string, userId: string | null, owner: boolean, accountKey: string): { key: string; owner: boolean } | null => {
      if (owner || (userId && ownerIds.has(identityKeyOf(platform, userId))) || (userId && isSelf(userId))) return { key: accountKey, owner: true }
      if (!usable(userId)) return null
      return { key: touch(platform, userId), owner: false }
    }
    const pointed = (into: Map<string, PointedRow>, room: string, from: { key: string; owner: boolean }, to: { key: string; owner: boolean }, times: number, firstAtMs: number | null, lastAtMs: number | null) => {
      if (from.key === to.key || (from.owner && to.owner)) return
      const key = `${room}|${from.key}|${to.key}`
      const held = into.get(key)
      if (!held) {
        into.set(key, { from: from.key, fromOwner: from.owner, to: to.key, toOwner: to.owner, room, times, firstAtMs, lastAtMs })
        return
      }
      held.times += times
      if (firstAtMs !== null) held.firstAtMs = held.firstAtMs === null ? firstAtMs : Math.min(held.firstAtMs, firstAtMs)
      if (lastAtMs !== null) held.lastAtMs = held.lastAtMs === null ? lastAtMs : Math.max(held.lastAtMs, lastAtMs)
    }
    const replies = new Map<string, PointedRow>()
    for (const r of replyRows) {
      if (!roomKeys.has(r.chatId)) continue
      const accountKey = accountKeyOf(r.platform, r.account)
      const from = endOf(r.platform, r.fromId, r.fromOwner === 1, accountKey)
      const to = endOf(r.platform, r.toId, r.toOwner === 1, accountKey)
      if (from && to) pointed(replies, r.chatId, from, to, r.times, r.firstAtMs, r.lastAtMs)
    }
    const mentions = new Map<string, PointedRow>()
    for (const m of mentionRows) {
      if (!roomKeys.has(m.chatId)) continue
      const accountKey = accountKeyOf(m.platform, m.account)
      const from = endOf(m.platform, m.fromId, m.fromOwner === 1, accountKey)
      if (!from) continue
      const { ids, handles } = pointedAt(m.text)
      const targets = new Map<string, { key: string; owner: boolean }>()
      for (const id of ids) {
        const key = identityKeyOf(m.platform, id)
        if (ownerIds.has(key)) targets.set(accountKey, { key: accountKey, owner: true })
        else if (knownIds.has(key)) targets.set(key, { key: touch(m.platform, id), owner: false })
      }
      for (const h of handles) {
        if (ownerHandles.has(`${m.platform}:${h}`)) targets.set(accountKey, { key: accountKey, owner: true })
        else {
          const found = handleIndex.get(`${m.platform}:${h}`)
          if (!found) continue
          const key = touch(found.platform, found.userId)
          targets.set(key, { key, owner: identities.get(key)!.owner })
        }
      }
      for (const to of targets.values()) pointed(mentions, m.chatId, from, to.owner ? { key: accountKey, owner: true } : to, 1, m.sentAtMs, m.sentAtMs)
    }

    const posts = new Map<string, PostRow>()
    const engaged: EngagedRow[] = []
    for (const i of interactionRows) {
      if (!usable(i.actorUserId)) continue
      const accountKey = accountKeyOf(i.platform, i.account)
      const identity = touch(i.platform, i.actorUserId)
      let post: string | null = null
      if (i.targetRef) {
        post = `${i.platform}:${i.account}:${i.targetRef}`
        if (!posts.has(post)) posts.set(post, { key: post, platform: i.platform, account: i.account, accountKey, ref: i.targetRef, text: null })
      }
      engaged.push({ identity, post, accountKey, kind: i.kind, times: i.times, lastAtMs: i.lastAtMs })
    }
    const postTexts = scope ? (handle.prepare(`SELECT platform, account, actorUserId, targetRef, MAX(targetText) AS targetText FROM interactions WHERE ${inList("platform || ':' || account || ':' || targetRef")} GROUP BY platform, account, kind, actorUserId, targetRef`).all(JSON.stringify([...posts.keys()])) as { platform: string; account: string; actorUserId: string | null; targetRef: string; targetText: string | null }[]) : interactionRows
    for (const t of postTexts) {
      if (!usable(t.actorUserId) || !t.targetRef || !t.targetText) continue
      const held = posts.get(`${t.platform}:${t.account}:${t.targetRef}`)
      if (held && (!held.text || t.targetText > held.text)) held.text = t.targetText
    }

    for (const key of scope?.identities ?? []) {
      const at = key.indexOf(':')
      if (at > 0 && usable(key.slice(at + 1))) touch(key.slice(0, at), key.slice(at + 1))
    }
    const emitted = scope ? [...identities.values()].filter((r) => marked.has(r.key)) : [...identities.values()]
    const senders = emitted.filter((r) => usable(r.userId)).map((r) => [r.platform, r.userId])
    const labelRows = handle.prepare(`SELECT DISTINCT m.senderPlatform AS platform, m.senderUserId AS userId, m.senderLabel AS label FROM ${scope ? "json_each(?) j JOIN messages m ON m.senderPlatform = json_extract(j.value, '$[0]') AND m.senderUserId = json_extract(j.value, '$[1]') AND" : 'messages m WHERE'} m.fromOwner = 0 AND m.senderLabel IS NOT NULL`).all(...((scope ? [JSON.stringify(senders)] : []) as never[])) as { platform: string; userId: string; label: string }[]
    const labelsOf = new Map<string, string[]>()
    for (const l of labelRows) {
      if (!usable(l.userId)) continue
      const key = identityKeyOf(l.platform, l.userId)
      labelsOf.set(key, [...(labelsOf.get(key) ?? []), l.label])
    }
    for (const [key, set] of aliasesOf) {
      const row = identities.get(key)
      if (row) row.aliases = [...set]
    }
    for (const row of identities.values()) {
      if (row.handleLower && ownerHandles.has(`${row.platform}:${row.handleLower}`)) row.owner = true
      row.labels = namesOf([row.handle, row.name, ...(labelsOf.get(row.key) ?? []).sort()])
    }
    applyRings(handle, identities)
    applyPersonRings(handle, persons)
    const network = networkProjectionOf(handle, identities, accounts, scope ? marked : undefined)
    const servedRooms = new Set(rooms_.map((r) => r.serverKey).filter(Boolean))
    return {
      throughSeq,
      schemaVersion,
      accounts,
      identities: scope ? [...identities.values()].filter((r) => marked.has(r.key)) : [...identities.values()],
      rooms: rooms_,
      members,
      said,
      posts: [...posts.values()],
      engaged,
      servers: scope ? [...servers.values()].filter((s) => servedRooms.has(s.key)) : [...servers.values()],
      persons: [...persons.values()],
      links,
      replies: [...replies.values()],
      mentions: [...mentions.values()],
      network,
      memory: memoryProjectionOf(handle, !scope || scope.memory === true),
      memoryWhole: !scope || scope.memory === true,
    }
  })
}
