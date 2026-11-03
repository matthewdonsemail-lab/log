import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { inboxRoot, processAlive } from '../watch/index'
import type { InboxMessage } from '../watch/index'
import { CLAIM_TTL_MS } from './types'
import type { ActionRecord, ChatClaim, ChatRef } from './types'

const claimsDir = () => join(inboxRoot(), 'claims')
const actionsPath = () => join(inboxRoot(), 'actions.jsonl')

export function eventIdOf(message: Pick<InboxMessage, 'platform' | 'account' | 'conversationId' | 'at' | 'text'>): string {
  return createHash('sha1').update([message.platform, message.account, message.conversationId, message.at, message.text].join('|')).digest('hex').slice(0, 12)
}

export function partiesOf(platform: string, conversationId: string): string[] {
  const ids = platform === 'twitter' ? conversationId.split(/[-:]/).filter(Boolean) : [conversationId]
  return [...new Set(ids)].sort()
}

function keyOf(ref: ChatRef): string {
  return `${ref.platform}.${ref.account}.${partiesOf(ref.platform, ref.conversationId).join('-')}`.replace(/[^A-Za-z0-9._-]/g, '_')
}

function readClaim(path: string): ChatClaim | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as ChatClaim
  } catch {
    return null
  }
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

export function claimsOn(platform: string, account: string, chat: string, now: Date = new Date(), alive: (pid: number) => boolean = processAlive): ChatClaim[] {
  if (!existsSync(claimsDir())) return []
  return readdirSync(claimsDir())
    .filter((name) => name.endsWith('.json'))
    .map((name) => readClaim(join(claimsDir(), name)))
    .filter((claim): claim is ChatClaim => !!claim && sameChat(claim, platform, account, chat) && claimLive(claim, now, alive))
}

export function liveClaims(now: Date = new Date(), alive: (pid: number) => boolean = processAlive): ChatClaim[] {
  if (!existsSync(claimsDir())) return []
  return readdirSync(claimsDir())
    .filter((name) => name.endsWith('.json'))
    .map((name) => readClaim(join(claimsDir(), name)))
    .filter((claim): claim is ChatClaim => !!claim && claimLive(claim, now, alive))
}

export function recordAction(record: Omit<ActionRecord, 'at'>, now: Date = new Date()): void {
  mkdirSync(inboxRoot(), { recursive: true })
  appendFileSync(actionsPath(), JSON.stringify({ at: now.toISOString(), ...record }) + '\n')
}

export function readActions(filter: { platform?: string; account?: string; chat?: string; limit?: number } = {}): ActionRecord[] {
  if (!existsSync(actionsPath())) return []
  const rows = readFileSync(actionsPath(), 'utf8')
    .split('\n')
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line) as ActionRecord]
      } catch {
        return []
      }
    })
    .filter((r) => (!filter.platform || r.platform === filter.platform) && (!filter.account || r.account === filter.account))
    .filter((r) => !filter.chat || chatsMatch(r.platform, partiesOf(r.platform, r.conversationId), partiesOf(r.platform, filter.chat)) || r.with?.toLowerCase() === filter.chat.replace(/^@/, '').toLowerCase())
  return rows.slice(-(filter.limit ?? 50))
}

export function claimChat(ref: ChatRef, by: number = process.pid, now: Date = new Date(), alive: (pid: number) => boolean = processAlive, ttlMs: number = CLAIM_TTL_MS): { ok: true; claim: ChatClaim; renewed: boolean } | { ok: false; holder: ChatClaim } {
  const other = claimsOn(ref.platform, ref.account, ref.conversationId, now, alive).find((c) => c.by !== by)
  if (other) {
    recordAction({ kind: 'refused', platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, eventId: ref.eventId, by, detail: `held by pid ${other.by} until ${other.expiresAt}` }, now)
    return { ok: false, holder: other }
  }
  mkdirSync(claimsDir(), { recursive: true })
  const key = keyOf(ref)
  const path = join(claimsDir(), `${key}.json`)
  const claim: ChatClaim = { key, platform: ref.platform, account: ref.account, conversationId: ref.conversationId, parties: partiesOf(ref.platform, ref.conversationId), ...(ref.with ? { with: ref.with.replace(/^@/, '') } : {}), ...(ref.eventId ? { eventId: ref.eventId } : {}), by, claimedAt: now.toISOString(), expiresAt: new Date(now.getTime() + ttlMs).toISOString() }
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      writeFileSync(path, JSON.stringify(claim, null, 2), { flag: 'wx' })
      recordAction({ kind: 'claimed', platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, eventId: ref.eventId, by }, now)
      return { ok: true, claim, renewed: false }
    } catch {
      const held = readClaim(path)
      if (held && held.by === by) {
        const renewed = { ...held, eventId: ref.eventId ?? held.eventId, expiresAt: claim.expiresAt }
        writeFileSync(path, JSON.stringify(renewed, null, 2))
        recordAction({ kind: 'renewed', platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, eventId: ref.eventId, by }, now)
        return { ok: true, claim: renewed, renewed: true }
      }
      if (held && claimLive(held, now, alive)) {
        recordAction({ kind: 'refused', platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, eventId: ref.eventId, by, detail: `held by pid ${held.by} until ${held.expiresAt}` }, now)
        return { ok: false, holder: held }
      }
      rmSync(path, { force: true })
    }
  }
  const held = readClaim(path)
  return held ? { ok: false, holder: held } : { ok: false, holder: claim }
}

export function releaseChat(ref: ChatRef, by: number = process.pid, outcome: ActionRecord['kind'] = 'released', detail?: string, now: Date = new Date()): boolean {
  let released = false
  if (existsSync(claimsDir())) {
    for (const name of readdirSync(claimsDir()).filter((n) => n.endsWith('.json'))) {
      const path = join(claimsDir(), name)
      const claim = readClaim(path)
      if (claim && claim.by === by && sameChat(claim, ref.platform, ref.account, ref.conversationId)) {
        rmSync(path, { force: true })
        released = true
      }
    }
  }
  if (outcome !== 'released') recordAction({ kind: outcome, platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, eventId: ref.eventId, by, ...(detail ? { detail } : {}) }, now)
  recordAction({ kind: 'released', platform: ref.platform, account: ref.account, conversationId: ref.conversationId, with: ref.with, eventId: ref.eventId, by }, now)
  return released
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

export function guardSend(ref: ChatRef, by: number = process.pid): { ok: true; done: (outcome: 'sent' | 'interrupted' | 'failed', detail?: string) => void } | { ok: false; refused: string } {
  const claimed = claimChat(ref, by)
  if (!claimed.ok) return { ok: false, refused: `>>> CLAIMED ELSEWHERE: another session (pid ${claimed.holder.by}) holds ${ref.platform} ${ref.account}'s chat ${ref.with ? `with ${ref.with} ` : ''}until ${claimed.holder.expiresAt}, so nothing was sent; leave it to that session` }
  return { ok: true, done: (outcome, detail) => void releaseChat(ref, by, outcome, detail) }
}
