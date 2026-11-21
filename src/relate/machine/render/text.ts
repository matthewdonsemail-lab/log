import type { StateMachineBlock } from '../types'

const when = (ms: number | null | undefined): string => (ms ? new Date(ms).toISOString().slice(0, 16).replace('T', ' ') : 'time unknown')

export function machineText(block: StateMachineBlock): string {
  const label = new Map(block.states.map((s) => [s.id, s.label]))
  const lines: string[] = []
  if (block.title) lines.push(`**${block.title}**`)
  if (block.summary) lines.push(block.summary)
  const linked = (block.accounts ?? []).filter((a) => a.link === 'linked')
  const suggested = (block.accounts ?? []).filter((a) => a.link === 'suggested')
  if (linked.length) lines.push(`Accounts: ${linked.map((a) => `@${a.handle.replace(/^@/, '')} on ${a.platform}`).join(', ')}`)
  if (suggested.length) lines.push(`Suggested link, not merged: ${suggested.map((a) => `@${a.handle.replace(/^@/, '')} on ${a.platform}`).join(', ')}`)
  if (block.platforms?.length) lines.push(`Platforms: ${block.platforms.map((p) => `${p.platform}${p.platform === (block.platform ?? 'all') ? ' (shown)' : ''} ${p.count}`).join(' · ')}`)
  const states = block.states.map((s) => `${s.current ? '▶ ' : ''}${s.label}${typeof s.count === 'number' ? ` (${s.count})` : ''}${s.chips?.length ? ` [${s.chips.join(', ')}]` : ''}${s.visited === false ? '' : s.at ? ` since ${when(s.at)}` : ''}`)
  lines.push(`States: ${states.join(' · ')}`)
  for (const s of block.states.filter((x) => x.explain)) lines.push(`- ${s.label}: ${s.explain}`)
  const taken = block.transitions.filter((t) => t.taken && t.at).sort((a, b) => (a.at ?? 0) - (b.at ?? 0))
  if (taken.length) {
    lines.push('Path taken:')
    taken.forEach((t, i) => lines.push(`${i + 1}. ${when(t.at)}: ${t.note ?? t.event}${t.platform && linked.length > 1 ? ` on ${t.platform}` : ''}, ${label.get(t.from)} → ${label.get(t.to)} (the move: ${t.event}${t.tool ? ` · ${t.tool}` : ''})`))
  }
  const counted = block.transitions.filter((t) => typeof t.count === 'number')
  if (counted.length) {
    lines.push('Transitions (people who took each):')
    for (const t of counted) lines.push(`- ${label.get(t.from)} → ${label.get(t.to)}: ${t.event} ×${t.count}${t.tool ? ` · ${t.tool}` : ''}`)
  }
  const plain = block.transitions.filter((t) => !t.taken && !t.next && typeof t.count !== 'number' && block.view === 'route')
  for (const t of plain) lines.push(`- ${label.get(t.from)} → ${label.get(t.to)}: ${t.event}${t.tool ? ` · ${t.tool}` : ''}${t.note ? ` · ${t.note}` : ''}`)
  const next = block.transitions.filter((t) => t.next)
  for (const t of next) lines.push(`Next move: ${t.event}${t.tool ? ` with ${t.tool}` : ''} (${label.get(t.from)} → ${label.get(t.to)})${t.note ? `, ${t.note}` : ''}`)
  return lines.join('\n')
}
