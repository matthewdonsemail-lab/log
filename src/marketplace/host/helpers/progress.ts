import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { LifecycleContext } from '../../lifecycle/types'
import type { HostControl, HostProgress, MilestoneField } from '../types'

export function hostDir(account: string, env: Record<string, string | undefined> = process.env): string {
  return join(env.LOG_HOST_DIR || join(homedir(), '.logCli', 'runs', 'host'), account)
}

export const progressPath = (account: string) => join(hostDir(account), 'progress.json')
export const controlPath = (account: string) => join(hostDir(account), 'control.jsonl')

export function readProgress(account: string): HostProgress | null {
  try {
    return JSON.parse(readFileSync(progressPath(account), 'utf8')) as HostProgress
  } catch {
    return null
  }
}

export function writeProgress(progress: HostProgress): void {
  const path = progressPath(progress.account)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(`${path}.tmp`, `${JSON.stringify(progress, null, 2)}\n`)
  renameSync(`${path}.tmp`, path)
}

export function resumeFrom(progress: HostProgress | null, today: string): { warmupDone: HostProgress['resume']['warmupDone']; warmupStartedAt: number | null; opensToday: number } | undefined {
  if (!progress) return undefined
  return {
    warmupDone: progress.resume.warmupDone,
    warmupStartedAt: progress.resume.warmupStartedAt,
    opensToday: progress.day === today ? progress.resume.opensToday : 0
  }
}

export function milestones(before: LifecycleContext | null, after: LifecycleContext, state: string, at: Date): Partial<Record<MilestoneField, string>> {
  const out: Partial<Record<MilestoneField, string>> = {}
  const iso = at.toISOString()
  const was = before?.standing
  const now = after.standing
  if (now.profileSet && !was?.profileSet) out.profileSetAt = iso
  if (now.named && !was?.named) out.profileNamedAt = iso
  if (now.locationSet && !was?.locationSet) out.marketplaceLocationAt = iso
  if (after.warmup.startedAt && !before?.warmup.startedAt) out.warmupStartedAt = new Date(after.warmup.startedAt).toISOString()
  if (now.warmedAt && !was?.warmedAt) out.warmedAt = now.warmedAt
  return { ...out, lifecycleState: state }
}

export function resetHostOpens(account: string): boolean {
  const progress = readProgress(account)
  if (!progress) return false
  writeProgress({ ...progress, resume: { ...progress.resume, opensToday: 0 } })
  return true
}

export function readControl(account: string, offset: number): { events: HostControl[]; offset: number } {
  const path = controlPath(account)
  if (!existsSync(path)) return { events: [], offset: 0 }
  const text = readFileSync(path, 'utf8')
  if (text.length <= offset) return { events: [], offset: text.length }
  const events: HostControl[] = []
  for (const line of text.slice(offset).split(/\r?\n/)) {
    if (!line.trim()) continue
    try {
      events.push(JSON.parse(line) as HostControl)
    } catch {
    }
  }
  return { events, offset: text.length }
}

export function sendControl(account: string, event: HostControl): void {
  const path = controlPath(account)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, `${JSON.stringify(event)}\n`, { flag: 'a' })
}
