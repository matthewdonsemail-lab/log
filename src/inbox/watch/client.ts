import { spawn, spawnSync } from 'node:child_process'
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { twitterStateRoot } from '../../directApi/engine/index'
import { personKeyOf } from '../../twitter/dm/person/index'
import { POLL_LOCK_SECONDS, POLL_MAX_SECONDS, POLL_MIN_SECONDS } from './types'
import type { InboxMessage, InboxReader, InboxThread, PollPlan, SeenThreads } from './types'

export function inboxRoot(): string {
  return process.env.LOG_INBOX_STATE || join(homedir(), '.logCli', 'inbox')
}

const pendingPath = () => join(inboxRoot(), 'pending.jsonl')
const deliveredPath = () => join(inboxRoot(), 'delivered')
const planPath = () => join(inboxRoot(), 'next.json')
const lockPath = () => join(inboxRoot(), 'poll.lock')
const seenPath = (platform: string, account: string) => join(inboxRoot(), platform, account, 'seen.json')
const watchPidPath = (platform: string, account: string) => join(inboxRoot(), platform, account, 'watch.pid')

function readJson<T>(path: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    return fallback
  }
}

function writeJson(path: string, value: unknown): void {
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2))
}

export function newMessages(platform: string, account: string, threads: InboxThread[], seen: SeenThreads, now: Date): { messages: InboxMessage[]; seen: SeenThreads } {
  const next: SeenThreads = { ...seen }
  const messages: InboxMessage[] = []
  for (const t of threads) {
    if (!t.lastAt) continue
    const key = personKeyOf(t.conversationId)
    const before = [next[key], seen[t.conversationId]].filter(Boolean).sort().pop()
    next[key] = before && before > t.lastAt ? before : t.lastAt
    if (t.lastFromMe || (before && t.lastAt <= before)) continue
    messages.push({ platform, account, conversationId: t.conversationId, with: t.with, text: t.lastText ?? '', at: t.lastAt, box: t.box, seenAt: now.toISOString() })
  }
  return { messages, seen: next }
}

export function addPending(messages: readonly InboxMessage[]): void {
  if (!messages.length) return
  mkdirSync(inboxRoot(), { recursive: true })
  appendFileSync(pendingPath(), messages.map((m) => JSON.stringify(m)).join('\n') + '\n')
}

export function pollReaders(readers: readonly InboxReader[], now: Date = new Date()): InboxMessage[] {
  const found: InboxMessage[] = []
  for (const reader of readers) {
    for (const account of reader.accounts()) {
      const threads = reader.read(account)
      if (!threads) continue
      const path = seenPath(reader.platform, account)
      const first = !existsSync(path)
      const { messages, seen } = newMessages(reader.platform, account, threads, readJson<SeenThreads>(path, {}), now)
      writeJson(path, seen)
      if (first) continue
      const fresh = messages.filter((m) => !found.some((f) => f.account === m.account && f.with === m.with && f.text === m.text))
      found.push(...fresh.filter((m, i) => fresh.findIndex((o) => o.with === m.with && o.text === m.text) === i))
    }
  }
  addPending(found)
  return found
}

export function takePending(): InboxMessage[] {
  if (!existsSync(pendingPath())) return []
  const lines = readFileSync(pendingPath(), 'utf8').split('\n').filter(Boolean)
  const delivered = Number(existsSync(deliveredPath()) ? readFileSync(deliveredPath(), 'utf8') : '0') || 0
  if (lines.length <= delivered) return []
  writeFileSync(deliveredPath(), String(lines.length))
  return lines.slice(delivered).flatMap((l) => {
    try {
      return [JSON.parse(l) as InboxMessage]
    } catch {
      return []
    }
  })
}

export function claimPoll(now: Date = new Date(), random: () => number = Math.random): boolean {
  if (process.env.LOG_INBOX_POLL === 'off') return false
  const plan = readJson<PollPlan | null>(planPath(), null)
  if (plan && Date.parse(plan.nextAt) > now.getTime()) return false
  if (existsSync(lockPath()) && now.getTime() - statSync(lockPath()).mtimeMs < POLL_LOCK_SECONDS * 1000) return false
  const wait = POLL_MIN_SECONDS + random() * (POLL_MAX_SECONDS - POLL_MIN_SECONDS)
  writeJson(planPath(), { nextAt: new Date(now.getTime() + wait * 1000).toISOString() })
  writeFileSync(lockPath(), now.toISOString())
  return true
}

export function releasePoll(): void {
  rmSync(lockPath(), { force: true })
}

export function watcherGone(platform: string, account: string): boolean {
  const path = join(inboxRoot(), platform, account, 'watch.log')
  if (!existsSync(path)) return false
  const lines = readFileSync(path, 'utf8').trim().split('\n').filter((l) => l.includes(': '))
  return lines.length > 0 && /: accountNotFound: /.test(lines[lines.length - 1])
}

