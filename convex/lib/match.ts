const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Case-insensitive whole-word match: "bookkeeper" matches "need a bookkeeper!" but
 * not "bookkeepers-united"; a multi-word phrase matches across any whitespace.
 */
export function phraseMatches(phrase: string, text: string): boolean {
  const words = phrase.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return false
  const body = words.map(escapeRegExp).join('\\s+')
  return new RegExp(`(?<![\\p{L}\\p{N}_])${body}(?![\\p{L}\\p{N}_])`, 'iu').test(text)
}

/** The lowercase subreddit a Reddit post URL belongs to, or null. */
export function subredditOf(url: string): string | null {
  const found = /\/r\/([A-Za-z0-9_]{1,21})(?:\/|$)/.exec(url)
  return found ? found[1].toLowerCase() : null
}
