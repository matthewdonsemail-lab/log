import { describe, expect, test } from 'bun:test'
import { styleProblems } from './index'

describe('the house style', () => {
  test('lowercase copy with no commas, full stops or dashes passes, and urls are exempt', () => {
    expect(styleProblems('love this one https://x.com/a/status/1')).toEqual([])
  })

  test('each broken rule is named', () => {
    expect(styleProblems('Nice, really. Great — yes; ok – no')).toEqual(['uppercase characters: GN', 'comma (,)', 'semicolon (;)', 'full stop (.)', 'em dash (—)', 'en dash (–)'])
  })
})
