import type { ErrorCode } from '../../../errors/catalog/index'
import type { AccountStatus } from '../types'

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
  identityVerificationRequired: 'restricted',
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
