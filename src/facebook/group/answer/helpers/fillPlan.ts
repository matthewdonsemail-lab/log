import type { JoinDraft, JoinOptions } from '../../join/types'
import type { FillPlan, FillStep } from '../types'

const squash = (text: string) => text.replace(/\s+/g, ' ').trim()
const indent = (line: string) => /^(\s*)/.exec(line)![1].length
const refOf = (line: string) => /\[ref=(e\d+)\]/.exec(line)?.[1] ?? null
const nameOf = (line: string) => /^\s*-\s+\w+\s+"([^"]*)"/.exec(line)?.[1] ?? null
const textOf = (line: string) => /^\s*-\s+(?:generic|text)(?:\s+\[[^\]]*\])*:\s*(.+)$/.exec(line)?.[1]?.trim().replace(/^"(.*)"$/, '$1') ?? null

export function planFill(options: JoinOptions, draft: JoinDraft, snapshot: string): FillPlan {
  const lines = snapshot.split(/\r?\n/)
  const start = lines.findIndex((l) => /^\s*-\s+dialog\b/.test(l))
  const plan: FillPlan = { steps: [], missing: [], submit: null }
  if (start === -1) {
    plan.missing.push('the dialog (not open)')
    return plan
  }
  const depth = indent(lines[start])
  const body: string[] = []
  for (let i = start + 1; i < lines.length && indent(lines[i]) > depth; i++) body.push(lines[i])

  const prompts = options.questions.map((q) => squash(q.prompt))
  const owner: (number | null)[] = []
  let current: number | null = null
  for (const line of body) {
    const text = textOf(line)
    const at = text ? prompts.indexOf(squash(text)) : -1
    if (at !== -1) current = at
    if (/^\s*-\s+checkbox\s+"I agree to the group rules"/.test(line)) current = null
    owner.push(current)
  }

  options.questions.forEach((q, qi) => {
    const answer = draft.answers[q.id]
    const own = body.filter((_, i) => owner[i] === qi)
    if (q.type === 'paragraph') {
      const box = own.find((l) => /^\s*-\s+textbox\b/.test(l))
      const ref = box ? refOf(box) : null
      if (!ref || typeof answer !== 'string' || !answer.trim()) {
        plan.missing.push(q.prompt)
        return
      }
      plan.steps.push({ stepperStep: `question:${q.id}`, label: `click into "${squash(q.prompt).slice(0, 60)}"`, action: 'click', ref })
      plan.steps.push({ stepperStep: `question:${q.id}`, label: `type the answer to "${squash(q.prompt).slice(0, 60)}"`, action: 'type', ref, text: answer.trim() })
      return
    }
    if (q.type === 'checkboxes') {
      const ticked = Array.isArray(answer) ? answer : []
      if (!ticked.length) {
        plan.missing.push(q.prompt)
        return
      }
      for (const optionId of ticked) {
        const label = q.options.find((o) => o.id === optionId)?.label
        const box = label ? own.find((l) => /^\s*-\s+checkbox\b/.test(l) && nameOf(l) === label) : undefined
        const ref = box ? refOf(box) : null
        if (!ref || !label) plan.missing.push(`${q.prompt}: ${label ?? optionId}`)
        else plan.steps.push({ stepperStep: `question:${q.id}`, label: `tick "${label}"`, action: 'click', ref })
      }
      return
    }
    plan.missing.push(`${q.prompt} (${q.rawType}: not recorded yet)`)
  })

  if (options.rulesAgreementRequired) {
    const box = body.find((l) => /^\s*-\s+checkbox\s+"I agree to the group rules"/.test(l))
    const ref = box ? refOf(box) : null
    if (!draft.rulesAgreed) plan.missing.push('I agree to the group rules (not agreed in the draft)')
    else if (!ref) plan.missing.push('I agree to the group rules')
    else plan.steps.push({ stepperStep: 'agree', label: 'tick "I agree to the group rules"', action: 'click', ref })
  }

  const submit = body.find((l) => /^\s*-\s+button\s+"Submit"/.test(l))
  const submitRef = submit ? refOf(submit) : null
  if (submitRef) plan.submit = { ref: submitRef, enabled: !/\[disabled\]/.test(submit!) }
  else plan.missing.push('the Submit button')
  return plan
}

export function describePlan(plan: FillPlan): string[] {
  return [...plan.steps.map((s: FillStep, i) => `${i + 1}. [${s.stepperStep}] ${s.label} (${s.action} ${s.ref})`), ...(plan.submit ? [`${plan.steps.length + 1}. [submit] press Submit (click ${plan.submit.ref}), only with --submit`] : []), ...plan.missing.map((m) => `   missing: ${m}`)]
}
