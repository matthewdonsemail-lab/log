import { MACHINE_TONES } from './types'
import type { MachineTone } from './types'

export const MACHINE_FONT = {
  sans: '"Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  title: { size: 16, line: 20, weight: 600, tracking: '-0.01em', charWidth: 0.6 },
  body: { size: 12, line: 16, weight: 400, charWidth: 0.56 },
  chip: { size: 11, line: 16, weight: 500, charWidth: 0.6 },
  pill: { size: 12, line: 16, weight: 600, charWidth: 0.6 },
  tool: { size: 11, line: 14, weight: 500, charWidth: 0.62 },
}

export const MACHINE_SIZE = {
  border: 2,
  radius: 6,
  pillRadius: 14,
  chipRadius: 4,
  grid: 12,
  padX: 12,
  padY: 8,
  gapY: 2,
  chipGap: 4,
  chipPadX: 6,
  chipHeight: 18,
  pillPadX: 10,
  pillPadY: 5,
  nodeMinWidth: 132,
  nodeMaxWidth: 264,
  pillMaxWidth: 200,
  nodeSep: 36,
  dummySep: 16,
  rankGap: 36,
  laneGap: 28,
  laneStep: 20,
  margin: 36,
  corner: 6,
  port: 10,
  edge: 2,
  edgeHit: 16,
  arrow: 5,
  ring: 4,
  ringGap: 3,
  initialDot: 4,
  panelWidth: 360,
  narrow: 720,
  dim: 0.5,
  hover: 0.8,
}

export const MACHINE_EDGE_STYLE = { dash: '6 4', nextDash: '6 4', drawMs: 900 }

const GRAY = { 25: '#f5f7f7', 50: '#eff1f3', 100: '#dfe3e7', 200: '#ced1da', 300: '#bdc2cc', 400: '#9da1b1', 500: '#72758b', 600: '#606478', 700: '#4d4f5f', 800: '#2e2f3c', 850: '#1f1f29', 875: '#1a1a23', 900: '#15151d' }

const STATELY_BLUE = { 400: '#63a3fc', 500: '#0f6ee5', 600: '#005cde' }

const ENTITY: Record<Exclude<MachineTone, 'gray'>, { fill: string; darkFill: string; border: string; darkBorder: string; edge: string; darkEdge: string; ink: string; darkInk: string }> = {
  blue: { fill: '#beeaf9', darkFill: '#123153', border: '#43abdf', darkBorder: '#20527f', edge: '#27699c', darkEdge: '#3178aa', ink: '#0b2a45', darkInk: '#beeaf9' },
  teal: { fill: '#c3eaee', darkFill: '#103348', border: '#48afc2', darkBorder: '#1c5572', edge: '#166d8b', darkEdge: '#227c93', ink: '#0a2c3a', darkInk: '#c3eaee' },
  green: { fill: '#c9edbc', darkFill: '#14371c', border: '#54b559', darkBorder: '#265a2f', edge: '#0f7528', darkEdge: '#29833b', ink: '#0c2e13', darkInk: '#c9edbc' },
  yellow: { fill: '#fde283', darkFill: '#432b00', border: '#da931e', darkBorder: '#714700', edge: '#905900', darkEdge: '#a06500', ink: '#3a2400', darkInk: '#fde283' },
  orange: { fill: '#ffdeae', darkFill: '#561e00', border: '#f18622', darkBorder: '#8a3500', edge: '#af4108', darkEdge: '#c14f0f', ink: '#451800', darkInk: '#ffdeae' },
  red: { fill: '#f8dcd8', darkFill: '#5d1219', border: '#f17f7b', darkBorder: '#982020', edge: '#bd2b29', darkEdge: '#d4332d', ink: '#4a0e13', darkInk: '#f8dcd8' },
  pink: { fill: '#fdd7fd', darkFill: '#5d0843', border: '#f571d3', darkBorder: '#95146b', edge: '#bd0c8b', darkEdge: '#cf249b', ink: '#4a0636', darkInk: '#fdd7fd' },
  purple: { fill: '#edddfb', darkFill: '#341c79', border: '#b092ee', darkBorder: '#5c31b9', edge: '#7245dc', darkEdge: '#8355e5', ink: '#2a1660', darkInk: '#edddfb' },
}

