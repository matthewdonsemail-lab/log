import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { accountLimitMessage, FREE_PLAN, phraseLimitMessage, planLimits } from './lib/plan'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './feed.ts': () => import('./feed'),
  './hits.ts': () => import('./hits'),
  './http.ts': () => import('./http'),
  './ingest.ts': () => import('./ingest'),
  './keywords.ts': () => import('./keywords'),
  './plan.ts': () => import('./plan'),
  './reddit.ts': () => import('./reddit'),
  './watch.ts': () => import('./watch'),
}

afterEach(() => { vi.unstubAllEnvs() })

function setup() {
  const t = convexTest(schema, modules)
  return {
    t,
    alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }),
    bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }),
  }
}

const reddit = (phrase: string, subreddit = 'smallbusiness') => ({ phrase, platform: 'reddit' as const, subreddit })

describe('the Free plan', () => {
  it('is one phrase and one account per platform', () => {
    expect(FREE_PLAN).toMatchObject({ id: 'free', phrasesPerPlatform: 1, accountsPerPlatform: 1 })
    expect(planLimits({})).toEqual({ phrasesPerPlatform: 1, accountsPerPlatform: 1 })
  })

  it('lets the operator raise the limits, and ignores anything that is not a whole number from 1 to 1000', () => {
    expect(planLimits({ PLAN_PHRASES_PER_PLATFORM: '5', PLAN_ACCOUNTS_PER_PLATFORM: '3' })).toEqual({ phrasesPerPlatform: 5, accountsPerPlatform: 3 })
    for (const bad of ['', '0', '-2', 'abc', '2.5', '5000', ' ']) {
      expect(planLimits({ PLAN_PHRASES_PER_PLATFORM: bad, PLAN_ACCOUNTS_PER_PLATFORM: bad }), bad).toEqual({ phrasesPerPlatform: 1, accountsPerPlatform: 1 })
    }
  })

  it('says it in plain words, singular or plural', () => {
    expect(phraseLimitMessage('x', 1)).toBe('The Free plan has 1 X phrase at a time. Remove the one you have to add another (Pro, with more, is coming).')
    expect(phraseLimitMessage('facebook', 3)).toContain('3 Facebook phrases at a time')
    expect(accountLimitMessage('reddit', 1)).toContain('1 Reddit account at a time')
  })
})

