import { describe, expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findingOf } from '../../agentHooks/pageState/index'
import { readingAt } from '../../browser/inspect/helpers/browserStates'
import { runCli } from '../../cli/runner/index'
import { marketplaceFixture } from '../../twenty/graphql/helpers/marketplaceFixture'
import type { DecisionRequest, DecisionResponse } from '../decisions/types'
import { bundleOf, decisionOf, DOCUMENT_FIELDS, documentAnswerOf, exchangesOf, exchangeTimeline, fitBundle, loudText, questionsOf, readStep, SUBQ_STEP_MODEL } from './index'
import type { StepAccount, StepBundle, StepTaken } from './index'

const T0 = Date.parse('2026-10-22T10:55:16.000Z')
const at = (ms: number) => new Date(T0 + ms).toISOString()

function api(ms: number, name: string, variables: Record<string, unknown>, answer: unknown, extra: Record<string, string> = {}) {
  const body = new URLSearchParams({ fb_dtsg: 'SECRET-TOKEN', lsd: 'SECRET-LSD', fb_api_req_friendly_name: name, variables: JSON.stringify(variables), doc_id: '1', ...extra }).toString()
  return {
    startedDateTime: at(ms),
    time: 500,
    request: { method: 'POST', url: 'https://www.facebook.com/api/graphql/', headers: [{ name: 'sec-fetch-dest', value: 'empty' }, { name: 'sec-fetch-site', value: 'same-origin' }, { name: 'x-fb-friendly-name', value: name }, { name: 'cookie', value: 'c_user=1; xs=SECRET' }], postData: { mimeType: 'application/x-www-form-urlencoded', text: body } },
    response: { status: 200, content: { mimeType: 'text/html', text: JSON.stringify(answer) } }
  }
}

const offered = (places: string[]) => ({ data: { city_street_search: { street_results: { edges: places.map((p) => ({ node: { single_line_address: p, page: { id: p.length.toString() } } })) } } } })

const WEST_BANK_HAR = {
  log: {
    entries: [
      {
        startedDateTime: at(0),
        time: 3900,
        request: { method: 'GET', url: 'https://www.facebook.com/marketplace/', headers: [{ name: 'sec-fetch-dest', value: 'document' }] },
        response: { status: 200, content: { mimeType: 'text/html', text: '<title>Facebook Marketplace</title><script>{"buy_location":{"display_name":"Lima, Peru","id":"108446732520456"},"current_marketplace":{"is_metric_base":false,"id":"1663689853903557"}}</script>' } }
      },
      { startedDateTime: at(100), time: 10, request: { method: 'GET', url: 'https://static.xx.fbcdn.net/rsrc.php/x.js', headers: [{ name: 'sec-fetch-dest', value: 'script' }] }, response: { status: 200, content: { mimeType: 'application/x-javascript', text: 'code' } } },
      { startedDateTime: at(200), time: 10, request: { method: 'GET', url: 'https://video.fbcdn.net/o1/v/t2/x.mp4', headers: [{ name: 'sec-fetch-dest', value: 'empty' }, { name: 'sec-fetch-site', value: 'cross-site' }] }, response: { status: 200, content: { mimeType: 'video/mp4' } } },
      { startedDateTime: at(300), time: 10, request: { method: 'POST', url: 'https://www.facebook.com/ajax/bootloader-endpoint/', headers: [{ name: 'sec-fetch-dest', value: 'empty' }] }, response: { status: 200, content: { mimeType: 'application/json', text: '{"code":1}' } } },
      api(11_090, 'MarketplaceSearchAddressDataSourceQuery', { params: { caller: 'MARKETPLACE', query: 'Lima, Peru', viewer_coordinates: { latitude: -12.0611, longitude: -77.0353 } } }, offered(['Lima, Peru'])),
      api(12_450, 'MarketplaceSearchAddressDataSourceQuery', { params: { caller: 'MARKETPLACE', query: 'Bethlehem, PA', viewer_coordinates: { latitude: -12.0611, longitude: -77.0353 } } }, offered(['Bethlehem, West Bank', 'Bethlehem, Free State'])),
      api(17_620, 'CometMarketplaceSetBuyLocationMutation', { input: { latitude: 31.7031, longitude: 35.1956 } }, { data: { marketplace_set_buy_location: { viewer: { marketplace_settings: { buy_location: { reverse_geocode: { city: 'Bethlehem', state: '', postal_code: '' } }, current_marketplace: { is_metric_base: true, id: '431364634888083' } } } } } })
    ]
  }
}

