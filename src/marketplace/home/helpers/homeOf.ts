import { CITY_COORDINATES, CITY_TIMEZONES, HOME_COUNTRIES } from '../types'
import type { HomeResult } from '../types'

export interface HomeFields {
  accountName: string
  homeCountry: string | null
  homeCity: string | null
}

export function homeOf(account: HomeFields): HomeResult {
  const country = account.homeCountry?.trim().toUpperCase() ?? ''
  const entry = HOME_COUNTRIES[country]
  if (!entry) {
    return {
      ok: false,
      code: 'noHomeLocale',
      detail: `${account.accountName}: no locale for homeCountry "${country || 'unset'}" (known: ${Object.keys(HOME_COUNTRIES).join(', ')})`
    }
  }
  const city = account.homeCity?.trim() || null
  const timezone = entry.timezone ?? (city ? CITY_TIMEZONES[`${country}:${city.toLowerCase()}`] : undefined)
  if (!timezone) {
    return {
      ok: false,
      code: 'noHomeTimezone',
      detail: `${account.accountName}: ${country} has more than one timezone and homeCity "${city ?? 'unset'}" isn't in CITY_TIMEZONES`
    }
  }
  const centre = city ? CITY_COORDINATES[`${country}:${city.toLowerCase()}`] : undefined
  const coordinates = centre ? { latitude: centre[0], longitude: centre[1] } : null
  return { ok: true, home: { country, city, locale: entry.locale, facebookLocale: entry.facebookLocale, timezone, coordinates } }
}
