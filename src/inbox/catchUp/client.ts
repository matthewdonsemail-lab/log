import type { PlatformAccount, PlatformEngineRun, PlatformEngineSpec } from '../../platformKit/session/index'
import { addToPayload, adoptUnkeyed, afterGap, appendEvent, behindOf, eventIdOf, positionsOf, recordPosition } from '../store/index'
import { BACKFILL_SCOPE } from '../dbRead/types'
import type { GapRow } from '../store/index'
import { BEHIND_WAIT_MS, READ_GAP_MS } from './types'
import type { CatchUpResult, PlatformRead, ReadMessage } from './types'
import { timed } from '../../observability/timing/index'
import { notThePlatform } from '../relay/index'

export function pacedWait(random: () => number = Math.random): Promise<void> {
  const [low, high] = READ_GAP_MS
  return new Promise((done) => setTimeout(done, low + random() * (high - low)))
}

export function storeRead(platform: string, account: string, chat: string, box: string, m: ReadMessage, now: Date, source: 'live' | 'catchUp' | 'backfill' = 'catchUp'): boolean {
  if (m.text == null || !m.at) return false
  const id = m.id ?? m.ts ?? null
  const senderId = m.fromMe ? null : m.fromId ?? m.senderId ?? m.userId ?? null
  const row = { platform, account, conversationId: chat, with: String(m.from ?? '?'), text: String(m.text), at: m.at, box, seenAt: now.toISOString(), ...(id ? { id: String(id) } : {}), ...(senderId ? { senderId: String(senderId) } : {}) }
  const attachments = m.attachments ? { attachments: m.attachments } : {}
  if (id && adoptUnkeyed({ platform, account, conversationId: chat, at: m.at, text: String(m.text), id: String(id) }, attachments)) return false
  const added = !!appendEvent({ platform, account, conversationId: chat, type: m.fromMe ? 'ownMessage' : 'message', with: row.with, text: row.text, box, payload: { ...row, id, ...attachments }, sourceAt: m.at, receivedAt: m.fromMe ? m.at : now.toISOString(), eventId: eventIdOf(row), source })
  if (!added && m.attachments) addToPayload(eventIdOf(row), { id, ...attachments })
  return added
}

function refusedOf(run: PlatformEngineRun): string | null {
  return run.answer.ok ? null : `${run.answer.code ?? 'refused'}: ${run.answer.detail ?? ''}`
}

const ACCOUNT_REFUSAL = /\b(?:401|429)\b|rateLimited|unauthorized|tokenRevoked|authRequired/i

const CHAT_ACCESS_REFUSAL = /Missing Access|Missing Permissions|Unknown Channel|\b(?:50001|10003|50013)\b|\b403\b[^:]*\bchannel\b/i

export function chatRefusalIsLocal(refused: string): boolean {
  return CHAT_ACCESS_REFUSAL.test(refused) && !ACCOUNT_REFUSAL.test(refused)
}

async function readChats(platform: string, account: PlatformAccount, gap: GapRow, read: PlatformRead, chats: { chat: string; box: string; spec: PlatformEngineSpec; position: (m: ReadMessage) => string | null }[], now: Date, wait: () => Promise<void>): Promise<CatchUpResult> {
  let appended = 0
  const skipped: string[] = []
  for (const [i, c] of chats.entries()) {
    if (i) await wait()
    const run = read(account, { ...c.spec, catchUp: true } as PlatformEngineSpec)
    const refused = refusedOf(run)
    if (refused) {
      if (chatRefusalIsLocal(refused)) {
        skipped.push(`${c.chat}: ${refused}`)
        continue
      }
      return { appended, refused: `reading ${c.chat}: ${refused}`, skipped }
    }
    const messages = ((run.answer.messages as ReadMessage[] | undefined) ?? []).filter((m) => afterGap(m.at, gap.fromAt))
    let last: string | null = null
    for (const m of messages) {
      if (storeRead(platform, account.accountName, c.chat, c.box, m, now)) appended++
      last = c.position(m) ?? last
    }
    if (last) recordPosition(platform, account.accountName, last, c.chat, now)
  }
  const summary = `${chats.length - skipped.length} chat(s) read after their saved position`
  return { appended, skipped: skipped.length ? skipped : undefined, detail: skipped.length ? `${summary}; ${skipped.length} skipped without access: ${skipped.join('; ')}` : summary }
}

export function discordCatchUp(account: PlatformAccount, gap: GapRow, read: PlatformRead, now: Date = new Date(), wait: () => Promise<void> = pacedWait): Promise<CatchUpResult> {
  const chats = Object.entries(positionsOf('discord', account.accountName)).filter(([chat]) => chat && !chat.startsWith(BACKFILL_SCOPE))
  return readChats('discord', account, gap, read, chats.map(([chat, after]) => ({ chat, box: 'dm', spec: { action: 'read', channel: chat, limit: 100, after }, position: (m) => m.id ?? null })), now, wait)
}

