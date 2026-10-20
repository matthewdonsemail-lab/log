/**
 * Starts `python/inspectSession.py` and talks to the open session through its
 * command and reply files. The session's own lines stream live through
 * processLog (rule 26).
 */
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { appendFileSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeProcessLog } from '../../observability/processLog/index'
import type { CurrentInspect, InspectAction, InspectSessionConfig, InspectSessionRunner, InspectStepOptions, InspectStepResult } from './types'

export const INSPECT_SESSION_PATH = fileURLToPath(new URL('../../../python/inspectSession.py', import.meta.url))

/** `~/.logCli/runs/inspect/current.json`, or `LOG_INSPECT_CURRENT`. */
export function currentInspectPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_INSPECT_CURRENT || join(homedir(), '.logCli', 'runs', 'inspect', 'current.json')
}

/**
 * One session file per account, next to current.json (`sessions/<account>.json`),
 * so two accounts' browsers can be open at once (a seller and a buyer) and
 * `log inspect do --account <a>` drives one of them. current.json stays the
 * most recently started session, for anything that reads it directly.
 */
export function inspectSessionsDir(path = currentInspectPath()): string {
  return join(dirname(path), 'sessions')
}

function sessionFile(account: string, path = currentInspectPath()): string {
  return join(inspectSessionsDir(path), `${account.replace(/[^A-Za-z0-9_.-]/g, '_')}.json`)
}

function readJson(file: string): CurrentInspect | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as CurrentInspect
  } catch {
    return null
  }
}

/** Every open session, by account. */
export function openInspects(path = currentInspectPath()): CurrentInspect[] {
  const dir = inspectSessionsDir(path)
  const found = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => readJson(join(dir, f))) : []
  const sessions = found.filter((s): s is CurrentInspect => s !== null)
  // A session started before per-account files existed.
  const legacy = readJson(path)
  if (legacy && !sessions.some((s) => s.account === legacy.account)) sessions.push(legacy)
  return sessions
}

/** The session for `account`; without one, the only open session; null when none (or several and no account). */
export function readCurrentInspect(path = currentInspectPath(), account?: string): CurrentInspect | null {
  const open = openInspects(path)
  if (account) return open.find((s) => s.account === account) ?? null
  return open.length === 1 ? open[0] : null
}

export function writeCurrentInspect(current: CurrentInspect, path = currentInspectPath()): void {
  mkdirSync(inspectSessionsDir(path), { recursive: true })
  const text = `${JSON.stringify(current, null, 2)}\n`
  writeFileSync(sessionFile(current.account, path), text)
  writeFileSync(path, text)
}

/** Ends `account`'s session file; current.json only when it is that session (or with no account given, as before). */
export function clearCurrentInspect(path = currentInspectPath(), account?: string): void {
  if (account) {
    rmSync(sessionFile(account, path), { force: true })
    if (readJson(path)?.account !== account) return
  }
  rmSync(path, { force: true })
}

/** The real session: Python with the account's browser headed (AdsPower or Camoufox, `python/browserDriver.py`), until `stop` or 30 idle minutes. */
export const runInspectSession: InspectSessionRunner = (config: InspectSessionConfig) =>
  new Promise((resolve) => {
    const python = process.env.LOG_PYTHON || 'python'
    const proc = spawn(python, [INSPECT_SESSION_PATH, JSON.stringify(config)], { stdio: ['ignore', 'pipe', 'pipe'] })
    pipeProcessLog(proc.stderr, 'session')
    pipeProcessLog(proc.stdout, 'session')
    proc.on('error', () => resolve(127))
    proc.on('close', (code) => resolve(code ?? 1))
  })

/** The reply with `id`, once the session has written it. */
function findReply(repliesPath: string, id: string): InspectStepResult | null {
  if (!existsSync(repliesPath)) return null
  for (const line of readFileSync(repliesPath, 'utf8').split(/\r?\n/)) {
    if (!line.includes(id)) continue
    try {
      const reply = JSON.parse(line) as { id: string; result: InspectStepResult }
      if (reply.id === id) return reply.result
    } catch {
      // a reply still being written
    }
  }
  return null
}

/** Sends one action to the open session and waits for its reply (a step takes seconds: settle, snapshot, rea). */
export async function sendInspectCommand(
  current: CurrentInspect,
  action: InspectAction,
  args: string[],
  timeoutMs = 120_000,
  pollMs = 300,
  expect?: { name: string; ms?: number },
  options: InspectStepOptions = {}
): Promise<InspectStepResult | null> {
  const id = randomUUID()
  appendFileSync(current.commandsPath, `${JSON.stringify({ id, action, args, ...(expect ? { expect: expect.name, expectMs: expect.ms ?? 30_000 } : {}), ...options })}\n`)
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const reply = findReply(current.repliesPath, id)
    if (reply) return reply
    await new Promise((r) => setTimeout(r, pollMs))
  }
  return null
}
