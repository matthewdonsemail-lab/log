/**
 * The known page states and what resolves each (matt, 2026-10-20: "we already
 * know this exists, so solve it"). A page an inspect step landed on is matched
 * from its URL and accessibility snapshot, the same signals as
 * `python/login/autoLogin.py` `classify` (the connect machine's pages), and recorded
 * on Reading's checkpoint (inspect 20261020T105346 steps 38-44). The Claude Code
 * hook (`scripts/hooks/pageState.ts`, rule 54) puts the state and its resolver
 * into the agent's context after every tool call, so a known state is never a
 * reason to stop.
 */
export interface PageState {
  id: string
  /** What the page is, in plain words. */
  what: string
  /** What resolves it: the exact step, or who (a person) when nothing in log-cli can. */
  resolve: string
  /** Only a person can clear it (rules 10, 23): the run stops and says so. */
  person: boolean
}

interface StateRule extends PageState {
  url?: RegExp
  text?: RegExp
  /**
   * Messenger's PIN states (rule 67): with the account's PIN in Twenty, log-cli resolves them itself
   * (`resolve`); without it they are matt's, said this way.
   */
  withoutPin?: string
}

/** What the page's account has, as the session recorded it when it opened: a yes or no, never a secret. */
export interface StateContext {
  messengerPin?: boolean
}

const PIN_FROM_MATT = 'matt gives the account\'s 6-digit PIN once: `log facebook messenger pin --account <a>` in his terminal (a Clack prompt, kept in Twenty, never printed). Then reopen the browser so the session has it'

/** First match wins, most final first (as `classify`). */
export const PAGE_STATES: readonly StateRule[] = [
  { id: 'disabled', url: /checkpoint\/disabled|account\/disabled/i, what: 'the account is disabled', resolve: 'a person: the account is lost or appealed (rule 13: keep its record)', person: true },
  { id: 'videoSelfie', text: /video selfie|record a video|upload a video|take a video|verify with video|video verification/i, what: "Facebook's video selfie check", resolve: 'a person on camera (rules 10, 23): stop the account, tell matt', person: true },
  { id: 'textCaptcha', text: /enter the text from the image/i, what: 'a text captcha ("Enter the text from the image")', resolve: '`log inspect do solve --live --account <a>` (2Captcha image solver, types the answer, presses Continue), then a snapshot for the next state', person: false },
  {
    id: 'checkpointStart',
    url: /\/checkpoint/i,
    text: /confirm that you.?re human to use your account/i,
    what: 'a checkpoint\'s first page ("confirm that you\'re human to use your account")',
    resolve: 'click Continue: it is plain text, not a button: `log inspect do click <ref of "Continue"> --live` (the ref from the step\'s snapshot), then a snapshot for the next state',
    person: false
  },
  { id: 'automatedBehaviour', text: /suspect automated behaviou?r|we suspect automated/i, what: '"We suspect automated behaviour"', resolve: 'dismiss it, as Listaro did (rule 23): the Dismiss/Continue control, then go on', person: false },
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
  { id: 'rememberPassword', text: /remember password/i, what: 'the "Remember password" prompt', resolve: 'click "Not now" (`clickRole button "Not now"`)', person: false },
  { id: 'twoStepCode', url: /two_step_verification|two_factor|\/checkpoint/i, text: /enter (the )?(6-digit )?code|authentication code|login code/i, what: 'two-step: the code field', resolve: '`log inspect do code --live --account <a>` (the TOTP from Twenty, rule 21)', person: false },
  { id: 'loginForm', url: /\/login|login\.php/i, what: 'the login form', resolve: '`log inspect do signIn --live --account <a>` (rule 21), or `log facebook connect --account <a>`', person: false },
  { id: 'checkpoint', url: /\/checkpoint/i, what: 'a Facebook checkpoint not mapped yet', resolve: 'take a snapshot, read the page, press its Continue/next control to see the next state (matt: never stop at a checkpoint), and add the state here', person: false }
]

/** The known state of a page from its URL and snapshot text, or null when it isn't one. Pure. */
export function pageStateOf(url: string, text: string, context: StateContext = {}): PageState | null {
  for (const s of PAGE_STATES) {
    if (s.url && !s.url.test(url)) continue
    if (s.text && !s.text.test(text)) continue
    if (!s.url && !s.text) continue
    if (s.withoutPin && !context.messengerPin) return { id: s.id, what: s.what, resolve: s.withoutPin, person: true }
    return { id: s.id, what: s.what, resolve: s.resolve, person: s.person }
  }
  return null
}
