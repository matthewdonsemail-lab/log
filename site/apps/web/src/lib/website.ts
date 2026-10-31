/**
 * Shared website validation for the landing hero form and the onboarding
 * website step. Structural only: the value must parse as a URL whose host
 * has a dot and a 2+ letter TLD (covers .com, .io and future TLDs without
 * maintaining an allowlist). The real lookup still happens in onboarding.
 */

/** Normalize raw input into a URL, or return the plain-words reason it cannot be one. */
export function websiteError(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return 'Enter your website first.'
  const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let host: string
  try {
    host = new URL(normalized).hostname
  } catch {
    return 'That website does not parse — check it and try again.'
  }
  const cleanHost = host.replace(/\.$/, '').toLowerCase()
  const parts = cleanHost.split('.')
  if (parts.length < 2 || parts.some((part) => part.length === 0)) {
    return 'That website needs a domain, e.g. acmeplumbing.com.'
  }
  const tld = parts[parts.length - 1]
  if (!/^[a-z]{2,}$/.test(tld)) {
    return 'That website needs a valid ending, e.g. .com or .io.'
  }
  return null
}

/** True when the value passes the structural website check. */
export function isValidWebsite(input: string): boolean {
  return websiteError(input) === null
}
