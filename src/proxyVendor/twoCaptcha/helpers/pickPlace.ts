import type { TwoCaptchaPlace } from '../types'
import { slug } from './buildProxyUrl'

export function pickPlace(found: TwoCaptchaPlace[], city: string, country: string, region: string | null = null): TwoCaptchaPlace | null {
  const exact = found.filter((p) => p.countryCode.toUpperCase() === country.toUpperCase() && slug(p.city) === slug(city))
  if (!region) return exact[0] ?? null
  return exact.find((p) => slug(p.region) === slug(region)) ?? null
}
