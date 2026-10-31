import type { ErrorCode } from '../../errors/catalog/index'

export interface HomeCountry {
  locale: string
  facebookLocale: string
  timezone: string | null
}

export const HOME_COUNTRIES: Readonly<Record<string, HomeCountry>> = {
  IE: { locale: 'en-IE', facebookLocale: 'en_GB', timezone: 'Europe/Dublin' },
  GB: { locale: 'en-GB', facebookLocale: 'en_GB', timezone: 'Europe/London' },
  US: { locale: 'en-US', facebookLocale: 'en_US', timezone: null },
  CA: { locale: 'en-CA', facebookLocale: 'en_US', timezone: null },
  AU: { locale: 'en-AU', facebookLocale: 'en_GB', timezone: null },
  NZ: { locale: 'en-NZ', facebookLocale: 'en_GB', timezone: 'Pacific/Auckland' }
}

export const CITY_TIMEZONES: Readonly<Record<string, string>> = {
  'US:new york': 'America/New_York',
  'US:boston': 'America/New_York',
  'US:philadelphia': 'America/New_York',
  'US:pittsburgh': 'America/New_York',
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
  'US:allentown': 'America/New_York',
  'US:erie': 'America/New_York',
  'US:harrisburg': 'America/New_York',
  'US:lancaster': 'America/New_York',
  'US:reading': 'America/New_York',
  'US:scranton': 'America/New_York',
  'US:state college': 'America/New_York',
  'US:wilkes-barre': 'America/New_York',
  'US:bethlehem': 'America/New_York',
  'US:exeter': 'America/New_York',
  'US:hazleton': 'America/New_York',
  'US:mountain top': 'America/New_York',
  'US:pittston': 'America/New_York',
  'US:plymouth': 'America/New_York',
  'US:kingston': 'America/New_York',
  'US:nanticoke': 'America/New_York',
  'US:shavertown': 'America/New_York',
  'CA:toronto': 'America/Toronto',
  'CA:ottawa': 'America/Toronto',
  'CA:montreal': 'America/Toronto',
  'CA:winnipeg': 'America/Winnipeg',
  'CA:calgary': 'America/Edmonton',
  'CA:edmonton': 'America/Edmonton',
  'CA:vancouver': 'America/Vancouver',
  'CA:halifax': 'America/Halifax',
  'CA:kamloops': 'America/Vancouver',
  'CA:kelowna': 'America/Vancouver',
  'CA:west kelowna': 'America/Vancouver',
  'CA:lake country': 'America/Vancouver',
  'CA:vernon': 'America/Vancouver',
  'CA:penticton': 'America/Vancouver',
  'CA:summerland': 'America/Vancouver',
  'CA:merritt': 'America/Vancouver',
  'CA:barriere': 'America/Vancouver',
  'CA:chase': 'America/Vancouver',
  'AU:sydney': 'Australia/Sydney',
  'AU:melbourne': 'Australia/Melbourne',
  'AU:brisbane': 'Australia/Brisbane',
  'AU:perth': 'Australia/Perth',
  'AU:adelaide': 'Australia/Adelaide',
  'AU:canberra': 'Australia/Sydney',
  'AU:hobart': 'Australia/Hobart'
}

export const CITY_REGIONS: Readonly<Record<string, string>> = {
  'US:new york': 'NY',
  'US:boston': 'MA',
  'US:miami': 'FL',
  'US:atlanta': 'GA',
  'US:chicago': 'IL',
  'US:houston': 'TX',
  'US:dallas': 'TX',
  'US:austin': 'TX',
  'US:denver': 'CO',
  'US:phoenix': 'AZ',
  'US:los angeles': 'CA',
  'US:san francisco': 'CA',
  'US:san diego': 'CA',
  'US:seattle': 'WA',
  'US:portland': 'OR',
  'US:philadelphia': 'PA',
  'US:pittsburgh': 'PA',
  'US:allentown': 'PA',
  'US:erie': 'PA',
  'US:harrisburg': 'PA',
  'US:lancaster': 'PA',
  'US:reading': 'PA',
  'US:scranton': 'PA',
  'US:state college': 'PA',
  'US:wilkes-barre': 'PA',
  'US:bethlehem': 'PA',
  'US:exeter': 'PA',
  'US:hazleton': 'PA',
  'US:mountain top': 'PA',
  'US:pittston': 'PA',
  'US:plymouth': 'PA',
  'US:kingston': 'PA',
  'US:nanticoke': 'PA',
  'US:shavertown': 'PA',
  'CA:toronto': 'ON',
  'CA:ottawa': 'ON',
  'CA:montreal': 'QC',
  'CA:winnipeg': 'MB',
  'CA:calgary': 'AB',
  'CA:edmonton': 'AB',
  'CA:vancouver': 'BC',
  'CA:halifax': 'NS',
  'CA:kamloops': 'BC',
  'CA:kelowna': 'BC',
  'CA:west kelowna': 'BC',
  'CA:lake country': 'BC',
  'CA:vernon': 'BC',
  'CA:penticton': 'BC',
  'CA:summerland': 'BC',
  'CA:merritt': 'BC',
  'CA:barriere': 'BC',
  'CA:chase': 'BC'
}

