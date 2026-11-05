import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const VOICE = 'src/twitter/copy/voice/client.ts'
const COMMAND = 'src/cli/twitter/helpers/voice.ts'
const PHRASES = 'src/voice/phrases/client.ts'
const SCRAMBLER = 'src/twitter/copy/scrambler/client.ts'

export const voiceGate = {
  description: 'The voice gate every message to send as matt passes',
  specPath: 'docs/specs/voiceGate.md',
  codePaths: ['src/inbox/store/client.ts', 'src/voice/aiTells/helpers/jina.ts', 'src/cli/discord/index.ts', 'src/cli/slack/index.ts', 'src/cli/instagram/index.ts', 'src/cli/twitter/helpers/send.ts', 'src/cli/twitter/helpers/queue.ts', 'src/twitter/copy/voice/client.ts', 'src/twitter/copy/voice/types.ts', 'src/cli/twitter/helpers/voice.ts', 'src/voice/phrases/client.ts', 'src/voice/phrases/types.ts', 'src/twitter/copy/scrambler/client.ts', 'src/twitter/copy/scrambler/types.ts'],
  anchors: {
    'REQ-VOICE-09': [
      { kind: 'symbol', file: COMMAND, name: 'gateSend' },
      { kind: 'symbol', file: COMMAND, name: 'failedParts' },
      { kind: 'string', file: 'src/cli/discord/index.ts', includes: 'voiceGateFailed' },
      { kind: 'string', file: 'src/cli/slack/index.ts', includes: 'voiceGateFailed' },
      { kind: 'string', file: 'src/cli/instagram/index.ts', includes: 'voiceGateFailed' },
      { kind: 'string', file: 'src/cli/twitter/helpers/send.ts', includes: 'voiceGateFailed' },
    ],
    'REQ-VOICE-10': [
      { kind: 'symbol', file: COMMAND, name: 'rankedContext' },
      { kind: 'value', file: 'src/twitter/copy/voice/types.ts', name: 'RANKED_CONTEXT', equals: 12 },
      { kind: 'value', file: 'src/twitter/copy/voice/types.ts', name: 'RANKED_SHORTLIST', equals: 40 },
    ],
    'REQ-VOICE-14': [
      { kind: 'symbol', file: 'src/cli/twitter/helpers/send.ts', name: 'OVER_GATE' },
    ],
    'REQ-VOICE-13': [
      { kind: 'symbol', file: VOICE, name: 'readVoice' },
      { kind: 'string', file: COMMAND, includes: 'spoken' },
    ],
    'REQ-VOICE-12': [
      { kind: 'symbol', file: COMMAND, name: 'chatIdFor' },
      { kind: 'symbol', file: COMMAND, name: 'chatEvidence' },
      { kind: 'symbol', file: VOICE, name: 'alreadyTalkedIn' },
      { kind: 'symbol', file: COMMAND, name: 'momentAnswered' },
    ],
    'REQ-VOICE-11': [
      { kind: 'symbol', file: 'src/inbox/store/client.ts', name: 'storedEmbedder' },
      { kind: 'symbol', file: 'src/inbox/store/client.ts', name: 'vectorsFor' },
      { kind: 'symbol', file: 'src/inbox/store/client.ts', name: 'saveAiIndex' },
    ],
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
    'REQ-VOICE-06': noul('Is pass true only when voice, inContext, friendLike and openerOnly reach their thresholds, toThem reaches its threshold when it is set, buildsOn reaches CONTEXT_PASS when it is set, no never-said phrase is found and the watermark level is not artifacts?'),
    'REQ-VOICE-07': noul('Does buildPhraseIndex count every word pair in the replies of matt and set a p10 baseline from his replies with the own pairs of each reply left out, does readPhrases leave out pairs using words from what they said and fail a draft whose share of pairs matt wrote at least FAMILIAR_MIN_USES times is below that floor, and does the voice command fail the draft then and hand the unfamiliar pairs to readVoice?'),
    'REQ-VOICE-08': noul('Does the voice command run scramblerReadingOf on the draft through the vendored aiWatermarkScrambler inspect_text script, fail the draft when it finds any suspicious character, and hand its count and kinds to readVoice?'),
    'REQ-VOICE-09': noul('Do the discord send, slack send, instagram send (when there is text) and twitter dm commands call gateDeps.gate (gateSend) after waitCaughtUp and before guardSend, and return voiceGateFailed with nothing sent when it fails; does the queue contextChanged call it for an item with text and return the failed parts so runQueue holds the item; does gateSend run gateReading (readVoice, the AI tells index, readPhrases, the watermark reading and the scrambler) and answer a one line pass or a refusal listing only failedParts?'),
    'REQ-VOICE-10': noul('Does rankedContext take the chat messages from chatContextOf, embed the moment and the messages with voiceDeps.aiEmbedder, keep the RANKED_SHORTLIST closest by cosine, rerank them, return the top RANKED_CONTEXT in time order with their full text, and does readVoice put them in its state as thisConversationRankedForThisMoment and ask inContext against them?'),
    'REQ-VOICE-12': noul('Does gateSend call chatEvidence with the send platform, conversation id, user id and handle, and pass its evidence to gateReading; does chatIdFor match a saved conversation of the same platform by its conversation id, then on twitter by the user id being one of the conversation id parties, then by handle on that platform only, and return null when none matches; and does chatEvidence then read that chat with evidenceFor? Does alreadyTalkedIn return true when the evidence has recent messages, when the ranked conversation has a message from matt, or when a real reply is from the same chat or the same person, and does readVoice then set openerOnly to 1 without using the SubQ answer? Does gateSend take what is being answered from momentAnswered, which returns the newest message text only when that newest message is not from matt, and an empty string otherwise?'),
    'REQ-VOICE-11': noul('Does storedEmbedder look up every text with vectorsFor by its hash, model and dimensions, embed only the missing ones and store them with saveVectors, does jinaEmbedder do the same, do buildAiIndex and openAiIndex keep the phrase vectors and the index meta in the .db (saveVectors, saveAiIndex, aiIndexOf), and is no reading, score or verdict written anywhere?'),
    'REQ-VOICE-14': noul('In src/cli/twitter/helpers/send.ts, does the dm command declare an overGate flag (OVER_GATE) only on dm, skip gateDeps.gate only when overGate is true while still refusing voiceGateFailed when it is not, and does the planSend aiArtifacts refusal still apply before it?'),
    'REQ-VOICE-13': noul('In src/twitter/copy/voice/client.ts, when the draft has spoken set, does readVoice ask a voice question that says it is a voice note whose length and punctuation never count against it, ask a buildsOn question about building on the whole conversation rather than repeating what matt already said, and fail the draft when buildsOn is under CONTEXT_PASS, while without spoken there is no buildsOn question and buildsOn is null; and in src/cli/twitter/helpers/voice.ts does gateReading pass spoken to readVoice and skip offProfile for it, does gateSend take spoken and pass it on, does failedParts name a low buildsOn, and does the voice command take a spoken flag; and with spoken does gateReading pass howMattTalks from voiceDeps (transcripts of mattsOwnVoiceNotes, which keeps only recordings made before firstClonedAt) so that readVoice puts them in its state as howMattTalksInHisOwnVoiceNotes and its spoken voice question reads them first?'),
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
    'REQ-VOICE-09': MET,
    'REQ-VOICE-10': MET,
    'REQ-VOICE-11': MET,
    'REQ-VOICE-12': MET,
    'REQ-VOICE-13': MET,
    'REQ-VOICE-14': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
