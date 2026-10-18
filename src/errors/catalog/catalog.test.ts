/**
 * The catalog is only worth having if it is true. These tests hold it to the
 * code: every code's stated end is what the machines actually do, the Python
 * only sends catalog codes, and the exported JSON matches.
 */
import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createActor, fromPromise, toPromise } from 'xstate'
import { DEFAULT_CAPTCHA_POLICY, SOLVER_DEAD_CODES, planNextSolver } from '../../captcha/router/index'
import type { CaptchaAttempt, CaptchaDetection } from '../../captcha/router/index'
import { normalizeResult } from '../../camofox/session/index'
import { parseWorkerOutput } from '../../camofox/worker/index'
import { toCheckOutcome } from '../../cli/watch/index'
import { monitorMachine } from '../../marketplace/monitor/index'
import type { CheckOutcome, MonitorOutput } from '../../marketplace/monitor/index'
import { publishMachine } from '../../marketplace/publish/index'
import type { PublishInput, PublishOutput } from '../../marketplace/publish/index'
import { ERROR_CATALOG, isErrorCode, toKnownCode } from './index'
import type { ErrorCode, ErrorEntry } from './index'

const root = join(import.meta.dir, '..', '..', '..')
const entries = Object.entries(ERROR_CATALOG) as [ErrorCode, ErrorEntry][]
const CAMEL = /^[a-z][a-zA-Z0-9]*$/

/** Publish steps whose actor reports `{ ok: false, code }`, by state. */
const STEP_ACTORS = {
  preparingPhotos: 'preparePhotos',
  choosingCategory: 'setCategory',
  uploadingPhotos: 'uploadPhotos',
  fillingFields: 'fillFields',
  reviewing: 'review',
  publishing: 'publish'
} as const

const listing = { title: 'Sofa', price: 50, category: 'Furniture', photos: ['a.jpg'] }

/**
 * Runs a live publish where `state` fails with `code`. `thrown` makes the
 * state's actor throw instead of returning a failure.
 */
async function publishFailing(state: string, code: ErrorCode, thrown = false, input: Partial<PublishInput> = {}) {
  const fail = { ok: false, code, detail: 'scripted' }
  const at = (name: string, value: unknown) =>
    fromPromise(async () => {
      if (name === state) {
        if (thrown) throw new Error('scripted crash')
        return fail
      }
      return value
    })
  const formFailure = ERROR_CATALOG[code].layer === 'account' ? { kind: 'issue', issue: code } : { kind: 'error', code }
  const machine = publishMachine.provide({
    actors: {
      preparePhotos: at('preparingPhotos', { ok: true, paths: ['/p.jpg'], hashes: ['h'] }) as never,
      openForm: fromPromise(async () => {
        if (state !== 'openingForm') return { kind: 'ready', url: 'create/item' }
        if (thrown) throw new Error('scripted crash')
        return formFailure
      }) as never,
      solveCaptcha: fromPromise(async () => {
        throw new Error('scripted crash')
      }) as never,
      setCategory: at('choosingCategory', { ok: true, value: 'Furniture' }) as never,
      uploadPhotos: at('uploadingPhotos', { ok: true, count: 1 }) as never,
      fillFields: at('fillingFields', { ok: true, filled: {} }) as never,
      review: at('reviewing', { ok: true, receipt: null, photoCount: 1 }) as never,
      publish: at('publishing', { ok: true, audienceStep: false }) as never,
      confirm: fromPromise(async () => (state === 'confirming' ? fail : { ok: true, how: 'toast' })) as never,
      captureId: fromPromise(async () => {
        if (state !== 'capturingId') return { listingId: '123', listingUrl: 'u' }
        if (thrown) throw new Error('scripted crash')
        return { listingId: null, listingUrl: null }
      }) as never
    }
  })
  const actor = createActor(machine, {
    input: { accountId: 'fbPacer', listing, dryRun: false, availability: { captchaKraken: true, twoCaptcha: true }, ...input }
  })
  actor.start()
  return (await toPromise(actor)) as PublishOutput
}

