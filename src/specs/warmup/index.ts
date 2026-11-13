import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'
import type { RequirementAnchors } from '../anchors/index'

const SCRIPTS = 'src/facebook/warmup/stages/helpers/scripts.ts'
const STAGE_LOG = 'src/facebook/warmup/stages/helpers/stageLog.ts'
const STAGES_MACHINE = 'src/facebook/warmup/stages/machine.ts'
const STAGES = 'src/cli/warmup/helpers/stages.ts'
const REEL = 'src/facebook/warmup/activities/helpers/reel.ts'
const SESSION = 'src/facebook/warmup/activities/helpers/reelSession.ts'
const ORDERER = 'src/facebook/warmup/activities/helpers/reelOrderer.ts'
const DECISION = 'src/facebook/warmup/activities/helpers/reelDecision.ts'
const ACTIVITIES = 'src/facebook/warmup/activities/machine.ts'
const CHECK_STEP = 'src/facebook/warmup/activities/helpers/checkStep.ts'
const PLATFORM = 'src/cli/warmup/helpers/platformActivity.ts'
const PERSONA_RUN = 'src/cli/warmup/helpers/personaRun.ts'
const VIEWER = 'src/warmup/viewer/client.ts'
const INTEREST = 'src/warmup/viewer/helpers/interestEffect.ts'
const LIFECYCLE = 'src/marketplace/lifecycle/types.ts'

const FLOWS: [string, string][] = [
  ['feedBrowse', 'warmupFeedBrowse'],
  ['marketplaceBrowse', 'warmupMarketplaceBrowse'],
  ['createAccessCheck', 'warmupCreateAccessCheck'],
  ['sellingVisit', 'warmupSellingVisit'],
  ['messagesVisit', 'warmupMessagesVisit'],
]

