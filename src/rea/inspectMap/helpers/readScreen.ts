import type { ScreenElement } from '../types'

const INTERACTIVE = /^(button|link|textbox|checkbox|radio|combobox|menuitem|tab|option)$/

interface Line {
  indent: number
  text: string
}

const lines = (snapshot: string): Line[] =>
  snapshot
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => ({ indent: l.length - l.trimStart().length, text: unquote(l.trim().replace(/^- /, '')) }))

function unquote(text: string): string {
  const quoted = text.match(/^'(.*)'(:?)$/)
  return quoted ? quoted[1].replace(/''/g, "'") + quoted[2] : text
}

function parseNode(text: string): { role: string; name: string | null; ref: string | null; disabled: boolean; value: string | null } {
  const role = text.match(/^([a-z]+)/)?.[1] ?? ''
  const name = text.match(/^[a-z]+ "([^"]*)"/)?.[1] ?? null
  const ref = text.match(/\[ref=(e\d+)\]/)?.[1] ?? null
  const value = text.match(/\]:\s+(.+)$/)?.[1] ?? text.match(/^[a-z]+:\s+(.+)$/)?.[1] ?? null
  return { role, name, ref, disabled: /\[disabled\]/.test(text), value }
}

function labelOf(all: Line[], at: number): string {
  const own = parseNode(all[at].text)
  if (own.name) return own.name
  if (own.value && !own.value.startsWith('/url')) return own.value
  for (let i = at + 1; i < all.length && all[i].indent > all[at].indent; i++) {
    const child = all[i].text
    const text = child.match(/^text:\s+(.+)$/)?.[1] ?? parseNode(child).value
    if (text && !child.startsWith('/url')) return text.replace(/^"|"$/g, '')
  }
  return ''
}

export function withoutName(heading: string): string {
  return heading.replace(/^[A-Z][\p{L}'-]+(?: [A-Z][\p{L}'-]+){0,3},\s+/u, '').replace(/^(.)/, (c) => c.toUpperCase())
}

export function readScreen(snapshot: string): { heading: string | null; elements: ScreenElement[] } {
  const all = lines(snapshot)
  let skipBelow: number | null = null
  let heading: string | null = null
  const elements: ScreenElement[] = []
  for (let i = 0; i < all.length; i++) {
    const { indent, text } = all[i]
    if (skipBelow !== null && indent > skipBelow) continue
    skipBelow = null
    const node = parseNode(text)
    if (node.role === 'banner' || node.role === 'navigation') {
      skipBelow = indent
      continue
    }
    if (!heading && (node.role === 'heading' || node.role === 'generic') && node.value && node.value.split(' ').length >= 3) heading = withoutName(node.value)
    if (INTERACTIVE.test(node.role)) elements.push({ role: node.role, name: labelOf(all, i), ref: node.ref, disabled: node.disabled })
  }
  return { heading, elements }
}

export function stateId(heading: string | null, path: string): string {
  const source = heading ?? path.replace(/\d{5,}/g, ' ')
  const words = source.replace(/['’]/g, '').split(/[^A-Za-z0-9]+/).filter(Boolean).slice(0, 5)
  return words.map((w, i) => (i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())).join('') || 'blank'
}
