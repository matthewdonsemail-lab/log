import type { ErrorCode } from '../../errors/catalog/index'

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

export interface BytefulResidentialSummary {
  proxyUserIds: string[]
  bytes: number
  bytesUsed: number
  bytesLeft: number
}

export interface BytefulCity {
  cityId: number
  cityName: string
  subdivisionId: string | null
  latitude: number
  longitude: number
  nodes: number
}

export interface BytefulResidentialRequest {
  proxyUserId: string
  country: string
  cityId?: number | null
  subdivisionId?: string | null
  ttl: string
  protocol: 'http' | 'socks5'
}

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

export interface BytefulQuote {
  valid: boolean
  totalCents: number
  perUnitCents: number | null
  itemName: string | null
  creditCents: number
  invalidReason: string | null
}
