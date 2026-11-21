import { MACHINE_FONT, MACHINE_SIZE, machineCss } from '../theme'
import type { MachineDirection, MachineState, MachineTransition, StateMachineBlock } from '../types'
import { layoutMachine } from './layout'
import type { Box, MachineLayout, Point } from './layout'

export interface MachineDrawOptions {
  selected?: string | null
  direction?: MachineDirection
  theme?: 'light' | 'dark' | null
  standalone?: boolean
  slug?: string
}

export interface MachineDrawing {
  svg: string
  width: number
  height: number
  layout: MachineLayout
}

interface TextRun {
  text: string
  cls: string
  size: number
  width: number
}

interface NodeShape {
  state: MachineState
  w: number
  h: number
  titleIndent: number
  notes: string[]
  chipRows: { text: string; w: number; now: boolean }[][]
}

interface PillShape {
  t: MachineTransition
  w: number
  h: number
  lines: TextRun[]
}

const S = MACHINE_SIZE
const F = MACHINE_FONT

export const escapeXml = (text: string): string => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export const textWidth = (text: string, font: { size: number; charWidth: number }): number => Math.ceil([...text].length * font.size * font.charWidth)

export function wrapText(text: string, max: number, font: { size: number; charWidth: number }, lines = 2): string[] {
  const words = text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
  const out: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (textWidth(next, font) <= max || !line) line = next
    else {
      out.push(line)
      line = word
    }
  }
  if (line) out.push(line)
  if (out.length <= lines) return out
  const kept = out.slice(0, lines)
  kept[lines - 1] = `${kept[lines - 1].replace(/\s*\S*$/, '')}…`
  return kept
}

export function shortDate(ms: number | null | undefined): string {
  if (!ms) return ''
  const d = new Date(ms)
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  return `${month} ${d.getUTCDate()}`
}

function chipsOf(state: MachineState): { text: string; now: boolean }[] {
  const chips: { text: string; now: boolean }[] = []
  if (state.current) chips.push({ text: 'now', now: true })
  if (typeof state.count === 'number') chips.push({ text: `${state.count.toLocaleString('en-US')} ${state.count === 1 ? 'person' : 'people'}`, now: false })
  if (state.at) chips.push({ text: shortDate(state.at), now: false })
  for (const c of state.chips ?? []) chips.push({ text: c, now: false })
  return chips
}

function nodeShape(state: MachineState): NodeShape {
  const titleIndent = state.final ? 18 : 0
  const titleW = textWidth(state.label, F.title) + titleIndent
  const inner = S.nodeMaxWidth - 2 * S.padX
  const chips = chipsOf(state).map((c) => ({ ...c, w: textWidth(c.text, F.chip) + 2 * S.chipPadX }))
  const chipsW = chips.reduce((s, c) => s + c.w + S.chipGap, 0) - S.chipGap
  const notes = state.note ? wrapText(state.note, Math.max(inner, Math.min(inner, titleW)), F.body) : []
  const notesW = Math.max(0, ...notes.map((n) => textWidth(n, F.body)))
  const w = Math.min(S.nodeMaxWidth, Math.max(S.nodeMinWidth, titleW + 2 * S.padX, notesW + 2 * S.padX, Math.min(chipsW, inner) + 2 * S.padX))
  const rows: { text: string; w: number; now: boolean }[][] = []
  let row: { text: string; w: number; now: boolean }[] = []
  let used = 0
  for (const c of chips) {
    if (row.length && used + c.w > w - 2 * S.padX) {
      rows.push(row)
      row = []
      used = 0
    }
    row.push(c)
    used += c.w + S.chipGap
  }
  if (row.length) rows.push(row)
  const h = S.padY + F.title.line + (notes.length ? S.gapY + notes.length * F.body.line : 0) + (rows.length ? S.chipGap * 2 + rows.length * (S.chipHeight + S.chipGap) - S.chipGap : 0) + S.padY
  return { state, w: Math.ceil(w / 2) * 2, h: Math.ceil(h / 2) * 2, titleIndent, notes, chipRows: rows }
}

