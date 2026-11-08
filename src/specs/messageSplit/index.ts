import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const SPLIT = 'src/voice/pairs/helpers/split.ts'
const TYPES = 'src/voice/pairs/types.ts'
const SEND = 'src/cli/twitter/helpers/send.ts'
const DISCORD = 'src/cli/discord/index.ts'
const INBOX = 'src/inbox/watch/client.ts'
const SLACK = 'src/cli/slack/index.ts'
const INSTAGRAM_ENGINE = 'python/instagramApi/engine.py'

export const messageSplit = {
  description: 'How a message is split into parts when it is sent, and the opener gated whole',
  specPath: 'docs/specs/messageSplit.md',
  codePaths: [
    'src/voice/pairs/helpers/split.ts',
    'src/voice/pairs/types.ts',
    'src/cli/twitter/helpers/send.ts',
    'src/cli/twitter/helpers/queue.ts',
    'src/cli/discord/index.ts',
    'src/cli/slack/index.ts',
    'src/cli/instagram/index.ts',
    'src/inbox/watch/client.ts',
    'python/instagramApi/engine.py',
    'src/cli/twitter/helpers/voice.ts',
    'src/twitter/copy/voice/client.ts',
    'python/platformKit/engine.py',
    'python/twitterApi/engine.py',
  ],
  anchors: {
    'REQ-SPLIT-01': [{ kind: 'symbol', file: SPLIT, name: 'splitPlan' }],
    'REQ-SPLIT-02': [
      { kind: 'string', file: SEND, includes: 'asOne' },
      { kind: 'string', file: DISCORD, includes: 'asOne' },
    ],
    'REQ-SPLIT-03': [
      { kind: 'value', file: TYPES, name: 'MAX_SPLIT', equals: 4 },
      { kind: 'symbol', file: SPLIT, name: 'partsFor' },
      { kind: 'symbol', file: SPLIT, name: 'splitDraft' },
    ],
    'REQ-SPLIT-04': [
      { kind: 'value', file: TYPES, name: 'SPLIT_GAP', path: ['min'], equals: 1 },
      { kind: 'value', file: TYPES, name: 'SPLIT_GAP', path: ['max'], equals: 8 },
    ],
    'REQ-SPLIT-05': [{ kind: 'symbol', file: SEND, name: 'dmSplit' }],
    'REQ-SPLIT-06': [{ kind: 'symbol', file: SEND, name: 'sendDmParts' }],
    'REQ-SPLIT-07': [{ kind: 'symbol', file: 'src/twitter/copy/voice/client.ts', name: 'readVoice' }],
    'REQ-SPLIT-09': [
      { kind: 'uses', file: 'src/cli/discord/index.ts', name: 'continuesSend' },
      { kind: 'uses', file: 'python/platformKit/engine.py', name: 'continues_send' },
      { kind: 'uses', file: SEND, name: 'continuesSend' },
      { kind: 'uses', file: 'python/twitterApi/engine.py', name: 'continues_send' },
    ],
    'REQ-SPLIT-08': [
      { kind: 'symbol', file: INBOX, name: 'incomingSince' },
      { kind: 'symbol', file: INBOX, name: 'interruptedLines' },
      { kind: 'symbol', file: SEND, name: 'dmInterruptedLines' },
      { kind: 'symbol', file: INSTAGRAM_ENGINE, name: 'heard_since' },
      { kind: 'symbol', file: DISCORD, name: 'discordDeps' },
      { kind: 'symbol', file: SLACK, name: 'slackDeps' },
    ],
  },
  rubrics: {
    'REQ-SPLIT-01': noul('When asOne is false and the text has more than one non-empty line, does splitPlan return one part per line, in order, without looking at the profile?'),
    'REQ-SPLIT-02': noul('When asOne is true, does splitPlan return the whole trimmed text as a single part, and do the dm and discord send commands pass asOne only from the asOne flag being true?'),
    'REQ-SPLIT-03': noul('For a one-line draft, does partsFor return one part when there is no profile burst, when oneShare is at least 0.5 or the median is 1 or less, and otherwise at most MAX_SPLIT parts sized by messageWords, which splitDraft then cuts?'),
    'REQ-SPLIT-04': noul('Does splitPlan set gapSeconds from profile.burst.gapSeconds clamped between SPLIT_GAP.min and SPLIT_GAP.max, and do sendDmParts and the discord send wait gapSeconds between parts?'),
    'REQ-SPLIT-05': noul('Do the direct X dm command, the queue run send for a dm item and the discord send command all build their parts with splitPlan (dmSplit for X), and do the dry runs list the parts?'),
    'REQ-SPLIT-06': noul('Do sendDmParts and the discord send loop break as soon as a part\'s answer is not ok or its event is not sent, so later parts are never sent and sent parts are not resent?'),
    'REQ-SPLIT-07': noul('Does the voice command pass the whole draft text, unsplit, to readVoice, and does readVoice fail the draft when openerOnly is below its threshold?'),
    'REQ-SPLIT-09': noul('Does the discord send loop pass continuesSend true only with parts after the first, and does run in python/platformKit/engine.py build the governor with mean_gap_s set to min_gap_s only for a write that continues a send, leaving its caps, floor and cooldown as they are, and does the X dm (sendDmParts in src/cli/twitter/helpers/send.ts and run_locked in python/twitterApi/engine.py) do the same for every line after the first; does governor_for set write_gap_from_writes so the gap of a write is counted from last_mutation_ts, and give every read (read=True) READ_MIN_GAP_S and READ_MEAN_GAP_S?'),
    'REQ-SPLIT-08': noul('Before each part after the first, do sendDmParts (given its watch), the discord send loop and the slack send loop read incomingSince for that chat from the time the send began, and does the instagram engine\'s send_sync read heard_since for the thread, and when anything came in do they all stop before sending the next part and return what they said with the parts not sent (interruptedLines, >>> INTERRUPTED)?'),
    unspecifiedBehavior: noul('Is a multi-line draft ever sent as one message without asOne, or is a part sent again after a failed part, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-SPLIT-01': MET,
    'REQ-SPLIT-02': MET,
    'REQ-SPLIT-03': MET,
    'REQ-SPLIT-04': MET,
    'REQ-SPLIT-05': MET,
    'REQ-SPLIT-06': MET,
    'REQ-SPLIT-07': MET,
    'REQ-SPLIT-08': MET,
    'REQ-SPLIT-09': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
