import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const repo = join(import.meta.dir, '..', '..')
const flowsDir = join(repo, 'src', 'browser', 'flow', 'definitions')
const docsDir = join(repo, 'docs', 'platforms', 'facebook')
const factsPath = join(homedir(), '.logCli', 'rea', 'clientFacts.json')
const outDir = join(repo, 'vendor', 'fbk', 'data')

function familyOf(name: string): string | null {
  for (const domain of readdirSync(docsDir, { withFileTypes: true })) {
    if (!domain.isDirectory() || domain.name === 'flows') continue
    if (existsSync(join(docsDir, domain.name, `${name}.md`))) return domain.name
  }
  return null
}

function wireMap(): Record<string, { docId: string; kind: string; variables: unknown; family: string | null }> {
  if (!existsSync(factsPath)) return {}
  const facts = JSON.parse(readFileSync(factsPath, 'utf8')) as Record<string, { kind?: string; samples?: { sent?: { fb_api_req_friendly_name?: string; doc_id?: string; variables?: unknown } }[] }>
  const out: Record<string, { docId: string; kind: string; variables: unknown; family: string | null }> = {}
  for (const [name, entry] of Object.entries(facts)) {
    const sent = entry.samples?.find((s) => s.sent?.doc_id)?.sent
    if (!sent?.doc_id) continue
    const friendly = sent.fb_api_req_friendly_name || name
    out[friendly] = { docId: sent.doc_id, kind: entry.kind || (/Mutation$/.test(friendly) ? 'mutation' : 'query'), variables: sent.variables ?? null, family: familyOf(friendly) }
  }
  return out
}

function confirmingCalls(flow: { steps: { expect?: unknown; answers?: { call?: string }[] }[] }): string[] {
  const names = new Set<string>()
  for (const step of flow.steps) {
    if (typeof step.expect === 'string') names.add(step.expect)
    for (const a of step.answers ?? []) if (a.call) names.add(a.call)
  }
  return [...names].filter((n) => !n.startsWith('page '))
}

const wire = wireMap()
const registry: Record<string, string> = {}
const templates: Record<string, unknown> = {}
for (const [name, w] of Object.entries(wire)) {
  registry[name] = w.docId
  if (w.variables != null) templates[name] = { variables: w.variables }
}

const flowMap: Record<string, { operations: { friendlyName: string; docId: string | null; kind: string | null; family: string | null; hasVariables: boolean }[]; gaps: string[] }> = {}
for (const file of readdirSync(flowsDir).filter((f) => f.endsWith('.json'))) {
  const flow = JSON.parse(readFileSync(join(flowsDir, file), 'utf8')) as { name?: string; steps: { expect?: unknown; answers?: { call?: string }[] }[] }
  const calls = confirmingCalls(flow)
  const ops = calls.map((c) => {
    const w = wire[c]
    return { friendlyName: c, docId: w?.docId ?? null, kind: w?.kind ?? null, family: w?.family ?? null, hasVariables: Boolean(w && w.variables != null) }
  })
  flowMap[flow.name || file.replace('.json', '')] = { operations: ops, gaps: ops.filter((o) => !o.docId).map((o) => o.friendlyName) }
}

mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'logcliRegistry.json'), JSON.stringify(registry, null, 2) + '\n')
writeFileSync(join(outDir, 'logcliTemplates.json'), JSON.stringify(templates, null, 2) + '\n')
writeFileSync(join(outDir, 'logcliFlowMap.json'), JSON.stringify(flowMap, null, 2) + '\n')

const flows = Object.keys(flowMap).length
const mapped = Object.values(flowMap).reduce((n, f) => n + f.operations.filter((o) => o.docId).length, 0)
const gaps = Object.values(flowMap).reduce((n, f) => n + f.gaps.length, 0)
process.stderr.write(`flows ${flows} | wire operations ${Object.keys(registry).length} | flow ops mapped ${mapped} | gaps (need capture) ${gaps}\n`)
for (const [name, f] of Object.entries(flowMap)) {
  if (f.gaps.length) process.stderr.write(`  gap ${name}: ${f.gaps.join(', ')}\n`)
}
