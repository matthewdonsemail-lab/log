export type PrivacyRuleName =
  | 'slackToken'
  | 'encPassword'
  | 'sessionCookie'
  | 'nostrSecret'
  | 'aiApiKey'
  | 'githubToken'
  | 'privateKey'
  | 'urlCredentials'
  | 'cloudflareTunnel'
  | 'trycloudflareCredentials'
  | 'bearerToken'
  | 'tailnetHost'
  | 'tailnetIp'
  | 'publicIp'
  | 'homePath'
  | 'windowsUserPath'
  | 'email'
  | 'phone'
  | 'linkedinProfile'
  | 'linkedinMemberId'
  | 'denylist'
  | 'forbiddenPath'
  | 'gitleaks'

export interface PrivacyRule {
  name: PrivacyRuleName
  pattern: RegExp
  value?: number
  lineMustMatch?: RegExp
  lineSkip?: RegExp
  allowed?: (value: string, context: AllowContext) => boolean
}

export interface AllowContext {
  allowedEmails: ReadonlySet<string>
}