function pillShape(t: MachineTransition): PillShape {
  const event = `${t.event}${typeof t.count === 'number' && t.count > 0 ? ` ×${t.count.toLocaleString('en-US')}` : ''}`
  const lines: TextRun[] = [{ text: event, cls: 'rmPillText', size: F.pill.size, width: textWidth(event, F.pill) }]
  if (t.tool) lines.push({ text: t.tool, cls: 'rmPillTool', size: F.tool.size, width: textWidth(t.tool, F.tool) })
  const meta = [t.at ? shortDate(t.at) : '', t.note ?? ''].filter(Boolean).join(' · ')
  if (meta) {
    const clipped = wrapText(meta, S.pillMaxWidth - 2 * S.pillPadX, F.tool, 1)[0] ?? ''
    lines.push({ text: clipped, cls: 'rmPillMeta', size: F.tool.size, width: textWidth(clipped, F.tool) })
  }
  const w = Math.min(S.pillMaxWidth, Math.max(...lines.map((l) => l.width)) + 2 * S.pillPadX)
  const h = 2 * S.pillPadY + lines.reduce((s, l, i) => s + (i === 0 ? F.pill.line : F.tool.line), 0)
  return { t, w: Math.ceil(w / 2) * 2, h: Math.ceil(h / 2) * 2, lines }
}

function roundedPath(points: Point[], r: number): string {
  if (points.length < 2) return ''
  const parts = [`M${points[0].x} ${points[0].y}`]
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i]
    const a = points[i - 1]
    const b = points[i + 1]
    const inLen = Math.hypot(p.x - a.x, p.y - a.y)
    const outLen = Math.hypot(b.x - p.x, b.y - p.y)
    const k = Math.min(r, inLen / 2, outLen / 2)
    const p1 = { x: p.x - ((p.x - a.x) / (inLen || 1)) * k, y: p.y - ((p.y - a.y) / (inLen || 1)) * k }
    const p2 = { x: p.x + ((b.x - p.x) / (outLen || 1)) * k, y: p.y + ((b.y - p.y) / (outLen || 1)) * k }
    parts.push(`L${p1.x} ${p1.y}`, `Q${p.x} ${p.y} ${p2.x} ${p2.y}`)
  }
  const last = points[points.length - 1]
  parts.push(`L${last.x} ${last.y}`)
  return parts.join(' ')
}

function nearOf(block: StateMachineBlock, selected: string | null | undefined): { nodes: Set<string>; edges: Set<string> } {
  const nodes = new Set<string>()
  const edges = new Set<string>()
  if (!selected) return { nodes, edges }
  nodes.add(selected)
  for (const t of block.transitions) {
    if (t.id === selected) {
      edges.add(t.id)
      nodes.add(t.from)
      nodes.add(t.to)
    } else if (t.from === selected || t.to === selected) {
      edges.add(t.id)
      nodes.add(t.from)
      nodes.add(t.to)
    }
  }
  return { nodes, edges }
}

const slugOf = (text: string): string => `rm${text.replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'Machine'}`

function chip(x: number, y: number, c: { text: string; w: number; now: boolean }): string {
  return `<g class="rmChip${c.now ? ' rmChipNow' : ''}"><rect class="rmChipBox" x="${x}" y="${y}" width="${c.w}" height="${S.chipHeight}" rx="${S.chipRadius}"/><text class="rmChipText" x="${x + S.chipPadX}" y="${y + S.chipHeight - 5}">${escapeXml(c.text)}</text></g>`
}

