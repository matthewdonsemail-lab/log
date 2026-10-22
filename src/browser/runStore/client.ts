import { appendFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statfsSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openInspects } from '../inspect/index.ts'
import { domainsInHar } from './helpers/domainsInHar.ts'
import type { PrunedRun, RunEntry } from './types.ts'

export function logCliRoot(): string {
  return process.env.LOG_CAPTURES_ROOT || join(homedir(), '.logCli')
}

const RUN_FOLDER = /^(\d{4})(\d{2})(\d{2})T\d{6}_(.+)$/
const CAPTURE_FOLDERS = ['adsPower', 'camoufox', 'firefox']
const KEPT_FILES = ['findings.md', 'steps.jsonl', 'settle.json']
const BUSY_MS = 10 * 60_000

function sizeOf(path: string): number {
  let stat
  try {
    stat = statSync(path)
  } catch {
    return 0
  }
  if (!stat.isDirectory()) return stat.size
  return readdirSync(path).reduce((n, name) => n + sizeOf(join(path, name)), 0)
}

function newestChange(path: string): number {
  let stat
  try {
    stat = statSync(path)
  } catch {
    return 0
  }
  if (!stat.isDirectory()) return stat.mtimeMs
  return readdirSync(path).reduce((n, name) => Math.max(n, newestChange(join(path, name))), 0)
}

export function docsBuiltAt(repoRoot = fileURLToPath(new URL('../../../', import.meta.url))): number {
  const index = join(repoRoot, 'docs', 'platforms', 'facebook', 'operations.json')
  try {
    return Date.parse((JSON.parse(readFileSync(index, 'utf8')) as { builtAt?: string }).builtAt ?? '') || 0
  } catch {
    return 0
  }
}

export function listRuns(options: { root?: string; builtAt?: number; now?: number; open?: string[] } = {}): RunEntry[] {
  const runs = join(options.root ?? logCliRoot(), 'runs')
  const builtAt = options.builtAt ?? docsBuiltAt()
  const now = options.now ?? Date.now()
  const open = new Set((options.open ?? openInspects().map((s) => s.runDir)).map((p) => p.toLowerCase()))
  const entries: RunEntry[] = []
  if (!existsSync(runs)) return entries
  for (const action of readdirSync(runs)) {
    const actionDir = join(runs, action)
    if (action === 'kept' || action === 'unsaved' || !statSync(actionDir).isDirectory()) continue
    for (const run of readdirSync(actionDir)) {
      const match = RUN_FOLDER.exec(run)
      const path = join(actionDir, run)
      if (!match || !statSync(path).isDirectory()) continue
      const captureDir = [path, ...CAPTURE_FOLDERS.map((f) => join(path, f))].find((d) => existsSync(join(d, 'session.har'))) ?? null
      const settled = captureDir ? existsSync(join(captureDir, 'settle.json')) : null
      const documented = captureDir ? statSync(join(captureDir, 'session.har')).mtimeMs <= builtAt : null
      const busy = open.has(path.toLowerCase()) || now - newestChange(path) < BUSY_MS
      const keep = busy ? 'still being written' : settled === false ? 'not settled by rea yet: log facebook capture --settle <its capture folder>' : documented === false ? 'not in the request docs yet: log facebook capture --docs' : null
      entries.push({ path, action, run, account: match[4], day: `${match[1]}-${match[2]}-${match[3]}`, bytes: sizeOf(path), captureDir, settled, documented, open: busy, keep })
    }
  }
  return entries.sort((a, b) => a.run.localeCompare(b.run))
}

export async function pruneRuns(entries: RunEntry[], options: { apply: boolean; before?: string; root?: string; log?: (line: string) => void }): Promise<PrunedRun[]> {
  const runs = join(options.root ?? logCliRoot(), 'runs')
  const done: PrunedRun[] = []
  const due = entries.filter((e) => !e.keep && (!options.before || e.day < options.before))
  for (const [i, entry] of due.entries()) {
    const kept = join(runs, 'kept', entry.action, entry.run)
    const domains = entry.captureDir ? await domainsInHar(join(entry.captureDir, 'session.har')) : {}
    const pruned: PrunedRun = { at: new Date().toISOString(), run: entry.run, action: entry.action, account: entry.account, day: entry.day, bytes: entry.bytes, settled: entry.settled, documented: entry.documented, domains, kept }
    options.log?.(`runs ${i + 1}/${due.length} ${entry.action}/${entry.run}: ${(entry.bytes / 1e6).toFixed(0)} MB${Object.keys(domains).length ? `, ${Object.entries(domains).map(([d, n]) => `${d} ${n}`).join(', ')}` : ''}${options.apply ? ', pruned' : ' (dry run)'}`)
    if (options.apply) {
      mkdirSync(kept, { recursive: true })
      for (const dir of [entry.path, entry.captureDir].filter((d): d is string => Boolean(d))) {
        for (const file of KEPT_FILES) if (existsSync(join(dir, file))) copyFileSync(join(dir, file), join(kept, file))
      }
      writeFileSync(join(kept, 'pruned.json'), `${JSON.stringify(pruned, null, 2)}\n`)
      appendFileSync(join(runs, 'pruned.jsonl'), `${JSON.stringify(pruned)}\n`)
      rmSync(entry.path, { recursive: true, force: true })
      rmSync(join(runs, '.size.json'), { force: true })
    }
    done.push(pruned)
  }
  return done
}

export function diskFree(path = logCliRoot()): number | null {
  try {
    const stats = statfsSync(path)
    return stats.bavail * stats.bsize
  } catch {
    return null
  }
}

export function runsBytes(root = logCliRoot(), now = Date.now()): number {
  const runs = join(root, 'runs')
  const cache = join(runs, '.size.json')
  try {
    const saved = JSON.parse(readFileSync(cache, 'utf8')) as { at: number; bytes: number }
    if (now - saved.at < 15 * 60_000) return saved.bytes
  } catch {}
  const bytes = sizeOf(runs)
  try {
    if (existsSync(runs)) writeFileSync(cache, JSON.stringify({ at: now, bytes }))
  } catch {}
  return bytes
}
