import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const xChat = {
  description: 'X Chat: the prior-conversation drop, reading it with the saved PIN, and reactions and read receipts as follow-ups',
  specPath: 'docs/specs/xChat.md',
  codePaths: ['src/cli/twitter/helpers/queue.ts', 'src/cli/twitter/helpers/dms.ts', 'src/cli/twitter/helpers/chat.ts', 'src/twitter/dm/person/client.ts', 'src/twitter/account/session/client.ts', 'python/twitterApi/engine.py', 'python/twitterApi/inboxSync.py'],
  rubrics: {
    'REQ-XCHAT-01': noul('When a queue has a pending dm item, does queue check call the engine with action xchatContacts, and does xchat_contacts return every participant id of the account\'s X Chat conversations other than the account\'s own id?'),
    'REQ-XCHAT-02': noul('Does queue check set status to skipped and a result starting with priorConversation on every pending dm item whose userId is in the contacts, and save the queue when any was dropped?'),
    'REQ-XCHAT-03': noul('When the xchatContacts answer is not ok, does queue check refuse with code xChatCheckFailed instead of going on?'),
    'REQ-XCHAT-04': noul('Is the xchatContacts read in queue check skipped only when flags["skipXChatCheck"] is true?'),
    'REQ-XCHAT-05': noul('In the dms command, is chatPin set only from secrets?.messengerPin, where secrets comes from context.twenty.loginSecrets, and never from a command flag or argument, does runTwitterEngine write it to a chatPin.txt file in the run\'s temporary folder and pass only its pinPath, and does the engine call client.unlock_xchat with that file\'s text before reading X Chat messages?'),
    'REQ-XCHAT-06': noul('Does chat pin ask with a masked password prompt twice, run the engine with action xchatUnlock, and update messengerPin in Twenty only after that answer is ok?'),
    'REQ-XCHAT-07': noul('Does mergeThreads put a person\'s legacy thread (ids joined by a dash) and X Chat thread (ids joined by a colon) into one row through personKeyOf, and does the dms command read --with through the engine\'s inbox action with withHandle?'),
    'REQ-XCHAT-08': noul('Does reactedOnly return true when the thread\'s last message is not from the account and its lastText is a (reacted ...) marker, and does waitingOnYou return false for such a thread?'),
    'REQ-XCHAT-09': noul('Is openedByThem true only when the account sent last and the other person\'s last_read_event_id in thread_of, or their read-marker event time in inboxSync, is at or past that last message, and does followUpDue return true for a thread where openedNoReply is true?'),
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
