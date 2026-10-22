export interface PageState {
  id: string
  what: string
  resolve: string
  person: boolean
}

interface StateRule extends PageState {
  url?: RegExp
  text?: RegExp
  withoutPin?: string
}

export interface StateContext {
  messengerPin?: boolean
}

const PIN_FROM_MATT = 'matt gives the account\'s 6-digit PIN once: `log facebook messenger pin --account <a>` in his terminal (a Clack prompt, kept in Twenty, never printed). Then reopen the browser so the session has it'

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

export interface ResolveCall {
  tool: string
  input: Record<string, unknown>
}

export interface StateAt {
  account: string
  text: string
  messengerPin?: boolean
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
  textCaptcha: (at) => liveStep(at.account, 'solve'),
  checkpointStart: clickLabel(/(:\s*|")Continue"?\s*$/),
  automatedBehaviour: clickLabel(/(:\s*|")(Dismiss|Continue)"?\s*$/),
  messengerPinCreate: (at) => (at.messengerPin ? { tool: 'flowMessengerPinCreateLive', input: { account: at.account, confirmLive: true } } : null),
  messengerPinEnter: (at) => (at.messengerPin ? liveStep(at.account, 'pin') : null),
  marketplacePartnerListings: clickLabel(/(:\s*|")Update"?\s*$/),
  rememberPassword: (at) => liveStep(at.account, 'clickRole', ['button', 'Not now']),
  twoStepCode: (at) => liveStep(at.account, 'code'),
  loginForm: (at) => liveStep(at.account, 'signIn'),
  checkpoint: (at) => snapshotCall(at.account)
}

export function resolveCallOf(state: PageState, at: StateAt): ResolveCall | null {
  if (state.person) return null
  return RESOLVE_CALLS[state.id]?.(at) ?? snapshotCall(at.account)
}
