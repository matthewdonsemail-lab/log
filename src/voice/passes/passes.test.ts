import { describe, expect, test } from 'bun:test'
import { passKey, recentPass, recordPass } from './index'

describe('a draft that just passed the voice gate is not sent to SubQ again', () => {
  test('the same text, however it is spaced or cased, is the same pass', () => {
    expect(passKey('send me their socials\nand do the claude login')).toBe(passKey('  Send me their socials and do the claude login '))
  })

  test('a pass is reused for 10 minutes and then has to be earned again', () => {
    const at = new Date('2026-11-07T05:00:00Z')
    recordPass('yo how did the stream go', 'Lars', 0.94, at)
    expect(recentPass('yo how did the stream go', new Date('2026-11-07T05:09:00Z'))).toMatchObject({ to: 'Lars', voice: 0.94 })
    expect(recentPass('yo how did the stream go', new Date('2026-11-07T05:11:00Z'))).toBeNull()
    expect(recentPass('a different draft', new Date('2026-11-07T05:01:00Z'))).toBeNull()
  })
})
