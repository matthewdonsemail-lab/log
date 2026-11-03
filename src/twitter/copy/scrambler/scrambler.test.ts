import { describe, expect, test } from 'bun:test'
import { scramblerLine, scramblerReadingOf } from './index'

describe('the vendored watermark scrambler (layer A)', () => {
  test('a clean report passes and says the statistical mark is not checked', () => {
    const reading = scramblerReadingOf('yo lad', () => ({ status: 0, stdout: JSON.stringify({ suspicious_total: 0, hits: [] }), stderr: '' }))
    expect(reading).toMatchObject({ ran: true, suspicious: 0, statistical: 'unknown' })
    expect(scramblerLine(reading)).toContain('no invisible')
  })

  test('hidden characters are counted with their kinds', () => {
    const reading = scramblerReadingOf('yo​lad', () => ({ status: 1, stdout: JSON.stringify({ suspicious_total: 1, hits: [{ kind: 'strip', codepoint: 'U+200B' }] }), stderr: '' }))
    expect(reading.suspicious).toBe(1)
    expect(scramblerLine(reading)).toContain('strip')
  })

  test('a scrambler that cannot run says so instead of passing silently', () => {
    const reading = scramblerReadingOf('yo', () => ({ status: 2, stdout: '', stderr: 'python missing' }))
    expect(reading.ran).toBe(false)
    expect(scramblerLine(reading)).toContain("couldn't run")
  })

  test('the real vendored script reads a zero width space', () => {
    const reading = scramblerReadingOf('yo​ lad')
    expect(reading.ran).toBe(true)
    expect(reading.suspicious).toBeGreaterThan(0)
  })
})