export function slackCatchUp(account: PlatformAccount, gap: GapRow, read: PlatformRead, now: Date = new Date(), wait: () => Promise<void> = pacedWait, workspace: Record<string, unknown> = {}): Promise<CatchUpResult> {
  const chats = Object.entries(positionsOf('slack', account.accountName)).filter(([chat]) => chat && !chat.startsWith(BACKFILL_SCOPE))
  return readChats('slack', account, gap, read, chats.map(([chat, oldest]) => ({ chat, box: chat.startsWith('D') ? 'dm' : chat.startsWith('G') ? 'group' : 'mention', spec: { action: 'read', chat, limit: 200, oldest, saveAudio: false, ...workspace }, position: (m) => m.ts ?? null })), now, wait)
}

export async function instagramCatchUp(account: PlatformAccount, gap: GapRow, read: PlatformRead, now: Date = new Date(), wait: () => Promise<void> = pacedWait): Promise<CatchUpResult> {
  const listed = read(account, { action: 'inbox', limit: 20 })
  const refused = refusedOf(listed)
  if (refused) return { appended: 0, refused: `reading the inbox: ${refused}` }
  const since = positionsOf('instagram', account.accountName)[''] ?? gap.fromAt
  const threads = ((listed.answer.threads as { id: string; lastActivity?: string | null }[] | undefined) ?? []).filter((t) => (t.lastActivity ?? '') > since)
  await wait()
  const got = await readChats('instagram', account, gap, read, threads.map((t) => ({ chat: String(t.id), box: 'dm', spec: { action: 'thread', with: String(t.id), limit: 20 }, position: () => null })), now, wait)
  const newest = ((listed.answer.threads as { lastActivity?: string | null }[] | undefined) ?? []).map((t) => t.lastActivity ?? '').sort().pop()
  if (!got.refused && newest) recordPosition('instagram', account.accountName, newest, '', now)
  return { ...got, detail: `${threads.length} thread(s) active since ${since}` }
}

export function catchUpOneChat(platform: string, account: string, conversationId: string, read: () => { ok: boolean; messages?: ReadMessage[]; code?: string; detail?: string }, now: Date = new Date()): { ok: true; how: 'current' | 'chatRead'; stored: number } | { ok: false; refused: string } {
  const gap = behindOf(platform, account)
  if (!gap) return { ok: true, how: 'current', stored: 0 }
  if (gap.status === 'refused' && !notThePlatform(gap.detail)) return { ok: false, refused: `>>> BEHIND: ${platform} ${account} has a gap from ${gap.fromAt} that its catch-up couldn't fill (${gap.detail ?? 'refused'}), so nothing was sent; nothing resumes on it until matt says so (rule 94)` }
  const answer = read()
  if (!answer.ok) return { ok: false, refused: `>>> BEHIND: ${platform} ${account} is still catching up, and reading this one chat to catch it up was refused (${answer.code ?? 'refused'}: ${answer.detail ?? ''}), so nothing was sent (rule 94)` }
  const stored = (answer.messages ?? []).filter((m) => storeRead(platform, account, conversationId, 'dm', m, now, 'catchUp')).length
  return { ok: true, how: 'chatRead', stored }
}

type WaitOptions = { timeoutMs?: number; sleep?: (ms: number) => Promise<void>; now?: () => number }

export function waitCaughtUp(platform: string, account: string, options: WaitOptions = {}): Promise<{ ok: true; waitedMs: number } | { ok: false; refused: string }> {
  return timed('inbox.waitCaughtUp', async (span) => {
    const result = await waitCaughtUpNow(platform, account, options)
    span.attrs.caughtUp = result.ok
    return result
  }, { platform, account })
}

async function waitCaughtUpNow(platform: string, account: string, options: WaitOptions): Promise<{ ok: true; waitedMs: number } | { ok: false; refused: string }> {
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)))
  const now = options.now ?? Date.now
  const started = now()
  const limit = options.timeoutMs ?? BEHIND_WAIT_MS
  for (;;) {
    const gap = behindOf(platform, account)
    if (!gap) return { ok: true, waitedMs: now() - started }
    if (gap.status === 'refused' && !notThePlatform(gap.detail)) return { ok: false, refused: `>>> BEHIND: ${platform} ${account} has a gap from ${gap.fromAt} that its catch-up couldn't fill (${gap.detail ?? 'refused'}), so its context is incomplete and nothing was sent; nothing resumes on it until matt says so (rule 94)` }
    if (now() - started >= limit) return { ok: false, refused: `>>> BEHIND: ${platform} ${account} is still catching up from ${gap.fromAt} (${gap.reason}, ${gap.status}) after ${Math.round(limit / 1000)} s, so its context is incomplete and nothing was sent; send again once it has caught up` }
    await sleep(1000)
  }
}
