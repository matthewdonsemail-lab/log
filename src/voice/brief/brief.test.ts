import { describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { DecisionRequest } from '../../subq/decisions/index'
import { attachedOf, briefFailedParts, readBrief } from './index'

const answering = (scores: Record<string, number>) => {
  const asked: DecisionRequest[] = []
  const decide = async (request: DecisionRequest) => {
    asked.push(request)
    return { model: 'subq-snap-1.1', answers: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, { type: 'noul' as const, noul: v }])), usage: { input_tokens: 1, output_tokens: 1 } }
  }
  return { asked, decide }
}

describe('a task is gated as a brief, not as casual chat', () => {
  test('a brief that says what, why, what done is, by when and how to ask passes, and SubQ reads the attached files with it', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'brief'))
    const guide = join(dir, 'GUIDE.md')
    writeFileSync(guide, '# the guide\nyour task for today')
    const { asked, decide } = answering({ clear: 0.9, why: 0.85, doneWhen: 0.8, kind: 0.9, steerable: 0.75 })
    const reading = await readBrief({ to: 'jdbaiii', text: 'here is the guide', attached: attachedOf([guide, join(dir, 'sheet.png')]) }, decide)
    expect(reading.pass).toBe(true)
    const state = asked[0].state as Record<string, unknown>
    expect(state.attachedFiles).toEqual([{ name: 'GUIDE.md', text: '# the guide\nyour task for today' }, { name: 'sheet.png', text: null }])
    expect(Object.keys(asked[0].questions as object)).toEqual(['clear', 'why', 'doneWhen', 'kind', 'steerable'])
  })

  test('a curt order with no deadline fails, and says which parts are missing', async () => {
    const { decide } = answering({ clear: 0.8, why: 0.3, doneWhen: 0.2, kind: 0.4, steerable: 0.8 })
    const reading = await readBrief({ to: 'jdbaiii', text: 'do the aeo stuff' }, decide)
    expect(reading.pass).toBe(false)
    const parts = briefFailedParts(reading).join('\n')
    expect(parts).toContain('why 0.30')
    expect(parts).toContain('doneWhen 0.20')
    expect(parts).toContain('kind 0.40')
    expect(parts).not.toContain('clear')
  })
})
