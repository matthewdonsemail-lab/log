import { describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { hookReply } from '../../agentHooks/pageState/index'
import { runCli } from '../../cli/runner/index'
import type { StepReading } from '../../subq/stepReading/types'
import { marketplaceFixture } from '../../twenty/graphql/helpers/marketplaceFixture'
import { clearCurrentInspect, goalLine, goalMark, goalProgressOf, peeMarkdown, readOpenBrowsers, writeCurrentInspect } from './index'
import type { GoalEvent } from './index'

process.env.LOG_INSPECT_CURRENT = join(mkdtempSync(join(tmpdir(), 'logInspectGoal')), 'current.json')

const GOAL = 'Set the Marketplace location to Bethlehem, Pennsylvania'

function reading(step: string, goalMet: number, meaning: string, person = 0): StepReading {
  return {
    step,
    folder: `/runs/x/steps/${step}`,
    at: '2026-10-23T10:00:00.000Z',
    decision: { decided: false, why: ['no known state confirms whether the goal was met'] },
    asked: true,
    model: 'subq-snap-1.1',
    answers: [
      { question: 'goalMet', asked: 'Did this step reach the goal?', answer: { type: 'noul', noul: goalMet } },
      { question: 'personNeeded', asked: 'Only a person?', answer: { type: 'noul', noul: person } },
      { question: 'meaning', asked: 'What does it mean?', answer: { type: 'choice', choice: meaning, probabilities: { [meaning]: 0.93 }, confidence: 0.9 } }
    ],
    meaning: [`meaning: ${meaning} (93%)`, 'contradicts the goal (61%): +12.45s POST MarketplaceSearchAddressDataSourceQuery 200 (0.73s) | sent: changedSinceLastCall.params.query="Bethlehem, PA" | answered: edges[0].single_line_address="Bethlehem, West Bank"'],
    timeline: [],
    inputTokens: 49044,
    error: null
  }
}

const WRONG = reading('04_setlocationBethlehemPa', 0.06, 'wrongResult')
const MORE = reading('05_snapshot', 0.2, 'needsMoreSteps')
const REACHED = reading('12_selllocation', 0.97, 'goalReached')
const finding: GoalEvent = { type: 'finding', at: '2026-10-23T10:01:00.000Z', step: '04_setlocationBethlehemPa', point: 'Typing "Bethlehem, PA" saved the West Bank.', evidence: ['SubQ on 04: contradicts the goal (61%)'], explain: 'Facebook matched "PA" to the West Bank, and the account was already in Lima.' }

describe('the goal of an inspect session (rule 75)', () => {
  test('a goal no reading has met is open; a step that went wrong needs its P.E.E. finding', () => {
    const p = goalProgressOf(GOAL, [WRONG, MORE], [])
    expect(p.status).toBe('open')
    expect(p.needsFinding?.step).toBe('04_setlocationBethlehemPa')
    expect(p.needsFinding?.evidence[1]).toContain('Bethlehem, West Bank')
    const note = goalLine('bethlehem', p)!
    expect(note.blocks).toBe(true)
    expect(note.line).toContain('write its P.E.E. finding')
    expect(note.line).toContain('log inspect finding --account bethlehem --step 04_setlocationBethlehemPa --point')
  })

  test('a step that only needs more steps asks for no finding, and the goal stays open until a reading says it is met', () => {
    const p = goalProgressOf(GOAL, [MORE], [])
    expect(p.needsFinding).toBeNull()
    expect(goalLine('bethlehem', p)!.line).toContain('is not reached yet')
    const withFinding = goalProgressOf(GOAL, [WRONG, MORE], [finding])
    expect(withFinding.needsFinding).toBeNull()
    expect(withFinding.unfixed).toEqual([1])
  })

  test('a goal set later counts only the readings after it was set, so a step that reached an earlier goal does not reach it', () => {
    const later = goalProgressOf(GOAL, [REACHED, MORE], [], '12_selllocation')
    expect(later.status).toBe('open')
    expect(later.reachedAt).toBeNull()
    expect(goalProgressOf(GOAL, [REACHED, MORE], []).status).toBe('reached')
  })

  test('once reached, every finding must say how it was fixed; then the goal stops holding the turn', () => {
    const reached = goalProgressOf(GOAL, [WRONG, MORE, REACHED], [finding])
    expect(reached.status).toBe('reached')
    expect(reached.reachedAt).toEqual({ step: '12_selllocation', goalMet: 0.97 })
    expect(goalLine('bethlehem', reached)!.line).toContain('--fixes 1 --fix')
    expect(goalLine('bethlehem', reached)!.blocks).toBe(true)
    const fixed = goalProgressOf(GOAL, [WRONG, MORE, REACHED], [finding, { type: 'fix', at: '2026-10-23T10:20:00.000Z', n: 1, fix: 'Typed "Bethlehem, Pennsylvania"; rule 72 refuses an abbreviation.' }])
    expect(goalLine('bethlehem', fixed)).toEqual({ line: expect.stringContaining('was reached at 12_selllocation (goal met 97%), with 1 finding(s), each fixed') as unknown as string, blocks: false })
    const md = peeMarkdown(fixed, 'bethlehem')
    expect(md).toContain('**Point:** Typing "Bethlehem, PA" saved the West Bank.')
    expect(md).toContain('> SubQ on 04: contradicts the goal (61%)')
    expect(md).toContain('**Explain:** Facebook matched "PA"')
    expect(md).toContain('**Fix:** Typed "Bethlehem, Pennsylvania"')
  })

  test('what only a person can clear never holds the turn; it is said to matt', () => {
    const p = goalProgressOf(GOAL, [reading('07_click', 0.1, 'stoppedByPlatform', 0.9)], [])
    const note = goalLine('bethlehem', p)!
    expect(note.blocks).toBe(false)
    expect(note.line).toContain('tell matt')
  })

  test('the Stop hook holds the turn while the goal is open, once per unchanged state', () => {
    const goal = goalProgressOf(GOAL, [WRONG], [])
    const at = { account: 'bethlehem', step: '04_setlocationBethlehemPa', url: 'https://www.facebook.com/marketplace/', text: '', failed: null, goal }
    const first = hookReply('Stop', [at], { seen: {}, stopBlocked: null })
    expect(first.output).toMatchObject({ decision: 'block' })
    expect(String((first.output as { reason: string }).reason)).toContain('write its P.E.E. finding')
    const again = hookReply('Stop', [at], first.memory, true)
    expect(again.output).toBeNull()
    const moved = hookReply('Stop', [{ ...at, goal: goalProgressOf(GOAL, [WRONG], [finding]) }], first.memory, true)
    expect(moved.output).toMatchObject({ decision: 'block' })
    const done = goalProgressOf(GOAL, [WRONG, REACHED], [finding, { type: 'fix', at: 'x', n: 1, fix: 'written out' }])
    expect(hookReply('Stop', [{ ...at, goal: done }], { seen: {}, stopBlocked: null }).output).toBeNull()
    const post = hookReply('PostToolUse', [at], { seen: {}, stopBlocked: null })
    expect(JSON.stringify(post.output)).toContain('is not reached')
    expect(hookReply('PostToolUse', [at], post.memory).output).toBeNull()
    expect(goalMark('bethlehem', goal)).toBe('bethlehem=goal:open:04_setlocationBethlehemPa:04_setlocationBethlehemPa:0:')
  })
})

describe('log inspect goal and finding', () => {
  test('a finding is written from the step reading, then fixed, and the P.E.E. file and the hook follow', async () => {
    const runDir = mkdtempSync(join(tmpdir(), 'goalRun-'))
    const stepDir = join(runDir, 'steps', '04_setlocationBethlehemPa')
    mkdirSync(stepDir, { recursive: true })
    writeFileSync(join(stepDir, 'reading.json'), JSON.stringify(WRONG))
    writeCurrentInspect({ account: 'galwayOne', runDir, commandsPath: 'c', repliesPath: join(runDir, 'replies.jsonl'), startedAt: '2026-10-23T09:00:00.000Z', goal: GOAL })
    const out: string[] = []
    const err: string[] = []
    const run = (argv: string[]) => runCli(argv, { twenty: marketplaceFixture(), out: (l) => out.push(l), err: (l) => err.push(l), now: () => new Date('2026-10-23T10:05:00.000Z') })
    try {
      expect(await run(['inspect', 'goal', '--account', 'galwayOne'])).toBe(0)
      expect(out.join('\n')).toContain('step 04_setlocationBethlehemPa went wrong')
      expect(await run(['inspect', 'finding', '--account', 'galwayOne', '--point', 'Typing "Bethlehem, PA" saved the West Bank.'])).toBe(1)
      expect(err.join('\n')).toContain('--explain')
      expect(await run(['inspect', 'finding', '--account', 'galwayOne', '--point', 'Typing "Bethlehem, PA" saved the West Bank.', '--explain', 'PA matched the West Bank.', '--evidence', 'The page read Location: Bethlehem, West Bank'])).toBe(0)
      expect(out.join('\n')).toContain('Finding 1 written for 04_setlocationBethlehemPa')
      const md = readFileSync(join(runDir, 'goalFindings.md'), 'utf8')
      expect(md).toContain('> SubQ on 04_setlocationBethlehemPa: meaning: wrongResult (93%)')
      expect(md).toContain('> The page read Location: Bethlehem, West Bank')
      expect(md).toContain('**Fix:** _not fixed yet_')
      expect(await run(['inspect', 'finding', '--account', 'galwayOne', '--fixes', '1', '--fix', 'Typed the state out in full (rule 72).'])).toBe(0)
      expect(readFileSync(join(runDir, 'goalFindings.md'), 'utf8')).toContain('**Fix:** Typed the state out in full (rule 72).')
      const browser = readOpenBrowsers().find((b) => b.account === 'galwayOne')
      expect(browser?.goal?.status).toBe('open')
      expect(browser?.goal?.findings[0].fix).toBe('Typed the state out in full (rule 72).')
      expect(existsSync(join(runDir, 'goalFindings.jsonl'))).toBe(true)
    } finally {
      clearCurrentInspect(undefined, 'galwayOne')
      rmSync(runDir, { recursive: true, force: true })
    }
  })
})
