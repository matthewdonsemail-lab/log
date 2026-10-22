import type { GroupPage, GroupStepReply } from '../types'

export interface SnapshotElement {
  role: string
  name: string
  named: boolean
  ref: string | null
  depth: number
}

const ELEMENT = /^(\s*)-\s+([a-z]+)(?:\s+"([^"]*)")?([^:]*?)(?::\s*(.*))?$/
const TEXT = /^(\s*)-\s+(?:generic|text|heading)(?:\s+\[[^\]]*\])*:\s*(.+)$/

export function snapshotElements(reply: GroupStepReply): SnapshotElement[] {
  const lines = (reply.snapshot ?? (reply.interactive ?? []).join('\n')).split(/\r?\n/)
  const out: SnapshotElement[] = []
  lines.forEach((line, i) => {
    const match = ELEMENT.exec(line)
    if (!match || match[2] === 'generic' || match[2] === 'text') return
    const depth = match[1].length
    const ref = /\[ref=(e\d+)\]/.exec(match[4] ?? '')?.[1] ?? null
    let name = match[3] ?? ''
    const named = name !== ''
    if (!named && match[5]) name = match[5].trim()
    for (let j = i + 1; !name && j < lines.length; j++) {
      const indent = /^(\s*)/.exec(lines[j])![1].length
      if (indent <= depth) break
      const text = TEXT.exec(lines[j])
      if (text) name = text[2].trim()
    }
    out.push({ role: match[2], name, named, ref, depth })
  })
  return out
}

const GATES: { gate: GroupPage['gate']; name: RegExp }[] = [
  { gate: 'joined', name: /^(Joined|Member)$/i },
  { gate: 'pending', name: /^Cancel Request$/i },
  { gate: 'join', name: /^Join group$/i }
]

export function readGroupPage(reply: GroupStepReply): GroupPage {
  const url = reply.url ?? ''
  const elements = snapshotElements(reply)
  const buttons = elements.filter((e) => e.role === 'button')
  let gate: GroupPage['gate'] = 'unknown'
  let found: SnapshotElement | null = null
  for (const candidate of GATES) {
    found = buttons.find((b) => candidate.name.test(b.name)) ?? null
    if (found) {
      gate = candidate.gate
      break
    }
  }
  const members = elements.find((e) => e.role === 'link' && /^[\d.,]+[KM]? members?$/i.test(e.name))?.name ?? null
  const title = (reply.title ?? '').replace(/^\(\d+\)\s*/, '').replace(/\s*\|\s*Facebook$/, '').trim()
  return {
    gate,
    button: found?.name ?? null,
    buttonRef: found?.ref ?? null,
    buttonNamed: found?.named ?? false,
    panels: elements.some((e) => e.role === 'heading' && /^Related groups$/i.test(e.name)) ? ['relatedGroups'] : [],
    name: title || null,
    members,
    groupId: /\/groups\/(\d+)/.exec(url)?.[1] ?? null,
    url
  }
}
