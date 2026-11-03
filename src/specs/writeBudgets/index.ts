import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const TYPES = 'src/directApi/engine/types.ts'
const X_SESSION = 'src/twitter/account/session/client.ts'
const KIT_SESSION = 'src/platformKit/session/client.ts'
const X_ENGINE = 'python/twitterApi/engine.py'
const KIT_ENGINE = 'python/platformKit/engine.py'
const DISCORD = 'python/discordApi/engine.py'
const LINKEDIN = 'python/linkedinApi/engine.py'
const SEND = 'src/cli/twitter/helpers/send.ts'
const QUEUE = 'src/cli/twitter/helpers/queue.ts'
const TRANSPORT = 'vendor/openLinkedinApi/open_linkedin_api/transport.py'

export const writeBudgets = {
  description: 'Each platform daily write budget, --force past the governor, and stopping on a refusal',
  specPath: 'docs/specs/writeBudgets.md',
  codePaths: [TYPES, X_SESSION, KIT_SESSION, KIT_ENGINE, X_ENGINE, DISCORD, LINKEDIN, SEND, QUEUE, TRANSPORT, 'vendor/openLinkedinApi/open_linkedin_api/client.py'],
  anchors: {
    'REQ-BUDGET-01': [
      { kind: 'value', file: TYPES, name: 'WRITES_PER_DAY', path: ['twitter'], equals: 240 },
      { kind: 'value', file: TYPES, name: 'WRITES_PER_DAY', path: ['discord'], equals: 120 },
      { kind: 'value', file: TYPES, name: 'WRITES_PER_DAY', path: ['linkedin'], equals: 10 },
      { kind: 'value', file: TYPES, name: 'WRITES_PER_DAY_DEFAULT', equals: 40 },
      { kind: 'symbol', file: TYPES, name: 'writesPerDayOf' },
    ],
    'REQ-BUDGET-02': [
      { kind: 'symbol', file: X_SESSION, name: 'runTwitterEngine' },
      { kind: 'symbol', file: X_SESSION, name: 'runTwitterEngineLive' },
    ],
    'REQ-BUDGET-03': [
      { kind: 'symbol', file: X_ENGINE, name: 'governor_for' },
      { kind: 'symbol', file: KIT_ENGINE, name: 'governor_for' },
      { kind: 'string', file: X_ENGINE, includes: 'FBK_GOVERNOR_MUTATION_DAILY' },
      { kind: 'string', file: KIT_ENGINE, includes: 'FBK_GOVERNOR_MUTATION_DAILY' },
    ],
    'REQ-BUDGET-04': [
      { kind: 'symbol', file: X_ENGINE, name: 'run_locked' },
      { kind: 'symbol', file: KIT_ENGINE, name: 'run' },
      { kind: 'string', file: X_ENGINE, includes: 'governorBlocked' },
      { kind: 'string', file: KIT_ENGINE, includes: 'governorBlocked' },
    ],
    'REQ-BUDGET-06': [
      { kind: 'symbol', file: SEND, name: 'FORCE' },
      { kind: 'string', file: QUEUE, includes: '[--force]' },
    ],
    'REQ-BUDGET-07': [{ kind: 'string', file: X_ENGINE, includes: 'forcedPast' }],
    'REQ-BUDGET-08': [{ kind: 'symbol', file: X_ENGINE, name: 'count_forced' }],
    'REQ-BUDGET-09': [
      { kind: 'string', file: X_ENGINE, includes: 'dailyLimit' },
      { kind: 'string', file: KIT_ENGINE, includes: 'dailyLimit' },
    ],
    'REQ-BUDGET-10': [{ kind: 'symbol', file: DISCORD, name: 'history_of' }],
    'REQ-BUDGET-11': [
      { kind: 'string', file: DISCORD, includes: 'rateLimited' },
      { kind: 'string', file: LINKEDIN, includes: 'rateLimited' },
    ],
    'REQ-BUDGET-12': [
      { kind: 'value', file: TRANSPORT, name: 'IMPERSONATE', equals: 'chrome150' },
      { kind: 'symbol', file: TRANSPORT, name: 'new_session' },
      { kind: 'symbol', file: 'python/checks/linkedinTransport.py', name: 'problems_in' },
    ],
    'REQ-BUDGET-13': [
      { kind: 'symbol', file: DISCORD, name: 'export_of' },
      { kind: 'symbol', file: DISCORD, name: 'refusal_of' },
    ],
  },
  rubrics: {
    'REQ-BUDGET-01': noul('Does writesPerDayOf return the WRITES_PER_DAY entry for a platform listed there, and WRITES_PER_DAY_DEFAULT for any other platform?'),
    'REQ-BUDGET-02': noul('Do runTwitterEngine, runTwitterEngineLive and the platform kit session client write writesPerDay from writesPerDayOf of the account platform into every engine spec they write?'),
    'REQ-BUDGET-03': noul('Do governor_for in python/twitterApi/engine.py and in python/platformKit/engine.py set mutation_daily_cap to writes_per_day only when FBK_GOVERNOR_MUTATION_DAILY is not in the environment?'),
    'REQ-BUDGET-04': noul('Do run_locked in the X engine and run in the platform kit engine call governor.before_request, with is_mutation true when the action is a write, before the action runs, and return the governor refusal without running the action when GovernorBlockedError is raised and force is not set?'),
    'REQ-BUDGET-05': noul('Does the X engine run_locked go past GovernorBlockedError only when spec.get("force") is True, and does the platform kit engine run always return its governor refusal on GovernorBlockedError whatever the spec says?'),
    'REQ-BUDGET-06': noul('Do the send command and queue run add force: true to the engine spec only when the force flag is true, leaving the spec without force otherwise?'),
    'REQ-BUDGET-07': noul('When run_locked went past the governor, does it set out["forcedPast"] to the governor refusal text?'),
    'REQ-BUDGET-08': noul('When run_locked goes past GovernorBlockedError because force is set, does it call count_forced, which adds the request to the governor hour_count and day_count, and to mutation_count for a write, and persists them?'),
    'REQ-BUDGET-09': noul('When the answer event is throttled, dropped, automated or dailyLimit, do run_locked in the X engine and run in the platform kit engine call governor.observe_soft_block()?'),
    'REQ-BUDGET-10': noul('When Discord answers 429 in history_of, does it return the messages read so far with a refusal and stop paging without asking for that page again?'),
    'REQ-BUDGET-11': noul('When Discord or LinkedIn answers 429 to the session check, does the engine answer code rateLimited with event throttled rather than a logged in or logged out state?'),
    'REQ-BUDGET-12': noul('Does new_session return a curl_cffi Session with impersonate set to IMPERSONATE, and do the Client REQUEST_HEADERS carry no User-Agent of their own?'),
    'REQ-BUDGET-13': noul('In python/discordApi/engine.py, when history_of returns a refused stop (an HTTP status other than 200) for one conversation, does export_of return at once with the conversations read so far, stopped naming that conversationId and the httpStatus and answer Discord gave, without reading any later conversation, while a network drop (no status) only adds to problems and goes on to the next one?'),
    unspecifiedBehavior: noul('Is there a path where a platform write is sent without the account governor being asked first, or goes past the governor without force set, that the specification does not describe?'),
  },
  assertions: {
    'REQ-BUDGET-01': MET,
    'REQ-BUDGET-02': MET,
    'REQ-BUDGET-03': MET,
    'REQ-BUDGET-04': MET,
    'REQ-BUDGET-05': MET,
    'REQ-BUDGET-06': MET,
    'REQ-BUDGET-07': MET,
    'REQ-BUDGET-08': MET,
    'REQ-BUDGET-09': MET,
    'REQ-BUDGET-10': MET,
    'REQ-BUDGET-11': MET,
    'REQ-BUDGET-12': MET,
    'REQ-BUDGET-13': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
