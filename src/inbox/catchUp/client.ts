import type { PlatformAccount, PlatformEngineRun, PlatformEngineSpec } from '../../platformKit/session/index'
import { appendEvent, behindOf, eventIdOf, positionsOf, recordPosition } from '../store/index'
import type { GapRow } from '../store/index'
import { BEHIND_WAIT_MS, READ_GAP_MS } from './types'
import type { CatchUpResult, PlatformRead, ReadMessage } from './types'

export function pacedWait(random: () => number = Math.random): Promise<void> {
  const [low, high] = READ_GAP_MS
  return new Promise((done) => setTimeout(done, low + random() * (high - low)))
}

export function storeRead(platform: string, account: string, chat: string, box: string, m: ReadMessage, now: Date, source: 'live' | 'catchUp' = 'catchUp'): boolean {
  if (m.text == null || !m.at) return false
  const row = { platform, account, conversationId: chat, with: String(m.from ?? '?'), text: String(m.text), at: m.at, box, seenAt: now.toISOString() }
  return !!appendEvent({ platform, account, conversationId: chat, type: m.fromMe ? 'ownMessage' : 'message', with: row.with, text: row.text, box, payload: { ...row, id: m.id ?? m.ts ?? null }, sourceAt: m.at, receivedAt: m.fromMe ? m.at : now.toISOString(), eventId: eventIdOf(row), source })
}

function refusedOf(run: PlatformEngineRun): string | null {
  return run.answer.ok ? null : `${run.answer.code ?? 'refused'}: ${run.answer.detail ?? ''}`
}

async function readChats(platform: string, account: PlatformAccount, gap: GapRow, read: PlatformRead, chats: { chat: string; box: string; spec: PlatformEngineSpec; position: (m: ReadMessage) => string | null }[], now: Date, wait: () => Promise<void>): Promise<CatchUpResult> {
  let appended = 0
  for (const [i, c] of chats.entries()) {
    if (i) await wait()
    const run = read(account, c.spec)
    const refused = refusedOf(run)
    if (refused) return { appended, refused: `reading ${c.chat}: ${refused}` }
    const messages = ((run.answer.messages as ReadMessage[] | undefined) ?? []).filter((m) => !m.at || m.at > gap.fromAt)
    let last: string | null = null
    for (const m of messages) {
      if (storeRead(platform, account.accountName, c.chat, c.box, m, now)) appended++
      last = c.position(m) ?? last
    }
    if (last) recordPosition(platform, account.accountName, last, c.chat, now)
  }
  return { appended, detail: `${chats.length} chat(s) read after their saved position` }
}

export function discordCatchUp(account: PlatformAccount, gap: GapRow, read: PlatformRead, now: Date = new Date(), wait: () => Promise<void> = pacedWait): Promise<CatchUpResult> {
  const chats = Object.entries(positionsOf('discord', account.accountName)).filter(([chat]) => chat)
  return readChats('discord', account, gap, read, chats.map(([chat, after]) => ({ chat, box: 'dm', spec: { action: 'read', channel: chat, limit: 100, after }, position: (m) => m.id ?? null })), now, wait)
}

export function slackCatchUp(account: PlatformAccount, gap: GapRow, read: PlatformRead, now: Date = new Date(), wait: () => Promise<void> = pacedWait, workspace: Record<string, unknown> = {}): Promise<CatchUpResult> {
  const chats = Object.entries(positionsOf('slack', account.accountName)).filter(([chat]) => chat)
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

export async function waitCaughtUp(platform: string, account: string, options: { timeoutMs?: number; sleep?: (ms: number) => Promise<void>; now?: () => number } = {}): Promise<{ ok: true; waitedMs: number } | { ok: false; refused: string }> {
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)))
  const now = options.now ?? Date.now
  const started = now()
  const limit = options.timeoutMs ?? BEHIND_WAIT_MS
  for (;;) {
    const gap = behindOf(platform, account)
    if (!gap) return { ok: true, waitedMs: now() - started }
    if (gap.status === 'refused') return { ok: false, refused: `>>> BEHIND: ${platform} ${account} has a gap from ${gap.fromAt} that its catch-up couldn't fill (${gap.detail ?? 'refused'}), so its context is incomplete and nothing was sent; nothing resumes on it until matt says so (rule 94)` }
    if (now() - started >= limit) return { ok: false, refused: `>>> BEHIND: ${platform} ${account} is still catching up from ${gap.fromAt} (${gap.reason}, ${gap.status}) after ${Math.round(limit / 1000)} s, so its context is incomplete and nothing was sent; send again once it has caught up` }
    await sleep(1000)
  }
}
