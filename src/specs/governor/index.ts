import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const CLIENT = 'src/directApi/governor/client.ts'
const TYPES = 'src/directApi/governor/types.ts'
const COMMAND = 'src/cli/governor/index.ts'
const LEDGER_TYPES = 'src/storage/ledger/types.ts'
const FROM_OLD = 'src/storage/ledger/helpers/fromOld.ts'

export const governor = {
  description: "Every platform account's governor count read with one command and put back to 0 with another when matt says so, each reset checked and kept in log.db's ledger",
  specPath: 'docs/specs/governor.md',
  codePaths: [CLIENT, TYPES, COMMAND, LEDGER_TYPES, FROM_OLD],
  anchors: {
    'REQ-GOVERNOR-01': [
      { kind: 'symbol', file: CLIENT, name: 'governorCounts' },
      { kind: 'symbol', file: COMMAND, name: 'countLine' },
    ],
    'REQ-GOVERNOR-02': [
      { kind: 'symbol', file: CLIENT, name: 'resetGovernor' },
      { kind: 'symbol', file: CLIENT, name: 'governorAccounts' },
      { kind: 'value', file: TYPES, name: 'GOVERNOR_FILE', equals: 'governor_state.json' },
    ],
    'REQ-GOVERNOR-03': [
      { kind: 'string', file: CLIENT, includes: 'governorReset' },
      { kind: 'string', file: LEDGER_TYPES, includes: 'governorResets.jsonl' },
      { kind: 'string', file: FROM_OLD, includes: 'governorResets' },
    ],
    'REQ-GOVERNOR-04': [{ kind: 'uses', file: CLIENT, name: 'cooldownKept' }],
  },
  rubrics: {
    'REQ-GOVERNOR-01': noul('Does log governor show list, for every account with a governor_state.json (or only the --platform one), its requests, writes, this hour, the day, any cooldown and its last governorReset ledger row?'),
    'REQ-GOVERNOR-02': noul('Does resetGovernor set day_count, hour_count and mutation_count to 0 by writing a temporary file and renaming it over governor_state.json, then read the count again and throw if any of them is not 0, and does the command refuse an account with no governor count before writing anything?'),
    'REQ-GOVERNOR-03': noul("Does every reset write one ledger row of kind governorReset with the platform, the account, who said it and the request count before, and return that row's seq, and are the old governorResets.jsonl lines imported into the ledger as governorReset rows?"),
    'REQ-GOVERNOR-04': noul('Does resetGovernor leave cooldown_until as it was, and does the reset report cooldownKept when the account was cooling off?'),
    unspecifiedBehavior: noul('Does the governor code send a request to a platform, change a write budget, clear a cooldown, or change any account state other than the three counts, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-GOVERNOR-01': MET,
    'REQ-GOVERNOR-02': MET,
    'REQ-GOVERNOR-03': MET,
    'REQ-GOVERNOR-04': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
