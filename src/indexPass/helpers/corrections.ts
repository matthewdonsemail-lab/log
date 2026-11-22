import type { Database } from 'bun:sqlite'
import { getState, putState } from '../../storage/state/index'
import { SCREEN_KINDS } from '../../people/facts/types'
import { PASS_TRAIN_EXAMPLES } from '../types'

export const CORRECTIONS_SCOPE = 'factCorrections' as const

export const CORRECTIONS_KEY = 'examples'

export const CORRECTIONS_KEPT = 4000

export const NO_FACT_LABEL = 'none'

export interface Correction {
  text: string
  label: string
  kind: string
  from: 'screen' | 'decider' | 'owner'
  messageKey?: string
  at: Date
}

export interface Example {
  text: string
  label: string
  from: Correction['from']
}

const labels: ReadonlySet<string> = new Set([...SCREEN_KINDS, NO_FACT_LABEL])

const keyOf = (text: string): string => text.replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 200)

export function correctionsOf(handle: Database): Correction[] {
  return getState<Correction[]>(CORRECTIONS_SCOPE, CORRECTIONS_KEY, {}, handle)?.body ?? []
}

export interface CorrectionBook {
  add: (example: Correction) => void
  flush: (now?: Date) => number
  size: () => number
}

export function correctionBook(handle: Database): CorrectionBook {
  let held: Correction[] | null = null
  let dirty = false
  const load = (): Correction[] => {
    held ??= correctionsOf(handle)
    return held
  }
  return {
    size: () => load().length,
    add(example: Correction) {
      if (!labels.has(example.label) || example.text.trim().length < 6) return
      const list = load()
      const key = keyOf(example.text)
      const at = list.findIndex((c) => keyOf(c.text) === key)
      const older = at >= 0 ? list[at] : null
      if (older && older.label === example.label) return
      if (older && older.from === 'owner' && example.from !== 'owner') return
      const next = { ...example, text: example.text.replace(/\s+/g, ' ').trim() }
      if (at >= 0) list[at] = next
      else list.push(next)
      dirty = true
    },
    flush(now: Date = new Date()) {
      const list = load()
      if (!dirty) return list.length
      const kept = list.slice(-CORRECTIONS_KEPT)
      putState(CORRECTIONS_SCOPE, CORRECTIONS_KEY, kept, now.getTime(), handle)
      held = kept
      dirty = false
      return kept.length
    },
  }
}

export function keepCorrection(handle: Database, example: Correction, now: Date = new Date()): void {
  const book = correctionBook(handle)
  book.add(example)
  book.flush(now)
}

interface CandidateRow {
  text: string
  kind: string
  decided: string | null
}

export function examplesOf(handle: Database, limit: number = PASS_TRAIN_EXAMPLES): Example[] {
  const byKey = new Map<string, Example>()
  for (const correction of correctionsOf(handle)) {
    const key = keyOf(correction.text)
    if (!byKey.has(key) || correction.from === 'owner') byKey.set(key, { text: correction.text.replace(/\s+/g, ' ').trim(), label: correction.label, from: correction.from })
  }
  const rows = handle.prepare("SELECT m.text AS text, f.kind AS kind, f.decided AS decided FROM factCandidates f JOIN messages m ON m.messageKey = f.messageKey WHERE f.decided IS NOT NULL AND m.text <> '' ORDER BY m.sentAtMs DESC LIMIT ?").all(limit * 4) as CandidateRow[]
  for (const row of rows) {
    const key = keyOf(row.text)
    if (byKey.has(key)) continue
    const label = row.decided === 'ADD' || row.decided === 'SUPERSEDE' ? row.kind : NO_FACT_LABEL
    if (!labels.has(label)) continue
    byKey.set(key, { text: row.text.replace(/\s+/g, ' ').trim(), label, from: 'decider' })
  }
  return [...byKey.values()].slice(0, limit)
}

export function accuracyOf(examples: readonly { label: string; guess: string }[]): number {
  if (!examples.length) return 0
  return +(examples.filter((e) => e.label === e.guess).length / examples.length).toFixed(3)
}
