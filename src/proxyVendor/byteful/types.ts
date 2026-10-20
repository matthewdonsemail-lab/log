/**
 * Byteful's proxies (https://documentation.byteful.com, API https://api.byteful.com/1.0),
 * one of the places an account's proxy can come from (docs/proxyVendors/byteful.md,
 * AGENTS.md rule 12). The API authenticates with two headers, X-API-Public-Key
 * and X-API-Private-Key (`BYTEFUL_PUBLIC_KEY`, `BYTEFUL_PRIVATE_KEY` in
 * log-cli/.env.local).
 *
 * Residential: `GET /public/user/residential/list` returns finished proxy URLs
 * (`http://{proxyUser}_c_us_city_{city}_s_{session}_ttl_{ttl}:{password}@residential.byteful.com:8000`),
 * targeted to a country, US state or city; a sticky session holds its IP up to
 * 24 hours. Billed by traffic (`/residential/summary`).
 * Static ISP: bought per IP per month by checkout, pinned to a country only
 * (the API's fulfilment filter takes a country and, with permission, an ASN);
 * each IP Byteful issues carries its city and coordinates (`/proxy/search`).
 */
import type { ErrorCode } from '../../errors/catalog/index'

/** A Byteful call or setup problem, with its catalog code. */
export class BytefulError extends Error {
  readonly code: ErrorCode

  constructor(code: ErrorCode, message: string) {
    super(message)
    this.code = code
  }
}

export interface BytefulCredentials {
  publicKey: string
  privateKey: string
}

/** `GET /residential/summary`: the residential plan's traffic, in bytes. */
export interface BytefulResidentialSummary {
  proxyUserIds: string[]
  bytes: number
  bytesUsed: number
  bytesLeft: number
}

/** A city Byteful knows, where it is, and how many devices its pool has there now. */
export interface BytefulCity {
  cityId: number
  cityName: string
  /** `us-pa`. */
  subdivisionId: string | null
  latitude: number
  longitude: number
  nodes: number
}

/** What `residentialProxyUrl` asks for. */
export interface BytefulResidentialRequest {
  proxyUserId: string
  /** ISO alpha-2, any case. */
  country: string
  /** A city id from `findCity`, or none for the whole state or country. */
  cityId?: number | null
  /** A US state, `us-pa`. */
  subdivisionId?: string | null
  /** Sticky session lifetime: `30m`, `24h` (Byteful's maximum is 24 hours). */
  ttl: string
  protocol: 'http' | 'socks5'
}

/** One static (ISP or datacenter) IP Byteful issued to the account, where it is. */
export interface BytefulStaticProxy {
  proxyId: string
  ipAddress: string
  httpPort: number | null
  socks5Port: number | null
  type: string
  cityName: string | null
  subdivisionName: string | null
  countryId: string | null
  latitude: number | null
  longitude: number | null
  online: boolean | null
}

/** `POST /checkout/quote`: what an order would cost, in cents. Never buys. */
export interface BytefulQuote {
  valid: boolean
  totalCents: number
  perUnitCents: number | null
  itemName: string | null
  creditCents: number
  invalidReason: string | null
}
