import { clearDeadQueueLockRows } from '../../twitter/queue/store/index'
import { spawn, spawnSync } from 'node:child_process'
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { homedir, hostname } from 'node:os'
import { join } from 'node:path'
import { twitterStateRoot } from '../../directApi/engine/index'
import { personKeyOf } from '../../twitter/dm/person/index'
import { SHARED_SESSION } from '../../agentHooks/sessionOffsets/index'
import { mediaLine, mediaOf } from '../../media/describer/index'
import { addAlertRow, appendEvent, db, dropFence, holdFence, eventIdOf, eventsAfter, immediate, importPendingFile, retirePendingFile, lastEventAt, latestSeq, markStage, namedLabel, openGap, readCursor, UNNAMED, writeCursor } from '../store/index'
import type { StoredEvent } from '../store/index'
import { lastWordOf, waitingOf } from '../lastWord/index'
import { POLL_LOCK_SECONDS, POLL_MAX_SECONDS, POLL_MIN_SECONDS } from './types'
import type { InboxMessage, InboxReader, InboxThread, PollPlan, SeenThreads } from './types'

export function inboxRoot(): string {
  return process.env.LOG_INBOX_STATE || join(homedir(), '.logCli', 'inbox')
}

const pendingPath = () => join(inboxRoot(), 'pending.jsonl')
const deliveredPath = () => join(inboxRoot(), 'delivered')
const SHARED_READER = 'shared'
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

function messageOf(row: StoredEvent): InboxMessage {
  const media = (mediaOf([row.eventId]).get(row.eventId) ?? []).map(mediaLine)
  const payload = (() => {
    try {
      return JSON.parse(row.payload) as Record<string, unknown>
    } catch {
      return {}
    }
  })()
  return { platform: row.platform, account: row.account, conversationId: row.conversationId, with: namedLabel(row.platform, row.account, row.withWho, String(payload.senderId ?? payload.userId ?? payload.authorId ?? '')), text: [row.text, ...media].filter(Boolean).join(" "), at: row.sourceAt || row.receivedAt, box: row.box, seenAt: row.receivedAt, ...(typeof payload.workspace === 'string' && payload.workspace ? { workspace: payload.workspace } : {}) }
}

function migrated(): void {
  importPendingFile(pendingPath())
  retirePendingFile(pendingPath())
}

export function addPending(messages: readonly InboxMessage[]): void {
  if (!messages.length) return
  migrated()
  for (const m of messages) appendEvent({ platform: m.platform, account: m.account, conversationId: m.conversationId, type: 'message', with: m.with, text: m.text, box: m.box, payload: m, sourceAt: m.at, receivedAt: m.seenAt || m.at, eventId: eventIdOf(m) })
}

export function incomingSince(platform: string, account: string, inChat: string | ((conversationId: string) => boolean), since: string): InboxMessage[] {
  const matches = typeof inChat === 'string' ? (id: string) => id === inChat : inChat
  const rows = db().prepare(`SELECT * FROM events WHERE platform = ? AND account = ? AND type = 'message' AND receivedAt > ? ORDER BY seq`).all(platform, account, since) as StoredEvent[]
  return rows.filter((row) => matches(row.conversationId)).map(messageOf)
}

export function interruptedLines(account: string, heard: readonly InboxMessage[], held: readonly string[], sentCount: number, total: number): string[] {
  return [
    `>>> INTERRUPTED: ${account}: ${sentCount} of ${total} sent, then they wrote while it was going out, so the rest was held:`,
    ...heard.map((m) => `  ${m.with || 'they'} at ${m.at}: "${m.text}"`),
    ...held.map((p) => `  not sent: ${p}`),
    'Read them and answer what they said before sending anything else (rule 109).',
  ]
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

export function hookReaderOf(raw: string): string {
  try {
    const input = JSON.parse(raw || '{}') as { session_id?: string; agent_id?: string }
    const clean = (s: string) => s.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80)
    const session = input.session_id ? clean(input.session_id) : SHARED_SESSION
    return input.agent_id ? `${session}_${clean(input.agent_id)}` : session || SHARED_SESSION
  } catch {
    return SHARED_SESSION
  }
}

export function takePending(reader?: string): InboxMessage[] {
  migrated()
  const key = reader ?? SHARED_READER
  const cursor = readCursor(key)
  const latest = latestSeq()
  if (cursor === null && reader !== undefined) {
    writeCursor(key, latest)
    return []
  }
  const rows = eventsAfter(cursor ?? 0, { type: 'message' }).filter((row) => row.source !== 'backfill')
  if (latest !== cursor) writeCursor(key, latest)
  const now = new Date()
  for (const row of rows) markStage(row.eventId, 'shown', now)
  return rows.map(messageOf)
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
  } catch (error) {
    return (error as { code?: string }).code === 'EPERM'
  }
}