export const MACHINE_PALETTE = {
  light: {
    canvas: GRAY[50],
    grid: `color-mix(in srgb, ${GRAY[100]} 55%, ${GRAY[50]})`,
    floating: '#fdfdfe',
    raised: GRAY[100],
    border: GRAY[100],
    borderStrong: GRAY[200],
    fg: GRAY[900],
    fgMuted: GRAY[700],
    stateFill: GRAY[100],
    stateBorder: GRAY[500],
    edge: GRAY[500],
    edgeHover: GRAY[700],
    chip: GRAY[25],
    chipBorder: GRAY[200],
    selection: '#3178aa',
    runtime: STATELY_BLUE[600],
    primary: STATELY_BLUE[500],
    primaryText: STATELY_BLUE[600],
  },
  dark: {
    canvas: GRAY[900],
    grid: `color-mix(in srgb, ${GRAY[800]} 45%, ${GRAY[900]})`,
    floating: GRAY[850],
    raised: GRAY[800],
    border: '#ffffff1a',
    borderStrong: '#ffffff26',
    fg: GRAY[25],
    fgMuted: GRAY[400],
    stateFill: GRAY[800],
    stateBorder: GRAY[500],
    edge: GRAY[500],
    edgeHover: GRAY[400],
    chip: GRAY[850],
    chipBorder: GRAY[700],
    selection: '#3178aa',
    runtime: STATELY_BLUE[400],
    primary: STATELY_BLUE[500],
    primaryText: STATELY_BLUE[400],
  },
}

type Palette = typeof MACHINE_PALETTE.light

const cssName = (key: string): string => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

function vars(palette: Palette, dark: boolean): string {
  const base = Object.entries(palette).map(([k, v]) => `--rm-${cssName(k)}:${v};`)
  const tones = MACHINE_TONES.map((tone) => {
    if (tone === 'gray') return `--rm-gray-fill:${palette.stateFill};--rm-gray-border:${palette.stateBorder};--rm-gray-edge:${palette.edge};--rm-gray-ink:${palette.fg};`
    const e = ENTITY[tone]
    return `--rm-${tone}-fill:${dark ? e.darkFill : e.fill};--rm-${tone}-border:${dark ? e.darkBorder : e.border};--rm-${tone}-edge:${dark ? e.darkEdge : e.edge};--rm-${tone}-ink:${dark ? e.darkInk : e.ink};`
  })
  return [...base, ...tones, `color-scheme:${dark ? 'dark' : 'light'};`].join('')
}

const DARK_SELECTORS = [':root[data-theme="dark"] .rmMachine', '.dark .rmMachine', '.rmMachine[data-theme="dark"]']

