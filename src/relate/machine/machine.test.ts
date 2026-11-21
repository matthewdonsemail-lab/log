import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDatabase } from '../../storage/schema/index'
import { buildGraph } from '../graph/index'
import { checkReport, reportText } from '../../mcp/apps/report/index'
import { MACHINE_NOW, MACHINE_TARGET, seedMachineWorld } from './fixtures/machineWorld'
import { drawMachine, MACHINE_PALETTE, machineCss, relateMachine, standingOf } from './index'
import type { MachineAnswer, StageEvidence, StateMachineBlock } from './index'

type XmlDoc = { getElementsByTagName: (n: string) => { length: number }; documentElement: { getAttribute: (n: string) => string | null; firstElementChild: { tagName: string } | null }; querySelectorAll: (s: string) => { length: number } }
const { JSDOM } = (await import('jsdom' as string)) as { JSDOM: new (html: string) => { window: { DOMParser: new () => { parseFromString: (text: string, type: string) => XmlDoc } } } }

const daysAgo = (d: number): number => MACHINE_NOW - d * 86_400_000

const world = (() => {
  const path = join(mkdtempSync(join(tmpdir(), 'relateMachine-')), 'log.db')
  seedMachineWorld(openDatabase(path))
  buildGraph(path, new Date(MACHINE_NOW))
  return path
})()

function blockOf(answer: MachineAnswer): StateMachineBlock {
  if (!answer.ok) throw new Error(`${answer.code}: ${answer.problem}`)
  return answer.block
}

const evidence = (over: Partial<StageEvidence>): StageEvidence => ({ key: 'twitter:1', personId: null, platform: 'twitter', handle: 'someone', name: null, ring: null, followedAt: null, follows: false, nearAt: null, near: [], engagedAt: null, engagedHow: null, theyWroteAt: null, youWroteAt: null, lastAt: null, ...over })

describe('where a relationship stands, from the fixture events', () => {
  test('walks one person through every state in the order the events happened, timestamped from log.db', () => {
    const block = blockOf(relateMachine({ person: 'ivy_ops' }, world, MACHINE_NOW))
    expect(block.view).toBe('person')
    expect(block.states.find((s) => s.current)?.id).toBe('inConversation')
    const taken = block.transitions.filter((t) => t.taken).sort((a, b) => (a.at ?? 0) - (b.at ?? 0))
    expect(taken.map((t) => [t.id, t.at, t.note])).toEqual([
      ['follow', daysAgo(20), 'they followed you'],
      ['like', daysAgo(15), 'in Agent Builders'],
      ['reply', daysAgo(10), 'they liked your post'],
      ['dm', daysAgo(5), 'you DMed them'],
      ['theyReplied', daysAgo(4), 'they replied'],
    ])
    expect(block.transitions.some((t) => t.next)).toBe(false)
  })

  test('puts someone you wrote to who never answered at "you reached out", with their reply as the next move', () => {
    const block = blockOf(relateMachine({ person: '@nora_writes' }, world, MACHINE_NOW))
    expect(block.states.find((s) => s.current)?.id).toBe('reachedOut')
    expect(block.transitions.find((t) => t.next)).toMatchObject({ id: 'theyReplied', tool: 'twitterDms', note: 'waiting on them' })
  })

  test('names the owner\'s next move with its log tool: answer a DM left waiting, or DM someone who only engaged', () => {
    expect(blockOf(relateMachine({ person: 'tom_builds' }, world, MACHINE_NOW)).transitions.find((t) => t.next)).toMatchObject({ id: 'answer', tool: 'twitterDm', from: 'engaged', to: 'inConversation' })
    const linus = blockOf(relateMachine({ person: 'linus_k' }, world, MACHINE_NOW))
    expect(linus.states.find((s) => s.current)?.id).toBe('engaged')
    expect(linus.transitions.find((t) => t.next)).toMatchObject({ id: 'dm', tool: 'twitterDm' })
  })

  test('reads the network map ring when log.db has no events for someone, and uses the platform for the tool', () => {
    expect(standingOf(evidence({ ring: 3 })).stage).toBe('followsYou')
    expect(standingOf(evidence({ ring: 2 })).stage).toBe('nearYou')
    expect(standingOf(evidence({})).stage).toBe('new')
    expect(standingOf(evidence({ theyWroteAt: 5, youWroteAt: 3 })).steps.map((s) => s.event)).toEqual(['you DMed them', 'they replied'])
  })

  test('refuses with a code when nobody matches', () => {
    expect(relateMachine({ person: 'nobody_here_at_all' }, world, MACHINE_NOW)).toMatchObject({ ok: false, code: 'relateMachineNobody' })
  })
})

