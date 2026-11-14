import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const TABLE = 'src/platformKit/capability/helpers/table.ts'
const CLIENT = 'src/platformKit/capability/client.ts'
const TYPES = 'src/platformKit/capability/types.ts'
const COMMAND = 'src/cli/capabilities/index.ts'
const CATALOG = 'src/errors/catalog/types.ts'

export const capabilities = {
  description: 'One name and one input shape per capability, the platform taken from the account, each platform command kept as the implementation',
  specPath: 'docs/specs/capabilities.md',
  codePaths: [TABLE, CLIENT, TYPES, COMMAND, 'src/cli/runner/index.ts', 'src/cli/runner/helpers/commandIndex.ts'],
  anchors: {
    'REQ-CAP-01': [
      { kind: 'symbol', file: TABLE, name: 'CAPABILITIES' },
      { kind: 'symbol', file: CLIENT, name: 'capabilityRows' },
      { kind: 'symbol', file: CLIENT, name: 'capabilityTool' },
      { kind: 'symbol', file: TYPES, name: 'CANONICAL_INPUTS' },
    ],
    'REQ-CAP-02': [
      { kind: 'symbol', file: CLIENT, name: 'choosePlatform' },
      { kind: 'string', file: CLIENT, includes: 'platformAmbiguous' },
      { kind: 'string', file: CLIENT, includes: 'accountPlatformMismatch' },
      { kind: 'uses', file: COMMAND, name: 'readConnectionAccounts' },
    ],
    'REQ-CAP-03': [
      { kind: 'symbol', file: CLIENT, name: 'argvFor' },
      { kind: 'symbol', file: CLIENT, name: 'capabilityMissing' },
      { kind: 'string', file: CLIENT, includes: 'inputUnsupported' },
      { kind: 'uses', file: CATALOG, name: 'capabilityMissing' },
    ],
    'REQ-CAP-04': [
      { kind: 'symbol', file: COMMAND, name: 'capabilityCommandOf' },
      { kind: 'symbol', file: COMMAND, name: 'chatsCommand' },
      { kind: 'symbol', file: COMMAND, name: 'messagesCommand' },
    ],
    'REQ-CAP-05': [
      { kind: 'symbol', file: COMMAND, name: 'voiceNotesCommand' },
      { kind: 'string', file: TABLE, includes: 'voiceNotes' },
      { kind: 'symbol', file: 'src/platformKit/gates/client.ts', name: 'gatedToolFor' },
      { kind: 'symbol', file: 'src/mcp/server/helpers/activePlay.ts', name: 'playCoversCapability' },
      { kind: 'symbol', file: 'src/mcp/server/helpers/playGate.ts', name: 'capabilityPlayGateMode' },
    ],
  },
  rubrics: {
    'REQ-CAP-01': noul('Does capabilityRows derive every row from COMMANDS, throwing when a binding in CAPABILITIES names a command, input form or flag that does not exist, and take each row\'s effect and live flag from the bound form rather than from the table?'),
    'REQ-CAP-02': noul('Does choosePlatform give the one platform keeping the account name, platformAmbiguous when several keep it and no platform is given, accountNotFound when none keep it and no platform is given, and accountPlatformMismatch when the given platform is not one that keeps it while another does?'),
    'REQ-CAP-03': noul('Does argvFor answer capabilityMissing with platformsWithIt for a platform with no binding, inputUnsupported for a given input the binding does not map (other than account), and otherwise build the bound form\'s words, positional and flags from the canonical inputs?'),
    'REQ-CAP-04': noul('Do log chats list and log messages read refuse before running any platform command when an input is missing or invalid, the platform cannot be chosen, or argvFor refuses, and otherwise run the bound command with the mapped argv and return its result unchanged?'),
    'REQ-CAP-05': noul('Do messages send, messages react and voiceNotes send refuse --live without --approvedBy and otherwise run the bound platform command run with --live and the mapped flags; does gatedToolFor resolve their Live tools to the bound platform Live tool from the account so the session gate decides them as that tool and the play gate always requires a play for them (capabilityPlayGateMode), even where that platform tool needs none; and does a play cover them only as it covers that platform tool, or by naming the capability under that platform or a shared folder?'),
    unspecifiedBehavior: noul('Does a capability command contact a platform, write anything, or pick a platform by default, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-CAP-01': MET,
    'REQ-CAP-02': MET,
    'REQ-CAP-03': MET,
    'REQ-CAP-04': MET,
    'REQ-CAP-05': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
