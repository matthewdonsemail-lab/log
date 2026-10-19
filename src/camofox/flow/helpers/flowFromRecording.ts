import { readScreen } from '../../../rea/inspectMap/helpers/readScreen'
import type { FlowAction, FlowDefinition, FlowParam, FlowStep } from '../types'

/** One recorded command and what the session replied, in order (`commands.jsonl` + `replies.jsonl`). */
export interface RecordedCommand {
  action: string
  args: string[]
  ok: boolean
  step: string
  url: string
  ms: number | null
  notable: string[]
  reaEvidenceId: string | null
  /** The snapshot the step left; the next step acted on it. */
  snapshot: string
}

/** Requests that are logging, not the step's effect. */
const NOT_CONFIRMING = /Logger|ScreenTime|_syncMutation|relay-ef|webstorage|Prompt|QuickPromotion/i

/** The first mutation a step (and the looks after it) sent: what confirms it. Pure. */
export function confirmingRequest(lines: string[]): string | null {
  for (const line of lines) {
    const name = line.match(/^POST 200 ([A-Za-z0-9_]+Mutation)\b/)?.[1]
    if (name && !NOT_CONFIRMING.test(name)) return name
  }
  return null
}

const ACTED: Record<string, FlowAction> = { click: 'click', type: 'fill', upload: 'upload', signIn: 'signIn', code: 'code', solve: 'solve', goto: 'goto' }

const camel = (text: string): string =>
  text
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join('')

/**
 * A recording → a flow definition. Steps that only looked (snapshot, wait),
 * failed, or selected text (Control+a) are left out: a fill clears its field
 * itself. A ref becomes the role and name the previous snapshot gave it.
 * Typed text and uploaded files become params (`{text1}`, `{file1}`, renamed
 * with `rename`); the account's id in a URL becomes `{uid}`. Pure.
 */
export function flowFromRecording(
  name: string,
  summary: string,
  commands: RecordedCommand[],
  source: { runDir: string; account: string },
  rename: Record<string, string> = {}
): FlowDefinition {
  const steps: FlowStep[] = []
  const params: FlowParam[] = []
  let texts = 0
  let files = 0
  const param = (kind: 'text' | 'file', described: string): string => {
    const raw = kind === 'text' ? `text${++texts}` : `file${++files}`
    const final = rename[raw] ?? raw
    params.push({ name: final, kind, description: described })
    return `{${final}}`
  }
  commands.forEach((command, i) => {
    const action = ACTED[command.action]
    if (!action || !command.ok) return
    // What the step confirmed may show in the looks right after it.
    const after = [...command.notable]
    for (let j = i + 1; j < commands.length && ['wait', 'snapshot'].includes(commands[j].action); j++) after.push(...commands[j].notable)
    const recorded = { step: command.step, ms: command.ms, reaEvidenceId: command.reaEvidenceId, requests: after.filter((l) => /^POST 200 \w+(Query|Mutation)/.test(l)).map((l) => l.split(' ')[2]) }
    const expect = confirmingRequest(after) ?? undefined
    if (action === 'goto') {
      // Opening a page waits for the page, not for whatever request the page load happened to send.
      const url = command.args[0] ?? command.url
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_goto${camel(new URL(url).pathname.replace(/\d{6,}/g, ''))}`, action, url: url.replace(/\d{10,}/g, '{uid}'), recorded })
      return
    }
    if (action === 'signIn' || action === 'code' || action === 'solve') {
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_${action}`, action, expect, recorded })
      return
    }
    const before = i > 0 ? commands[i - 1].snapshot : ''
    const element = readScreen(before).elements.find((e) => e.ref === command.args[0])
    if (!element) throw new Error(`${command.step}: ref ${command.args[0]} is not in the snapshot before it`)
    // A click into a field before typing in it: the fill clicks it itself.
    if (action === 'click' && element.role === 'textbox') return
    const value = action === 'fill' ? param('text', `typed into ${element.role} "${element.name}"`) : action === 'upload' ? param('file', `uploaded through ${element.role} "${element.name}"`) : undefined
    steps.push({
      id: `s${String(steps.length + 1).padStart(2, '0')}_${action}${camel(element.name)[0]?.toUpperCase() ?? ''}${camel(element.name).slice(1)}`,
      action,
      role: element.role,
      name: element.name,
      ...(value ? { value } : {}),
      ...(expect ? { expect } : {}),
      recorded
    })
  })
  return { name, summary, params, steps, source: { ...source, builtAt: new Date().toISOString() } }
}

/** `{uid}` and every `{param}` filled in; a missing one is named. Pure. */
export function fillStep(step: FlowStep, values: Record<string, string>): FlowStep {
  const fill = (text: string | undefined) =>
    text?.replace(/\{(\w+)\}/g, (_, key: string) => {
      if (!(key in values)) throw new Error(`missing value for {${key}}`)
      return values[key]
    })
  return { ...step, ...(step.url ? { url: fill(step.url) } : {}), ...(step.value ? { value: fill(step.value) } : {}) }
}
