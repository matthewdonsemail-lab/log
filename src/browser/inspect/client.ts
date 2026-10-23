import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { appendFileSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pipeProcessLog } from '../../observability/processLog/index'
import type { StepReading } from '../../subq/stepReading/types'
import { goalProgressOf, peeMarkdown } from './helpers/goal'
import type { CurrentInspect, GoalEvent, GoalProgress, InspectAction, InspectSessionConfig, InspectSessionRunner, InspectStepOptions, InspectStepResult } from './types'

export const INSPECT_SESSION_PATH = fileURLToPath(new URL('../../../python/session/inspectSession.py', import.meta.url))

export function currentInspectPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_INSPECT_CURRENT || join(homedir(), '.logCli', 'runs', 'inspect', 'current.json')
}

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

export function openInspects(path = currentInspectPath()): CurrentInspect[] {
  const dir = inspectSessionsDir(path)
  const found = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => readJson(join(dir, f))) : []
  const sessions = found.filter((s): s is CurrentInspect => s !== null)
  const legacy = readJson(path)
  if (legacy && !sessions.some((s) => s.account === legacy.account)) sessions.push(legacy)
  return sessions
}

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

export function clearCurrentInspect(path = currentInspectPath(), account?: string): void {
  if (account) {
    rmSync(sessionFile(account, path), { force: true })
    if (readJson(path)?.account !== account) return
  }
  rmSync(path, { force: true })
}

export const runInspectSession: InspectSessionRunner = (config: InspectSessionConfig) =>
  new Promise((resolve) => {
    const python = process.env.LOG_PYTHON || 'python'
    const proc = spawn(python, [INSPECT_SESSION_PATH, JSON.stringify(config)], { stdio: ['ignore', 'pipe', 'pipe'] })
    pipeProcessLog(proc.stderr, 'session')
    pipeProcessLog(proc.stdout, 'session')
    proc.on('error', () => resolve(127))
    proc.on('close', (code) => resolve(code ?? 1))
  })

function findReply(repliesPath: string, id: string): InspectStepResult | null {
  if (!existsSync(repliesPath)) return null
  for (const line of readFileSync(repliesPath, 'utf8').split(/\r?\n/)) {
    if (!line.includes(id)) continue
    try {
      const reply = JSON.parse(line) as { id: string; result: InspectStepResult }
      if (reply.id === id) return reply.result
    } catch {
    }
  }
  return null
}

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

export const GOAL_EVENTS_FILE = 'goalFindings.jsonl'
export const GOAL_FINDINGS_FILE = 'goalFindings.md'

export function runReadings(runDir: string): StepReading[] {
  const stepsDir = join(runDir, 'steps')
  if (!existsSync(stepsDir)) return []
  const out: StepReading[] = []
  for (const step of readdirSync(stepsDir).sort()) {
    const file = join(stepsDir, step, 'reading.json')
    if (!existsSync(file)) continue
    try {
      out.push(JSON.parse(readFileSync(file, 'utf8')) as StepReading)
    } catch {
    }
  }
  return out
}

export function goalEvents(runDir: string): GoalEvent[] {
  const file = join(runDir, GOAL_EVENTS_FILE)
  if (!existsSync(file)) return []
  const out: GoalEvent[] = []
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try {
      out.push(JSON.parse(line) as GoalEvent)
    } catch {
    }
  }
  return out
}

export function lastStepOf(runDir: string): string | null {
  const stepsDir = join(runDir, 'steps')
  if (!existsSync(stepsDir)) return null
  return readdirSync(stepsDir).sort().at(-1) ?? null
}

export function stepBefore(runDir: string, step: string | null): string | null {
  const stepsDir = join(runDir, 'steps')
  if (!step || !existsSync(stepsDir)) return null
  return readdirSync(stepsDir).filter((s) => s.localeCompare(step) < 0).sort().at(-1) ?? null
}

export function goalProgress(session: Pick<CurrentInspect, 'runDir' | 'goal' | 'goalSince'>): GoalProgress {
  return goalProgressOf(session.goal ?? null, runReadings(session.runDir), goalEvents(session.runDir), session.goalSince ?? null)
}

export function addGoalEvent(session: Pick<CurrentInspect, 'runDir' | 'goal' | 'goalSince' | 'account'>, event: GoalEvent): GoalProgress {
  appendFileSync(join(session.runDir, GOAL_EVENTS_FILE), `${JSON.stringify(event)}\n`)
  const progress = goalProgress(session)
  writeFileSync(join(session.runDir, GOAL_FINDINGS_FILE), peeMarkdown(progress, session.account))
  return progress
}
