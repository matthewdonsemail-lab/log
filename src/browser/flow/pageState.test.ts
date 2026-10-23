import { describe, expect, test } from 'bun:test'
import type { StepExchange } from '../../subq/stepReading/types'
import { pageStateOf } from './helpers/pageState'

const CHECKPOINT = 'https://www.facebook.com/checkpoint/1501092823525282/'

describe('pageStateOf: the known page states and what resolves each (rule 54)', () => {
  test("Reading's checkpoint as recorded: its first page, the text captcha, then the video selfie", () => {
    expect(pageStateOf(CHECKPOINT, "- generic [ref=e62]: Fitri Ramdani, confirm that you're human to use your account\n- generic [ref=e69]: Continue")?.id).toBe('checkpointStart')
    expect(pageStateOf(CHECKPOINT, "- generic [ref=e90]: Confirm that you're human\n- generic [ref=e92]: Enter the text from the image.")?.id).toBe('textCaptcha')
    const selfie = pageStateOf(CHECKPOINT, '- generic [ref=e130]: Confirm that you\'re a real person with a video selfie')
    expect(selfie).toMatchObject({ id: 'videoSelfie', person: true })
  })

  test('the feed prompt, the login form, an unmapped checkpoint; an ordinary page is none', () => {
    expect(pageStateOf('https://www.facebook.com/', '- heading "Remember password" [level=3]')?.id).toBe('rememberPassword')
    expect(pageStateOf('https://www.facebook.com/login/', '- textbox "Email or phone number"')?.id).toBe('loginForm')
    expect(pageStateOf(CHECKPOINT, '- heading "Something new"')).toMatchObject({ id: 'checkpoint', person: false })
    expect(pageStateOf('https://www.facebook.com/marketplace/', '- heading "Marketplace"')).toBeNull()
  })
})

describe('Messenger PIN', () => {
  const CREATE = 'heading "Create a PIN to access your chats on any device" [level=2]\nbutton "Create PIN"'

  test("\"Create a PIN\" without the PIN in Twenty is matt's: he gives it in the Clack prompt", () => {
    const state = pageStateOf('https://www.facebook.com/messages/', CREATE)
    expect(state?.id).toBe('messengerPinCreate')
    expect(state?.person).toBe(true)
    expect(state?.resolve).toContain('log facebook messenger pin')
  })

  test('"Create a PIN" with the PIN in Twenty resolves itself with the recorded flow', () => {
    const state = pageStateOf('https://www.facebook.com/messages/', CREATE, { messengerPin: true })
    expect(state?.person).toBe(false)
    expect(state?.resolve).toContain('log flow run messengerPinCreate')
  })

  test("\"Enter your PIN\" is mapped: typed from Twenty when it is there, matt's when not", () => {
    const page = 'heading "Enter your PIN to access your chats" [level=2]\ntextbox "PIN"'
    expect(pageStateOf('https://www.facebook.com/messages/', page, { messengerPin: true })).toMatchObject({ id: 'messengerPinEnter', person: false })
    expect(pageStateOf('https://www.facebook.com/messages/', page, { messengerPin: true })?.resolve).toContain('log inspect do pin --live')
    expect(pageStateOf('https://www.facebook.com/messages/', page)?.person).toBe(true)
  })

  test("the confirm screen is neither: it is the flow's own step", () => {
    expect(pageStateOf('https://www.facebook.com/messages/', 'heading "Confirm your PIN to avoid losing chat history"\ntextbox "Confirm your PIN"', { messengerPin: true })).toBeNull()
  })
})

