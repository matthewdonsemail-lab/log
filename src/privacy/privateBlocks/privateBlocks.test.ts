import { describe, expect, test } from 'bun:test'
import { stripPrivateBlocks } from './index.ts'

describe('stripPrivateBlocks', () => {
  test('drops every block wrapped in the private marker and keeps the rest', () => {
    const text = ['# Play', '', 'Step one.', '', '<!-- private -->', 'The owner said: a real anecdote.', '<!-- /private -->', '', 'Step two.', '', 'Inline <!-- private -->secret aside<!-- /private --> kept text.', ''].join('\n')
    const { text: out, problem } = stripPrivateBlocks(text)
    expect(problem).toBeNull()
    expect(out).not.toContain('anecdote')
    expect(out).not.toContain('secret aside')
    expect(out).toContain('Step one.\n\nStep two.')
    expect(out).toContain('Inline  kept text.')
  })

  test('an unclosed marker drops everything after it and reports the problem', () => {
    const { text, problem } = stripPrivateBlocks('public\n<!-- private -->\nprivate to the end')
    expect(text).toBe('public\n')
    expect(problem).toContain('no <!-- /private -->')
  })

  test('a text without markers is unchanged', () => {
    expect(stripPrivateBlocks('a\n\n\n\nb\n')).toEqual({ text: 'a\n\n\n\nb\n', problem: null })
  })

  test('markers shown as code, in a fence or inline, are documentation and stay', () => {
    const text = ['Wrap it in `<!-- private -->`:', '', '```markdown', '<!-- private -->', 'example', '<!-- /private -->', '```', ''].join('\n')
    expect(stripPrivateBlocks(text)).toEqual({ text, problem: null })
  })
})
