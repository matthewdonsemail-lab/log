import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pageStateOf } from '../../browser/flow/helpers/pageState'
import { redactFieldValue } from '../../browser/inspect/helpers/renderInspectStep'
import { createDecisionsClient } from '../decisions/client'
import type { DecisionImage, DecisionsClient } from '../decisions/types'
import { bundleOf, decisionOf, exchangesOf, exchangeTimeline, meaningOf, questionsOf, savedOf, stateOf } from './helpers/index'
import { DOCUMENT_FIELDS, EXCHANGES_FILE, READING_FILE, SUBQ_STEP_MODEL } from './types'
import type { EarlierStep, StepAccount, StepAnswer, StepExchange, StepReading, StepTaken } from './types'

const REPO = resolve(fileURLToPath(new URL('../../..', import.meta.url)))
const MAX_IMAGE_BYTES = 4 * 1024 * 1024

interface ReplyLine {
  ok?: boolean
  error?: string
  step?: string
  action?: string
  args?: string[]
  url?: string
  title?: string
  ms?: number
  landedMs?: number
  notable?: string[]
}

export interface ReadStepOptions {
  goal: string | null
  account: Omit<StepAccount, 'exit'>
  decisions?: DecisionsClient
  now?: () => Date
  since?: string | null
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T
  } catch {
    return null
  }
}

export function knownRequests(platform: string): Set<string> {
  const ops = readJson<{ operations?: { name: string }[] }>(join(REPO, 'docs', 'platforms', platform, 'operations.json'))
  return new Set((ops?.operations ?? []).map((o) => o.name))
}

export function repliesOf(runDir: string): ReplyLine[] {
  const path = join(runDir, 'replies.jsonl')
  if (!existsSync(path)) return []
  const out: ReplyLine[] = []
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try {
      const result = (JSON.parse(line) as { result?: ReplyLine }).result
      if (result?.step) out.push(result)
    } catch {
    }
  }
  return out
}

export function exitOf(runDir: string): string | null {
  for (const dir of existsSync(runDir) ? readdirSync(runDir) : []) {
    const path = join(runDir, dir, 'steps.jsonl')
    if (!existsSync(path)) continue
    const gate = /Gate passed: ([^"]+)"/.exec(readFileSync(path, 'utf8'))
    if (gate) return gate[1]
  }
  return null
}

function mouseOf(folder: string): unknown {
  const mouse = readJson<{ legs?: { kind: string; ms?: number; target?: string }[]; idleMoves?: number }>(join(folder, 'mouse.json'))
  if (!mouse) return null
  const legs = mouse.legs ?? []
  return { moves: legs.length, idleMoves: mouse.idleMoves ?? 0, totalMs: legs.reduce((n, l) => n + (l.ms ?? 0), 0), legs: legs.map((l) => `${l.kind}${l.target ? ` to ${l.target}` : ''} ${l.ms ?? 0} ms`) }
}

function screenshotOf(folder: string): DecisionImage | null {
  const path = join(folder, 'screenshot.png')
  if (!existsSync(path) || statSync(path).size > MAX_IMAGE_BYTES) return null
  return { mediaType: 'image/png', base64: readFileSync(path).toString('base64') }
}

function earlierOf(runDir: string, replies: ReplyLine[], step: string, since: string | null): EarlierStep[] {
  const before = replies.filter((r) => r.step && r.step < step)
  return before.map((r) => {
    const reading = readJson<StepReading>(join(runDir, 'steps', r.step!, READING_FILE))
    const exchanges = readJson<StepExchange[]>(join(runDir, 'steps', r.step!, EXCHANGES_FILE)) ?? []
    return { step: r.step!, action: r.action ?? '', args: r.args ?? [], ok: r.ok !== false, url: r.url ?? '', ms: r.ms ?? null, requests: r.notable ?? [], meaning: reading?.meaning?.[0] ?? null, forGoal: !since || r.step! > since, saved: savedOf(exchanges) }
  })
}

export async function readStep(folder: string, options: ReadStepOptions): Promise<StepReading> {
  const runDir = dirname(dirname(folder))
  const step = basename(folder)
  const replies = repliesOf(runDir)
  const reply = replies.find((r) => r.step === step) ?? {}
  const snapshot = existsSync(join(folder, 'snapshot.yml')) ? readFileSync(join(folder, 'snapshot.yml'), 'utf8') : ''
  const pageText = snapshot.split('\n').map(redactFieldValue).join('\n')
  const har = readJson<unknown>(join(folder, 'network.har'))
  const platform = options.account.platform
  const exchanges = har ? exchangesOf(har, knownRequests(platform), DOCUMENT_FIELDS[platform] ?? []) : []
  writeFileSync(join(folder, EXCHANGES_FILE), `${JSON.stringify(exchanges, null, 2)}\n`, { mode: 0o600 })
  const taken: StepTaken = {
    step,
    action: reply.action ?? step.replace(/^\d+_/, ''),
    args: reply.args ?? [],
    ok: reply.ok !== false,
    error: reply.error ?? null,
    url: reply.url ?? '',
    title: reply.title ?? '',
    ms: reply.ms ?? null,
    landedMs: reply.landedMs ?? null,
    mouse: mouseOf(folder)
  }
  const bundle = bundleOf({
    goal: options.goal,
    account: { ...options.account, exit: exitOf(runDir) },
    taken,
    pageState: pageStateOf(taken.url, snapshot, { exchanges })?.id ?? null,
    pageText,
    exchanges,
    earlier: earlierOf(runDir, replies, step, options.since ?? null),
    since: options.since ?? null
  })
  const decision = decisionOf(bundle)
  const timeline = exchangeTimeline(exchanges)
  writeFileSync(join(folder, 'exchanges.md'), `# ${step}: internal API, what went in and what came back\n\n${timeline.map((l) => `- ${l}`).join('\n')}\n`, { mode: 0o600 })
  const reading: StepReading = { step, folder, at: (options.now?.() ?? new Date()).toISOString(), decision, asked: false, model: null, answers: [], meaning: [], timeline, inputTokens: 0, error: null }
  if (!decision.decided) {
    const { questions, exchangeKeys } = questionsOf(bundle)
    const image = screenshotOf(folder)
    const state = stateOf(bundle)
    writeFileSync(join(folder, 'readingState.json'), `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 })
    try {
      const response = await (options.decisions ?? createDecisionsClient())({ model: SUBQ_STEP_MODEL, state, questions, ...(image ? { images: [image] } : {}) })
      const answers: StepAnswer[] = Object.entries(response.answers).map(([question, answer]) => ({ question, asked: questions[question]?.instructions ?? '', answer }))
      Object.assign(reading, { asked: true, model: response.model, answers, inputTokens: response.usage?.input_tokens ?? 0, meaning: meaningOf(answers, bundle, exchangeKeys) })
    } catch (error) {
      reading.error = error instanceof Error ? error.message : String(error)
    }
  }
  writeFileSync(join(folder, READING_FILE), `${JSON.stringify(reading, null, 2)}\n`, { mode: 0o600 })
  return reading
}

export function latestReading(runDir: string, step: string): StepReading | null {
  return readJson<StepReading>(join(runDir, 'steps', step, READING_FILE))
}
