import { describe, expect, test } from 'bun:test'
import type { DecisionRequest } from '../../../subq/decisions/index'
import { neverSaysIn, readVoice } from './index'

const answering = (voice: number, inContext = 0.95, friendLike = 0.95, openerOnly = 0.95) => {
  const asked: DecisionRequest[] = []
  const decide = async (request: DecisionRequest) => {
    asked.push(request)
    return { model: 'subq-snap-1.1', answers: { voice: { type: 'noul' as const, noul: voice }, inContext: { type: 'noul' as const, noul: inContext }, friendLike: { type: 'noul' as const, noul: friendLike }, openerOnly: { type: 'noul' as const, noul: openerOnly } }, usage: { input_tokens: 1, output_tokens: 1 } }
  }
  return { asked, decide }
}

describe('the voice gate', () => {
  test('a draft in matt\'s voice that answers them passes, and SubQ is given his guide, his own dms and what they said', async () => {
    const { asked, decide } = answering(0.97)
    const reading = await readVoice({ to: 'lluclin', text: 'yeah lets chop it up lad', context: 'we should chop it up some time' }, 'GUIDE', decide)
    expect(reading.pass).toBe(true)
    const state = asked[0].state as Record<string, unknown>
    expect(state.howMattWrites).toBe('GUIDE')
    expect(state.whatTheySaid).toBe('we should chop it up some time')
    expect((state.dmsMattWroteHimself as string[]).length).toBeGreaterThan(0)
  })

  test('a first message that goes in with an ask fails, however good the opener', async () => {
    const { asked, decide } = answering(0.95, 0.95, 0.95, 0.2)
    const reading = await readVoice({ to: 'someone', text: 'saw this the cascade pattern makes so much sense\nyou using treg yet', context: 'matt and they follow each other, never chatted' }, 'GUIDE', decide)
    expect(reading.pass).toBe(false)
    expect(Object.keys(asked[0].questions)).toContain('openerOnly')
  })

  test('a draft that sounds like ai fails on voice', async () => {
    const { decide } = answering(0.6)
    expect((await readVoice({ to: 'x', text: 'love this take' }, 'GUIDE', decide)).pass).toBe(false)
  })

  test('a phrase matt never says fails it whatever SubQ thinks', async () => {
    const { decide } = answering(0.99)
    const reading = await readVoice({ to: 'x', text: 'the no crew bit hit home lad' }, 'GUIDE', decide)
    expect(reading.neverSays).toEqual(['hit home'])
    expect(reading.pass).toBe(false)
  })

  test('the never-says list is matched without case', () => {
    expect(neverSaysIn('That is SPOT ON and a Big Swing')).toEqual(['big swing', 'spot on'])
  })
})
