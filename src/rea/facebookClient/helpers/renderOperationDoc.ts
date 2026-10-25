import { REPORT_LINE } from '../../capture/helpers/splitHarBySteps'
import type { ClientOperation, OperationSighting } from '../types'

export const FACTS_START = '<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->'
export const FACTS_END = '<!-- facts:end -->'
export const TO_WRITE = '<!-- toWrite -->'

export type ReasoningPrompts = readonly (readonly [string, string])[]

export const FACEBOOK_REASONING: ReasoningPrompts = [
  ['What it does', 'What this request is for on Facebook\'s side, from its definition and the step it fires in.'],
  ['What our machine does with it', 'Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.'],
  ['What can go wrong', 'The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.']
]

export function stepLabel(step: string): string {
  return step
    .replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, '<ip>')
    .replace(/https?:\/\/[^\s"]+/g, (url) => {
      try {
        return new URL(url).pathname
      } catch {
        return '<url>'
      }
    })
    .replace(/\b\d{6,}\b/g, '<id>')
    .replace(/says:\s+[A-Z][\w'-]*/g, 'says: <name>')
    .trim()
    .replace(/"[^"]*"/g, '"…"')
    .slice(0, 90)
}

const range = (values: number[]): string => {
  const min = Math.min(...values)
  const max = Math.max(...values)
  return min === max ? `${min} ms` : `${min}–${max} ms`
}

export function renderSightings(sightings: OperationSighting[]): string {
  const groups = new Map<string, OperationSighting[]>()
  for (const s of sightings) {
    const step = REPORT_LINE.test(s.step) ? 'a step (older run, split by its report lines)' : stepLabel(s.step)
    const key = `${s.action}\u0000${step}`
    groups.set(key, [...(groups.get(key) ?? []), s])
  }
  const rows = [...groups].map(([key, list]) => {
    const [action, step] = key.split('\u0000')
    const statuses = [...new Set(list.map((s) => s.status))].join(', ')
    const errors = [...new Set(list.flatMap((s) => s.errors))].join('; ') || '—'
    return `| ${action} | ${step.replace(/\|/g, '/')} | ${list.length} | ${statuses} | ${range(list.map((s) => s.ms))} | ${range(list.map((s) => s.afterStepMs))} | ${errors.replace(/\|/g, '/')} |`
  })
  const runs = new Set(sightings.map((s) => s.run)).size
  return [
    `Seen ${sightings.length} time(s) in ${runs} run(s).`,
    '',
    '| Action | Our step | Times | Status | Took | After step start | Errors |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows
  ].join('\n')
}

const code = (values: string[]): string => (values.length ? values.map((v) => `\`${v}\``).join(', ') : '—')

export function renderFacts(operation: ClientOperation, sightings = renderSightings(operation.sightings)): string {
  return [
    FACTS_START,
    '',
    '| | |',
    '| --- | --- |',
    `| Domain | ${operation.domain} |`,
    `| Kind | ${operation.kind} |`,
    `| doc_id | ${operation.docId ? `\`${operation.docId}\`` : '—'} |`,
    `| Path | \`${operation.path}\` |`,
    `| Sends | ${code(operation.sends)} |`,
    `| Reads | ${code(operation.reads.slice(0, 12))}${operation.reads.length > 12 ? ` and ${operation.reads.length - 12} more` : ''} |`,
    `| Called from | ${code(operation.calledFrom.slice(0, 8))} |`,
    `| rea | ${operation.reaEvidenceId ? `\`${operation.reaEvidenceId}\`` : 'not read yet'} |`,
    '',
    sightings,
    '',
    FACTS_END
  ].join('\n')
}

export function renderOperationDoc(operation: ClientOperation, existing: string | null, sightings?: string, reasoning: ReasoningPrompts = FACEBOOK_REASONING): string {
  const facts = renderFacts(operation, sightings)
  if (existing && existing.includes(FACTS_START) && existing.includes(FACTS_END)) {
    const before = existing.slice(0, existing.indexOf(FACTS_START))
    const after = existing.slice(existing.indexOf(FACTS_END) + FACTS_END.length)
    return `${before}${facts}${after}`
  }
  const sections = reasoning.map(([title, prompt]) => `## ${title}\n\n${TO_WRITE} ${prompt}\n`)
  return `# ${operation.name}\n\n${facts}\n\n${sections.join('\n')}`
}
