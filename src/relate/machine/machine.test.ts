import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { openDatabase } from '../../storage/schema/index'
import { buildGraph } from '../graph/index'
import { checkReport, reportText } from '../../mcp/apps/report/index'
import { MACHINE_NOW, MACHINE_TARGET, seedMachineWorld } from './fixtures/machineWorld'
import { DISCORD_CHANNELS, DISCORD_PEOPLE, DISCORD_SERVER, seedDiscordWorld } from './fixtures/discordWorld'
import { drawMachine, LADDERS, machineText as machineTextOf, MACHINE_FONT, MACHINE_PALETTE, MACHINE_SIZE, machineCss, relateMachine, standingOf } from './index'
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
  test('walks one person through every state in the order the events happened, timestamped from log.db', async () => {
    const block = blockOf(await relateMachine({ person: 'ivy_ops' }, world, MACHINE_NOW))
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

  test('puts someone you wrote to who never answered at "you reached out", with their reply as the next move', async () => {
    const block = blockOf(await relateMachine({ person: '@nora_writes' }, world, MACHINE_NOW))
    expect(block.states.find((s) => s.current)?.id).toBe('reachedOut')
    expect(block.transitions.find((t) => t.next)).toMatchObject({ id: 'theyReplied', tool: 'twitterDms', note: 'waiting on them' })
  })

  test('names the owner\'s next move with its log tool: answer a DM left waiting, or DM someone who only engaged', async () => {
    expect(blockOf(await relateMachine({ person: 'tom_builds' }, world, MACHINE_NOW)).transitions.find((t) => t.next)).toMatchObject({ id: 'answer', tool: 'twitterDm', from: 'engaged', to: 'inConversation' })
    const linus = blockOf(await relateMachine({ person: 'linus_k' }, world, MACHINE_NOW))
    expect(linus.states.find((s) => s.current)?.id).toBe('engaged')
    expect(linus.transitions.find((t) => t.next)).toMatchObject({ id: 'dm', tool: 'twitterDm' })
  })

  test('reads the network map ring when log.db has no events for someone, and uses the platform for the tool', async () => {
    expect(standingOf(evidence({ ring: 3 })).stage).toBe('followsYou')
    expect(standingOf(evidence({ ring: 2 })).stage).toBe('nearYou')
    expect(standingOf(evidence({})).stage).toBe('new')
    expect(standingOf(evidence({ theyWroteAt: 5, youWroteAt: 3 })).steps.map((s) => s.event)).toEqual(['you DMed them', 'they replied'])
  })

  test('refuses with a code when nobody matches', async () => {
    expect(await relateMachine({ person: 'nobody_here_at_all' }, world, MACHINE_NOW)).toMatchObject({ ok: false, code: 'relateMachineNobody' })
  })
})

