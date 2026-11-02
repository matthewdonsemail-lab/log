import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const QUEUE = 'src/cli/twitter/helpers/queue.ts'
const DMS = 'src/cli/twitter/helpers/dms.ts'
const CHAT = 'src/cli/twitter/helpers/chat.ts'
const PERSON = 'src/twitter/dm/person/client.ts'
const SESSION = 'src/twitter/account/session/client.ts'
const ENGINE = 'python/twitterApi/engine.py'
const SYNC = 'python/twitterApi/inboxSync.py'
const TWIKIT = 'vendor/twikit/twikit/client/client.py'

export const xChat = {
  description: 'X Chat: the prior-conversation drop, reading it with the saved PIN, and reactions and read receipts as follow-ups',
  specPath: 'docs/specs/xChat.md',
  codePaths: [QUEUE, DMS, CHAT, PERSON, SESSION, ENGINE, SYNC],
  anchors: {
    'REQ-XCHAT-01': [
      { kind: 'string', file: QUEUE, includes: 'xchatContacts' },
      { kind: 'symbol', file: ENGINE, name: 'xchat_contacts' },
      { kind: 'symbol', file: TWIKIT, name: 'get_xchat_conversations' },
    ],
    'REQ-XCHAT-02': [{ kind: 'string', file: QUEUE, includes: 'priorConversation' }],
    'REQ-XCHAT-03': [{ kind: 'string', file: QUEUE, includes: 'xChatCheckFailed' }],
    'REQ-XCHAT-04': [{ kind: 'string', file: QUEUE, includes: 'skipXChatCheck' }],
    'REQ-XCHAT-05': [
      { kind: 'string', file: SESSION, includes: 'chatPin.txt' },
      { kind: 'string', file: ENGINE, includes: 'pinPath' },
      { kind: 'symbol', file: TWIKIT, name: 'unlock_xchat' },
      { kind: 'symbol', file: TWIKIT, name: 'get_xchat_messages' },
    ],
    'REQ-XCHAT-06': [
      { kind: 'string', file: CHAT, includes: 'xchatUnlock' },
      { kind: 'symbol', file: CHAT, name: 'isChatPin' },
    ],
    'REQ-XCHAT-07': [
      { kind: 'symbol', file: PERSON, name: 'mergeThreads' },
      { kind: 'symbol', file: PERSON, name: 'personKeyOf' },
    ],
    'REQ-XCHAT-08': [
      { kind: 'symbol', file: PERSON, name: 'reactedOnly' },
      { kind: 'symbol', file: PERSON, name: 'waitingOnYou' },
    ],
    'REQ-XCHAT-09': [
      { kind: 'symbol', file: PERSON, name: 'openedNoReply' },
      { kind: 'symbol', file: PERSON, name: 'followUpDue' },
      { kind: 'string', file: ENGINE, includes: 'last_read_event_id' },
      { kind: 'string', file: ENGINE, includes: 'openedByThem' },
      { kind: 'string', file: SYNC, includes: 'openedByThem' },
    ],
    'REQ-XCHAT-10': [{ kind: 'string', file: DMS, includes: '[--waiting]' }],
  },
  rubrics: {
    'REQ-XCHAT-01': noul('When a queue has a pending dm item, does queue check call the engine with action xchatContacts, and does xchat_contacts return every participant id of the account X Chat conversations other than the account own id?'),
    'REQ-XCHAT-02': noul('Does queue check set status to skipped and a result starting with priorConversation on every pending dm item whose userId is in the contacts, and save the queue when any was dropped?'),
    'REQ-XCHAT-03': noul('When the xchatContacts answer is not ok, does queue check refuse and return at once instead of going on with the dms unchecked?'),
    'REQ-XCHAT-04': noul('Is the xchatContacts read in queue check skipped only when the skipXChatCheck flag is true, and never for any other flag or by default?'),
    'REQ-XCHAT-05': noul('In the dms command, is chatPin set only from secrets?.messengerPin, where secrets comes from context.twenty.loginSecrets, and never from a command flag or argument, does runTwitterEngine write it to a file in the run temporary folder and pass only its pinPath, and does the engine call client.unlock_xchat with that file text before reading X Chat messages?'),
    'REQ-XCHAT-06': noul('Does chat pin ask with a masked password prompt twice, run the engine with action xchatUnlock, and update messengerPin in Twenty only after that answer is ok, never printing the PIN?'),
    'REQ-XCHAT-07': noul('Does mergeThreads put a person legacy thread (ids joined by a dash) and X Chat thread (ids joined by a colon) into one row through personKeyOf, and does the dms command read --with through the engine inbox action with withHandle?'),
    'REQ-XCHAT-08': noul('Does reactedOnly return true when the thread last message is not from the account and its lastText is a (reacted ...) marker, and does waitingOnYou return false for such a thread?'),
    'REQ-XCHAT-09': noul('Is openedByThem true only when the account sent last and the other person last_read_event_id in thread_of, or their read-marker event time in inboxSync, is at or past that last message, and does followUpDue return true for a thread where openedNoReply is true?'),
    'REQ-XCHAT-10': noul('With --waiting, does the dms command keep only the threads where waitingOnYou is true, list the followUpDue threads apart as follow-ups, and put them in followUps with --json?'),
    unspecifiedBehavior: noul('Is there a path where X Chat is read through a browser, the PIN is printed or passed as a flag, or a pending dm skips the prior-conversation check without --skipXChatCheck, that the specification does not describe?'),
  },
  assertions: {
    'REQ-XCHAT-01': MET,
    'REQ-XCHAT-02': MET,
    'REQ-XCHAT-03': MET,
    'REQ-XCHAT-04': MET,
    'REQ-XCHAT-05': MET,
    'REQ-XCHAT-06': MET,
    'REQ-XCHAT-07': MET,
    'REQ-XCHAT-08': MET,
    'REQ-XCHAT-09': MET,
    'REQ-XCHAT-10': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
