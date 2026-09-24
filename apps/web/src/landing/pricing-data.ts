export type PricingBilling = 'half' | 'annual'

export type PricingPlan = {
  id: string
  name: string
  blurb: string
  ctaLabel: string
  ctaHref: string
  includesLabel: string
  includes: readonly string[]
  seat: string
  popular?: boolean
  oneTime?: boolean
  amount?: number
  half?: number
  annual?: number
}

export type PricingEnterpriseItem = {
  label: string
}

export type PricingCompareRow = {
  feature: string
  values: readonly string[]
}

export type PricingCompareGroup = {
  id: string
  title: string
  defaultOpen?: boolean
  rows: readonly PricingCompareRow[]
}

export type PricingCopy = {
  title: string
  description: string
  halfLabel: string
  annualLabel: string
  saveLabel: string
  frequencyHalf: string
  frequencyAnnual: string
  frequencyOnce: string
  popularLabel: string
  enterpriseEyebrow: string
  enterpriseTitle: string
  enterpriseBody: string
  enterpriseCtaLabel: string
  enterpriseCtaHref: string
  enterpriseItems: readonly PricingEnterpriseItem[]
  compareLabel: string
  comparePeriod?: string
  plans: readonly PricingPlan[]
  compare: readonly PricingCompareGroup[]
}

export const PRICING_COPY: PricingCopy = {
  title: 'Clear scope, flat retainers.',
  description: 'Three ways to work together. Monthly packages, zero hidden fees, cancel anytime with 30 days notice.',
  halfLabel: 'Half-year',
  annualLabel: 'Annual',
  saveLabel: 'Save 28%',
  frequencyHalf: 'Billed every 6 months',
  frequencyAnnual: 'Billed annually',
  frequencyOnce: 'One-time setup',
  popularLabel: 'Most popular',
  enterpriseEyebrow: 'Custom',
  enterpriseTitle: 'For businesses that need the whole room',
  enterpriseBody: 'When the retainer is not enough: extra seats, custom workflows, and a stack built around how your front desk actually works. Setup still sits on top — CRM creation and company AI infrastructure, then the monthly work.',
  enterpriseCtaLabel: 'Book a call',
  enterpriseCtaHref: '/onboarding',
  enterpriseItems: [
    { label: 'Custom pipeline and seats' },
    { label: 'Company AI infrastructure' },
    { label: 'Market strategy on retainer' },
    { label: 'Org controls and access' },
    { label: 'Priority desk support' },
    { label: 'Onboarding and training' }
  ],
  compareLabel: 'Compare plans',
  comparePeriod: 'Per month',
  plans: [
    {
      id: 'site',
      name: 'Site',
      blurb: 'Website and CRM so the click can become a meeting.',
      half: 350,
      annual: 252,
      seat: 'Per company',
      ctaLabel: 'Choose Site',
      ctaHref: '/onboarding',
      includesLabel: 'Includes:',
      includes: [
        'Conversion website',
        'CRM pipeline',
        'Forms and click-to-call',
        'Missed-call text-back',
        'Email support'
      ]
    },
    {
      id: 'stack',
      name: 'Stack',
      blurb: 'The site, plus AI infrastructure the company actually uses.',
      half: 649,
      annual: 467,
      seat: 'Per company',
      popular: true,
      ctaLabel: 'Choose Stack',
      ctaHref: '/onboarding',
      includesLabel: 'Everything in Site, plus:',
      includes: [
        'Company AI infrastructure',
        'Intent listening on the desk',
        'Automatic follow-up in the CRM',
        'Shared workspace',
        'Reporting on booked meetings'
      ]
    },
    {
      id: 'grow',
      name: 'Grow',
      blurb: 'Full package: site, CRM, AI, and market strategy.',
      half: 999,
      annual: 719,
      seat: 'Per company',
      ctaLabel: 'Choose Grow',
      ctaHref: '/onboarding',
      includesLabel: 'Everything in Stack, plus:',
      includes: [
        'Market strategy on a cadence',
        'PPC for people already in-market',
        'Landing pages matched to the query',
        'Priority chat support',
        'Budget reported in meetings booked'
      ]
    },
    {
      id: 'setup',
      name: 'Setup',
      blurb: 'AI infrastructure for the company, plus CRM creation — billed once, on top of any retainer.',
      oneTime: true,
      amount: 5000,
      seat: 'Per company',
      ctaLabel: 'Start setup',
      ctaHref: '/onboarding',
      includesLabel: 'Includes:',
      includes: [
        'CRM built for the front desk',
        'Company AI infrastructure',
        'Site wired into the pipeline',
        'Onboarding and training',
        'Handoff to Site, Stack, or Grow'
      ]
    }
  ],
  compare: [
    {
      id: 'features',
      title: 'Features',
      defaultOpen: true,
      rows: [
        {
          feature: 'Conversion website',
          values: ['check', 'check', 'check', 'Wired in']
        },
        {
          feature: 'CRM pipeline',
          values: ['check', 'check', 'check', 'Built']
        },
        {
          feature: 'Missed-call text-back',
          values: ['check', 'check', 'check', 'check']
        },
        {
          feature: 'Company AI infrastructure',
          values: ['-', 'check', 'check', 'Built']
        },
        {
          feature: 'Intent listening',
          values: ['-', 'check', 'check', '-']
        },
        {
          feature: 'Market strategy',
          values: ['-', '-', 'check', '-']
        },
        {
          feature: 'PPC for in-market buyers',
          values: ['-', '-', 'check', '-']
        },
        {
          feature: 'Setup (CRM + AI infra)',
          values: ['-', '-', '-', '$5,000']
        }
      ]
    },
    {
      id: 'stack',
      title: 'Stack',
      rows: [
        {
          feature: 'Pages built to book',
          values: ['Core site', 'Core site', 'Core site + landers', 'Wired']
        },
        {
          feature: 'Pipeline seats',
          values: ['Front desk', 'Team', 'Team', 'Custom']
        },
        {
          feature: 'Follow-up',
          values: ['CRM', 'Automatic', 'Automatic + strategy', 'Configured']
        },
        {
          feature: 'Reporting',
          values: ['Leads', 'Meetings', 'Meetings + spend', '-']
        }
      ]
    },
    {
      id: 'support',
      title: 'Support & Success',
      rows: [
        {
          feature: 'Email support',
          values: ['check', 'check', 'check', 'check']
        },
        {
          feature: 'Live chat',
          values: ['-', 'check', 'Priority', 'During build']
        },
        {
          feature: 'Onboarding',
          values: ['-', '-', '-', 'check']
        },
        {
          feature: 'Dedicated strategy',
          values: ['-', '-', 'check', '-']
        }
      ]
    }
  ]
}

