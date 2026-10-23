import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pageStateOf, resolveCallOf, snapshotCall } from '../../flow/helpers/pageState'
import { loudText } from '../../../subq/stepReading/helpers/loud'
import type { StepReading } from '../../../subq/stepReading/types'
import { goalProgress, openInspects } from '../client'
import type { BrowserAt, BrowserView } from '../types'

interface Reply {
  ok?: boolean
  error?: string
  step?: string
  url?: string
}

function lastReply(path: string): Reply | null {
  if (!existsSync(path)) return null
  for (const line of readFileSync(path, 'utf8').trim().split('\n').reverse()) {
    try {
      const reply = (JSON.parse(line) as { result?: Reply }).result
      if (reply?.step) return reply
    } catch {
    }
  }
  return null
}

export function readingAt(path: string): { decided: boolean; text: string } | null {
  if (!existsSync(path)) return null
  try {
    const reading = JSON.parse(readFileSync(path, 'utf8')) as StepReading
    return { decided: reading.decision.decided, text: loudText(reading) }
  } catch {
    return null
  }
}

export function readOpenBrowsers(): BrowserAt[] {
  const browsers: BrowserAt[] = []
  for (const session of openInspects()) {
    const stepsDir = join(session.runDir, 'steps')
    const reply = lastReply(session.repliesPath ?? join(session.runDir, 'replies.jsonl'))
    const folders = existsSync(stepsDir) ? readdirSync(stepsDir).filter((d) => /^\d+_/.test(d)).sort() : []
    const step = reply?.step ?? folders.at(-1)
    if (!step) continue
    const withSnapshot = [step, ...folders.slice().reverse()].find((d) => existsSync(join(stepsDir, d, 'snapshot.yml')))
    const text = withSnapshot ? readFileSync(join(stepsDir, withSnapshot, 'snapshot.yml'), 'utf8') : ''
    browsers.push({ account: session.account, step, url: reply?.url ?? '', text, failed: reply && reply.ok === false ? (reply.error ?? 'failed') : null, messengerPin: session.messengerPin === true, reading: readingAt(join(stepsDir, step, 'reading.json')), goal: session.goal ? goalProgress(session) : null })
  }
  return browsers
}

export function browserView(at: BrowserAt): BrowserView {
  const state = pageStateOf(at.url, at.text, { messengerPin: at.messengerPin })
  const base = { account: at.account, step: at.step, url: at.url, failed: at.failed }
  if (state) {
    return {
      ...base,
      state: { id: state.id, what: state.what, person: state.person },
      next: resolveCallOf(state, at),
      needsMatt: state.person ? `${at.account}: ${state.what}. ${state.resolve}` : null
    }
  }
  return { ...base, state: null, next: at.failed ? snapshotCall(at.account) : null, needsMatt: null }
}

export function browserViews(read: () => BrowserAt[] = readOpenBrowsers): BrowserView[] {
  return read().map(browserView)
}
