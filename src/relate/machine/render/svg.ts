import { MACHINE_FONT, MACHINE_SIZE, machineCss } from '../theme'
import { PLATFORM_MARKS } from '../types'
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

interface Chip {
  text: string
  w: number
  now: boolean
}

interface NodeShape {
  state: MachineState
  w: number
  h: number
  lead: number
  notes: string[]
  chipRows: Chip[][]
  explains: string[]
}

interface ActionShape {
  tool: string
  sub: string
  w: number
  h: number
}

interface PillShape {
  t: MachineTransition
  w: number
  h: number
  event: string
  eventW: number
  mark: number
  meta: string
  headerH: number
  action: ActionShape | null
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

const toneOf = (state: MachineState): string => state.tone ?? 'gray'

function nodeShape(state: MachineState): NodeShape {
  const dot = toneOf(state) === 'gray' ? 0 : S.toneDot + S.toneGap
  const lead = S.headerPadX + S.namePad + dot + (state.final ? S.finalSize + S.finalGap : 0)
  const titleW = lead + textWidth(state.label, F.title) + S.headerPadX + S.namePad
  const inner = S.nodeMaxWidth - 2 * S.bodyPadX
  const chips = chipsOf(state).map((c) => ({ ...c, w: textWidth(c.text, F.chip) + 2 * S.chipPadX }))
  const chipsW = chips.reduce((s, c) => s + c.w + S.chipGap, 0) - S.chipGap
  const notes = state.note ? wrapText(state.note, inner, F.body) : []
  const notesW = Math.max(0, ...notes.map((n) => textWidth(n, F.body)))
  const plain = Math.min(S.nodeMaxWidth, Math.max(S.nodeMinWidth, titleW, notesW + 2 * S.bodyPadX, Math.min(chipsW, inner) + 2 * S.bodyPadX))
  const explains = state.explain ? wrapText(state.explain, Math.min(inner, Math.max(S.explainMinWidth, plain - 2 * S.bodyPadX)), F.explain, F.explain.lines) : []
  const explainW = Math.max(0, ...explains.map((n) => textWidth(n, F.explain)))
  const w = Math.min(S.nodeMaxWidth, Math.max(plain, explainW + 2 * S.bodyPadX))
  const rows: Chip[][] = []
  let row: Chip[] = []
  let used = 0
  for (const c of chips) {
    if (row.length && used + c.w > w - 2 * S.bodyPadX) {
      rows.push(row)
      row = []
      used = 0
    }
    row.push(c)
    used += c.w + S.chipGap
  }
  if (row.length) rows.push(row)
  const chipsH = rows.length ? rows.length * (S.chipHeight + S.chipGap) - S.chipGap : 0
  const upper = notes.length * F.body.line + (notes.length && rows.length ? S.bodyGap : 0) + chipsH
  const content = upper + (explains.length ? (upper ? 2 * S.explainGap + S.explainRule : 0) + explains.length * F.explain.line : 0)
  const bodyH = content ? Math.ceil(2 * S.bodyPadY + content + S.border) : 0
  return { state, w: Math.ceil(w), h: S.headerH + bodyH, lead, notes, chipRows: rows, explains }
}

const markWidth = (platform: string | undefined): number => (platform && PLATFORM_MARKS[platform] ? textWidth(PLATFORM_MARKS[platform], F.mark) + 2 * S.markPadX : 0)

const pillInner = S.pillPadLeft + S.eventPad

function pillShape(t: MachineTransition): PillShape {
  const event = `${t.event}${typeof t.count === 'number' && t.count > 0 ? ` ×${t.count.toLocaleString('en-US')}` : ''}`
  const metaText = [t.at ? shortDate(t.at) : '', t.note ?? ''].filter(Boolean).join(' · ')
  const room = S.pillMaxWidth - 2 * pillInner
  const actionRoom = S.pillMaxWidth - S.effectsLeft - S.effectsRight - S.pillPadRight - 2 * S.border - 2 * S.actionPadX - S.actionSubIndent
  let action: ActionShape | null = null
  let mark = 0
  let meta = ''
  if (t.tool) {
    const sub = metaText ? (wrapText(metaText, actionRoom, F.action, 1)[0] ?? '') : ''
    const textW = Math.max(textWidth(t.tool, F.action), sub ? textWidth(sub, F.action) : 0)
    action = { tool: t.tool, sub, w: Math.ceil(2 * S.border + 2 * S.actionPadX + S.actionSubIndent + textW), h: 2 * S.border + 2 * S.actionPadY + F.action.box + (sub ? 2 * S.actionSubPadY + F.action.line : 0) }
  } else {
    mark = markWidth(t.platform)
    meta = metaText ? (wrapText(metaText, room, F.meta, 1)[0] ?? '') : ''
  }
  const eventW = textWidth(event, F.event)
  const headerW = 2 * pillInner + (mark ? mark + S.markGap : 0) + Math.max(eventW, meta ? textWidth(meta, F.meta) : 0)
  const headerH = Math.ceil(2 * S.pillHeaderPadY + F.event.box + (meta ? F.meta.line : 0))
  const w = Math.min(S.pillMaxWidth, Math.max(headerW, action ? S.effectsLeft + action.w + S.effectsRight + S.pillPadRight : 0))
  const h = headerH + (action ? S.effectsTop + action.h + S.effectsBottom : 0)
  return { t, w: Math.ceil(w), h, event, eventW, mark, meta, headerH, action }
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
    if (t.id === selected || t.from === selected || t.to === selected) {
      edges.add(t.id)
      nodes.add(t.from)
      nodes.add(t.to)
    }
  }
  return { nodes, edges }
}

