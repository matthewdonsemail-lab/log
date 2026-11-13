import { describe, expect, test } from 'bun:test'
import type { DecisionRequest } from '../../../subq/decisions/index'
import { alreadyTalkedIn, neverSaysIn, readVoice } from './index'

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
    const reading = await readVoice({ to: 'handle_l1', text: 'yeah lets chop it up lad', context: 'we should chop it up some time' }, 'GUIDE', decide)
    expect(reading.pass).toBe(true)
    const state = asked[0].state as Record<string, unknown>
    expect(state.howMattWrites).toBe('GUIDE')
    expect(state.whatTheySaid).toBe('we should chop it up some time')
    expect((state.dmsMattWroteHimself as string[]).length).toBeGreaterThan(0)
  })

  test('a voice note is graded as spoken, never on length, and must build on the conversation instead of repeating it (rule 149)', async () => {
    const asked: DecisionRequest[] = []
    const decideWith = (buildsOn: number) => async (request: DecisionRequest) => {
      asked.push(request)
      return { model: 'subq-snap-1.1', answers: { voice: { type: 'noul' as const, noul: 0.9 }, inContext: { type: 'noul' as const, noul: 0.9 }, friendLike: { type: 'noul' as const, noul: 0.9 }, openerOnly: { type: 'noul' as const, noul: 1 }, buildsOn: { type: 'noul' as const, noul: buildsOn } }, usage: { input_tokens: 1, output_tokens: 1 } }
    }
    const said = 'ye the trending niches bit is a good shout and it ties into what you said about the api'
    const builds = await readVoice({ to: 'bea', text: said, context: 'it auto posts in trending niches', spoken: true, howMattTalks: ['I think so, to be honest, mate'] }, 'GUIDE', decideWith(0.9))
    expect((asked[0].state as Record<string, unknown>).howMattTalksInHisOwnVoiceNotes).toEqual(['I think so, to be honest, mate'])
    expect(builds.pass).toBe(true)
    expect(builds.buildsOn).toBe(0.9)
    const questions = asked[0].questions as Record<string, { instructions: string }>
    expect(questions.voice.instructions).toContain('howMattTalksInHisOwnVoiceNotes')
    expect(questions.voice.instructions).toContain('never count against it')
    expect(questions.buildsOn.instructions).toContain('rather than repeating')
    const repeats = await readVoice({ to: 'bea', text: said, context: 'it auto posts in trending niches', spoken: true }, 'GUIDE', decideWith(0.3))
    expect(repeats.pass).toBe(false)
    const typed = await readVoice({ to: 'bea', text: said, context: 'x' }, 'GUIDE', decideWith(0.1))
    expect(typed.buildsOn).toBe(null)
    expect((asked[2].questions as Record<string, unknown>).buildsOn).toBeUndefined()
  })

  test('a first message that goes in with an ask fails, however good the opener', async () => {
    const { asked, decide } = answering(0.95, 0.95, 0.95, 0.2)
    const reading = await readVoice({ to: 'someone', text: 'saw this the cascade pattern makes so much sense\nyou using treg yet', context: 'matt and they follow each other, never chatted' }, 'GUIDE', decide)
    expect(reading.pass).toBe(false)
    expect(Object.keys(asked[0].questions)).toContain('openerOnly')
  })

  test('a reply in a chat matt already talks in is never judged as a first message', async () => {
    const asked: DecisionRequest[] = []
    const decide = async (request: DecisionRequest) => {
      asked.push(request)
      return { model: 'subq-snap-1.1', answers: { voice: { type: 'noul' as const, noul: 0.95 }, inContext: { type: 'noul' as const, noul: 0.95 }, friendLike: { type: 'noul' as const, noul: 0.95 }, openerOnly: { type: 'noul' as const, noul: 0.4 }, toThem: { type: 'noul' as const, noul: 0.95 } }, usage: { input_tokens: 1, output_tokens: 1 } }
    }
    const evidence = { chat: 'lina', profile: 'short lowercase', replies: [], recent: [{ said: 'lets do it matt', reply: 'let goo' }] }
    const reading = await readVoice({ to: 'lina', text: 'whats the plan with it', context: 'do you have some reddit knowledge', evidence } as never, 'GUIDE', decide)
    expect(reading.openerOnly).toBe(1)
    expect(reading.pass).toBe(true)
    expect((asked[0].state as Record<string, unknown>).alreadyTalkedInThisChat).toBe(true)
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

  test('a draft written on several lines is read as the messages it will go out as, never as one block (matt, 2026-11-12)', async () => {
    const { asked, decide } = answering(0.97)
    const draft = 'send the folder over and ill take a run at it\nwhats the live recordings thing about'
    const reading = await readVoice({ to: 'invoker', text: draft, context: 'okay let me know what you need' }, 'GUIDE', decide)
    expect(reading.pass).toBe(true)
    const state = asked[0].state as Record<string, unknown>
    expect(state.dmAsItWillBeSent).toEqual(['send the folder over and ill take a run at it', 'whats the live recordings thing about'])
    expect(state.wordsInEachMessageAsSent).toEqual([11, 6])
    const questions = asked[0].questions as Record<string, { instructions: string }>
    expect(questions.voice.instructions).toContain('dmAsItWillBeSent')
    expect(questions.voice.instructions).toContain('never as one block')
    expect(questions.voice.instructions).toContain('A subject he has never written about never counts against him')
  })

  test('every gate reads matt across all his conversations, beside the chat and the guide', async () => {
    const { asked, decide } = answering(0.97)
    const everywhere = { chat: 'all', profile: { replies: 9 }, replies: [{ said: 'nice', reply: 'cheers lad', chat: 'x', tier: 'anywhere' }], wording: [] }
    const chat = { chat: 'them', profile: { replies: 2 }, replies: [{ said: 'yo', reply: 'yo lad', chat: 'them', tier: 'sameChat' }], recent: [] }
    await readVoice({ to: 'a', text: 'cheers lad', everywhere }, 'GUIDE', decide)
    await readVoice({ to: 'b', text: 'yo lad', evidence: chat, everywhere }, 'GUIDE', decide)
    for (const request of asked) {
      const state = request.state as Record<string, unknown>
      expect(state.howMattWrites).toBe('GUIDE')
      expect(state.mattsRealRepliesEverywhere).toEqual(everywhere.replies)
    }
    expect((asked[1].state as Record<string, unknown>).mattsRealRepliesHere).toEqual(chat.replies)
  })
})


describe("the opener rule only reads a first message (rule 98)", () => {
  test("a chat with matt's own messages in it, or his replies from that chat or person, is already talking", () => {
    expect(alreadyTalkedIn({ conversation: [{ from: "1663390258099101696", text: "i cannot even mention to you who they are", at: "2026-11-03T15:51:49Z" }, { from: "matt", text: "fair enough", at: "2026-11-03T15:40:00Z" }] })).toBe(true);
    expect(alreadyTalkedIn({ evidence: { chat: "sage_gtm (twitter dm)", profile: null, replies: [{ said: "x", reply: "y", chat: "sage_gtm", tier: "samePerson" }], recent: [] } as never })).toBe(true);
  });

  test("someone matt has never talked with is still a first message", () => {
    expect(alreadyTalkedIn({ conversation: [{ from: "123", text: "hey", at: "2026-11-04T00:00:00Z" }], evidence: { chat: "anywhere", profile: null, replies: [{ said: "x", reply: "y", chat: "other", tier: "anywhere" }], recent: [] } as never })).toBe(false);
    expect(alreadyTalkedIn({})).toBe(false);
  });
});
