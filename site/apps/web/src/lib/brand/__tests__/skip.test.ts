import { afterEach, describe, expect, it } from 'vitest'
import { clearBrand, getBrand, saveBrand, skippedBrand } from '..'

afterEach(() => clearBrand())

describe('skipping the website step', () => {
  it('gives a placeholder brand that saves and reads back like a real one', () => {
    const saved = saveBrand(skippedBrand())
    expect(saved.identity.name).toBe('Your business')
    expect(saved.identity.website).toBe('')
    expect(saved.offerings).toEqual([])
    expect(typeof saved.updatedAt).toBe('string')
    expect(getBrand()).toEqual(saved)
  })
})
