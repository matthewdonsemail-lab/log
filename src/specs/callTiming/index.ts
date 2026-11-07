import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const TIMING = 'src/observability/timing/client.ts'
const REPORT = 'src/observability/timing/helpers/report.ts'
const SHAPE = 'src/observability/timing/helpers/spanShape.ts'
const SERVER = 'src/mcp/server/index.ts'
const BIN = 'bin/log.ts'
const COMMAND = 'src/cli/timing/index.ts'
const PY = 'python/platformKit/timing.py'
const PLATFORM = 'src/platformKit/session/client.ts'
const TWITTER = 'src/twitter/account/session/client.ts'
const FBK = 'src/directApi/engine/client.ts'
const X_ENGINE = 'python/twitterApi/engine.py'
const X_HOST = 'python/twitterApi/host.py'
const KIT = 'python/platformKit/engine.py'
const IG_HOST = 'python/instagramApi/host.py'
const VOICE = 'src/cli/twitter/helpers/voice.ts'
const CATCH_UP = 'src/inbox/catchUp/client.ts'
const DB_READ = 'src/inbox/dbRead/client.ts'
const CLAIMS = 'src/inbox/claims/client.ts'
const STORE = 'src/inbox/store/client.ts'

export const callTiming = {
  description: 'Every call timed: a call id, every stage a span across Bun and Python, stored in log.db and reported as p50, p95 and p99',
  specPath: 'docs/specs/callTiming.md',
  codePaths: [TIMING, REPORT, SHAPE, SERVER, BIN, COMMAND, PY, PLATFORM, TWITTER, FBK, X_ENGINE, X_HOST, KIT, IG_HOST, VOICE, CATCH_UP, DB_READ, CLAIMS, STORE],
  anchors: {
    'REQ-TIMING-01': [
      { kind: 'symbol', file: TIMING, name: 'timeCall' },
      { kind: 'symbol', file: TIMING, name: 'timed' },
      { kind: 'symbol', file: TIMING, name: 'instrumentFetch' },
      { kind: 'symbol', file: SHAPE, name: 'urlName' },
      { kind: 'uses', file: SERVER, name: 'timeCall' },
      { kind: 'uses', file: BIN, name: 'timeCall' },
    ],
    'REQ-TIMING-02': [
      { kind: 'symbol', file: TIMING, name: 'timedEngineSync' },
      { kind: 'symbol', file: TIMING, name: 'harvestEngine' },
      { kind: 'uses', file: PLATFORM, name: 'timedEngineSync' },
      { kind: 'uses', file: TWITTER, name: 'timedEngineSync' },
      { kind: 'uses', file: FBK, name: 'timedEngineSync' },
      { kind: 'symbol', file: PY, name: 'instrument_curl' },
      { kind: 'symbol', file: PY, name: 'child_trace' },
      { kind: 'string', file: X_HOST, includes: 'host.roundTrip' },
      { kind: 'string', file: X_ENGINE, includes: 'account.lock' },
      { kind: 'string', file: KIT, includes: 'governor' }, { kind: 'uses', file: KIT, name: 'timing' },
      { kind: 'string', file: IG_HOST, includes: 'host.queue' },
    ],
    'REQ-TIMING-03': [
      { kind: 'string', file: VOICE, includes: 'voice.gate' },
      { kind: 'string', file: CATCH_UP, includes: 'inbox.waitCaughtUp' },
      { kind: 'string', file: DB_READ, includes: 'inbox.readSource' },
      { kind: 'string', file: CLAIMS, includes: 'inbox.claim' },
    ],
    'REQ-TIMING-04': [
      { kind: 'string', file: STORE, includes: 'CREATE TABLE IF NOT EXISTS spans' },
      { kind: 'symbol', file: REPORT, name: 'toolStats' },
      { kind: 'symbol', file: REPORT, name: 'waterfallLines' },
      { kind: 'symbol', file: COMMAND, name: 'timingCommand' },
      { kind: 'uses', file: TIMING, name: 'LOG_OTLP_URL' },
    ],
  },
  rubrics: {
    'REQ-TIMING-01': noul('Does runGuarded in src/mcp/server/index.ts run every tool call through timeCall and write the call id on the ▶ line and the call id with its duration on the ■ line, does bin/log.ts run the terminal command through timeCall, do timed and timedSync record a span with its parent, start, length, ok and attributes only when a call is active and otherwise just run the work, and does instrumentFetch patch fetch once so a request inside a call becomes a span named by urlName with its status?'),
    'REQ-TIMING-02': noul('Do runTwitterEngine, runTwitterEngineLive, runPlatformEngine, runPlatformEngineLive and spawnEngine each run through timedEngineSync or timedEngine and put the trace into the spec they write; does python/platformKit/timing.py begin from spec trace, record nested spans with contextvars, patch curl_cffi Session.request and AsyncSession.request once, and attach the spans and the boot time to the answer; do the X host and the Instagram host record host.queue, does host.call record host.connect and host.roundTrip and send child_trace as the trace; does the X engine record account.lock, spacing, governor, client, action and session.keep, and the platform kit governor and action; and does harvestEngine remove spans and bootAt from the answer, store them under the engine span and add python.start?'),
    'REQ-TIMING-03': noul('Are waitCaughtUp, readSourceFor and claimChat each wrapped in a span named inbox.waitCaughtUp, inbox.readSource and inbox.claim that records what it decided, and is gateSend a voice.gate span whose steps voice.sameness, voice.chatContext, voice.room, voice.rankedContext, voice.evidence and voice.reading (and voice.briefReading in gateBrief) are spans of their own?'),
    'REQ-TIMING-04': noul('Does timeCall store every span of the call in the spans table of log.db in one transaction, delete spans older than 90 days once per process, swallow any storing or export error, and post OTLP JSON to LOG_OTLP_URL/v1/traces when it is set; does toolStats give p50, p95 and p99 per tool and per stage with a share and an unaccounted stage; and does timingCommand show the report, a waterfall for --call, and refuse an unknown call with callTimingMissing?'),
    unspecifiedBehavior: noul('Does the timing layer change what any command sends, block or slow a call by more than writing its spans, put a cookie, token or message text into a span name or attribute, or fail a call because timing failed, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-TIMING-01': MET,
    'REQ-TIMING-02': MET,
    'REQ-TIMING-03': MET,
    'REQ-TIMING-04': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
