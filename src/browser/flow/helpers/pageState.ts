import type { StepExchange } from '../../../subq/stepReading/types'

export interface PageState {
  id: string
  what: string
  resolve: string
  person: boolean
  needsNothing?: boolean
}

interface StateRule extends PageState {
  url?: RegExp
  text?: RegExp
  answer?: (exchanges: readonly StepExchange[]) => boolean
  withoutPin?: string
}

export interface StateContext {
  messengerPin?: boolean
  exchanges?: readonly StepExchange[]
}

export function answered(value: unknown, key: string, test: (found: unknown) => boolean): boolean {
  if (Array.isArray(value)) return value.some((v) => answered(v, key, test))
  if (value && typeof value === 'object') return Object.entries(value as Record<string, unknown>).some(([k, v]) => (k === key && test(v)) || answered(v, key, test))
  return false
}

export const mayNotPost = (exchanges: readonly StepExchange[]): boolean => exchanges.some((e) => e.kind === 'document' && answered(e.answer, 'marketplace_new_seller_can_post_item', (v) => v === false))

export const partnerListings = (exchanges: readonly StepExchange[]): boolean => exchanges.some((e) => answered(e.answer, 'product_details_type', (v) => v === 'PARTNER_LISTING'))

export const TWO_STEP_PICKER = 'TwoStepVerificationChallengePickerDialogQuery'

export const AUTH_APP_RADIO = 'Authentication app Get a code from your authentication app.'

export const authAppOffered = (exchanges: readonly StepExchange[]): boolean =>
  exchanges.some((e) => e.name === TWO_STEP_PICKER && answered(e.answer, 'methods', (v) => Array.isArray(v) && v.some((m) => (m as { method?: string } | null)?.method === 'TOTP' && !(m as { is_disabled?: boolean }).is_disabled)))

export const GROUP_MEMBERS_REFETCH = 'GroupsCometMembersPageNewMembersSectionRefetchQuery'

export const newMembersAnswered = (exchanges: readonly StepExchange[]): boolean =>
  exchanges.some((e) => e.name === GROUP_MEMBERS_REFETCH && answered(e.answer, 'new_members', (v) => Array.isArray((v as { edges?: unknown } | null)?.edges) && ((v as { edges: unknown[] }).edges.length > 0)))

const PIN_FROM_MATT = 'matt gives the account\'s 6-digit PIN once: `log facebook messenger pin --account <a>` in his terminal (a Clack prompt, kept in Twenty, never printed). Then reopen the browser so the session has it'

