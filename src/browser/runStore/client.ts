import { appendFileSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statfsSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { knownRequests } from '../../subq/stepReading/client.ts'
import { exchangesOf } from '../../subq/stepReading/helpers/exchangesOf.ts'
import { DOCUMENT_FIELDS, EXCHANGES_FILE } from '../../subq/stepReading/types.ts'
import { openInspects } from '../inspect/index.ts'
import { domainsInHar } from './helpers/domainsInHar.ts'
import type { Backfill, PrunedRun, RunEntry, StepHar } from './types.ts'

export function logCliRoot(): string {
  return process.env.LOG_CAPTURES_ROOT || join(homedir(), '.logCli')
}

const RUN_FOLDER = /^(\d{4})(\d{2})(\d{2})T\d{6}_(.+)$/
const CAPTURE_FOLDERS = ['adsPower', 'camoufox', 'firefox']
const KEPT_FILES = ['findings.md', 'steps.jsonl', 'settle.json']
const KEPT_RUN_FILES = ['goalFindings.md', 'goalFindings.jsonl']
const KEPT_STEP_FILES = [EXCHANGES_FILE, 'reading.json', 'readingState.json']
const CUT_EXCHANGES = /\.exchanges\.json$/
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

const dirsIn = (path: string): string[] => (existsSync(path) ? readdirSync(path).filter((name) => statSync(join(path, name)).isDirectory()) : [])

export function stepHarsOf(runPath: string): StepHar[] {
  const out: StepHar[] = []
  const steps = join(runPath, 'steps')
  for (const step of dirsIn(steps)) if (existsSync(join(steps, step, 'network.har'))) out.push({ har: join(steps, step, 'network.har'), exchanges: join(steps, step, EXCHANGES_FILE) })
  for (const folder of CAPTURE_FOLDERS) {
    const cut = join(runPath, folder, 'steps')
    if (!existsSync(cut)) continue
    for (const name of readdirSync(cut)) if (name.endsWith('.har')) out.push({ har: join(cut, name), exchanges: join(cut, name.replace(/\.har$/, '.exchanges.json')) })
  }
  return out
}

export function backfillExchanges(runPath: string, options: { platform?: string; apply?: boolean } = {}): Backfill {
  const platform = options.platform ?? 'facebook'
  const result: Backfill = { steps: 0, had: 0, written: 0, failed: [] }
  let known: Set<string> | null = null
  for (const step of stepHarsOf(runPath)) {
    result.steps++
    if (existsSync(step.exchanges)) {
      result.had++
      continue
    }
    if (!options.apply) continue
    try {
      known ??= knownRequests(platform)
      const exchanges = exchangesOf(JSON.parse(readFileSync(step.har, 'utf8')), known, DOCUMENT_FIELDS[platform] ?? [])
      writeFileSync(step.exchanges, `${JSON.stringify(exchanges, null, 2)}\n`, { mode: 0o600 })
      result.written++
    } catch (error) {
      result.failed.push(`${step.har}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  return result
}

export function backfillAll(entries: RunEntry[], options: { apply: boolean; log?: (line: string) => void }): Backfill {
  const total: Backfill = { steps: 0, had: 0, written: 0, failed: [] }
  for (const [i, entry] of entries.entries()) {
    const done = backfillExchanges(entry.path, { apply: options.apply })
    total.steps += done.steps
    total.had += done.had
    total.written += done.written
    total.failed.push(...done.failed)
    options.log?.(`exchanges ${i + 1}/${entries.length} ${entry.action}/${entry.run}: ${done.steps} step(s), ${done.had} had them, ${options.apply ? `${done.written} written` : `${done.steps - done.had} to write`}${done.failed.length ? `, ${done.failed.length} failed` : ''}`)
  }
  return total
}

function keepReadings(runPath: string, kept: string): void {
  for (const file of KEPT_RUN_FILES) if (existsSync(join(runPath, file))) copyFileSync(join(runPath, file), join(kept, file))
  const steps = join(runPath, 'steps')
  for (const step of dirsIn(steps)) {
    const files = KEPT_STEP_FILES.filter((file) => existsSync(join(steps, step, file)))
    if (!files.length) continue
    mkdirSync(join(kept, 'steps', step), { recursive: true })
    for (const file of files) copyFileSync(join(steps, step, file), join(kept, 'steps', step, file))
  }
  for (const folder of CAPTURE_FOLDERS) {
    const cut = join(runPath, folder, 'steps')
    const files = existsSync(cut) ? readdirSync(cut).filter((name) => CUT_EXCHANGES.test(name)) : []
    if (!files.length) continue
    mkdirSync(join(kept, folder, 'steps'), { recursive: true })
    for (const file of files) copyFileSync(join(cut, file), join(kept, folder, 'steps', file))
  }
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
      const filled = backfillExchanges(entry.path, { apply: true })
      if (filled.failed.length) {
        options.log?.(`runs ${i + 1}/${due.length} ${entry.action}/${entry.run}: kept, ${filled.failed.length} step(s) could not have their exchanges taken out (${filled.failed[0]})`)
        continue
      }
      mkdirSync(kept, { recursive: true })
      keepReadings(entry.path, kept)
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
