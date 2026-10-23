import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evidenceIdOf } from '../../rea/capture/client'
import { renderFlowDoc } from './helpers/index'
import type { RecordedCommand } from './helpers/index'
import type { FlowDefinition, FlowStep } from './types'

export const FLOWS_DIR = fileURLToPath(new URL('./definitions', import.meta.url))
export const FLOW_DOCS_DIR = fileURLToPath(new URL('../../../docs/platforms/facebook/flows', import.meta.url))
const REQUEST_DOCS = fileURLToPath(new URL('../../../docs/platforms/facebook', import.meta.url))

const jsonLines = <T>(path: string): T[] =>
  existsSync(path)
    ? readFileSync(path, 'utf8')
        .split(/\r?\n/)
        .filter((l) => l.trim())
        .flatMap((l) => {
          try {
            return [JSON.parse(l) as T]
          } catch {
            return []
          }
        })
    : []

function laterEvidence(path: string): string | null {
  if (!existsSync(path)) return null
  try {
    const read = JSON.parse(readFileSync(path, 'utf8')) as { evidenceId?: string | null; stdout?: string }
    return read.evidenceId ?? evidenceIdOf(String(read.stdout ?? ''))
  } catch {
    return null
  }
}

export function readRecordedCommands(runDir: string): RecordedCommand[] {
  const commands = new Map(jsonLines<{ id: string; action: string; args: string[] }>(join(runDir, 'commands.jsonl')).map((c) => [c.id, c]))
  const out: RecordedCommand[] = []
  for (const reply of jsonLines<{ id: string; result: Record<string, unknown> }>(join(runDir, 'replies.jsonl'))) {
    const r = reply.result as { ok?: boolean; step?: string; url?: string; ms?: number; notable?: string[]; rea?: { evidenceId?: string }; action?: string; args?: string[] }
    if (!r.step) continue
    const command = commands.get(reply.id)
    const snapshotPath = join(runDir, 'steps', r.step, 'snapshot.yml')
    out.push({
      action: command?.action ?? r.action ?? (reply.id === 'start' ? 'goto' : 'snapshot'),
      args: command?.args ?? r.args ?? [],
      ok: r.ok !== false,
      step: r.step,
      url: r.url ?? '',
      ms: r.ms ?? null,
      notable: r.notable ?? [],
      reaEvidenceId: r.rea?.evidenceId ?? laterEvidence(join(runDir, 'steps', r.step, 'rea.json')),
      snapshot: existsSync(snapshotPath) ? readFileSync(snapshotPath, 'utf8') : ''
    })
  }
  return out.sort((a, b) => a.step.localeCompare(b.step))
}

export function listFlows(dir = FLOWS_DIR): string[] {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5)).sort() : []
}

export function loadFlow(name: string, dir = FLOWS_DIR): FlowDefinition | null {
  const path = join(dir, `${name}.json`)
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as FlowDefinition) : null
}

const sameStep = (a: FlowStep, b: FlowStep) => a.action === b.action && (a.url ?? '') === (b.url ?? '') && JSON.stringify(a.args ?? []) === JSON.stringify(b.args ?? [])

export function keepAnswers(flow: FlowDefinition, before: FlowDefinition | null): FlowDefinition {
  if (!before) return flow
  const left = before.steps.filter((s) => s.answers?.length)
  return {
    ...flow,
    steps: flow.steps.map((step) => {
      if (step.answers?.length) return step
      const at = left.findIndex((old) => sameStep(old, step))
      if (at < 0) return step
      const [old] = left.splice(at, 1)
      return { ...step, answers: old.answers }
    })
  }
}

export function saveFlow(flow: FlowDefinition, dir = FLOWS_DIR): string {
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `${flow.name}.json`)
  writeFileSync(path, `${JSON.stringify(keepAnswers(flow, loadFlow(flow.name, dir)), null, 2)}\n`)
  return path
}

function requestDocFor(name: string): string | null {
  try {
    const index = JSON.parse(readFileSync(join(REQUEST_DOCS, 'operations.json'), 'utf8')) as { operations: { name: string; doc: string }[] }
    const found = index.operations.find((o) => o.name === name)
    return found ? `../${found.doc}` : null
  } catch {
    return null
  }
}

export function writeFlowDoc(flow: FlowDefinition, dir = FLOW_DOCS_DIR): string {
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `${flow.name}.md`)
  writeFileSync(path, renderFlowDoc(flow, requestDocFor))
  return path
}
