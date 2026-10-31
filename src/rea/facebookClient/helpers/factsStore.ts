import { REPORT_LINE } from '../../capture/helpers/splitHarBySteps'
import type { ClientOperation, OperationKind, OperationSample, OperationSighting } from '../types'
import { FACTS_END, FACTS_START, stepLabel } from './renderOperationDoc'

export interface FactsRow {
  action: string
  step: string
  times: number
  statuses: number[]
  ms: [number, number]
  afterStepMs: [number, number]
  errors: string[]
}

export interface StoredFacts {
  kind: OperationKind
  sends: string[]
  reads: string[]
  calledFrom: string[]
  reaEvidenceId: string | null
  rows: FactsRow[]
  seen: number
  runs: string[]
  legacyRuns: number
  samples?: OperationSample[]
}

export const MAX_SAMPLES = 3
export const MAX_SAMPLE_CHARS = 6_000

const SIGNED_URL = /(https?:\/\/[^/?\s"]*(?:fbcdn\.net|cdninstagram\.com)[^?\s"]*)\?[^\s"]*/g

const SECRET_KEY = /token|^serialized_state$|^fb_dtsg|^jazoest$|^lsd$/i

export function unsigned(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(SIGNED_URL, '$1')
  if (Array.isArray(value)) return value.map(unsigned)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SECRET_KEY.test(k) && v !== null && v !== '' ? '(taken out)' : unsigned(v)]))
  return value
}

function shallower(value: unknown, depth: number, at = 0): unknown {
  if (Array.isArray(value)) return at >= depth ? `(${value.length} items)` : value.map((v) => shallower(v, depth, at + 1))
  if (value && typeof value === 'object') return at >= depth ? `(${Object.keys(value).length} fields)` : Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, shallower(v, depth, at + 1)]))
  return value
}

export function fitSample(value: unknown, limit = MAX_SAMPLE_CHARS): unknown {
  const clean = unsigned(value)
  if (JSON.stringify(clean ?? null).length <= limit) return clean
  for (let depth = 8; depth >= 1; depth--) {
    const cut = shallower(clean, depth)
    if (JSON.stringify(cut).length <= limit) return cut
  }
  return `${JSON.stringify(clean).slice(0, limit)}… (cut to fit)`
}

export function samplesOf(stored: OperationSample[], sightings: OperationSighting[]): OperationSample[] {
  const fresh = sightings.filter((s) => s.answer !== undefined).map((s) => ({ run: s.run, step: label(s), status: s.status, ms: s.ms, sent: fitSample(s.sent ?? null), answer: fitSample(s.answer ?? null) }))
  const byStep = new Map<string, OperationSample>()
  const kept = stored.map((s) => ({ ...s, sent: unsigned(s.sent), answer: unsigned(s.answer) }))
  for (const sample of [...kept, ...fresh].sort((a, b) => b.run.localeCompare(a.run))) if (!byStep.has(sample.step)) byStep.set(sample.step, sample)
  return [...byStep.values()].slice(0, MAX_SAMPLES)
}

const label = (s: OperationSighting) => (REPORT_LINE.test(s.step) ? 'a step (older run, split by its report lines)' : stepLabel(s.step))
const key = (r: { action: string; step: string }) => `${r.action}\u0000${r.step}`

export function mergeRows(rows: FactsRow[], more: FactsRow[]): FactsRow[] {
  const out = new Map(rows.map((r) => [key(r), { ...r, statuses: [...r.statuses], errors: [...r.errors] }]))
  for (const r of more) {
    const was = out.get(key(r))
    if (!was) {
      out.set(key(r), { ...r, statuses: [...r.statuses], errors: [...r.errors] })
      continue
    }
    was.times += r.times
    was.statuses = [...new Set([...was.statuses, ...r.statuses])]
    was.ms = [Math.min(was.ms[0], r.ms[0]), Math.max(was.ms[1], r.ms[1])]
    was.afterStepMs = [Math.min(was.afterStepMs[0], r.afterStepMs[0]), Math.max(was.afterStepMs[1], r.afterStepMs[1])]
    was.errors = [...new Set([...was.errors, ...r.errors])]
  }
  return [...out.values()]
}

export function rowsOf(sightings: OperationSighting[]): FactsRow[] {
  return mergeRows(
    [],
    sightings.map((s) => ({ action: s.action, step: label(s), times: 1, statuses: [s.status], ms: [s.ms, s.ms], afterStepMs: [s.afterStepMs, s.afterStepMs], errors: s.errors }))
  )
}

