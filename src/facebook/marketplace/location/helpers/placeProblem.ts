import { CA_PROVINCE_NAMES, MIN_REGION_LETTERS, US_STATE_NAMES } from '../types'
import { CITY_REGIONS } from '../../../../marketplace/home/types'
import type { PlaceProblem } from '../types'

const EXAMPLE = '"City, State" with the state written out ("Bethlehem, Pennsylvania")'

function refuse(detail: string): PlaceProblem {
  return { code: 'locationAbbreviated', detail }
}

function writtenOut(part: string): string {
  const state = US_STATE_NAMES[part.toUpperCase()]
  return state ? `write "${part}" out as "${state}"` : `write "${part}" out in full`
}

export function placeProblem(place: string | null | undefined): PlaceProblem | null {
  const text = (place ?? '').trim()
  if (!text) return refuse(`no place given: type ${EXAMPLE}`)
  if (/\d/.test(text)) return refuse(`"${text}" has a number in it: a bare zip offered Granada, Spain first. Type ${EXAMPLE}`)
  const parts = text.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length < 2) return refuse(`"${text}" names no state or country: type ${EXAMPLE}`)
  for (const part of parts) {
    const acronym = part.match(/\b[A-Z]{2,}\b/)
    if (acronym) return refuse(`"${text}" looks abbreviated: ${writtenOut(acronym[0])}. "Bethlehem, PA" was offered only as the West Bank`)
  }
  for (const part of parts.slice(1)) {
    if (part.replace(/[^\p{L}]/gu, '').length < MIN_REGION_LETTERS) return refuse(`"${text}" looks abbreviated: ${writtenOut(part)}. "Bethlehem, PA" was offered only as the West Bank`)
  }
  return null
}

export function fullPlaceName(city: string, region: string): string {
  const state = US_STATE_NAMES[region.trim().toUpperCase()]
  const name = city.trim().replace(/\b\p{Ll}/gu, (letter) => letter.toUpperCase())
  return `${name}, ${state ?? region.trim()}`
}

export function homePlace(account: { homeCity: string | null; homeCountry: string | null }): string | null {
  const country = (account.homeCountry ?? '').trim().toUpperCase()
  const city = (account.homeCity ?? '').trim()
  const region = city ? CITY_REGIONS[`${country}:${city.toLowerCase()}`] : undefined
  const name = region ? (country === 'CA' ? CA_PROVINCE_NAMES[region] : US_STATE_NAMES[region]) : undefined
  return name ? fullPlaceName(city, name) : null
}
