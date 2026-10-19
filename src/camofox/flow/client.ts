import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderFlowDoc } from './helpers/index'
import type { RecordedCommand } from './helpers/index'
import type { FlowDefinition } from './types'

/** Saved flows, committed: `src/camofox/flow/definitions/<name>.json`. */
export const FLOWS_DIR = fileURLToPath(new URL('./definitions', import.meta.url))
/** Their docs: `docs/facebookClient/flows/<name>.md`. */
export const FLOW_DOCS_DIR = fileURLToPath(new URL('../../../docs/facebookClient/flows', import.meta.url))
const REQUEST_DOCS = fileURLToPath(new URL('../../../docs/facebookClient', import.meta.url))

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

/**
 * An inspect run's commands with what each one did, in order: the command's
 * own args (typed text, file paths: the reply only names the ref), and the
 * reply's step, page, requests, rea Evidence and snapshot.
 */
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
      reaEvidenceId: r.rea?.evidenceId ?? null,
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

export function saveFlow(flow: FlowDefinition, dir = FLOWS_DIR): string {
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `${flow.name}.json`)
  writeFileSync(path, `${JSON.stringify(flow, null, 2)}\n`)
  return path
}

/** A request's doc in docs/facebookClient, relative to the flow docs, if it has one. */
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
