import type { StepReading } from '../../../subq/stepReading/types'
import type { GoalEvent, GoalFinding, GoalProgress } from '../types'

export const GOAL_MET_AT = 0.5
export const PERSON_AT = 0.5
export const WENT_WRONG = new Set(['wrongResult', 'stoppedByPlatform', 'unclear'])

function noulOf(reading: StepReading, question: string): number | null {
  const a = reading.answers.find((x) => x.question === question)?.answer
  return a?.type === 'noul' ? a.noul : null
}

function choiceOf(reading: StepReading, question: string): string | null {
  const a = reading.answers.find((x) => x.question === question)?.answer
  return a?.type === 'choice' ? a.choice : null
}

export function foldFindings(events: GoalEvent[]): GoalFinding[] {
  const findings: GoalFinding[] = []
  for (const e of events) {
    if (e.type === 'finding') findings.push({ n: findings.length + 1, at: e.at, step: e.step, point: e.point, evidence: e.evidence, explain: e.explain, fix: null, fixedAt: null })
    else {
      const f = findings.find((x) => x.n === e.n)
      if (f) Object.assign(f, { fix: e.fix, fixedAt: e.at })
    }
  }
  return findings
}

export function wentWrong(reading: StepReading): boolean {
  if (reading.decision.decided) return false
  if (reading.error) return true
  const meaning = choiceOf(reading, 'meaning')
  return meaning !== null && WENT_WRONG.has(meaning)
}

export function evidenceOf(reading: StepReading): string[] {
  if (reading.error) return [`SubQ could not read ${reading.step}: ${reading.error}`]
  const strength = (line: string) => Number(/^contradicts the goal \((\d+)%\)/.exec(line)?.[1] ?? -1)
  const meaning = reading.meaning.filter((l) => l.startsWith('meaning:'))
  const flagged = reading.meaning.filter((l) => strength(l) >= 0).sort((a, b) => strength(b) - strength(a))
  const rest = reading.meaning.filter((l) => !l.startsWith('meaning:') && strength(l) < 0)
  return [...meaning, ...flagged, ...rest].map((line) => `SubQ on ${reading.step}: ${line}`)
}

export function goalProgressOf(goal: string | null, readings: StepReading[], events: GoalEvent[], since: string | null = null): GoalProgress {
  const findings = foldFindings(events)
  const sorted = readings.filter((r) => !since || r.step.localeCompare(since) > 0).sort((a, b) => a.step.localeCompare(b.step))
  const lastStep = sorted.at(-1)?.step ?? null
  const base: GoalProgress = { goal, status: goal ? 'open' : 'none', lastStep, reachedAt: null, needsFinding: null, personNeeded: null, unfixed: [], findings }
  if (!goal) return base
  for (const r of sorted) {
    const met = noulOf(r, 'goalMet')
    if (met !== null && met >= GOAL_MET_AT) {
      base.status = 'reached'
      base.reachedAt = { step: r.step, goalMet: met }
      break
    }
  }
  const latest = sorted.at(-1)
  const person = latest ? noulOf(latest, 'personNeeded') : null
  if (latest && person !== null && person >= PERSON_AT) base.personNeeded = { step: latest.step, text: latest.meaning.join('; ') }
  const recorded = new Set(findings.map((f) => f.step))
  const missing = sorted.filter((r) => wentWrong(r) && !recorded.has(r.step)).at(-1)
  if (missing) base.needsFinding = { step: missing.step, evidence: evidenceOf(missing) }
  base.unfixed = findings.filter((f) => !f.fix).map((f) => f.n)
  return base
}

export function goalMark(account: string, p: GoalProgress): string {
  return `${account}=goal:${p.status}:${p.lastStep ?? '-'}:${p.needsFinding?.step ?? '-'}:${p.findings.length}:${p.unfixed.join('.')}`
}

const quote = (s: string) => `"${s.replace(/"/g, "'")}"`

export function goalLine(account: string, p: GoalProgress): { line: string; blocks: boolean } | null {
  if (p.status === 'none' || !p.goal) return null
  const goal = quote(p.goal)
  if (p.personNeeded) return { line: `${account}: goal ${goal}: SubQ says only a person can clear step ${p.personNeeded.step} (${p.personNeeded.text.slice(0, 300)}). Stop this account and tell matt.`, blocks: false }
  if (p.needsFinding) {
    return {
      line: `${account}: goal ${goal} is not reached, and step ${p.needsFinding.step} went wrong. Before the next step, write its P.E.E. finding: \`log inspect finding --account ${account} --step ${p.needsFinding.step} --point "<the issue, one sentence>" --explain "<why the evidence shows it, and what caused it>"\`. Its evidence is taken from the step's reading: ${p.needsFinding.evidence.slice(0, 4).map(quote).join('; ')}.`,
      blocks: true
    }
  }
  if (p.status === 'open') return { line: `${account}: goal ${goal} is not reached yet (last read step ${p.lastStep ?? 'none'}). Keep going with the next inspect step towards it; do not stop until a step's reading says it is reached (rule 75).`, blocks: true }
  if (p.unfixed.length) {
    return { line: `${account}: goal ${goal} was reached at ${p.reachedAt?.step} (goal met ${Math.round((p.reachedAt?.goalMet ?? 0) * 100)}%). Say how each finding was fixed: ${p.unfixed.map((n) => `\`log inspect finding --account ${account} --fixes ${n} --fix "<what changed>"\``).join(', ')}.`, blocks: true }
  }
  return { line: `${account}: goal ${goal} was reached at ${p.reachedAt?.step} (goal met ${Math.round((p.reachedAt?.goalMet ?? 0) * 100)}%), with ${p.findings.length} finding(s), each fixed.`, blocks: false }
}

export function peeMarkdown(p: GoalProgress, account: string): string {
  const lines = [`# Goal: ${p.goal ?? '(none)'}`, '', `Account ${account}. Status: **${p.status}**${p.reachedAt ? `, reached at ${p.reachedAt.step} (goal met ${Math.round(p.reachedAt.goalMet * 100)}%)` : ''}.`, '']
  if (!p.findings.length) lines.push('No findings.')
  for (const f of p.findings) {
    lines.push(`## Finding ${f.n}, step ${f.step}`, '', `**Point:** ${f.point}`, '', '**Evidence:**', '', ...f.evidence.map((e) => `> ${e}`), '', `**Explain:** ${f.explain}`, '', `**Fix:** ${f.fix ?? '_not fixed yet_'}`, '')
  }
  return `${lines.join('\n')}\n`
}
