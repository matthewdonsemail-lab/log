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
  {
    issue: 'suspended',
    phrases: [
      "can't buy or sell",
      'unable to buy or sell',
      'access to marketplace has been restricted',
      "can't use marketplace",
      'removed from marketplace',
      "didn't follow our community standards",
      'account has been disabled',
      'account has been locked'
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
