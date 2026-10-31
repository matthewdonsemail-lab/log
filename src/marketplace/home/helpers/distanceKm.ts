export interface LatLong {
  latitude: number
  longitude: number
}

export function distanceKm(a: LatLong, b: LatLong): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180
  const dLat = radians(b.latitude - a.latitude)
  const dLong = radians(b.longitude - a.longitude)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLong / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}