describe('phrases', () => {
  it('allows one per platform and refuses the second with the reason', async () => {
    const { alice } = setup()
    await alice.mutation(anyApi.keywords.create, reddit('need a bookkeeper'))
    await expect(alice.mutation(anyApi.keywords.create, reddit('need an accountant', 'accounting'))).rejects.toThrow('The Free plan has 1 Reddit phrase at a time')
    await alice.mutation(anyApi.keywords.create, { phrase: 'need a helper', platform: 'x' })
    await alice.mutation(anyApi.keywords.create, { phrase: 'need a helper', platform: 'facebook' })
    await expect(alice.mutation(anyApi.keywords.create, { phrase: 'another one', platform: 'x' })).rejects.toThrow('1 X phrase')
    await expect(alice.mutation(anyApi.keywords.create, { phrase: 'another one', platform: 'facebook' })).rejects.toThrow('1 Facebook phrase')
  })

  it('still says "already listening" for a repeat of the same phrase', async () => {
    const { alice } = setup()
    await alice.mutation(anyApi.keywords.create, reddit('need a bookkeeper'))
    await expect(alice.mutation(anyApi.keywords.create, reddit('Need a  Bookkeeper'))).rejects.toThrow('already listening')
  })

  it('counts paused phrases too, and frees the slot when the phrase is removed', async () => {
    const { alice } = setup()
    const { keyword } = await alice.mutation(anyApi.keywords.create, reddit('need a bookkeeper'))
    await alice.mutation(anyApi.keywords.setStatus, { id: keyword.id, status: 'paused' })
    await expect(alice.mutation(anyApi.keywords.create, reddit('need an accountant'))).rejects.toThrow('The Free plan')
    await alice.mutation(anyApi.keywords.remove, { id: keyword.id })
    await alice.mutation(anyApi.keywords.create, reddit('need an accountant'))
  })

  it('is per person: one person at their limit does not block another', async () => {
    const { alice, bob } = setup()
    await alice.mutation(anyApi.keywords.create, reddit('need a bookkeeper'))
    await bob.mutation(anyApi.keywords.create, reddit('need a bookkeeper'))
  })

  it('never removes or blocks phrases a person already had, only new ones', async () => {
    const { t, alice } = setup()
    await t.run(async ctx => {
      const accountId = await ctx.db.insert('accounts', { owner: 'https://test.example|alice', platform: 'reddit', label: 'r', connectedAt: null })
      for (const phrase of ['old one', 'old two', 'old three']) {
        await ctx.db.insert('keywords', { owner: 'https://test.example|alice', accountId, platform: 'reddit', phrase, status: 'listening', subreddit: 'a' })
      }
    })
    await expect(alice.mutation(anyApi.keywords.create, reddit('brand new'))).rejects.toThrow('The Free plan')
    expect((await alice.query(anyApi.keywords.list, {})).keywords).toHaveLength(3)
  })

  it('follows the operator limit for the deployment', async () => {
    const { alice } = setup()
    vi.stubEnv('PLAN_PHRASES_PER_PLATFORM', '2')
    await alice.mutation(anyApi.keywords.create, reddit('one'))
    await alice.mutation(anyApi.keywords.create, reddit('two', 'b'))
    await expect(alice.mutation(anyApi.keywords.create, reddit('three', 'c'))).rejects.toThrow('2 Reddit phrases at a time')
  })
})

describe('accounts', () => {
  it('allows one per platform and refuses a second on the same platform', async () => {
    const { alice } = setup()
    await alice.mutation(anyApi.accounts.createWithResponse, { platform: 'x', label: 'My X' })
    await expect(alice.mutation(anyApi.accounts.createWithResponse, { platform: 'x', label: 'Second X' })).rejects.toThrow('The Free plan has 1 X account at a time')
    await expect(alice.mutation(anyApi.accounts.create, { platform: 'x', label: 'Third X' })).rejects.toThrow('1 X account')
    await alice.mutation(anyApi.accounts.createWithResponse, { platform: 'facebook', label: 'My Facebook' })
  })

  it('counts the account that a phrase creates on its own', async () => {
    const { alice } = setup()
    await alice.mutation(anyApi.keywords.create, { phrase: 'need a helper', platform: 'x' })
    await expect(alice.mutation(anyApi.accounts.createWithResponse, { platform: 'x', label: 'Another' })).rejects.toThrow('1 X account')
  })
})

describe('the plan and usage view', () => {
  it('reports the plan, the limits and what this person is using, and only theirs', async () => {
    const { alice, bob } = setup()
    await alice.mutation(anyApi.keywords.create, reddit('need a bookkeeper'))
    await alice.mutation(anyApi.keywords.create, { phrase: 'need a helper', platform: 'x' })
    const plan = await alice.query(anyApi.plan.mine, {})
    expect(plan).toEqual({
      plan: 'free', name: 'Free',
      limits: { phrasesPerPlatform: 1, accountsPerPlatform: 1 },
      usage: { phrases: { reddit: 1, x: 1, facebook: 0 }, accounts: { reddit: 1, x: 1, facebook: 0 } },
    })
    expect((await bob.query(anyApi.plan.mine, {})).usage.phrases).toEqual({ reddit: 0, x: 0, facebook: 0 })
  })

  it('needs a sign-in', async () => {
    const { t } = setup()
    await expect(t.query(anyApi.plan.mine, {})).rejects.toThrow('Authentication required')
  })
})
