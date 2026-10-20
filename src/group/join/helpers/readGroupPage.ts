import type { GroupPage, GroupStepReply } from '../types'

/** One element of a step's accessibility snapshot: its role, its name, its ref, how deep it sits. */
export interface SnapshotElement {
  role: string
  name: string
  /** True when the snapshot gave the name itself; false when it came from the element's own text below it. */
  named: boolean
  ref: string | null
  depth: number
}

const ELEMENT = /^(\s*)-\s+([a-z]+)(?:\s+"([^"]*)")?([^:]*?)(?::\s*(.*))?$/
const TEXT = /^(\s*)-\s+(?:generic|text|heading)(?:\s+\[[^\]]*\])*:\s*(.+)$/

/**
 * The snapshot's elements, each named. A button the snapshot leaves unnamed
 * takes the first text inside it: AdsPower's Chromium shows the group's Join
 * as `button [ref=e148]` with `generic [ref=e157]: Join Group` below it
 * (Bethlehem, 2026-10-20), where Camoufox showed `button "Join Group"`. Reads
 * the full `snapshot.yml` when the reply has it, else the reply's flat
 * `interactive` lines. Pure.
 */
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

/**
 * The gate, from the buttons the page showed. `Join Group` is the one
 * recorded (Bethlehem: Camoufox 2026-10-19, AdsPower 2026-10-20); "joined" and
 * "member" are what Listaro's group-outreach.ts reads as already in. Any other
 * page is `unknown`: the run stops there and the page's buttons stay in its
 * recording, to be read before a new name is added here (rule 29).
 */
const GATES: { gate: GroupPage['gate']; name: RegExp }[] = [
  { gate: 'joined', name: /^(Joined|Member)$/i },
  // A request already sent: Complainers of Bethlehem after Join (step 20), with "Your membership is pending".
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
