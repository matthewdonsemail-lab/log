import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { getState, putState } from '../../../storage/state/index'
import { LOCAL_MODELS, pipSpecs } from '../../../models/manifest/index'
import { fetchModels, liveModelsDeps } from '../../../models/store/index'
import { refreshHarnesses } from '../../harnesses/index'
import type { PostInstallDeps, StepResult } from '../types'

export const PYTHON_VENDORS = ['-r', 'vendor/twikit/requirements.txt', './vendor/fbk', './vendor/endcord', './vendor/openLinkedinApi', './vendor/instagrapi', 'brotli', 'pycurl', 'cryptography>=42', 'gliner2[local]==2.2.0', ...pipSpecs()]

const STEP_MS = 10 * 60 * 1000

export function runStep(command: string, args: string[], cwd?: string, timeout = STEP_MS): StepResult {
  const done = spawnSync(command, args, { cwd, encoding: 'utf8', windowsHide: true, timeout, env: process.env })
  if (done.error) return { ok: false, detail: `${command} ${args[0] ?? ''}: ${done.error.message}` }
  if (done.status !== 0) return { ok: false, detail: `${command} ${args.join(' ')} exited ${done.status}: ${(done.stderr || done.stdout || '').trim().split('\n').slice(-3).join(' | ')}` }
  return { ok: true, detail: done.stdout }
}

export function platformWheels(root: string, platform: string = process.platform): string[] {
  const dir = join(root, 'vendor', 'chatXdk', 'wheels')
  if (platform !== 'win32' || !existsSync(dir)) return []
  return readdirSync(dir).filter((f) => f.endsWith('win_amd64.whl')).slice(0, 1).map((f) => join(dir, f))
}

export function vendorArgs(python: string, root: string, platform: string = process.platform): string[] {
  return ['pip', 'install', '--python', python, ...PYTHON_VENDORS, ...platformWheels(root, platform)]
}

const SKIPPED_DIRS = new Set(['__pycache__', 'build', 'dist', 'node_modules', '.git'])

function filesUnder(dir: string): string[] {
  if (!existsSync(dir)) return []
  if (statSync(dir).isFile()) return [dir]
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) return SKIPPED_DIRS.has(entry.name) || entry.name.endsWith('.egg-info') ? [] : filesUnder(join(dir, entry.name))
    return entry.isFile() ? [join(dir, entry.name)] : []
  })
}

export function vendorHash(root: string, args: readonly string[]): string {
  const hash = createHash('sha256').update(JSON.stringify(args))
  const local = args.filter((arg) => arg.startsWith('./') || arg.startsWith('vendor/') || arg.endsWith('.whl')).map((arg) => (arg.endsWith('.whl') ? arg : join(root, arg)))
  for (const file of local.flatMap(filesUnder).sort()) hash.update(relative(root, file)).update('\0').update(readFileSync(file))
  return hash.digest('hex')
}

export const HELD_FILE = /os error 5|Access is denied/i

export function heldFileOf(detail: string): string | null {
  return /([A-Za-z]:[\\/][^\s'"`|]+?\.(?:pyd|dll|exe))/i.exec(detail)?.[1] ?? null
}

export function pythonHolders(python: string): string[] {
  if (process.platform !== 'win32') return []
  const script = `Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -and ($_.ExecutablePath -ieq '${python.replace(/'/g, "''")}') -and $_.ProcessId -ne ${process.pid} } | ForEach-Object { '{0} {1}' -f $_.ProcessId, $_.CommandLine }`
  const done = spawnSync('powershell', ['-NoProfile', '-Command', script], { encoding: 'utf8', windowsHide: true, timeout: 30_000 })
  return (done.stdout ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.slice(0, 200))
}

export interface VendorDeps {
  python: string | undefined
  run(args: string[]): StepResult
  hash(args: string[]): string
  saved(): string | null
  save(hash: string): void
  holders(python: string): string[]
}

const VENDOR_KEY = 'vendors'

export function liveVendorDeps(root: string): VendorDeps {
  return {
    python: process.env.LOG_PYTHON?.trim() || undefined,
    run: (args) => runStep('uv', args, root),
    hash: (args) => vendorHash(root, args),
    saved: () => {
      try {
        return getState<{ hash: string }>('postInstallVendors', VENDOR_KEY)?.body.hash ?? null
      } catch {
        return null
      }
    },
    save: (hash) => {
      try {
        putState('postInstallVendors', VENDOR_KEY, { hash })
      } catch {
        return
      }
    },
    holders: pythonHolders,
  }
}

export function installVendors(root: string, deps: VendorDeps): StepResult {
  if (!deps.python) return { ok: true, detail: 'no LOG_PYTHON set, so the engines were left alone' }
  if (!existsSync(join(root, 'vendor'))) return { ok: true, detail: 'no vendor folder in this install' }
  const args = vendorArgs(deps.python, root)
  const hash = deps.hash(args)
  if (deps.saved() === hash) return { ok: true, detail: 'vendor/ and the requirements are unchanged since the last install: skipped' }
  const done = deps.run(args)
  if (done.ok) {
    deps.save(hash)
    return done
  }
  if (!HELD_FILE.test(done.detail ?? '')) return done
  const file = heldFileOf(done.detail ?? '')
  const holders = deps.holders(deps.python)
  return {
    ok: true,
    detail: `not reinstalled: Windows refused to replace ${file ?? 'a package file'} (os error 5) because a running Python holds it${holders.length ? `: ${holders.join('; ')}` : ''}. The engines keep the packages already installed; run log update again once those processes stop`,
  }
}

function vendors(root: string): StepResult {
  return installVendors(root, liveVendorDeps(root))
}

function migrations(root: string): StepResult {
  return runStep(process.execPath, ['-e', "const { openDatabase } = await import('./src/storage/schema/index.ts'); openDatabase().close()"], root, 120_000)
}

function relateGraph(root: string): StepResult {
  const done = runStep(process.execPath, [join(root, 'bin', 'log.ts'), 'relate', 'build', '--json'], root, 300_000)
  return done.ok ? { ok: true, detail: 'built' } : done
}

function skills(root: string): StepResult {
  const script = join(root, 'scripts', 'docs', 'syncSiteSkills.mjs')
  if (!existsSync(script)) return { ok: true, detail: 'no skills build in this install' }
  const done = runStep('node', [script], root, 120_000)
  return done.ok || /ENOENT/.test(done.detail ?? '') ? { ok: true, detail: done.ok ? 'done' : 'node is not on PATH, skills left as shipped' } : done
}

export function livePostInstallDeps(log: (line: string) => void = () => {}): PostInstallDeps {
  return {
    vendors,
    migrations,
    relateGraph,
    skills,
    models: () => fetchModels(LOCAL_MODELS, liveModelsDeps(log)),
    harnesses: (root) => refreshHarnesses(root),
    log,
  }
}
