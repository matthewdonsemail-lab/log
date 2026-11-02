import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

export const localAccounts = {
  description: 'Local accounts: the file, pull, add and list, and how every command reads accounts from it',
  specPath: 'docs/specs/localAccounts.md',
  codePaths: [
    'src/twenty/graphql/helpers/localAccounts.ts',
    'src/cli/localAccount/index.ts',
    'src/cli/runner/client.ts',
    'src/mcp/server/helpers/agentRules.ts',
  ],
  rubrics: {
    'REQ-LOCAL-01': noul('Does localAccountsPath return LOG_LOCAL_ACCOUNTS when set and ~/.logCli/localAccounts.json otherwise, and does writeLocalAccounts write the file with mode 0o600?'),
    'REQ-LOCAL-02': noul('Does pullLocalAccounts list Twenty socialAccounts (filtered by platform when given), merge each row with the non-empty values of loginSecrets, keep the Twenty row id on a new row, keep a row already in the file unless refresh is set, and never call create or update on Twenty?'),
    'REQ-LOCAL-03': noul('Does localAccount add accept any platform in PLATFORMS, save the row with upsertLocalAccount under the id local:<platform>:<accountName>, set adsPowerProfileId and browserDriver adsPower when --adsPower is given, and never write to Twenty?'),
    'REQ-LOCAL-04': noul('Does localAccount list print every row from readLocalAccounts with its platform, accountName, adsPowerProfileId and sessionState?'),
    'REQ-LOCAL-05': noul('Does createContext wrap the Twenty client with withLocalAccounts, and does its list of socialAccounts return the local rows followed by the Twenty rows whose platform and accountName match no local row?'),
    'REQ-LOCAL-06': noul('When localOnly is true (LOG_ACCOUNTS=local), do list, get, create, update and loginSecrets for socialAccounts use only the local file and never call the remote client for an account?'),
    'REQ-LOCAL-07': noul('Does update on socialAccounts write the change to the local file with writeLocalAccounts when the row is in the file, without calling remote.update?'),
    'REQ-LOCAL-08': noul('For every object other than socialAccounts, do list, get, create and update in withLocalAccounts call the remote client whatever localOnly says?'),
    'REQ-LOCAL-09': noul('Does COMMAND_RULES.localAccount include 97?'),
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
