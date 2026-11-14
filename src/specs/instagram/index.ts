import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const SESSION = 'src/instagram/account/session/client.ts'
const COMMAND = 'src/cli/instagram/index.ts'
const PLATFORMS = 'src/cli/runner/helpers/platforms.ts'
const ROUTES = 'src/directApi/engine/client.ts'
const ENGINE = 'python/instagramApi/engine.py'
const INBOX = 'src/inbox/watch/client.ts'
const HOOK = 'scripts/hooks/inbox.ts'
const WATCHERS = 'src/platformKit/watcher/types.ts'
const HOST = 'python/instagramApi/host.py'

export const instagram = {
  description: 'Instagram: the account session, its engine, its own answer recorded, and its wiring',
  specPath: 'docs/specs/instagram.md',
  codePaths: [SESSION, COMMAND, PLATFORMS, ROUTES, ENGINE, HOST, INBOX, HOOK],
  anchors: {
    'REQ-INSTAGRAM-01': [
      { kind: 'symbol', file: SESSION, name: 'INSTAGRAM_PLATFORM' },
      { kind: 'symbol', file: SESSION, name: 'findInstagramAccount' },
      { kind: 'symbol', file: SESSION, name: 'instagramGate' },
      { kind: 'string', file: SESSION, includes: 'INSTAGRAM' },
    ],
    'REQ-INSTAGRAM-02': [
      { kind: 'symbol', file: SESSION, name: 'runInstagramEngine' },
      { kind: 'string', file: SESSION, includes: 'instagramApi' },
    ],
    'REQ-INSTAGRAM-03': [
      { kind: 'symbol', file: SESSION, name: 'recordInstagramSession' },
      { kind: 'symbol', file: COMMAND, name: 'instagramSessionCommand' },
    ],
    'REQ-INSTAGRAM-05': [
      { kind: 'string', file: ENGINE, includes: 'vendor/instagrapi' },
      { kind: 'string', file: ENGINE, includes: 'curl' },
      { kind: 'string', file: ENGINE, includes: 'challenged' },
      { kind: 'string', file: 'python/checks/instagramTransport.py', includes: 'public_transport' },
      { kind: 'string', file: ENGINE, includes: 'sessionMismatch' },
    ],
    'REQ-INSTAGRAM-06': [
      { kind: 'symbol', file: COMMAND, name: 'instagramDmsCommand' },
      { kind: 'string', file: ENGINE, includes: 'threadAmbiguous' },
      { kind: 'string', file: ENGINE, includes: 'threadNeeded' },
      { kind: 'string', file: ENGINE, includes: 'voice_media' },
    ],
    'REQ-INSTAGRAM-07': [
      { kind: 'symbol', file: COMMAND, name: 'instagramSendCommand' },
      { kind: 'string', file: ENGINE, includes: 'nothingToSend' },
      { kind: 'string', file: ENGINE, includes: 'photoMissing' },
      { kind: 'string', file: COMMAND, includes: 'aiArtifacts' },
    ],
    'REQ-INSTAGRAM-08': [
      { kind: 'symbol', file: COMMAND, name: 'instagramWatchCommand' },
      { kind: 'string', file: ENGINE, includes: 'realtimeDropped' },
      { kind: 'string', file: INBOX, includes: 'instagram' },
      { kind: 'string', file: WATCHERS, includes: 'instagram' },
      { kind: 'uses', file: HOOK, name: 'superviseLocalWatchers' },
    ],
    'REQ-INSTAGRAM-09': [
      { kind: 'string', file: HOST, includes: 'instagramSessionHostDown' },
      { kind: 'string', file: HOST, includes: 'host.lock' },
      { kind: 'string', file: ENGINE, includes: 'LOG_INSTAGRAM_HOST' },
      { kind: 'string', file: ENGINE, includes: 'reused' },
    ],
    'REQ-INSTAGRAM-04': [
      { kind: 'string', file: PLATFORMS, includes: 'instagram' },
      { kind: 'string', file: ROUTES, includes: 'instagram' },
    ],
  },
  rubrics: {
    'REQ-INSTAGRAM-01': noul('Does findInstagramAccount find the account through findPlatformAccount with INSTAGRAM_PLATFORM, whose twentyPlatform is INSTAGRAM, and does instagramGate check it with platformGate before the engine runs?'),
    'REQ-INSTAGRAM-02': noul('Does runInstagramEngine run the account through runPlatformEngine with INSTAGRAM_PLATFORM, whose engine is python/instagramApi/engine.py?'),
    'REQ-INSTAGRAM-03': noul('Does the instagram session check command send nothing to Instagram beyond the check, and record the answer Instagram gave through recordInstagramSession, which merges refreshed cookies for INSTAGRAM_COOKIE_DOMAIN back into the row?'),
    'REQ-INSTAGRAM-05': noul('Does ping in python/instagramApi/engine.py answer sessionDead without calling Instagram when the cookies have no sessionid, and otherwise sign in only through the vendored instagrapi Client with login_by_sessionid, its private transport set to curl, answering sessionMismatch when the user Instagram returns differs from the cookies\' ds_user_id, and challenged, rateLimited or sessionDead for instagrapi\'s challenge, rate limit and login errors?'),
    'REQ-INSTAGRAM-06': noul('Does instagramDmsCommand call the engine with action inbox without --with and action thread with it, and do the engine\'s inbox and thread read only through instagrapi\'s direct_threads and direct_thread (never a send or a mark-seen call), answering threadNeeded before any call when no thread is named, threadNotFound when none matches, and threadAmbiguous with the candidates when several do?'),
    'REQ-INSTAGRAM-07': noul("Does instagramSendCommand refuse --live without --approvedBy and refuse copy with aiArtifacts before any call, make a dry run that calls nothing without --live, and send with --live only through the engine's send action, which answers nothingToSend or photoMissing before calling Instagram and otherwise sends through instagrapi's direct_send_photo then direct_send one line at a time (one message unless asOne), stopping at the first refusal with what was sent reported?"),
    'REQ-INSTAGRAM-08': noul("Does instagramWatchCommand run the engine's watch through directInstagramLive, which connects instagrapi's realtime client, subscribes to the DM sync, pings while it waits and emits each new message as a live event, and with --inbox add only messages not from the account to the inbox; and does the inbox hook start the Instagram watch from WATCH_COMMANDS through superviseLocalWatchers for every signed-in Instagram account not cooling off, stop stale watchers, and give the agent a NEW INSTAGRAM MESSAGE block that answers through instagramDms, voice and instagramSendLive, never the browser?"),
    'REQ-INSTAGRAM-09': noul("Does every Instagram engine call go through host.py's call to the account's one host process (unless LOG_INSTAGRAM_HOST is inline), which takes host.lock so a second host can't start, keeps one signed-in instagrapi client that later calls reuse (answering reused) and one realtime connection that every watch shares as a listener, runs the calls other than watch one at a time, and when the host can't be reached answers instagramSessionHostDown without opening a session of its own?"),
    'REQ-INSTAGRAM-04': noul('Is instagram listed in PLATFORMS and PLATFORM_SITES, and does DIRECT_ROUTES have a instagramSession route for platform instagram?'),
    unspecifiedBehavior: noul('Does the Instagram code call Instagram outside the engine and its governor, or record anything but the answer Instagram gave, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-INSTAGRAM-01': MET,
    'REQ-INSTAGRAM-02': MET,
    'REQ-INSTAGRAM-03': MET,
    'REQ-INSTAGRAM-04': MET,
    'REQ-INSTAGRAM-05': MET,
    'REQ-INSTAGRAM-06': MET,
    'REQ-INSTAGRAM-07': MET,
    'REQ-INSTAGRAM-08': MET,
    'REQ-INSTAGRAM-09': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
