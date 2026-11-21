import type { MachineDirection } from '../types'

export interface LayoutNode {
  id: string
  w: number
  h: number
  initial?: boolean
  final?: boolean
}

export interface LayoutEdge {
  id: string
  from: string
  to: string
  w: number
  h: number
}

export interface LayoutGaps {
  nodeSep: number
  dummySep: number
  rankGap: number
  laneGap: number
  laneStep: number
  margin: number
  port: number
  corner: number
  stagger: number
}

export interface Point {
  x: number
  y: number
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export interface PlacedEdge {
  id: string
  points: Point[]
  label: Box
  back: boolean
}

export interface MachineLayout {
  width: number
  height: number
  nodes: Map<string, Box>
  edges: PlacedEdge[]
}

interface Item {
  id: string
  kind: 'node' | 'label' | 'dummy'
  edge?: string
  sr: number
  sc: number
  layer: number
  order: number
  c: number
  r: number
}

interface Chain {
  edge: LayoutEdge
  items: Item[]
  back: boolean
}

function ranksOf(nodes: readonly LayoutNode[], edges: readonly LayoutEdge[]): { rank: Map<string, number>; back: Set<string> } {
  const index = new Map(nodes.map((n, i) => [n.id, i]))
  const out = new Map<string, LayoutEdge[]>(nodes.map((n) => [n.id, []]))
  for (const e of edges) if (index.has(e.from) && index.has(e.to)) out.get(e.from)!.push(e)
  const back = new Set<string>()
  const state = new Map<string, 'open' | 'done'>()
  const visit = (id: string): void => {
    state.set(id, 'open')
    for (const e of out.get(id)!) {
      const s = state.get(e.to)
      if (s === 'open' || e.to === id) back.add(e.id)
      else if (!s) visit(e.to)
    }
    state.set(id, 'done')
  }
  for (const n of nodes) if (!state.has(n.id)) visit(n.id)
  const rank = new Map(nodes.map((n) => [n.id, 0]))
  for (let pass = 0; pass < nodes.length; pass++) {
    let moved = false
    for (const e of edges) {
      if (back.has(e.id) || !index.has(e.from) || !index.has(e.to)) continue
      const want = rank.get(e.from)! + 1
      if (rank.get(e.to)! < want) {
        rank.set(e.to, want)
        moved = true
      }
    }
    if (!moved) break
  }
  for (const n of nodes) if (n.initial) rank.set(n.id, 0)
  const last = Math.max(0, ...nodes.filter((n) => !n.final).map((n) => rank.get(n.id)! + 1), ...nodes.map((n) => rank.get(n.id)!))
  for (const n of nodes) if (n.final && !n.initial) rank.set(n.id, last)
  return { rank, back }
}

function along(direction: MachineDirection, w: number, h: number): { sr: number; sc: number } {
  return direction === 'right' ? { sr: w, sc: h } : { sr: h, sc: w }
}

function toBox(direction: MachineDirection, r: number, c: number, sr: number, sc: number): Box {
  return direction === 'right' ? { x: r, y: c, w: sr, h: sc } : { x: c, y: r, w: sc, h: sr }
}

function toPoint(direction: MachineDirection, r: number, c: number): Point {
  return direction === 'right' ? { x: r, y: c } : { x: c, y: r }
}

function sweep(layers: Item[][], neighbours: Map<Item, Item[]>, downward: boolean): void {
  const order = downward ? layers.map((_, i) => i).slice(1) : layers.map((_, i) => i).reverse().slice(1)
  for (const l of order) {
    const layer = layers[l]
    const keyed = layer.map((item, i) => {
      const near = (neighbours.get(item) ?? []).filter((n) => n.layer === (downward ? l - 1 : l + 1))
      const bary = near.length ? near.reduce((s, n) => s + n.order, 0) / near.length : item.order
      return { item, bary, i }
    })
    keyed.sort((a, b) => a.bary - b.bary || a.i - b.i)
    keyed.forEach((k, i) => {
      k.item.order = i
    })
    layers[l] = keyed.map((k) => k.item)
  }
}

function place(layer: Item[], wanted: (item: Item) => number, gaps: LayoutGaps): void {
  const sepOf = (a: Item, b: Item) => (a.kind === 'node' && b.kind === 'node' ? gaps.nodeSep : gaps.dummySep)
  layer.forEach((item) => {
    item.c = wanted(item)
  })
  for (let i = 1; i < layer.length; i++) {
    const min = layer[i - 1].c + (layer[i - 1].sc + layer[i].sc) / 2 + sepOf(layer[i - 1], layer[i])
    if (layer[i].c < min) layer[i].c = min
  }
  for (let i = layer.length - 2; i >= 0; i--) {
    const max = layer[i + 1].c - (layer[i + 1].sc + layer[i].sc) / 2 - sepOf(layer[i], layer[i + 1])
    const want = wanted(layer[i])
    if (layer[i].c > max) layer[i].c = max
    else if (layer[i].c < want && want <= max) layer[i].c = want
  }
  for (let i = 1; i < layer.length; i++) {
    const min = layer[i - 1].c + (layer[i - 1].sc + layer[i].sc) / 2 + sepOf(layer[i - 1], layer[i])
    if (layer[i].c < min) layer[i].c = min
  }
}

function fanned(count: number, index: number, span: number, port: number): number {
  const usable = Math.max(0, span - 2 * port)
  return -span / 2 + port + (usable * (index + 1)) / (count + 1)
}

function snapPorts(node: Item, list: Chain[], toward: (c: Chain) => number, gaps: LayoutGaps): Map<string, number> {
  const out = new Map<string, number>()
  const low = node.c - node.sc / 2 + gaps.port
  const high = node.c + node.sc / 2 - gaps.port
  const wanted = list.map((ch) => Math.min(high, Math.max(low, toward(ch))))
  const apart = wanted.every((w, i) => i === 0 || w - wanted[i - 1] >= gaps.port)
  list.forEach((ch, i) => out.set(ch.edge.id, apart ? wanted[i] : node.c + fanned(list.length, i, node.sc, gaps.port)))
  return out
}

function orthogonal(points: Point[], direction: MachineDirection, firstShift = 0, lastShift = 0): Point[] {
  const out: Point[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const a = out[out.length - 1]
    const b = points[i]
    if (a.x === b.x || a.y === b.y) {
      out.push(b)
      continue
    }
    const shift = i === 1 ? firstShift : i === points.length - 1 ? lastShift : 0
    if (direction === 'right') {
      const mid = (a.x + b.x) / 2 + shift
      out.push({ x: mid, y: a.y }, { x: mid, y: b.y }, b)
    } else {
      const mid = (a.y + b.y) / 2 + shift
      out.push({ x: a.x, y: mid }, { x: b.x, y: mid }, b)
    }
  }
  return out.filter((p, i, all) => i === 0 || p.x !== all[i - 1].x || p.y !== all[i - 1].y)
}

function staggered(list: { id: string; port: number; toward: number }[], step: number, limit: number): Map<string, number> {
  const out = new Map<string, number>()
  const down = list.filter((e) => e.toward > e.port).sort((a, b) => b.port - a.port)
  const up = list.filter((e) => e.toward < e.port).sort((a, b) => a.port - b.port)
  for (const group of [down, up]) {
    const span = Math.min(limit, (step * (group.length - 1)) / 2)
    const gap = group.length > 1 ? (2 * span) / (group.length - 1) : 0
    group.forEach((e, i) => out.set(e.id, group.length > 1 ? -span + i * gap : 0))
  }
  return out
}

export function layoutMachine(nodes: readonly LayoutNode[], edges: readonly LayoutEdge[], direction: MachineDirection, gaps: LayoutGaps): MachineLayout {
  const { rank, back } = ranksOf(nodes, edges)
  const known = new Set(nodes.map((n) => n.id))
  const usable = edges.filter((e) => known.has(e.from) && known.has(e.to))
  const maxRank = Math.max(0, ...rank.values())
  const layers: Item[][] = Array.from({ length: maxRank * 2 + 1 }, () => [])
  const itemOf = new Map<string, Item>()
  nodes.forEach((n) => {
    const s = along(direction, n.w, n.h)
    const item: Item = { id: n.id, kind: 'node', sr: s.sr, sc: s.sc, layer: rank.get(n.id)! * 2, order: 0, c: 0, r: 0 }
    itemOf.set(n.id, item)
    layers[item.layer].push(item)
  })
  const neighbours = new Map<Item, Item[]>()
  const link = (a: Item, b: Item) => {
    neighbours.set(a, [...(neighbours.get(a) ?? []), b])
    neighbours.set(b, [...(neighbours.get(b) ?? []), a])
  }
  const chains: Chain[] = []
  for (const e of usable) {
    const from = itemOf.get(e.from)!
    const to = itemOf.get(e.to)!
    const isBack = back.has(e.id) || from.layer >= to.layer
    if (isBack) {
      chains.push({ edge: e, items: [from, to], back: true })
      continue
    }
    const span = (to.layer - from.layer) / 2
    const labelLayer = from.layer + 2 * Math.floor((span - 1) / 2) + 1
    const items: Item[] = [from]
    for (let l = from.layer + 1; l < to.layer; l++) {
      const s = l === labelLayer ? along(direction, e.w, e.h) : { sr: 0, sc: 0 }
      const item: Item = { id: `${e.id}@${l}`, kind: l === labelLayer ? 'label' : 'dummy', edge: e.id, sr: s.sr, sc: s.sc, layer: l, order: 0, c: 0, r: 0 }
      layers[l].push(item)
      items.push(item)
    }
    items.push(to)
    for (let i = 1; i < items.length; i++) link(items[i - 1], items[i])
    chains.push({ edge: e, items, back: false })
  }
  layers.forEach((layer) => layer.forEach((item, i) => (item.order = i)))
  for (let round = 0; round < 3; round++) {
    sweep(layers, neighbours, true)
    sweep(layers, neighbours, false)
  }
  const centre = (item: Item, layer: number) => {
    const near = (neighbours.get(item) ?? []).filter((n) => n.layer === layer)
    return near.length ? near.reduce((s, n) => s + n.c, 0) / near.length : null
  }
  layers.forEach((layer, l) => place(layer, (item) => (l === 0 ? item.order * (item.sc + gaps.nodeSep) : centre(item, l - 1) ?? item.c), gaps))
  for (let l = layers.length - 2; l >= 0; l--) place(layers[l], (item) => centre(item, l + 1) ?? item.c, gaps)
  for (let l = 1; l < layers.length; l++) place(layers[l], (item) => centre(item, l - 1) ?? item.c, gaps)
  let r = gaps.margin
  layers.forEach((layer, l) => {
    const thick = Math.max(0, ...layer.map((i) => i.sr))
    layer.forEach((item) => {
      item.r = r + (thick - item.sr) / 2
    })
    r += thick + (l < layers.length - 1 ? gaps.rankGap : 0)
  })
  const all = layers.flat()
  const minC = Math.min(...all.map((i) => i.c - i.sc / 2))
  all.forEach((i) => {
    i.c = i.c - minC + gaps.margin
  })
  let maxC = Math.max(...all.map((i) => i.c + i.sc / 2))
  const outgoing = new Map<string, Chain[]>()
  const incoming = new Map<string, Chain[]>()
  for (const ch of chains.filter((c) => !c.back)) {
    outgoing.set(ch.edge.from, [...(outgoing.get(ch.edge.from) ?? []), ch])
    incoming.set(ch.edge.to, [...(incoming.get(ch.edge.to) ?? []), ch])
  }
  const sortBy = (list: Chain[], at: (c: Chain) => Item) => list.sort((a, b) => at(a).c - at(b).c || a.edge.id.localeCompare(b.edge.id))
  const portOut = new Map<string, number>()
  const portIn = new Map<string, number>()
  for (const [id, list] of outgoing) {
    const node = itemOf.get(id)!
    snapPorts(node, sortBy(list, (c) => c.items[1]), (c) => c.items[1].c, gaps).forEach((at, id) => portOut.set(id, at))
  }
  for (const [id, list] of incoming) {
    const node = itemOf.get(id)!
    snapPorts(node, sortBy(list, (c) => c.items[c.items.length - 2]), (c) => c.items[c.items.length - 2].c, gaps).forEach((at, id) => portIn.set(id, at))
  }
  const firstShift = new Map<string, number>()
  const lastShift = new Map<string, number>()
  const limit = Math.max(0, gaps.rankGap / 2 - gaps.corner - 2)
  for (const list of outgoing.values()) staggered(list.map((c) => ({ id: c.edge.id, port: portOut.get(c.edge.id)!, toward: c.items[1].c })), gaps.stagger, limit).forEach((v, id) => firstShift.set(id, v))
  for (const list of incoming.values()) staggered(list.map((c) => ({ id: c.edge.id, port: portIn.get(c.edge.id)!, toward: c.items[c.items.length - 2].c })), gaps.stagger, limit).forEach((v, id) => lastShift.set(id, v))
  const placed: PlacedEdge[] = []
  for (const ch of chains.filter((c) => !c.back)) {
    const [from, ...rest] = ch.items
    const to = rest[rest.length - 1]
    const raw: Point[] = [toPoint(direction, from.r + from.sr, portOut.get(ch.edge.id)!)]
    let label: Box = toBox(direction, 0, 0, 0, 0)
    for (const item of rest.slice(0, -1)) {
      if (item.kind === 'label') {
        raw.push(toPoint(direction, item.r, item.c))
        label = toBox(direction, item.r, item.c - item.sc / 2, item.sr, item.sc)
        raw.push(toPoint(direction, item.r + item.sr, item.c))
      } else raw.push(toPoint(direction, item.r, item.c))
    }
    raw.push(toPoint(direction, to.r, portIn.get(ch.edge.id)!))
    placed.push({ id: ch.edge.id, points: orthogonal(raw, direction, firstShift.get(ch.edge.id) ?? 0, lastShift.get(ch.edge.id) ?? 0), label, back: false })
  }
  const backs = chains.filter((c) => c.back)
  backs.forEach((ch, i) => {
    const from = itemOf.get(ch.edge.from)!
    const to = itemOf.get(ch.edge.to)!
    const s = along(direction, ch.edge.w, ch.edge.h)
    const lane = maxC + gaps.laneGap + i * (s.sc + gaps.laneStep) + s.sc / 2
    const fromR = from.r + from.sr / 2 + (from === to ? -from.sr / 4 : 0)
    const toR = to.r + to.sr / 2 + (from === to ? from.sr / 4 : 0)
    const midR = (fromR + toR) / 2
    const points = [toPoint(direction, fromR, from.c + from.sc / 2), toPoint(direction, fromR, lane), toPoint(direction, toR, lane), toPoint(direction, toR, to.c + to.sc / 2)]
    placed.push({ id: ch.edge.id, points, label: toBox(direction, midR - s.sr / 2, lane - s.sc / 2, s.sr, s.sc), back: true })
  })
  if (backs.length) maxC += gaps.laneGap + backs.reduce((sum, ch) => sum + along(direction, ch.edge.w, ch.edge.h).sc + gaps.laneStep, 0)
  const extentR = r + gaps.margin
  const extentC = maxC + gaps.margin
  const boxes = new Map<string, Box>()
  for (const n of nodes) {
    const item = itemOf.get(n.id)!
    boxes.set(n.id, toBox(direction, item.r, item.c - item.sc / 2, item.sr, item.sc))
  }
  const order = new Map(edges.map((e, i) => [e.id, i]))
  placed.sort((a, b) => order.get(a.id)! - order.get(b.id)!)
  const size = toPoint(direction, extentR, extentC)
  return { width: Math.ceil(size.x), height: Math.ceil(size.y), nodes: boxes, edges: placed }
}
