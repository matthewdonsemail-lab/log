/**
 * 2Captcha's residential proxies (https://2captcha.com/proxy/api), one of the
 * places an account's proxy can come from (docs/vendors/, AGENTS.md rule 12).
 *
 * The public API (`https://api.2captcha.com/proxy...?key=`) gives the account's
 * proxy username, balance and traffic. Connections go through a gateway with
 * that username plus geo and session parts, and the proxy password from the
 * 2Captcha dashboard (it is not in the API). Built from the docs and the
 * dashboard's own code: docs/proxies.md "2Captcha".
 */
import type { ErrorCode } from '../../errors/catalog/index'

/** A 2Captcha call or setup problem, with its catalog code. */
export class TwoCaptchaError extends Error {
  readonly code: ErrorCode

  constructor(code: ErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

/** The `2CAPTCHA_API_KEY` / `2CAPTCHA_PROXY_PASSWORD` pair, from log-cli/.env.local. */
export interface TwoCaptchaCredentials {
  apiKey: string
  proxyPassword: string
}

/** `GET /proxy`: the proxy account. Flows are traffic (the dashboard shows MB). */
export interface TwoCaptchaAccount {
  username: string
  status: number
  totalFlow: number
  usedFlow: number
  leftFlow: number
  whitelistedIps: string[]
}

/** One place 2Captcha can exit in, from its location search. */
export interface TwoCaptchaPlace {
  city: string
  /** 2Captcha's state/region slug, e.g. `connacht`. */
  region: string
  /** ISO alpha-2, lower case as 2Captcha writes it. */
  countryCode: string
}

/** What `buildProxyUrl` needs. */
export interface ProxyRequest {
  username: string
  password: string
  /** ISO alpha-2 (any case). */
  country: string
  place?: TwoCaptchaPlace | null
  /** Sticky session id: the same one keeps asking for the same exit IP. */
  session: string
  /** 1-120. 2Captcha never keeps one IP longer than 120 minutes. */
  sessionMinutes: number
  protocol: 'http' | 'socks5'
  host: string
}
