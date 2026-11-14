import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const ENGINE = 'python/twitterApi/engine.py'
const STORE = 'python/twitterApi/notifications.py'
const TWIKIT = 'vendor/twikit/twikit/client/client.py'
const FEED = 'src/twitter/notification/feed/client.ts'
const MACHINE = 'src/twitter/notification/unroll/machine.ts'
const UNROLL = 'src/twitter/notification/unroll/client.ts'
const UNROLL_TYPES = 'src/twitter/notification/unroll/types.ts'
const COMMAND = 'src/cli/twitter/helpers/notifications.ts'

export const xNotifications = {
  description: "An X account's notifications kept one row per person per thing, with each post's whole likers and reposters lists unrolled into the same rows by one state machine",
  specPath: 'docs/specs/xNotifications.md',
  codePaths: [ENGINE, STORE, TWIKIT, FEED, 'src/twitter/notification/feed/types.ts', MACHINE, UNROLL, UNROLL_TYPES, COMMAND],
  anchors: {
    'REQ-XNOTIFICATIONS-01': [
      { kind: 'value', file: STORE, name: 'PAGE_SIZE', equals: 40 },
      { kind: 'symbol', file: STORE, name: 'sync_notifications' },
      { kind: 'symbol', file: STORE, name: 'rows_of' },
      { kind: 'symbol', file: ENGINE, name: 'notifications' },
    ],
    'REQ-XNOTIFICATIONS-02': [
      { kind: 'symbol', file: ENGINE, name: 'post_engagers' },
      { kind: 'value', file: ENGINE, name: 'ENGAGER_OPERATIONS', equals: { like: 'Favoriters', repost: 'Retweeters' } },
      { kind: 'value', file: ENGINE, name: 'ENGAGER_CALL_PAGES', equals: 5 },
      { kind: 'value', file: STORE, name: 'ENGAGER_PAGE_SIZE', equals: 40 },
      { kind: 'string', file: ENGINE, includes: 'engagersOperationUnknown' },
      { kind: 'string', file: ENGINE, includes: 'bundle\\.TweetActivity' },
      { kind: 'symbol', file: TWIKIT, name: 'get_favoriters' },
      { kind: 'symbol', file: TWIKIT, name: 'get_retweeters' },
    ],
    'REQ-XNOTIFICATIONS-03': [
      { kind: 'symbol', file: STORE, name: 'unroll_engagers' },
      { kind: 'symbol', file: STORE, name: 'engager_rows' },
      { kind: 'symbol', file: STORE, name: 'add_rows' },
      { kind: 'value', file: STORE, name: 'VERSION', equals: 1 },
      { kind: 'symbol', file: STORE, name: 'read_store' },
    ],
    'REQ-XNOTIFICATIONS-04': [
      { kind: 'symbol', file: STORE, name: 'empty_progress' },
      { kind: 'symbol', file: STORE, name: 'unroll_engagers' },
      { kind: 'symbol', file: TWIKIT, name: '_get_tweet_engagements' },
    ],
    'REQ-XNOTIFICATIONS-05': [
      { kind: 'symbol', file: MACHINE, name: 'notificationUnrollMachine' },
      { kind: 'symbol', file: MACHINE, name: 'choosePosts' },
      { kind: 'symbol', file: FEED, name: 'unrollCandidatesOf' },
      { kind: 'symbol', file: UNROLL, name: 'runNotificationUnroll' },
      { kind: 'value', file: UNROLL_TYPES, name: 'UNROLL_CALL_PAGES', equals: 5 },
      { kind: 'value', file: UNROLL_TYPES, name: 'UNROLL_RUN_PAGES', equals: 40 },
    ],
    'REQ-XNOTIFICATIONS-06': [
      { kind: 'symbol', file: COMMAND, name: 'notificationsCommand' },
      { kind: 'symbol', file: UNROLL, name: 'engagerLine' },
      { kind: 'symbol', file: UNROLL, name: 'unrollReportOf' },
      { kind: 'symbol', file: FEED, name: 'engagerSummaryOf' },
    ],
  },
  rubrics: {
    'REQ-XNOTIFICATIONS-01': noul('Does sync_notifications read the newest pages until a page adds fewer rows than it holds, then with full page back from the stored bottomCursor, writing the store after every page and calling pace between pages; does rows_of make one row per user per target under kind:userId:postId with source notification and skip the account itself; and does the engine notifications action answer rateLimited on TooManyRequests and governorBlocked on GovernorBlockedError with the kept row count?'),
    'REQ-XNOTIFICATIONS-02': noul('Is postEngagers in READS; does post_engagers return engagersOperationUnknown without calling the client when the operation named by ENGAGER_OPERATIONS is missing from gql.LIVE_OPERATIONS; does it call client.get_favoriters for like and client.get_retweeters for repost with ENGAGER_PAGE_SIZE and the stored cursor, on the client it was handed and no other; does its pace sleep READ_SPACING_SECONDS and call governor.before_request between pages; and does it return rateLimited with event throttled on TooManyRequests and governorBlocked on GovernorBlockedError?'),
    'REQ-XNOTIFICATIONS-03': noul('Does engager_rows key each person kind:userId:postId with at None and source engagements and skip the account itself; does add_rows leave an existing row in place, keep its earliest at, and change source to notification only when a notification row arrives for a row that was engagements; and does read_store accept the same VERSION and add an empty engagements to a store that has none, without dropping rows?'),
    'REQ-XNOTIFICATIONS-04': noul('Does unroll_engagers write the store after every page with the cursor, done, pages, seen, added and syncedAt for that post and kind; mark done when a page has no users, no next_cursor or the same cursor; resume from the held cursor when the held progress is not done; and start again from an empty progress when it is done?'),
    'REQ-XNOTIFICATIONS-05': noul('Does notificationUnrollMachine use setup with named guards and actions, invoke syncFeed, choosePosts, readLikers and readReposters each with an onError that goes to crashed, send a refused answer from any of them to the final state stopped without invoking again, stop with the page cap when pagesLeft is below one, and end in the final states done, stopped or crashed; and does choosePosts put the post from the input first with both kinds wanted and add unrollCandidatesOf only when everyPost is set?'),
    'REQ-XNOTIFICATIONS-06': noul('Does notificationsCommand run runNotificationUnroll for every read that is not --stored, pass --full as everyPost, print engagerLine for each unrolled post or the --post post with from notifications, added by unrolling and the total, print a line saying the unroll stopped before the end when it did, exit 1 when an answer was refused, and put unroll and engagerPosts in the --json answer?'),
    unspecifiedBehavior: noul('Is there a path where the unroll opens a second X session or client, retries after a refused answer, counts one person twice for the same post and kind, or drops rows the store already held, that the specification does not describe?'),
  },
  assertions: {
    'REQ-XNOTIFICATIONS-01': MET,
    'REQ-XNOTIFICATIONS-02': MET,
    'REQ-XNOTIFICATIONS-03': MET,
    'REQ-XNOTIFICATIONS-04': MET,
    'REQ-XNOTIFICATIONS-05': MET,
    'REQ-XNOTIFICATIONS-06': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
