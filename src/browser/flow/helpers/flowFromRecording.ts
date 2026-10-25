import { readScreen } from '../../../rea/inspectMap/helpers/readScreen'
import { dialogOf } from './dialogOf'
import type { FlowAction, FlowDefinition, FlowParam, FlowStep } from '../types'

export interface RecordedCommand {
  action: string
  args: string[]
  ok: boolean
  step: string
  url: string
  ms: number | null
  notable: string[]
  reaEvidenceId: string | null
  snapshot: string
}

const NOT_CONFIRMING = /Logger|ScreenTime|_syncMutation|relay-ef|webstorage|Prompt|QuickPromotion|CIXLog|LiveTyping/i

const endpointOf = (path: string): string =>
  path.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())).join('')

export function confirmingRequest(lines: string[]): string | null {
  for (const line of lines) {
    const name = line.match(/^POST 200 ([A-Za-z0-9_]+Mutation)\b/)?.[1]
    if (name && !NOT_CONFIRMING.test(name)) return name
  }
  for (const line of lines) {
    const path = line.match(/^POST 200 (\/(?!ajax\/)[a-z0-9_/]+\/)/)?.[1]
    if (path) return endpointOf(path)
  }
  for (const line of lines) {
    const name = line.match(/^POST 200 ([A-Za-z0-9_]+DialogQuery)\b/)?.[1]
    if (name) return name
  }
  return null
}

const ACTED: Record<string, FlowAction> = { click: 'click', clickRole: 'click', type: 'fill', upload: 'upload', uploadRole: 'upload', signIn: 'signIn', code: 'code', pin: 'pin', setLocation: 'setLocation', solve: 'solve', goto: 'goto', scroll: 'scroll', openAny: 'openAny', clickAny: 'clickAny', dwell: 'dwell', press: 'press', scrollIn: 'scrollIn' }

const camel = (text: string): string =>
  text
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join('')

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
  const literals = Object.entries(rename).filter(([from]) => !/^(text|file)\d+$|^groupId$/.test(from))
  const named = (text: string): string => literals.reduce((out, [from, to]) => out.split(from).join(`{${to}}`), text)
  commands.forEach((command, i) => {
    const action = ACTED[command.action]
    if (!action || !command.ok) return
    const after = [...command.notable]
    for (let j = i + 1; j < commands.length && ['wait', 'snapshot'].includes(commands[j].action); j++) after.push(...commands[j].notable)
    const recorded = { step: command.step, ms: command.ms, reaEvidenceId: command.reaEvidenceId, requests: after.filter((l) => /^POST 200 \w+(Query|Mutation)/.test(l)).map((l) => l.split(' ')[2]) }
    const expect = confirmingRequest(after) ?? undefined
    if (action === 'goto') {
      const url = command.args[0] ?? command.url
      const grouped = url.replace(/\/groups\/\d+/, () => {
        if (!params.some((p) => p.name === (rename.groupId ?? 'groupId'))) params.push({ name: rename.groupId ?? 'groupId', kind: 'text', description: "the group's numeric id, from its URL" })
        return `/groups/{${rename.groupId ?? 'groupId'}}`
      })
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_goto${camel(new URL(url).pathname.replace(/\d{6,}/g, ''))}`, action, url: grouped.replace(/\d{10,}/g, '{uid}'), recorded })
      return
    }
    if (action === 'scroll' || action === 'openAny' || action === 'clickAny' || action === 'dwell') {
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_${action}`, action, args: command.args, recorded })
      return
    }
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
    const within = (role: string, name: string): { within?: string } => {
      const dialog = i > 0 ? dialogOf(commands[i - 1].snapshot, role, name) : null
      return dialog ? { within: dialog } : {}
    }
    if (command.action === 'clickRole') {
      const [role, name] = command.args
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_click${camel(name)[0]?.toUpperCase() ?? ''}${camel(name).slice(1)}`, action, role, name: named(name), ...within(role, name), ...(expect ? { expect } : {}), recorded })
      return
    }
    if (command.action === 'uploadRole') {
      const [role, name] = command.args
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_upload${camel(name)[0]?.toUpperCase() ?? ''}${camel(name).slice(1)}`, action: 'upload', role, name: named(name), ...within(role, name), value: param('file', `uploaded through ${role} "${name}"`), ...(expect ? { expect } : {}), recorded })
      return
    }
    if (action === 'setLocation') {
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_setLocation`, action, value: `{${rename.location ?? 'location'}}`, ...(expect ? { expect } : {}), recorded })
      if (!params.some((p) => p.name === (rename.location ?? 'location'))) params.push({ name: rename.location ?? 'location', kind: 'text', description: 'the Marketplace location, "City, State" with the state written out ("Bethlehem, Pennsylvania")' })
      return
    }
    if (action === 'signIn' || action === 'code' || action === 'pin' || action === 'solve') {
      steps.push({ id: `s${String(steps.length + 1).padStart(2, '0')}_${action}`, action, expect, recorded })
      return
    }
    const before = i > 0 ? commands[i - 1].snapshot : ''
    const element = readScreen(before).elements.find((e) => e.ref === command.args[0])
    if (!element) throw new Error(`${command.step}: ref ${command.args[0]} is not in the snapshot before it`)
    if (action === 'click' && element.role === 'textbox') return
    const value = action === 'fill' ? param('text', `typed into ${element.role} "${element.name}"`) : action === 'upload' ? param('file', `uploaded through ${element.role} "${element.name}"`) : undefined
    steps.push({
      id: `s${String(steps.length + 1).padStart(2, '0')}_${action}${camel(element.name)[0]?.toUpperCase() ?? ''}${camel(element.name).slice(1)}`,
      action,
      role: element.role,
      name: element.name,
      ...within(element.role, element.name),
      ...(value ? { value } : {}),
      ...(expect ? { expect } : {}),
      recorded
    })
  })
  return { name, summary, params, steps, source: { ...source, builtAt: new Date().toISOString() } }
}

export function fillStep(step: FlowStep, values: Record<string, string>): FlowStep {
  const fill = (text: string | undefined) =>
    text?.replace(/\{(\w+)\}/g, (_, key: string) => {
      if (!(key in values)) throw new Error(`missing value for {${key}}`)
      return values[key]
    })
  const answers = step.answers?.map((a) => ({ ...a, says: a.says.map((c) => (typeof c.is === 'string' ? { ...c, is: fill(c.is) } : c)) }))
  return { ...step, ...(step.url ? { url: fill(step.url) } : {}), ...(step.value ? { value: fill(step.value) } : {}), ...(step.name ? { name: fill(step.name) } : {}), ...(answers ? { answers } : {}) }
}
