import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const xLive = {
  description: 'X\'s notification refresher through the account\'s one session, live.jsonl, and the per-session X live hook',
  specPath: 'docs/specs/xLive.md',
  codePaths: ['python/twitterApi/engine.py', 'src/twitter/live/feed/client.ts', 'src/twitter/live/feed/types.ts', 'scripts/hooks/xLive.ts', 'src/agentHooks/sessionOffsets/client.ts'],
  rubrics: {
    'REQ-XLIVE-01': noul('Does xchat_watch start badge_poll, which calls governor.before_request and then gql_get on VIEWER_BADGE_COUNTS with POLLING_HEADERS (x-twitter-polling true) about every BADGE_POLL_SECONDS of 120?'),
    'REQ-XLIVE-02': noul('Does badge_poll call new_notifications only when notification_rose finds ntab_unread_count higher than before, and does new_notifications read one page and keep only rows that live_worthy passes (a kind in LIVE_KINDS and at most LIVE_WINDOW_SECONDS old)?'),
    'REQ-XLIVE-03': noul('Does badge_poll call append_live, which appends a line with seenAt to live_path (live.jsonl in the account\'s state folder), for every changed count and every new notification event?'),
    'REQ-XLIVE-04': noul('Does badge_poll return, ending the poll, both when a badge read raises an error that is not only a network error and when new_notifications returns a notificationsRefused event, while it keeps polling after a network-only error?'),
    'REQ-XLIVE-05': noul('Does the xLive hook write to process.stdout a JSON object whose hookSpecificOutput.additionalContext is the text xLiveContext built from newLiveEvents, text that starts with >>> X LIVE?'),
    'REQ-XLIVE-06': noul('Does the xLive hook pass sessionIdOf of the hook input to newLiveEvents, which reads and writes offsets per session through readSessionOffsets and writeSessionOffsets, starting at the file\'s size on a session\'s first look?'),
    'REQ-XLIVE-07': noul('When the events hold a pollRefused that networkOnly is false for, or a notificationsRefused, does xLiveContext add the line saying the live poll stopped on that account and nothing resumes until matt says?'),
    unspecifiedBehavior: noul('Is there a path where the live poll keeps reading after X refused a read, polls faster than the spec says, or shares one offset between Claude sessions, that the specification does not describe?'),
  },
  assertions: {
    'REQ-XLIVE-01': MET,
    'REQ-XLIVE-02': MET,
    'REQ-XLIVE-03': MET,
    'REQ-XLIVE-04': MET,
    'REQ-XLIVE-05': MET,
    'REQ-XLIVE-06': MET,
    'REQ-XLIVE-07': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
