import { DIAGRAM_END, DIAGRAM_START } from './types'
import type { Step } from './types'

const LABEL_MAX = 64

function cells(row: string): string[] {
  return row.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split(/(?<!\\)\|/).map((c) => c.trim())
}

export function clean(text: string, max = LABEL_MAX): string {
  const plain = text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*"<>{}#|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const first = (plain.split(/(?<=\.)\s/)[0] ?? plain).replace(/[.:;,]+$/, '')
  return first.length > max ? `${first.slice(0, max - 1).trimEnd()}…` : first
}

export function toolNames(cell: string): string {
  const names = [...cell.matchAll(/`([a-zA-Z][\w]*)(?:[\s`{(]|$)/g)].map((m) => m[1]!)
  const unique = [...new Set(names)]
  return unique.length ? unique.join(', ') : clean(cell, 40)
}

export function stepsOf(table: string[]): Step[] {
  return table
    .slice(2)
    .map(cells)
    .filter((c) => c.length >= 3 && /^\d+[a-z]?$/.test(c[0] ?? ''))
    .map((c) => ({ n: c[0]!, step: c[1]!, tool: c[2]! }))
}

export function stepsDiagram(steps: readonly Step[]): string {
  const nodes = steps.map((s, i) => {
    const tool = toolNames(s.tool)
    return `  s${i}["${s.n}. ${clean(s.step)}${tool ? `<br/><i>${tool}</i>` : ''}"]`
  })
  const edges = steps.slice(1).map((_, i) => `  s${i} --> s${i + 1}`)
  return ['```mermaid', 'flowchart TD', ...nodes, ...edges, '```'].join('\n')
}

export function withStepsDiagrams(markdown: string): string {
  const text = markdown.replace(/\r\n/g, '\n').replace(new RegExp(`${escape(DIAGRAM_START)}[\\s\\S]*?${escape(DIAGRAM_END)}\\n\\n`, 'g'), '')
  const lines = text.split('\n')
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (/^\|\s*#\s*\|/.test(line)) {
      const end = lines.findIndex((l, j) => j > i && !l.startsWith('|'))
      const table = lines.slice(i, end === -1 ? lines.length : end)
      const steps = stepsOf(table)
      if (steps.length >= 2) out.push(DIAGRAM_START, stepsDiagram(steps), DIAGRAM_END, '')
    }
    out.push(line)
  }
  return out.join('\n')
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