export function processAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export function ensureLiveWatchers(platform: string, accounts: readonly string[], start: (account: string) => number | null, alive: (pid: number) => boolean = processAlive): string[] {
  if (process.env.LOG_INBOX_POLL === 'off') return []
  const started: string[] = []
  for (const account of accounts) {
    const path = watchPidPath(platform, account)
    const pid = Number(existsSync(path) ? readFileSync(path, 'utf8').trim() : '') || 0
    if (pid && alive(pid)) continue
    if (watcherGone(platform, account)) continue
    const child = start(account)
    if (!child) continue
    writeJson(path, child)
    started.push(account)
  }
  return started
}

export function startTwitterWatch(account: string, repo: string): number | null {
  const dir = join(inboxRoot(), 'twitter', account)
  mkdirSync(dir, { recursive: true })
  const log = openSync(join(dir, 'watch.log'), 'a')
  try {
    const child = spawn('bun', [join(repo, 'bin', 'log.ts'), 'twitter', 'chat', 'watch', '--account', account, '--inbox'], { cwd: repo, detached: true, stdio: ['ignore', log, log], windowsHide: true, env: process.env })
    child.unref()
    return child.pid ?? null
  } finally {
    closeSync(log)
  }
}

export function startDiscordWatch(account: string, repo: string): number | null {
  const dir = join(inboxRoot(), 'discord', account)
  mkdirSync(dir, { recursive: true })
  const log = openSync(join(dir, 'watch.log'), 'a')
  try {
    const child = spawn('bun', [join(repo, 'bin', 'log.ts'), 'discord', 'watch', '--account', account, '--inbox'], { cwd: repo, detached: true, stdio: ['ignore', log, log], windowsHide: true, env: process.env })
    child.unref()
    return child.pid ?? null
  } finally {
    closeSync(log)
  }
}

function discordContext(messages: readonly InboxMessage[]): string {
  const lines = messages.map((m) => `  ${m.with} on discord ${m.account} (${m.box === 'dm' ? 'DM or group' : m.box === 'mention' ? 'mentioned you in a server channel' : 'replied to you in a server channel'}) at ${m.at.slice(0, 16).replace('T', ' ')} UTC: "${m.text.replace(/\s+/g, ' ').slice(0, 240)}" (channel ${m.conversationId})`)
  const { account } = messages[0]
  return [
    `>>> NEW DISCORD MESSAGE${messages.length === 1 ? '' : 'S'} (${messages.length}): pushed by Discord's gateway the moment it landed. Tell matt now, with what they said. Then, for each one:`,
    `  1. Read the chat around it: \`log discord read --account ${account} --channel <channel> --limit 20\`.`,
    '  2. Before writing a word, pull how matt really writes in that chat: `log voice --to <who> --with <channel> --context "<what they said>"` (no --text): his latest messages there and his real replies to things like it. Draft from those, in his words and his length, using only facts matt has said, answering what they actually asked. Never from the twitter guide alone.',
    '  3. Gate it against the same chat: `log voice --to <who> --with <channel> --context "<what they said>" --text "<draft>"`. Rewrite until it passes.',
    `  4. Show matt the draft and send only when he says (\`log discord send --account ${account} --channel <channel> --text "<draft>" --approvedBy matt --live\`).`,
    ...lines,
  ].join('\n')
}

export function inboxContext(messages: readonly InboxMessage[]): string | null {
  if (!messages.length) return null
  const discord = messages.filter((m) => m.platform === 'discord')
  const rest = messages.filter((m) => m.platform !== 'discord')
  const parts = [...(rest.length ? [twitterContext(rest)] : []), ...(discord.length ? [discordContext(discord)] : [])]
  return parts.join('\n\n')
}

function twitterContext(messages: readonly InboxMessage[]): string {
  const lines = messages.map((m) => `  @${m.with} on ${m.platform} ${m.account}${m.box === 'xchat' ? ' (X Chat)' : ''} at ${m.at.slice(0, 16).replace('T', ' ')} UTC: "${(m.text || '(encrypted)').replace(/\s+/g, ' ').slice(0, 240)}" (conversation ${m.conversationId})`)
  const { platform, account } = messages[0]
  return [
    `>>> NEW MESSAGE${messages.length === 1 ? '' : 'S'} (${messages.length}): someone wrote to an account, pushed by X the moment it landed. Tell matt now, with what they said. Then, for each person:`,
    `  1. Read everything with them, the old DM thread and X Chat merged (one conversation, whichever id a message names): \`log ${platform} dms --account ${account} --with <handle>\`.`,
    '  2. Before writing a word, pull how matt really writes to them: `log voice --to <handle> --with <handle> --context "<what they said>"` (no --text): his messages to them first, then his whole history (every platform). Draft from those, in his words and his length, using only facts matt has said, answering what they actually asked. Never from the twitter guide alone.',
    `  3. Gate it against the same person: \`log voice --to <handle> --with <handle> --context "<what they said>" --text "<draft>"\`. Rewrite until it passes.`,
    `  4. Show matt the draft and send only when he says (\`log ${platform} dm --account ${account} --userId <id> --text "<draft>" --approvedBy matt --live\`).`,
    ...lines,
  ].join('\n')
}

