import { describe, expect, test } from 'bun:test'
import { copyStyleOf, styleProblems } from './index'

describe('the house style', () => {
  test('lowercase copy with no commas, full stops or dashes passes, and urls are exempt', () => {
    expect(styleProblems('love this one https://x.com/a/status/1')).toEqual([])
  })

  test('a capital may open any line, and only there', () => {
    expect(styleProblems('Mad that\nqwen in 24kb')).toEqual([])
    expect(styleProblems('mad that\nQwen in 24kb')).toEqual([])
    expect(styleProblems('https://x.com/a/status/1\nGoing through 25 of them')).toEqual([])
    expect(styleProblems('Mad that Qwen fits')).toEqual(['uppercase characters: Q'])
  })

  test('each broken rule is named', () => {
    expect(styleProblems('Nice, really. Great — yes; ok – no')).toEqual(['uppercase characters: G', 'comma (,)', 'semicolon (;)', 'full stop (.)', 'em dash (—)', 'en dash (–)'])
  })
})

describe('copy styles per account', () => {
  test('an empty style is the house style', () => {
    expect(styleProblems('nice Yes', null)).toEqual(['uppercase characters: Y'])
    expect(copyStyleOf('')?.name).toBe('house')
  })

  test('an unknown style is a problem of its own', () => {
    expect(styleProblems('fine', 'shouty')).toEqual(['unknown copy style "shouty" (known: house)'])
    expect(copyStyleOf('shouty')).toBeNull()
  })
})
