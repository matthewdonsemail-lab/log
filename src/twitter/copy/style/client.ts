import type { CopyStyle } from './types'

const URL = /https?:\/\/\S+/g

const BANNED: readonly [string, string][] = [
  [',', 'comma'],
  [';', 'semicolon'],
  ['.', 'full stop'],
  ['—', 'em dash'],
  ['–', 'en dash']
]

function houseProblems(text: string): string[] {
  const stripped = text.replace(URL, ' ')
  const problems: string[] = []
  const upper = [...new Set([...stripped].filter((ch) => ch !== ch.toLowerCase() && ch === ch.toUpperCase()))].sort()
  if (upper.length) problems.push(`uppercase characters: ${upper.join('')}`)
  for (const [ch, label] of BANNED) if (stripped.includes(ch)) problems.push(`${label} (${ch})`)
  return problems
}

export const DEFAULT_COPY_STYLE = 'house'

export const COPY_STYLES: Readonly<Record<string, CopyStyle>> = {
  house: {
    name: 'house',
    summary: 'lowercase only, no commas, semicolons, full stops, em or en dashes (URLs are exempt)',
    problems: houseProblems
  }
}

export function copyStyleOf(name: string | null | undefined): CopyStyle | null {
  const key = name?.trim() || DEFAULT_COPY_STYLE
  return COPY_STYLES[key] ?? null
}

export function styleProblems(text: string, style: string | null | undefined = DEFAULT_COPY_STYLE): string[] {
  const found = copyStyleOf(style)
  if (!found) return [`unknown copy style "${style}" (known: ${Object.keys(COPY_STYLES).join(', ')})`]
  return found.problems(text)
}

export function styleHint(style: string | null | undefined = DEFAULT_COPY_STYLE): string {
  const found = copyStyleOf(style)
  return `${found ? `the ${found.name} style: ${found.summary}` : `known styles: ${Object.keys(COPY_STYLES).join(', ')}`}, or pass --skipStyleCheck`
}

export const STYLE_HINT = styleHint()