export function twitterAccounts(root: string = twitterStateRoot()): string[] {
  if (!existsSync(root)) return []
  return readdirSync(root).filter((name) => readJson<{ sessionState?: string }>(join(root, name, 'session.json'), {}).sessionState === 'loggedIn')
}

interface StoredConversation {
  participants?: string[]
  handles?: Record<string, string>
  lastMs?: number | null
  lastSender?: string | null
  messages?: { time_ms?: number | null; text?: string | null }[]
}

export interface StoredWaiting {
  conversationId: string
  with: string
  at: string
  text: string
}

export function storedWaiting(account: string, root: string = twitterStateRoot(), limit = 12): { syncedAt: string | null; waiting: StoredWaiting[]; total: number } {
  const state = readJson<{ syncedAt?: string | null; userId?: string; xchat?: Record<string, StoredConversation> } | null>(join(root, account, 'inboxSync.json'), null)
  if (!state?.xchat || !state.userId) return { syncedAt: null, waiting: [], total: 0 }
  const rows: (StoredWaiting & { ms: number })[] = []
  for (const [conversationId, c] of Object.entries(state.xchat)) {
    if (!c.lastMs || !c.lastSender || c.lastSender === state.userId) continue
    const said = (c.messages ?? []).filter((m) => m.text != null)
    const last = said[said.length - 1]
    rows.push({ conversationId, with: (c.participants ?? []).map((id) => c.handles?.[id] ? `@${c.handles[id]}` : id).join(', ') || '?', at: new Date(c.lastMs).toISOString(), text: last && last.time_ms === c.lastMs ? String(last.text) : '(could not decrypt)', ms: c.lastMs })
  }
  rows.sort((a, b) => b.ms - a.ms)
  return { syncedAt: state.syncedAt ?? null, waiting: rows.slice(0, limit).map(({ ms: _ms, ...r }) => r), total: rows.length }
}

export function storedInboxContext(accounts: readonly string[], root: string = twitterStateRoot()): string | null {
  const parts: string[] = []
  for (const account of accounts) {
    const { syncedAt, waiting, total } = storedWaiting(account, root)
    if (!syncedAt || !total) continue
    parts.push([
      `X inbox for ${account}, from the local store (synced ${syncedAt.slice(0, 16).replace('T', ' ')} UTC, live pushes added since; nothing was fetched for this): ${total} conversation${total === 1 ? '' : 's'} where they wrote last${total > waiting.length ? `, the newest ${waiting.length}` : ''}:`,
      ...waiting.map((w) => `  ${w.with} at ${w.at.slice(0, 16).replace('T', ' ')} UTC: "${w.text.replace(/\s+/g, ' ').slice(0, 160)}" (conversation ${w.conversationId})`),
      `  \`log twitter dms --account ${account}\` fetches only what is new since then (about 5 s); \`--with <handle>\` reads one person in full.`,
    ].join('\n'))
  }
  return parts.length ? parts.join('\n\n') : null
}

export function twitterThreads(account: string, repo: string): InboxThread[] | null {
  const run = spawnSync('bun', [join(repo, 'bin', 'log.ts'), 'twitter', 'dms', '--account', account, '--limit', '60', '--json'], { cwd: repo, encoding: 'utf8', timeout: 120_000, env: process.env, windowsHide: true })
  try {
    const answer = JSON.parse(run.stdout) as { ok?: boolean; threads?: { conversationId: string; with: { handle?: string | null; userId: string }[]; lastAt?: string | null; lastFromMe: boolean; lastText?: string | null; box?: string }[] }
    if (!answer.ok || !answer.threads) return null
    return answer.threads.map((t) => ({ conversationId: t.conversationId, with: t.with.map((p) => p.handle ?? p.userId).join(', ') || '?', lastAt: t.lastAt ?? null, lastFromMe: t.lastFromMe, lastText: t.lastText ?? null, box: t.box ?? 'inbox' }))
  } catch {
    return null
  }
}

export function inboxReaders(repo: string): InboxReader[] {
  return [{ platform: 'twitter', accounts: () => twitterAccounts(), read: (account) => twitterThreads(account, repo) }]
}