const slugOf = (text: string): string => `rm${text.replace(/[^A-Za-z0-9]/g, '').slice(0, 24) || 'Machine'}`

const round = (n: number): number => Math.round(n * 10) / 10

const baselineIn = (top: number, box: number, size: number): number => round(top + (box + size * F.capRatio) / 2)

function chip(x: number, y: number, c: Chip): string {
  return `<g class="rmChip${c.now ? ' rmChipNow' : ''}"><rect class="rmChipBox" x="${x + 0.5}" y="${y + 0.5}" width="${c.w - 1}" height="${S.chipHeight - 1}" rx="${S.actionRadius}"/><text class="rmChipText" x="${x + S.chipPadX}" y="${baselineIn(y, S.chipHeight, F.chip.size)}">${escapeXml(c.text)}</text></g>`
}

function initialMarker(box: Box): string {
  const size = S.initialSize
  const mx = box.x - S.initialGap - size
  const my = box.y - S.initialLift
  const r = size / S.initialDotRatio
  const cx = mx + r
  const cy = my + r
  const tip = { x: box.x - S.initialGap, y: box.y + S.initialDrop }
  const base = tip.x - S.initialArrow
  const half = S.initialArrow / 2
  return `<circle class="rmInitial" cx="${cx}" cy="${cy}" r="${r}"/><path class="rmInitialPath" d="M${cx + 0.5} ${cy + r} Q${cx + 0.5} ${tip.y} ${cx + r} ${tip.y} L${base + 1} ${tip.y}"/><path class="rmInitial" d="M${tip.x} ${tip.y} L${base} ${tip.y - half} L${base} ${tip.y + half} Z"/>`
}

function boxPath(x: number, y: number, w: number, h: number, r: number, top: boolean, bottom: boolean): string {
  const t = top ? r : 0
  const b = bottom ? r : 0
  return `M${x + t} ${y} H${x + w - t} ${t ? `Q${x + w} ${y} ${x + w} ${y + t}` : ''} V${y + h - b} ${b ? `Q${x + w} ${y + h} ${x + w - b} ${y + h}` : ''} H${x + b} ${b ? `Q${x} ${y + h} ${x} ${y + h - b}` : ''} V${y + t} ${t ? `Q${x} ${y} ${x + t} ${y}` : ''} Z`.replace(/\s+/g, ' ')
}

