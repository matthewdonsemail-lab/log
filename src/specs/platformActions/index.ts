import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const MACHINE = 'src/platformKit/action/machine.ts'
const CLIENT = 'src/platformKit/action/client.ts'
const TYPES = 'src/platformKit/action/types.ts'
const REACT = 'src/cli/react/index.ts'
const VOICE = 'src/cli/voiceNote/index.ts'

export const platformActions = {
  description: 'Every acting command runs through one shared machine: gating, acting, confirming, then done, refused or uncertain',
  specPath: 'docs/specs/platformActions.md',
  codePaths: [MACHINE, CLIENT, TYPES, REACT, VOICE],
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
      { kind: 'string', file: MACHINE, includes: 'uncertain' },
    ],
    'REQ-ACTION-03': [
      { kind: 'uses', file: REACT, name: 'runAction' },
      { kind: 'uses', file: VOICE, name: 'runAction' },
    ],
  },
  rubrics: {
    'REQ-ACTION-01': noul('Is actionMachine built with setup() and named guards and actions, does every invoke have onError, and does it go gating, then acting only when the gate passed, then confirming, ending in done, refused or uncertain?'),
    'REQ-ACTION-02': noul('Does a refused or throwing gate end in refused with nothing acted, does a not-ok platform answer end in refused at confirming with its code, and does a throwing act or confirm end in uncertain with the error?'),
    'REQ-ACTION-03': noul('Do reactCommandOf and voiceNoteCommandOf run every live call through runAction, release the chat claim as failed when the outcome is uncertain, and never call runAction on a dry run?'),
    unspecifiedBehavior: noul('Does the action machine retry an act, or treat a thrown act as success, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-ACTION-01': MET,
    'REQ-ACTION-02': MET,
    'REQ-ACTION-03': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
