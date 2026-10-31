import type { FormPhase, GroupJoinSubmission, GroupStepReply, JoinDialog, SubmissionEntry } from '../types'
import { FORM_PHASES } from '../types'

export function emptySubmission(): GroupJoinSubmission {
  return {
    formPhase: 'idle',
    dialogTitle: null,
    dialogNotes: [],
    questions: [],
    agreements: [],
    rules: [],
    submitEnabled: null,
    options: null,
    inference: null,
    draft: null,
    application: null,
    questionsHash: null,
    questionsScrapedAt: null,
    draftAnswers: [],
    answers: [],
    answersComplete: false,
    submittedAt: null,
    lastActivityAt: null,
    history: []
  }
}

export function hashQuestionSet(questions: string[]): string {
  let hash = 5381
  const text = questions.join('\u0000')
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0
  return hash.toString(16).padStart(8, '0')
}

export function answersComplete(questions: string[], answers: string[]): boolean {
  if (questions.length === 0) return true
  return answers.length === questions.length && answers.every((a) => a.trim() !== '')
}

export function readSubmission(raw: unknown): GroupJoinSubmission {
  const base = emptySubmission()
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Record<string, unknown>
  const strings = (v: unknown) => (Array.isArray(v) ? v.map(String) : [])
  const text = (v: unknown) => (typeof v === 'string' && v ? v : null)
  return {
    formPhase: (FORM_PHASES as readonly string[]).includes(String(r.formPhase)) ? (r.formPhase as FormPhase) : base.formPhase,
    dialogTitle: text(r.dialogTitle),
    dialogNotes: strings(r.dialogNotes),
    questions: strings(r.questions),
    agreements: strings(r.agreements),
    rules: strings(r.rules),
    submitEnabled: typeof r.submitEnabled === 'boolean' ? r.submitEnabled : null,
    options: r.options && typeof r.options === 'object' ? (r.options as GroupJoinSubmission['options']) : null,
    inference: r.inference && typeof r.inference === 'object' ? (r.inference as GroupJoinSubmission['inference']) : null,
    draft: r.draft && typeof r.draft === 'object' ? (r.draft as GroupJoinSubmission['draft']) : null,
    application: r.application && typeof r.application === 'object' ? (r.application as GroupJoinSubmission['application']) : null,
    questionsHash: text(r.questionsHash),
    questionsScrapedAt: text(r.questionsScrapedAt),
    draftAnswers: strings(r.draftAnswers),
    answers: strings(r.answers),
    answersComplete: r.answersComplete === true,
    submittedAt: text(r.submittedAt),
    lastActivityAt: text(r.lastActivityAt),
    history: Array.isArray(r.history) ? (r.history as SubmissionEntry[]) : []
  }
}

const indent = (line: string) => /^(\s*)/.exec(line)![1].length
const quoted = (line: string) => /^\s*-\s+\w+\s+"([^"]*)"/.exec(line)?.[1] ?? null
const textOf = (line: string) => {
  const t = /^\s*-\s+(?:generic|text)(?:\s+\[[^\]]*\])*:\s*(.+)$/.exec(line)?.[1]?.trim().replace(/^"(.*)"$/, '$1') ?? null
  return t && t !== '<redacted>' ? t : null
}

export function readJoinDialog(reply: GroupStepReply): JoinDialog | null {
  const lines = (reply.snapshot ?? '').split(/\r?\n/)
  const start = lines.findIndex((l) => /^\s*-\s+dialog\b/.test(l))
  if (start === -1) return null
  const depth = indent(lines[start])
  const body: string[] = []
  for (let i = start + 1; i < lines.length && indent(lines[i]) > depth; i++) body.push(lines[i])
  const dialog: JoinDialog = { title: quoted(lines[start]) ?? '', notes: [], questions: [], agreements: [], rules: [], submitEnabled: null }
  const seen = new Set<string>([dialog.title])
  body.forEach((line, i) => {
    if (/^\s*-\s+textbox\b/.test(line)) {
      const name = quoted(line)
      if (name && name !== '<redacted>') dialog.questions.push(name)
      return
    }
    if (/^\s*-\s+checkbox\b/.test(line)) {
      const name = quoted(line)
      if (name) {
        dialog.agreements.push(name)
        seen.add(name)
      }
      return
    }
    if (/^\s*-\s+button\b/.test(line)) {
      const label = quoted(line) ?? body.slice(i + 1).map(textOf).find(Boolean) ?? ''
      if (/^submit$/i.test(label)) dialog.submitEnabled = !/\[disabled\]/.test(line)
      return
    }
    const text = textOf(line)
    if (!text || seen.has(text)) return
    if (/^\d+$/.test(text)) {
      const title = body.slice(i + 1).map(textOf).find(Boolean)
      if (title) {
        dialog.rules.push(`${text}. ${title}`)
        seen.add(title)
      }
      return
    }
    if (!/^(Not Now|Submit|See more)$/i.test(text)) {
      dialog.notes.push(text)
      seen.add(text)
    }
  })
  return dialog
}

export function patchSubmission(
  current: GroupJoinSubmission,
  patch: Partial<Omit<GroupJoinSubmission, 'history'>>,
  entry: Omit<SubmissionEntry, 'formPhase'>
): GroupJoinSubmission {
  const next: GroupJoinSubmission = { ...current, ...patch, lastActivityAt: entry.at }
  if (patch.questions) {
    next.questionsHash = hashQuestionSet(patch.questions)
    next.questionsScrapedAt = entry.at
    if (current.questionsHash && current.questionsHash !== next.questionsHash) next.draftAnswers = patch.draftAnswers ?? []
  }
  next.answersComplete = answersComplete(next.questions, next.answers)
  next.history = [...current.history, { ...entry, formPhase: next.formPhase }]
  return next
}
