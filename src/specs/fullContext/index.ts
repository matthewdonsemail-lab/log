import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const fullContext = {
  description: "A person's full context, read before drafting and again right before each queued send",
  specPath: 'docs/specs/fullContext.md',
  codePaths: [
    'src/twitter/dm/person/client.ts',
    'src/twitter/queue/run/client.ts',
    'src/twitter/queue/plan/client.ts',
    'src/cli/twitter/helpers/queue.ts',
    'src/cli/twitter/helpers/dms.ts',
    'src/twitter/notification/feed/client.ts',
  ],
  rubrics: {
    'REQ-CONTEXT-01': noul('With --with, does the dms command read the thread with that handle from the engine and add activityOf over the notification store rows, matching the person by userId or handle, sorted newest first?'),
    'REQ-CONTEXT-02': noul('Does activityLine say liked, retweeted, replied to, quoted, mentioned or followed from ACTIVITY_WORDS by the row kind, and include the row text (their own words) when there is one?'),
    'REQ-CONTEXT-03': noul('Do the dms command and the queue contextChanged call the notifications engine action only when notificationsFresh, with its 120 second window, says the saved store is not fresh?'),
    'REQ-CONTEXT-04': noul('For a reply event, does runQueue await deps.contextChanged(item) before it calls deps.send, and does the queue run command wire contextChanged to read the inbox withHandle and the notifications?'),
    'REQ-CONTEXT-05': noul('Does contextChangesSince return every message, from either side, and every activity row whose time is after since, and does the queue pass item.draftedAt (or queue.created) as since?'),
    'REQ-CONTEXT-06': noul('When contextChanged returns any change, does runQueue set item.status to held, set item.heldFor to the changes, call dropPost for its other events, alert with a HELD line naming twitterQueueEdit, and continue without calling deps.send?'),
    'REQ-CONTEXT-07': noul('Does editItem accept only a pending or held item, set its text, set draftedAt to now, set status to pending, delete heldFor, plan a held item again with fitTimes and call approveQueue?'),
    'REQ-CONTEXT-08': noul('Does queue edit refuse with queueBusy when liveLock(file) is true?'),
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
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
