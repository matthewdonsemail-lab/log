import { describe, expect, test } from 'bun:test'
import { callMatched, callPrompt, gateFrom, makeCall, trainingExample } from './helpers/call'
import type { LabelledMeme, Situation } from './helpers/situation'
import type { ModelCall, TasteRating } from './types'

const situation: Situation = { thread: [{ handle: 'x', name: 'x', text: 'we raised 2m today' }], replyingTo: 'x', moment: 'a founder flexing a raise', searches: [] }
const meme = (id: string): LabelledMeme => ({ id, name: `meme ${id}`, type: 'image', mediaUrl: null, previewUrl: null, fitsWhen: 'when', fit: 0.5 })
const call = (confidence: number, templateId = 'a'): ModelCall => ({ action: 'reply', templateId, name: `meme ${templateId}`, caption: 'lock in', confidence })
const judged = (confidence: number, right: boolean): TasteRating => ({ word: 'w', templateId: 'a', name: 'meme a', mediaUrl: null, good: true, call: call(confidence), callMatched: right, at: '2026-11-02T00:00:00Z' })

describe('the model call', () => {
  test('it decides reply or skip first, then the meme, and its confidence covers both', async () => {
    const made = await makeCall(async () => '{"wouldReply":0.8,"id":"b","caption":"lock in","memeConfidence":0.5}', situation, [meme('a'), meme('b')])
    expect(made).toEqual({ action: 'reply', templateId: 'b', name: 'meme b', caption: 'lock in', confidence: 0.4, odds: { wouldReply: 0.8, meme: 0.5 } })
    expect(await makeCall(async () => '{"wouldReply":0.3,"id":"a","memeConfidence":0.9}', situation, [meme('a')])).toMatchObject({ action: 'skip', confidence: 0.7 })
    expect(await makeCall(async () => '{"id":"a"}', situation, [meme('a')])).toBeNull()
  })

  test('the call prompt carries his skips and how often he skips', () => {
    const prompt = callPrompt(situation, [meme('a')], { picked: [], passed: [], skipRate: 0.55, skips: [{ post: 'blue angels are the best', context: 'patriotic flex', role: 'sales_rep' }] })
    expect(prompt).toContain('matt skips about 55% of the posts')
    expect(prompt).toContain('- sales rep: "blue angels are the best" (context: patriotic flex)')
  })

  test('a call is right only when matt makes the same one', () => {
    expect(callMatched(call(0.8, 'a'), { templateId: 'a', name: 'meme a', good: true })).toBe(true)
    expect(callMatched(call(0.8, 'a'), { templateId: 'b', name: 'meme b', good: true })).toBe(false)
    expect(callMatched(call(0.8, 'a'), { templateId: '', name: '', good: false, skipped: true })).toBe(false)
    expect(callMatched({ ...call(0.6), action: 'skip' }, { templateId: '', name: '', good: false, skipped: true })).toBe(true)
  })

  test('the gate opens at the lowest confidence where the model is right 9 times in 10 over 10 calls', () => {
    expect(gateFrom([judged(0.95, true)]).threshold).toBeNull()
    const ratings = [...Array.from({ length: 10 }, () => judged(0.9, true)), judged(0.6, false), judged(0.6, false), judged(0.5, true)]
    const gate = gateFrom(ratings)
    expect(gate).toMatchObject({ calls: 13, right: 11, threshold: 0.9, above: { right: 10, calls: 10 } })
    expect(gate.bands.find((b) => b.from === 0.5)).toMatchObject({ right: 1, calls: 3 })
  })

  test('every answered rating becomes a training example, the answer being what matt did', () => {
    const example = trainingExample({ word: 'a founder flexing', thread: [{ handle: 'x', text: 'we raised 2m' }], templateId: 'a', name: 'Jensen Huang Pucker Face', mediaUrl: null, good: true, reply: 'its taste raw taste', searched: 'taste', fromSearch: true, shown: ['Cat Pointing'], at: '' })!
    expect(example.messages.map((m) => m.role)).toEqual(['system', 'user', 'assistant'])
    expect(JSON.parse(example.messages[2]!.content)).toEqual({ wouldReply: 1, id: 'Jensen Huang Pucker Face', caption: 'its taste raw taste', memeConfidence: 1, searched: 'taste' })
    expect(example.messages[1]!.content).toContain('Jensen Huang Pucker Face')
    expect(JSON.parse(trainingExample({ word: 'w', templateId: '', name: '', mediaUrl: null, good: false, skipped: true, at: '' })!.messages[2]!.content)).toEqual({ wouldReply: 0 })
  })
})
