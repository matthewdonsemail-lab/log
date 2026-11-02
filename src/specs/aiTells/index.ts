import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const WM = 'src/twitter/copy/watermark/client.ts'
const SEND = 'src/twitter/post/send/client.ts'
const TELLS = 'src/voice/aiTells/client.ts'
const TYPES = 'src/voice/aiTells/types.ts'
const VOICE = 'src/cli/twitter/helpers/voice.ts'
const DISCORD = 'src/cli/discord/index.ts'

export const aiTells = {
  description: 'The watermark reading of every X and Discord send and the AI tells reading of every gated draft',
  specPath: 'docs/specs/aiTells.md',
  codePaths: [
    'src/twitter/copy/watermark/client.ts',
    'src/twitter/copy/watermark/types.ts',
    'src/twitter/post/send/client.ts',
    'src/voice/aiTells/client.ts',
    'src/voice/aiTells/types.ts',
    'src/voice/aiTells/helpers/jina.ts',
    'src/cli/twitter/helpers/voice.ts',
    'src/cli/twitter/helpers/send.ts',
    'src/cli/twitter/helpers/queue.ts',
    'src/cli/discord/index.ts',
  ],
  anchors: {
    'REQ-AITELLS-01': [
      { kind: 'symbol', file: WM, name: 'watermarkReadingOf' },
      { kind: 'string', file: WM, includes: 'unknown' },
    ],
    'REQ-AITELLS-02': [
      { kind: 'symbol', file: SEND, name: 'planSend' },
      { kind: 'string', file: SEND, includes: 'aiArtifacts' },
    ],
    'REQ-AITELLS-03': [{ kind: 'symbol', file: WM, name: 'watermarkLine' }],
    'REQ-AITELLS-04': [
      { kind: 'symbol', file: TELLS, name: 'valeRules' },
      { kind: 'symbol', file: TELLS, name: 'ruleHits' },
      { kind: 'string', file: TELLS, includes: 'valeAiTells' },
    ],
    'REQ-AITELLS-05': [
      { kind: 'symbol', file: TELLS, name: 'aiPhrases' },
      { kind: 'symbol', file: TELLS, name: 'buildAiIndex' },
      { kind: 'value', file: TYPES, name: 'JINA_EMBED_MODEL', equals: 'jina-embeddings-v3' },
      { kind: 'symbol', file: 'src/voice/aiTells/helpers/jina.ts', name: 'jinaEmbedder' },
      { kind: 'string', file: TELLS, includes: 'feedHive' },
      { kind: 'string', file: TELLS, includes: 'sanderFrentz' },
      { kind: 'string', file: TELLS, includes: 'sicarius' },
      { kind: 'string', file: TELLS, includes: 'aiExamples' },
      { kind: 'string', file: TELLS, includes: 'xComplaints' },
    ],
    'REQ-AITELLS-06': [{ kind: 'value', file: TYPES, name: 'X_COMPLAINT_KEEP', equals: 0.6 }],
    'REQ-AITELLS-07': [{ kind: 'symbol', file: TELLS, name: 'percentile' }],
    'REQ-AITELLS-08': [
      { kind: 'value', file: TYPES, name: 'MUTE_IF_MATT_USES', equals: 0.02 },
      { kind: 'symbol', file: TELLS, name: 'mutedRules' },
    ],
    'REQ-AITELLS-09': [
      { kind: 'value', file: TYPES, name: 'MATT_SAYS_IT_TIMES', equals: 5 },
      { kind: 'symbol', file: TELLS, name: 'mattsOwnPhrases' },
    ],
    'REQ-AITELLS-10': [
      { kind: 'symbol', file: TELLS, name: 'chunksOf' },
      { kind: 'value', file: TYPES, name: 'JINA_RERANK_MODEL', equals: 'jina-reranker-v2-base-multilingual' },
    ],
    'REQ-AITELLS-11': [{ kind: 'symbol', file: TELLS, name: 'readAiTells' }],
    'REQ-AITELLS-12': [
      { kind: 'symbol', file: VOICE, name: 'ensureAiIndex' },
      { kind: 'symbol', file: VOICE, name: 'aiIndexStale' },
    ],
    'REQ-AITELLS-13': [
      { kind: 'symbol', file: DISCORD, name: 'discordSendCommand' },
      { kind: 'string', file: DISCORD, includes: 'aiArtifacts' },
    ],
  },
  rubrics: {
    'REQ-AITELLS-01': noul('Does watermarkReadingOf set level to artifacts when any finding is deterministic, stylistic when there are only non-deterministic findings, clean when there are none, and always set statistical to unknown?'),
    'REQ-AITELLS-02': noul('Does planSend return ok false, naming what was found, when watermarkReadingOf gives level artifacts for the text?'),
    'REQ-AITELLS-03': noul('Does planSend put the watermark reading on an allowed plan, and do both the direct send command and the queue run send log watermarkLine(plan.watermark)?'),
    'REQ-AITELLS-04': noul('Does valeRules read the substitution and existence rules from the vale-ai-tells styles folder, and does readAiTells run ruleHits on the text and set pass to false when there is any hit?'),
    'REQ-AITELLS-05': noul('Does aiPhrases collect the vale-ai-tells phrases first and then the other lists, and does buildAiIndex embed them with embedder.embed, where the voice command passes jinaEmbedder?'),
    'REQ-AITELLS-06': noul('Does buildAiIndex keep an X_COMPLAINT phrase only when its best cosine to a curated phrase is at least X_COMPLAINT_KEEP, and drop it otherwise?'),
    'REQ-AITELLS-07': noul("Does buildAiIndex measure matt's own replies against the phrase vectors and store their p50 and p99 with percentile in the baseline?"),
    'REQ-AITELLS-08': noul('Does mutedRules mute a rule that hits in more than MUTE_IF_MATT_USES of the replies, and does readAiTells skip the muted rules?'),
    'REQ-AITELLS-09': noul('Does mattsOwnPhrases keep a match that appears in at least MATT_SAYS_IT_TIMES of the replies, and does readAiTells pass mattsPhrases to ruleHits as muted so those matches never count?'),
    'REQ-AITELLS-10': noul('Does readAiTells cut the text with chunksOf into lines and word windows, find each chunk\'s best phrase by cosine, and rerank the closest with embedder.rerank?'),
    'REQ-AITELLS-11': noul("Does readAiTells set flagged when the closest cosine score is above the baseline p99, and pass only when there are no hits and it is not flagged?"),
    'REQ-AITELLS-12': noul('Does the voice command call ensureAiIndex, which builds the index when aiIndexStale finds it missing or older than pairs.json, and does reading.pass require aiTells.pass?'),
    'REQ-AITELLS-13': noul('Does discordSendCommand call watermarkReadingOf on the text before the dry run or any send, refuse without calling directDiscord when the level is artifacts, and otherwise log watermarkLine(watermark) and put watermark in its dry run and --json output?'),
    unspecifiedBehavior: noul('Does a draft or send pass the watermark or AI tells reading by a route the specification does not describe, such as planSend allowing artifacts or readAiTells passing despite a vale hit?'),
  },
  assertions: {
    'REQ-AITELLS-01': MET,
    'REQ-AITELLS-02': MET,
    'REQ-AITELLS-03': MET,
    'REQ-AITELLS-04': MET,
    'REQ-AITELLS-05': MET,
    'REQ-AITELLS-06': MET,
    'REQ-AITELLS-07': MET,
    'REQ-AITELLS-08': MET,
    'REQ-AITELLS-09': MET,
    'REQ-AITELLS-10': MET,
    'REQ-AITELLS-11': MET,
    'REQ-AITELLS-12': MET,
    'REQ-AITELLS-13': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
