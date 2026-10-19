import type { ErrorCode } from '../../../errors/catalog/index'
import type { AccountStatus } from '../types'

/**
 * The account status an observed account issue puts it in. null = the issue
 * says nothing about the account itself (proxy setup, a form problem). Listaro
 * mapped the same signal to different statuses depending on the code path
 * (`process-posts/route.ts:855-1067`); here each issue has exactly one. Pure.
 */
const STATUS_FOR_ISSUE: Partial<Record<ErrorCode, AccountStatus>> = {
  rateLimited: 'limited',
  proxyRateLimited: 'limited',
  neverConnected: 'needsLogin',
  sessionExpired: 'needsLogin',
  sessionInvalidatedChanged: 'needsLogin',
  cookieInvalid: 'needsLogin',
  loginWall: 'needsLogin',
  wrongPassword: 'needsLogin',
  signInNotFinished: 'needsLogin',
  checkpointed: 'checkpoint',
  videoSelfieRequired: 'checkpoint',
  unconfirmedUser: 'checkpoint',
  challengeInterstitial: 'checkpoint',
  suspended: 'restricted',
  readOnlyLimited: 'restricted',
  restrictedPolicy: 'restricted',
  permissionDenied: 'restricted',
  automatedFlagged: 'restricted',
  ipOrAccountBlocked: 'restricted',
  accountDisabled: 'banned'
}

export function statusForIssue(code: ErrorCode): AccountStatus | null {
  return STATUS_FOR_ISSUE[code] ?? null
}
