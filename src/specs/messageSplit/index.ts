import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const messageSplit = {
  description: 'How a message is split into parts when it is sent, and the opener gated whole',
  specPath: 'docs/specs/messageSplit.md',
  codePaths: [
    'src/voice/pairs/helpers/split.ts',
    'src/voice/pairs/types.ts',
    'src/cli/twitter/helpers/send.ts',
    'src/cli/twitter/helpers/queue.ts',
    'src/cli/discord/index.ts',
    'src/cli/twitter/helpers/voice.ts',
    'src/twitter/copy/voice/client.ts',
  ],
  rubrics: {
    'REQ-SPLIT-01': noul('When asOne is false and the text has more than one non-empty line, does splitPlan return one part per line, in order, without looking at the profile?'),
    'REQ-SPLIT-02': noul('When asOne is true, does splitPlan return the whole trimmed text as a single part, and do the dm and discord send commands pass asOne only from the asOne flag being true?'),
    'REQ-SPLIT-03': noul('For a one-line draft, does partsFor return one part when there is no profile burst, when oneShare is at least 0.5 or the median is 1 or less, and otherwise at most MAX_SPLIT (4) parts sized by messageWords, which splitDraft then cuts?'),
    'REQ-SPLIT-04': noul('Does splitPlan set gapSeconds from profile.burst.gapSeconds clamped between SPLIT_GAP.min (1) and SPLIT_GAP.max (8), and do sendDmParts and the discord send wait gapSeconds between parts?'),
    'REQ-SPLIT-05': noul('Do the direct X dm command, the queue run send for a dm item and the discord send command all build their parts with splitPlan (dmSplit for X), and do the dry runs list the parts?'),
    'REQ-SPLIT-06': noul('Do sendDmParts and the discord send loop break as soon as a part\'s answer is not ok or its event is not sent, so later parts are never sent and sent parts are not resent?'),
    'REQ-SPLIT-07': noul('Does the voice command pass the whole draft text, unsplit, to readVoice, and does readVoice fail the draft when openerOnly is below its threshold?'),
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
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
