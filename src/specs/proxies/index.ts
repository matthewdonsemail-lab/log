import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'
import type { RequirementAnchors } from '../anchors/index'

const RUNNER = 'src/cli/runner/client.ts'
const PROXY_TYPES = 'src/browser/proxy/types.ts'
const GATE = 'python/browser/proxyGate.py'
const VENDOR = 'src/proxyVendor/vendor/helpers/vendorOfProxy.ts'
const COMMAND = 'src/cli/proxy/index.ts'
const BYTEFUL = 'src/proxyVendor/byteful/client.ts'
const TRAFFIC = 'src/proxyVendor/traffic/client.ts'
const BUDGET = 'src/proxyVendor/traffic/helpers/budget.ts'
const PERSONA_RUN = 'src/cli/warmup/helpers/personaRun.ts'
const FEED_RUN = 'src/cli/warmup/helpers/feedRun.ts'

const anchors: RequirementAnchors = {
  'REQ-PROXY-01': [
    { kind: 'symbol', file: RUNNER, name: 'takeProxyMs' },
    { kind: 'symbol', file: RUNNER, name: 'runWith' },
    { kind: 'string', file: RUNNER, includes: '--proxyMs must be 500 to 60000 ms' },
  ],
  'REQ-PROXY-02': [
    { kind: 'value', file: PROXY_TYPES, name: 'SLOW_FACEBOOK_MS', equals: 2500 },
    { kind: 'symbol', file: PROXY_TYPES, name: 'slowFacebookMs' },
    { kind: 'value', file: GATE, name: 'SLOW_MS', equals: 2500 },
    { kind: 'symbol', file: GATE, name: 'slow_ms' },
    { kind: 'string', file: GATE, includes: 'LOG_PROXY_MAX_MS' },
  ],
  'REQ-PROXY-03': [
    { kind: 'symbol', file: VENDOR, name: 'vendorOfProxy' },
    { kind: 'symbol', file: VENDOR, name: 'HOSTS' },
    { kind: 'string', file: VENDOR, includes: 'twoCaptcha' },
    { kind: 'string', file: VENDOR, includes: 'byteful' },
    { kind: 'string', file: VENDOR, includes: 'traffic' },
  ],
  'REQ-PROXY-04': [
    { kind: 'symbol', file: COMMAND, name: 'saveFirstGood' },
    { kind: 'value', file: COMMAND, name: 'MAX_PROXY_KM', equals: 100 },
    { kind: 'value', file: COMMAND, name: 'PROXY_ATTEMPTS', equals: 3 },
  ],
  'REQ-PROXY-05': [
    { kind: 'symbol', file: COMMAND, name: 'assignByteful' },
    { kind: 'symbol', file: BYTEFUL, name: 'residentialProxyUrl' },
    { kind: 'string', file: COMMAND, includes: '24h' },
    { kind: 'string', file: BYTEFUL, includes: 'sticky' },
  ],
  'REQ-PROXY-06': [
    { kind: 'symbol', file: COMMAND, name: 'assignOne' },
    { kind: 'symbol', file: COMMAND, name: 'assignByteful' },
    { kind: 'string', file: COMMAND, includes: 'deactivated' },
    { kind: 'string', file: COMMAND, includes: 'FACEBOOK' },
  ],
  'REQ-PROXY-08': [
    { kind: 'symbol', file: BUDGET, name: 'trafficBudget' },
    { kind: 'value', file: BUDGET, name: 'DEFAULT_TRAFFIC_BUDGET_MB', equals: 1024 },
    { kind: 'symbol', file: TRAFFIC, name: 'trafficLedgerPath' },
    { kind: 'string', file: TRAFFIC, includes: 'proxyTraffic' },
  ],
  'REQ-PROXY-09': [
    { kind: 'symbol', file: PERSONA_RUN, name: 'runPersonaSession' },
    { kind: 'symbol', file: FEED_RUN, name: 'runFeedSession' },
  ],
  'REQ-PROXY-10': [
    { kind: 'symbol', file: PERSONA_RUN, name: 'runPersonaSession' },
  ],
  'REQ-PROXY-11': [
    { kind: 'symbol', file: TRAFFIC, name: 'recordTraffic' },
    { kind: 'string', file: TRAFFIC, includes: 'proxyTraffic' },
  ],
  'REQ-PROXY-12': [
    { kind: 'symbol', file: TRAFFIC, name: 'meterForProxy' },
    { kind: 'symbol', file: TRAFFIC, name: 'bytefulMeter' },
    { kind: 'symbol', file: TRAFFIC, name: 'twoCaptchaMeter' },
  ],
}