export function ownStartedAt(): string {
  return new Date(Date.now() - process.uptime() * 1000).toISOString()
}

export function processStartedAt(pid: number): string | null {
  try {
    const run = process.platform === 'win32'
      ? spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', `(Get-Process -Id ${pid} -ErrorAction Stop).StartTime.ToUniversalTime().ToString('o')`], { encoding: 'utf8', timeout: 10_000, windowsHide: true })
      : spawnSync('ps', ['-o', 'lstart=', '-p', String(pid)], { encoding: 'utf8', timeout: 5_000, windowsHide: true })
    const text = String(run.stdout ?? '').trim()
    const at = Date.parse(text)
    return run.status === 0 && Number.isFinite(at) ? new Date(at).toISOString() : null
  } catch {
    return null
  }
}

export function sameProcess(storedStartedAt: string | null | undefined, actualStartedAt: string | null, toleranceMs = 5_000): boolean {
  if (!storedStartedAt || !actualStartedAt) return true
  return Math.abs(Date.parse(storedStartedAt) - Date.parse(actualStartedAt)) <= toleranceMs
}

export const GOVERNOR_DAILY_CAP = 500

const localDay = (now: Date) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

export function coolingDown(stateRoot: string, account: string, now: Date = new Date(), dailyCap: number = Number(process.env.FBK_GOVERNOR_DAILY) || GOVERNOR_DAILY_CAP): boolean {
  const state = readJson<{ cooldown_until?: number; day?: string; day_count?: number }>(join(stateRoot, account, 'governor_state.json'), {})
  if (typeof state.cooldown_until === 'number' && state.cooldown_until * 1000 > now.getTime()) return true
  return state.day === localDay(now) && typeof state.day_count === 'number' && state.day_count >= dailyCap
}

const ALERTS_READER = (reader: string) => `alerts:${reader}`

export function watchHolder(platform: string, account: string, alive: (pid: number) => boolean = processAlive): number {
  const row = db().prepare("SELECT pid FROM owners WHERE platform = ? AND account = ? AND status != 'stopped'").get(platform, account) as { pid: number } | null
  return row && alive(row.pid) ? row.pid : 0
}

export function addAlert(alert: { platform: string; account: string; kind: string; detail: string }, now: Date = new Date()): void {
  addAlertRow(alert, now)
}

export function claimWatcher(platform: string, account: string, pid: number = process.pid, alive: (pid: number) => boolean = processAlive, now: Date = new Date()): { ok: true; generation: number } | { ok: false; holder: number } {
  const claimed = immediate((handle) => {
    const row = handle.prepare('SELECT pid, generation, heartbeat, status FROM owners WHERE platform = ? AND account = ?').get(platform, account) as { pid: number; generation: number; heartbeat: string; status: string } | null
    if (row && row.pid === pid) return { ok: true as const, generation: row.generation }
    if (row && row.status !== 'stopped' && alive(row.pid)) {
      addAlertRow({ platform, account, kind: 'duplicateWatcher', detail: `a second ${platform} watcher (pid ${pid}) tried to start for ${account} while pid ${row.pid} owns it; it was refused and exited, so there is still one process` }, now, handle)
      return { ok: false as const, holder: row.pid }
    }
    const stamp = now.toISOString()
    const fromAt = row?.heartbeat ?? lastEventAt(platform, account, handle)
    if (fromAt) openGap(platform, account, fromAt, row ? 'ownerRestarted' : 'noOwner', now, handle)
    const generation = (row?.generation ?? 0) + 1
    handle.prepare(`INSERT INTO owners (platform, account, pid, hostname, startedAt, heartbeat, status, generation, pidStartedAt, staleSeenAt) VALUES (?, ?, ?, ?, ?, ?, 'connecting', ?, ?, NULL) ON CONFLICT(platform, account) DO UPDATE SET pid = excluded.pid, hostname = excluded.hostname, startedAt = excluded.startedAt, heartbeat = excluded.heartbeat, status = 'connecting', port = 0, token = '', subscribers = 0, generation = excluded.generation, pidStartedAt = excluded.pidStartedAt, staleSeenAt = NULL`).run(platform, account, pid, hostname(), stamp, stamp, generation, pid === process.pid ? ownStartedAt() : null)
    return { ok: true as const, generation }
  })
  if (claimed.ok && pid === process.pid) holdFence(platform, account, claimed.generation)
  if (claimed.ok) {
    mkdirSync(join(inboxRoot(), platform, account), { recursive: true })
    writeFileSync(watchPidPath(platform, account), String(pid))
  }
  return claimed
}

