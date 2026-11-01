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

export function coolingDown(stateRoot: string, account: string, now: Date = new Date()): boolean {
  const state = readJson<{ cooldown_until?: number }>(join(stateRoot, account, 'governor_state.json'), {})
  return typeof state.cooldown_until === 'number' && state.cooldown_until * 1000 > now.getTime()
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

const CODE_DIRS = ['python', join('vendor', 'twikit', 'twikit')]
const CODE_FILE = /\.(ts|py)$/
const stampPath = () => join(inboxRoot(), 'codeStamp.json')

function newestIn(dir: string): number {
  let newest = 0
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__pycache__' || entry.name.startsWith('.')) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) newest = Math.max(newest, newestIn(path))
    else if (CODE_FILE.test(entry.name)) newest = Math.max(newest, statSync(path).mtimeMs)
  }
  return newest
}

export function codeStamp(repo: string, now: Date = new Date(), everyMs = 60_000): number {
  const kept = readJson<{ stamp: number; checkedAt: number } | null>(stampPath(), null)
  if (kept && now.getTime() - kept.checkedAt < everyMs) return kept.stamp
  const stamp = Math.max(0, ...CODE_DIRS.map((d) => join(repo, d)).filter((d) => existsSync(d)).map(newestIn))
  writeJson(stampPath(), { stamp, checkedAt: now.getTime() })
  return stamp
}

export function killTree(pid: number): void {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
    return
  }
  try {
    process.kill(-pid, 'SIGTERM')
  } catch {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {}
  }
}

export function stopStaleWatchers(platform: string, accounts: readonly string[], stamp: number, alive: (pid: number) => boolean = processAlive, kill: (pid: number) => void = killTree): string[] {
  const stopped: string[] = []
  for (const account of accounts) {
    const path = watchPidPath(platform, account)
    if (!existsSync(path)) continue
    const pid = Number(readFileSync(path, 'utf8').trim()) || 0
    if (!pid || !alive(pid) || statSync(path).mtimeMs >= stamp) continue
    kill(pid)
    rmSync(path, { force: true })
    stopped.push(account)
  }
  return stopped
}

export function clearDeadQueueLocks(root: string = join(homedir(), '.logCli', 'queues'), alive: (pid: number) => boolean = processAlive): string[] {
  if (!existsSync(root)) return []
  const cleared: string[] = []
  for (const name of readdirSync(root).filter((n) => n.endsWith('.lock'))) {
    const path = join(root, name)
    const pid = Number(readFileSync(path, 'utf8').trim()) || 0
    if (alive(pid)) continue
    rmSync(path, { force: true })
    cleared.push(name)
  }
  return cleared
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

export function localTime(iso: string): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  const offset = -at.getTimezoneOffset()
  const zone = `UTC${offset >= 0 ? '+' : '-'}${Math.floor(Math.abs(offset) / 60)}${offset % 60 ? `:${pad(Math.abs(offset) % 60)}` : ''}`
  return `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())} ${pad(at.getHours())}:${pad(at.getMinutes())} matt's time (${zone})`
}

const SEND_RULE = 'Send it straight away when it answers what they said and fits that conversation: matt has given full authority to reply and follow up (rule 108). Then tell matt what they said and what went out. Hold it and ask him only when it would book a meeting, make a promise, name a price or money, or you cannot tell what the conversation is about.'

function discordContext(messages: readonly InboxMessage[]): string {
  const lines = messages.map((m) => `  ${m.with} on discord ${m.account} (${m.box === 'dm' ? 'DM or group' : m.box === 'mention' ? 'mentioned you in a server channel' : 'replied to you in a server channel'}) at ${localTime(m.at)}: "${m.text.replace(/\s+/g, ' ').slice(0, 240)}" (channel ${m.conversationId})`)
  const { account } = messages[0]
  return [
    `>>> NEW DISCORD MESSAGE${messages.length === 1 ? '' : 'S'} (${messages.length}): pushed by Discord's gateway the moment it landed. Tell matt now, with what they said and what the conversation is about. Then, for each one:`,
    `  1. Read the chat around it: \`discordRead\` { account: "${account}", channel: "<channel>", limit: "20" }.`,
    '  2. Before writing a word, pull how matt really writes in that chat: `voice` { to: "<who>", with: "<channel>", context: "<what they said>" } (no text): his latest messages there and his real replies to things like it. Draft from those, in his words and his length, using only facts matt has said, answering what they actually asked. Never from the twitter guide alone.',
    '  3. Gate it against the same chat: `voice` { to, with, context, text: "<draft>" }. Rewrite until it passes.',
    `  4. ${SEND_RULE} (\`discordSendLive\` { account: "${account}", channel: "<channel>", text: "<draft>", approvedBy: "matt", confirmLive: true }).`,
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
  const lines = messages.map((m) => `  @${m.with} on ${m.platform} ${m.account}${m.box === 'xchat' ? ' (X Chat)' : ''} at ${localTime(m.at)}: "${(m.text || '(encrypted)').replace(/\s+/g, ' ').slice(0, 240)}" (conversation ${m.conversationId})`)
  const { platform, account } = messages[0]
  return [
    `>>> NEW MESSAGE${messages.length === 1 ? '' : 'S'} (${messages.length}): someone wrote to an account, pushed by X the moment it landed. Tell matt now, with what they said and what the conversation is about. Then, for each person:`,
    `  1. Read their full context right now, the old DM thread and X Chat merged (one conversation, whichever id a message names) and what they did on the account's posts (likes, retweets, replies, quotes), all in one call (rule 109): \`twitterDms\` { account: "${account}", with: "<handle>" }.`,
    '  2. Before writing a word, pull how matt really writes to them: `voice` { to: "<handle>", with: "<handle>", context: "<what they said>" } (no text): his messages to them first, then his whole history (every platform). Draft from those, in his words and his length, using only facts matt has said, answering what they actually asked. Never from the twitter guide alone.',
    `  3. Gate it against the same person: \`voice\` { to, with, context, text: "<draft>" }. Rewrite until it passes.`,
    `  4. ${SEND_RULE} One reply goes straight out with \`twitterDmLive\` { account: "${account}", userId: "<id>", text: "<draft>", approvedBy: "matt", confirmLive: true }; more than one goes into the account's one running queue (\`twitterQueueAdd\`, rule 107). Every step is the log MCP tool, never a hand-run command (rule 106).`,
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
    rows.push({ conversationId, with: (c.participants ?? []).map((id) => c.handles?.[id] ? `@${c.handles[id]}` : id).join(', ') || '?', at: new Date(c.lastMs).toISOString(), text: last && last.time_ms === c.lastMs ? String(last.text) : '(not loaded yet: twitterDms with their handle opens it)', ms: c.lastMs })
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
      `X inbox for ${account}, from the local store (synced ${localTime(syncedAt)}, live pushes added since; nothing was fetched for this): ${total} conversation${total === 1 ? '' : 's'} where they wrote last${total > waiting.length ? `, the newest ${waiting.length}` : ''}:`,
      ...waiting.map((w) => `  ${w.with} at ${localTime(w.at)}: "${w.text.replace(/\s+/g, ' ').slice(0, 160)}" (conversation ${w.conversationId})`),
      `  \`twitterDms\` { account: "${account}" } fetches only what is new since then (about 5 s); with: "<handle>" reads one person in full.`,
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
