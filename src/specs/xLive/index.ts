import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const ENGINE = 'python/twitterApi/engine.py'
const FEED = 'src/twitter/live/feed/client.ts'
const HOOK = 'scripts/hooks/xLive.ts'
const OFFSETS = 'src/agentHooks/sessionOffsets/client.ts'
const REGISTRY = 'src/agentHooks/registry/index.ts'

export const xLive = {
  description: 'The X notification refresher through the account one session, live.jsonl, and the per-session X live hook',
  specPath: 'docs/specs/xLive.md',
  codePaths: [ENGINE, FEED, 'src/twitter/live/feed/types.ts', HOOK, OFFSETS, REGISTRY],
  anchors: {
    'REQ-XLIVE-01': [
      { kind: 'value', file: ENGINE, name: 'BADGE_POLL_SECONDS', equals: 120 },
      { kind: 'symbol', file: ENGINE, name: 'POLLING_HEADERS' },
      { kind: 'string', file: ENGINE, includes: 'x-twitter-polling' },
      { kind: 'string', file: ENGINE, includes: '/ViewerBadgeCounts' },
      { kind: 'symbol', file: ENGINE, name: 'badge_poll' },
    ],
    'REQ-XLIVE-02': [
      { kind: 'value', file: ENGINE, name: 'LIVE_KINDS', equals: ['like', 'repost', 'reply', 'quote', 'mention', 'follow'] },
      { kind: 'value', file: ENGINE, name: 'LIVE_WINDOW_SECONDS', equals: 86400 },
      { kind: 'string', file: ENGINE, includes: 'ntab_unread_count' },
      { kind: 'symbol', file: ENGINE, name: 'notification_rose' },
      { kind: 'symbol', file: ENGINE, name: 'new_notifications' },
      { kind: 'symbol', file: ENGINE, name: 'live_worthy' },
    ],
    'REQ-XLIVE-03': [
      { kind: 'string', file: ENGINE, includes: 'live.jsonl' },
      { kind: 'string', file: ENGINE, includes: 'seenAt' },
      { kind: 'symbol', file: ENGINE, name: 'append_live' },
    ],
    'REQ-XLIVE-04': [
      { kind: 'string', file: ENGINE, includes: 'pollRefused' },
      { kind: 'string', file: ENGINE, includes: 'notificationsRefused' },
      { kind: 'symbol', file: ENGINE, name: 'network_only' },
    ],
    'REQ-XLIVE-05': [
      { kind: 'symbol', file: REGISTRY, name: 'X_LIVE' },
      { kind: 'string', file: FEED, includes: '>>> X LIVE' },
      { kind: 'symbol', file: FEED, name: 'newLiveEvents' },
      { kind: 'symbol', file: FEED, name: 'xLiveContext' },
    ],
    'REQ-XLIVE-06': [
      { kind: 'symbol', file: OFFSETS, name: 'sessionIdOf' },
      { kind: 'symbol', file: OFFSETS, name: 'readSessionOffsets' },
      { kind: 'symbol', file: OFFSETS, name: 'writeSessionOffsets' },
    ],
    'REQ-XLIVE-07': [{ kind: 'symbol', file: FEED, name: 'networkOnly' }],
  },
  rubrics: {
    'REQ-XLIVE-01': noul('Does xchat_watch start badge_poll, which on every round calls governor.before_request and then gql_get on VIEWER_BADGE_COUNTS with POLLING_HEADERS, then sleeps about BADGE_POLL_SECONDS before the next round?'),
    'REQ-XLIVE-02': noul('Does badge_poll call new_notifications only when notification_rose finds the unread count higher than before, and does new_notifications read one page and keep only rows that live_worthy passes (a kind in LIVE_KINDS and at most LIVE_WINDOW_SECONDS old)?'),
    'REQ-XLIVE-03': noul('Does badge_poll call append_live, which appends a line with the time it was seen to live_path, for every changed count and every new notification event?'),
    'REQ-XLIVE-04': noul('Does badge_poll return, ending the poll, both when a badge read raises an error that is not only a network error and when new_notifications returns a notificationsRefused event, while it keeps polling after a network-only error?'),
    'REQ-XLIVE-05': noul('Is the xLive hook script registered on SessionStart, UserPromptSubmit and PostToolUse, and does it write to process.stdout a JSON object whose hookSpecificOutput.additionalContext is the text xLiveContext built from newLiveEvents, telling the agent to say it to matt first?'),
    'REQ-XLIVE-06': noul('Does the xLive hook pass sessionIdOf of the hook input to newLiveEvents, which reads and writes offsets per session through readSessionOffsets and writeSessionOffsets, starting at the file size on a session first look?'),
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