describe('the catalog itself', () => {
  test('every code and every layer is camelCase (AGENTS.md rule 1)', () => {
    for (const [code] of entries) expect(code).toMatch(CAMEL)
  })

  test('every entry says where it is raised and what a person does', () => {
    for (const [code, entry] of entries) {
      expect(entry.raisedIn.length, code).toBeGreaterThan(0)
      expect(entry.meaning.length, code).toBeGreaterThan(0)
      expect(entry.action.length, code).toBeGreaterThan(0)
    }
  })

  test('SOLVER_DEAD_CODES is exactly the skipSolver codes', () => {
    expect([...SOLVER_DEAD_CODES].sort()).toEqual(entries.filter(([, e]) => e.captcha === 'skipSolver').map(([c]) => c).sort())
  })

  test('python/errorCatalog.json is the current export (run `bun run errors:export`)', () => {
    const exported = JSON.parse(readFileSync(join(root, 'python', 'errorCatalog.json'), 'utf8'))
    expect(exported).toEqual(JSON.parse(JSON.stringify(ERROR_CATALOG)))
  })
})

describe('the boundaries only let catalog codes through', () => {
  test('toKnownCode keeps known codes and marks unknown ones', () => {
    expect(toKnownCode('rejected', 'Oops')).toEqual({ code: 'rejected', detail: 'Oops' })
    expect(toKnownCode('TimeoutError', 'nav')).toEqual({ code: 'uncatalogued', detail: 'TimeoutError: nav' })
    expect(toKnownCode(undefined)).toEqual({ code: 'uncatalogued', detail: 'undefined' })
  })

  test('worker output: failures get catalog codes, results and doctor pass through', () => {
    expect(parseWorkerOutput('', 1)).toMatchObject({ ok: false, code: 'workerNoOutput' })
    expect(parseWorkerOutput('Traceback...', 1)).toMatchObject({ ok: false, code: 'workerBadOutput' })
    expect(parseWorkerOutput('{"ok":false,"code":"loginWall","url":"x"}', 1)).toEqual({ ok: false, code: 'loginWall', url: 'x' })
    expect(parseWorkerOutput('{"ok":false,"code":"madeUp","detail":"d"}', 1)).toEqual({ ok: false, code: 'uncatalogued', detail: 'madeUp: d' })
    expect(parseWorkerOutput('{"ok":false,"checks":{}}', 1)).toEqual({ ok: false, checks: {} })
    expect(parseWorkerOutput('{"ok":true,"listings":[]}', 0)).toEqual({ ok: true, listings: [] })
  })

  test('session replies: codes and issues are checked, the rest passes through', () => {
    expect(normalizeResult({ ok: false, code: 'titleNotSet', detail: 'd' })).toEqual({ ok: false, code: 'titleNotSet', detail: 'd' })
    expect(normalizeResult({ ok: false, code: 'nope' })).toEqual({ ok: false, code: 'uncatalogued', detail: 'nope' })
    expect(normalizeResult({ solved: false, code: 'noWidget' })).toEqual({ solved: false, code: 'noWidget' })
    expect(normalizeResult({ kind: 'issue', issue: 'checkpointed' })).toEqual({ kind: 'issue', issue: 'checkpointed' })
    expect(normalizeResult({ kind: 'issue', issue: 'checkpoint' })).toEqual({ kind: 'error', code: 'uncatalogued', detail: 'checkpoint' })
    expect(normalizeResult({ kind: 'ready', url: 'u' })).toEqual({ kind: 'ready', url: 'u' })
  })
})

