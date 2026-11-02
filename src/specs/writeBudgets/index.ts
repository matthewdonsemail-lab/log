import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const writeBudgets = {
  description: 'Each platform\'s daily write budget, --force past the governor, and stopping on a refusal',
  specPath: 'docs/specs/writeBudgets.md',
  codePaths: ['src/directApi/engine/types.ts', 'src/twitter/account/session/client.ts', 'src/platformKit/session/client.ts', 'python/platformKit/engine.py', 'python/twitterApi/engine.py', 'python/discordApi/engine.py', 'python/linkedinApi/engine.py', 'src/cli/twitter/helpers/send.ts', 'vendor/openLinkedinApi/open_linkedin_api/transport.py', 'vendor/openLinkedinApi/open_linkedin_api/client.py'],
  rubrics: {
    'REQ-BUDGET-01': noul('Does WRITES_PER_DAY map twitter to 240, discord to 60 and linkedin to 10, and does writesPerDayOf return WRITES_PER_DAY_DEFAULT of 40 for any other platform?'),
    'REQ-BUDGET-02': noul('Do runTwitterEngine, runTwitterEngineLive and the platform kit session client write writesPerDay from writesPerDayOf of the account\'s platform into every engine spec?'),
    'REQ-BUDGET-03': noul('Do governor_for in python/twitterApi/engine.py and in python/platformKit/engine.py set mutation_daily_cap to writes_per_day, unless FBK_GOVERNOR_MUTATION_DAILY is in the environment?'),
    'REQ-BUDGET-04': noul('Do run_locked in the X engine and run in the platform kit engine call governor.before_request with is_mutation set when the action is a write before the action runs, and return code governorBlocked without running the action when GovernorBlockedError is raised and force is not set?'),
    'REQ-BUDGET-05': noul('Does the X engine\'s run_locked go past GovernorBlockedError only when spec.get("force") is True, and does the platform kit engine\'s run always return governorBlocked on GovernorBlockedError whatever the spec says?'),
    'REQ-BUDGET-06': noul('Does the send command add force: true to the engine spec only when parsed.flags["force"] is true, leaving the spec without force otherwise?'),
    'REQ-BUDGET-07': noul('When run_locked went past the governor, does it set out["forcedPast"] to the governor\'s refusal text?'),
    'REQ-BUDGET-08': noul('When run_locked goes past GovernorBlockedError because force is set, does it still add the request to the governor\'s hour_count and day_count, and to mutation_count for a write, and persist them?'),
    'REQ-BUDGET-09': noul('When the answer\'s event is throttled, dropped, automated or dailyLimit, do run_locked in the X engine and run in the platform kit engine call governor.observe_soft_block()?'),
    'REQ-BUDGET-10': noul('When Discord answers 429 in history_of, does it return the messages read so far with a reason and stop paging without asking again?'),
    'REQ-BUDGET-11': noul('When Discord or LinkedIn answers 429 to the session check, does the engine answer code rateLimited with event throttled?'),
    'REQ-BUDGET-12': noul('Does new_session return a curl_cffi Session with impersonate set to IMPERSONATE, which is chrome150, and do the Client\'s REQUEST_HEADERS carry no User-Agent of their own?'),
    unspecifiedBehavior: noul('Is there a path where a platform write is sent without the account\'s governor being asked first, or goes past the governor without force set, that the specification does not describe?'),
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
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