const anchors: RequirementAnchors = {
  'REQ-WARMUP-01': [
    { kind: 'value', file: LIFECYCLE, name: 'WARMUP_ACTIVITIES', equals: FLOWS.map(([activity]) => activity) },
    { kind: 'symbol', file: SCRIPTS, name: 'ACTIVITY_SCRIPTS' },
    ...FLOWS.map(([activity, flow]) => ({ kind: 'value' as const, file: SCRIPTS, name: 'ACTIVITY_SCRIPTS', path: [activity, 'flow'], equals: flow })),
    { kind: 'string', file: SCRIPTS, includes: 'stage 1' },
  ],
  'REQ-WARMUP-02': [
    { kind: 'symbol', file: STAGES, name: 'record' },
    { kind: 'symbol', file: STAGES, name: 'saveFlows' },
  ],
  'REQ-WARMUP-03': [
    { kind: 'symbol', file: STAGES, name: 'runStages' },
    { kind: 'symbol', file: STAGES, name: 'runWarmup' },
    { kind: 'symbol', file: STAGES_MACHINE, name: 'warmupMachine' },
  ],
  'REQ-WARMUP-04': [
    { kind: 'value', file: STAGES_MACHINE, name: 'NOTED_ISSUES', equals: ['marketplaceMayNotPost'] },
    { kind: 'string', file: STAGES_MACHINE, includes: 'checkpointed' },
    { kind: 'string', file: STAGES_MACHINE, includes: 'loginWall' },
    { kind: 'string', file: STAGES_MACHINE, includes: 'restrictedPolicy' },
    { kind: 'string', file: STAGES_MACHINE, includes: 'blocked' },
  ],
  'REQ-WARMUP-05': [
    { kind: 'symbol', file: STAGE_LOG, name: 'appendStageLog' },
    { kind: 'symbol', file: STAGE_LOG, name: 'stageLogPath' },
    { kind: 'uses', file: STAGE_LOG, name: 'appendRecord' },
    { kind: 'uses', file: STAGE_LOG, name: 'importRecordFile' },
  ],
  'REQ-WARMUP-06': [
    { kind: 'symbol', file: REEL, name: 'REEL' },
    { kind: 'string', file: REEL, includes: 'Unmute' },
  ],
  'REQ-WARMUP-07': [
    { kind: 'string', file: REEL, includes: 'Next card' },
    { kind: 'string', file: REEL, includes: 'Comments' },
    { kind: 'symbol', file: CHECK_STEP, name: 'checkStep' },
  ],
  'REQ-WARMUP-08': [
    { kind: 'string', file: REEL, includes: 'scrollIn' },
  ],
  'REQ-WARMUP-09': [
    { kind: 'symbol', file: PLATFORM, name: 'runPlatformActivity' },
  ],
  'REQ-WARMUP-10': [
    { kind: 'symbol', file: SESSION, name: 'planSession' },
    { kind: 'value', file: SESSION, name: 'DEFAULT_SESSION', path: ['reels', 'min'], equals: 8 },
    { kind: 'value', file: SESSION, name: 'DEFAULT_SESSION', path: ['reels', 'max'], equals: 20 },
    { kind: 'value', file: SESSION, name: 'DEFAULT_SESSION', path: ['skip'], equals: 0.6 },
  ],
  'REQ-WARMUP-11': [
    { kind: 'symbol', file: ACTIVITIES, name: 'allowedActions' },
    { kind: 'symbol', file: ACTIVITIES, name: 'skipReason' },
    { kind: 'symbol', file: ACTIVITIES, name: 'warmupActivityMachine' },
    { kind: 'symbol', file: ACTIVITIES, name: 'reelPersonaMachine' },
  ],
  'REQ-WARMUP-12': [
    { kind: 'symbol', file: PERSONA_RUN, name: 'personaFor' },
    { kind: 'symbol', file: PERSONA_RUN, name: 'packFor' },
    { kind: 'symbol', file: VIEWER, name: 'viewerFor' },
    { kind: 'symbol', file: VIEWER, name: 'viewersForSpeed' },
  ],
  'REQ-WARMUP-13': [
    { kind: 'symbol', file: DECISION, name: 'reelReadRequest' },
  ],
  'REQ-WARMUP-14': [
    { kind: 'symbol', file: ORDERER, name: 'planReel' },
    { kind: 'symbol', file: ORDERER, name: 'realPlay' },
    { kind: 'symbol', file: INTEREST, name: 'watchRatio' },
  ],
  'REQ-WARMUP-15': [
    { kind: 'symbol', file: PERSONA_RUN, name: 'runPersonaSession' },
  ],
  'REQ-WARMUP-16': [
    { kind: 'symbol', file: ORDERER, name: 'planReel' },
    { kind: 'symbol', file: ORDERER, name: 'segmentWeight' },
    { kind: 'symbol', file: 'src/warmup/persona/helpers/personaPack.ts', name: 'buildPersonaPack' },
  ],
  'REQ-WARMUP-17': [
    { kind: 'value', file: ORDERER, name: 'TIE_EPS', equals: 0.2 },
  ],
  'REQ-WARMUP-18': [
    { kind: 'symbol', file: PERSONA_RUN, name: 'runPersonaSession' },
  ],
}

