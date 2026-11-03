import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const VOICE = 'src/twitter/copy/voice/client.ts'
const COMMAND = 'src/cli/twitter/helpers/voice.ts'
const PHRASES = 'src/voice/phrases/client.ts'
const SCRAMBLER = 'src/twitter/copy/scrambler/client.ts'

export const voiceGate = {
  description: 'The voice gate every message to send as matt passes',
  specPath: 'docs/specs/voiceGate.md',
  codePaths: ['src/twitter/copy/voice/client.ts', 'src/twitter/copy/voice/types.ts', 'src/cli/twitter/helpers/voice.ts', 'src/voice/phrases/client.ts', 'src/voice/phrases/types.ts', 'src/twitter/copy/scrambler/client.ts', 'src/twitter/copy/scrambler/types.ts'],
  anchors: {
    'REQ-VOICE-07': [
      { kind: 'symbol', file: PHRASES, name: 'buildPhraseIndex' },
      { kind: 'symbol', file: PHRASES, name: 'readPhrases' },
      { kind: 'symbol', file: COMMAND, name: 'ensurePhraseIndex' },
    ],
    'REQ-VOICE-08': [
      { kind: 'symbol', file: SCRAMBLER, name: 'scramblerReadingOf' },
      { kind: 'symbol', file: SCRAMBLER, name: 'runScrambler' },
    ],
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
    'REQ-VOICE-04': noul('Does readVoice ask SubQ whether a first message to someone matt never talked with carries an ask, fail the draft when openerOnly is below its threshold, and pass the opener check when the chat already holds messages of matt (alreadyTalkedInThisChat)?'),
    'REQ-VOICE-05': noul('Does readVoice set pass to false when the watermark reading level is artifacts?'),
    'REQ-VOICE-06': noul('Is pass true only when voice, inContext, friendLike and openerOnly reach their thresholds, toThem reaches its threshold when it is set, no never-said phrase is found and the watermark level is not artifacts?'),
    'REQ-VOICE-07': noul('Does buildPhraseIndex count every word pair in the replies of matt and set a p10 baseline from his replies with the own pairs of each reply left out, does readPhrases leave out pairs using words from what they said and fail a draft whose share of pairs matt wrote at least FAMILIAR_MIN_USES times is below that floor, and does the voice command fail the draft then and hand the unfamiliar pairs to readVoice?'),
    'REQ-VOICE-08': noul('Does the voice command run scramblerReadingOf on the draft through the vendored aiWatermarkScrambler inspect_text script, fail the draft when it finds any suspicious character, and hand its count and kinds to readVoice?'),
    unspecifiedBehavior: noul('Does readVoice let a draft pass by a route the specification does not describe, such as skipping SubQ or passing when an answer is missing?'),
  },
  assertions: {
    'REQ-VOICE-01': MET,
    'REQ-VOICE-02': MET,
    'REQ-VOICE-03': MET,
    'REQ-VOICE-04': MET,
    'REQ-VOICE-05': MET,
    'REQ-VOICE-06': MET,
    'REQ-VOICE-07': MET,
    'REQ-VOICE-08': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
