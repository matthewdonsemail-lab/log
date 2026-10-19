import { describe, expect, test } from 'bun:test'
import { createActor, fromPromise, toPromise } from 'xstate'
import { publishMachine, toConditionLabel, validateListing } from './index'
import type { ErrorCode } from '../../errors/catalog/index'
import type { FormOutcome, PublishInput, PublishListing, PublishOutput, SolveOutput } from './index'

const listing: PublishListing = {
  title: 'Rubbish Removal & Clearance Galway',
  price: 50,
  category: 'Miscellaneous',
  condition: 'good',
  description: 'Same-day collection.',
  location: 'Galway, Ireland',
  photos: ['a.jpg', 'b.jpg']
}

interface Script {
  forms?: FormOutcome[]
  solves?: SolveOutput[]
  confirm?: { ok: true; how: string } | { ok: false; code: string; detail?: string }
  listingId?: string | null
  failAt?: string
  failCode?: ErrorCode
}

/** Runs the machine with scripted actors; returns output, visited states and which actors ran. */
async function run(script: Script, input: Partial<PublishInput> = {}) {
  const forms = [...(script.forms ?? [{ kind: 'ready', url: 'create/item' }])]
  const solves = [...(script.solves ?? [])]
  const calls: string[] = []
  const step = <T>(name: string, value: T) =>
    fromPromise(async () => {
      calls.push(name)
      if (script.failAt === name) return { ok: false, code: script.failCode ?? 'crashed' } as never
      return value
    })
  const machine = publishMachine.provide({
    actors: {
      preparePhotos: step('preparePhotos', { ok: true, paths: ['/m/photo1.jpg', '/m/photo2.jpg'], hashes: ['h1', 'h2'] }) as never,
      openForm: fromPromise(async () => {
        calls.push('openForm')
        const next = forms.shift()
        if (!next) throw new Error('no scripted form outcome left')
        return next
      }) as never,
      solveCaptcha: fromPromise(async ({ input }: { input: { solver: string } }) => {
        calls.push(`solve:${input.solver}`)
        return solves.shift() ?? { solved: false, code: 'solverTimeout' }
      }) as never,
      setCategory: step('setCategory', { ok: true, value: 'Miscellaneous' }) as never,
      uploadPhotos: step('uploadPhotos', { ok: true, count: 2 }) as never,
      fillFields: step('fillFields', { ok: true, filled: { title: listing.title, price: '50' } }) as never,
      review: step('review', { ok: true, receipt: '/r/review.png', photoCount: 2 }) as never,
      publish: step('publish', { ok: true, audienceStep: false }) as never,
      confirm: fromPromise(async () => {
        calls.push('confirm')
        return script.confirm ?? { ok: true, how: 'toast' }
      }) as never,
      captureId: fromPromise(async () => {
        calls.push('captureId')
        const id = script.listingId === undefined ? '1583545526797714' : script.listingId
        return { listingId: id, listingUrl: id ? `https://www.facebook.com/marketplace/item/${id}/` : null }
      }) as never
    }
  })
  const states: string[] = []
  const actor = createActor(machine, {
    input: {
      accountId: 'fbGalwayRubbish',
      listing,
      dryRun: true,
      availability: { captchaKraken: true, twoCaptcha: true },
      ...input
    }
  })
  actor.subscribe((s) => {
    if (states.at(-1) !== String(s.value)) states.push(String(s.value))
  })
  actor.start()
  const output = (await toPromise(actor)) as PublishOutput
  return { output, states, calls }
}

