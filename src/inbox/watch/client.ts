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

export function inboxContext(messages: readonly InboxMessage[]): string | null {
  if (!messages.length) return null
  const lines = messages.map((m) => `  @${m.with} on ${m.platform} ${m.account}${m.box === 'xchat' ? ' (X Chat)' : ''} at ${m.at.slice(0, 16).replace('T', ' ')} UTC: "${(m.text || '(encrypted)').replace(/\s+/g, ' ').slice(0, 240)}" (conversation ${m.conversationId})`)
  const { platform, account } = messages[0]
  return [
    `>>> NEW MESSAGE${messages.length === 1 ? '' : 'S'} (${messages.length}): someone wrote to an account, pushed by X the moment it landed. Tell matt now, with what they said. Then, for each person:`,
    `  1. Read everything with them, the old DM thread and X Chat merged (one conversation, whichever id a message names): \`log ${platform} dms --account ${account} --with <handle>\`.`,
    '  2. Draft the reply from matt\'s own writing guide, C:/Users/0/.buzz/GUIDES/MATT_WRITING_STYLE.md, using only facts matt has said, answering what they actually asked.',
    `  3. Gate it: \`log voice --to <handle> --text "<draft>" --context "<what they said>"\` (SubQ against matt's guide and his own messages). Rewrite until it passes.`,
    `  4. Show matt the draft and send only when he says (\`log ${platform} dm --account ${account} --userId <id> --text "<draft>" --approvedBy matt --live\`).`,
    ...lines,
  ].join('\n')
}

export function twitterAccounts(root: string = twitterStateRoot()): string[] {
  if (!existsSync(root)) return []
  return readdirSync(root).filter((name) => readJson<{ sessionState?: string }>(join(root, name, 'session.json'), {}).sessionState === 'loggedIn')
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
