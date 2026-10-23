import type { ActivityStep, StepOutcome } from '../types'

export interface StepReply {
  ok: boolean
  error?: string
  url?: string
  snapshot?: string
  folder?: string
  openedTab?: string
  post?: { heading: string; text: string; images: string[]; words: number; liked: boolean } | null
}

function shows(snapshot: string, role: string, name: string): boolean {
  const quoted = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^\\s*-\\s+${role}\\s+"${quoted}"`, 'm').test(snapshot)
}

export function checkStep(step: ActivityStep, before: string | null, reply: StepReply): StepOutcome {
  const base = { id: step.id, url: reply.url, folder: reply.folder }
  if (!reply.ok && step.optional) return { ...base, ok: true, skipped: `nothing to act on (${reply.error ?? 'the step failed'})` }
  if (!reply.ok) return { ...base, ok: false, error: reply.error ?? 'the step failed' }
  const expect = step.expect
  if (!expect) return { ...base, ok: true }
  const url = reply.url ?? ''
  if (expect.urlChanges && before !== null && url === before && !reply.openedTab) return { ...base, ok: false, issue: `the URL didn't change (still ${url})` }
  if (expect.urlMatches && !new RegExp(expect.urlMatches).test(url)) return { ...base, ok: false, issue: `the page is ${url || 'unknown'}, not ${expect.urlMatches}` }
  const snapshot = reply.snapshot ?? ''
  if (expect.shows && !shows(snapshot, expect.shows.role, expect.shows.name)) return { ...base, ok: false, issue: `no ${expect.shows.role} "${expect.shows.name}" after it` }
  if (expect.hides && shows(snapshot, expect.hides.role, expect.hides.name)) return { ...base, ok: false, issue: `${expect.hides.role} "${expect.hides.name}" is still there` }
  return { ...base, ok: true }
}
