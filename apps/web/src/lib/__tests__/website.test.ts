import { describe, expect, it } from 'vitest'
import { isValidWebsite, websiteError } from '../website'

describe('website validation', () => {
  it.each([
    ['acmeplumbing.com', null],
    ['https://acmeplumbing.com', null],
    ['  AcmePlumbing.IO  ', null],
    ['shop.example.co.uk', null],
    ['localhost:3000', 'That website needs a domain, e.g. acmeplumbing.com.'],
    ['acme.c', 'That website needs a valid ending, e.g. .com or .io.'],
    ['notawebsite', 'That website needs a domain, e.g. acmeplumbing.com.'],
    ['', 'Enter your website first.'],
    ['   ', 'Enter your website first.'],
    ['https://', 'That website does not parse — check it and try again.'],
  ])('says %j -> %j', (input, message) => {
    expect(websiteError(input)).toBe(message)
    expect(isValidWebsite(input)).toBe(message === null)
  })
})