export function releaseWatcher(platform: string, account: string, pid: number = process.pid): void {
  if (pid === process.pid) dropFence(platform, account)
  db().prepare("UPDATE owners SET status = 'stopped', port = 0, token = '', subscribers = 0, heartbeat = ? WHERE platform = ? AND account = ? AND pid = ?").run(new Date().toISOString(), platform, account, pid)
}

export function takeAlerts(reader: string): string[] {
  const key = ALERTS_READER(reader)
  const cursor = readCursor(key)
  const latest = (db().prepare('SELECT COALESCE(MAX(id), 0) AS id FROM alerts').get() as { id: number }).id
  const from = cursor === null ? Math.max(0, latest - 5) : cursor
  if (latest !== cursor) writeCursor(key, latest)
  const rows = db().prepare('SELECT * FROM alerts WHERE id > ? ORDER BY id').all(from) as { platform: string; account: string; kind: string; detail: string; at: string }[]
  return rows.map((a) => `!!! ${a.kind.toUpperCase()} ${a.platform} ${a.account} at ${a.at}: ${a.detail}`)
}

export function ensureLiveWatchers(platform: string, accounts: readonly string[], start: (account: string) => number | null, alive: (pid: number) => boolean = processAlive): string[] {
  if (process.env.LOG_INBOX_POLL === 'off') return []
  const started: string[] = []
  for (const account of accounts) {
    const path = watchPidPath(platform, account)
    const pid = Number(existsSync(path) ? readFileSync(path, 'utf8').trim() : '') || 0
    if (pid && alive(pid)) continue
    const holder = watchHolder(platform, account, alive)
    if (holder) {
      writeJson(path, holder)
      continue
    }
    if (watcherGone(platform, account)) continue
    const child = start(account)
    if (!child) continue
    writeJson(path, child)
    started.push(account)
  }
  return started
}

const OWNER_CODE: readonly string[] = [join('src', 'inbox'), join('src', 'platformKit'), join('src', 'directApi')]

export const WATCHER_CODE: Record<string, readonly string[]> = {
  twitter: [...OWNER_CODE, join('python', 'twitterApi'), join('python', 'platformKit'), join('vendor', 'twikit', 'twikit')],
  discord: [...OWNER_CODE, join('python', 'discordApi'), join('python', 'platformKit'), join('vendor', 'endcord', 'endcord')],
  slack: [...OWNER_CODE, join('python', 'slackApi'), join('python', 'platformKit'), join('vendor', 'gabrielSlack', 'gabriel')],
  instagram: [...OWNER_CODE, join('python', 'instagramApi'), join('python', 'platformKit'), join('vendor', 'instagrapi', 'instagrapi')],
}
const CODE_FILE = /\.(ts|py)$/
const stampPath = (platform: string) => join(inboxRoot(), platform, 'codeStamp.json')

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

export function codeStamp(repo: string, platform: string, now: Date = new Date(), everyMs = 60_000): number {
  const kept = readJson<{ stamp: number; checkedAt: number } | null>(stampPath(platform), null)
  if (kept && now.getTime() - kept.checkedAt < everyMs) return kept.stamp
  const stamp = Math.max(0, ...(WATCHER_CODE[platform] ?? []).map((d) => join(repo, d)).filter((d) => existsSync(d)).map(newestIn))
  mkdirSync(join(inboxRoot(), platform), { recursive: true })
  writeJson(stampPath(platform), { stamp, checkedAt: now.getTime() })
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
    const holder = watchHolder(platform, account, alive)
    if (holder && holder !== pid) kill(holder)
    rmSync(path, { force: true })
    stopped.push(account)
  }
  return stopped
}