describe('publishMachine', () => {
  test('dry run fills everything and stops at review: Publish is never clicked', async () => {
    const { output, states, calls } = await run({})
    expect(output.result).toBe('dryRun')
    expect(states).toEqual(['preparingPhotos', 'openingForm', 'choosingCategory', 'uploadingPhotos', 'fillingFields', 'reviewing', 'done'])
    expect(calls).not.toContain('publish')
    expect(output.receipt).toBe('/r/review.png')
    expect(output.photoCount).toBe(2)
    expect(output.filled.category).toBe('Miscellaneous')
  })

  test('live run publishes, confirms and reads the id', async () => {
    const { output, calls } = await run({}, { dryRun: false })
    expect(output.result).toBe('published')
    expect(output.listingId).toBe('1583545526797714')
    expect(calls.slice(-3)).toEqual(['publish', 'confirm', 'captureId'])
  })

  test('published but no id is unconfirmedId, and nothing is retried', async () => {
    const { output, calls } = await run({ listingId: null }, { dryRun: false })
    expect(output.result).toBe('unconfirmedId')
    expect(calls.filter((c) => c === 'publish')).toHaveLength(1)
  })

  test('no toast still looks for the listing instead of retrying', async () => {
    const { output } = await run({ confirm: { ok: false, code: 'noConfirmation' } }, { dryRun: false })
    expect(output.result).toBe('published')
  })

  test("FB's Oops dialog fails the run", async () => {
    const { output, calls } = await run({ confirm: { ok: false, code: 'rejected', detail: 'Something went wrong' } }, { dryRun: false })
    expect(output.result).toBe('failed')
    expect(output.failure).toMatchObject({ state: 'confirming', code: 'rejected' })
    expect(calls).not.toContain('captureId')
  })

  test('reCAPTCHA: CaptchaKraken solves it, the re-check marks it accepted', async () => {
    const { output, calls } = await run({
      forms: [{ kind: 'captcha', detection: { kind: 'recaptcha', enterprise: true } }, { kind: 'ready', url: 'create/item' }],
      solves: [{ solved: true }]
    })
    expect(output.result).toBe('dryRun')
    expect(calls).toContain('solve:captchaKraken')
    expect(output.captchaAttempts).toHaveLength(1)
    expect(output.captchaAttempts[0]).toMatchObject({ solver: 'captchaKraken', solved: true, accepted: true })
  })

  test('reCAPTCHA: CaptchaKraken fails twice, 2Captcha gets it', async () => {
    const captcha: FormOutcome = { kind: 'captcha', detection: { kind: 'recaptcha' } }
    const { output, calls } = await run({
      forms: [captcha, captcha, captcha, { kind: 'ready', url: 'create/item' }],
      solves: [{ solved: false, code: 'solveError' }, { solved: true }, { solved: true }]
    })
    expect(calls.filter((c) => c.startsWith('solve:'))).toEqual(['solve:captchaKraken', 'solve:captchaKraken', 'solve:twoCaptcha'])
    expect(output.captchaAttempts.map((a) => a.accepted)).toEqual([false, false, true])
    expect(output.result).toBe('dryRun')
  })

  test('Arkose goes to 2Captcha only', async () => {
    const { calls } = await run({
      forms: [{ kind: 'captcha', detection: { kind: 'arkose' } }, { kind: 'ready', url: 'create/item' }],
      solves: [{ solved: true }]
    })
    expect(calls.filter((c) => c.startsWith('solve:'))).toEqual(['solve:twoCaptcha'])
  })

  test("FB's own challenge stops at needsPerson without spending a solve", async () => {
    const { output, calls } = await run({ forms: [{ kind: 'captcha', detection: { kind: 'facebookChallenge' } }] })
    expect(output.result).toBe('needsPerson')
    expect(output.failure).toMatchObject({ code: 'noSolverForKind' })
    expect(calls.some((c) => c.startsWith('solve:'))).toBe(false)
  })

  test('solvers that keep failing end in needsPerson, not a loop', async () => {
    const captcha: FormOutcome = { kind: 'captcha', detection: { kind: 'recaptcha' } }
    const { output } = await run({ forms: [captcha, captcha, captcha, captcha, captcha], solves: [] })
    expect(output.result).toBe('needsPerson')
    expect(output.captchaAttempts).toHaveLength(3)
  })

  test('an account issue stops the run as blocked', async () => {
    const { output } = await run({ forms: [{ kind: 'issue', issue: 'rateLimited', detail: 'daily listing limit' }] })
    expect(output.result).toBe('blocked')
    expect(output.issue).toBe('rateLimited')
  })

  test('a step that cannot confirm its write fails at that step', async () => {
    const { output, calls } = await run({ failAt: 'uploadPhotos', failCode: 'photosNotConfirmed' })
    expect(output.result).toBe('failed')
    expect(output.failure).toMatchObject({ state: 'uploadingPhotos', code: 'photosNotConfirmed' })
    expect(calls).not.toContain('fillFields')
  })

  test('the condition is mapped to the form label', async () => {
    expect(toConditionLabel('like_new')).toBe('Used – like new')
    expect(toConditionLabel('Used - good')).toBe('Used – good')
    expect(toConditionLabel('new')).toBe('New')
  })
})

describe('validateListing', () => {
  test('catches what would stall the form', () => {
    expect(validateListing(listing)).toEqual([])
    expect(validateListing({ ...listing, photos: [] })).toContain('at least 1 photo is needed (Next stays disabled with 0)')
    expect(validateListing({ ...listing, price: 0 })).toContain('price must be 1 or more')
    expect(validateListing({ ...listing, title: ' ' })).toContain('title is empty')
  })
})
