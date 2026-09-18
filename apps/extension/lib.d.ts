export type PlatformId = 'reddit' | 'x' | 'facebook'
export interface Site { name: string; url: string; domains: string[]; login: string[][] }
export interface ChromeCookie {
  name: string; value: string; domain: string; path?: string; expirationDate?: number
  httpOnly?: boolean; secure?: boolean; sameSite?: string
}
export const SITES: Record<PlatformId, Site>
export const TOKEN_PREFIX: string
export function platformForUrl(url: string): PlatformId | null
export function toRecord(cookie: ChromeCookie): {
  name: string; value: string; domain: string; path: string; expires: number
  httpOnly: boolean; secure: boolean; sameSite: 'Strict' | 'Lax' | 'None'
}
export function hasLogin(platform: PlatformId, cookies: { name: string }[]): boolean
export function buildToken(platform: PlatformId, chromeCookies: ChromeCookie[]): string