function nodeSvg(shape: NodeShape, box: Box, near: boolean): string {
  const st = shape.state
  const parts: string[] = []
  const tone = st.tone ?? 'gray'
  const visited = st.visited !== false
  const cls = ['rmNode', `rmTone${tone[0].toUpperCase()}${tone.slice(1)}`, visited ? '' : 'rmUnvisited', st.current ? 'rmCurrent' : '', near ? 'rmNear' : ''].filter(Boolean).join(' ')
  parts.push(`<g class="${cls}" data-id="${escapeXml(st.id)}" tabindex="0" role="button" aria-label="${escapeXml(`${st.label}${st.current ? ', where it stands now' : ''}`)}">`)
  if (st.current) {
    const o = S.ringGap + S.ring / 2
    parts.push(`<rect class="rmRing" x="${box.x - o}" y="${box.y - o}" width="${box.w + 2 * o}" height="${box.h + 2 * o}" rx="${S.radius + o}"/>`)
  }
  if (st.initial) {
    const dx = box.x - 14
    const dy = box.y - 8
    parts.push(`<circle class="rmInitial" cx="${dx}" cy="${dy}" r="${S.initialDot}"/><path class="rmInitialPath" d="M${dx} ${dy} V${box.y + 12} H${box.x - 8}"/>${arrowHead({ x: box.x - 12, y: box.y + 12 }, { x: box.x, y: box.y + 12 }, 'rmInitial')}`)
  }
  parts.push(`<rect class="rmNodeMask" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="${S.radius}"/>`)
  parts.push(`<rect class="rmNodeBox" x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="${S.radius}"/>`)
  let y = box.y + S.padY + F.title.size - 1
  const x = box.x + S.padX
  if (st.final) parts.push(`<circle class="rmFinal" cx="${x + 6}" cy="${y - 5}" r="6"/><circle class="rmFinalDot" cx="${x + 6}" cy="${y - 5}" r="3"/>`)
  parts.push(`<text class="rmTitle" x="${x + shape.titleIndent}" y="${y}">${escapeXml(st.label)}</text>`)
  y += F.title.line - F.title.size + 1
  if (shape.notes.length) {
    y += S.gapY
    for (const line of shape.notes) {
      y += F.body.line
      parts.push(`<text class="rmNote" x="${x}" y="${y - 4}">${escapeXml(line)}</text>`)
    }
  }
  if (shape.chipRows.length) {
    y += S.chipGap * 2
    for (const row of shape.chipRows) {
      let cx = x
      for (const c of row) {
        parts.push(chip(cx, y, c))
        cx += c.w + S.chipGap
      }
      y += S.chipHeight + S.chipGap
    }
  }
  parts.push('</g>')
  return parts.join('')
}

function edgeSvg(pill: PillShape, points: Point[], label: Box, near: boolean): string {
  const t = pill.t
  const head = t.next ? 'rmArrowNext' : t.taken ? 'rmArrowTaken' : 'rmArrow'
  const end = points[points.length - 1]
  const before = points[points.length - 2] ?? end
  const len = Math.hypot(end.x - before.x, end.y - before.y) || 1
  const cut = Math.min(S.arrow * S.edge - 2, len)
  const trimmed = [...points.slice(0, -1), { x: end.x - ((end.x - before.x) / len) * cut, y: end.y - ((end.y - before.y) / len) * cut }]
  const d = roundedPath(trimmed, S.corner)
  const cls = ['rmEdge', t.taken ? 'rmTaken' : '', t.next ? 'rmNext' : '', t.dashed ? 'rmDashed' : '', near ? 'rmNear' : ''].filter(Boolean).join(' ')
  const parts = [`<g class="${cls}" data-id="${escapeXml(t.id)}">`]
  parts.push(`<path class="rmEdgeHit" d="${d}"/><path class="rmEdgePath" d="${d}"/>${arrowHead(before, end, head)}`)
  const rx = Math.min(S.pillRadius, label.h / 2)
  parts.push(`<rect class="rmPillBox" x="${label.x}" y="${label.y}" width="${label.w}" height="${label.h}" rx="${rx}"/>`)
  let y = label.y + S.pillPadY
  pill.lines.forEach((line, i) => {
    const lh = i === 0 ? F.pill.line : F.tool.line
    y += lh
    parts.push(`<text class="${line.cls}" x="${label.x + label.w / 2}" y="${y - (lh - line.size) / 2 - 1}" text-anchor="middle">${escapeXml(line.text)}</text>`)
  })
  parts.push('</g>')
  return parts.join('')
}

function arrowHead(from: Point, tip: Point, cls: string): string {
  const len = Math.hypot(tip.x - from.x, tip.y - from.y) || 1
  const ux = (tip.x - from.x) / len
  const uy = (tip.y - from.y) / len
  const size = S.arrow * S.edge
  const bx = tip.x - ux * size
  const by = tip.y - uy * size
  const half = size / 2
  const r = (n: number) => Math.round(n * 10) / 10
  return `<path class="${cls}" d="M${r(tip.x)} ${r(tip.y)} L${r(bx - uy * half)} ${r(by + ux * half)} L${r(bx + uy * half)} ${r(by - ux * half)} Z"/>`
}

