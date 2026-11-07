import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { CONTEXT_PORT, CURL_CONNECT_SECONDS, CURL_MAX_SECONDS, HOST, SERVICE_START_GRACE_MS, SERVICE_TIMEOUT_MS } from './types'
import type { ServiceInfo, TimingLine } from './types'
import type { PlayMatch } from '../../useCases/router/index'

export function contextLayerRoot(): string {
  return process.env.LOG_CONTEXT_LAYER || join(homedir(), '.logCli', 'contextLayer')
}

export const servicePath = (root = contextLayerRoot()) => join(root, 'service.json')
const startingPath = (root = contextLayerRoot()) => join(root, 'starting.lock')
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
  try {
    const info = JSON.parse(readFileSync(servicePath(root), 'utf8')) as ServiceInfo
    return processAlive(info.pid) ? info : null
  } catch {
    return null
  }
}

export function writeService(info: ServiceInfo, root = contextLayerRoot()): void {
  mkdirSync(root, { recursive: true })
  writeFileSync(servicePath(root), JSON.stringify(info))
}

export function logTiming(line: Omit<TimingLine, 'at'>, root = contextLayerRoot()): void {
  try {
    mkdirSync(root, { recursive: true })
    appendFileSync(timingsPath(root), `${JSON.stringify({ at: new Date().toISOString(), ...line })}\n`)
  } catch {}
}

export function startService(repo: string, root = contextLayerRoot()): number | null {
  mkdirSync(root, { recursive: true })
  const lock = startingPath(root)
  if (existsSync(lock) && Date.now() - statSync(lock).mtimeMs < SERVICE_START_GRACE_MS) return null
  try {
    if (existsSync(lock)) unlinkSync(lock)
    writeFileSync(lock, String(process.pid), { flag: 'wx' })
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
    unlinkSync(startingPath(root))
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
