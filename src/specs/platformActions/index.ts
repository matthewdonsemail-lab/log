import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const MACHINE = 'src/platformKit/action/machine.ts'
const CLIENT = 'src/platformKit/action/client.ts'
const TYPES = 'src/platformKit/action/types.ts'
const REACT = 'src/cli/react/index.ts'
const VOICE = 'src/cli/voiceNote/index.ts'
const X_SEND = 'src/cli/twitter/helpers/send.ts'
const X_LIST = 'src/cli/twitter/helpers/list.ts'
const DISCORD = 'src/cli/discord/index.ts'
const SLACK = 'src/cli/slack/index.ts'
const INSTAGRAM = 'src/cli/instagram/index.ts'

export const platformActions = {
  description: 'Every acting command runs through one shared machine: gating, acting, confirming, then done, refused or uncertain',
  specPath: 'docs/specs/platformActions.md',
  codePaths: [MACHINE, CLIENT, TYPES, REACT, VOICE, X_SEND, X_LIST, DISCORD, SLACK, INSTAGRAM],
  anchors: {
    'REQ-ACTION-01': [
      { kind: 'symbol', file: MACHINE, name: 'actionMachine' },
      { kind: 'symbol', file: CLIENT, name: 'runAction' },
      { kind: 'symbol', file: TYPES, name: 'ACTION_STAGES' },
      { kind: 'symbol', file: TYPES, name: 'ACTION_OUTCOMES' },
      { kind: 'string', file: MACHINE, includes: 'gatePassed' },
    ],
    'REQ-ACTION-02': [
      { kind: 'symbol', file: CLIENT, name: 'confirmAnswer' },
      { kind: 'symbol', file: CLIENT, name: 'rethrowFailure' },
      { kind: 'symbol', file: CLIENT, name: 'confirmParts' },
      { kind: 'string', file: MACHINE, includes: 'uncertain' },
    ],
    'REQ-ACTION-03': [
      { kind: 'uses', file: REACT, name: 'runAction' },
      { kind: 'uses', file: VOICE, name: 'runAction' },
      { kind: 'uses', file: X_SEND, name: 'runAction' },
      { kind: 'uses', file: X_LIST, name: 'runAction' },
      { kind: 'uses', file: DISCORD, name: 'runAction' },
      { kind: 'uses', file: SLACK, name: 'runAction' },
      { kind: 'uses', file: INSTAGRAM, name: 'runAction' },
    ],
  },
  rubrics: {
    'REQ-ACTION-01': noul('Is actionMachine built with setup() and named guards and actions, does every invoke have onError, and does it go gating, then acting only when the gate passed, then confirming, ending in done, refused or uncertain?'),
    'REQ-ACTION-02': noul('Does a refused or throwing gate end in refused with nothing acted, does a not-ok platform answer end in refused at confirming with its code, does a throwing act or confirm end in uncertain with the error, and does confirmParts confirm a multi-part send only when every part went out?'),
    'REQ-ACTION-03': noul('Do reactCommandOf, voiceNoteCommandOf, the X writes and lists, discord send and delete, slack send and instagram send run every live call through runAction, with the catch-up, voice gate and claim in the gate, release the chat claim when the outcome is uncertain, and never call runAction on a dry run?'),
    unspecifiedBehavior: noul('Does the action machine retry an act, or treat a thrown act as success, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-ACTION-01': MET,
    'REQ-ACTION-02': MET,
    'REQ-ACTION-03': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