describe('the route to someone through people the owner knows', () => {
  test('goes through the connector the owner talks to who shares their circle and mentioned them, then the next one', () => {
    const block = blockOf(relateMachine({ to: MACHINE_TARGET }, world, MACHINE_NOW))
    expect(block.view).toBe('route')
    expect(block.states.map((s) => s.label)).toEqual(['You', '@ada_codes', '@maya_ml', `@${MACHINE_TARGET}`])
    expect(block.states[0].current).toBe(true)
    expect(block.states[1]).toMatchObject({ note: 'In conversation' })
    expect(block.states[1].chips).toContain('mentioned them ×2')
    expect(block.transitions.find((t) => t.next)).toMatchObject({ id: 'ask1', from: 'you', to: 'via1', tool: 'twitterDm' })
    expect(block.transitions.find((t) => t.id === 'direct')).toMatchObject({ event: 'cold opener', dashed: true })
  })
})

describe('the whole network as the machine', () => {
  test('counts everyone once per state and flags the ones gone quiet', () => {
    const block = blockOf(relateMachine({ view: 'network' }, world, MACHINE_NOW))
    const counts = Object.fromEntries(block.states.map((s) => [s.id, s.count]))
    expect(counts).toEqual({ new: 1, followsYou: 1, nearYou: 2, engaged: 4, reachedOut: 1, inConversation: 4 })
    expect(block.states.find((s) => s.id === 'reachedOut')?.chips).toEqual(['1 quiet 14d+', '@nora_writes'])
    expect(block.transitions.find((t) => t.id === 'theyReplied')?.count).toBe(1)
  })
})

describe('drawing the machine', () => {
  const parse = (svg: string) => new new JSDOM('').window.DOMParser().parseFromString(svg, 'image/svg+xml')

  test('makes valid, accessible SVG in both themes with every state and transition drawn', () => {
    const block = blockOf(relateMachine({ person: 'ivy_ops' }, world, MACHINE_NOW))
    for (const theme of ['light', 'dark'] as const) {
      for (const direction of ['right', 'down'] as const) {
        const drawn = drawMachine(block, { standalone: true, theme, direction })
        const doc = parse(drawn.svg)
        expect(doc.getElementsByTagName('parsererror').length).toBe(0)
        const svg = doc.documentElement
        expect(drawn.svg).toContain(`data-theme="${theme}"`)
        expect(svg.getAttribute('role')).toBe('img')
        expect(svg.firstElementChild?.tagName).toBe('title')
        expect(doc.querySelectorAll('.rmNode').length).toBe(block.states.length)
        expect(doc.querySelectorAll('.rmEdge').length).toBe(block.transitions.length)
        expect(doc.querySelectorAll('.rmCurrent').length).toBe(1)
        expect(drawn.width).toBeGreaterThan(0)
      }
    }
  })

  test('keeps every transition orthogonal and every state box apart', () => {
    const block = blockOf(relateMachine({ view: 'network' }, world, MACHINE_NOW))
    const { layout } = drawMachine(block, { direction: 'right' })
    for (const e of layout.edges) for (let i = 1; i < e.points.length; i++) expect(e.points[i].x === e.points[i - 1].x || e.points[i].y === e.points[i - 1].y).toBe(true)
    const boxes = [...layout.nodes.values()]
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        expect(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y).toBe(true)
      }
  })

  test('ships both palettes as CSS variables that follow the host theme', () => {
    const css = machineCss()
    expect(css).toContain(`--rm-canvas:${MACHINE_PALETTE.light.canvas}`)
    expect(css).toContain(`--rm-canvas:${MACHINE_PALETTE.dark.canvas}`)
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    expect(css).toContain(':root[data-theme="dark"] .rmMachine')
  })
})

describe('the stateMachine block in a report', () => {
  test('is accepted as a report block, refuses a transition to a state that is not there, and reads as text', () => {
    const block = blockOf(relateMachine({ person: 'nora_writes' }, world, MACHINE_NOW))
    const checked = checkReport({ title: 'Nora', blocks: [block] })
    expect(checked.ok).toBe(true)
    const broken = checkReport({ title: 'Nora', blocks: [{ ...block, transitions: [{ id: 'x', from: 'new', to: 'nowhere', event: 'go' }] }] })
    expect(broken.ok).toBe(false)
    if (checked.ok) expect(reportText(checked.spec)).toContain('Next move: they replied with twitterDms')
  })
})