const KNOWN = new Set(['MarketplaceSearchAddressDataSourceQuery', 'CometMarketplaceSetBuyLocationMutation'])
const ACCOUNT: StepAccount = { name: 'bethlehem', platform: 'facebook', homeCity: 'bethlehem', homeCountry: 'US', browser: 'adsPower', exit: 'exit 24.229.136.140 in US' }
const TAKEN: StepTaken = { step: '04_setlocationBethlehemPa', action: 'setLocation', args: ['Bethlehem, PA'], ok: true, error: null, url: 'https://www.facebook.com/marketplace/101880973186304', title: 'Facebook Marketplace', ms: 28656, landedMs: 20688, mouse: null }
const GOAL = "Set the account's Marketplace location to its home: Bethlehem, Pennsylvania"

function bundle(over: Partial<StepBundle> = {}): StepBundle {
  return { ...bundleOf({ goal: GOAL, account: ACCOUNT, taken: TAKEN, pageState: null, pageText: '- button "Location: Bethlehem, West Bank, Within 65 km"', exchanges: exchangesOf(WEST_BANK_HAR, KNOWN, ['buy_location', 'current_marketplace']), earlier: [] }), ...over }
}

describe('the internal API of a step, read by code (rule 73)', () => {
  test('API calls and page loads are kept with what was sent and what came back; code, media, cross-site and secrets are not', () => {
    const exchanges = exchangesOf(WEST_BANK_HAR, KNOWN, ['buy_location', 'current_marketplace'])
    expect(exchanges.map((e) => e.name)).toEqual(['page /marketplace/', 'MarketplaceSearchAddressDataSourceQuery', 'MarketplaceSearchAddressDataSourceQuery', 'CometMarketplaceSetBuyLocationMutation'])
    expect(exchanges[0].answer).toMatchObject({ title: 'Facebook Marketplace', fields: { buy_location: { display_name: 'Lima, Peru' }, current_marketplace: { id: '1663689853903557' } } })
    expect(exchanges[2].offsetMs).toBe(12_450)
    expect(exchanges[2].sent).toMatchObject({ variables: { params: { query: 'Bethlehem, PA' } } })
    expect(exchanges[2].answer).toMatchObject({ data: { city_street_search: { street_results: { edges: [{ node: { single_line_address: 'Bethlehem, West Bank' } }, {}] } } } })
    const text = JSON.stringify(exchanges)
    expect(text).not.toContain('SECRET')
    expect(text).not.toContain('c_user')
  })

  test('the create page says whether the account may post (marketplace_new_seller_can_post_item) and a feed listing whether it is a partner listing, read from the page itself', () => {
    const html = '<title>Facebook</title><script>{"marketplace_new_seller_can_post_item":false,"marketplace_listing_creation_limit_reason":null,"product_details_type":"PARTNER_LISTING","partner_brand_name":"Catawiki","partner_listing_location":"Italy"}</script>'
    const answer = documentAnswerOf(html, DOCUMENT_FIELDS.facebook!) as { fields: Record<string, unknown> }
    expect(answer.fields['marketplace_new_seller_can_post_item']).toBe(false)
    expect(answer.fields['product_details_type']).toBe('PARTNER_LISTING')
    expect(answer.fields['partner_brand_name']).toBe('Catawiki')
  })

  test('the timeline shows what went in and what came back, and only what changed on a repeated call', () => {
    const lines = exchangeTimeline(bundle().exchanges)
    expect(lines[0]).toContain('buy_location.display_name="Lima, Peru"')
    expect(lines[1]).toContain('params.query="Lima, Peru"')
    expect(lines[1]).toContain('params.viewer_coordinates.latitude=-12.0611')
    expect(lines[2]).toContain('sent: changedSinceLastCall.params.query="Bethlehem, PA"')
    expect(lines[2]).toContain('single_line_address="Bethlehem, West Bank"')
    expect(lines[2]).toContain('single_line_address="Bethlehem, Free State"')
    expect(lines[3]).toContain('input.latitude=31.7031')
    expect(lines[3]).toContain('reverse_geocode.state=""')
    expect(lines[3]).toContain('current_marketplace.id="431364634888083"')
  })
})

describe('whether a step is decided', () => {
  test('a known page state decides it; a step that did nothing is noChange; anything else is undecided, with why', () => {
    expect(decisionOf(bundle({ pageState: 'checkpointStart' }))).toEqual({ decided: true, by: 'pageState', state: 'checkpointStart' })
    expect(decisionOf(bundle({ exchanges: [], newRequests: [] }))).toEqual({ decided: true, by: 'nothingHappened', state: 'noChange' })
    const undecided = decisionOf(bundle())
    expect(undecided.decided).toBe(false)
    if (!undecided.decided) expect(undecided.why).toEqual(['no known state confirms whether the goal was met'])
    const failed = decisionOf(bundle({ taken: { ...TAKEN, ok: false, error: 'TimeoutError' }, newRequests: ['ajaxNew'] }))
    if (!failed.decided) expect(failed.why.slice(0, 2)).toEqual(['the step failed: TimeoutError', 'internal API calls never documented before: ajaxNew'])
  })
})

