import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const budget = 'src/browser/run/helpers/launchBudget.ts'
const run = 'src/browser/run/client.ts'
const hours = 'src/marketplace/home/helpers/activeHours.ts'
const homeTypes = 'src/marketplace/home/types.ts'
const publish = 'src/cli/publish/index.ts'
const inspect = 'src/cli/inspect/index.ts'
const account = 'src/cli/account/index.ts'

export const launchBudget = {
  description: 'When an account browser may open: waking hours, the launch budget and resetOpens',
  specPath: 'docs/specs/launchBudget.md',
  codePaths: [
    'src/browser/run/client.ts',
    'src/browser/run/helpers/launchBudget.ts',
    'src/marketplace/home/helpers/activeHours.ts',
    'src/marketplace/home/types.ts',
    'src/cli/live/index.ts',
    'src/cli/publish/index.ts',
    'src/cli/account/index.ts',
    'src/cli/account/helpers/resetOpens.ts',
    'src/marketplace/host/helpers/progress.ts',
  ],
  anchors: {
    'REQ-LAUNCH-01': [
      { kind: 'value', file: homeTypes, name: 'DEFAULT_ACTIVE_HOURS', path: ['start'], equals: 8 },
      { kind: 'value', file: homeTypes, name: 'DEFAULT_ACTIVE_HOURS', path: ['end'], equals: 22 },
      { kind: 'symbol', file: hours, name: 'outsideActiveHours' },
      { kind: 'string', file: run, includes: 'outsideActiveHours' },
    ],
    'REQ-LAUNCH-02': [
      { kind: 'symbol', file: hours, name: 'activeWindow' },
      { kind: 'symbol', file: hours, name: 'insideWindow' },
    ],
    'REQ-LAUNCH-03': [
      { kind: 'string', file: publish, includes: 'bypass' },
      { kind: 'string', file: inspect, includes: 'bypass' },
    ],
    'REQ-LAUNCH-04': [
      { kind: 'value', file: budget, name: 'LAUNCH_LIMITS', path: ['perDay'], equals: 8 },
      { kind: 'symbol', file: budget, name: 'overLaunchBudget' },
      { kind: 'string', file: budget, includes: 'launchBudgetSpent' },
    ],
    'REQ-LAUNCH-05': [
      { kind: 'value', file: budget, name: 'LAUNCH_LIMITS', path: ['minGapMinutes'], equals: 10 },
      { kind: 'string', file: budget, includes: 'launchTooSoon' },
    ],
    'REQ-LAUNCH-06': [
      { kind: 'value', file: budget, name: 'SELF_CHECK', equals: 'Self-check passed' },
      { kind: 'symbol', file: budget, name: 'listLaunches' },
      { kind: 'string', file: budget, includes: 'steps.jsonl' },
    ],
    'REQ-LAUNCH-07': [{ kind: 'symbol', file: budget, name: 'overLaunchBudget' }],
    'REQ-LAUNCH-08': [
      { kind: 'string', file: publish, includes: 'now' },
      { kind: 'string', file: inspect, includes: 'now' },
    ],
    'REQ-LAUNCH-09': [
      { kind: 'string', file: publish, includes: 'formUrl' },
      { kind: 'string', file: publish, includes: 'file:' },
    ],
    'REQ-LAUNCH-10': [
      { kind: 'symbol', file: budget, name: 'recordLaunchReset' },
      { kind: 'string', file: budget, includes: 'launchReset' },
      { kind: 'symbol', file: 'src/cli/account/helpers/resetOpens.ts', name: 'resetAccountOpens' },
      { kind: 'symbol', file: 'src/marketplace/host/helpers/progress.ts', name: 'resetHostOpens' },
    ],
    'REQ-LAUNCH-11': [{ kind: 'symbol', file: budget, name: 'lastLaunchReset' }],
    'REQ-LAUNCH-12': [{ kind: 'string', file: account, includes: 'resetOpens' }],
  },
  rubrics: {
    'REQ-LAUNCH-01': noul('Does prepareRun refuse the run when the account local hour in its home timezone is outside its active window?'),
    'REQ-LAUNCH-02': noul('Does the active window use the account own start and end hours only when both are valid hours and not equal, falling back to the default otherwise, and is a window whose start is after its end (crossing midnight) treated as inside for hours after the start or before the end?'),
    'REQ-LAUNCH-03': noul('When bypassHours is set, does prepareRun skip only the active hours check while the launch budget check still runs, and is bypassHours false unless the bypass flag is passed?'),
    'REQ-LAUNCH-04': noul('Is the run refused for the budget when the number of launches today is greater than or equal to the per-day limit?'),
    'REQ-LAUNCH-05': noul('Is the run refused as too soon when the last launch was fewer minutes ago than the minimum gap, and does the refusal say how many minutes to wait?'),
    'REQ-LAUNCH-06': noul('Are launches counted only from steps.jsonl lines containing the self-check line, reading both the runs folders and the publish folders for the account?'),
    'REQ-LAUNCH-07': noul('Are the launches of today the ones whose calendar day equals the calendar day of now in the account home timezone?'),
    'REQ-LAUNCH-08': noul('With skipLaunchGap, is the minimum gap set to 0 while the per-day limit is kept unchanged?'),
    'REQ-LAUNCH-09': noul('Is the launch budget skipped only when the publish formUrl starts with file:, and never because of the bypass flag?'),
    'REQ-LAUNCH-10': noul('Does resetting opens append one JSON line with the account, the time and the reason, and set the host progress opensToday to 0, without deleting any file?'),
    'REQ-LAUNCH-11': noul('Are launches at or before the latest reset of the account dropped, so only launches strictly after it are counted?'),
    'REQ-LAUNCH-12': noul('Does the resetOpens action refuse to reset an account whose browser session is still open, naming the open session?'),
    unspecifiedBehavior: noul('Does prepareRun let a browser open by a route the specification does not describe, such as skipping the launch budget for a flag other than a file: formUrl, or skipping the active hours without bypassHours?'),
  },
  assertions: {
    'REQ-LAUNCH-01': MET,
    'REQ-LAUNCH-02': MET,
    'REQ-LAUNCH-03': MET,
    'REQ-LAUNCH-04': MET,
    'REQ-LAUNCH-05': MET,
    'REQ-LAUNCH-06': MET,
    'REQ-LAUNCH-07': MET,
    'REQ-LAUNCH-08': MET,
    'REQ-LAUNCH-09': MET,
    'REQ-LAUNCH-10': MET,
    'REQ-LAUNCH-11': MET,
    'REQ-LAUNCH-12': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
