import { describe, expect, test } from 'bun:test'
import { createActor, fromPromise, toPromise } from 'xstate'
import { connectMachine } from './machine'
import type { ActOutput, ConnectActorInputs, ConnectInput, ConnectOutput, ConnectPageKind, ReadOutput, SaveOutput, SolveOutput } from './index'

const FAST = { deadlineMs: 200, pollMs: 1, codeWindowMs: 1 }
const page = (kind: ConnectPageKind, heading?: string): ReadOutput => ({ ok: true, kind, path: '/x', heading })

/**
 * Runs the machine against scripted pages. Each `read` takes the next page;
 * the last one repeats (a page that doesn't move). Returns the output, the
 * states visited and every action the actors were asked for.
 */
async function runConnect(pages: ReadOutput[], input: Partial<ConnectInput> = {}, acts: Partial<Record<string, ActOutput>> = {}, save: SaveOutput = { ok: true, loggedIn: true }) {
  const calls: string[] = []
  const act = (name: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- one stub for every input shape
    fromPromise<ActOutput, any>(async () => {
      calls.push(name)
      return acts[name] ?? { ok: true }
    })
  const machine = connectMachine.provide({
    actors: {
      open: act('open'),
      read: fromPromise<ReadOutput, undefined>(async () => (pages.length > 1 ? pages.shift()! : pages[0])),
      submitCredentials: act('submitCredentials'),
      chooseAuthApp: act('chooseAuthApp'),
      submitCode: act('submitCode'),
      dismiss: act('dismiss'),
      save: fromPromise<SaveOutput, undefined>(async () => {
        calls.push('save')
        return save
      }),
      solveCaptcha: fromPromise<SolveOutput, ConnectActorInputs['solveCaptcha']>(async ({ input }) => {
        calls.push(`solveCaptcha:${input.solver}`)
        return { solved: true }
      })
    }
  })
  const states: string[] = []
  const actor = createActor(machine, { input: { accountId: 'fbPacer', hasPassword: true, hasTotp: true, timing: FAST, availability: { captchaKraken: true, twoCaptcha: true }, ...input } })
  actor.subscribe((snapshot) => {
    const value = JSON.stringify(snapshot.value)
    if (states.at(-1) !== value) states.push(value)
  })
  actor.start()
  const output = (await toPromise(actor)) as ConnectOutput
  return { output, states, calls }
}

describe('connectMachine', () => {
  test('password, two-step through "Try another way", trust device, signed in', async () => {
    const { output, calls } = await runConnect([
      page('loginForm'),
      page('twoStepMethod', 'Check your notifications on another device'),
      page('twoStepCode', 'Go to your authentication app'),
      page('trustDevice', 'Trust this device?'),
      page('loggedIn')
    ])
    expect(output.result).toBe('connected')
    expect(output.loggedIn).toBe(true)
    expect(calls).toEqual(['open', 'submitCredentials', 'chooseAuthApp', 'submitCode', 'dismiss', 'save'])
    expect(output.pages).toEqual(['loginForm', 'twoStepMethod', 'twoStepCode', 'trustDevice', 'loggedIn'])
  })

  test("saved cookies that still work: straight to saving, nothing typed", async () => {
    const { output, calls } = await runConnect([page('loggedIn')])
    expect(output.result).toBe('connected')
    expect(calls).toEqual(['open', 'save'])
  })

  test("Facebook's checkpoint is the third outcome: nothing is clicked, a person gets it, and at the deadline it ends checkpointed", async () => {
    const heading = 'Confirm your identity'
    const { output, states, calls } = await runConnect([page('loginForm'), page('checkpoint', heading)])
    expect(output.result).toBe('checkpointed')
    expect(output.failure).toMatchObject({ code: 'checkpointed', detail: heading })
    expect(output.checkpoint).toBe(heading)
    expect(calls).toEqual(['open', 'submitCredentials'])
    expect(states).toContain(JSON.stringify({ signingIn: 'awaitingPerson' }))
  })

  test('a checkpoint a person clears in the window carries on to signed in', async () => {
    const { output, calls } = await runConnect([page('checkpoint', 'Confirm your identity'), page('checkpoint', 'Confirm your identity'), page('loggedIn')])
    expect(output.result).toBe('connected')
    expect(output.checkpoint).toBe('Confirm your identity')
    expect(calls).toEqual(['open', 'save'])
  })

  test('a wrong password stops at once: no second try', async () => {
    const { output, calls } = await runConnect([page('loginForm'), page('wrongPassword', 'The password that you entered is incorrect')])
    expect(output.result).toBe('wrongPassword')
    expect(output.failure?.code).toBe('wrongPassword')
    expect(calls.filter((c) => c === 'submitCredentials')).toHaveLength(1)
  })

  test('a video selfie ends the run at once: nothing clicked, no waiting out --wait', async () => {
    const started = Date.now()
    const { output, calls } = await runConnect([page('captcha'), page('videoSelfie', 'Confirm your identity')], { timing: { ...FAST, deadlineMs: 60_000 }, availability: { captchaKraken: false, twoCaptcha: false } })
    expect(output.result).toBe('videoSelfie')
    expect(output.failure).toMatchObject({ code: 'videoSelfieRequired', state: 'routing' })
    expect(calls).toEqual(['open'])
    expect(Date.now() - started).toBeLessThan(5_000)
  })

  test('a disabled or locked account ends disabled', async () => {
    const { output } = await runConnect([page('disabled', 'Your account has been locked')])
    expect(output.result).toBe('disabled')
    expect(output.failure?.code).toBe('accountDisabled')
  })

  test('the login form is submitted twice at most, then left to a person until the deadline', async () => {
    const { output, calls } = await runConnect([page('loginForm')])
    expect(calls.filter((c) => c === 'submitCredentials')).toHaveLength(2)
    expect(output.result).toBe('timedOut')
    expect(output.failure?.code).toBe('signInNotFinished')
    expect(output.failure?.detail).toContain('loginForm')
  })

  test('three authenticator codes at most, one per code window', async () => {
    const { output, calls } = await runConnect([page('twoStepCode')], { timing: { ...FAST, codeWindowMs: 20 } })
    expect(calls.filter((c) => c === 'submitCode')).toHaveLength(3)
    expect(output.result).toBe('timedOut')
    expect(output.codeTries).toBe(3)
  })

  test('two-step without a totpSecret is a person\'s: nothing typed', async () => {
    const { output, calls } = await runConnect([page('twoStepCode')], { hasTotp: false })
    expect(calls).toEqual(['open'])
    expect(output.result).toBe('timedOut')
  })

  test('without Twenty details (connect without --noPrompt) every page is the person\'s', async () => {
    const { output, calls } = await runConnect([page('loginForm'), page('twoStepCode'), page('loggedIn')], { hasPassword: false, hasTotp: false })
    expect(output.result).toBe('connected')
    expect(calls).toEqual(['open', 'save'])
  })

  test('a failed click is read again; a dead session stops', async () => {
    const missed = await runConnect([page('loginForm'), page('loggedIn')], {}, { submitCredentials: { ok: false, code: 'crashed', detail: 'detached' } })
    expect(missed.output.result).toBe('connected')
    const gone = await runConnect([page('loginForm')], {}, { submitCredentials: { ok: false, code: 'sessionExited', detail: 'exit 1' } })
    expect(gone.output.result).toBe('failed')
    expect(gone.output.failure).toMatchObject({ state: 'submittingCredentials', code: 'sessionExited' })
  })

  test('the proxy gate refusing the launch ends it before any page', async () => {
    const { output, calls } = await runConnect([page('loginForm')], {}, { open: { ok: false, code: 'proxyCountryMismatch', detail: 'GB, not IE' } })
    expect(output.result).toBe('failed')
    expect(output.failure).toMatchObject({ state: 'opening', code: 'proxyCountryMismatch' })
    expect(calls).toEqual(['open'])
  })

  test('signed out again on the save reload goes back to reading, inside the same deadline', async () => {
    const { output, calls } = await runConnect([page('loggedIn')], {}, {}, { ok: true, loggedIn: false })
    expect(output.result).toBe('timedOut')
    expect(calls.filter((c) => c === 'save').length).toBeGreaterThan(1)
  })

  test("Listaro's path: 'We suspect automated behaviour' is dismissed and the sign-in carries on", async () => {
    const { output, calls } = await runConnect([page('loginForm'), page('automatedBehaviour', 'We suspect automated behaviour on your account'), page('loggedIn')])
    expect(output.result).toBe('connected')
    expect(calls).toEqual(['open', 'submitCredentials', 'dismiss', 'save'])
  })

  test("Listaro's path: a login captcha is solved, CaptchaKraken first, and the page is the judge", async () => {
    const captcha: ReadOutput = { ok: true, kind: 'captcha', path: '/login', captcha: { kind: 'recaptcha', enterprise: true } }
    const { output, calls } = await runConnect([page('loginForm'), captcha, page('loggedIn')])
    expect(output.result).toBe('connected')
    expect(calls).toEqual(['open', 'submitCredentials', 'solveCaptcha:captchaKraken', 'save'])
    expect(output.captchaAttempts).toHaveLength(1)
    expect(output.captchaAttempts[0]).toMatchObject({ solver: 'captchaKraken', solved: true, accepted: true })
  })

  test('a captcha with no solver configured waits for a person', async () => {
    const captcha: ReadOutput = { ok: true, kind: 'captcha', path: '/login', captcha: { kind: 'recaptcha', enterprise: true } }
    const { output, calls } = await runConnect([captcha], { availability: { captchaKraken: false, twoCaptcha: false } })
    expect(calls).toEqual(['open'])
    expect(output.result).toBe('timedOut')
  })

  test("Listaro's path: 'Find your account' is submitted once, and coming back is wrong credentials", async () => {
    const { output, calls } = await runConnect([page('findAccount', 'Find your account'), page('findAccount', 'Find your account')])
    expect(calls).toEqual(['open', 'dismiss'])
    expect(output.result).toBe('wrongPassword')
    const cleared = await runConnect([page('findAccount'), page('loginForm'), page('loggedIn')])
    expect(cleared.output.result).toBe('connected')
    expect(cleared.calls).toEqual(['open', 'dismiss', 'submitCredentials', 'save'])
  })

  test("Listaro's path: the cookie banner is accepted first", async () => {
    const { output, calls } = await runConnect([page('cookieBanner'), page('loginForm'), page('loggedIn')])
    expect(output.result).toBe('connected')
    expect(calls).toEqual(['open', 'dismiss', 'submitCredentials', 'save'])
  })
})
