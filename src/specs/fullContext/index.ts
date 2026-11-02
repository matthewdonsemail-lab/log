import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const PERSON = 'src/twitter/dm/person/client.ts'
const RUN = 'src/twitter/queue/run/client.ts'
const COMMAND = 'src/cli/twitter/helpers/queue.ts'

export const fullContext = {
  description: "A person's full context, read before drafting and again right before each queued send",
  specPath: 'docs/specs/fullContext.md',
  codePaths: [
    'src/twitter/dm/person/client.ts',
    'src/twitter/queue/run/client.ts',
    'src/twitter/queue/plan/client.ts',
    'src/cli/twitter/helpers/queue.ts',
    'src/cli/twitter/helpers/dms.ts',
    'src/cli/twitter/helpers/send.ts',
    'src/twitter/notification/feed/client.ts',
  ],
  anchors: {
    'REQ-CONTEXT-01': [{ kind: 'symbol', file: PERSON, name: 'activityOf' }],
    'REQ-CONTEXT-02': [
      { kind: 'symbol', file: PERSON, name: 'ACTIVITY_WORDS' },
      { kind: 'symbol', file: PERSON, name: 'activityLine' },
      { kind: 'string', file: PERSON, includes: 'liked' },
      { kind: 'string', file: PERSON, includes: 'retweeted' },
      { kind: 'string', file: PERSON, includes: 'replied to' },
      { kind: 'string', file: PERSON, includes: 'quoted' },
      { kind: 'string', file: PERSON, includes: 'mentioned' },
      { kind: 'string', file: PERSON, includes: 'followed' },
    ],
    'REQ-CONTEXT-03': [{ kind: 'symbol', file: 'src/twitter/notification/feed/client.ts', name: 'notificationsFresh' }],
    'REQ-CONTEXT-05': [{ kind: 'symbol', file: PERSON, name: 'contextChangesSince' }],
    'REQ-CONTEXT-06': [
      { kind: 'string', file: RUN, includes: 'held' },
      { kind: 'symbol', file: RUN, name: 'dropPost' },
    ],
    'REQ-CONTEXT-07': [{ kind: 'symbol', file: 'src/twitter/queue/plan/client.ts', name: 'editItem' }],
    'REQ-CONTEXT-08': [{ kind: 'string', file: COMMAND, includes: 'queueBusy' }],
  },
  rubrics: {
    'REQ-CONTEXT-01': noul('With --with, does the dms command read the thread with that handle from the engine and add the activity of the person from the notification store rows, matched by userId or handle and sorted newest first?'),
    'REQ-CONTEXT-02': noul('Does activityLine pick its words by the row kind through ACTIVITY_WORDS, and include the row text, their own words, when there is one?'),
    'REQ-CONTEXT-03': noul('Do the dms command and the queue contextChanged call the notifications engine action only when notificationsFresh, called with its default 120 second window, says the saved store is not fresh?'),
    'REQ-CONTEXT-04': noul('For a reply event, does runQueue await deps.contextChanged(item) before it calls deps.send, and does the queue run command wire contextChanged to read the inbox withHandle and the notifications?'),
    'REQ-CONTEXT-05': noul('Does contextChangesSince return every message, from either side, and every activity row whose time is after since, and does the queue pass item.draftedAt (or queue.created) as since?'),
    'REQ-CONTEXT-06': noul('When contextChanged returns any change, does runQueue set item.status to held, set item.heldFor to the changes, call dropPost for its other events, alert with a HELD line naming twitterQueueEdit, and continue without calling deps.send?'),
    'REQ-CONTEXT-07': noul('Does editItem accept only a pending or held item, set its text, set draftedAt to now, set status to pending, delete heldFor, plan a held item again with fitTimes and call approveQueue?'),
    'REQ-CONTEXT-08': noul('Does queue edit refuse before changing the queue when liveLock(file) is true?'),
    'REQ-CONTEXT-09 like': noul('In runQueue, can a like event be sent for an item whose reply or dm was not sent in this run (item.sentAtRun is not plan.planned)?'),
    'REQ-CONTEXT-09 split': noul('For a dm item split into several parts, does the queue send every part inside the one deps.send call (dmSplit, then sendDmParts), after the single contextChanged read runQueue made for that item, with no part planned or sent as an event of its own?'),
    'REQ-CONTEXT-09 readFails': noul('In the queue command, does contextChanged return a non-empty list, so runQueue holds the item, when the notifications read answer is not ok, when the thread read answer is not ok, or when item.handle is missing?'),
    unspecifiedBehavior: noul('Can a queued dm, reply or quote be sent without its context being read right before the send, or be sent while held, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-CONTEXT-01': MET,
    'REQ-CONTEXT-02': MET,
    'REQ-CONTEXT-03': MET,
    'REQ-CONTEXT-04': MET,
    'REQ-CONTEXT-05': MET,
    'REQ-CONTEXT-06': MET,
    'REQ-CONTEXT-07': MET,
    'REQ-CONTEXT-08': MET,
    'REQ-CONTEXT-09 like': NOT_VIOLATED,
    'REQ-CONTEXT-09 split': MET,
    'REQ-CONTEXT-09 readFails': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