describe('the route to someone through people the owner knows', () => {
  test('goes through the connector the owner talks to who shares their circle and mentioned them, then the next one', async () => {
    const block = blockOf(await relateMachine({ to: MACHINE_TARGET }, world, MACHINE_NOW))
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
  test('counts everyone once per state and flags the ones gone quiet', async () => {
    const block = blockOf(await relateMachine({ view: 'network' }, world, MACHINE_NOW))
    const counts = Object.fromEntries(block.states.map((s) => [s.id, s.count]))
    expect(counts).toEqual({ new: 1, followsYou: 1, nearYou: 2, engaged: 4, reachedOut: 1, inConversation: 4 })
    expect(block.states.find((s) => s.id === 'reachedOut')?.chips).toEqual(['1 quiet 14d+', '@nora_writes'])
    expect(block.transitions.find((t) => t.id === 'theyReplied')?.count).toBe(1)
  })
})

describe('drawing the machine', () => {
  const parse = (svg: string) => new new JSDOM('').window.DOMParser().parseFromString(svg, 'image/svg+xml')

  test('makes valid, accessible SVG in both themes with every state and transition drawn', async () => {
    const block = blockOf(await relateMachine({ person: 'ivy_ops' }, world, MACHINE_NOW))
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

  test('keeps every transition orthogonal and every state box apart', async () => {
    const block = blockOf(await relateMachine({ view: 'network' }, world, MACHINE_NOW))
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

  test('ships both palettes as CSS variables that follow the host theme', async () => {
    const css = machineCss()
    expect(css).toContain(`--rm-canvas:${MACHINE_PALETTE.light.canvas}`)
    expect(css).toContain(`--rm-canvas:${MACHINE_PALETTE.dark.canvas}`)
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    expect(css).toContain(':root[data-theme="dark"] .rmMachine')
    expect(css).toContain('.dark .rmMachine')
    expect(css).toContain('.rmMachine.rmMachine.light')
    expect(drawMachine(blockOf(await relateMachine({ person: 'ivy_ops' }, world, MACHINE_NOW)), { standalone: true, theme: 'dark' }).svg).toContain('class="rmSvg rmMachine dark"')
  })

  test('draws with the stately measurements: dim, hit path, rounded corners, dashed guards, initial marker and pills', async () => {
    const css = machineCss()
    expect(MACHINE_SIZE).toMatchObject({ dim: 0.7, edgeHit: 20, corner: 8, initialSize: 24, initialGap: 3, border: 1, radius: 4, headerPadX: 12, headerPadY: 8, headerH: 42, bodyPadX: 16, bodyPadY: 12, pillRadius: 20, pillHeaderPadY: 8, pillPadLeft: 16, pillPadRight: 4, actionPadX: 8, actionPadY: 4, grid: 24, nodeSep: 48, rankGap: 40, arrow: 9, arrowWidth: 10 })
    expect(MACHINE_FONT.title).toMatchObject({ size: 15, line: 22.5, weight: 600, darkWeight: 500 })
    expect(MACHINE_FONT.body).toMatchObject({ size: 13, line: 19.5 })
    expect(MACHINE_FONT.event).toMatchObject({ size: 13, line: 19.5, weight: 600 })
    expect(MACHINE_FONT.action).toMatchObject({ size: 12, line: 18, weight: 500 })
    expect(css).toContain('opacity:0.7')
    expect(css).toContain('.rmEdgeHit{fill:none;stroke:transparent;stroke-width:20')
    expect(css).toContain('.rmDashed .rmEdgePath{stroke-dasharray:5 5;stroke-dashoffset:2.5}')
    const route = drawMachine(blockOf(await relateMachine({ to: MACHINE_TARGET }, world, MACHINE_NOW)), { standalone: true })
    expect(route.svg).toMatch(/class="rmEdgePath" d="[^"]*Q/)
    const ivy = blockOf(await relateMachine({ person: 'ivy_ops' }, world, MACHINE_NOW))
    const drawn = drawMachine(ivy, { direction: 'right' })
    const doc = parse(drawn.svg)
    expect(doc.querySelectorAll('.rmNodeBox').length).toBe(ivy.states.length)
    const first0 = ivy.states[0]
    const box0 = drawn.layout.nodes.get(first0.id)!
    if (!first0.chips?.length && !first0.current && !first0.at) expect(box0.h).toBe(MACHINE_SIZE.headerH + Math.ceil(2 * MACHINE_SIZE.bodyPadY + MACHINE_FONT.body.line + MACHINE_SIZE.border))
    const placed = ivy.states.map((st) => ({ st, box: drawn.layout.nodes.get(st.id)! }))
    const first = Math.min(...placed.map((n) => n.box.x))
    const last = Math.max(...placed.map((n) => n.box.x))
    for (const n of placed) if (n.st.initial) expect(n.box.x).toBe(first)
    for (const n of placed) if (n.st.final) expect(n.box.x).toBe(last)
    const initial = placed.find((n) => n.st.initial)
    if (initial) expect(drawn.svg).toContain(`<circle class="rmInitial" cx="${initial.box.x - MACHINE_SIZE.initialGap - MACHINE_SIZE.initialSize + MACHINE_SIZE.initialSize / MACHINE_SIZE.initialDotRatio}"`)
  })
})

describe('one person across platforms, and the platform filter', () => {
  const linkedWorld = (() => {
    const path = join(mkdtempSync(join(tmpdir(), 'relateMachineLinked-')), 'log.db')
    const db = openDatabase(path)
    seedMachineWorld(db)
    const at = new Date(MACHINE_NOW).toISOString()
    db.prepare('INSERT INTO persons (personId, name, createdAt, updatedAt) VALUES (?, ?, ?, ?)').run('personGrace', 'Grace', at, at)
    for (const [platform, userId] of [['twitter', '2000000002'], ['discord', '9000000002']]) db.prepare("INSERT INTO identityLinks (personId, platform, userId, evidence, linkedBy, linkedAt, linkedEventId) VALUES ('personGrace', ?, ?, NULL, 'owner', ?, ?)").run(platform, userId, at, `link${platform}`)
    buildGraph(path, new Date(MACHINE_NOW))
    return path
  })()

  test('computes a linked person from every linked account, tags each move with its platform and lists the accounts', async () => {
    const block = blockOf(await relateMachine({ person: 'grace_ships' }, linkedWorld, MACHINE_NOW))
    expect(block.accounts?.filter((a) => a.link === 'linked').map((a) => a.platform).sort()).toEqual(['discord', 'twitter'])
    const taken = block.transitions.filter((t) => t.taken)
    expect(taken.length).toBeGreaterThan(0)
    for (const t of taken) expect(['twitter', 'discord']).toContain(t.platform ?? '')
    expect(block.platforms?.map((p) => p.platform)).toEqual(['all', 'twitter', 'discord'])
    expect(machineTextOf(block)).toMatch(/Accounts: @grace_ships on (twitter|discord), @grace_ships on (twitter|discord)/)
    for (const t of taken) if (t.tool) expect(t.tool.startsWith(t.platform!)).toBe(true)
    expect(drawMachine(block, {}).svg).toContain('class="rmMark"')
  })

  test('shows a same-handle account that nobody linked as a suggested link and never merges it', async () => {
    const block = blockOf(await relateMachine({ person: 'grace_ships' }, world, MACHINE_NOW))
    expect(block.accounts?.length).toBe(2)
    const linked = block.accounts!.find((a) => a.link === 'linked')!
    const suggested = block.accounts!.find((a) => a.link === 'suggested')!
    expect(new Set([linked.platform, suggested.platform])).toEqual(new Set(['twitter', 'discord']))
    expect(block.platforms).toBeUndefined()
    expect(machineTextOf(block)).toContain(`Suggested link, not merged: @grace_ships on ${suggested.platform}`)
  })

  test('reads platform:handle as that platform and that handle, the way people show does, never as a person named after the platform', async () => {
    const path = join(mkdtempSync(join(tmpdir(), 'relateMachinePlatformHandle-')), 'log.db')
    const db = openDatabase(path)
    seedMachineWorld(db)
    const at = new Date(MACHINE_NOW).toISOString()
    db.prepare("INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES ('discord', '9000000099', 'Discord', 'Discord', ?, ?)").run(at, at)
    buildGraph(path, new Date(MACHINE_NOW))
    for (const platform of ['discord', 'twitter']) {
      const block = blockOf(await relateMachine({ person: `${platform}:grace_ships` }, path, MACHINE_NOW))
      expect(block.accounts?.find((a) => a.link === 'linked')).toEqual({ platform, handle: 'grace_ships', link: 'linked' })
      expect(machineTextOf(block)).not.toContain('@Discord')
    }
    expect(blockOf(await relateMachine({ person: 'discord:@grace_ships' }, path, MACHINE_NOW)).accounts?.find((a) => a.link === 'linked')?.platform).toBe('discord')
    const nobody = await relateMachine({ person: 'discord:ivy_ops' }, path, MACHINE_NOW)
    expect(nobody.ok ? null : nobody.code).toBe('relateMachineNobody')
  })

  test('filters the network by platform and keeps a count per platform', async () => {
    const all = blockOf(await relateMachine({ view: 'network' }, world, MACHINE_NOW))
    const views = new Map((all.platforms ?? []).map((v) => [v.platform, v]))
    expect([...views.keys()]).toEqual(['all', 'twitter', 'discord'])
    const sum = (v: { states: { count?: number }[] }) => v.states.reduce((n, st) => n + (st.count ?? 0), 0)
    expect(sum(views.get('twitter')!) + sum(views.get('discord')!)).toBe(views.get('twitter')!.count + views.get('discord')!.count)
    const discord = blockOf(await relateMachine({ view: 'network', platform: 'discord' }, world, MACHINE_NOW))
    expect(discord.platform).toBe('discord')
    expect(sum(discord)).toBe(views.get('discord')!.count)
    expect(checkReport({ title: 'Network', blocks: [all] }).ok).toBe(true)
  })
})

describe('the stateMachine block in a report', () => {
  test('is accepted as a report block, refuses a transition to a state that is not there, and reads as text', async () => {
    const block = blockOf(await relateMachine({ person: 'nora_writes' }, world, MACHINE_NOW))
    const checked = checkReport({ title: 'Nora', blocks: [block] })
    expect(checked.ok).toBe(true)
    const broken = checkReport({ title: 'Nora', blocks: [{ ...block, transitions: [{ id: 'x', from: 'new', to: 'nowhere', event: 'go' }] }] })
    expect(broken.ok).toBe(false)
    if (checked.ok) expect(reportText(checked.spec)).toContain('Next move: they replied with twitterDms')
  })
})

describe('each platform has its own states and moves', () => {
  const discordWorld = (linkX: boolean) => {
    const path = join(mkdtempSync(join(tmpdir(), 'relateMachineDiscord-')), 'log.db')
    seedDiscordWorld(openDatabase(path), linkX)
    buildGraph(path, new Date(MACHINE_NOW))
    return path
  }
  const plain = discordWorld(false)
  const linked = discordWorld(true)
  const discordIds = LADDERS.discord.states.map((s) => s.id)
  const xOnly = LADDERS.twitter.states.filter((s) => !discordIds.includes(s.id))
  const xOnlyWords = [...xOnly.map((s) => s.label), 'Talks to your followers', 'Follows you']
  const p = DISCORD_PEOPLE

  test('a Discord regular who shares a server and a channel, DMed the owner and got an answer walks the Discord states only, named after the real server and channel', async () => {
    const block = blockOf(await relateMachine({ person: `discord:${p.regular.handle}` }, plain, MACHINE_NOW))
    expect(block.states.map((s) => s.id)).toEqual(discordIds)
    for (const st of block.states) expect(xOnlyWords).not.toContain(st.label)
    for (const word of xOnlyWords) expect(machineTextOf(block)).not.toContain(word)
    expect(block.states.find((s) => s.current)?.id).toBe('inConversation')
    const state = (id: string) => block.states.find((s) => s.id === id)!
    expect(state('sharesServer').note).toContain(DISCORD_SERVER.name)
    expect(state('sameChannel').note).toContain(`#${DISCORD_CHANNELS.talk.name}`)
    expect(state('dmOpened').chips).toContain('opened by them')
    expect(state('mentioned').visited).toBe(false)
    expect(state('sameChannel').details?.find((d) => d.label === 'Could introduce')?.value).toContain(`@${p.introducer.handle}`)
    const taken = block.transitions.filter((t) => t.taken).sort((a, b) => (a.at ?? 0) - (b.at ?? 0))
    expect(taken.map((t) => [t.from, t.to])).toEqual([['new', 'sharesServer'], ['sharesServer', 'sameChannel'], ['sameChannel', 'dmOpened'], ['dmOpened', 'inConversation']])
    expect(taken.map((t) => t.note)).toEqual([`in ${DISCORD_SERVER.name}`, `you both write in #${DISCORD_CHANNELS.talk.name}`, 'they DMed you', 'you answered'])
    for (const t of block.transitions) if (t.tool) expect(t.tool.startsWith('discord')).toBe(true)
  })

  test('the next Discord move uses Discord tools: write in their channel, DM someone who replied in a channel, or wait on a DM the owner opened', async () => {
    const lurker = blockOf(await relateMachine({ person: `discord:${p.lurker.handle}` }, plain, MACHINE_NOW))
    expect(lurker.states.find((s) => s.current)?.id).toBe('sharesServer')
    expect(lurker.states.find((s) => s.id === 'sharesServer')?.note).toContain(DISCORD_SERVER.name)
    expect(lurker.transitions.find((t) => t.next)).toMatchObject({ id: 'write', tool: 'discordSend', to: 'sameChannel' })
    const replier = blockOf(await relateMachine({ person: `discord:${p.replier.handle}` }, plain, MACHINE_NOW))
    expect(replier.states.find((s) => s.current)?.id).toBe('mentioned')
    expect(replier.transitions.find((t) => t.taken && t.to === 'mentioned')?.note).toBe(`they replied to or mentioned you in #${DISCORD_CHANNELS.talk.name}`)
    expect(replier.transitions.find((t) => t.next)).toMatchObject({ id: 'dm', tool: 'discordSend' })
    const waiting = blockOf(await relateMachine({ person: `discord:${p.waiting.handle}` }, plain, MACHINE_NOW))
    expect(waiting.states.find((s) => s.current)).toMatchObject({ id: 'dmOpened', chips: ['opened by you'] })
    expect(waiting.transitions.find((t) => t.next)).toMatchObject({ id: 'theyReplied', tool: 'discordRead', note: 'waiting on them' })
  })

  test('every platform ladder keeps its states as data: a final conversation where DMs exist, and every tool belongs to its platform', () => {
    for (const [platform, ladder] of Object.entries(LADDERS)) {
      const ids = new Set(ladder.states.map((s) => s.id))
      for (const e of ladder.edges) expect(ids.has(e.from) && ids.has(e.to)).toBe(true)
      if (platform !== 'all') for (const tool of Object.values(ladder.tools)) expect(tool!.startsWith(platform)).toBe(true)
    }
    for (const platform of ['discord', 'instagram', 'slack', 'facebook'] as const) expect(LADDERS[platform].states.some((s) => s.signals.includes('follows'))).toBe(false)
    expect(LADDERS.twitter.states.some((s) => s.signals.includes('follows'))).toBe(true)
  })

  test('a linked person shows each platform as its own lane joined on the person, standing where they are furthest along', async () => {
    const block = blockOf(await relateMachine({ person: `discord:${p.regular.handle}` }, linked, MACHINE_NOW))
    expect(block.platforms?.map((v) => v.platform)).toEqual(['all', 'twitter', 'discord'])
    expect(block.states.filter((s) => s.initial).map((s) => s.id)).toEqual(['new'])
    const lane = (platform: string) => block.states.filter((s) => s.platform === platform).map((s) => s.id.slice(platform.length + 1))
    expect(lane('discord')).toEqual(discordIds.slice(1))
    expect(lane('twitter')).toEqual(LADDERS.twitter.states.slice(1).map((s) => s.id))
    expect(block.states.filter((s) => s.current).map((s) => s.id)).toEqual(['discord.inConversation'])
    expect(block.states.find((s) => s.id === 'twitter.engaged')?.chips?.[0]).toBe('here')
    for (const t of block.transitions) for (const id of [t.from, t.to]) if (id !== 'new') expect(id.startsWith(`${t.platform}.`)).toBe(true)
    for (const t of block.transitions) if (t.tool) expect(t.tool.startsWith(t.platform!)).toBe(true)
    expect(block.summary).toContain('furthest along on Discord')
    const discordOnly = block.platforms!.find((v) => v.platform === 'discord')!
    expect(discordOnly.states.map((s) => s.id)).toEqual(discordIds)
    expect(checkReport({ title: 'Linked', blocks: [block] }).ok).toBe(true)
    expect(drawMachine(block, {}).svg).toContain('class="rmMark"')
  })

  test('the Discord network counts people in the Discord states', async () => {
    const block = blockOf(await relateMachine({ view: 'network', platform: 'discord' }, plain, MACHINE_NOW))
    expect(block.states.map((s) => s.id)).toEqual(discordIds)
    expect(block.states.find((s) => s.id === 'mentioned')?.count).toBeGreaterThan(0)
  })

  test('a single person machine fits the width instead of one long row', async () => {
    const block = blockOf(await relateMachine({ person: `discord:${p.regular.handle}` }, plain, MACHINE_NOW))
    const wide = drawMachine(block, { direction: 'right' })
    const fit = drawMachine(block, { standalone: true })
    expect(fit.width).toBeLessThanOrEqual(Math.max(MACHINE_SIZE.fitWidth, Math.min(wide.width, MACHINE_SIZE.fitWidth)))
    expect(fit.width).toBeLessThan(wide.width)
    const linkedBlock = blockOf(await relateMachine({ person: `discord:${p.regular.handle}` }, linked, MACHINE_NOW))
    const linkedFit = drawMachine(linkedBlock, {})
    expect(linkedFit.width / linkedFit.height).toBeLessThan(drawMachine(linkedBlock, { direction: 'right' }).width / drawMachine(linkedBlock, { direction: 'right' }).height)
  })
})
