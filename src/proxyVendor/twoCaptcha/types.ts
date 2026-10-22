import type { ErrorCode } from '../../errors/catalog/index'

export class TwoCaptchaError extends Error {
  readonly code: ErrorCode

  constructor(code: ErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

export interface TwoCaptchaCredentials {
  apiKey: string
  proxyPassword: string
}

export interface TwoCaptchaAccount {
  username: string
  status: number
  totalFlow: number
  usedFlow: number
  leftFlow: number
  whitelistedIps: string[]
}

export interface TwoCaptchaPlace {
  city: string
  region: string
  countryCode: string
}

export interface ProxyRequest {
  username: string
  password: string
  country: string
  place?: TwoCaptchaPlace | null
  session: string
  sessionMinutes: number
  protocol: 'http' | 'socks5'
  host: string
}
