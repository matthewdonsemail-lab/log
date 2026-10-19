import type { AccountIssue, RawSignal } from '../types'

/**
 * Page signal -> account issue. The phrases are Listaro's
 * (Listaro_backup agent/src/poster.ts:70-86, process-posts/route.ts:855-994,
 * facebook-auto-login.ts:544-661), folded into log's one vocabulary. Listaro
 * mapped the same signal to different statuses depending on the code path;
 * here each signal has exactly one issue. Order matters: the first match wins,
 * most severe first. Returns null when the page shows no account problem.
 */
const RULES: { issue: AccountIssue; phrases: string[] }[] = [
  // The whole account, not just Marketplace: it becomes BANNED and its campaign listings are replaced.
  { issue: 'accountDisabled', phrases: ['account has been disabled', 'account has been locked', 'we suspended your account', 'your account has been suspended'] },
  // Signed in, but restricted account-wide (Pittsburgh, 2026-10-19: "Everything you manage, including all of
  // your profiles, Pages and groups, is restricted", from 9 Sep, under its vendor; its Marketplace pages open on
  // a "What happened / You can no longer request a review" dialog). It becomes RESTRICTED, never ACTIVE.
  {
    issue: 'restrictedPolicy',
    phrases: ['we added a restriction to your account', 'everything you manage, including', 'you can no longer request a review', 'your account is restricted']
  },
  {
    issue: 'suspended',
    phrases: [
      "can't buy or sell",
      'unable to buy or sell',
      'access to marketplace has been restricted',
      "can't use marketplace",
      'removed from marketplace',
      "didn't follow our community standards"
    ]
  },
  {
    issue: 'checkpointed',
    phrases: ['verify your identity', 'confirm your identity', 'security check', 'code we sent', 'add your phone number']
  },
  { issue: 'captchaHtml', phrases: ['captcha', 'arkose'] },
  {
    issue: 'rateLimited',
    phrases: [
      'limit reached',
      'try again later',
      'temporarily blocked',
      'daily listing limit',
      "you can't create any more listings"
    ]
  },
  { issue: 'readOnlyLimited', phrases: ['oops', 'something went wrong', 'facebook rejected'] },
  { issue: 'loginWall', phrases: ['log in or sign up for facebook', 'log in to continue', 'forgot account'] }
]

export function classifySignal(signal: RawSignal & { text?: string }): AccountIssue | null {
  const url = (signal.url ?? '').toLowerCase()
  if (url.includes('/checkpoint')) return 'checkpointed'
  if (url.includes('/login') || url.includes('login.php')) return 'sessionExpired'
  const text = `${signal.marker ?? ''} ${signal.text ?? ''}`.toLowerCase()
  for (const rule of RULES) {
    if (rule.phrases.some((phrase) => text.includes(phrase))) return rule.issue
  }
  return null
}
