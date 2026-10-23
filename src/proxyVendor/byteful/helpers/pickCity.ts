import type { BytefulCity } from '../types'

const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '')
const km = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const r = Math.PI / 180
  const h = Math.sin(((b.latitude - a.latitude) * r) / 2) ** 2 + Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin(((b.longitude - a.longitude) * r) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export function pickCity(cities: BytefulCity[], city: string, near: { latitude: number; longitude: number } | null): BytefulCity | null {
  const named = cities.filter((c) => norm(c.cityName) === norm(city) && c.nodes > 0)
  if (!named.length) return null
  if (!near) return [...named].sort((a, b) => b.nodes - a.nodes)[0]
  return [...named].sort((a, b) => km(near, a) - km(near, b))[0]
}