export function clearDeadQueueLocks(_root: string = join(homedir(), '.logCli', 'queues'), alive: (pid: number) => boolean = processAlive): string[] {
  return clearDeadQueueLockRows(alive)
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

export function describerEnv(env: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const key = Object.keys(env).find((k) => k.toLowerCase() === 'path') ?? 'PATH'
  const separator = process.platform === 'win32' ? ';' : ':'
  const kept = String(env[key] ?? '').split(separator).filter((dir) => dir && !/msys64|mingw/i.test(dir))
  return { ...env, [key]: kept.join(separator) }
}

export function startDescriber(repo: string): number | null {
  const dir = join(inboxRoot(), 'model', 'describer')
  mkdirSync(dir, { recursive: true })
  const log = openSync(join(dir, 'watch.log'), 'a')
  try {
    const child = spawn('bun', [join(repo, 'scripts', 'media', 'describer.ts')], { cwd: repo, detached: true, stdio: ['ignore', log, log], windowsHide: true, env: describerEnv() })
    child.unref()
    return child.pid ?? null
  } finally {
    closeSync(log)
  }
}

export function startSlackWatch(account: string, repo: string): number | null {
  const dir = join(inboxRoot(), 'slack', account)
  mkdirSync(dir, { recursive: true })
  const log = openSync(join(dir, 'watch.log'), 'a')
  try {
    const child = spawn('bun', [join(repo, 'bin', 'log.ts'), 'slack', 'watch', '--account', account, '--inbox'], { cwd: repo, detached: true, stdio: ['ignore', log, log], windowsHide: true, env: process.env })
    child.unref()
    return child.pid ?? null
  } finally {
    closeSync(log)
  }
}

export function startInstagramWatch(account: string, repo: string): number | null {
  const dir = join(inboxRoot(), 'instagram', account)
  mkdirSync(dir, { recursive: true })
  const log = openSync(join(dir, 'watch.log'), 'a')
  try {
    const child = spawn('bun', [join(repo, 'bin', 'log.ts'), 'instagram', 'watch', '--account', account, '--inbox'], { cwd: repo, detached: true, stdio: ['ignore', log, log], windowsHide: true, env: process.env })
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
    '  2. Before writing a word, read the conversation card and how matt writes in that chat: `voice` { to: "<who>", with: "<channel>", context: "<what they said>" } (no text): the conversation card of the chat, what they said that is still open and what matt already asked and said there, then his real replies in this chat. Answer what is open in one or two short lines, in his words and his length, using only facts matt has said: never a list of questions, never what he already asked, nothing from another conversation.',
    '  3. Gate it against the same chat: `voice` { to, with, context, text: "<draft>" }. Rewrite until it passes.',
    `  4. ${SEND_RULE} (\`discordSendLive\` { account: "${account}", channel: "<channel>", text: "<draft>", approvedBy: "matt", confirmLive: true }).`,
    ...lines,
  ].join('\n')
}

function slackContext(messages: readonly InboxMessage[]): string {
  const lines = messages.map((m) => `  ${m.with} on slack ${m.account}${m.workspace ? ` in ${m.workspace}` : ''} (${m.box === 'dm' ? 'DM' : m.box === 'group' ? 'group DM' : 'mentioned you in a channel'}) at ${localTime(m.at)}: "${m.text.replace(/\s+/g, ' ').slice(0, 240)}" (chat ${m.conversationId})`)
  const { account } = messages[0]
  return [
    `>>> NEW SLACK MESSAGE${messages.length === 1 ? '' : 'S'} (${messages.length}): pushed by the workspace's websocket the moment it landed. Tell matt now, with what they said and what the conversation is about. Then, for each one:`,
    `  1. Read the chat around it: \`slackRead\` { account: "${account}", workspace: "<workspace>", chat: "<chat>", limit: "20" }.`,
    '  2. Before writing a word, read the conversation card and how matt writes to them: `voice` { to: "<who>", with: "<chat>", context: "<what they said>" } (no text): the conversation card of the chat, what they said that is still open and what matt already asked and said there, then his real replies in this chat. Answer what is open in one or two short lines, in his words and his length, using only facts matt has said: never a list of questions, never what he already asked, nothing from another conversation.',
    '  3. Gate it against the same chat: `voice` { to, with, context, text: "<draft>" }. Rewrite until it passes.',
    `  4. ${SEND_RULE} (\`slackSendLive\` { account: "${account}", workspace: "<workspace>", chat: "<chat>", text: "<draft>", approvedBy: "matt", confirmLive: true }).`,
    ...lines,
  ].join('\n')
}

function instagramContext(messages: readonly InboxMessage[]): string {
  const lines = messages.map((m) => `  @${m.with} on instagram ${m.account} at ${localTime(m.at)}: "${m.text.replace(/\s+/g, ' ').slice(0, 240)}" (thread ${m.conversationId})`)
  const { account } = messages[0]
  return [
    `>>> NEW INSTAGRAM MESSAGE${messages.length === 1 ? '' : 'S'} (${messages.length}): pushed by Instagram's realtime connection the moment it landed. Tell matt now, with what they said and what the conversation is about. Then, for each one (never through the browser):`,
    `  1. Read the thread around it: \`instagramDms\` { account: "${account}", with: "<handle or thread>", limit: "20" }.`,
    '  2. Before writing a word, read the conversation card and how matt writes to them: `voice` { to: "<handle>", with: "<who>", context: "<what they said>" } (no text): the conversation card of the chat, what they said that is still open and what matt already asked and said there, then his real replies in this chat. Answer what is open in one or two short lines, in his words and his length, using only facts matt has said: never a list of questions, never what he already asked, nothing from another conversation.',
    '  3. Gate it: `voice` { to, with, context, text: "<draft>" }. Rewrite until it passes.',
    `  4. ${SEND_RULE} (\`instagramSendLive\` { account: "${account}", with: "<handle or thread>", text: "<draft>", approvedBy: "matt", confirmLive: true }; a meme or picture goes as photo: "<file>").`,
    ...lines,
  ].join('\n')
}

export function inboxContext(messages: readonly InboxMessage[]): string | null {
  if (!messages.length) return null
  const discord = messages.filter((m) => m.platform === 'discord')
  const slack = messages.filter((m) => m.platform === 'slack')
  const instagram = messages.filter((m) => m.platform === 'instagram')
  const rest = messages.filter((m) => m.platform !== 'discord' && m.platform !== 'slack' && m.platform !== 'instagram')
  const parts = [...(rest.length ? [twitterContext(rest)] : []), ...(discord.length ? [discordContext(discord)] : []), ...(slack.length ? [slackContext(slack)] : []), ...(instagram.length ? [instagramContext(instagram)] : [])]
  return parts.join('\n\n')
}

function twitterContext(messages: readonly InboxMessage[]): string {
  const lines = messages.map((m) => `  @${m.with} on ${m.platform} ${m.account}${m.box === 'xchat' ? ' (X Chat)' : ''} at ${localTime(m.at)}: "${(m.text || '(no text)').replace(/\s+/g, ' ').slice(0, 240)}" (conversation ${m.conversationId})`)
  const { platform, account } = messages[0]
  return [
    `>>> NEW MESSAGE${messages.length === 1 ? '' : 'S'} (${messages.length}): someone wrote to an account, pushed by X the moment it landed. Tell matt now, with what they said and what the conversation is about. Then, for each person:`,
    `  1. Read their full context right now, the old DM thread and X Chat merged (one conversation, whichever id a message names) and what they did on the account's posts (likes, retweets, replies, quotes), all in one call (rule 109): \`twitterDms\` { account: "${account}", with: "<handle>" }.`,
    '  2. Before writing a word, read the conversation card and how matt writes to them: `voice` { to: "<handle>", with: "<handle>", context: "<what they said>" } (no text): the conversation card of the chat, what they said that is still open and what matt already asked and said there, then his real replies in this chat. Answer what is open in one or two short lines, in his words and his length, using only facts matt has said: never a list of questions, never what he already asked, nothing from another conversation.',
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
  const words = lastWordOf({ platform: 'twitter', account })
  if (words.length) {
    const { waiting } = waitingOf(words)
    return { syncedAt: state?.syncedAt ?? waiting[0]?.lastAt ?? null, waiting: waiting.slice(0, limit).map((w) => ({ conversationId: w.conversationIds[0] ?? w.personKey, with: w.kind === 'dm' && w.with !== UNNAMED ? `@${w.with}` : w.with, at: w.lastAt, text: w.lastText })), total: waiting.length }
  }
  if (!state?.xchat || !state.userId) return { syncedAt: null, waiting: [], total: 0 }
  const rows: (StoredWaiting & { ms: number })[] = []
  for (const [conversationId, c] of Object.entries(state.xchat)) {
    if (!c.lastMs || !c.lastSender || c.lastSender === state.userId) continue
    const said = (c.messages ?? []).filter((m) => m.text != null)
    const last = said[said.length - 1]
    rows.push({ conversationId, with: (c.participants ?? []).map((id) => c.handles?.[id] ? `@${c.handles[id]}` : namedLabel('twitter', account, id, id)).join(', ') || namedLabel('twitter', account, null), at: new Date(c.lastMs).toISOString(), text: last && last.time_ms === c.lastMs ? String(last.text) : '(not loaded yet: twitterDms with their handle opens it)', ms: c.lastMs })
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
    return answer.threads.map((t) => ({ conversationId: t.conversationId, with: t.with.map((p) => namedLabel('twitter', account, p.handle ?? p.userId, p.userId)).join(', ') || 'someone not named yet', lastAt: t.lastAt ?? null, lastFromMe: t.lastFromMe, lastText: t.lastText ?? null, box: t.box ?? 'inbox' }))
  } catch {
    return null
  }
}

export function inboxReaders(repo: string): InboxReader[] {
  return [{ platform: 'twitter', accounts: () => twitterAccounts(), read: (account) => twitterThreads(account, repo) }]
}
