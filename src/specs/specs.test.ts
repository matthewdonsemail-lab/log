import { describe, expect, test } from 'bun:test'
import { join } from 'node:path'
import { specDomains, specsIndex, specSummary, unpairedSpecs } from './index'

const root = join(import.meta.dir, '..', '..')
const page = ['---', 'title: "Voice"', '---', '', '# Voice', '', 'What the gate does.', '', '## Reading', '', '### REQ-VOICE-01: Every draft is read', '', 'Body.'].join('\n')

describe('the specs are in order and checked by SubQ (rule 117)', () => {
  test('a spec page gives its title, what it is and its requirements', () => {
    const s = specSummary('voiceGate', page)
    expect(s.title).toBe('Voice')
    expect(s.about).toBe('What the gate does.')
    expect(s.requirements).toEqual([{ id: 'REQ-VOICE-01', title: 'Every draft is read' }])
  })

  test('the index follows the domain order', () => {
    const index = specsIndex([specSummary('b', page.replace('# Voice', '# B')), specSummary('a', page.replace('# Voice', '# A'))], ['b', 'a'])
    expect(index.indexOf('[B]')).toBeLessThan(index.indexOf('[A]'))
    expect(index).toContain('2 domains, 2 requirements')
  })

  test('every spec page has its questions and every set of questions its page', () => {
    expect(specDomains(root)).toContain('voiceGate')
    expect(unpairedSpecs(root)).toEqual([])
  })
})