describe('the questions SubQ is asked', () => {
  test('the core questions about meaning, then one per internal API call, never more than 128', () => {
    const { questions, exchangeKeys } = questionsOf(bundle())
    expect(Object.keys(questions).slice(0, 10)).toEqual(['goalMet', 'fitsAccount', 'shouldNeverHaveComeUp', 'pageMatchesApi', 'causedByOurAction', 'timingNormal', 'stoppedByPlatform', 'personNeeded', 'earlierStepsExplain', 'meaning'])
    expect(Object.keys(exchangeKeys)).toHaveLength(4)
    expect(questions.goalMet.instructions).toContain(GOAL)
    const many = bundle({ exchanges: Array.from({ length: 200 }, () => bundle().exchanges[1]) })
    expect(Object.keys(questionsOf(many).questions)).toHaveLength(128)
  })

  test('fitting to the context window drops the largest answers first and keeps the small ones that carry the place', () => {
    const big = { ...bundle().exchanges[1], name: 'ajaxBulkRouteDefinitions', answer: 'x'.repeat(5000) }
    const fitted = fitBundle(bundle({ exchanges: [...bundle().exchanges, big] }), JSON.stringify(bundle()).length + 500)
    expect(fitted.exchanges.at(-1)!.answer).toBe('(answer left out to fit: 5002 chars)')
    expect(JSON.stringify(fitted.exchanges[2].answer)).toContain('Bethlehem, West Bank')
  })
})

function recordedStep(): { root: string; folder: string } {
  const root = mkdtempSync(join(tmpdir(), 'stepReading-'))
  const folder = join(root, 'steps', '04_setlocationBethlehemPa')
  mkdirSync(folder, { recursive: true })
  mkdirSync(join(root, 'adsPower'), { recursive: true })
  writeFileSync(join(folder, 'network.har'), JSON.stringify(WEST_BANK_HAR))
  writeFileSync(join(folder, 'snapshot.yml'), '- button "Location: Bethlehem, West Bank, Within 65 km"\n- textbox "Location": Bethlehem, PA')
  writeFileSync(join(folder, 'screenshot.png'), Buffer.from([137, 80, 78, 71]))
  writeFileSync(join(folder, 'mouse.json'), JSON.stringify({ legs: [{ kind: 'flick', target: 'input ""', ms: 500 }], idleMoves: 2 }))
  writeFileSync(join(root, 'adsPower', 'steps.jsonl'), `${JSON.stringify({ at: at(0), step: 'Gate passed: exit 24.229.136.140 in US (America/New_York), proxy to Facebook 2218 ms' })}\n`)
  writeFileSync(join(root, 'replies.jsonl'), [
    { id: 'a', result: { ok: true, step: '03_selllocation', action: 'sellLocation', args: [], url: 'https://www.facebook.com/marketplace/create/item', ms: 5484, notable: ['POST 200 /ajax/bnzai'] } },
    { id: 'b', result: { ok: true, step: '04_setlocationBethlehemPa', action: 'setLocation', args: ['Bethlehem, PA'], url: TAKEN.url, title: TAKEN.title, ms: 28656, landedMs: 20688 } }
  ].map((l) => JSON.stringify(l)).join('\n'))
  return { root, folder }
}

const ANSWERS: DecisionResponse = {
  model: 'subq-snap-1.1',
  answers: {
    goalMet: { type: 'noul', noul: 0.06 },
    fitsAccount: { type: 'noul', noul: 0.05 },
    meaning: { type: 'choice', choice: 'wrongResult', probabilities: { wrongResult: 0.93 }, confidence: 0.9 },
    api002: { type: 'choice', choice: 'contradictsGoal', probabilities: { contradictsGoal: 0.61 }, confidence: 0.6 }
  },
  usage: { input_tokens: 1234, output_tokens: 0 }
}

