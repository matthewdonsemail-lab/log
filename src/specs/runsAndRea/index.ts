import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const gate = 'python/browser/proxyGate.py'
const capture = 'src/rea/capture/client.ts'
const captureCli = 'src/cli/capture/index.ts'
const facebook = 'src/rea/facebookClient/client.ts'
const platform = 'src/rea/platformClient/client.ts'
const docsGate = 'scripts/checks/checkFacebookClientDocs.mjs'
const store = 'src/browser/runStore/client.ts'
const verdict = 'src/browser/runStore/helpers/storageVerdict.ts'

export const runsAndRea = {
  description: 'Every action records a HAR, request docs by platform and domain are built and read by rea, runs are pruned once analysed and their findings kept',
  specPath: 'docs/specs/runsAndRea.md',
  codePaths: [
    'python/browser/proxyGate.py',
    'src/rea/capture/client.ts',
    'src/cli/capture/index.ts',
    'src/rea/facebookClient/client.ts',
    'src/rea/facebookClient/helpers/domainOf.ts',
    'src/rea/platformClient/client.ts',
    'scripts/checks/checkFacebookClientDocs.mjs',
    'src/browser/runStore/client.ts',
    'src/browser/runStore/helpers/storageVerdict.ts',
    'scripts/hooks/storage.ts',
    'src/cli/runs/index.ts',
  ],
  anchors: {
    'REQ-RUNS-01': [
      { kind: 'symbol', file: gate, name: '_force_capture' },
      { kind: 'symbol', file: gate, name: '_force_context' },
      { kind: 'string', file: gate, includes: 'session.har' },
      { kind: 'string', file: gate, includes: 'embed' },
      { kind: 'string', file: gate, includes: 'recordHarMode' },
    ],
    'REQ-RUNS-02': [
      { kind: 'string', file: gate, includes: 'captureMissing' },
      { kind: 'symbol', file: gate, name: 'gate_attached' },
    ],
    'REQ-RUNS-03': [
      { kind: 'symbol', file: capture, name: 'settleInBackground' },
      { kind: 'string', file: capture, includes: '--settle' },
      { kind: 'string', file: captureCli, includes: 'settle.json' },
    ],
    'REQ-RUNS-04': [
      { kind: 'symbol', file: capture, name: 'settleRunCapture' },
      { kind: 'symbol', file: 'src/rea/capture/helpers/splitHarBySteps.ts', name: 'splitHarBySteps' },
      { kind: 'string', file: capture, includes: 'findings.md' },
      { kind: 'string', file: capture, includes: 'steps.jsonl' },
    ],
    'REQ-RUNS-05': [
      { kind: 'value', file: facebook, name: 'DOCS_INDEX', equals: 'operations.json' },
      { kind: 'symbol', file: facebook, name: 'writeOperationDocs' },
      { kind: 'symbol', file: 'src/rea/facebookClient/helpers/domainOf.ts', name: 'domainOf' },
      { kind: 'string', file: 'src/rea/facebookClient/helpers/domainOf.ts', includes: 'groups' },
      { kind: 'string', file: 'src/rea/facebookClient/helpers/domainOf.ts', includes: 'reels' },
      { kind: 'string', file: 'src/rea/facebookClient/helpers/domainOf.ts', includes: 'login' },
      { kind: 'string', file: captureCli, includes: '../../../docs/platforms/facebook' },
    ],
    'REQ-RUNS-06': [
      { kind: 'symbol', file: facebook, name: 'indexRunModules' },
      { kind: 'symbol', file: facebook, name: 'readSlices' },
      { kind: 'symbol', file: facebook, name: 'buildClientMap' },
    ],
    'REQ-RUNS-07': [
      { kind: 'symbol', file: platform, name: 'buildPlatformClientMap' },
      { kind: 'symbol', file: platform, name: 'onHosts' },
    ],
    'REQ-RUNS-08': [
      { kind: 'symbol', file: facebook, name: 'clientFactsPath' },
      { kind: 'string', file: facebook, includes: 'clientFacts.json' },
      { kind: 'symbol', file: platform, name: 'platformFactsPath' },
    ],
    'REQ-RUNS-09': [
      { kind: 'string', file: docsGate, includes: '<!-- toWrite -->' },
      { kind: 'string', file: docsGate, includes: 'operations.json' },
    ],
    'REQ-RUNS-10': [
      { kind: 'symbol', file: store, name: 'listRuns' },
      { kind: 'symbol', file: store, name: 'docsBuiltAt' },
      { kind: 'symbol', file: store, name: 'BUSY_MS' },
    ],
    'REQ-RUNS-11': [
      { kind: 'symbol', file: store, name: 'pruneRuns' },
      { kind: 'string', file: 'src/cli/runs/index.ts', includes: 'apply' },
    ],
    'REQ-RUNS-12': [{ kind: 'symbol', file: store, name: 'backfillExchanges' }],
    'REQ-RUNS-13': [
      { kind: 'value', file: store, name: 'KEPT_FILES', equals: ['findings.md', 'steps.jsonl', 'settle.json'] },
      { kind: 'value', file: store, name: 'KEPT_RUN_FILES', equals: ['goalFindings.md', 'goalFindings.jsonl'] },
      { kind: 'string', file: store, includes: 'pruned.jsonl' },
      { kind: 'symbol', file: store, name: 'keepReadings' },
      { kind: 'symbol', file: 'src/browser/runStore/helpers/domainsInHar.ts', name: 'domainsInHar' },
    ],
    'REQ-RUNS-14': [
      { kind: 'value', file: verdict, name: 'RUNS_WARN_BYTES', equals: 2000000000 },
      { kind: 'value', file: verdict, name: 'DISK_WARN_BYTES', equals: 5000000000 },
      { kind: 'symbol', file: verdict, name: 'storageVerdict' },
      { kind: 'string', file: verdict, includes: 'log runs prune --apply' },
      { kind: 'string', file: 'src/agentHooks/registry/index.ts', includes: 'scripts/hooks/storage.ts' },
    ],
  },
  rubrics: {
    'REQ-RUNS-01': noul('Does _force_capture, called by _force_context for every new_context and launch_persistent_context the gate installs, set recordHarPath to a session.har in the capture folder with recordHarContent embed and recordHarMode full, with no flag that skips it?'),
    'REQ-RUNS-02': noul('Do _force_capture and gate_attached raise GateError captureMissing when no capture folder was armed, before any page loads?'),
    'REQ-RUNS-03': noul('Does settleInBackground start log facebook capture --settle on the capture folder of the run, and does the capture --settle path write settle.json in that folder after settleRunCapture?'),
    'REQ-RUNS-04': noul('Does settleRunCapture split session.har with splitHarBySteps by the parsed steps.jsonl, write each part as its own HAR under steps/, run rea on each one, and write findings.md where the section of each step carries the evidence id that rea returned for that same step, taken from its output with evidenceIdOf?'),
    'REQ-RUNS-05': noul('Does writeOperationDocs write each operation to docsDir/<operation.domain>/<operation.name>.md and list every one in DOCS_INDEX, with the domain chosen by domainOf from the name of the request?'),
    'REQ-RUNS-06': noul('Does buildClientMap index the Facebook modules from the runs with indexRunModules and, when a runner is given, call readSlices so rea reads the slice of each request and sets its reaEvidenceId?'),
    'REQ-RUNS-07': noul('Does the capture --docs path call buildPlatformClientMap for every platform other than facebook whose PLATFORM_SITES entry has browser set, and does buildPlatformClientMap keep only calls to the hosts of that platform, find their code in its bundles, have rea read them, and fall back to the rea evidence of the step when no code was found?'),
    'REQ-RUNS-08': noul('Does writeOperationDocs read the facts store, pass each operation with its earlier stored facts (or factsFromDoc of the old doc when the store has none) into foldOperation so the rows from earlier runs are kept and only added to, and write the store back?'),
    'REQ-RUNS-09': noul('Does checkFacebookClientDocs push a problem when a listed doc is missing, when the doc still holds the toWrite marker, when a non-endpoint operation has no reaEvidenceId, for a doc file not listed in the index, for a Query or Mutation name in src or python with no doc, and for a session.har newer than builtAt, doing the same missing, toWrite and evidence checks for every other platform, and exiting 1 when there is any problem?'),
    'REQ-RUNS-10': noul('In listRuns, is keep left null, so that the run may go, only when the run is not open, has not changed within BUSY_MS of 10 minutes, has settle.json, and its session.har is not newer than docsBuiltAt?'),
    'REQ-RUNS-11': noul('Does pruneRuns delete a run folder only when options.apply is true, and does the runs prune subcommand pass apply only when the --apply flag is given?'),
    'REQ-RUNS-12': noul('When applying, does pruneRuns call backfillExchanges on the run first and skip the run, keeping it on disk, when any step failed to have its exchanges taken out?'),
    'REQ-RUNS-13': noul('Does pruneRuns copy KEPT_FILES and, through keepReadings, every exchanges.json, reading.json and readingState.json of each step and the KEPT_RUN_FILES into runs/kept, write pruned.json with the domains of the run from domainsInHar, and append a line to runs/pruned.jsonl before deleting the run?'),
    'REQ-RUNS-14 warns': noul('In storageVerdict, is a line pushed when runsBytes is greater than RUNS_WARN_BYTES, another when freeBytes is less than DISK_WARN_BYTES, is null returned when no line was pushed, and does the returned text end with PRUNE_ADVICE?'),
    unspecifiedBehavior: noul('Does any of this code delete a run that rea has not settled or the docs do not hold, drop what a pruned run taught, or let a browser context run without recording a HAR, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-RUNS-01': MET,
    'REQ-RUNS-02': MET,
    'REQ-RUNS-03': MET,
    'REQ-RUNS-04': MET,
    'REQ-RUNS-05': MET,
    'REQ-RUNS-06': MET,
    'REQ-RUNS-07': MET,
    'REQ-RUNS-08': MET,
    'REQ-RUNS-09': MET,
    'REQ-RUNS-10': MET,
    'REQ-RUNS-11': MET,
    'REQ-RUNS-12': MET,
    'REQ-RUNS-13': MET,
    'REQ-RUNS-14 warns': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
