import type { ActivityStep, StepOutcome } from '../types'

/** What the page showed after a step: its URL and its snapshot. */
export interface StepReply {
  ok: boolean
  error?: string
  url?: string
  snapshot?: string
  folder?: string
  /** A tab the step's click opened (Reels opens the creator's profile in one). */
  openedTab?: string
  /** `nextPost`: the post it brought into view (null: none left, it scrolled for more). */
  post?: { heading: string; text: string; images: string[]; words: number; liked: boolean } | null
}

/** Whether the snapshot shows `role "name"` (its accessibility tree line). Pure. */
function shows(snapshot: string, role: string, name: string): boolean {
  const quoted = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^\\s*-\\s+${role}\\s+"${quoted}"`, 'm').test(snapshot)
}

/**
 * Did the step do what it should? The reply (the page after it) against the
 * step's expectation, with the URL before it. The issue says exactly what
 * didn't happen, so the step is fixed from it (rule 25). Pure.
 */
export function checkStep(step: ActivityStep, before: string | null, reply: StepReply): StepOutcome {
  const base = { id: step.id, url: reply.url, folder: reply.folder }
  if (!reply.ok) return { ...base, ok: false, error: reply.error ?? 'the step failed' }
  const expect = step.expect
  if (!expect) return { ...base, ok: true }
  const url = reply.url ?? ''
  // A click that opened a tab changed where the person is, though this tab's URL didn't.
  if (expect.urlChanges && before !== null && url === before && !reply.openedTab) return { ...base, ok: false, issue: `the URL didn't change (still ${url})` }
  if (expect.urlMatches && !new RegExp(expect.urlMatches).test(url)) return { ...base, ok: false, issue: `the page is ${url || 'unknown'}, not ${expect.urlMatches}` }
  const snapshot = reply.snapshot ?? ''
  if (expect.shows && !shows(snapshot, expect.shows.role, expect.shows.name)) return { ...base, ok: false, issue: `no ${expect.shows.role} "${expect.shows.name}" after it` }
  if (expect.hides && shows(snapshot, expect.hides.role, expect.hides.name)) return { ...base, ok: false, issue: `${expect.hides.role} "${expect.hides.name}" is still there` }
  return { ...base, ok: true }
}
