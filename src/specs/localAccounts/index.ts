import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const LOCAL = 'src/twenty/graphql/helpers/localAccounts.ts'
const CLI = 'src/cli/localAccount/index.ts'
const RULES = 'src/mcp/server/helpers/agentRules.ts'

export const localAccounts = {
  description: 'Local accounts: the file, pull, add and list, and how every command reads accounts from it',
  specPath: 'docs/specs/localAccounts.md',
  codePaths: [
    'src/twenty/graphql/helpers/localAccounts.ts',
    'src/cli/localAccount/index.ts',
    'src/cli/runner/client.ts',
    'src/mcp/server/helpers/agentRules.ts',
  ],
  anchors: {
    'REQ-LOCAL-01': [
      { kind: 'symbol', file: LOCAL, name: 'localAccountsPath' },
      { kind: 'symbol', file: LOCAL, name: 'writeLocalAccounts' },
      { kind: 'string', file: LOCAL, includes: '.logCli' },
      { kind: 'string', file: LOCAL, includes: 'localAccounts.json' },
    ],
    'REQ-LOCAL-02': [{ kind: 'symbol', file: LOCAL, name: 'pullLocalAccounts' }],
    'REQ-LOCAL-03': [
      { kind: 'value', file: LOCAL, name: 'LOCAL_ID_PREFIX', equals: 'local:' },
      { kind: 'symbol', file: LOCAL, name: 'upsertLocalAccount' },
      { kind: 'symbol', file: CLI, name: 'localAccountCommand' },
    ],
    'REQ-LOCAL-04': [{ kind: 'symbol', file: LOCAL, name: 'readLocalAccounts' }],
    'REQ-LOCAL-05': [{ kind: 'symbol', file: LOCAL, name: 'withLocalAccounts' }],
    'REQ-LOCAL-06': [
      { kind: 'symbol', file: LOCAL, name: 'localOnly' },
      { kind: 'string', file: LOCAL, includes: 'local' },
    ],
    'REQ-LOCAL-09': [{ kind: 'symbol', file: RULES, name: 'COMMAND_RULES' }],
  },
  rubrics: {
    'REQ-LOCAL-01': noul('Does localAccountsPath return the LOG_LOCAL_ACCOUNTS environment value when it is set and the default file otherwise, and does writeLocalAccounts write the file readable by its owner only (mode 0o600)?'),
    'REQ-LOCAL-02': noul('In src/twenty/graphql/helpers/localAccounts.ts, does pullLocalAccounts list Twenty socialAccounts with remote.list (filtered by platform when given), skip a row with neither accountName nor name, match a row already in the file by its id or by platform and accountName, merge each other row with the non-empty values of remote.loginSecrets(row.id), keep the Twenty row id on a new row (its id from the spread row, and twentyId: row.id), keep a row already in the file unless refresh is set, and call nothing on Twenty but remote.list and remote.loginSecrets (never create or update)?'),
    'REQ-LOCAL-03': noul('Does localAccount add accept any platform in PLATFORMS, save the row with upsertLocalAccount under the id LOCAL_ID_PREFIX, then the platform, a colon and the accountName, set adsPowerProfileId and browserDriver adsPower when the adsPower flag is given, and never write to Twenty?'),
    'REQ-LOCAL-04': noul('Does localAccount list print every row from readLocalAccounts with its platform, accountName, adsPowerProfileId and sessionState?'),
    'REQ-LOCAL-05': noul('Does createContext wrap the Twenty client with withLocalAccounts, and does its list of socialAccounts return the local rows followed by the Twenty rows whose platform and accountName match no local row?'),
    'REQ-LOCAL-06': noul('When localOnly is true (LOG_ACCOUNTS is local), do list, get, create, update and loginSecrets for socialAccounts use only the local file and never call the remote client for an account?'),
    'REQ-LOCAL-07': noul('Does update on socialAccounts write the change to the local file with writeLocalAccounts when the row is in the file, without calling remote.update?'),
    'REQ-LOCAL-08': noul('For every object other than socialAccounts, do list, get, create and update in withLocalAccounts call the remote client whatever localOnly says?'),
    'REQ-LOCAL-09': noul('In src/mcp/server/helpers/agentRules.ts, the COMMAND_RULES object has one key per command with the rule numbers it falls under. Does its localAccount key (the line that starts with localAccount: inside COMMAND_RULES, near the top of COMMAND_RULES) list the number 97 in its array?'),
    unspecifiedBehavior: noul('Does the local accounts code write an account to Twenty when it should stay local, read Twenty with LOG_ACCOUNTS=local, or keep listings, groups or conversations in the local file, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-LOCAL-01': MET,
    'REQ-LOCAL-02': MET,
    'REQ-LOCAL-03': MET,
    'REQ-LOCAL-04': MET,
    'REQ-LOCAL-05': MET,
    'REQ-LOCAL-06': MET,
    'REQ-LOCAL-07': MET,
    'REQ-LOCAL-08': MET,
    'REQ-LOCAL-09': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
