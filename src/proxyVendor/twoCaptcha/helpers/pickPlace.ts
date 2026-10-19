import type { TwoCaptchaPlace } from '../types'
import { slug } from './buildProxyUrl'

/**
 * The 2Captcha place for `city`, or null. The search matches substrings and
 * spans states (`philadelphia` → `newphiladelphia/ohio` first), so only an exact
 * city slug counts, in `region` when given. Pure.
 */
export function pickPlace(found: TwoCaptchaPlace[], city: string, country: string, region: string | null = null): TwoCaptchaPlace | null {
  const exact = found.filter((p) => p.countryCode.toUpperCase() === country.toUpperCase() && slug(p.city) === slug(city))
  if (!region) return exact[0] ?? null
  return exact.find((p) => slug(p.region) === slug(region)) ?? null
}
