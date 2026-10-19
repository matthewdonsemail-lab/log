import type { Flow, FlowState, FlowTransition, RecordedStep } from '../types'
import { readScreen, stateId } from './readScreen'

/** Steps that only look (a wait, a snapshot) don't move the flow; the action before them did. */
const LOOKS = new Set(['wait', 'snapshot'])

const normPath = (url: string): string => {
  try {
    return new URL(url).pathname.replace(/\d{5,}/g, '<id>')
  } catch {
    return url
  }
}

/** `click e66` → `click "Continue"`, from the screen it was clicked on. Pure. */
function eventOf(step: RecordedStep, on: FlowState | null): string {
  if (step.action === 'click' || step.action === 'type') {
    const element = on?.elements.find((e) => e.ref === step.args[0])
    return `${step.action} ${element ? `${element.role} "${element.name}"` : step.args[0]}`
  }
  if (step.action === 'goto') return `goto ${normPath(step.args[0] ?? step.url)}`
  return [step.action, ...step.args].join(' ')
}

/**
 * Recorded steps → states and transitions. A screen is a state, keyed by its
 * path and heading (the account's name stripped). A half-drawn screen with no
 * heading yet is not a state of its own: the flow waits for the screen it
 * becomes. The action that changed the screen is the event, even when a later
 * wait is where the change showed; its requests and time add up until then. Pure.
 */
export function buildFlow(runDir: string, steps: RecordedStep[]): Flow {
  const states = new Map<string, FlowState>()
  const transitions: FlowTransition[] = []
  let current: FlowState | null = null
  let pending: { event: string; step: string; requests: string[]; ms: number; rea: string | null; fromLook: boolean } | null = null
  for (const step of steps) {
    const screen = readScreen(step.snapshot)
    const path = normPath(step.url)
    const looks = LOOKS.has(step.action)
    // An action starts a new event; a look carries on the one in progress, or (none) is the page changing by itself.
    // An earlier action that never changed the screen (2Captcha's solve, typing) is kept as its own self-transition.
    if (!looks && pending && !pending.fromLook && current) {
      transitions.push({ from: current.id, to: current.id, event: pending.event, step: pending.step, requests: [...new Set(pending.requests)], ms: pending.ms || null, reaEvidenceId: pending.rea })
    }
    if (!looks) pending = { event: eventOf(step, current), step: step.name, requests: [], ms: 0, rea: null, fromLook: false }
    else if (!pending) pending = { event: current ? 'pageChanged' : 'load', step: step.name, requests: [], ms: 0, rea: null, fromLook: true }
    pending.requests.push(...step.requests)
    pending.ms += step.ms ?? 0
    pending.rea = step.reaEvidenceId ?? pending.rea
    // Half drawn: no heading and nothing to act on yet. Wait for the screen it becomes.
    if (!screen.heading && !screen.elements.some((e) => !e.disabled && e.role !== 'link')) continue
    const key = `${path}|${screen.heading ?? ''}`
    let state = states.get(key)
    if (!state) {
      let id = stateId(screen.heading, path)
      while ([...states.values()].some((s) => s.id === id)) id = `${id}2`
      state = { id, path, heading: screen.heading, elements: screen.elements, firstStep: step.name }
      states.set(key, state)
    }
    if (!current || current.id !== state.id) {
      transitions.push({ from: current?.id ?? 'start', to: state.id, event: pending.event, step: pending.step, requests: [...new Set(pending.requests)], ms: pending.ms || null, reaEvidenceId: pending.rea })
      pending = null
    } else if (pending.fromLook) {
      // Looked, and nothing changed.
      pending = null
    }
    // An action on the same screen stays pending: its effect may show in the next look.
    current = state
  }
  return { runDir, initial: transitions[0]?.to ?? null, states: [...states.values()], transitions }
}

/**
 * Several runs' flows as one: a screen seen in any run is one state (by id),
 * a transition seen in several is kept once, with the first run's details.
 * The initial state is the first run's. Pure.
 */
export function mergeFlows(flows: Flow[]): Flow {
  const states = new Map<string, FlowState>()
  const transitions = new Map<string, FlowTransition>()
  for (const flow of flows) {
    for (const s of flow.states) if (!states.has(s.id)) states.set(s.id, s)
    for (const t of flow.transitions) {
      const key = `${t.from}|${t.event}|${t.to}`
      if (!transitions.has(key)) transitions.set(key, t)
    }
  }
  return { runDir: flows.map((f) => f.runDir).join(', '), initial: flows[0]?.initial ?? null, states: [...states.values()], transitions: [...transitions.values()] }
}

/** `click button "Continue"` → `CLICK_CONTINUE`. Pure. */
export function eventName(event: string): string {
  const [verb, ...rest] = event.split(' ')
  const label = rest.join(' ').match(/"([^"]+)"/)?.[1] ?? rest.join(' ')
  const words = label.split(/[^A-Za-z0-9]+/).filter(Boolean).slice(0, 4)
  return [verb, ...words].join('_').toUpperCase()
}

/** The flow as an XState machine config: each screen a state, each transition an event, with what Facebook did in `meta`. Pure. */
export function toMachineConfig(flow: Flow, id = 'facebookFlow'): Record<string, unknown> {
  const states: Record<string, { meta: Record<string, unknown>; on: Record<string, { target: string; meta: Record<string, unknown> }> }> = {}
  for (const state of flow.states) {
    states[state.id] = { meta: { path: state.path, heading: state.heading, elements: state.elements.map((e) => `${e.role} "${e.name}"${e.disabled ? ' (disabled)' : ''}`) }, on: {} }
  }
  for (const t of flow.transitions) {
    if (t.from === 'start') continue
    // A self-transition is an action on the screen (a solve, typing): kept as a targetless event.
    states[t.from].on[eventName(t.event)] = { target: t.to, meta: { requests: t.requests, ms: t.ms, rea: t.reaEvidenceId, step: t.step, internal: t.from === t.to } }
  }
  return { id, initial: flow.initial, states }
}

/** The flow for a person: each screen, then each transition with its requests and time, and a Mermaid diagram. Pure. */
export function renderFlow(flow: Flow): string {
  const out = [`# Flow from ${flow.runDir}`, '', 'Built by `log inspect map` from the recorded steps (rule 29). Screens are states; the action that changed the screen is the event.', '', '## Screens', '']
  for (const s of flow.states) {
    out.push(`### \`${s.id}\``, '', `${s.heading ?? '(no heading)'} — \`${s.path}\` (first at ${s.firstStep})`, '')
    for (const e of s.elements) out.push(`- ${e.role} "${e.name}"${e.disabled ? ' (disabled)' : ''}${e.ref ? ` \`${e.ref}\`` : ''}`)
    out.push('')
  }
  out.push('## Transitions', '')
  for (const t of flow.transitions) {
    out.push(`- **${t.from} → ${t.to}** on \`${t.event}\` (${t.step}${t.ms ? `, ${t.ms} ms` : ''}${t.reaEvidenceId ? `, rea \`${t.reaEvidenceId}\`` : ''})`)
    for (const r of t.requests) out.push(`  - ${r}`)
  }
  out.push('', '```mermaid', 'stateDiagram-v2')
  for (const t of flow.transitions) out.push(`  ${t.from === 'start' ? '[*]' : t.from} --> ${t.to}: ${eventName(t.event)}`)
  out.push('```', '')
  return out.join('\n')
}
