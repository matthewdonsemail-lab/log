import type { Database } from 'bun:sqlite'
import { db, eventIdOf as storeEventIdOf, immediate, markStage } from '../store/index'
import type { ClaimRow } from '../store/index'
import { processAlive } from '../watch/index'
import type { InboxMessage } from '../watch/index'
import { createHash, randomBytes } from 'node:crypto'
import { CLAIM_TTL_MS } from './types'
import type { ActionRecord, ChatClaim, ChatRef, PartStep, SendOptions } from './types'
import { timedSync } from '../../observability/timing/index'

export function eventIdOf(message: Pick<InboxMessage, 'platform' | 'account' | 'conversationId' | 'at' | 'text' | 'id'>): string {
  return storeEventIdOf(message)
}

export function partiesOf(platform: string, conversationId: string): string[] {
  const ids = platform === 'twitter' ? conversationId.split(/[-:]/).filter(Boolean) : [conversationId]
  return [...new Set(ids)].sort()
}

function keyOf(ref: ChatRef): string {
  return `${ref.platform}.${ref.account}.${partiesOf(ref.platform, ref.conversationId).join('-')}`.replace(/[^A-Za-z0-9._-]/g, '_')
}

function claimOf(row: ClaimRow): ChatClaim {
  return { key: row.chatKey, platform: row.platform, account: row.account, conversationId: row.conversationId, parties: JSON.parse(row.parties) as string[], ...(row.withWho ? { with: row.withWho } : {}), ...(row.eventId ? { eventId: row.eventId } : {}), by: row.holder, generation: row.generation, claimedAt: row.claimedAt, expiresAt: row.expiresAt }
}

function claimRows(handle: Database, platform?: string, account?: string): ChatClaim[] {
  const rows = (platform ? handle.prepare('SELECT * FROM claims WHERE platform = ? AND account = ?').all(platform, account ?? '') : handle.prepare('SELECT * FROM claims').all()) as ClaimRow[]
  return rows.map(claimOf)
}

export function claimLive(claim: ChatClaim, now: Date = new Date(), alive: (pid: number) => boolean = processAlive): boolean {
  return alive(claim.by) && Date.parse(claim.expiresAt) > now.getTime()
}

export function chatsMatch(platform: string, a: readonly string[], b: readonly string[]): boolean {
  if (platform !== 'twitter') return a.some((id) => b.includes(id))
  if (a.length === 1) return b.includes(a[0]!)
  if (b.length === 1) return a.includes(b[0]!)
  return a.join('-') === b.join('-')
}

export function sameChat(claim: ChatClaim, platform: string, account: string, chat: string): boolean {
  if (claim.platform !== platform || claim.account !== account) return false
  return chatsMatch(platform, claim.parties, partiesOf(platform, chat)) || (!!claim.with && claim.with.toLowerCase() === chat.replace(/^@/, '').toLowerCase())
}

export function claimsOn(platform: string, account: string, chat: string, now: Date = new Date(), alive: (pid: number) => boolean = processAlive, handle: Database = db()): ChatClaim[] {
  return claimRows(handle, platform, account).filter((claim) => sameChat(claim, platform, account, chat) && claimLive(claim, now, alive))
}

export function liveClaims(now: Date = new Date(), alive: (pid: number) => boolean = processAlive): ChatClaim[] {
  return claimRows(db()).filter((claim) => claimLive(claim, now, alive))
}