export function machineCss(): string {
  const s = MACHINE_SIZE
  const f = MACHINE_FONT
  const light = vars(MACHINE_PALETTE.light, false)
  const dark = vars(MACHINE_PALETTE.dark, true)
  const toneRules = MACHINE_TONES.map((t) => `.rmMachine .rmTone${t[0].toUpperCase()}${t.slice(1)}{--rm-fill:var(--rm-${t}-fill);--rm-stroke:var(--rm-${t}-border);--rm-ink:var(--rm-${t}-ink);--rm-tone-edge:var(--rm-${t}-edge)}`).join('')
  return [
    `.rmMachine{${light}font-family:${f.sans};color:var(--rm-fg);background:var(--rm-canvas);border-radius:${s.radius + 2}px;overflow:hidden;position:relative;display:flex;min-height:120px}`,
    `@media (prefers-color-scheme: dark) {\n:root:not([data-theme="light"]) .rmMachine {${dark}}\n}`,
    `${DARK_SELECTORS.join(',')}{${dark}}`,
    `:root .rmMachine.rmMachine[data-theme="light"]{${light}}`,
    `.rmCanvas{flex:1;min-width:0;overflow:hidden;position:relative;background-color:var(--rm-canvas);background-image:linear-gradient(var(--rm-grid) 1px,transparent 1px),linear-gradient(90deg,var(--rm-grid) 1px,transparent 1px);background-size:${s.grid}px ${s.grid}px}`,
    `.rmCanvas svg{display:block;margin:0 auto;max-width:none}`,
    `.rmSvg{font-family:${f.sans}}`,
    `.rmGridLine{stroke:var(--rm-grid);stroke-width:1}`,
    `.rmBg{fill:var(--rm-canvas)}`,
    toneRules,
    `.rmNodeBox{fill:var(--rm-fill,var(--rm-state-fill));stroke:var(--rm-stroke,var(--rm-state-border));stroke-width:${s.border}}`,
    `.rmNodeMask{fill:var(--rm-canvas)}`,
    `.rmUnvisited .rmNodeBox{fill:var(--rm-state-fill);stroke:var(--rm-state-border)}`,
    `.rmUnvisited .rmTitle{fill:var(--rm-fg)}`,
    `.rmNode{cursor:pointer;transition:opacity .15s ease-out}`,
    `.rmTitle{fill:var(--rm-ink,var(--rm-fg));font-size:${f.title.size}px;font-weight:${f.title.weight};letter-spacing:${f.title.tracking}}`,
    `.rmNote{fill:var(--rm-fg-muted);font-size:${f.body.size}px;font-weight:${f.body.weight}}`,
    `.rmNode:not(.rmUnvisited) .rmNote{fill:var(--rm-ink);opacity:.82}`,
    `.rmChipBox{fill:var(--rm-chip);stroke:var(--rm-chip-border);stroke-width:1}`,
    `.rmChipText{fill:var(--rm-fg);font-size:${f.chip.size}px;font-weight:${f.chip.weight}}`,
    `.rmChipNow .rmChipBox{fill:var(--rm-runtime);stroke:var(--rm-runtime)}`,
    `.rmChipNow .rmChipText{fill:#fff}`,
    `.rmRing{fill:none;stroke:var(--rm-selection);stroke-width:${s.ring};opacity:.7}`,
    `.rmCurrent .rmNodeBox{stroke:var(--rm-runtime)}`,
    `.rmInitial{fill:var(--rm-state-border)}`,
    `.rmInitialPath{fill:none;stroke:var(--rm-state-border);stroke-width:${s.edge}}`,
    `.rmFinal{fill:none;stroke:var(--rm-ink,var(--rm-fg));stroke-width:2}`,
    `.rmFinalDot{fill:var(--rm-ink,var(--rm-fg))}`,
    `.rmEdgePath{fill:none;stroke:var(--rm-edge);stroke-width:${s.edge};stroke-linejoin:round;transition:stroke .15s ease-out}`,
    `.rmEdgeHit{fill:none;stroke:transparent;stroke-width:${s.edgeHit}}`,
    `.rmEdge:hover .rmEdgePath{stroke:var(--rm-edge-hover)}`,
    `.rmTaken .rmEdgePath{stroke:var(--rm-runtime)}`,
    `.rmNext .rmEdgePath{stroke:var(--rm-primary);stroke-dasharray:${MACHINE_EDGE_STYLE.nextDash};animation:rmDash ${MACHINE_EDGE_STYLE.drawMs}ms linear infinite}`,
    `.rmDashed .rmEdgePath{stroke-dasharray:${MACHINE_EDGE_STYLE.dash}}`,
    `@keyframes rmDash{to{stroke-dashoffset:-20}}`,
    `@media (prefers-reduced-motion: reduce){.rmNext .rmEdgePath{animation:none}}`,
    `.rmArrow{fill:var(--rm-edge)}`,
    `.rmArrowTaken{fill:var(--rm-runtime)}`,
    `.rmArrowNext{fill:var(--rm-primary)}`,
    `.rmPillBox{fill:var(--rm-state-fill);stroke:var(--rm-edge);stroke-width:${s.border}}`,
    `.rmTaken .rmPillBox{stroke:var(--rm-runtime)}`,
    `.rmNext .rmPillBox{stroke:var(--rm-primary);fill:var(--rm-floating)}`,
    `.rmPillText{fill:var(--rm-fg);font-size:${f.pill.size}px;font-weight:${f.pill.weight}}`,
    `.rmPillTool{fill:var(--rm-primary-text);font-family:${f.mono};font-size:${f.tool.size}px;font-weight:${f.tool.weight}}`,
    `.rmPillMeta{fill:var(--rm-fg-muted);font-size:${f.tool.size}px}`,
    `.rmMachine[data-selected] .rmNode,.rmMachine[data-selected] .rmEdge{opacity:${s.dim}}`,
    `.rmMachine[data-selected] .rmNear{opacity:1}`,
    `.rmNode:hover{opacity:${s.hover}}`,
    `.rmMachine[data-selected] .rmNear.rmNode:hover{opacity:1}`,
    `.rmNode:focus{outline:none}`,
    `.rmNode:focus-visible .rmNodeBox{stroke:var(--rm-selection)}`,
    `.rmPanel{width:${s.panelWidth}px;flex:none;background:var(--rm-floating);border-left:1px solid var(--rm-border);padding:16px;display:flex;flex-direction:column;gap:12px;font-size:13px}`,
    `.rmPanel h3{margin:0;font-size:14px;font-weight:600;color:var(--rm-fg)}`,
    `.rmPanelKind{font-size:11px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--rm-fg-muted)}`,
    `.rmField{display:flex;flex-direction:column;gap:4px}`,
    `.rmField label{font-size:12px;font-weight:500;color:var(--rm-fg-muted)}`,
    `.rmField div{border:1px solid var(--rm-border-strong);border-radius:${s.radius}px;padding:6px 8px;min-height:28px;background:var(--rm-canvas);color:var(--rm-fg);line-height:1.4}`,
    `.rmMoves{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}`,
    `.rmMoves li{border:1px solid var(--rm-border-strong);border-radius:${s.radius}px;padding:6px 8px;display:flex;flex-direction:column;gap:2px}`,
    `.rmMoves li[data-next="true"]{border:2px solid var(--rm-primary)}`,
    `.rmMoves code{font-family:${f.mono};font-size:11px;color:var(--rm-primary-text)}`,
    `.rmMoves small{color:var(--rm-fg-muted)}`,
    `.rmBar{position:absolute;left:12px;bottom:12px;display:flex;gap:4px;background:var(--rm-floating);border:1px solid var(--rm-border);border-radius:${s.radius + 2}px;padding:3px;font-size:12px}`,
    `.rmBar button{all:unset;cursor:pointer;padding:3px 8px;border-radius:${s.radius}px;color:var(--rm-fg)}`,
    `.rmBar button[aria-pressed="true"]{background:var(--rm-primary);color:#fff}`,
    `.rmCrumb{position:absolute;left:12px;top:12px;background:var(--rm-floating);border:1px solid var(--rm-border);border-radius:${s.radius}px;padding:3px 8px;font-size:13px;color:var(--rm-fg-muted)}`,
    `.rmCrumb b{color:var(--rm-fg);font-weight:500}`,
    `@media (max-width:${s.narrow}px){.rmMachine{flex-direction:column}.rmPanel{width:auto;border-left:0;border-top:1px solid var(--rm-border)}}`,
    `@media (forced-colors: active){.rmEdgePath{stroke:CanvasText}.rmNodeBox{stroke:CanvasText}}`,
  ].join('\n')
}
