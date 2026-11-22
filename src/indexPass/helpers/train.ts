import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { modelByKey } from '../../models/manifest/index'
import { placeOf } from '../../models/store/index'
import { logHome } from '../../config/logHome/index'
import { PASS_TRAIN_EPOCHS, PASS_TRAIN_HELD_OUT, PASS_TRAIN_EXAMPLES } from '../types'
import type { Example } from './corrections'

export const FACTS_ROOT = join(import.meta.dir, '..', '..', '..', 'python', 'facts')

export const TRAIN_SCRIPT = join(FACTS_ROOT, 'train.py')

export const REVISIONS_FILE = join(FACTS_ROOT, 'revisions.json')

export const REVISIONS_DIR = join(FACTS_ROOT, 'revisions')

export interface FactRevision {
  revision: string
  base: string
  dir: string
  examples: number
  heldOut: number
  accuracyBefore: number
  accuracyAfter: number
  bytes: number
  trainedAt: string
  epochs: number
}

export interface TrainReport extends FactRevision {
  ms: number
  kept: number
  problem?: string
}

export function revisionsOf(file = REVISIONS_FILE): FactRevision[] {
  if (!existsSync(file)) return []
  try {
    const held = JSON.parse(readFileSync(file, 'utf8')) as { revisions?: FactRevision[] }
    return held.revisions ?? []
  } catch {
    return []
  }
}

export function latestRevision(env: Record<string, string | undefined> = process.env, file = REVISIONS_FILE): string | null {
  if (env.LOG_FACTS_REVISION?.trim()) return env.LOG_FACTS_REVISION.trim()
  const found = [...revisionsOf(file)].reverse().find((r) => existsSync(join(REVISIONS_DIR, r.revision)))
  return found ? join(REVISIONS_DIR, found.revision) : null
}

export function recordRevision(revision: FactRevision, file = REVISIONS_FILE, dir = REVISIONS_DIR): void {
  mkdirSync(dir, { recursive: true })
  const held = revisionsOf(file).filter((r) => r.revision !== revision.revision)
  writeFileSync(file, JSON.stringify({ revisions: [...held, revision] }, null, 2))
}

function sizeOf(dir: string): number {
  let bytes = 0
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const info = statSync(path)
    bytes += info.isDirectory() ? sizeOf(path) : info.size
  }
  return bytes
}

export function datasetOf(examples: readonly Example[], heldOut = PASS_TRAIN_HELD_OUT): { train: Example[]; held: Example[] } {
  const train: Example[] = []
  const held: Example[] = []
  examples.forEach((example, n) => (n % heldOut === 0 ? held : train).push(example))
  return { train, held }
}

function writeJsonl(path: string, rows: readonly Example[]): void {
  writeFileSync(path, `${rows.map((row) => JSON.stringify({ text: row.text, label: row.label })).join('\n')}\n`)
}

function run(cmd: string, args: readonly string[], env: Record<string, string | undefined>): Promise<{ code: number; out: string; err: string }> {
  return new Promise((done) => {
    const child = spawn(cmd, [...args], { windowsHide: true, env: { ...process.env, ...env } })
    let out = ''
    let err = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => (out += chunk))
    child.stderr.on('data', (chunk: string) => (err += chunk))
    child.on('error', (error) => done({ code: 1, out, err: `${err}\n${error.message}` }))
    child.on('exit', (code) => done({ code: code ?? 1, out, err }))
  })
}

export async function trainFacts(examples: readonly Example[], options: { epochs?: number; python?: string; log?: (line: string) => void; env?: Record<string, string | undefined> } = {}): Promise<TrainReport | { problem: string }> {
  const env = options.env ?? process.env
  const log = options.log ?? (() => undefined)
  const base = modelByKey('facts')
  const modelDir = placeOf(base, env)
  if (!modelDir || !existsSync(modelDir)) return { problem: `the fact model is not on disk (${base.id}@${base.revision.slice(0, 7)}); run log models --fetch` }
  if (!existsSync(TRAIN_SCRIPT)) return { problem: `no training script at ${TRAIN_SCRIPT}` }
  const kept = examples.slice(0, PASS_TRAIN_EXAMPLES)
  const { train, held } = datasetOf(kept)
  if (train.length < 8 || !held.length) return { problem: `not enough corrections to train on yet: ${train.length} to learn from and ${held.length} held out; the pass keeps one for every mark the decider settles` }
  const work = join(logHome(), 'facts')
  mkdirSync(work, { recursive: true })
  const trainPath = join(work, 'train.jsonl')
  const heldPath = join(work, 'heldout.jsonl')
  writeJsonl(trainPath, train)
  writeJsonl(heldPath, held)
  const out = join(work, 'round')
  const started = performance.now()
  log(`facts train: ${train.length} correction(s) to learn from, ${held.length} held out, on CPU with ${base.id}`)
  const answer = await run(options.python ?? env.LOG_PYTHON ?? 'python', [TRAIN_SCRIPT, modelDir, trainPath, heldPath, out, '--epochs', String(options.epochs ?? PASS_TRAIN_EPOCHS)], env)
  const last = answer.out.trim().split('\n').filter((l) => l.startsWith('{')).pop()
  if (!last) return { problem: `the training run said nothing usable (exit ${answer.code}): ${answer.err.trim().split('\n').slice(-2).join(' ') || 'no output'}` }
  const trained = JSON.parse(last) as { ok: boolean; error?: string; examples?: number; heldOut?: number; accuracyBefore?: number; accuracyAfter?: number; adapter?: string; ms?: number }
  if (!trained.ok) return { problem: trained.error ?? 'training failed' }
  const adapter = trained.adapter ?? ''
  if (!adapter || !existsSync(adapter)) return { problem: 'training finished but left no adapter weights behind' }
  const sha = createHash('sha256').update(readFileSync(adapter)).digest('hex').slice(0, 12)
  const dir = join(REVISIONS_DIR, sha)
  mkdirSync(dir, { recursive: true })
  const name = adapter.split(/[\\/]/).pop() ?? 'adapter.safetensors'
  writeFileSync(join(dir, name), readFileSync(adapter))
  writeFileSync(join(dir, 'train.json'), JSON.stringify({ base: `${base.id}@${base.revision}`, examples: trained.examples, heldOut: trained.heldOut, accuracyBefore: trained.accuracyBefore, accuracyAfter: trained.accuracyAfter }, null, 2))
  const revision: FactRevision = {
    revision: sha,
    base: `${base.id}@${base.revision}`,
    dir: `python/facts/revisions/${sha}/${name}`,
    examples: trained.examples ?? train.length,
    heldOut: trained.heldOut ?? held.length,
    accuracyBefore: trained.accuracyBefore ?? 0,
    accuracyAfter: trained.accuracyAfter ?? 0,
    bytes: sizeOf(dir),
    trainedAt: new Date().toISOString(),
    epochs: options.epochs ?? PASS_TRAIN_EPOCHS,
  }
  recordRevision(revision)
  return { ...revision, ms: performance.now() - started, kept: kept.length }
}
