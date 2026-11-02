import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const machine = 'src/marketplace/lifecycle/machine.ts'
const types = 'src/marketplace/lifecycle/types.ts'
const steps = 'src/marketplace/lifecycle/helpers/onboardingStep.ts'
const watch = 'src/cli/inspect/helpers/watchCheckpoint.ts'
const flowSession = 'src/cli/flow/helpers/flowSession.ts'

export const accountLifecycle = {
  description: 'One browser per account per day, closed only for a logged reason, and a checkpoint page deactivates the account',
  specPath: 'docs/specs/accountLifecycle.md',
  codePaths: [
    'src/marketplace/lifecycle/machine.ts',
    'src/marketplace/lifecycle/types.ts',
    'src/marketplace/lifecycle/helpers/onboardingStep.ts',
    'src/cli/inspect/helpers/watchCheckpoint.ts',
    'src/cli/inspect/index.ts',
    'src/cli/flow/helpers/flowSession.ts',
    'src/browser/flow/helpers/pageCheck.ts',
  ],
  anchors: {
    'REQ-LIFE-01': [{ kind: 'symbol', file: machine, name: 'lifecycleMachine' }],
    'REQ-LIFE-03': [
      { kind: 'value', file: types, name: 'OPENS_PER_DAY', equals: 2 },
      { kind: 'string', file: machine, includes: 'opensSpent' },
    ],
    'REQ-LIFE-05': [
      { kind: 'symbol', file: types, name: 'CloseReason' },
      { kind: 'symbol', file: machine, name: 'closing' },
    ],
    'REQ-LIFE-06': [{ kind: 'string', file: machine, includes: 'endOfActiveHours' }],
    'REQ-LIFE-07': [
      { kind: 'string', file: machine, includes: 'shutdown' },
      { kind: 'string', file: machine, includes: 'accountLost' },
    ],
    'REQ-LIFE-08': [{ kind: 'string', file: machine, includes: 'restricted' }],
    'REQ-LIFE-09': [
      { kind: 'string', file: machine, includes: 'browserGone' },
      { kind: 'string', file: machine, includes: 'crash' },
    ],
    'REQ-LIFE-10': [{ kind: 'symbol', file: steps, name: 'nextOnboardingStep' }],
    'REQ-LIFE-11': [
      { kind: 'value', file: types, name: 'WARMUP_ACTIVITIES', equals: ['feedBrowse', 'marketplaceBrowse', 'createAccessCheck', 'sellingVisit', 'messagesVisit'] },
      { kind: 'symbol', file: types, name: 'DEFAULT_LIFECYCLE_TIMING' },
      { kind: 'symbol', file: steps, name: 'warmupComplete' },
    ],
    'REQ-LIFE-12': [{ kind: 'string', file: machine, includes: 'signInSpent' }],
    'REQ-LIFE-13': [
      { kind: 'symbol', file: watch, name: 'watchCheckpoint' },
      { kind: 'value', file: watch, name: 'NAVIGATIONS_FILE', equals: 'navigations.jsonl' },
      { kind: 'string', file: watch, includes: 'checkpointed' },
      { kind: 'string', file: watch, includes: 'deactivated' },
    ],
    'REQ-LIFE-14': [{ kind: 'string', file: flowSession, includes: 'watchCheckpoint' }],
    'REQ-LIFE-16': [
      { kind: 'string', file: machine, includes: 'checkpointed' },
      { kind: 'string', file: machine, includes: 'checkpoint' },
      { kind: 'string', file: machine, includes: 'needsPerson' },
    ],
  },
  rubrics: {
    'REQ-LIFE-01': noul('Does the routing state send standing.status banned to banned, dead to lost, deactivated to deactivated, restricted to restricted and paused to paused, an account without hasProxy to onboarding.proxying, and every other account to onboarding.opening?'),
    'REQ-LIFE-02': noul('In both opening.gate states, does the browserOpen guard skip the openBrowser launch and go on to the next state of the lane when context.browser.open is true?'),
    'REQ-LIFE-03': noul('Does the opensLeft guard allow a launch only while browser.opensToday is below the opens per day, does the gate go to stuck with the opensSpent action otherwise, and does newDay set opensToday back to 0?'),
    'REQ-LIFE-04': noul('Does the ACT event in host.watching go to acting, which invokes the act actor without opening or closing the browser, and return to watching when it is done?'),
    'REQ-LIFE-05': noul('Does closing() invoke closeBrowser with a CloseReason and run logClose on both onDone and onError, appending the reason and the time to browser.closes and setting browser.open to false?'),
    'REQ-LIFE-06': noul('When watchCheck returns endOfDay, does the machine go to overnight, close for the end of active hours, invoke waitForActiveHours, and then go back to opening with the newDay action?'),
    'REQ-LIFE-07': noul('Does SHUTDOWN go to stopping, which closes for shutdown and ends in stopped, and LOST go to losing, which closes for accountLost and ends in lost?'),
    'REQ-LIFE-08': noul('Does a restricted issue go to restricting, which closes for restricted and ends in restricted, and a banned issue go to banning, which closes for restricted and ends in banned?'),
    'REQ-LIFE-09': noul('When watchCheck returns the browser gone error code, does the host go to crashed, which appends a crash close to browser.closes, sets browser.open to false and goes back to host.opening?'),
    'REQ-LIFE-10': noul('Does nextOnboardingStep return signingIn, checkingAccount, settingProfile, settingName only when wantsName is set, settingLocation, warming and attached, in that order, skipping each step already done?'),
    'REQ-LIFE-11': noul('Does warming run each warm-up activity once with the activityGap delay between them, and go to attached only when warmupComplete finds every activity done and warmupMs (24 hours by default) passed since warmup.startedAt, running watchCheck while it waits?'),
    'REQ-LIFE-12': noul('Does a needsLogin issue go to onboarding.signingIn, and does the issue state go to stuck with signInSpent when signInTries has reached 2?'),
    'REQ-LIFE-13': noul('When navigationsOf finds a navigation whose URL pageProblem marks checkpointed, does watchCheckpoint call setStatusAndReplace with deactivated, the reason checkpointed and a detail holding the page and the time?'),
    'REQ-LIFE-14': noul('Is watchCheckpoint started both in log inspect start and in openInspectSession, which the host, flow runs and warm-up stages use, and stopped when each session ends?'),
    'REQ-LIFE-15': noul('Does watchCheckpoint do nothing when the account status is already deactivated, and set recorded back to false so it tries again when setStatusAndReplace fails?'),
    'REQ-LIFE-16': noul('In the issue state of lifecycleMachine, does an issue whose code is checkpointed go to deactivating, which closes the browser with the reason checkpoint and ends in the final state deactivated, before the checkpoint status guard that goes to needsPerson?'),
    unspecifiedBehavior: noul('Does the lifecycle machine open a browser beyond the opens per day, or close it without logging a CloseReason in browser.closes, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-LIFE-01': MET,
    'REQ-LIFE-02': MET,
    'REQ-LIFE-03': MET,
    'REQ-LIFE-04': MET,
    'REQ-LIFE-05': MET,
    'REQ-LIFE-06': MET,
    'REQ-LIFE-07': MET,
    'REQ-LIFE-08': MET,
    'REQ-LIFE-09': MET,
    'REQ-LIFE-10': MET,
    'REQ-LIFE-11': MET,
    'REQ-LIFE-12': MET,
    'REQ-LIFE-13': MET,
    'REQ-LIFE-14': MET,
    'REQ-LIFE-15': MET,
    'REQ-LIFE-16': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
