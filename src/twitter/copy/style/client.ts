const URL = /https?:\/\/\S+/g

const BANNED: readonly [string, string][] = [
  [',', 'comma'],
  [';', 'semicolon'],
  ['.', 'full stop'],
  ['—', 'em dash'],
  ['–', 'en dash']
]

export function styleProblems(text: string): string[] {
  const stripped = text.replace(URL, ' ')
  const problems: string[] = []
  const upper = [...new Set([...stripped].filter((ch) => ch !== ch.toLowerCase() && ch === ch.toUpperCase()))].sort()
  if (upper.length) problems.push(`uppercase characters: ${upper.join('')}`)
  for (const [ch, label] of BANNED) if (stripped.includes(ch)) problems.push(`${label} (${ch})`)
  return problems
}

export const STYLE_HINT = 'lowercase only, no commas, semicolons, full stops, em or en dashes (URLs are exempt), or pass --skipStyleCheck'