describe('the Python sends only catalog codes', () => {
  const files = ['logWorker.py', 'publishSession.py', 'errorCodes.py'].map((name) => ({
    name,
    text: readFileSync(join(root, 'python', name), 'utf8')
  }))

  test('every literal code in the Python is in the catalog', () => {
    const found = new Set<string>()
    const patterns = [
      /\bfail(?:ure)?\("([A-Za-z]+)"/g,
      /\bchecked\("([A-Za-z]+)"\)/g,
      /"code": "([A-Za-z]+)"/g,
      /"issue": "([A-Za-z]+)"/g
    ]
    for (const { text } of files) {
      for (const pattern of patterns) for (const match of text.matchAll(pattern)) found.add(match[1])
      // The mapping tables: KRAKEN_CODES / TWOCAPTCHA_CODES / NOT_SET_CODES values.
      for (const table of text.matchAll(/^[A-Z_]+_CODES = [({]([\s\S]*?)^[)}]/gm)) {
        for (const match of table[1].matchAll(/(?::|,) "([a-z][A-Za-z]+)"/g)) found.add(match[1])
      }
      // The fallbacks inside the mappers.
      for (const match of text.matchAll(/return "([a-z][A-Za-z]+)"\n/g)) found.add(match[1])
    }
    expect(found.size).toBeGreaterThan(40)
    const unknown = [...found].filter((code) => !isErrorCode(code))
    expect(unknown).toEqual([])
  })

  test('no failure uses the old free-text "error" field', () => {
    for (const { name, text } of files) expect(text.includes('"error":'), name).toBe(false)
  })

  test('codes are never built from strings at runtime', () => {
    for (const { name, text } of files) expect(/fail(?:ure)?\(f"/.test(text), name).toBe(false)
  })
})

describe("every code's publish end is what the machine does", () => {
  const stepCodes = entries.flatMap(([code, entry]) =>
    entry.raisedIn
      .filter((where) => where.startsWith('publish.'))
      .map((where) => [code, entry, where.slice('publish.'.length)] as const)
  )

  // The router's reasons and the solve actor are reached through a captcha: tested below.
  for (const [code, entry, state] of stepCodes.filter(([, , st]) => st !== 'routingCaptcha' && st !== 'solvingCaptcha')) {
    test(`${code} in ${state}`, async () => {
      // crashedAfterPublish is never sent: a throw after the click becomes it.
      const thrown = code === 'crashedAfterPublish'
      const output = await publishFailing(state, thrown ? 'crashed' : code, thrown)
      if (!entry.publish) {
        // noConfirmation: no end of its own, the run goes on to look for the listing.
        expect(output.result).toBe('published')
        return
      }
      expect(output.result).toBe(entry.publish)
      expect(output.failure?.code).toBe(code)
      if (entry.layer === 'account') expect(output.issue as string | null).toBe(code)
    })
  }

  test('stopping ends every code with a publish end where the catalog says', async () => {
    for (const [code, entry] of entries.filter(([, e]) => e.publish)) {
      const output = await publishFailing('fillingFields', code)
      expect(output.result, code).toBe(entry.publish!)
    }
  })

  test('every account code stops the run as blocked', async () => {
    for (const [code] of entries.filter(([, e]) => e.layer === 'account')) {
      const output = await publishFailing('openingForm', code)
      expect(output.result, code).toBe('blocked')
      expect(output.issue as string | null, code).toBe(code)
    }
  })

  test('a runtime failure after Publish is crashedAfterPublish, never failed', async () => {
    for (const code of ['crashed', 'sessionExited', 'uncatalogued'] as ErrorCode[]) {
      const output = await publishFailing('publishing', code)
      expect(output.result, code).toBe('unconfirmedId')
      expect(output.failure, code).toMatchObject({ code: 'crashedAfterPublish', detail: `${code}: scripted` })
    }
    // A form code after the click is certain: Publish was never clicked.
    expect((await publishFailing('publishing', 'publishNotFound')).result).toBe('failed')
  })

  test('a crash while solving a captcha fails the run (nothing was published)', async () => {
    const machine = publishMachine.provide({
      actors: {
        preparePhotos: fromPromise(async () => ({ ok: true, paths: ['/p.jpg'], hashes: ['h'] })) as never,
        openForm: fromPromise(async () => ({ kind: 'captcha', detection: { kind: 'recaptcha' } })) as never,
        solveCaptcha: fromPromise(async () => {
          throw new Error('scripted crash')
        }) as never
      }
    })
    const actor = createActor(machine, {
      input: { accountId: 'fbPacer', listing, dryRun: false, availability: { captchaKraken: true, twoCaptcha: true } }
    })
    actor.start()
    const output = (await toPromise(actor)) as PublishOutput
    expect(output.result).toBe(ERROR_CATALOG.crashed.publish)
    expect(output.failure).toMatchObject({ state: 'solvingCaptcha', code: 'crashed' })
  })
})

describe("every router reason is reachable and ends in needsPerson", () => {
  const both = { captchaKraken: true, twoCaptcha: true }
  const recaptcha: CaptchaDetection = { kind: 'recaptcha' }
  const tries = (solver: CaptchaAttempt['solver'], n: number): CaptchaAttempt[] =>
    Array.from({ length: n }, () => ({ at: 't', accountId: 'a', kind: 'recaptcha' as const, solver, solved: false, accepted: false }))
  const p = DEFAULT_CAPTCHA_POLICY
  const scenarios: Record<string, () => ReturnType<typeof planNextSolver>> = {
    noSolverForKind: () => planNextSolver({ kind: 'facebookChallenge' }, [], both, p),
    noSolverConfigured: () => planNextSolver({ kind: 'arkose' }, [], { captchaKraken: true, twoCaptcha: false }, p),
    arkoseCapReached: () => planNextSolver({ kind: 'arkose' }, [], both, p, p.arkoseDailyCap),
    attemptsUsed: () => planNextSolver(recaptcha, [...tries('captchaKraken', 2), ...tries('twoCaptcha', 1)], both, p),
    roundsUsed: () => planNextSolver(recaptcha, tries('captchaKraken', p.maxRounds), both, p)
  }

  for (const [code, entry] of entries.filter(([, e]) => e.raisedIn.includes('publish.routingCaptcha'))) {
    test(code, () => {
      expect(entry.publish).toBe('needsPerson')
      expect(scenarios[code], `no scenario for ${code}`).toBeDefined()
      expect(scenarios[code]()).toMatchObject({ solver: null, reason: code })
    })
  }
})

describe("every solver code does what the catalog says", () => {
  const both = { captchaKraken: true, twoCaptcha: true }
  for (const [code, entry] of entries.filter(([, e]) => e.captcha)) {
    test(`${code}: ${entry.captcha}`, () => {
      const failed: CaptchaAttempt = { at: 't', accountId: 'a', kind: 'recaptcha', solver: 'captchaKraken', solved: false, accepted: false, code }
      const next = planNextSolver({ kind: 'recaptcha' }, [failed], both, DEFAULT_CAPTCHA_POLICY)
      // skipSolver: straight to 2Captcha. retry: CaptchaKraken gets its 2nd try.
      expect(next.solver).toBe(entry.captcha === 'skipSolver' ? 'twoCaptcha' : 'captchaKraken')
    })
  }
})

describe("every code's monitor end is what the monitor does", () => {
  /** One check that returns `outcome`, then an ok one. `failed` and `resting` are passed through
   * in a single step, so they are read from the output and the states that settle. */
  async function monitorOnce(outcome: CheckOutcome) {
    const outcomes = [outcome, { kind: 'ok', seen: [], needsAttention: [], issue: null } as CheckOutcome]
    const machine = monitorMachine.provide({
      actors: { check: fromPromise(async () => outcomes.shift() ?? outcomes[0]) as never }
    })
    const states = new Set<string>()
    const actor = createActor(machine, {
      input: { accountId: 'a', listings: [], timing: { pollIntervalMs: 1, retryDelayMs: 1, limitedRestMs: 1 }, maxChecks: 1 }
    })
    actor.subscribe((snapshot) => states.add(String(snapshot.value)))
    actor.start()
    const output = (await toPromise(actor)) as MonitorOutput
    return { output, states }
  }

  for (const [code, entry] of entries.filter(([, e]) => e.monitor)) {
    test(`${code}: ${entry.monitor}${entry.monitor === 'failed' && entry.retryable ? ' then retrying' : ''}`, async () => {
      const { output, states } = await monitorOnce(toCheckOutcome({ ok: false, code }))
      if (entry.monitor === 'blocked') {
        expect(states.has('blocked')).toBe(true)
        expect(output.issue).not.toBeNull()
      } else if (entry.monitor === 'resting') {
        expect(output.stopReason).toBe('rate limited')
      } else {
        // failed: a retryable code gets its quick retry (and the next check is ok); the rest stop.
        expect(states.has('retrying')).toBe(entry.retryable)
        expect(output.stopReason).toBe(entry.retryable ? 'checks done' : 'check failed')
      }
    })
  }
})
