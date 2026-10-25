import type { ReasoningPrompts } from '../facebookClient/index'

export interface BundleScript {
  file: string
  text: string
}

export interface SourceSlice {
  file: string
  calledFrom: string
  text: string
}

export interface PlatformClientRules {
  domains: [string, RegExp][]
  mutation: RegExp
  reasoning: ReasoningPrompts
}

export const MAX_SLICES = 4
export const MAX_SLICE_CHARS = 20_000
export const MIN_SLICE_CHARS = 400
export const MAX_LITERAL_CHARS = 300

export const GENERIC_REASONING: ReasoningPrompts = [
  ['What it does', "What this request is for on the platform's side, from rea's reading of the code that sends it and the step it fires in."],
  ['What our machine does with it', 'Which flow, inspect step or engine action waits for it, reads it, or ignores it, and why.'],
  ['What can go wrong', 'The errors and statuses it can return, what each means for the run, and what our machine does then.']
]

export const PLATFORM_CLIENT_RULES: Record<string, PlatformClientRules> = {
  reddit: {
    domains: [
      ['account', /token|recaptcha|captcha|login|dataProtectionConsent|userDrawer|bannedUser/i],
      ['chat', /chat/i],
      ['inbox', /inbox|notification/i],
      ['comments', /moreComments|postDetail|comment/i],
      ['feed', /feed|morePosts|hamburgerMenu/i],
      ['community', /community|subreddit|hoverCard|stylingOverrides|crosspost|modContent/i],
      ['profile', /trophy|achievement|profile/i],
      ['experiments', /exposeVariant|uxtargeting|deferredExperiences|devvit|enrollIn/i],
      ['telemetry', /events|perfmetrics|reports|policy|v4P|preloadHead/i]
    ],
    mutation: /^(Create|Update|Store|Expose|Enroll|Delete|Add|Remove|Set|Mark|Submit|Send|Save)/,
    reasoning: GENERIC_REASONING
  }
}
