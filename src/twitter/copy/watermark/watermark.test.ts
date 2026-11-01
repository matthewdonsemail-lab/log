import { describe, expect, test } from 'bun:test'
import { planSend } from '../../post/send/index'
import { watermarkLine, watermarkReadingOf } from './index'

describe('what a Claude-made message can carry, read before it is sent', () => {
  test('plain house-style copy is clean and says the statistical watermark is unknown', () => {
    const reading = watermarkReadingOf('yo lad made a new free tool')
    expect(reading.level).toBe('clean')
    expect(reading.statistical).toBe('unknown')
    expect(watermarkLine(reading)).toContain("Claude's statistical watermark: unknown")
  })

  test('a hidden zero-width character is an artifact, and the send is refused', () => {
    const text = 'yo lad​ made a new free tool'
    expect(watermarkReadingOf(text).level).toBe('artifacts')
    const plan = planSend({ action: 'dm', userId: '1', text, approvedBy: 'matt', live: true, skipStyleCheck: true })
    expect(plan.ok).toBe(false)
    if (!plan.ok) expect(plan.problem.code).toBe('aiArtifacts')
  })

  test('an em dash or curly quote is only stylistic and the reading goes with the plan', () => {
    const plan = planSend({ action: 'dm', userId: '1', text: 'yo lad — made a tool', approvedBy: 'matt', live: true, skipStyleCheck: true })
    expect(plan.ok).toBe(true)
    if (plan.ok) expect(plan.watermark?.level).toBe('stylistic')
  })
})