function nodeSvg(shape: NodeShape, box: Box, near: boolean, slug: string): string {
  const st = shape.state
  const parts: string[] = []
  const tone = toneOf(st)
  const visited = st.visited !== false
  const cls = ['rmNode', `rmTone${tone[0].toUpperCase()}${tone.slice(1)}`, visited ? '' : 'rmUnvisited', st.current ? 'rmCurrent' : '', near ? 'rmNear' : ''].filter(Boolean).join(' ')
  parts.push(`<g class="${cls}" data-id="${escapeXml(st.id)}" tabindex="0" role="button" aria-label="${escapeXml(`${st.label}${st.current ? ', where it stands now' : ''}`)}">`)
  if (st.explain) parts.push(`<title>${escapeXml(`${st.label}: ${st.explain}`)}</title>`)
  if (st.initial) parts.push(initialMarker(box))
  const hasBody = box.h > S.headerH
  parts.push(`<rect class="rmNodeShadow" x="${box.x}" y="${box.y + 1}" width="${box.w}" height="${box.h}" rx="${S.radius}" filter="url(#${slug}NodeBlur)"/>`)
  parts.push(`<path class="rmNodeHeader" d="${boxPath(box.x, box.y, box.w, hasBody ? S.headerH : box.h, S.radius, true, !hasBody)}"/>`)
  if (hasBody) parts.push(`<path class="rmNodeBody" d="${boxPath(box.x, box.y + S.headerH, box.w, box.h - S.headerH, S.radius, false, true)}"/>`)
  parts.push(`<rect class="rmNodeBox" x="${box.x + S.border / 2}" y="${box.y + S.border / 2}" width="${box.w - S.border}" height="${box.h - S.border}" rx="${S.radius - S.border / 2}"/>`)
  const nameTop = box.y + S.border + S.headerPadY
  const mid = nameTop + F.title.box / 2
  let x = box.x + S.headerPadX + S.namePad
  if (tone !== 'gray') {
    parts.push(`<circle class="rmToneDot" cx="${x + S.toneDot / 2}" cy="${mid}" r="${S.toneDot / 2}"/>`)
    x += S.toneDot + S.toneGap
  }
  if (st.final) {
    const c = S.finalSize / 2
    parts.push(`<circle class="rmFinal" cx="${x + c}" cy="${mid}" r="${c - 0.75}"/><circle class="rmFinalDot" cx="${x + c}" cy="${mid}" r="${S.finalDot}"/>`)
  }
  parts.push(`<text class="rmTitle" x="${box.x + shape.lead}" y="${baselineIn(nameTop, F.title.box, F.title.size)}">${escapeXml(st.label)}</text>`)
  let top = box.y + S.headerH + S.bodyPadY
  const bx = box.x + S.bodyPadX
  for (const line of shape.notes) {
    parts.push(`<text class="rmNote" x="${bx}" y="${baselineIn(top, F.body.line, F.body.size)}">${escapeXml(line)}</text>`)
    top += F.body.line
  }
  if (shape.chipRows.length) {
    let y = top + (shape.notes.length ? S.bodyGap : 0)
    for (const row of shape.chipRows) {
      let cx = bx
      for (const c of row) {
        parts.push(chip(cx, y, c))
        cx += c.w + S.chipGap
      }
      y += S.chipHeight + S.chipGap
    }
    top = y - S.chipGap
  }
  if (shape.explains.length) {
    if (shape.notes.length || shape.chipRows.length) {
      const ruleY = top + S.explainGap + S.explainRule / 2
      parts.push(`<path class="rmExplainRule" d="M${box.x + S.border} ${ruleY} H${box.x + box.w - S.border}"/>`)
      top += 2 * S.explainGap + S.explainRule
    }
    for (const line of shape.explains) {
      parts.push(`<text class="rmExplain" x="${bx}" y="${baselineIn(top, F.explain.line, F.explain.size)}">${escapeXml(line)}</text>`)
      top += F.explain.line
    }
  }
  parts.push('</g>')
  return parts.join('')
}

function markSvg(platform: string, x: number, top: number, box: number, w: number): string {
  return `<g class="rmMark" data-platform="${escapeXml(platform)}"><rect class="rmMarkBox" x="${x}" y="${top + (box - S.markHeight) / 2}" width="${w}" height="${S.markHeight}" rx="${S.markRadius}"/><text class="rmMarkText" x="${x + w / 2}" y="${baselineIn(top, box, F.mark.size)}" text-anchor="middle">${escapeXml(PLATFORM_MARKS[platform])}</text></g>`
}