export const PAGE_STATES: readonly StateRule[] = [
  { id: 'disabled', url: /checkpoint\/disabled|account\/disabled/i, what: 'the account is disabled', resolve: 'a person: the account is lost or appealed (rule 13: keep its record)', person: true },
  { id: 'videoSelfie', text: /video selfie|record a video|upload a video|take a video|verify with video|video verification/i, what: "Facebook's video selfie check", resolve: 'a person on camera (rules 10, 23): stop the account, tell matt', person: true },
  {
    id: 'identityVerificationHold',
    text: /confirm your identity to publish|more info needed to publish this listing|confirm your mobile number before selling on marketplace/i,
    answer: (exchanges) => exchanges.some((x) => x.name === 'MarketplaceYourListingDialogQuery' && JSON.stringify(x.answer ?? '').includes('INTEGRITY_NEEDS_VERIFICATION')),
    what: 'Facebook holds the listings until a person confirms their identity (Selling: "Confirm your identity to publish this and any future listings"; MarketplaceYourListingDialogQuery: INTEGRITY_NEEDS_VERIFICATION_VH)',
    resolve: 'a person: only matt can confirm the identity; `log facebook check --account <a>` records identityVerificationRequired, so the account is RESTRICTED and its listings ACCOUNT_LOST',
    person: true
  },
  { id: 'textCaptcha', text: /enter the text from the image/i, what: 'a text captcha ("Enter the text from the image")', resolve: '`log inspect do solve --live --account <a>` (2Captcha image solver, types the answer, presses Continue), then a snapshot for the next state', person: false },
  {
    id: 'checkpointStart',
    url: /\/checkpoint/i,
    text: /confirm that you.?re human to use your account/i,
    what: 'a checkpoint\'s first page ("confirm that you\'re human to use your account")',
    resolve: 'click Continue: it is plain text, not a button: `log inspect do click <ref of "Continue"> --live` (the ref from the step\'s snapshot), then a snapshot for the next state',
    person: false
  },
  { id: 'automatedBehaviour', text: /suspect automated behaviou?r|we suspect automated|نشتبه في وجود سلوك تلقائي/i, what: '"We suspect automated behaviour"', resolve: 'dismiss it, as Listaro did (rule 23): the Dismiss/Continue control, then go on', person: false },
  {
    id: 'browserNotificationsNotice',
    text: /to allow or block browser notifications from facebook|للسماح بإشعار المتصفح من فيسبوك/i,
    what: 'Facebook\'s browser-notifications notice over the page: its text covers its own Close, so nothing under it can be pressed (Hazleton, host 20261024T211541 steps 08-13)',
    resolve: 'press Escape (`log inspect do press Escape --live --account <a>`): it closes with no call, so the check is that the notice is gone. A flow clears it before its first click (rule 79)',
    person: false
  },
  {
    id: 'pastNoticeDialog',
    text: /what happened[\s\S]{0,600}?\bended on\b/i,
    what: 'Facebook\'s "What happened" dialog about a limit on the account that has ended ("Ended on <date>"), over the page (Hazleton, host 20261024T211541 step 14)',
    resolve: 'press Escape (`log inspect do press Escape --live --account <a>`): Facebook answers `useAccountStatusClearEnrollmentEntryPointActionMutation` with `xfb_ixt_gateway_clear_flow: true` (step 15). A flow clears it before its first click (rule 79). A "What happened" with no "Ended on" is not this state',
    person: false
  },
  {
    id: 'messengerPinCreate',
    text: /create a pin to access your chats/i,
    what: 'Messenger\'s "Create a PIN to access your chats on any device": the inbox stays behind it (Bethlehem, warm-up 20261022T092119 steps 25-27)',
    resolve: 'run the recorded flow with the PIN from Twenty: `log flow run messengerPinCreate --account <a> --live` (Create PIN, the PIN, the PIN again; Bethlehem 20261022T100521), then a snapshot: the inbox shows Chats',
    withoutPin: PIN_FROM_MATT,
    person: false
  },
  {
    id: 'messengerPinEnter',
    text: /enter your pin/i,
    what: 'Messenger asks for the account\'s PIN to open its chats here (a PIN set before, met on another browser or device). Mapped 2026-10-22 before its first recording',
    resolve: 'type the PIN from Twenty: `log inspect do pin --live --account <a>`, then `log inspect do snapshot --account <a>`; if it stays, press its Continue/Next by its ref. Not recorded yet: keep each step (rule 29) and make the flow `messengerPinEnter` with `log flow fromInspect`',
    withoutPin: PIN_FROM_MATT,
    person: false
  },
  {
    id: 'marketplacePartnerListings',
    url: /\/marketplace\/partner_listing/i,
    text: /discover more when you shop/i,
    what: 'Marketplace\'s "Discover more when you shop" (partner shops, shown where the Marketplace location is in Europe; Bethlehem was sent to Granada by a bare zip, 20261022T110738 step 2)',
    resolve: 'press its Update by ref (`log inspect do click <ref of "Update"> --live`), then set the location back with `log inspect do setLocation "City, State" --live`',
    person: false
  },
  {
    id: 'marketplaceCreateLimitReached',
    url: /\/marketplace\/create/i,
    text: /limit reached|not able to create new listings/i,
    answer: mayNotPost,
    what: 'Marketplace\'s create page answers that this account may not post now: its HTML says `marketplace_new_seller_can_post_item: false` and the page shows "Limit reached" (Bethlehem, inspect 20261023T045453 step 01; the same field was true on 2026-10-22, runs 20261022T105341 and 20261022T110738)',
    resolve: 'nothing to press: no listing can be created from this account now, so it publishes nothing and matt decides. Read it again on a later day from the create page\'s answer (`marketplace_new_seller_can_post_item`)',
    person: true
  },
  {
    id: 'marketplacePartnerFeed',
    url: /\/marketplace(\/|$)/i,
    answer: partnerListings,
    what: 'Marketplace answers with partner shops\' listings (`product_details_type: PARTNER_LISTING`, a `partner_brand_name` and a `partner_listing_location`), from Europe though the account is in the US (Bethlehem, inspect 20261023T045453 step 03: Catawiki in Italy and buycycle-es, while `buy_location` was Bethlehem, Pennsylvania)',
    resolve: 'read the Marketplace location from its own answer: `log inspect do goto https://www.facebook.com/marketplace/` and read `buy_location` in the step\'s exchanges. If it isn\'t the account\'s home, `log inspect do setLocation "City, State" --live`. If it is, carry on with the step',
    person: false
  },
  {
    id: 'marketplaceDeleteSurvey',
    url: /\/marketplace\/you\/selling/i,
    text: /did you sell this item\?/i,
    what: 'Marketplace\'s "Did you sell this item?" survey, shown after a listing is deleted (the delete is already done: `useCometMarketplaceForSaleItemDeleteMutation` answered its id; Bethlehem, inspect 20261023T173652 step 05)',
    resolve: 'click radio "No, haven\'t sold", then button "Next" (`log inspect do click <ref> --live`); it only saves the answer (`useCometC2CTransactionSurveyResponseMutation`)',
    person: false
  },
  {
    id: 'groupMembersList',
    url: /\/groups\/[^/?#]+\/members/i,
    answer: newMembersAnswered,
    what: 'a group\'s People tab answered with more of its newest members: `GroupsCometMembersPageNewMembersSectionRefetchQuery` gave `new_members` edges, about 10 a call, each a profile with its bio, page category, followers and when they joined (61594063207669, inspect 20261024T060921 steps 04-21)',
    resolve: 'nothing to resolve: the list loaded. Scroll on for more, or read the members with `log facebook read members --account <a> --group <g> --count <n>`',
    person: false,
    needsNothing: true
  },
  { id: 'rememberPassword', text: /remember password/i, what: 'the "Remember password" prompt', resolve: 'click "Not now" (`clickRole button "Not now"`)', person: false },
  {
    id: 'twoStepMethodPicker',
    url: /two_step_verification|two_factor/i,
    text: /choose a way to confirm it.?s you|choose two-factor authentication method/i,
    what: 'Facebook\'s two-step method picker ("Choose a way to confirm it\'s you": Passkey, Authentication app, Backup code); `TwoStepVerificationChallengePickerDialogQuery` lists them as `PASSKEY`, `TOTP`, `BACKUP_CODES` (Mountain Top, host 20261024T222706 step 15)',
    resolve: 'choose "Authentication app", then Continue, when the picker\'s answer lists `TOTP` not disabled; then the code (rule 21). With no `TOTP`, only a person can sign in',
    person: false
  },
  {
    id: 'twoStepPasskey',
    url: /two_step_verification|two_factor/i,
    text: /use face scan, fingerprint or screen lock to confirm it.?s you/i,
    what: 'Facebook asks for a passkey ("Use face scan, fingerprint or screen lock to confirm it\'s you"): no code box on the page, so `code` finds nothing (Mountain Top, host 20261024T222706 steps 08-14)',
    resolve: 'press "Try another way" (`clickRole button "Try another way"`): the method picker opens, then choose the authentication app',
    person: false
  },
  { id: 'twoStepCode', url: /two_step_verification|two_factor|\/checkpoint/i, text: /enter (the )?(6-digit )?code|authentication code|login code/i, what: 'two-step: the code field', resolve: '`log inspect do code --live --account <a>` (the TOTP from Twenty, rule 21)', person: false },
  { id: 'loginForm', url: /\/login|login\.php/i, what: 'the login form', resolve: '`log inspect do signIn --live --account <a>` (rule 21), or `log facebook connect --account <a>`', person: false },
  { id: 'checkpoint', url: /\/checkpoint/i, what: 'a Facebook checkpoint not mapped yet', resolve: 'take a snapshot, read the page, press its Continue/next control to see the next state (matt: never stop at a checkpoint), and add the state here', person: false }
]

export function pageStateOf(url: string, text: string, context: StateContext = {}): PageState | null {
  for (const s of PAGE_STATES) {
    if (s.url && !s.url.test(url)) continue
    if (s.answer && context.exchanges?.length) {
      if (!s.answer(context.exchanges)) continue
    } else {
      if (s.answer && !s.text) continue
      if (s.text && !s.text.test(text)) continue
    }
    if (!s.url && !s.text && !s.answer) continue
    if (s.withoutPin && !context.messengerPin) return { id: s.id, what: s.what, resolve: s.withoutPin, person: true }
    return { id: s.id, what: s.what, resolve: s.resolve, person: s.person, ...(s.needsNothing ? { needsNothing: true } : {}) }
  }
  return null
}

export interface ResolveCall {
  tool: string
  input: Record<string, unknown>
}

export interface StateAt {
  account: string
  text: string
  messengerPin?: boolean
  exchanges?: readonly StepExchange[]
}

export function refOf(text: string, label: RegExp): string | null {
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (!label.test(lines[i])) continue
    const own = /\[ref=(e\d+)\]/.exec(lines[i])?.[1]
    if (own) return own
    const indent = lines[i].search(/\S/)
    for (let j = i - 1; j >= 0; j--) {
      if (lines[j].search(/\S/) >= indent) continue
      const parent = /\[ref=(e\d+)\]/.exec(lines[j])?.[1]
      if (parent) return parent
    }
  }
  return null
}

