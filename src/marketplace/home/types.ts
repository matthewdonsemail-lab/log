/**
 * Where an account lives, as the browser and the clock must show it: the one
 * table of country → browser locale, Facebook UI locale and timezone, and the
 * waking hours a run may happen in (AGENTS.md rules 16 and 18).
 *
 * The browser locale is pinned per country at launch (never Camoufox's random
 * pick from the country's languages: 28% of Irish launches came out ga-IE or
 * fr-IE). Countries with more than one timezone need the home city in
 * `CITY_TIMEZONES`; a city that isn't there is refused rather than guessed.
 */
import type { ErrorCode } from '../../errors/catalog/index'

export interface HomeCountry {
  /** BCP 47, what navigator.language, Accept-Language and Intl show. */
  locale: string
  /** Facebook's own UI locale for the create form URL (`?locale=`). */
  facebookLocale: string
  /** IANA zone for a one-zone country; null when it depends on the city. */
  timezone: string | null
}

/** Every country an account may live in. Add a row before giving an account a new homeCountry. */
export const HOME_COUNTRIES: Readonly<Record<string, HomeCountry>> = {
  IE: { locale: 'en-IE', facebookLocale: 'en_GB', timezone: 'Europe/Dublin' },
  GB: { locale: 'en-GB', facebookLocale: 'en_GB', timezone: 'Europe/London' },
  US: { locale: 'en-US', facebookLocale: 'en_US', timezone: null },
  CA: { locale: 'en-CA', facebookLocale: 'en_US', timezone: null },
  AU: { locale: 'en-AU', facebookLocale: 'en_GB', timezone: null },
  NZ: { locale: 'en-NZ', facebookLocale: 'en_GB', timezone: 'Pacific/Auckland' }
}

/** Home cities in countries with more than one zone, keyed `COUNTRY:city` (city lower case). */
export const CITY_TIMEZONES: Readonly<Record<string, string>> = {
  'US:new york': 'America/New_York',
  'US:boston': 'America/New_York',
  'US:philadelphia': 'America/New_York',
  'US:miami': 'America/New_York',
  'US:atlanta': 'America/New_York',
  'US:chicago': 'America/Chicago',
  'US:houston': 'America/Chicago',
  'US:dallas': 'America/Chicago',
  'US:austin': 'America/Chicago',
  'US:denver': 'America/Denver',
  'US:phoenix': 'America/Phoenix',
  'US:los angeles': 'America/Los_Angeles',
  'US:san francisco': 'America/Los_Angeles',
  'US:san diego': 'America/Los_Angeles',
  'US:seattle': 'America/Los_Angeles',
  'US:portland': 'America/Los_Angeles',
  'CA:toronto': 'America/Toronto',
  'CA:ottawa': 'America/Toronto',
  'CA:montreal': 'America/Toronto',
  'CA:winnipeg': 'America/Winnipeg',
  'CA:calgary': 'America/Edmonton',
  'CA:edmonton': 'America/Edmonton',
  'CA:vancouver': 'America/Vancouver',
  'CA:halifax': 'America/Halifax',
  'AU:sydney': 'Australia/Sydney',
  'AU:melbourne': 'Australia/Melbourne',
  'AU:brisbane': 'Australia/Brisbane',
  'AU:perth': 'Australia/Perth',
  'AU:adelaide': 'Australia/Adelaide',
  'AU:canberra': 'Australia/Sydney',
  'AU:hobart': 'Australia/Hobart'
}

/** Local waking hours when the account has none set: 08:00 to 22:00 in its home timezone. */
export const DEFAULT_ACTIVE_HOURS = { start: 8, end: 22 } as const

/** A window in local hours, `start` inclusive, `end` exclusive. `start > end` wraps past midnight. */
export interface ActiveWindow {
  start: number
  end: number
}

/** Everything a launch pins from the account's home. */
export interface Home {
  country: string
  city: string | null
  locale: string
  facebookLocale: string
  timezone: string
}

export type HomeResult = { ok: true; home: Home } | { ok: false; code: ErrorCode; detail: string }

/** The wall clock in a timezone. */
export interface LocalClock {
  /** `YYYY-MM-DD` in that zone. */
  date: string
  /** Hours since local midnight, e.g. 8.5 for 08:30. */
  hour: number
  /** `HH:MM`. */
  label: string
}
