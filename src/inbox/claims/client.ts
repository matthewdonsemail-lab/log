import type { Database } from 'bun:sqlite'
import { db, eventIdOf as storeEventIdOf, immediate, markStage } from '../store/index'
import type { ClaimRow } from '../store/index'
import { processAlive } from '../watch/index'
import type { InboxMessage } from '../watch/index'
import { CLAIM_TTL_MS } from './types'
import type { ActionRecord, ChatClaim, ChatRef } from './types'

export function eventIdOf(message: Pick<InboxMessage, 'platform' | 'account' | 'conversationId' | 'at' | 'text'>): string {
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

export type SendGuard = { ok: true; held: () => boolean; done: (outcome: 'sent' | 'interrupted' | 'failed', detail?: string) => void } | { ok: false; refused: string }

export function guardSend(ref: ChatRef, by: number = process.pid): SendGuard {
  const claimed = claimChat(ref, by)
  if (!claimed.ok) return { ok: false, refused: `>>> CLAIMED ELSEWHERE: another session (pid ${claimed.holder.by}) holds ${ref.platform} ${ref.account}'s chat ${ref.with ? `with ${ref.with} ` : ''}until ${claimed.holder.expiresAt}, so nothing was sent; leave it to that session` }
  if (ref.eventId) markStage(ref.eventId, 'actionStart')
  return { ok: true, held: () => stillHeld(claimed.claim), done: (outcome, detail) => void releaseChat(ref, by, outcome, detail) }
}
