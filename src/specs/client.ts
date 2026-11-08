import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import type { RequirementAnchors } from './anchors/types'

export function specDomains(root: string): string[] {
  const dir = join(root, 'src', 'specs')
  return readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'anchors' && existsSync(join(dir, d.name, 'index.ts'))).map((d) => d.name).sort()
}

export async function specTargets(root: string): Promise<Record<string, unknown>> {
  const targets: Record<string, unknown> = {}
  for (const name of specDomains(root)) {
    const mod = (await import(pathToFileURL(join(root, 'src', 'specs', name, 'index.ts')).href)) as Record<string, unknown>
    if (!mod[name]) throw new Error(`src/specs/${name}/index.ts must export const ${name}`)
    const { anchors: _anchors, ...target } = mod[name] as Record<string, unknown>
    targets[name] = target
  }
  return targets
}

export function unpairedSpecs(root: string): string[] {
  const docs = existsSync(join(root, 'docs', 'specs')) ? readdirSync(join(root, 'docs', 'specs')).filter((f) => f.endsWith('.md') && f !== 'README.md').map((f) => f.slice(0, -3)) : []
  const domains = specDomains(root)
  return [...docs.filter((d) => !domains.includes(d)).map((d) => `docs/specs/${d}.md has no src/specs/${d}/index.ts`)]
}

export interface SpecSummary {
  domain: string
  title: string
  about: string
  requirements: { id: string; title: string }[]
}

export function specSummary(domain: string, text: string): SpecSummary {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const title = lines.find((l) => l.startsWith('# '))?.slice(2).trim() ?? domain
  const start = lines.findIndex((l) => l.startsWith('# '))
  const about = lines.slice(start + 1).join('\n').split(/\n#/)[0]!.trim().split('\n\n')[0]!.replace(/\n/g, ' ').trim()
  const requirements = lines.flatMap((l) => {
    const m = /^### (REQ-[A-Z0-9]+-\d+):\s*(.+)$/.exec(l)
    return m ? [{ id: m[1]!, title: m[2]!.trim() }] : []
  })
  return { domain, title, about, requirements }
}

export function specsIndex(specs: SpecSummary[], order: readonly string[]): string {
  const rank = (d: string) => (order.includes(d) ? order.indexOf(d) : order.length)
  const sorted = [...specs].sort((a, b) => rank(a.domain) - rank(b.domain) || a.domain.localeCompare(b.domain))
  const total = sorted.reduce((n, s) => n + s.requirements.length, 0)
  const out = [
    '---',
    'title: "Specs"',
    '---',
    '',
    '# Specs',
    '',
    `What log-cli must do, in order by domain: ${sorted.length} domains, ${total} requirements. Each one's anchors are proved against its code by the syntax tree on every commit, push and pull request (\`bun run check:specs\`). SubQ reads a requirement against its code only when asked (\`bun run check:specs --subq\`, rule 170). AGENTS.md keeps the rules by date; these pages are the same rules as they stand today. Written by \`bun run docs:build\` from the spec pages, not edited by hand.`,
    '',
  ]
  for (const s of sorted) {
    out.push(`## [${s.title}](./${s.domain}.md)`, '', s.about, '')
    for (const r of s.requirements) out.push(`- **${r.id}** ${r.title}`)
    out.push('')
  }
  return out.join('\n')
}

export async function specAnchors(root: string): Promise<Record<string, RequirementAnchors>> {
  const out: Record<string, RequirementAnchors> = {}
  for (const name of specDomains(root)) {
    const mod = (await import(pathToFileURL(join(root, 'src', 'specs', name, 'index.ts')).href)) as Record<string, { anchors?: RequirementAnchors }>
    if (mod[name]?.anchors) out[name] = mod[name]!.anchors!
  }
  return out
}