function pillSvg(pill: PillShape, label: Box, slug: string, index: number): string {
  const t = pill.t
  const x = label.x
  const y = label.y
  const w = label.w
  const h = label.h
  const rx = Math.min(S.pillRadius, h / 2)
  const grad = `${slug}Pill${index}`
  const parts: string[] = []
  parts.push(`<linearGradient id="${grad}" x1="0" y1="0" x2="0" y2="1"><stop class="rmPillStopA" offset="${round(Math.min(1, 16 / h) * 1000) / 1000}"/><stop class="rmPillStopB" offset="${round(Math.max(0, (h - 8) / h) * 1000) / 1000}"/><stop class="rmPillStopC" offset="1"/></linearGradient>`)
  parts.push(`<rect class="rmPillGlow" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" filter="url(#${slug}Blur)"/>`)
  parts.push(`<rect class="rmPillBlur" x="${x}" y="${y + 2}" width="${w}" height="${h}" rx="${rx}" filter="url(#${slug}Blur)"/>`)
  parts.push(`<rect class="rmPillDrop" x="${x}" y="${y + 1}" width="${w}" height="${h}" rx="${rx}"/>`)
  parts.push(`<rect class="rmMask rmPillBox" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`)
  parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${grad})"/>`)
  parts.push(`<rect class="rmPillRing" x="${x - 0.5}" y="${y - 0.5}" width="${w + 1}" height="${h + 1}" rx="${rx + 0.5}"/>`)
  parts.push(`<path class="rmPillInset" d="M${round(x + rx * 0.7)} ${y + 0.5} H${round(x + w - rx * 0.7)}"/>`)
  const top = y + S.pillHeaderPadY
  let tx = x + pillInner
  if (pill.mark) {
    parts.push(markSvg(t.platform!, tx, top, F.event.box, pill.mark))
    tx += pill.mark + S.markGap
  }
  parts.push(`<text class="rmPillText" x="${tx}" y="${baselineIn(top, F.event.box, F.event.size)}">${escapeXml(pill.event)}</text>`)
  if (pill.meta) parts.push(`<text class="rmPillMeta" x="${x + pillInner}" y="${baselineIn(top + F.event.box, F.meta.line, F.meta.size)}">${escapeXml(pill.meta)}</text>`)
  const a = pill.action
  if (a) {
    const ax = x + S.effectsLeft
    const ay = y + pill.headerH + S.effectsTop
    const aw = w - S.effectsLeft - S.effectsRight - S.pillPadRight
    parts.push(`<rect class="rmActionShadow" x="${ax}" y="${ay + 1.5}" width="${aw}" height="${a.h}" rx="${S.actionRadius}" filter="url(#${slug}Blur)"/>`)
    parts.push(`<rect class="rmActionBox" x="${ax + 0.5}" y="${ay + 0.5}" width="${aw - 1}" height="${a.h - 1}" rx="${S.actionRadius}"/>`)
    const cx = ax + S.border + S.actionPadX
    const lineTop = ay + S.border + S.actionPadY
    const mark = markWidth(t.platform)
    if (mark) parts.push(markSvg(t.platform!, cx + (S.actionIcon - mark) / 2, lineTop, F.action.box, mark))
    else {
      const iy = lineTop + F.action.box / 2
      parts.push(`<path class="rmActionIcon" d="M${cx + 4} ${iy - 4} L${cx + 8} ${iy} L${cx + 4} ${iy + 4} M${cx + 9} ${iy - 4} L${cx + 13} ${iy} L${cx + 9} ${iy + 4}"/>`)
    }
    parts.push(`<text class="rmPillTool" x="${cx + S.actionIcon + S.actionIconGap}" y="${baselineIn(lineTop, F.action.box, F.action.size)}">${escapeXml(a.tool)}</text>`)
    if (a.sub) parts.push(`<text class="rmPillSub" x="${cx + S.actionSubIndent}" y="${baselineIn(lineTop + F.action.box + S.actionSubPadY, F.action.line, F.action.size)}">${escapeXml(a.sub)}</text>`)
  }
  return parts.join('')
}

function edgeSvg(pill: PillShape, points: Point[], label: Box, near: boolean, slug: string, index: number): string {
  const t = pill.t
  const head = t.next ? 'rmArrowNext' : t.taken ? 'rmArrowTaken' : 'rmArrow'
  const end = points[points.length - 1]
  const before = points[points.length - 2] ?? end
  const len = Math.hypot(end.x - before.x, end.y - before.y) || 1
  const ux = (end.x - before.x) / len
  const uy = (end.y - before.y) / len
  const gap = Math.min(S.arrowGap, len / 2)
  const tip = { x: end.x - ux * gap, y: end.y - uy * gap }
  const cut = Math.min(gap + S.arrow - 1, len)
  const trimmed = [...points.slice(0, -1), { x: end.x - ux * cut, y: end.y - uy * cut }]
  const d = roundedPath(trimmed, S.corner)
  const cls = ['rmEdge', t.taken ? 'rmTaken' : '', t.next ? 'rmNext' : '', t.dashed ? 'rmDashed' : '', near ? 'rmNear' : ''].filter(Boolean).join(' ')
  return `<g class="${cls}" data-id="${escapeXml(t.id)}"><path class="rmEdgeHit" d="${d}"/><path class="rmEdgePath" d="${d}"/>${arrowHead(before, tip, head)}${pillSvg(pill, label, slug, index)}</g>`
}