describe('Marketplace partner listings', () => {
  test('"Discover more when you shop" is pressed through with its Update', () => {
    const state = pageStateOf('https://www.facebook.com/marketplace/partner_listing/', 'generic: Discover more when you shop\nbutton "Update"')
    expect(state).toMatchObject({ id: 'marketplacePartnerListings', person: false })
    expect(state?.resolve).toContain('setLocation')
  })

  const CREATE = 'https://www.facebook.com/marketplace/create/item'
  const page = (field: unknown): StepExchange => ({ offsetMs: 0, kind: 'document', name: 'page /marketplace/create/item', method: 'GET', host: 'www.facebook.com', path: '/marketplace/create/item', status: 200, ms: 3000, sent: null, answer: { title: 'Facebook', bytes: 1, fields: { marketplace_new_seller_can_post_item: field, marketplace_listing_creation_limit_reason: null } }, errors: [], known: true })
  const pdp = (type: string): StepExchange => ({ offsetMs: 900, kind: 'api', name: 'MarketplacePDPContainerQuery', method: 'POST', host: 'www.facebook.com', path: '/api/graphql/', status: 200, ms: 800, sent: {}, answer: { data: { viewer: { marketplace_product_details_page: { target: { product_details_type: type, partner_brand_name: 'Catawiki', partner_listing_location: 'Italy' } } } } }, errors: [], known: true })

  test('Limit reached on the create page is decided by its answer: marketplace_new_seller_can_post_item false (Bethlehem, 2026-10-23), true the day before', () => {
    const state = pageStateOf(CREATE, 'heading "Limit reached"', { exchanges: [page(false)] })
    expect(state).toMatchObject({ id: 'marketplaceCreateLimitReached', person: true })
    expect(pageStateOf(CREATE, 'heading "Limit reached"', { exchanges: [page(true)] })).toBeNull()
    expect(pageStateOf(CREATE, 'textbox "Title"', { exchanges: [page(false)] })?.id).toBe('marketplaceCreateLimitReached')
    expect(pageStateOf(CREATE, 'You are not able to create new listings at the moment')?.id).toBe('marketplaceCreateLimitReached')
  })

  test('partner listings on Marketplace are decided by the answer (product_details_type PARTNER_LISTING), never by the screen alone', () => {
    const state = pageStateOf('https://www.facebook.com/marketplace/item/1234567890/', 'heading "Picks for you"', { exchanges: [pdp('PARTNER_LISTING')] })
    expect(state).toMatchObject({ id: 'marketplacePartnerFeed', person: false })
    expect(state?.resolve).toContain('buy_location')
    expect(pageStateOf('https://www.facebook.com/marketplace/item/1234567890/', 'heading "Picks for you"', { exchanges: [pdp('C2C')] })).toBeNull()
    expect(pageStateOf('https://www.facebook.com/marketplace/', 'heading "Picks for you"')).toBeNull()
  })
})

describe('the Marketplace delete survey', () => {
  test('"Did you sell this item?" after a delete is a known state; the Selling page and the delete dialog are not mapped', () => {
    const selling = 'https://www.facebook.com/marketplace/you/selling'
    expect(pageStateOf(selling, '- heading "Did you sell this item?" [level=2]\n- radio "No, haven\'t sold"')?.id).toBe('marketplaceDeleteSurvey')
    expect(pageStateOf(selling, '- heading "Are you sure that you want to delete this listing?" [level=2]\n- button "Delete"')).toBeNull()
    expect(pageStateOf(selling, '- heading "Selling" [level=1]')).toBeNull()
  })
})

describe('resolving the delete survey', () => {
  test('first "No, haven\'t sold", then Next once it is checked: never the same click twice', async () => {
    const { resolveCallOf } = await import('./helpers/pageState')
    const state = { id: 'marketplaceDeleteSurvey', what: '', resolve: '', person: false }
    const first = resolveCallOf(state, { account: 'bethlehem', text: '- radio "No, haven\'t sold"' })
    expect(JSON.stringify(first)).toContain("No, haven't sold")
    const second = resolveCallOf(state, { account: 'bethlehem', text: '- radio "No, haven\'t sold" [checked] [active]' })
    expect(JSON.stringify(second)).toContain('"Next"')
  })
})
