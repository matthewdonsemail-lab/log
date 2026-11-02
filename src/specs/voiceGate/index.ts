import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const VOICE = 'src/twitter/copy/voice/client.ts'
const COMMAND = 'src/cli/twitter/helpers/voice.ts'

export const voiceGate = {
  description: 'The voice gate every message to send as matt passes',
  specPath: 'docs/specs/voiceGate.md',
  codePaths: ['src/twitter/copy/voice/client.ts', 'src/twitter/copy/voice/types.ts', 'src/cli/twitter/helpers/voice.ts'],
  anchors: {
    'REQ-VOICE-01': [
      { kind: 'symbol', file: VOICE, name: 'readVoice' },
      { kind: 'symbol', file: COMMAND, name: 'evidenceAnywhere' },
    ],
    'REQ-VOICE-03': [
      { kind: 'symbol', file: 'src/twitter/copy/voice/types.ts', name: 'NEVER_SAYS' },
      { kind: 'symbol', file: VOICE, name: 'neverSaysIn' },
    ],
    'REQ-VOICE-05': [{ kind: 'string', file: VOICE, includes: 'artifacts' }],
    'REQ-VOICE-06': [
      { kind: 'symbol', file: 'src/twitter/copy/voice/types.ts', name: 'VOICE_PASS' },
      { kind: 'symbol', file: 'src/twitter/copy/voice/types.ts', name: 'CONTEXT_PASS' },
    ],
  },
  rubrics: {
    'REQ-VOICE-01': noul('Does the voice command build the everywhere evidence with evidenceAnywhere, from the messages of matt across all his conversations, and pass it to every readVoice call whether or not there is a chat with the recipient, and does readVoice put it in its state?'),
    'REQ-VOICE-02': noul('When draft.evidence is set, does readVoice send the chat\'s replies, closest wording and latest messages in its state and ask the toThem question?'),
    'REQ-VOICE-03': noul('Does readVoice set pass to false when any never-said phrase is found in the draft text, whatever SubQ answers?'),
    'REQ-VOICE-04': noul('Does readVoice ask SubQ whether a first message to someone matt never talked with carries an ask, and fail the draft when openerOnly is below its threshold?'),
    'REQ-VOICE-05': noul('Does readVoice set pass to false when the watermark reading level is artifacts?'),
    'REQ-VOICE-06': noul('Is pass true only when voice, inContext, friendLike and openerOnly reach their thresholds, toThem reaches its threshold when it is set, no never-said phrase is found and the watermark level is not artifacts?'),
    unspecifiedBehavior: noul('Does readVoice let a draft pass by a route the specification does not describe, such as skipping SubQ or passing when an answer is missing?'),
  },
  assertions: {
    'REQ-VOICE-01': MET,
    'REQ-VOICE-02': MET,
    'REQ-VOICE-03': MET,
    'REQ-VOICE-04': MET,
    'REQ-VOICE-05': MET,
    'REQ-VOICE-06': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
