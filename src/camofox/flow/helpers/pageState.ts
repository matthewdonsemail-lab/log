/**
 * The known page states and what resolves each (matt, 2026-10-20: "we already
 * know this exists, so solve it"). A page an inspect step landed on is matched
 * from its URL and accessibility snapshot, the same signals as
 * `python/autoLogin.py` `classify` (the connect machine's pages), and recorded
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
}

/** First match wins, most final first (as `classify`). */
const STATES: StateRule[] = [
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
  { id: 'rememberPassword', text: /remember password/i, what: 'the "Remember password" prompt', resolve: 'click "Not now" (`clickRole button "Not now"`)', person: false },
  { id: 'twoStepCode', url: /two_step_verification|two_factor|\/checkpoint/i, text: /enter (the )?(6-digit )?code|authentication code|login code/i, what: 'two-step: the code field', resolve: '`log inspect do code --live --account <a>` (the TOTP from Twenty, rule 21)', person: false },
  { id: 'loginForm', url: /\/login|login\.php/i, what: 'the login form', resolve: '`log inspect do signIn --live --account <a>` (rule 21), or `log connect --account <a>`', person: false },
  { id: 'checkpoint', url: /\/checkpoint/i, what: 'a Facebook checkpoint not mapped yet', resolve: 'take a snapshot, read the page, press its Continue/next control to see the next state (matt: never stop at a checkpoint), and add the state here', person: false }
]

/** The known state of a page from its URL and snapshot text, or null when it isn't one. Pure. */
export function pageStateOf(url: string, text: string): PageState | null {
  for (const s of STATES) {
    if (s.url && !s.url.test(url)) continue
    if (s.text && !s.text.test(text)) continue
    if (!s.url && !s.text) continue
    return { id: s.id, what: s.what, resolve: s.resolve, person: s.person }
  }
  return null
}
