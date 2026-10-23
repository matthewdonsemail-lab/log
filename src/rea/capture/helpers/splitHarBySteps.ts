export interface RunStep {
  at: string
  step: string
}

export interface StepHar {
  index: number
  step: string
  name: string
  entries: number
  har: Record<string, unknown>
}

export const REPORT_LINE = /^\s*(?:now on |rea read |page has |mouse: |(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) \d{3} )/

export function parseSteps(text: string): RunStep[] {
  const steps: RunStep[] = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue
    try {
      const value = JSON.parse(line) as Partial<RunStep>
      if (typeof value.at === 'string' && typeof value.step === 'string' && !Number.isNaN(Date.parse(value.at)) && !REPORT_LINE.test(value.step)) steps.push({ at: value.at, step: value.step })
    } catch {
    }
  }
  return steps.sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}

export function stepSlug(step: string): string {
  const words = step
    .replace(/^\[\d+s\]\s*/, '')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 5)
  const slug = words.map((word, i) => (i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase())).join('')
  return slug || 'step'
}

export function splitHarBySteps(har: unknown, steps: RunStep[]): StepHar[] {
  if (!steps.length || !isRecord(har) || !isRecord(har.log) || !Array.isArray(har.log.entries)) return []
  const log = har.log
  const starts = steps.map((s) => Date.parse(s.at))
  const buckets: unknown[][] = steps.map(() => [])
  for (const entry of log.entries as unknown[]) {
    const started = isRecord(entry) && typeof entry.startedDateTime === 'string' ? Date.parse(entry.startedDateTime) : Number.NaN
    let at = 0
    if (!Number.isNaN(started)) for (let i = 0; i < starts.length; i++) if (starts[i] <= started) at = i
    buckets[at].push(entry)
  }
  const out: StepHar[] = []
  steps.forEach((step, i) => {
    if (!buckets[i].length) return
    const index = i + 1
    out.push({
      index,
      step: step.step,
      name: `${String(index).padStart(2, '0')}_${stepSlug(step.step)}`,
      entries: buckets[i].length,
      har: { ...har, log: { ...log, entries: buckets[i] } }
    })
  })
  return out
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