function arrowHead(from: Point, tip: Point, cls: string): string {
  const len = Math.hypot(tip.x - from.x, tip.y - from.y) || 1
  const ux = (tip.x - from.x) / len
  const uy = (tip.y - from.y) / len
  const bx = tip.x - ux * S.arrow
  const by = tip.y - uy * S.arrow
  const half = S.arrowWidth / 2
  return `<path class="${cls}" d="M${round(tip.x)} ${round(tip.y)} L${round(bx - uy * half)} ${round(by + ux * half)} L${round(bx + uy * half)} ${round(by - ux * half)} Z"/>`
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
    block.states.map((s) => ({ id: s.id, w: shapes.get(s.id)!.w, h: shapes.get(s.id)!.h, initial: s.initial === true, final: s.final === true })),
    block.transitions.map((t) => ({ id: t.id, from: t.from, to: t.to, w: pills.get(t.id)!.w, h: pills.get(t.id)!.h })),
    direction,
    { nodeSep: S.nodeSep, dummySep: S.dummySep, rankGap: S.rankGap, laneGap: S.laneGap, laneStep: S.laneStep, margin: S.margin, port: S.port, corner: S.corner, stagger: S.stagger },
  )
  const near = nearOf(block, options.selected)
  const title = block.title ?? 'Relationship state machine'
  const head = [
    `<title id="${slug}Title">${escapeXml(title)}</title>`,
    `<desc id="${slug}Desc">${escapeXml(machineDescription(block))}</desc>`,
    `<defs><filter id="${slug}Blur" x="-0.2" y="-0.5" width="1.4" height="2"><feGaussianBlur stdDeviation="${S.shadowBlur}"/></filter><filter id="${slug}NodeBlur" x="-0.2" y="-0.5" width="1.4" height="2"><feGaussianBlur stdDeviation="${S.nodeShadowBlur}"/></filter>${options.standalone ? `<pattern id="${slug}Grid" width="${S.grid}" height="${S.grid}" patternUnits="userSpaceOnUse"><path class="rmGridLine" d="M${S.grid} 0 L0 0 0 ${S.grid}" fill="none"/></pattern>` : ''}</defs>`,
    ...(options.standalone ? [`<rect class="rmBg" width="100%" height="100%"/><rect width="100%" height="100%" fill="url(#${slug}Grid)"/>`] : []),
  ]
  const placedEdges = layout.edges.map((e, i) => edgeSvg(pills.get(e.id)!, e.points, e.label, near.edges.has(e.id), slug, i))
  const order = [...block.transitions].sort((a, b) => Number(Boolean(a.taken) || Boolean(a.next)) - Number(Boolean(b.taken) || Boolean(b.next)))
  const edgeIndex = new Map(layout.edges.map((e, i) => [e.id, i]))
  const edges = order.map((t) => placedEdges[edgeIndex.get(t.id)!]).filter(Boolean)
  const nodes = block.states.map((s) => nodeSvg(shapes.get(s.id)!, layout.nodes.get(s.id)!, near.nodes.has(s.id), slug))
  const style = options.standalone ? `<style>${machineCss()}</style>` : ''
  const rootClass = [options.standalone ? 'rmSvg rmMachine' : 'rmSvg', options.theme ?? ''].filter(Boolean).join(' ')
  const attrs = [`class="${rootClass}"`, `xmlns="http://www.w3.org/2000/svg"`, `viewBox="0 0 ${layout.width} ${layout.height}"`, `width="${layout.width}"`, `height="${layout.height}"`, `role="img"`, `aria-labelledby="${slug}Title ${slug}Desc"`, options.theme ? `data-theme="${options.theme}"` : '', options.standalone && options.selected ? `data-selected="${escapeXml(options.selected)}"` : ''].filter(Boolean).join(' ')
  const svg = `<svg ${attrs}>${head.join('')}${style}<g class="rmEdges">${edges.join('')}</g><g class="rmNodes">${nodes.join('')}</g></svg>`
  return { svg, width: layout.width, height: layout.height, layout }
}