const liveStep = (account: string, action: string, values?: string[]): ResolveCall => ({ tool: 'inspectDoLive', input: { account, action, ...(values ? { values } : {}), confirmLive: true } })

export const snapshotCall = (account: string): ResolveCall => ({ tool: 'inspectDo', input: { account, action: 'snapshot' } })

const clickLabel = (label: RegExp) => (at: StateAt): ResolveCall => {
  const ref = refOf(at.text, label)
  return ref ? liveStep(at.account, 'click', [ref]) : snapshotCall(at.account)
}

export const RESOLVE_CALLS: Readonly<Record<string, (at: StateAt) => ResolveCall | null>> = {
  disabled: () => null,
  videoSelfie: () => null,
  identityVerificationHold: () => null,
  textCaptcha: (at) => liveStep(at.account, 'solve'),
  checkpointStart: clickLabel(/(:\s*|")Continue"?\s*$/),
  automatedBehaviour: clickLabel(/(:\s*|")(Dismiss|Continue|تجاهل)"?\s*$/),
  browserNotificationsNotice: (at) => liveStep(at.account, 'press', ['Escape']),
  pastNoticeDialog: (at) => liveStep(at.account, 'press', ['Escape']),
  messengerPinCreate: (at) => (at.messengerPin ? { tool: 'flowMessengerPinCreateLive', input: { account: at.account, confirmLive: true } } : null),
  messengerPinEnter: (at) => (at.messengerPin ? liveStep(at.account, 'pin') : null),
  marketplacePartnerListings: clickLabel(/(:\s*|")Update"?\s*$/),
  marketplaceCreateLimitReached: () => null,
  marketplacePartnerFeed: (at) => ({ tool: 'inspectDo', input: { account: at.account, action: 'goto', values: ['https://www.facebook.com/marketplace/'] } }),
  groupMembersList: () => null,
  marketplaceDeleteSurvey: (at) =>
    /radio "No, haven't sold" \[checked\]/.test(at.text) ? liveStep(at.account, 'clickRole', ['button', 'Next']) : liveStep(at.account, 'clickRole', ['radio', "No, haven't sold"]),
  rememberPassword: (at) => liveStep(at.account, 'clickRole', ['button', 'Not now']),
  twoStepMethodPicker: (at) =>
    /radio "Authentication app[^"]*" \[checked\]/.test(at.text) ? liveStep(at.account, 'clickRole', ['button', 'Continue']) : liveStep(at.account, 'clickRole', ['radio', AUTH_APP_RADIO]),
  twoStepPasskey: (at) => liveStep(at.account, 'clickRole', ['button', 'Try another way']),
  twoStepCode: (at) => liveStep(at.account, 'code'),
  loginForm: (at) => liveStep(at.account, 'signIn'),
  checkpoint: (at) => snapshotCall(at.account)
}

export function resolveCallOf(state: PageState, at: StateAt): ResolveCall | null {
  if (state.person || state.needsNothing) return null
  return RESOLVE_CALLS[state.id]?.(at) ?? snapshotCall(at.account)
}
