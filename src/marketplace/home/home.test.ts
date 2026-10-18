/**
 * Rules 16 and 18: the pinned locale and timezone per country, and the
 * account's local waking hours, on an injected clock.
 */
import { describe, expect, test } from 'bun:test'
import { activeWindow, homeOf, insideWindow, localClock, outsideActiveHours } from './index'

/** The YYYY-MM-DD part of an ISO time. */
const day = (iso: string) => iso.slice(0, 10)

const galway = { accountName: 'galwayOne', homeCountry: 'IE', homeCity: 'Galway', activeHoursStart: null, activeHoursEnd: null }

describe('homeOf: one table, refused when unknown', () => {
  test('pins the locale, Facebook UI locale and timezone per country', () => {
    expect(homeOf(galway)).toEqual({
      ok: true,
      home: {
        country: 'IE',
        city: 'Galway',
        locale: 'en-IE',
        facebookLocale: 'en_GB',
        timezone: 'Europe/Dublin',
        coordinates: { latitude: 53.2707, longitude: -9.0568 }
      }
    })
    // A city with no known centre: the device falls back to the exit IP's location.
    expect(homeOf({ ...galway, homeCity: 'Oughterard' })).toMatchObject({ ok: true, home: { timezone: 'Europe/Dublin', coordinates: null } })
    expect(homeOf({ ...galway, homeCountry: 'GB', homeCity: 'Manchester' })).toMatchObject({ ok: true, home: { locale: 'en-GB', timezone: 'Europe/London' } })
  })

  test('countries with several zones need a known city', () => {
    expect(homeOf({ ...galway, homeCountry: 'US', homeCity: 'Seattle' })).toMatchObject({ ok: true, home: { locale: 'en-US', timezone: 'America/Los_Angeles' } })
    expect(homeOf({ ...galway, homeCountry: 'CA', homeCity: 'Toronto' })).toMatchObject({ ok: true, home: { locale: 'en-CA', timezone: 'America/Toronto' } })
    expect(homeOf({ ...galway, homeCountry: 'US', homeCity: 'Smallville' })).toMatchObject({ ok: false, code: 'noHomeTimezone' })
    expect(homeOf({ ...galway, homeCountry: 'AU', homeCity: null })).toMatchObject({ ok: false, code: 'noHomeTimezone' })
  })

  test('a country not in the table is refused, never given a random language', () => {
    expect(homeOf({ ...galway, homeCountry: 'VN', homeCity: 'Hanoi' })).toMatchObject({ ok: false, code: 'noHomeLocale' })
    expect(homeOf({ ...galway, homeCountry: null })).toMatchObject({ ok: false, code: 'noHomeLocale' })
  })
})

describe('local time (DST-correct through Intl)', () => {
  test('Galway is UTC+1 in summer and UTC+0 in winter; the date is the local one', () => {
    expect(localClock(new Date('2026-10-18T07:30:00Z'), 'Europe/Dublin')).toEqual({ date: day('2026-10-18T07:30:00Z'), hour: 8.5, label: '08:30' })
    expect(localClock(new Date('2026-12-01T07:30:00Z'), 'Europe/Dublin')).toEqual({ date: day('2026-12-01T07:30:00Z'), hour: 7.5, label: '07:30' })
    // 23:30 UTC on the 18th is already the 19th in Sydney.
    expect(localClock(new Date('2026-10-18T23:30:00Z'), 'Australia/Sydney').date).toBe(day('2026-10-19T00:00:00Z'))
  })
})

describe('active hours (rule 18)', () => {
  test('08:00-22:00 local by default', () => {
    // 09:00 in Vietnam is 03:00 in Galway (IST): refused, with the local time and when it opens.
    const night = outsideActiveHours(galway, 'Europe/Dublin', new Date('2026-10-18T02:00:00Z'))
    expect(night).toContain('it is 03:00 in Galway (Europe/Dublin)')
    expect(night).toContain('runs 08:00-22:00 local')
    expect(night).toContain('opens at 08:00 local, in 5h00 (2026-10-18T07:00Z)')
    expect(outsideActiveHours(galway, 'Europe/Dublin', new Date('2026-10-18T07:00:00Z'))).toBeNull()
    expect(outsideActiveHours(galway, 'Europe/Dublin', new Date('2026-10-18T20:59:00Z'))).toBeNull()
    expect(outsideActiveHours(galway, 'Europe/Dublin', new Date('2026-10-18T21:00:00Z'))).toContain('it is 22:00')
  })

  test('the window is per account, may use half hours and may wrap midnight', () => {
    const narrow = { ...galway, activeHoursStart: 9.5, activeHoursEnd: 10 }
    expect(activeWindow(narrow)).toEqual({ start: 9.5, end: 10 })
    expect(outsideActiveHours(narrow, 'Europe/Dublin', new Date('2026-10-18T08:40:00Z'))).toBeNull()
    expect(outsideActiveHours(narrow, 'Europe/Dublin', new Date('2026-10-18T09:00:00Z'))).toContain('opens at 09:30 local, in 23h30')
    expect(insideWindow(23, { start: 20, end: 2 })).toBe(true)
    expect(insideWindow(1.5, { start: 20, end: 2 })).toBe(true)
    expect(insideWindow(12, { start: 20, end: 2 })).toBe(false)
  })

  test('nonsense windows fall back to 08:00-22:00', () => {
    for (const [start, end] of [[null, 22], [8, 8], [-1, 22], [8, 30]] as const) {
      expect(activeWindow({ activeHoursStart: start, activeHoursEnd: end })).toEqual({ start: 8, end: 22 })
    }
  })
})
