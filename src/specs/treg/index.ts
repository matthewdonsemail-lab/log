import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const COMMAND = 'src/cli/treg/index.ts'
const CLIENT = 'src/extensions/treg/client.ts'
const ENDPOINT = 'src/extensions/treg/helpers/endpoint.ts'
const TRIM = 'src/extensions/treg/helpers/trim.ts'

export const treg = {
  description: "treg's catalog as an extension: found by the job, read, called with the key held server-side, priced calls only when matt approved",
  specPath: 'docs/specs/treg.md',
  codePaths: [COMMAND, CLIENT, ENDPOINT, TRIM],
  anchors: {
    'REQ-TREG-01': [
      { kind: 'symbol', file: COMMAND, name: 'tregCommand' },
      { kind: 'symbol', file: CLIENT, name: 'createTregClient' },
      { kind: 'symbol', file: CLIENT, name: 'runTreg' },
      { kind: 'uses', file: CLIENT, name: 'execFile' },
      { kind: 'symbol', file: ENDPOINT, name: 'callArgs' },
      { kind: 'symbol', file: ENDPOINT, name: 'paramsOf' },
      { kind: 'string', file: CLIENT, includes: 'treg.call' },
    ],
    'REQ-TREG-02': [
      { kind: 'symbol', file: ENDPOINT, name: 'endpointOf' },
      { kind: 'symbol', file: ENDPOINT, name: 'isFreePrice' },
      { kind: 'symbol', file: ENDPOINT, name: 'shownCommand' },
      { kind: 'string', file: COMMAND, includes: 'a priced one is a dry run that says its price unless --live with --approvedBy' },
    ],
    'REQ-TREG-03': [
      { kind: 'symbol', file: TRIM, name: 'trimAnswer' },
      { kind: 'symbol', file: TRIM, name: 'trimOf' },
      { kind: 'string', file: COMMAND, includes: 'tregTrimInvalid' },
    ],
  },
  rubrics: {
    'REQ-TREG-01': noul('Does createTregClient run the treg binary from tregBin with execFile (no shell), a timeout and capped output, building search as catalog search with --limit, get as catalog get, and call through callArgs with one --query key=value per param (lists comma-joined); is each run wrapped in a timed span named treg.search, treg.get or treg.call; and does tregCommand refuse a failed run with tregFailed and non-object params with tregParamsInvalid?'),
    'REQ-TREG-02': noul('Does the call form of tregCommand read the endpoint with get on every call (first when not live with approvedBy, alongside the call when it is), treat it as free only when isFreePrice says so, return a dry run with the price and shownCommand for a priced endpoint without --live, refuse a priced endpoint with --live but no --approvedBy with notApproved, and call a priced endpoint only with both --live and --approvedBy?'),
    'REQ-TREG-03': noul('Does the call form of tregCommand drop the raw key from the parsed treg answer unless --raw, trim every list of rows in it by --where key=value, then --maxItems, then --fields through trimAnswer, and refuse a malformed --where or --maxItems with tregTrimInvalid before treg is called?'),
    unspecifiedBehavior: noul('Does any treg command spend money on a priced endpoint without --live and --approvedBy, run treg through a shell, or call an endpoint other than the one asked for, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-TREG-01': MET,
    'REQ-TREG-02': MET,
    'REQ-TREG-03': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
