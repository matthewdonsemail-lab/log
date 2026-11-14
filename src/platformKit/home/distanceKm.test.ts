import { describe, expect, test } from 'bun:test'
import { distanceKm } from './index'

describe('distanceKm', () => {
  test('measures great-circle km', () => {
    const lancaster = { latitude: 40.1104, longitude: -76.3016 }
    expect(distanceKm(lancaster, lancaster)).toBe(0)
    expect(Math.round(distanceKm(lancaster, { latitude: 40.8016, longitude: -75.6103 }))).toBe(97)
    expect(distanceKm(lancaster, { latitude: 32.5921, longitude: -96.7561 })).toBeGreaterThan(1900)
  })
})