export function machineDescription(block: StateMachineBlock): string {
  const current = block.states.find((s) => s.current)
  const next = block.transitions.filter((t) => t.next)
  const taken = block.transitions.filter((t) => t.taken).length
  return [`A state machine of ${block.states.length} states and ${block.transitions.length} transitions`, current ? `; it stands at ${current.label}` : '', taken ? `, ${taken} transitions already taken` : '', next.length ? `; the next move is ${next.map((t) => `${t.event}${t.tool ? ` (${t.tool})` : ''}`).join(' or ')}` : '', '.'].join('')
}

export function drawMachine(block: StateMachineBlock, options: MachineDrawOptions = {}): MachineDrawing {
  const direction = options.direction ?? block.direction ?? 'right'
  const slug = options.slug ?? slugOf(block.title ?? block.view ?? 'machine')
  const shapes = new Map(block.states.map((s) => [s.id, nodeShape(s)]))
  const pills = new Map(block.transitions.map((t) => [t.id, pillShape(t)]))
  const layout = layoutMachine(
    block.states.map((s) => ({ id: s.id, w: shapes.get(s.id)!.w, h: shapes.get(s.id)!.h })),
    block.transitions.map((t) => ({ id: t.id, from: t.from, to: t.to, w: pills.get(t.id)!.w, h: pills.get(t.id)!.h })),
    direction,
    { nodeSep: S.nodeSep, dummySep: S.dummySep, rankGap: S.rankGap, laneGap: S.laneGap, laneStep: S.laneStep, margin: S.margin, port: S.port },
  )
  const near = nearOf(block, options.selected)
  const title = block.title ?? 'Relationship state machine'
  const head = [
    `<title id="${slug}Title">${escapeXml(title)}</title>`,
    `<desc id="${slug}Desc">${escapeXml(machineDescription(block))}</desc>`,
    ...(options.standalone ? [`<defs><pattern id="${slug}Grid" width="${S.grid}" height="${S.grid}" patternUnits="userSpaceOnUse"><path class="rmGridLine" d="M${S.grid} 0 H0 V${S.grid}" fill="none"/></pattern></defs>`, `<rect class="rmBg" width="100%" height="100%"/><rect width="100%" height="100%" fill="url(#${slug}Grid)"/>`] : []),
  ]
  const placedEdges = layout.edges.map((e) => edgeSvg(pills.get(e.id)!, e.points, e.label, near.edges.has(e.id)))
  const order = [...block.transitions].sort((a, b) => Number(Boolean(a.taken) || Boolean(a.next)) - Number(Boolean(b.taken) || Boolean(b.next)))
  const edgeIndex = new Map(layout.edges.map((e, i) => [e.id, i]))
  const edges = order.map((t) => placedEdges[edgeIndex.get(t.id)!]).filter(Boolean)
  const nodes = block.states.map((s) => nodeSvg(shapes.get(s.id)!, layout.nodes.get(s.id)!, near.nodes.has(s.id)))
  const style = options.standalone ? `<style>${machineCss()}</style>` : ''
  const rootClass = options.standalone ? 'rmSvg rmMachine' : 'rmSvg'
  const attrs = [`class="${rootClass}"`, `xmlns="http://www.w3.org/2000/svg"`, `viewBox="0 0 ${layout.width} ${layout.height}"`, `width="${layout.width}"`, `height="${layout.height}"`, `role="img"`, `aria-labelledby="${slug}Title ${slug}Desc"`, options.theme ? `data-theme="${options.theme}"` : '', options.standalone && options.selected ? `data-selected="${escapeXml(options.selected)}"` : ''].filter(Boolean).join(' ')
  const svg = `<svg ${attrs}>${head.join('')}${style}<g class="rmEdges">${edges.join('')}</g><g class="rmNodes">${nodes.join('')}</g></svg>`
  return { svg, width: layout.width, height: layout.height, layout }
}
