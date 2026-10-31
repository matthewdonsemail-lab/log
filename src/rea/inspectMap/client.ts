import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFlow, mergeFlows, renderFlow, toMachineConfig } from './helpers/index'
import type { Flow, RecordedStep } from './types'

const readJsonLines = <T>(path: string): T[] => {
  if (!existsSync(path)) return []
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .flatMap((l) => {
      try {
        return [JSON.parse(l) as T]
      } catch {
        return []
      }
    })
}

interface Reply {
  id: string
  result: { step?: string; action?: string; args?: string[]; ms?: number; url?: string; notable?: string[]; rea?: { evidenceId?: string | null } }
}

export function readRecordedSteps(runDir: string): RecordedStep[] {
  const commands = new Map(readJsonLines<{ id: string; action: string; args: string[] }>(join(runDir, 'commands.jsonl')).map((c) => [c.id, c]))
  const steps: RecordedStep[] = []
  for (const reply of readJsonLines<Reply>(join(runDir, 'replies.jsonl'))) {
    const r = reply.result
    if (!r.step) continue
    const folder = join(runDir, 'steps', r.step)
    const command = commands.get(reply.id)
    const action = r.action ?? command?.action ?? (reply.id === 'start' ? 'goto' : 'snapshot')
    steps.push({
      name: r.step,
      action,
      args: r.args ?? command?.args ?? (reply.id === 'start' && r.url ? [r.url] : []),
      url: r.url ?? '',
      snapshot: existsSync(join(folder, 'snapshot.yml')) ? readFileSync(join(folder, 'snapshot.yml'), 'utf8') : '',
      requests: r.notable ?? [],
      ms: r.ms ?? null,
      reaEvidenceId: r.rea?.evidenceId ?? null
    })
  }
  return steps.sort((a, b) => a.name.localeCompare(b.name))
}

export function inspectRuns(root: string): string[] {
  if (!existsSync(root)) return []
  return readdirSync(root)
    .filter((name) => existsSync(join(root, name, 'replies.jsonl')))
    .sort()
    .map((name) => join(root, name))
}

export function mapInspectRun(runDir: string): { flow: Flow; files: string[] } {
  const flow = buildFlow(runDir, readRecordedSteps(runDir))
  const files = [join(runDir, 'flow.json'), join(runDir, 'flow.md'), join(runDir, 'machine.json')]
  writeFileSync(files[0], `${JSON.stringify(flow, null, 2)}\n`)
  writeFileSync(files[1], renderFlow(flow))
  writeFileSync(files[2], `${JSON.stringify(toMachineConfig(flow), null, 2)}\n`)
  return { flow, files }
}

export function mapAllInspectRuns(root: string): { flow: Flow; files: string[] } {
  const flow = mergeFlows(inspectRuns(root).map((dir) => buildFlow(dir, readRecordedSteps(dir))))
  const files = [join(root, 'flowAll.json'), join(root, 'flowAll.md'), join(root, 'machineAll.json')]
  writeFileSync(files[0], `${JSON.stringify(flow, null, 2)}\n`)
  writeFileSync(files[1], renderFlow(flow))
  writeFileSync(files[2], `${JSON.stringify(toMachineConfig(flow), null, 2)}\n`)
  return { flow, files }
}