export function recordAction(record: Omit<ActionRecord, 'at'>, now: Date = new Date(), handle: Database = db()): void {
  handle.prepare('INSERT INTO actions (at, kind, platform, account, conversationId, withWho, eventId, holder, generation, stateBefore, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(now.toISOString(), record.kind, record.platform, record.account, record.conversationId, record.with ?? null, record.eventId ?? null, record.by, record.generation ?? null, record.stateBefore ?? null, record.detail ?? null)
  if (record.detail) handle.prepare('INSERT INTO searchIndex (source, ref, platform, account, conversationId, text) VALUES (?, ?, ?, ?, ?, ?)').run('action', record.kind, record.platform, record.account, record.conversationId, `${record.with ?? ''} ${record.detail}`)
}

type ActionRow = { at: string; kind: ActionRecord['kind']; platform: string; account: string; conversationId: string; withWho: string | null; eventId: string | null; holder: number; generation: number | null; stateBefore: string | null; detail: string | null }

export function readActions(filter: { platform?: string; account?: string; chat?: string; limit?: number } = {}): ActionRecord[] {
  const rows = db().prepare('SELECT * FROM actions ORDER BY id').all() as ActionRow[]
  return rows
    .map((r): ActionRecord => ({ at: r.at, kind: r.kind, platform: r.platform, account: r.account, conversationId: r.conversationId, ...(r.withWho ? { with: r.withWho } : {}), ...(r.eventId ? { eventId: r.eventId } : {}), by: r.holder, ...(r.generation ? { generation: r.generation } : {}), ...(r.stateBefore ? { stateBefore: r.stateBefore } : {}), ...(r.detail ? { detail: r.detail } : {}) }))
    .filter((r) => (!filter.platform || r.platform === filter.platform) && (!filter.account || r.account === filter.account))
    .filter((r) => !filter.chat || chatsMatch(r.platform, partiesOf(r.platform, r.conversationId), partiesOf(r.platform, filter.chat)) || r.with?.toLowerCase() === filter.chat.replace(/^@/, '').toLowerCase())
    .slice(-(filter.limit ?? 50))
}

function lastAction(handle: Database, ref: ChatRef): string | null {
  const row = handle.prepare('SELECT kind, at, holder FROM actions WHERE platform = ? AND account = ? AND conversationId = ? ORDER BY id DESC LIMIT 1').get(ref.platform, ref.account, ref.conversationId) as { kind: string; at: string; holder: number } | null
  return row ? `${row.kind} by pid ${row.holder} at ${row.at}` : null
}

export function claimChat(ref: ChatRef, by: number = process.pid, now: Date = new Date(), alive: (pid: number) => boolean = processAlive, ttlMs: number = CLAIM_TTL_MS): { ok: true; claim: ChatClaim; renewed: boolean } | { ok: false; holder: ChatClaim } {
  return timedSync('inbox.claim', () => claimChatNow(ref, by, now, alive, ttlMs), { platform: ref.platform })
}

function claimChatNow(ref: ChatRef, by: number, now: Date, alive: (pid: number) => boolean, ttlMs: number): { ok: true; claim: ChatClaim; renewed: boolean } | { ok: false; holder: ChatClaim } {
  return immediate((handle) => {
    const base = { platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, eventId: ref.eventId, by }
    const matching = claimRows(handle, ref.platform, ref.account).filter((c) => sameChat(c, ref.platform, ref.account, ref.conversationId))
    const other = matching.find((c) => c.by !== by && claimLive(c, now, alive))
    if (other) {
      recordAction({ ...base, kind: 'refused', generation: other.generation, detail: `held by pid ${other.by} until ${other.expiresAt}` }, now, handle)
      return { ok: false as const, holder: other }
    }
    const expiresAt = new Date(now.getTime() + ttlMs).toISOString()
    const own = matching.find((c) => c.by === by && claimLive(c, now, alive))
    if (own) {
      handle.prepare('UPDATE claims SET expiresAt = ?, eventId = COALESCE(?, eventId) WHERE chatKey = ?').run(expiresAt, ref.eventId ?? null, own.key)
      recordAction({ ...base, kind: 'renewed', generation: own.generation }, now, handle)
      return { ok: true as const, claim: { ...own, ...(ref.eventId ? { eventId: ref.eventId } : {}), expiresAt }, renewed: true }
    }
    for (const stale of matching) handle.prepare('DELETE FROM claims WHERE chatKey = ?').run(stale.key)
    const key = keyOf(ref)
    handle.prepare('INSERT INTO chatGenerations (chatKey, generation) VALUES (?, 1) ON CONFLICT(chatKey) DO UPDATE SET generation = generation + 1').run(key)
    const generation = (handle.prepare('SELECT generation FROM chatGenerations WHERE chatKey = ?').get(key) as { generation: number }).generation
    const parties = partiesOf(ref.platform, ref.conversationId)
    const withWho = ref.with ? ref.with.replace(/^@/, '') : null
    const stateBefore = lastAction(handle, ref) ?? 'nothing done here yet'
    handle.prepare('INSERT OR REPLACE INTO claims (chatKey, platform, account, conversationId, parties, withWho, eventId, holder, generation, claimedAt, expiresAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(key, ref.platform, ref.account, ref.conversationId, JSON.stringify(parties), withWho, ref.eventId ?? null, by, generation, now.toISOString(), expiresAt)
    recordAction({ ...base, kind: 'claimed', generation, stateBefore }, now, handle)
    if (ref.eventId) markStage(ref.eventId, 'claimed', now, handle)
    const claim: ChatClaim = { key, platform: ref.platform, account: ref.account, conversationId: ref.conversationId, parties, ...(withWho ? { with: withWho } : {}), ...(ref.eventId ? { eventId: ref.eventId } : {}), by, generation, claimedAt: now.toISOString(), expiresAt }
    return { ok: true as const, claim, renewed: false }
  })
}

export function stillHeld(claim: ChatClaim, now: Date = new Date()): boolean {
  const row = db().prepare('SELECT holder, generation, expiresAt FROM claims WHERE chatKey = ?').get(claim.key) as { holder: number; generation: number; expiresAt: string } | null
  return !!row && row.holder === claim.by && row.generation === claim.generation && Date.parse(row.expiresAt) > now.getTime()
}

export function releaseChat(ref: ChatRef, by: number = process.pid, outcome: ActionRecord['kind'] = 'released', detail?: string, now: Date = new Date()): boolean {
  return immediate((handle) => {
    const mine = claimRows(handle, ref.platform, ref.account).filter((c) => c.by === by && sameChat(c, ref.platform, ref.account, ref.conversationId))
    for (const claim of mine) handle.prepare('DELETE FROM claims WHERE chatKey = ? AND holder = ? AND generation = ?').run(claim.key, by, claim.generation)
    const generation = mine[0]?.generation
    const base = { platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, eventId: ref.eventId, by, ...(generation ? { generation } : {}) }
    if (outcome !== 'released') recordAction({ ...base, kind: outcome, ...(detail ? { detail } : {}) }, now, handle)
    if (outcome === 'sent' && ref.eventId) markStage(ref.eventId, 'confirmed', now, handle)
    recordAction({ ...base, kind: 'released' }, now, handle)
    return mine.length > 0
  })
}

export function claimContext(messages: readonly InboxMessage[], now: Date = new Date(), alive: (pid: number) => boolean = processAlive): string | null {
  if (!messages.length) return null
  const lines = messages.map((m) => {
    const eventId = eventIdOf(m)
    const held = claimsOn(m.platform, m.account, m.conversationId, now, alive)[0] ?? (m.with ? claimsOn(m.platform, m.account, m.with, now, alive)[0] : undefined)
    const state = held ? `CLAIMED by pid ${held.by} until ${held.expiresAt}: leave it to that session` : `unclaimed: \`inboxClaim\` { platform: "${m.platform}", account: "${m.account}", chat: "${m.conversationId}", event: "${eventId}" } before drafting`
    return `  event ${eventId} · ${m.platform} ${m.account} · ${m.with} · chat ${m.conversationId}: ${state}`
  })
  return ['>>> CLAIM BEFORE YOU ACT (rule 133): only the session that claims a chat answers it, and a send into a chat another session holds is refused. Read `inboxActions` { chat } first to see what was already done there.', ...lines].join('\n')
}

export type SendGuard = { ok: true; opId: string; held: () => boolean; part: (n: number, text: string) => PartStep; partSent: (n: number, text: string, messageId?: string | null) => void; heard: () => string[]; done: (outcome: 'sent' | 'interrupted' | 'failed', detail?: string) => void } | { ok: false; refused: string }

export const textHashOf = (text: string): string => createHash('sha1').update(text.trim()).digest('hex').slice(0, 12)

function holdsSend(handle: Database, claim: ChatClaim, opId: string, now: Date): boolean {
  const row = handle.prepare('SELECT holder, generation, expiresAt, sendingOp FROM claims WHERE chatKey = ?').get(claim.key) as { holder: number; generation: number; expiresAt: string; sendingOp: string | null } | null
  return !!row && row.holder === claim.by && row.generation === claim.generation && Date.parse(row.expiresAt) > now.getTime() && row.sendingOp === opId
}

export function echoedBefore(handle: Database, ref: ChatRef, text: string, opId: string): boolean {
  const hash = textHashOf(text)
  const intents = handle.prepare("SELECT at, detail FROM actions WHERE platform = ? AND account = ? AND conversationId = ? AND kind = 'intent' ORDER BY id DESC LIMIT 50").all(ref.platform, ref.account, ref.conversationId) as { at: string; detail: string | null }[]
  for (const intent of intents) {
    let detail: { op?: string; hash?: string } = {}
    try {
      detail = JSON.parse(intent.detail ?? '{}') as { op?: string; hash?: string }
    } catch {}
    if (detail.op === opId || detail.hash !== hash) continue
    const finished = handle.prepare("SELECT 1 FROM actions WHERE kind = 'partSent' AND platform = ? AND account = ? AND conversationId = ? AND detail LIKE ?").get(ref.platform, ref.account, ref.conversationId, `%"op":"${detail.op}"%"hash":"${hash}"%`)
    if (finished) continue
    const echo = handle.prepare("SELECT 1 FROM events WHERE platform = ? AND account = ? AND conversationId = ? AND type = 'ownMessage' AND trim(text) = ? AND appendedAt >= ?").get(ref.platform, ref.account, ref.conversationId, text.trim(), intent.at)
    if (echo) return true
  }
  return false
}

export function heardAfter(handle: Database, ref: ChatRef, readUpTo: number): string[] {
  const parties = partiesOf(ref.platform, ref.conversationId)
  const rows = handle.prepare("SELECT conversationId, withWho, text FROM events WHERE platform = ? AND account = ? AND type = 'message' AND seq > ? ORDER BY seq").all(ref.platform, ref.account, readUpTo) as { conversationId: string; withWho: string; text: string }[]
  return rows.filter((r) => chatsMatch(ref.platform, partiesOf(ref.platform, r.conversationId), parties)).map((r) => `${r.withWho || 'they'}: ${r.text}`)
}

export function guardSend(ref: ChatRef, by: number = process.pid, options: SendOptions = {}): SendGuard {
  const claimed = claimChat(ref, by)
  if (!claimed.ok) return { ok: false, refused: `>>> CLAIMED ELSEWHERE: another session (pid ${claimed.holder.by}) holds ${ref.platform} ${ref.account}'s chat ${ref.with ? `with ${ref.with} ` : ''}until ${claimed.holder.expiresAt}, so nothing was sent; leave it to that session` }
  const claim = claimed.claim
  const opId = randomBytes(8).toString('hex')
  const leased = immediate((handle) => {
    const row = handle.prepare('SELECT sendingOp, sendingSince FROM claims WHERE chatKey = ?').get(claim.key) as { sendingOp: string | null; sendingSince: string | null } | null
    const busy = row?.sendingOp && row.sendingSince && Date.now() - Date.parse(row.sendingSince) < CLAIM_TTL_MS
    if (busy) return false
    handle.prepare('UPDATE claims SET sendingOp = ?, sendingSince = ? WHERE chatKey = ?').run(opId, new Date().toISOString(), claim.key)
    return true
  })
  if (!leased) return { ok: false, refused: `>>> A SEND IS ALREADY GOING OUT: this session (pid ${by}) is sending into ${ref.platform} ${ref.account}'s chat ${ref.with ? `with ${ref.with} ` : ''}in another call right now, so this one sent nothing; wait for it to finish` }
  if (ref.eventId) markStage(ref.eventId, 'actionStart')
  let heardLate: string[] = []
  const part = (n: number, text: string): PartStep =>
    immediate((handle) => {
      const now = new Date()
      if (!holdsSend(handle, claim, opId, now)) return 'lost'
      if (n === 0 && options.readUpTo !== undefined) {
        heardLate = heardAfter(handle, ref, options.readUpTo)
        if (heardLate.length) return 'movedOn'
      }
      if (echoedBefore(handle, ref, text, opId)) {
        recordAction({ platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, by, generation: claim.generation, kind: 'partSent', detail: JSON.stringify({ op: opId, part: n, hash: textHashOf(text), already: 'its echo was already in the chat, so it was not sent again' }) }, now, handle)
        return 'alreadySent'
      }
      handle.prepare('UPDATE claims SET expiresAt = ? WHERE chatKey = ?').run(new Date(now.getTime() + CLAIM_TTL_MS).toISOString(), claim.key)
      recordAction({ platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, by, generation: claim.generation, kind: 'intent', detail: JSON.stringify({ op: opId, part: n, hash: textHashOf(text) }) }, now, handle)
      return 'go'
    })
  const partSent = (n: number, text: string, messageId: string | null = null) =>
    void immediate((handle) => recordAction({ platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, by, generation: claim.generation, kind: 'partSent', detail: JSON.stringify({ op: opId, part: n, hash: textHashOf(text), ...(messageId ? { messageId } : {}) }) }, new Date(), handle))
  const done = (outcome: 'sent' | 'interrupted' | 'failed', detail?: string) => {
    immediate((handle) => handle.prepare('UPDATE claims SET sendingOp = NULL, sendingSince = NULL WHERE chatKey = ? AND sendingOp = ?').run(claim.key, opId))
    releaseChat(ref, by, outcome, detail)
  }
  return { ok: true, opId, held: () => immediate((handle) => holdsSend(handle, claim, opId, new Date())), part, partSent, heard: () => heardLate, done }
}
