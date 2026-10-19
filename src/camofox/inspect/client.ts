/**
 * Starts `python/inspectSession.py` and talks to the open session through its
 * command and reply files. The session's own lines stream live through
 * processLog (rule 26).
 */
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { appendFileSync, existsSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeProcessLog } from '../../observability/processLog/index'
import type { CurrentInspect, InspectAction, InspectSessionConfig, InspectSessionRunner, InspectStepResult } from './types'

export const INSPECT_SESSION_PATH = fileURLToPath(new URL('../../../python/inspectSession.py', import.meta.url))

/** `~/.logCli/runs/inspect/current.json`, or `LOG_INSPECT_CURRENT`. */
export function currentInspectPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_INSPECT_CURRENT || join(homedir(), '.logCli', 'runs', 'inspect', 'current.json')
}

export function readCurrentInspect(path = currentInspectPath()): CurrentInspect | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as CurrentInspect
  } catch {
    return null
  }
}

export function writeCurrentInspect(current: CurrentInspect, path = currentInspectPath()): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(current, null, 2)}\n`)
}

export function clearCurrentInspect(path = currentInspectPath()): void {
  rmSync(path, { force: true })
}

/** The real session: Python, headed Camoufox, until `stop` or 30 idle minutes. */
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
  expect?: { name: string; ms?: number }
): Promise<InspectStepResult | null> {
  const id = randomUUID()
  appendFileSync(current.commandsPath, `${JSON.stringify({ id, action, args, ...(expect ? { expect: expect.name, expectMs: expect.ms ?? 30_000 } : {}) })}\n`)
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const reply = findReply(current.repliesPath, id)
    if (reply) return reply
    await new Promise((r) => setTimeout(r, pollMs))
  }
  return null
}