export const warmup = {
  description: 'The Facebook warm-up: the five stages as flows, the Reels steps and the persona-conditioned Reels session',
  specPath: 'docs/specs/warmup.md',
  codePaths: [
    SCRIPTS,
    STAGE_LOG,
    STAGES_MACHINE,
    STAGES,
    REEL,
    SESSION,
    ORDERER,
    DECISION,
    ACTIVITIES,
    PLATFORM,
    PERSONA_RUN,
    VIEWER,
    'src/warmup/persona/helpers/personaPack.ts',
    CHECK_STEP,
    INTEREST,
  ],
  anchors,
  rubrics: {
    'REQ-WARMUP-02': noul('In record, when pageProblem finds nothing but ok is false (the reply of the step failed or never came), does the loop return from record right there, so that activity never reaches spans.push and saveFlows?'),
    'REQ-WARMUP-03': noul('Does runStages refuse a run with flowNotRecorded when loadFlow finds no flow for a picked activity, and otherwise does runWarmup run the flow of each activity through warmupMachine in the one session with gapMs between activities, 10 seconds when --gapSeconds is not given?'),
    'REQ-WARMUP-04': noul('Does warmupMachine go to its blocked final state when the issue of an activity is checkpointed, loginWall or restrictedPolicy, and carry on to the next activity when the issue is in NOTED_ISSUES?'),
    'REQ-WARMUP-05': noul('Does every stage event in a stages run go through the stage function to appendStageLog, which appends one stageLog record to log.db through appendRecord, the old file at stageLogPath() having been imported once?'),
    'REQ-WARMUP-06': noul('In REEL, does the unmute step (clickRole button Unmute) come right after openReels and before the first watch, and does the persona machine queue openReels then unmute before its first decide?'),
    'REQ-WARMUP-07': noul('In REEL, does every swipe step press button Next card with expect urlChanges true and urlMatches /reel/, does openComments expect shows heading Comments and closeComments expect hides heading Comments, and is the reply of each step checked with checkStep against its expect?'),
    'REQ-WARMUP-08': noul('Is the scrollComments step in REEL a scrollIn action whose args name the heading Comments?'),
    'REQ-WARMUP-09': noul('After a record or run of an activity, does runPlatformActivity write warmup_<platform>_<activity>.json in the run folder with the machine output, including every outcome and the issues?'),
    'REQ-WARMUP-10': noul('For a skipped reel, does planSession push only a glance of 1 to 3 seconds, sometimes starting a streak of 1 to 3 more skips, and draw the number of reels from options.reels and the skip chance from options.skip?'),
    'REQ-WARMUP-11': noul('Is a step with likes true skipped unless the run has likes, and a step with clicks true skipped unless the run is live, in warmupActivityMachine (skipReason) and in reelPersonaMachine (its skip guard), and does allowedActions allow like only when live and likes are both true?'),
    'REQ-WARMUP-12': noul('Do personaFor, viewerFor and packFor each return the copy saved for the account when it exists and fresh is not set, and save a newly drawn one otherwise, with viewerFor drawing from viewersForSpeed by the scrollSpeed of the persona?'),
    'REQ-WARMUP-13': noul('Does the request returned by reelReadRequest set its images field to the frame, and its state to the caption, creator, persona and pack, and ask the label, interest and pick questions, with pick offering only the actions allowed in this run?'),
    'REQ-WARMUP-14': noul('Does planReel take the real play of the viewer from realPlay, move it to a percentile by whether the reel matches, and multiply it by watchRatio of the interest effect, and is the watchMs it starts from Math.min of that scaled play and cap, where cap is pack.traits.attentionCapS * 1000?'),
    'REQ-WARMUP-15': noul('In runPersonaSession, is the dwell of the watch step the planned watch minus the time since landedAt (and skipped when little is left), so the watch counts from when the reel landed?'),
    'REQ-WARMUP-16': noul('Does planReel score each action as the chance in the pack times the like or comment interest effect times segmentWeight times the attention fit, with 0 for an action not allowed and 0 for like while lastLikeReel is within pack.traits.likeCooldownReels, which buildPersonaPack sets to 3, and choose at most one action?'),
    'REQ-WARMUP-17': noul('When the top two scores are within TIE_EPS of the top score and the drawn action is one of them, does planReel take read.pick as the action when read.pick is one of those two?'),
    'REQ-WARMUP-18': noul('Does runPersonaSession send every step with reaLater set to true in its step options?'),
    unspecifiedBehavior: noul('Does the warm-up code like, click or act on Facebook, or skip the step checks, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-WARMUP-02': MET,
    'REQ-WARMUP-03': MET,
    'REQ-WARMUP-04': MET,
    'REQ-WARMUP-05': MET,
    'REQ-WARMUP-06': MET,
    'REQ-WARMUP-07': MET,
    'REQ-WARMUP-08': MET,
    'REQ-WARMUP-09': MET,
    'REQ-WARMUP-10': MET,
    'REQ-WARMUP-11': MET,
    'REQ-WARMUP-12': MET,
    'REQ-WARMUP-13': MET,
    'REQ-WARMUP-14': MET,
    'REQ-WARMUP-15': MET,
    'REQ-WARMUP-16': MET,
    'REQ-WARMUP-17': MET,
    'REQ-WARMUP-18': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
