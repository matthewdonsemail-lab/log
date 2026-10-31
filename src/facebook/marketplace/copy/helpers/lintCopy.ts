import type { CopyProblem, CopyVersion } from '../types'
import { BANNED_PHRASES, MAX_TITLE_LENGTH, MIN_TITLE_DIFFERENCE } from '../types'
import { wordDistance } from './wordDistance'

const SYMBOLS = /[\p{Extended_Pictographic}☀-➿⭐⭕←-⇿]/u

function bannedIn(text: string): string[] {
  const lower = text.toLowerCase().replace(/[’]/g, "'")
  return BANNED_PHRASES.filter((phrase) => new RegExp(`(^|[^\\p{L}])${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\p{L}]|$)`, 'u').test(lower))
}

function capsWords(text: string): string[] {
  return (text.match(/\p{L}+/gu) ?? []).filter((w) => w.length >= 3 && w === w.toUpperCase() && w !== w.toLowerCase())
}

export function lintVersion(version: CopyVersion, city: string | null): CopyProblem[] {
  const problems: CopyProblem[] = []
  const add = (rule: string, detail: string) => problems.push({ versionId: version.id, rule, detail })
  const { title, description } = version
  if (!/^[a-z][A-Za-z0-9]*$/.test(version.id)) add('versionId', `"${version.id}" must be camelCase (rule 1)`)
  if (!title.trim()) add('titleEmpty', 'the title is empty')
  if (title.length > MAX_TITLE_LENGTH) add('titleLength', `the title is ${title.length} characters, at most ${MAX_TITLE_LENGTH}`)
  if (city && !title.toLowerCase().includes(city.toLowerCase())) add('titleCity', `the title doesn't name ${city}`)
  if (SYMBOLS.test(title)) add('titleSymbols', 'the title has an emoji or a decorative symbol')
  const caps = capsWords(title)
  if (caps.length) add('titleCaps', `the title has words in capitals: ${caps.join(', ')}`)
  if (title.includes('!')) add('titleExclamation', 'the title has "!"')
  for (const phrase of bannedIn(title)) add('titleBanned', `the title says "${phrase}"`)
  if (!description.trim()) add('descriptionEmpty', 'the description is empty')
  if (description.includes('!')) add('descriptionExclamation', 'the description has "!"')
  if (SYMBOLS.test(description)) add('descriptionSymbols', 'the description has an emoji or a decorative symbol')
  for (const phrase of bannedIn(description)) add('descriptionBanned', `the description says "${phrase}"`)
  if (!/\p{Sc}\s?\d/u.test(description)) add('descriptionPrice', 'the description has no price with a number ($99, €99…)')
  if (!/^\s*[•-]\s+\S/m.test(description)) add('descriptionList', 'the description has no list (lines starting • or -)')
  if (!/\bphotos?\b/i.test(description)) add('descriptionPhoto', 'the description never asks for a photo')
  return problems
}

export function lintVersions(versions: readonly CopyVersion[], city: string | null, skip: ReadonlySet<string> = new Set()): CopyProblem[] {
  const problems = versions.flatMap((v) => lintVersion(v, city))
  const ids = new Set<string>()
  for (const v of versions) {
    if (ids.has(v.id)) problems.push({ versionId: v.id, rule: 'versionIdTwice', detail: `two versions are called "${v.id}"` })
    ids.add(v.id)
  }
  for (let i = 0; i < versions.length; i++) {
    for (let j = i + 1; j < versions.length; j++) {
      const a = versions[i]
      const b = versions[j]
      if (a.title.trim().toLowerCase() === b.title.trim().toLowerCase()) {
        problems.push({ versionId: b.id, rule: 'titleSame', detail: `the same title as ${a.id}` })
        continue
      }
      const differ = wordDistance(a.title, b.title, skip)
      if (differ < MIN_TITLE_DIFFERENCE) problems.push({ versionId: b.id, rule: 'titleTooAlike', detail: `its title shares too many words with ${a.id}'s: ${Math.round(differ * 100)}% different, at least ${Math.round(MIN_TITLE_DIFFERENCE * 100)}%` })
    }
  }
  return problems
}

export function copyVersionsOf(value: unknown): CopyVersion[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((v) => {
    if (!v || typeof v !== 'object') return []
    const { id, title, description } = v as Record<string, unknown>
    return typeof id === 'string' && typeof title === 'string' && typeof description === 'string' ? [{ id: id.trim(), title: title.trim(), description: description.trim() }] : []
  })
}
