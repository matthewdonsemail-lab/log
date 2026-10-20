import type { JoinAnswer, JoinDraft, JoinOptions } from '../types'
import { hashQuestionSet } from './submission'

/**
 * One step of the Clack stepper (`log join group --answer`), built from the
 * join options, never from page text. Each Facebook question type has its
 * prompt: PARAGRAPH → text, CHECKBOXES → multiselect over its options. The
 * rules are shown, then agreed with a confirm. A type no recording has shown
 * is listed and skipped, not guessed (rule 29).
 */
export type StepperStep =
  | { kind: 'intro'; message: string }
  | { kind: 'text'; questionId: string; message: string; initial: string }
  | { kind: 'multiselect'; questionId: string; message: string; options: { value: string; label: string }[]; initial: string[] }
  | { kind: 'rules'; message: string; rules: string[] }
  | { kind: 'agree'; message: string; initial: boolean }
  | { kind: 'skipped'; questionId: string; message: string }

/** The steps for a group's join options, with a saved draft's answers as the starting values. Pure. */
export function stepsFor(options: JoinOptions, draft: JoinDraft | null): StepperStep[] {
  // A draft for another question set starts from blanks (the hackathon's re-ask on a changed hash).
  const answers = draft && draft.questionsHash === questionsHashOf(options) ? draft.answers : {}
  const steps: StepperStep[] = []
  const words = [options.dialog?.title, options.dialog?.headline, options.dialog?.body ?? options.dialog?.explanation].filter(Boolean)
  steps.push({ kind: 'intro', message: words.join('\n') || `${options.questions.length} question(s) from the group's admins` })
  options.questions.forEach((q, i) => {
    const message = `${i + 1}/${options.questions.length} (${q.stage}) ${q.prompt}`
    if (q.type === 'paragraph') steps.push({ kind: 'text', questionId: q.id, message, initial: typeof answers[q.id] === 'string' ? (answers[q.id] as string) : '' })
    else if (q.type === 'checkboxes') {
      steps.push({ kind: 'multiselect', questionId: q.id, message, options: q.options.map((o) => ({ value: o.id, label: o.label })), initial: Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [] })
    } else steps.push({ kind: 'skipped', questionId: q.id, message: `${message}  [${q.rawType}: not recorded yet, answer it in the browser]` })
  })
  if (options.rulesAgreementRequired) {
    steps.push({ kind: 'rules', message: 'Group rules from the admins', rules: options.rules.map((r, i) => `${i + 1}. ${r.title}${r.description ? ` — ${r.description}` : ''}`) })
    steps.push({ kind: 'agree', message: 'I agree to the group rules', initial: draft?.rulesAgreed ?? false })
  }
  return steps
}

/** The question set's hash, by Facebook's question ids. Pure. */
export function questionsHashOf(options: JoinOptions): string {
  return hashQuestionSet(options.questions.map((q) => `${q.id}:${q.prompt}`))
}

/** The stepper's answers → the draft kept in joinSubmission.draft. Pure. */
export function draftFrom(options: JoinOptions, answers: Record<string, JoinAnswer>, rulesAgreed: boolean, at: Date): JoinDraft {
  return { answers, rulesAgreed, questionsHash: questionsHashOf(options), savedAt: at.toISOString() }
}

/** Every question answered (text not blank, at least one box ticked) and the rules agreed when asked. Pure. */
export function draftComplete(options: JoinOptions, draft: JoinDraft | null): { complete: boolean; missing: string[] } {
  if (!draft || draft.questionsHash !== questionsHashOf(options)) return { complete: false, missing: options.questions.map((q) => q.prompt) }
  const missing = options.questions
    .filter((q) => q.type !== 'notRecorded')
    .filter((q) => {
      const a = draft.answers[q.id]
      return Array.isArray(a) ? a.length === 0 : !a || !a.trim()
    })
    .map((q) => q.prompt)
  if (options.rulesAgreementRequired && !draft.rulesAgreed) missing.push('I agree to the group rules')
  return { complete: missing.length === 0, missing }
}
