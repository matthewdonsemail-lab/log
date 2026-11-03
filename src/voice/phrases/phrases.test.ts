import { describe, expect, test } from 'bun:test'
import { buildPhraseIndex, phrasesLine, readPhrases, wordPairsOf, wordsOf } from './index'

const MATT = [
  'yo lad whats the craic with that',
  'haha nah lad thats mad',
  'yo lad whats the craic',
  'nah thats mad lad',
  'haha thats mad what are you building',
  'yo whats the craic lad what are you building',
  'thats mad lad what are you building now',
  'nah lad thats mad haha',
]

describe('matt phrasing', () => {
  test('words and word pairs ignore links, case and apostrophes', () => {
    expect(wordsOf("That's MAD https://x.com/a lad")).toEqual(['thats', 'mad', 'lad'])
    expect(wordPairsOf(['a', 'b', 'c'])).toEqual(['a b', 'b c'])
  })

  test('a draft in his own word pairs passes and one in pairs he never wrote fails', () => {
    const index = buildPhraseIndex(MATT)
    expect(readPhrases('yo lad whats the craic thats mad', index).pass).toBe(true)
    const foreign = readPhrases('a pageant in the same week is wild win or lose', index)
    expect(foreign.pass).toBe(false)
    expect(foreign.unfamiliar).toContain('is wild')
    expect(phrasesLine(foreign)).toContain('never from him: ')
  })

  test('words they wrote themselves are not held against the draft, and a short draft is not measured', () => {
    const index = buildPhraseIndex(MATT)
    expect(readPhrases('pageant week wild', index).familiarity).toBeNull()
    const echoed = readPhrases('yo lad whats the craic with the pageant thing', index, 'pageant thing')
    expect(echoed.unfamiliar.some((pair) => pair.includes('pageant'))).toBe(false)
  })
})