export type FaqItem = {
  id: string
  question: string
  answer: string
  answeredBy: string
  answeredByImage?: string
}

export type FaqAsideData = {
  title: string
  ctaLabel: string
  ctaHref: string
  body: string
  photo?: string
}

export type FaqCopy = {
  title: string
  subtitle: string
  aside: FaqAsideData
  items: FaqItem[]
}

export const FAQ_COPY: FaqCopy = {
  title: 'Pricing questions',
  subtitle: 'What $350, $999, and the $5,000 setup actually buy.',
  aside: {
    title: "Didn't get the answer you were looking for?",
    ctaLabel: 'Send Us A Message!',
    ctaHref: '/onboarding',
    body: 'We will be happy to answer!',
    photo: '/images/mattlistening.webp'
  },
  items: [
    {
      id: 'site-plan',
      answeredBy: 'Matthew',
      answeredByImage: '/images/mattlistening.webp',
      question: 'What is on the $350 plan?',
      answer: 'Site is website plus CRM. The page can take the booking. The pipeline owns the lead. Missed calls get a text-back. It is the lowest retainer — not a free tier, and not ads or strategy.'
    },
    {
      id: 'grow-plan',
      answeredBy: 'Martinus',
      answeredByImage: '/images/mandeeplistening.webp',
      question: 'Why does Grow stop at $999 instead of $500?',
      answer: 'Grow is the full monthly package: site, CRM, company AI infrastructure, and market strategy including PPC. $999 is the half-year monthly rate. Yearly billing is 28% less per month. Setup is separate.'
    },
    {
      id: 'setup-fee',
      answeredBy: 'Matthew',
      answeredByImage: '/images/mattlistening.webp',
      question: 'What is the $5,000 setup?',
      answer: 'One-time. We create the CRM and stand up AI infrastructure for the company, then wire the site into that pipeline. It sits on top of Site, Stack, or Grow — it is not a substitute for the retainer.'
    },
    {
      id: 'billing',
      answeredBy: 'Martinus',
      answeredByImage: '/images/mandeeplistening.webp',
      question: 'How do half-year and annual compare?',
      answer: 'Half-year is the listed monthly rate, billed every six months. Annual is the same work at 28% off per month, billed once a year. Setup stays $5,000 either way.'
    }
  ]
}
