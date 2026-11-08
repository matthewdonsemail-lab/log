import { closeSync, mkdirSync, openSync } from 'node:fs'
import { claimState, deleteState, getState, putState } from '../../storage/state/index'
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { openDatabase } from '../../storage/schema/client'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { CONTEXT_PORT, CURL_CONNECT_SECONDS, CURL_MAX_SECONDS, HOST, SERVICE_START_GRACE_MS, SERVICE_TIMEOUT_MS } from './types'
import type { ServiceInfo, TimingLine } from './types'
import type { PlayMatch } from '../../useCases/router/index'

export function contextLayerRoot(): string {
  return process.env.LOG_CONTEXT_LAYER || join(homedir(), '.logCli', 'contextLayer')
}

export const servicePath = (root = contextLayerRoot()) => join(root, 'service.json')
export const timingsPath = (root = contextLayerRoot()) => join(root, 'timings.jsonl')
export const labelledPath = (root = contextLayerRoot()) => process.env.LOG_ROUTER_LABELS || join(root, 'labelledPrompts.json')

export function processAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export function readService(root = contextLayerRoot()): ServiceInfo | null {
  const info = getState<ServiceInfo>('contextService', root, { legacyFile: servicePath(root) })?.body
  return info && processAlive(info.pid) ? info : null
}

export function writeService(info: ServiceInfo, root = contextLayerRoot()): void {
  putState('contextService', root, info)
}

export function logTiming(line: Omit<TimingLine, 'at'>, _root = contextLayerRoot()): void {
  try {
    const id = randomBytes(8).toString('hex')
    const startedAt = Date.now() - line.ms
    openDatabase().prepare("INSERT OR IGNORE INTO spans (spanId, traceId, callId, parentId, tool, name, source, pid, startedAt, ms, ok, attrs) VALUES (?, ?, ?, NULL, ?, 'call', 'hook', ?, ?, ?, ?, ?)").run(id, id, id.slice(0, 12), `hook:${line.event}:${line.provider}`, process.pid, startedAt, line.ms, line.outcome.endsWith('!') ? 0 : 1, JSON.stringify({ event: line.event, provider: line.provider, chars: line.chars, outcome: line.outcome }))
  } catch {}
}

export function startService(repo: string, root = contextLayerRoot()): number | null {
  mkdirSync(root, { recursive: true })
  try {
    if (!claimState('contextServiceStarting', root, { pid: process.pid }, SERVICE_START_GRACE_MS)) return null
  } catch {
    return null
  }
  const log = openSync(join(root, 'service.log'), 'a')
  try {
    const child = spawn('bun', [join(repo, 'scripts', 'contextLayer', 'service.ts')], { cwd: repo, detached: true, stdio: ['ignore', log, log], windowsHide: true, env: process.env })
    child.unref()
    return child.pid ?? null
  } finally {
    closeSync(log)
  }
}

export function serviceStarted(root = contextLayerRoot()): void {
  try {
    deleteState('contextServiceStarting', root)
  } catch {}
}

export interface RouteAnswer {
  matches: PlayMatch[]
  skipped?: string
  corrected: string[]
  ms: { total: number }
}

export async function askRoute(prompt: string, info: ServiceInfo | null = readService(), timeoutMs = SERVICE_TIMEOUT_MS): Promise<RouteAnswer | null> {
  if (!info) return null
  try {
    const response = await fetch(`http://${HOST}:${info.port}/route`, { method: 'POST', body: JSON.stringify({ prompt }), signal: AbortSignal.timeout(timeoutMs) })
    return response.ok ? ((await response.json()) as RouteAnswer) : null
  } catch {
    return null
  }
}

export function serviceHookCommand(path: string, fallback: string): string {
  return `curl -sf --connect-timeout ${CURL_CONNECT_SECONDS} --max-time ${CURL_MAX_SECONDS} -X POST --data-binary @- http://${HOST}:${CONTEXT_PORT}${path} || ${fallback}`
}
