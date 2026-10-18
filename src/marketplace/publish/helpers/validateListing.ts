import type { PublishListing } from '../types'

/** Problems that stop a publish before any browser opens. Pure. Empty = fine. */
export function validateListing(listing: PublishListing): string[] {
  const problems: string[] = []
  if (!listing.title.trim()) problems.push('title is empty')
  if (listing.title.length > 100) problems.push(`title is ${listing.title.length} chars (Facebook takes 100)`)
  if (!Number.isFinite(listing.price) || listing.price < 1) problems.push('price must be 1 or more')
  if (!Number.isInteger(listing.price)) problems.push('price must be a whole number')
  if (!listing.category.trim()) problems.push('category is empty')
  if (listing.photos.length === 0) problems.push('at least 1 photo is needed (Next stays disabled with 0)')
  if (listing.photos.length > 10) problems.push(`${listing.photos.length} photos (Facebook takes 10)`)
  return problems
}

/**
 * The create form's condition labels use an en dash ("Used – good"). Accepts
 * Listaro's stored values (`like_new`, `good`) and hyphenated labels too. Pure.
 */
export function toConditionLabel(condition: string | undefined): string | undefined {
  if (!condition) return undefined
  const key = condition.trim().toLowerCase().replace(/[\s_–-]+/g, '')
  const labels: Record<string, string> = {
    new: 'New',
    likenew: 'Used – like new',
    usedlikenew: 'Used – like new',
    good: 'Used – good',
    usedgood: 'Used – good',
    fair: 'Used – fair',
    usedfair: 'Used – fair'
  }
  return labels[key] ?? condition
}