describe('reading a recorded step (log inspect read, and every inspect do)', () => {
  test('an undecided step is collated and read by SubQ, and said loudly with the data that went in and out', async () => {
    const { root, folder } = recordedStep()
    try {
      const asked: DecisionRequest[] = []
      const reading = await readStep(folder, { goal: GOAL, account: { name: 'bethlehem', platform: 'facebook', homeCity: 'bethlehem', homeCountry: 'US', browser: 'adsPower' }, decisions: async (r) => (asked.push(r), ANSWERS) })
      expect(asked).toHaveLength(1)
      expect(asked[0].model).toBe(SUBQ_STEP_MODEL)
      expect(asked[0].images).toHaveLength(1)
      const state = asked[0].state as Record<string, unknown>
      expect(state.goal).toBe(GOAL)
      expect(state.account).toMatchObject({ homeCountry: 'US', exit: 'exit 24.229.136.140 in US (America/New_York), proxy to Facebook 2218 ms' })
      expect(state.whatWeDid).toMatchObject({ action: 'setLocation', args: ['Bethlehem, PA'], ms: 28656, mouse: { moves: 1, idleMoves: 2 } })
      expect(state.earlierSteps).toEqual([{ step: '03_selllocation', action: 'sellLocation', args: [], ok: true, url: 'https://www.facebook.com/marketplace/create/item', ms: 5484, requests: ['POST 200 /ajax/bnzai'], meaning: null }])
      expect(String(state.pageText)).toContain('textbox "Location": <redacted>')
      expect((state.internalApiTimeline as string[]).join('\n')).toContain('Bethlehem, West Bank')
      expect(reading.meaning[0]).toBe('meaning: wrongResult: The step ran but the result is wrong for the goal or the account (93%)')
      expect(reading.meaning).toContain('the goal was NOT reached (94%)')
      expect(reading.meaning.at(-1)).toContain('contradicts the goal (61%): +12.45s POST MarketplaceSearchAddressDataSourceQuery 200')
      expect(reading.meaning.at(-1)).toContain('changedSinceLastCall.params.query="Bethlehem, PA"')
      const loud = loudText(reading)
      expect(loud.split('\n')[0]).toBe('>>> UNKNOWN STATE at 04_setlocationBethlehemPa: no known state confirms whether the goal was met.')
      expect(loud).toContain('Name this state before the flow goes on (rule 74)')
      for (const file of ['exchanges.json', 'exchanges.md', 'reading.json', 'readingState.json']) expect(existsSync(join(folder, file))).toBe(true)
      expect(readFileSync(join(folder, 'exchanges.md'), 'utf8')).toContain('single_line_address="Bethlehem, West Bank"')
      const hook = readingAt(join(folder, 'reading.json'))
      expect(hook?.decided).toBe(false)
      const finding = findingOf({ account: 'bethlehem', step: '04_setlocationBethlehemPa', url: TAKEN.url, text: '', failed: null, reading: hook })
      expect(finding.kind).toBe('reading')
      expect(finding.line).toContain('UNKNOWN STATE')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('a known page state is not sent to SubQ', async () => {
    const { root, folder } = recordedStep()
    try {
      writeFileSync(join(folder, 'snapshot.yml'), '- heading "Confirm that you\'re human to use your account"')
      writeFileSync(join(root, 'replies.jsonl'), JSON.stringify({ id: 'b', result: { ok: true, step: '04_setlocationBethlehemPa', url: 'https://www.facebook.com/checkpoint/1/' } }))
      let calls = 0
      const reading = await readStep(folder, { goal: GOAL, account: { name: 'b', platform: 'facebook', homeCity: null, homeCountry: null, browser: null }, decisions: async () => (calls++, ANSWERS) })
      expect(calls).toBe(0)
      expect(reading.decision).toEqual({ decided: true, by: 'pageState', state: 'checkpointStart' })
      expect(loudText(reading)).toBe('Known state at 04_setlocationBethlehemPa: checkpointStart (pageState). No reading needed.')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('a SubQ failure is said loudly, never guessed past', async () => {
    const { root, folder } = recordedStep()
    try {
      const reading = await readStep(folder, { goal: GOAL, account: { name: 'b', platform: 'facebook', homeCity: null, homeCountry: null, browser: null }, decisions: async () => { throw new Error('SubQ 402: insufficient credits') } })
      expect(reading.error).toBe('SubQ 402: insufficient credits')
      expect(loudText(reading)).toContain('>>> SubQ could not read it: SubQ 402: insufficient credits')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  test('log inspect read prints the loud reading and the timeline', async () => {
    const { root, folder } = recordedStep()
    const out: string[] = []
    try {
      const code = await runCli(['inspect', 'read', folder, '--account', 'galwayOne', '--goal', GOAL], { twenty: marketplaceFixture(), decisions: async () => ANSWERS, out: (l) => out.push(l), err: () => {} })
      expect(code).toBe(0)
      const text = out.join('\n')
      expect(text).toContain('>>> UNKNOWN STATE at 04_setlocationBethlehemPa')
      expect(text).toContain('Internal API in this step, what went in and what came back (4 calls')
      expect(text).toContain('sent: input.latitude=31.7031, input.longitude=35.1956')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
