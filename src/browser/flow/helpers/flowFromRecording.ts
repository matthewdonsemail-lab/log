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
// LiveTyping: the "someone is typing" broadcast a comment box sends while typing and around the send, never
// what the step did (run 20261020T162343: useCometUFICreateCommentMutation is what posted the comment).
const NOT_CONFIRMING = /Logger|ScreenTime|_syncMutation|relay-ef|webstorage|Prompt|QuickPromotion|CIXLog|LiveTyping/i

/** The first mutation a step (and the looks after it) sent: what confirms it. Pure. */
export function confirmingRequest(lines: string[]): string | null {
  for (const line of lines) {
    const name = line.match(/^POST 200 ([A-Za-z0-9_]+Mutation)\b/)?.[1]
    if (name && !NOT_CONFIRMING.test(name)) return name
  }
  return null
}

const ACTED: Record<string, FlowAction> = { click: 'click', clickRole: 'click', type: 'fill', upload: 'upload', uploadRole: 'upload', signIn: 'signIn', code: 'code', pin: 'pin', solve: 'solve', goto: 'goto', scroll: 'scroll', openAny: 'openAny', clickAny: 'clickAny', dwell: 'dwell', press: 'press', scrollIn: 'scrollIn' }

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
 * with `rename`); a group's id in a URL becomes `{groupId}`, and the
 * account's id `{uid}`. A `clickRole` step already names its element; a key
 * press is kept (Escape closes a menu) unless it is a chord (Control+a). Pure.
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
  // A rename whose key is text the page showed, not a param (`Bethlehem Trash=profileName`), turns that text
  // in an element's name into `{profileName}`: filled when the flow runs (the account's own name, from Twenty),
  // so "Actions for this post by <name>" works on any account.
  const literals = Object.entries(rename).filter(([from]) => !/^(text|file)\d+$|^groupId$/.test(from))
  const named = (text: string): string => literals.reduce((out, [from, to]) => out.split(from).join(`{${to}}`), text)
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
      // A group is a param of its own, so the flow runs on any group the account is in.
      const grouped = url.replace(/\/groups\/\d+/, () => {
        if (!params.some((p) => p.name === (rename.groupId ?? 'groupId'))) params.push({ name: rename.groupId ?? 'groupId', kind: 'text', description: "the group's numeric id, from its URL" })
        return `/groups/{${rename.groupId ?? 'groupId'}}`
      })
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_goto${camel(new URL(url).pathname.replace(/\d{6,}/g, ''))}`, action, url: grouped.replace(/\d{10,}/g, '{uid}'), recorded })
      return
    }
    // Warm-up steps keep their recorded ranges; they choose what to act on each run, so no element is pinned.
    if (action === 'scroll' || action === 'openAny' || action === 'clickAny' || action === 'dwell') {
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_${action}`, action, args: command.args, recorded })
      return
    }
    // A key: Escape closes the menu or dialog the step before opened. A chord selects text, which a fill does itself.
    if (action === 'press') {
      const key = command.args[0] ?? ''
      if (!key || key.includes('+')) return
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_press${key[0].toUpperCase()}${key.slice(1)}`, action, args: [key], recorded })
      return
    }
    if (action === 'scrollIn') {
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_scrollIn${camel(command.args[0] ?? '')[0]?.toUpperCase() ?? ''}${camel(command.args[0] ?? '').slice(1)}`, action, args: command.args, recorded })
      return
    }
    // clickRole named its element itself: the role and name are the step's own arguments.
    if (command.action === 'clickRole') {
      const [role, name] = command.args
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_click${camel(name)[0]?.toUpperCase() ?? ''}${camel(name).slice(1)}`, action, role, name: named(name), ...(expect ? { expect } : {}), recorded })
      return
    }
    // uploadRole named its element and its file: the file becomes a param (run 20261020T162343, Photo/video).
    if (command.action === 'uploadRole') {
      const [role, name] = command.args
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_upload${camel(name)[0]?.toUpperCase() ?? ''}${camel(name).slice(1)}`, action: 'upload', role, name: named(name), value: param('file', `uploaded through ${role} "${name}"`), ...(expect ? { expect } : {}), recorded })
      return
    }
    if (action === 'signIn' || action === 'code' || action === 'pin' || action === 'solve') {
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
  return { ...step, ...(step.url ? { url: fill(step.url) } : {}), ...(step.value ? { value: fill(step.value) } : {}), ...(step.name ? { name: fill(step.name) } : {}) }
}
