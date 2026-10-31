import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Pricing } from '../../landing/Pricing'
import { livePlanSchema, PLAN_CARDS, phraseLimitReached, platformLabel, usageText, type LivePlan } from '../plans'

const plan = (over: Partial<LivePlan['usage']['phrases']> = {}, limit = 1): LivePlan => ({
  plan: 'free', name: 'Free',
  limits: { phrasesPerPlatform: limit, accountsPerPlatform: 1 },
  usage: { phrases: { reddit: 0, x: 0, facebook: 0, ...over }, accounts: { reddit: 0, x: 0, facebook: 0 } },
})

describe('the plans on offer', () => {
  it('has a real Free plan of one of each, and a Pro that is announced but cannot be bought', () => {
    const [free, pro] = PLAN_CARDS
    expect(free).toMatchObject({ id: 'free', price: '$0', href: '/onboarding' })
    expect(free.features.join(' ')).toContain('1 phrase per platform')
    expect(free.features.join(' ')).toContain('1 connected account per platform')
    expect(pro).toMatchObject({ id: 'pro', href: null, cta: 'Coming soon', badge: 'Coming soon' })
  })

  it('never offers a way to pay, because nothing charges', () => {
    const html = renderToStaticMarkup(<MemoryRouter><Pricing /></MemoryRouter>)
    expect(html).toContain('Simple pricing')
    expect(html).toContain('id="pricing"')
    expect(html).toContain('$0')
    expect(html).toContain('$19')
    expect(html).toContain('href="/onboarding"')
    expect(html).toMatch(/<button[^>]*disabled[^>]*>Coming soon<\/button>/)
    expect(html).not.toMatch(/checkout|stripe|subscribe|card number/i)
  })
})

describe('what the server says about a person\'s plan', () => {
  const wire = { plan: 'free', name: 'Free', limits: { phrasesPerPlatform: 1, accountsPerPlatform: 1 }, usage: { phrases: { reddit: 1, x: 0, facebook: 0 }, accounts: { reddit: 1, x: 0, facebook: 0 } } }

  it('is checked before it is shown', () => {
    expect(livePlanSchema.parse(wire)).toEqual(wire)
    expect(livePlanSchema.safeParse({ ...wire, limits: { phrasesPerPlatform: 'one' } }).success).toBe(false)
    expect(livePlanSchema.safeParse({ plan: 'free' }).success).toBe(false)
  })

  it('reads "1 of 1" and names platforms', () => {
    expect(usageText(1, 1)).toBe('1 of 1')
    expect(usageText(0, 3)).toBe('0 of 3')
    expect([platformLabel('reddit'), platformLabel('x'), platformLabel('facebook'), platformLabel('other')]).toEqual(['Reddit', 'X', 'Facebook', 'other'])
  })
})

describe('when the Keywords page stops the button', () => {
  it('blocks only the platform that is full', () => {
    expect(phraseLimitReached(plan({ x: 1 }), 'x')).toBe(true)
    expect(phraseLimitReached(plan({ x: 1 }), 'reddit')).toBe(false)
    expect(phraseLimitReached(plan({ x: 1 }), 'facebook')).toBe(false)
  })

  it('follows the limit the server reports, and lets people through until it has answered', () => {
    expect(phraseLimitReached(plan({ x: 1 }, 2), 'x')).toBe(false)
    expect(phraseLimitReached(plan({ x: 2 }, 2), 'x')).toBe(true)
    expect(phraseLimitReached(plan({ x: 5 }, 2), 'x')).toBe(true)   // someone who already had more keeps them, and cannot add
    expect(phraseLimitReached(null, 'x')).toBe(false)               // the server still enforces the limit either way
  })
})