export const proxies = {
  description: 'Account proxies: the speed limit, the providers, assigning and the traffic budget',
  specPath: 'docs/specs/proxies.md',
  codePaths: [
    RUNNER,
    PROXY_TYPES,
    GATE,
    VENDOR,
    COMMAND,
    BYTEFUL,
    'src/proxyVendor/twoCaptcha/client.ts',
    TRAFFIC,
    BUDGET,
    PERSONA_RUN,
    FEED_RUN,
  ],
  anchors,
  rubrics: {
    'REQ-PROXY-01': noul('Does runWith set process.env.LOG_PROXY_MAX_MS to the --proxyMs value taken by takeProxyMs for the dispatch, restore the previous value afterwards, and refuse before dispatch a value that is not an integer from 500 to 60000?'),
    'REQ-PROXY-02': noul('When LOG_PROXY_MAX_MS is not set, does slowFacebookMs in TypeScript return SLOW_FACEBOOK_MS and slow_ms in Python return SLOW_MS?'),
    'REQ-PROXY-03': noul('Does vendorOfProxy read the hostname of the proxy URL and return twoCaptcha for proxy.2captcha.com and byteful for byteful.com, both with billing traffic, and null for an unparsable URL or any other host?'),
    'REQ-PROXY-04': noul('Does saveFirstGood write the proxy to the socialAccounts proxy field only after checkProxy succeeds, the exit is in the home country and within MAX_PROXY_KM of the home centre and facebookMs is not over slowFacebookMs, trying at most PROXY_ATTEMPTS sessions and saving none when every one fails?'),
    'REQ-PROXY-05': noul('Does assignByteful build its proxy with residentialProxyUrl using ttl 24h, the homeCountry of the account and the cityId picked for its home city, and does residentialProxyUrl request list_session_type sticky?'),
    'REQ-PROXY-06': noul('Do both assignOne and assignByteful refuse an account whose status is deactivated, whose platform is not FACEBOOK, or that has no homeCountry, before asking a provider for a proxy?'),
    'REQ-PROXY-07': noul('Does any provider client in the code call an endpoint that creates a checkout, an order or a purchase, rather than only reading balances, cities, proxy lists or a quote?'),
    'REQ-PROXY-08': noul('Does trafficBudget sum the mb of the ledger entries for that account whose at is within the last 24 hours, against DEFAULT_TRAFFIC_BUDGET_MB unless trafficMb is given?'),
    'REQ-PROXY-09': noul('Do runPersonaSession and runFeedSession return trafficBudgetSpent before any step when a meter exists and the budget leftMb is 0 or less?'),
    'REQ-PROXY-10': noul('Does runPersonaSession read the meter on every fifth swipe and stop with trafficBudgetSpent when budget.usedMb plus runMb reaches budget.budgetMb?'),
    'REQ-PROXY-11': noul('At the end of a metered warm-up, do runPersonaSession and runFeedSession read the meter and call recordTraffic with the time, account, run and mb, appending one line to the ledger at trafficLedgerPath()?'),
    'REQ-PROXY-12': noul('Does meterForProxy return the meter of the vendor that vendorOfProxy reads from the proxy (bytefulMeter for byteful, twoCaptchaMeter for twoCaptcha) and null when the proxy has no traffic-billed vendor?'),
    unspecifiedBehavior: noul('Does the proxy code save a proxy to Twenty, run a metered warm-up past its budget, or set the speed limit by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-PROXY-01': MET,
    'REQ-PROXY-02': MET,
    'REQ-PROXY-03': MET,
    'REQ-PROXY-04': MET,
    'REQ-PROXY-05': MET,
    'REQ-PROXY-06': MET,
    'REQ-PROXY-07': NOT_VIOLATED,
    'REQ-PROXY-08': MET,
    'REQ-PROXY-09': MET,
    'REQ-PROXY-10': MET,
    'REQ-PROXY-11': MET,
    'REQ-PROXY-12': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
