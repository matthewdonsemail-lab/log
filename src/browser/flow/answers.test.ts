import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { StepExchange } from '../../subq/stepReading/types'
import { answersIssue, answerWait, keepAnswers, loadFlow, renderFlowDoc, saveFlow } from './index'
import type { AnswerExpect, FlowDefinition } from './index'

const BETHLEHEM = { uid: '61594063207669', homeCity: 'Bethlehem', homeCountry: 'US' }

const page = (name: string, status: number, fields: Record<string, unknown>): StepExchange => ({ offsetMs: 0, kind: 'document', name, method: 'GET', host: 'www.facebook.com', path: name.slice(5), status, ms: 3000, sent: null, answer: { title: 'Facebook', bytes: 1, fields }, errors: [], known: true })

const createPage = (canPost: boolean, city: string, country: string) =>
  page('page /marketplace/create/item', 200, { sell_location: { latitude: 0, longitude: 0, reverse_geocode_detailed: { city, postal_code: '1', country_alpha_two: country } }, marketplace_new_seller_can_post_item: canPost, marketplace_listing_creation_limit_reason: null })

const flow = loadFlow('warmupCreateAccessCheck')!
const step = (id: string) => flow.steps.find((s) => s.id === id)!

describe('a stage flow step passes on Facebook\'s answer (rule 73)', () => {
  test('the create page: Barranco, Peru (2026-10-22) is the wrong place, may-post false (2026-10-23) is no posting, Bethlehem US and true passes', () => {
    const create = step('s03_gotomarketplaceCreateItem').answers!
    expect(answersIssue(create, [createPage(true, 'Bethlehem', 'US')], BETHLEHEM)).toBeNull()
    expect(answersIssue(create, [createPage(false, 'Bethlehem', 'US')], BETHLEHEM)).toEqual({ code: 'marketplaceMayNotPost', text: 'page /marketplace/create/item answered fields.marketplace_new_seller_can_post_item = false, not true' })
    expect(answersIssue(create, [createPage(true, 'Barranco', 'PE')], BETHLEHEM)).toEqual({ code: 'marketplaceLocationWrong', text: 'page /marketplace/create/item answered fields.sell_location.reverse_geocode_detailed.country_alpha_two = "PE", not the account\'s home country (US)' })
  })

  test('Marketplace: buy_location must be the account\'s home city; Lima, Peru (2026-10-22) is not', () => {
    const marketplace = step('s01_gotomarketplace').answers!
    expect(answersIssue(marketplace, [page('page /marketplace/', 200, { buy_location: { display_name: 'Bethlehem, Pennsylvania', id: '112122412138421' } })], BETHLEHEM)).toBeNull()
    expect(answersIssue(marketplace, [page('page /marketplace/', 200, { buy_location: { display_name: 'Lima, Peru', id: '108446732520456' } })], BETHLEHEM)?.code).toBe('marketplaceLocationWrong')
  })

  test('a redirect before the page counts only if no 2xx answer follows', () => {
    const marketplace = step('s01_gotomarketplace').answers!
    const ok = page('page /marketplace/', 200, { buy_location: { display_name: 'Bethlehem, Pennsylvania' } })
    expect(answersIssue(marketplace, [page('page /marketplace/', 302, {}), ok], BETHLEHEM)).toBeNull()
    expect(answersIssue(marketplace, [page('page /marketplace/', 302, {})], BETHLEHEM)).toEqual({ code: 'answerNotAsExpected', text: 'page /marketplace/ answered 302, never 2xx' })
  })

  test('without the account\'s home in Twenty, a home check is skipped, never failed', () => {
    expect(answersIssue(step('s03_gotomarketplaceCreateItem').answers!, [createPage(true, 'Barranco', 'PE')], {})).toBeNull()
  })

  test('the step waits for its first internal API call, not for a page load', () => {
    const answers: AnswerExpect[] = [{ call: 'page /', says: [] }, { call: 'FeedComposerCometRootQuery', says: [{ answer: 'data.viewer.actor.id', home: 'uid' }] }]
    expect(answerWait(answers)).toEqual({ name: 'FeedComposerCometRootQuery', ms: 15_000 })
    expect(answerWait(step('s03_gotomarketplaceCreateItem').answers)).toBeUndefined()
  })

  test('every warm-up stage flow\'s page loads and calls are checked, and the flow doc says what each must answer', () => {
    const checked = ['warmupCreateAccessCheck', 'warmupFeedBrowse', 'warmupMarketplaceBrowse', 'warmupMessagesVisit', 'warmupSellingVisit'].map((name) => [name, loadFlow(name)!.steps.filter((s) => s.answers?.length).map((s) => s.id)])
    expect(checked).toEqual([
      ['warmupCreateAccessCheck', ['s01_gotomarketplace', 's03_gotomarketplaceCreateItem', 's05_gotomarketplace']],
      ['warmupFeedBrowse', ['s01_goto', 's03_scroll', 's04_gotomarketplace']],
      ['warmupMarketplaceBrowse', ['s01_gotomarketplace', 's04_openAny']],
      ['warmupMessagesVisit', ['s01_gotomarketplace', 's02_scroll', 's03_gotomarketplaceYouSelling', 's05_gotomessages']],
      ['warmupSellingVisit', ['s01_gotomarketplace', 's03_gotomarketplaceYouSelling']]
    ])
    const doc = renderFlowDoc(flow)
    expect(doc).toContain('| Facebook must answer (rule 73) |')
    expect(doc).toContain("`fields.marketplace_new_seller_can_post_item` = `true` (else `marketplaceMayNotPost`)")
    expect(doc).toContain("`fields.sell_location.reverse_geocode_detailed.country_alpha_two` = the account's home country (else `marketplaceLocationWrong`)")
  })

  test('publishing: the create page stops the flow before the form when the account may not post, and Publish needs the listing id in the create answer', () => {
    const publish = loadFlow('marketplaceListingPublish')!
    const at = (id: string) => publish.steps.find((s) => s.id === id)!.answers!
    expect(answersIssue(at('s03_gotomarketplaceCreateItem'), [createPage(false, 'Bethlehem', 'US')], BETHLEHEM)?.code).toBe('marketplaceMayNotPost')
    const created = (id: string | null): StepExchange => ({ offsetMs: 0, kind: 'api', name: 'useCometMarketplaceListingCreateMutation', method: 'POST', host: 'www.facebook.com', path: '/api/graphql/', status: 200, ms: 1200, sent: {}, answer: { data: { marketplace_listing_create: { listing: id ? { id, story: { url: `https://www.facebook.com/marketplace/item/${id}/` } } : null } } }, errors: [], known: true })
    expect(answersIssue(at('s14_clickPublish'), [created('1425935622848350')], BETHLEHEM)).toBeNull()
    expect(answersIssue(at('s14_clickPublish'), [created(null)], BETHLEHEM)).toEqual({ code: 'noListingId', text: 'useCometMarketplaceListingCreateMutation answered no data.marketplace_listing_create.listing.id' })
    const located = (city: string): StepExchange => ({ offsetMs: 0, kind: 'api', name: 'CometMarketplaceSetBuyLocationMutation', method: 'POST', host: 'www.facebook.com', path: '/api/graphql/', status: 200, ms: 900, sent: {}, answer: { data: { marketplace_set_buy_location: { viewer: { marketplace_settings: { buy_location: { reverse_geocode: { city, state: 'PA' } } } } } } }, errors: [], known: true })
    expect(answersIssue(at('s02_setLocation'), [located('Bethlehem')], BETHLEHEM)).toBeNull()
    expect(answersIssue(at('s02_setLocation'), [located('Granada')], BETHLEHEM)?.code).toBe('marketplaceLocationWrong')
    expect(loadFlow('profileSetup')!.steps.filter((s) => s.answers?.length).map((s) => s.id)).toEqual(['s05_clickSave', 's08_clickSaveChanges', 's13_clickDone'])
  })

  test('recording a flow again keeps the checks of the steps it had', () => {
    const dir = mkdtempSync(join(tmpdir(), 'flows'))
    saveFlow(flow, dir)
    const recordedAgain: FlowDefinition = { ...flow, steps: flow.steps.map(({ answers: _answers, ...s }) => s) }
    saveFlow(recordedAgain, dir)
    expect(loadFlow(flow.name, dir)!.steps.map((s) => s.answers)).toEqual(flow.steps.map((s) => s.answers))
    expect(keepAnswers(recordedAgain, null)).toBe(recordedAgain)
  })
})