export const CITY_COORDINATES: Readonly<Record<string, readonly [number, number]>> = {
  'IE:galway': [53.2707, -9.0568],
  'IE:dublin': [53.3498, -6.2603],
  'IE:cork': [51.8985, -8.4756],
  'IE:limerick': [52.6638, -8.6267],
  'IE:waterford': [52.2593, -7.1101],
  'IE:kilkenny': [52.6541, -7.2448],
  'IE:sligo': [54.2766, -8.4761],
  'IE:athlone': [53.4239, -7.9407],
  'IE:ennis': [52.8436, -8.9864],
  'GB:london': [51.5074, -0.1278],
  'GB:manchester': [53.4808, -2.2426],
  'GB:birmingham': [52.4862, -1.8904],
  'GB:leeds': [53.8008, -1.5491],
  'GB:liverpool': [53.4084, -2.9916],
  'GB:bristol': [51.4545, -2.5879],
  'GB:glasgow': [55.8642, -4.2518],
  'GB:edinburgh': [55.9533, -3.1883],
  'GB:belfast': [54.5973, -5.9301],
  'US:new york': [40.7128, -74.006],
  'US:boston': [42.3601, -71.0589],
  'US:philadelphia': [39.9526, -75.1652],
  'US:pittsburgh': [40.4406, -79.9959],
  'US:miami': [25.7617, -80.1918],
  'US:atlanta': [33.749, -84.388],
  'US:chicago': [41.8781, -87.6298],
  'US:houston': [29.7604, -95.3698],
  'US:dallas': [32.7767, -96.797],
  'US:austin': [30.2672, -97.7431],
  'US:denver': [39.7392, -104.9903],
  'US:phoenix': [33.4484, -112.074],
  'US:los angeles': [34.0522, -118.2437],
  'US:san francisco': [37.7749, -122.4194],
  'US:san diego': [32.7157, -117.1611],
  'US:seattle': [47.6062, -122.3321],
  'US:portland': [45.5152, -122.6784],
  'US:allentown': [40.6084, -75.4884],
  'US:erie': [42.1292, -80.0854],
  'US:harrisburg': [40.2725, -76.8908],
  'US:lancaster': [40.1104, -76.3016],
  'US:reading': [40.3383, -75.9252],
  'US:scranton': [41.409, -75.6653],
  'US:state college': [40.7934, -77.86],
  'US:wilkes-barre': [41.2465, -75.8817],
  'US:bethlehem': [40.6292, -75.3725],
  'CA:toronto': [43.6532, -79.3832],
  'CA:ottawa': [45.4215, -75.6972],
  'CA:montreal': [45.5017, -73.5673],
  'CA:winnipeg': [49.8951, -97.1384],
  'CA:calgary': [51.0447, -114.0719],
  'CA:edmonton': [53.5461, -113.4938],
  'CA:vancouver': [49.2827, -123.1207],
  'CA:halifax': [44.6488, -63.5752],
  'AU:sydney': [-33.8688, 151.2093],
  'AU:melbourne': [-37.8136, 144.9631],
  'AU:brisbane': [-27.4698, 153.0251],
  'AU:perth': [-31.9505, 115.8605],
  'AU:adelaide': [-34.9285, 138.6007],
  'AU:canberra': [-35.2809, 149.13],
  'AU:hobart': [-42.8821, 147.3272],
  'NZ:auckland': [-36.8485, 174.7633],
  'NZ:wellington': [-41.2865, 174.7762],
  'NZ:christchurch': [-43.5321, 172.6362]
}

export const DEFAULT_ACTIVE_HOURS = { start: 8, end: 22 } as const

export interface ActiveWindow {
  start: number
  end: number
}

export interface Home {
  country: string
  city: string | null
  locale: string
  facebookLocale: string
  timezone: string
  coordinates: { latitude: number; longitude: number } | null
}

export type HomeResult = { ok: true; home: Home } | { ok: false; code: ErrorCode; detail: string }

export interface LocalClock {
  date: string
  hour: number
  label: string
}
