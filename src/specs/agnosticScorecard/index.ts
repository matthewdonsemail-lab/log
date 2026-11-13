import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const CLIENT = 'src/surface/scorecard/client.ts'
const MEASURE = 'src/surface/scorecard/helpers/measure.ts'
const COMPARE = 'src/surface/scorecard/helpers/compare.ts'
const MACHINES = 'src/surface/scorecard/helpers/machines.ts'
const TYPES = 'src/surface/scorecard/types.ts'
const CHECK = 'scripts/checks/checkAgnostic.ts'
const TEST = 'src/surface/scorecard/scorecard.test.ts'

export const agnosticScorecard = {
  description: 'The platform-neutral scorecard: numbers computed from the code, a committed baseline, and a check that fails when one gets worse',
  specPath: 'docs/specs/agnosticScorecard.md',
  codePaths: [CLIENT, MEASURE, COMPARE, MACHINES, TYPES, CHECK, 'src/surface/scorecard/helpers/citations.ts', 'src/surface/scorecard/helpers/platformWords.ts'],
  anchors: {
    'REQ-AGNOSTIC-01': [
      { kind: 'symbol', file: CLIENT, name: 'measureRepo' },
      { kind: 'symbol', file: CLIENT, name: 'repoInput' },
      { kind: 'symbol', file: MEASURE, name: 'measure' },
    ],
    'REQ-AGNOSTIC-02': [
      { kind: 'symbol', file: COMPARE, name: 'compareScorecard' },
      { kind: 'symbol', file: COMPARE, name: 'renderScorecard' },
      { kind: 'value', file: CLIENT, name: 'BASELINE_PATH', equals: 'scripts/checks/agnosticBaseline.json' },
      { kind: 'string', file: CHECK, includes: '--json' },
    ],
    'REQ-AGNOSTIC-03': [
      { kind: 'symbol', file: COMPARE, name: 'writeBaseline' },
      { kind: 'string', file: CHECK, includes: '--allowWorse' },
    ],
    'REQ-AGNOSTIC-04': [
      { kind: 'string', file: 'package.json', includes: 'bun run check:agnostic' },
    ],
    'REQ-AGNOSTIC-05': [
      { kind: 'symbol', file: MACHINES, name: 'hasMachine' },
      { kind: 'symbol', file: TYPES, name: 'MACHINE_RULE' },
      { kind: 'string', file: TEST, includes: 'refuses to raise' },
    ],
  },
  rubrics: {
    'REQ-AGNOSTIC-01': noul('Does measureRepo compute every number from files in the repository and the imported command and tool definitions only, with no network call and no read of machine-local state such as ~/.logCli?'),
    'REQ-AGNOSTIC-02': noul('Does check:agnostic exit non-zero when any number with a direction is worse than the committed baseline or missing from it, name each such number, and pass with a note when a number is better?'),
    'REQ-AGNOSTIC-03': noul('Does --write refuse to record a number worse than the baseline unless --allowWorse is also passed?'),
    'REQ-AGNOSTIC-04': noul('Is check:agnostic run by the pre-commit hook and by the check script CI runs?'),
    'REQ-AGNOSTIC-05': noul('Do the tests cover the measuring functions over fixtures and the compare logic for worse, better and --write?'),
    unspecifiedBehavior: noul('Does the scorecard change any file other than the baseline, or call a platform, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-AGNOSTIC-01': MET,
    'REQ-AGNOSTIC-02': MET,
    'REQ-AGNOSTIC-03': MET,
    'REQ-AGNOSTIC-04': MET,
    'REQ-AGNOSTIC-05': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