const listOf = (cell: string): string[] => (cell.trim() === '—' ? [] : [...cell.matchAll(/`([^`]+)`/g)].map((m) => m[1]))
const rangeOf = (cell: string): [number, number] => {
  const [a, b] = cell.replace(/ ms$/, '').split('–').map((n) => Number(n.trim()))
  return [a, Number.isFinite(b) ? b : a]
}

export function factsFromDoc(doc: string): StoredFacts | null {
  if (!doc.includes(FACTS_START) || !doc.includes(FACTS_END)) return null
  const facts = doc.slice(doc.indexOf(FACTS_START), doc.indexOf(FACTS_END))
  const field = (name: string) => new RegExp(`^\\| ${name} \\| (.*) \\|$`, 'm').exec(facts)?.[1] ?? '—'
  const seen = /^Seen (\d+) time\(s\) in (\d+) run\(s\)\.$/m.exec(facts)
  const rows: FactsRow[] = []
  for (const line of facts.split(/\r?\n/)) {
    const cells = line.split(' | ').map((c) => c.replace(/^\| ?| ?\|$/g, ''))
    if (cells.length !== 7 || !/^\d+$/.test(cells[2])) continue
    rows.push({ action: cells[0], step: cells[1], times: Number(cells[2]), statuses: cells[3].split(', ').map(Number), ms: rangeOf(cells[4]), afterStepMs: rangeOf(cells[5]), errors: cells[6] === '—' ? [] : cells[6].split('; ') })
  }
  const rea = /`(ev_[0-9a-f]+)`/.exec(field('rea'))?.[1] ?? null
  return { kind: field('Kind').trim() as OperationKind, sends: listOf(field('Sends')), reads: listOf(field('Reads')), calledFrom: listOf(field('Called from')), reaEvidenceId: rea, rows, seen: Number(seen?.[1] ?? 0), runs: [], legacyRuns: Number(seen?.[2] ?? 0) }
}

export function foldOperation(stored: StoredFacts | null, operation: ClientOperation): StoredFacts {
  const base: StoredFacts = stored ?? { kind: operation.kind, sends: [], reads: [], calledFrom: [], reaEvidenceId: null, rows: [], seen: 0, runs: [], legacyRuns: 0 }
  const counted = new Set(base.runs)
  const fresh = operation.sightings.filter((s) => !counted.has(s.run))
  const pick = (now: string[], was: string[]) => (now.length ? now : was)
  const readDefinition = operation.reads.length > 0 || operation.calledFrom.length > 0
  return {
    kind: readDefinition || !stored ? operation.kind : base.kind,
    sends: pick(operation.sends, base.sends),
    reads: pick(operation.reads, base.reads),
    calledFrom: pick(operation.calledFrom, base.calledFrom),
    reaEvidenceId: operation.reaEvidenceId ?? base.reaEvidenceId,
    rows: mergeRows(base.rows, rowsOf(fresh)),
    seen: base.seen + fresh.length,
    runs: [...new Set([...base.runs, ...fresh.map((s) => s.run)])].sort(),
    legacyRuns: base.legacyRuns,
    samples: samplesOf(base.samples ?? [], operation.sightings)
  }
}

const range = ([min, max]: [number, number]) => (min === max ? `${min} ms` : `${min}–${max} ms`)

export function renderStoredSightings(facts: StoredFacts): string {
  const rows = facts.rows.map((r) => `| ${r.action} | ${r.step.replace(/\|/g, '/')} | ${r.times} | ${r.statuses.join(', ')} | ${range(r.ms)} | ${range(r.afterStepMs)} | ${(r.errors.join('; ') || '—').replace(/\|/g, '/')} |`)
  return [
    `Seen ${facts.seen} time(s) in ${facts.legacyRuns + facts.runs.length} run(s).`,
    '',
    '| Action | Our step | Times | Status | Took | After step start | Errors |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows,
    ...renderSamples(facts.samples ?? [])
  ].join('\n')
}

const block = (value: unknown) => ['```json', JSON.stringify(value, null, 2), '```']

export function renderSamples(samples: OperationSample[]): string[] {
  if (!samples.length) return []
  return [
    '',
    `### What it sent and what came back (the newest ${samples.length} from our runs)`,
    '',
    'Read from each run\'s own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.',
    ...samples.flatMap((s) => ['', `**${s.run}**, ${s.step}: ${s.status}, ${s.ms} ms`, '', 'Sent:', '', ...block(s.sent), '', 'Answered:', '', ...block(s.answer)])
  ]
}
