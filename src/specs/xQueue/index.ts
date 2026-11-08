import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const PLAN = 'src/twitter/queue/plan/client.ts'
const RUN = 'src/twitter/queue/run/client.ts'
const EVENTS = 'src/twitter/queue/events/client.ts'
const COMMAND = 'src/cli/twitter/helpers/queue.ts'

export const xQueue = {
  description: 'The X queue every account sends more than one thing through, and the hook that shows what it did',
  specPath: 'docs/specs/xQueue.md',
  codePaths: [
    'src/twitter/queue/plan/client.ts',
    'src/twitter/queue/plan/types.ts',
    'src/twitter/queue/run/client.ts',
    'src/twitter/queue/run/types.ts',
    'src/twitter/live/feed/client.ts',
    'src/twitter/queue/events/client.ts',
    'src/twitter/queue/events/types.ts',
    'scripts/hooks/queue.ts',
    'src/cli/twitter/helpers/queue.ts',
    'src/agentHooks/registry/index.ts',
    'python/twitterApi/engine.py',
  ],
  anchors: {
    'REQ-QUEUE-01': [
      { kind: 'value', file: PLAN, name: 'MIN_GAP_FLOOR', equals: 30 },
      { kind: 'symbol', file: PLAN, name: 'systemRandom' },
      { kind: 'symbol', file: PLAN, name: 'drawTimes' },
      { kind: 'symbol', file: PLAN, name: 'planQueue' },
    ],
    'REQ-QUEUE-02': [
      { kind: 'symbol', file: PLAN, name: 'fingerprint' },
      { kind: 'symbol', file: PLAN, name: 'approvalProblem' },
    ],
    'REQ-QUEUE-03': [{ kind: 'symbol', file: RUN, name: 'runQueue' }],
    'REQ-QUEUE-16': [
      { kind: 'symbol', file: 'src/twitter/queue/plan/types.ts', name: 'toAPerson' },
    ],
    'REQ-QUEUE-15': [
      { kind: 'value', file: 'python/twitterApi/engine.py', name: 'MAX_AUTHOR_FOLLOWERS', equals: 1500 },
      { kind: 'string', file: 'python/twitterApi/engine.py', includes: 'authorTooBig' },
      { kind: 'string', file: RUN, includes: 'tooBig' },
    ],
    'REQ-QUEUE-05': [
      { kind: 'symbol', file: 'src/twitter/queue/store/client.ts', name: 'takeQueueLock' },
      { kind: 'symbol', file: 'src/twitter/queue/store/client.ts', name: 'releaseQueueLock' },
      { kind: 'string', file: COMMAND, includes: 'queueBusy' },
    ],
    'REQ-QUEUE-06': [
      { kind: 'symbol', file: 'src/twitter/queue/store/client.ts', name: 'takeQueueIncoming' },
      { kind: 'symbol', file: PLAN, name: 'sendIncoming' },
      { kind: 'symbol', file: PLAN, name: 'liveLock' },
    ],
    'REQ-QUEUE-07': [
      { kind: 'symbol', file: PLAN, name: 'addToQueue' },
      { kind: 'symbol', file: PLAN, name: 'fitTimes' },
      { kind: 'symbol', file: PLAN, name: 'spaceOut' },
      { kind: 'symbol', file: PLAN, name: 'takeIncoming' },
      { kind: 'symbol', file: RUN, name: 'mergeAdded' },
    ],
    'REQ-QUEUE-10': [{ kind: 'string', file: COMMAND, includes: 'keepOpen' }],
    'REQ-QUEUE-11': [{ kind: 'symbol', file: EVENTS, name: 'newQueueEvents' }],
    'REQ-QUEUE-12': [
      { kind: 'symbol', file: 'src/twitter/queue/events/types.ts', name: 'QUEUE_EVENT_PATTERNS' },
      { kind: 'symbol', file: EVENTS, name: 'queueContext' },
      { kind: 'string', file: 'src/agentHooks/registry/index.ts', includes: 'scripts/hooks/queue.ts' },
    ],
    'REQ-QUEUE-13': [{ kind: 'symbol', file: EVENTS, name: 'queueContext' }],
    'REQ-QUEUE-14': [
      { kind: 'symbol', file: RUN, name: 'failureOf' },
      { kind: 'symbol', file: RUN, name: 'refusalOf' },
      { kind: 'symbol', file: 'src/twitter/queue/run/types.ts', name: 'MAX_DROPS' },
    ],
  },
  rubrics: {
    'REQ-QUEUE-01': noul('Does planQueue throw before drawing anything when minGap is under the floor, and otherwise draw every event time from the rng it is given (the plan command passing systemRandom) inside the window, at least minGap apart?'),
    'REQ-QUEUE-02': noul('Does runQueue throw before sending anything when approvalProblem finds no approval or a fingerprint that no longer matches the queue?'),
    'REQ-QUEUE-03': noul('Does the while loop in runQueue take one event at a time with todo.shift() and await deps.send for it before taking the next event?'),
    'REQ-QUEUE-04': noul('When an event is due less than plan.minGap seconds after lastActed and no nudge is going, does runQueue move its at to lastActed plus minGap or later and push it back into todo instead of sending it?'),
    'REQ-QUEUE-05': noul('Does the queue run command take the queue lock with takeQueueLock, which takes over a lock whose pid is dead and refuses when a live pid holds it, return queueBusy when it is refused, and release it with releaseQueueLock when the run ends?'),
    'REQ-QUEUE-06': noul('When liveLock(file) is true, does queue add call sendIncoming to add the addition as a queueIncoming row and return without calling saveQueue, and does takeIncoming take every untaken row for that queue and mark it taken in one transaction?'),
    'REQ-QUEUE-07': noul('Does waitUntil call deps.takeAdded while it waits, and does addToQueue place each new item with fitTimes at least minGap from the pending events and then call spaceOut with the new events fixed?'),
    'REQ-QUEUE-08': noul('When an added event is due before dueSeconds plus minGap, does waitUntil return ADDED so runQueue puts the waiting event back and takes the added one first?'),
    'REQ-QUEUE-09': noul('Does addToQueue build the new items with addition.action, so a queue can hold dm, reply and quote items together?'),
    'REQ-QUEUE-10': noul('When todo is empty and deps.keepOpen is true, does the more function in runQueue keep polling deps.takeAdded until something is added or deps.cancelled returns true, and return false when keepOpen is not set?'),
    'REQ-QUEUE-11': noul('Does newQueueEvents read each queue log from the offset saved for the session id (readSessionOffsets) and save the new offsets with writeSessionOffsets for that session?'),
    'REQ-QUEUE-12': noul('Do QUEUE_EVENT_PATTERNS match the held, sent, refused, networkDrop, stopped, cancelled, fellBehind and started lines the run writes, does queueContext open its text with >>> QUEUE, does the hook script write that text as additionalContext, and is the hook registered on SessionStart, UserPromptSubmit and PostToolUse?'),
    'REQ-QUEUE-13': noul('Does queueContext tell the agent to redraft a held item and put it back with twitterQueueEdit, and say for a refused event or a stop that nothing goes out on that account until matt says so?'),
    'REQ-QUEUE-14': noul('When failureOf(answer) is not gone, not tooBig and not network, does runQueue return refusedStop, which sends FAIL, leaves the item status pending without marking the event done or skipped, alerts with mention true naming refusal.code, refusal.detail and refusal.at, and returns state halted with result.refusal set, without waiting and calling deps.send again; and does only a network failure (networkError true and no 429) wait and put the event back into todo, halting once drops passes MAX_DROPS?'),
    'REQ-QUEUE-16': noul('Does QUEUE_ACTIONS include voice and toAPerson treat dm and voice alike in building (user id required), targetOfItem and planning (one send, no like); does the queue check a voice item for an id and words instead of planSend; in src/cli/twitter/helpers/queue.ts does a voice item wait for the catch-up, read the X Chat PIN and refuse xchatPinMissing without it, render with voiceNoteDeps.render, claim the chat with guardSend and send with the engine action xchatVoice; and does the send-time gate pass spoken for a voice item and said from postText whenever an item has one?'),
    'REQ-QUEUE-15': noul('In the engine, does send call author_too_big before like_post_first and follow_author_first for a reply, return event tooBig with code authorTooBig when the author has more than MAX_AUTHOR_FOLLOWERS (1500) followers, and does runQueue, when failureOf returns tooBig, mark the item skipped, drop the event with tooBig and go on to the next event instead of calling refusedStop?'),
    unspecifiedBehavior: noul('Does the queue send an item by a route the specification does not describe, such as sending two items at once, sending without approval, sending sooner than minGap after the last send without a nudge, or sending again after X refused a send?'),
  },
  assertions: {
    'REQ-QUEUE-01': MET,
    'REQ-QUEUE-02': MET,
    'REQ-QUEUE-03': MET,
    'REQ-QUEUE-04': MET,
    'REQ-QUEUE-05': MET,
    'REQ-QUEUE-06': MET,
    'REQ-QUEUE-07': MET,
    'REQ-QUEUE-08': MET,
    'REQ-QUEUE-09': MET,
    'REQ-QUEUE-10': MET,
    'REQ-QUEUE-11': MET,
    'REQ-QUEUE-12': MET,
    'REQ-QUEUE-13': MET,
    'REQ-QUEUE-14': MET,
    'REQ-QUEUE-15': MET,
    'REQ-QUEUE-16': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
