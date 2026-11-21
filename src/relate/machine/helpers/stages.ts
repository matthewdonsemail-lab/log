import { LADDERS, ladderOf, MACHINE_BLOCK, MACHINE_LIMITS, NETWORK_NAMES, PLATFORM_NAMES, RING_TIER, STUCK_AFTER_MS, TIERS } from '../types'
import type { EvidenceTime, Ladder, LadderState, MachineAccount, MachineDetail, MachineEdgeSpec, MachinePlatform, MachineState, MachineTransition, Move, PersonStanding, RoomFact, RouteLink, Signal, Stage, StageEvidence, StageStep, StateMachineBlock, Tier } from '../types'

type SignalStep = Omit<StageStep, 'stage' | 'tier'>

export const tierRank = (tier: Tier): number => TIERS.indexOf(tier)

const rankIn = (ladder: Ladder) => (stage: Stage): number => ladder.states.findIndex((s) => s.id === stage)

const stateIn = (ladder: Ladder, stage: Stage): LadderState | undefined => ladder.states.find((s) => s.id === stage)

export const toolFor = (platform: string, move: Move | undefined): string | undefined => (move ? ladderOf(platform).tools[move] : undefined)

export const whoOf = (e: Pick<StageEvidence, 'handle' | 'name' | 'key'>): string => (e.handle ? `@${e.handle}` : e.name ?? e.key)

const isoDay = (ms: number | null): string => (ms ? new Date(ms).toISOString().slice(0, 10) : 'unknown')

const nameOf = (platform: string): string => PLATFORM_NAMES[platform as MachinePlatform] ?? platform

const roomName = (r: RoomFact): string => (r.name ? (r.kind === 'channel' ? `#${r.name.replace(/^#/, '')}` : r.name) : 'a channel')

const earliest = <T extends { at: number | null }>(items: T[]): T | undefined => [...items].sort((a, b) => (a.at ?? Number.MAX_SAFE_INTEGER) - (b.at ?? Number.MAX_SAFE_INTEGER))[0]

const inServer = (r: RoomFact): boolean => Boolean(r.server) || r.kind === 'channel'

const both = (r: RoomFact): number | null => (r.ownerAt === null || r.theirAt === null ? null : Math.max(r.ownerAt, r.theirAt))

const listed = (names: string[]): string => [...new Set(names)].join(', ')

const hashed = (room: string): string => (room.startsWith('#') ? room : `#${room}`)

const SIGNAL_STEPS: Record<Signal, (e: StageEvidence) => SignalStep[]> = {
  follows: (e) => (e.follows ? [{ at: e.followedAt, event: 'they followed you', by: 'them' }] : []),
  near: (e) => (e.near.length ? [{ at: e.nearAt, event: `in ${e.near[0]}`, by: 'them', where: listed(e.near) }] : []),
  group: (e) => {
    const rooms = (e.rooms ?? []).filter((r) => !inServer(r))
    const first = earliest(rooms.map((r) => ({ at: r.theirAt, r })))
    return first ? [{ at: first.at, event: `in ${roomName(first.r)}`, by: 'them', where: listed(rooms.map(roomName)) }] : []
  },
  server: (e) => {
    const rooms = (e.rooms ?? []).filter(inServer)
    const first = earliest(rooms.map((r) => ({ at: r.theirAt, r })))
    if (!first) return []
    return [{ at: first.at, event: `in ${first.r.server ?? roomName(first.r)}`, by: 'them', where: listed(rooms.map((r) => r.server ?? roomName(r))) }]
  },
  channel: (e) => {
    const rooms = (e.rooms ?? []).filter((r) => both(r) !== null)
    const first = earliest(rooms.map((r) => ({ at: both(r), r })))
    if (!first) return []
    return [{ at: first.at, event: `you both write in ${roomName(first.r)}`, by: (first.r.ownerAt ?? 0) >= (first.r.theirAt ?? 0) ? 'you' : 'them', where: listed(rooms.map((r) => `${roomName(r)}${r.server ? ` in ${r.server}` : ''}`)) }]
  },
  pointed: (e) => (e.pointedAt != null ? [{ at: e.pointedAt, event: `${e.pointedBy === 'you' ? 'you replied to or mentioned them' : 'they replied to or mentioned you'}${e.pointedIn ? ` in ${hashed(e.pointedIn)}` : ''}`, by: e.pointedBy ?? 'them' }] : []),
  engaged: (e) => (e.engagedAt !== null || e.engagedHow ? [{ at: e.engagedAt, event: e.engagedHow ? `they ${e.engagedHow}` : 'they engaged', by: 'them' }] : []),
  theyWrote: (e) => (e.theyWroteAt !== null && (e.youWroteAt === null || e.theyWroteAt <= e.youWroteAt) ? [{ at: e.theyWroteAt, event: 'they DMed you', by: 'them', where: 'opened by them', chip: 'opened by them' }] : []),
  youWrote: (e) => (e.youWroteAt !== null && (e.theyWroteAt === null || e.youWroteAt < e.theyWroteAt) ? [{ at: e.youWroteAt, event: 'you DMed them', by: 'you', where: 'opened by you', chip: 'opened by you' }] : []),
  conversation: (e) => (e.theyWroteAt !== null && e.youWroteAt !== null ? [e.theyWroteAt <= e.youWroteAt ? { at: e.youWroteAt, event: 'you answered', by: 'you' } : { at: e.theyWroteAt, event: 'they replied', by: 'them' }] : []),
}

const SIGNAL_FIELD: Partial<Record<Signal, EvidenceTime>> = { follows: 'followedAt', near: 'nearAt', engaged: 'engagedAt', theyWrote: 'theyWroteAt', youWrote: 'youWroteAt' }

const hasSignal = (e: StageEvidence, signal: Signal): boolean => SIGNAL_STEPS[signal](e).length > 0

export function stepsOf(e: StageEvidence): StageStep[] {
  const ladder = ladderOf(e.platform)
  const rank = rankIn(ladder)
  const on = (field: EvidenceTime | null): string => (field ? e.from?.[field] : undefined) ?? e.platform
  const steps: StageStep[] = []
  for (const state of ladder.states) {
    for (const signal of state.signals) {
      for (const s of SIGNAL_STEPS[signal](e)) {
        const field = signal === 'conversation' ? (s.by === 'you' ? 'youWroteAt' : 'theyWroteAt') : SIGNAL_FIELD[signal] ?? null
        steps.push({ ...s, stage: state.id, tier: s.by === 'them' && state.theirTier ? state.theirTier : state.tier, platform: on(field) })
      }
    }
  }
  const ringTier = e.ring !== null ? RING_TIER[e.ring] : undefined
  const ringState = ringTier ? ladder.states.find((s) => s.tier === ringTier) : undefined
  const top = Math.max(0, ...steps.map((s) => tierRank(s.tier ?? 'new')))
  if (ringTier && ringState && tierRank(ringTier) > top) steps.push({ stage: ringState.id, tier: ringTier, at: null, event: `network map ring ${e.ring}`, by: 'them', platform: e.platform })
  return steps.sort((a, b) => (a.at ?? Number.MAX_SAFE_INTEGER) - (b.at ?? Number.MAX_SAFE_INTEGER) || rank(a.stage) - rank(b.stage))
}

export function standingOf(e: StageEvidence): PersonStanding {
  const rank = rankIn(ladderOf(e.platform))
  const steps = stepsOf(e)
  const last = steps.reduce<StageStep | null>((best, s) => (!best || rank(s.stage) > rank(best.stage) ? s : best), null)
  return { evidence: e, platform: e.platform, stage: last?.stage ?? 'new', tier: last?.tier ?? 'new', steps }
}

const ahead = (a: PersonStanding, b: PersonStanding): number => {
  const share = (s: PersonStanding) => rankIn(ladderOf(s.platform))(s.stage) / Math.max(1, ladderOf(s.platform).states.length - 1)
  return tierRank(b.tier) - tierRank(a.tier) || share(b) - share(a) || (b.evidence.lastAt ?? 0) - (a.evidence.lastAt ?? 0)
}

export function joinedStanding(lanes: readonly PersonStanding[]): PersonStanding {
  const sorted = [...lanes].sort(ahead)
  const lead = sorted[0]
  const steps = lanes.flatMap((l) => l.steps.map((s) => ({ ...s, stage: s.tier ?? 'new', platform: s.platform ?? l.platform }))).sort((a, b) => (a.at ?? Number.MAX_SAFE_INTEGER) - (b.at ?? Number.MAX_SAFE_INTEGER) || tierRank(a.stage as Tier) - tierRank(b.stage as Tier))
  return { evidence: lead.evidence, platform: 'all', stage: lead.tier, tier: lead.tier, steps, lanes: sorted }
}

interface Taken {
  from: Stage
  to: Stage
  step: StageStep
}

export function pathOf(steps: readonly StageStep[], ladder: Ladder = LADDERS.all): { taken: Taken[]; reached: Map<Stage, StageStep>; also: StageStep[] } {
  const rank = rankIn(ladder)
  let at: Stage = ladder.states[0].id
  const taken: Taken[] = []
  const reached = new Map<Stage, StageStep>()
  const also: StageStep[] = []
  for (const step of steps) {
    if (rank(step.stage) > rank(at)) {
      taken.push({ from: at, to: step.stage, step })
      at = step.stage
    } else also.push(step)
    if (!reached.has(step.stage)) reached.set(step.stage, step)
  }
  return { taken, reached, also }
}

function nextOf(standing: PersonStanding, ladder: Ladder): { edge: MachineEdgeSpec | null; dynamic: MachineTransition | null } {
  const stage = standing.stage
  const e = standing.evidence
  const rank = rankIn(ladder)
  if (rank(stage) < 0 || rank(stage) === ladder.states.length - 1) return { edge: null, dynamic: null }
  const fits = (x: MachineEdgeSpec) => x.from === stage && rank(x.to) > rank(stage) && (x.needs ?? []).every((s) => hasSignal(e, s)) && !(x.unless ?? []).some((s) => hasSignal(e, s))
  const open = ladder.edges.filter(fits)
  const mine = open.find((x) => x.by === 'you' && x.move && ladder.tools[x.move])
  const theirs = open.some((x) => x.by === 'you') ? undefined : open.find((x) => x.by === 'them')
  const edge = mine ?? theirs ?? null
  if (edge) return { edge, dynamic: null }
  const dm = ladder.tools.dm
  const target = ladder.states.find((s) => s.tier === 'reachedOut')
  return { edge: null, dynamic: dm && target && rank(target.id) > rank(stage) ? { id: 'dmNow', from: stage, to: target.id, event: 'DM', tool: dm, by: 'you', next: true } : null }
}

function baseTransition(spec: MachineEdgeSpec, ladder: Ladder): MachineTransition {
  const tool = spec.move ? ladder.tools[spec.move] : undefined
  return { id: spec.id, from: spec.from, to: spec.to, event: spec.event, ...(tool ? { tool } : {}), by: spec.by, ...(spec.note ? { note: spec.note } : {}) }
}

const clip = (text: string, n: number): string => (text.length > n ? `${text.slice(0, n - 1)}…` : text)

const explained = (text: string): string => clip(text, MACHINE_LIMITS.explain)

const either = (words: readonly string[]): string => (words.length > 1 ? `${words.slice(0, -1).join(', ')} or ${words[words.length - 1]}` : words[0] ?? '')

const moveOf = (t: MachineTransition): string => `${t.event}${t.tool ? ` with ${t.tool}` : ''}`

function personExplain(state: LadderState, ladder: Ladder, standing: PersonStanding, step: StageStep | undefined, next: MachineTransition | undefined, leadName: string | null): string {
  const rank = rankIn(ladder)
  if (state.id === standing.stage) {
    const why = step ? `since ${isoDay(step.at)}: ${step.event}` : 'because nothing has passed between you yet'
    const last = rank(state.id) === ladder.states.length - 1
    const move = next ? (next.by === 'them' ? `the next move is theirs: ${next.event}` : `the next move is yours: ${moveOf(next)}`) : last ? 'you are both writing, so keep the thread going' : leadName ? `the next move is on ${leadName}, where you are further along` : 'log has no move for this here yet'
    return explained(`You stand here ${why}; ${move}.`)
  }
  if (step) return explained(`Behind you: ${step.event} on ${isoDay(step.at)}.`)
  if (rank(state.id) === 0) return explained('Where every relationship starts.')
  const current = stateIn(ladder, standing.stage)
  if (rank(state.id) < rank(standing.stage)) return explained(`Skipped on the way to ${(current?.label ?? standing.stage).toLowerCase()}.`)
  return explained(`Ahead, reached by: ${either(ladder.edges.filter((x) => x.to === state.id).map((x) => x.event))}.`)
}

function ladderState(state: LadderState, ladder: Ladder, extra: Partial<MachineState> = {}): MachineState {
  const last = ladder.states[ladder.states.length - 1].id
  return { id: state.id, label: state.label, note: state.note, tone: state.tone, ...(state.id === ladder.states[0].id ? { initial: true } : {}), ...(state.id === last && ladder.states.length > 1 ? { final: true } : {}), ...extra }
}

interface Lane {
  states: MachineState[]
  transitions: MachineTransition[]
}

function laneOf(standing: PersonStanding, accounts: readonly MachineAccount[], leading: boolean, leadName: string | null = null): Lane {
  const e = standing.evidence
  const platform = standing.platform
  const ladder = ladderOf(platform)
  const { taken, reached, also } = pathOf(standing.steps, ladder)
  const transitions: MachineTransition[] = ladder.edges.map((spec) => baseTransition(spec, ladder))
  let extra = 0
  for (const t of taken) {
    const between = transitions.filter((x) => x.from === t.from && x.to === t.to)
    const base = between.find((x) => x.by === t.step.by) ?? between[0]
    const mark = { taken: true, at: t.step.at, by: t.step.by, note: t.step.event, ...(t.step.platform ? { platform: t.step.platform } : {}) }
    if (base) {
      if (base.by !== t.step.by) {
        base.event = stateIn(ladder, t.to)?.arrived ?? base.event
        delete base.tool
      }
      Object.assign(base, mark)
      if (t.step.platform && t.step.platform !== platform) {
        const stepTool = toolFor(t.step.platform, ladder.edges.find((x) => x.id === base.id)?.move)
        if (stepTool) base.tool = stepTool
        else delete base.tool
      }
    } else transitions.push({ id: `took${++extra}`, from: t.from, to: t.to, event: t.step.event, ...mark, note: undefined })
  }
  if (leading) {
    const next = nextOf(standing, ladder)
    if (next.edge) {
      const t = transitions.find((x) => x.id === next.edge!.id)
      if (t) {
        t.next = true
        if (next.edge.by === 'them') t.note = 'waiting on them'
      }
    }
    if (next.dynamic) transitions.push(next.dynamic)
  }
  const details = (state: LadderState): MachineDetail[] => {
    const out: MachineDetail[] = []
    const step = reached.get(state.id)
    if (step) out.push({ label: 'Reached', value: `${isoDay(step.at)}: ${step.event}` })
    for (const s of also.filter((a) => a.stage === state.id)) out.push({ label: 'Also', value: `${isoDay(s.at)}: ${s.event}` })
    if (step?.where) out.push({ label: 'Where', value: clip(step.where, MACHINE_LIMITS.note) })
    if (state.id === introAt && e.introducers?.length) out.push({ label: 'Could introduce', value: e.introducers.map((h) => `@${h}`).join(', ') })
    if (state.id === standing.stage) {
      out.push({ label: 'Who', value: `${whoOf(e)} on ${platform}${e.name && e.handle && e.name !== e.handle ? ` (${e.name})` : ''}` })
      const linked = accounts.filter((a) => a.link === 'linked')
      const suggested = accounts.filter((a) => a.link === 'suggested')
      if (linked.length > 1) out.push({ label: 'Linked accounts', value: clip(linked.map((a) => `@${a.handle} on ${a.platform}`).join(', '), MACHINE_LIMITS.note) })
      if (suggested.length) out.push({ label: 'Suggested link', value: clip(suggested.map((a) => `@${a.handle} on ${a.platform}`).join(', '), MACHINE_LIMITS.note) })
      if (e.ring !== null) out.push({ label: 'Network ring', value: String(e.ring) })
      if (e.lastAt) out.push({ label: 'Last activity', value: isoDay(e.lastAt) })
    }
    return out.slice(0, MACHINE_LIMITS.details)
  }
  const nextT = transitions.find((t) => t.next)
  const introAt = [...ladder.states].reverse().find((st) => st.tier === 'nearYou' && reached.has(st.id))?.id
  const states = ladder.states.map((state) => {
    const step = reached.get(state.id)
    const visited = state.id === ladder.states[0].id || Boolean(step)
    const intro = state.id === introAt && e.introducers?.length ? [clip(`intro: @${e.introducers[0]}`, 28)] : []
    const chips = [...(step?.chip ? [step.chip] : []), ...intro]
    return ladderState(state, ladder, { ...(step?.where ? { note: clip(step.where, MACHINE_LIMITS.note) } : {}), explain: personExplain(state, ladder, standing, step, nextT, leadName), visited, ...(step?.at ? { at: step.at } : {}), ...(state.id === standing.stage ? { current: true } : {}), ...(chips.length ? { chips: chips.slice(0, MACHINE_LIMITS.chips) } : {}), details: details(state) })
  })
  return { states, transitions }
}

const nextText = (t: MachineTransition | undefined): string => (t ? `; next: ${t.event}${t.tool ? ` (${t.tool})` : ''}` : '')

const through = (throughSeq: number | null): string => (throughSeq !== null ? `. Relate graph through event ${throughSeq}.` : '.')

function joinedLanes(lanes: { platform: string; lane: Lane; lead: boolean }[]): Lane {
  const start = LADDERS.all.states[0].id
  const states: MachineState[] = []
  const transitions: MachineTransition[] = []
  for (const { platform, lane, lead } of lanes) {
    const id = (s: string) => (s === start ? s : `${platform}.${s}`)
    for (const st of lane.states) {
      if (st.id === start) {
        if (!states.some((x) => x.id === start)) states.push({ id: st.id, label: st.label, note: st.note, explain: explained('Where every relationship starts; each platform below is its own lane.'), tone: st.tone, initial: true, visited: true })
        continue
      }
      const here = st.current && !lead
      states.push({ ...st, id: id(st.id), platform, current: lead && st.current ? true : undefined, ...(here ? { chips: ['here', ...(st.chips ?? [])].slice(0, MACHINE_LIMITS.chips) } : {}) })
    }
    for (const t of lane.transitions) transitions.push({ ...t, id: `${platform}.${t.id}`, from: id(t.from), to: id(t.to), platform: t.platform ?? platform })
  }
  const leadPlatform = lanes.find((l) => l.lead)?.platform ?? ''
  const kept = transitions.length > MACHINE_LIMITS.transitions ? transitions.filter((t) => t.taken || t.next || t.platform === leadPlatform) : transitions
  const shown = states.slice(0, MACHINE_LIMITS.states)
  const ids = new Set(shown.map((s) => s.id))
  return { states: shown, transitions: kept.filter((t) => ids.has(t.from) && ids.has(t.to)).slice(0, MACHINE_LIMITS.transitions) }
}

const labelOf = (s: PersonStanding): string => stateIn(ladderOf(s.platform), s.stage)?.label ?? s.stage

export function personBlock(standing: PersonStanding, throughSeq: number | null, accounts: readonly MachineAccount[] = []): StateMachineBlock {
  const lanes = standing.lanes ?? [standing]
  const lead = lanes[0]
  const e = lead.evidence
  const linkedCount = accounts.filter((a) => a.link === 'linked').length
  const steps = lanes.reduce((n, l) => n + l.steps.length, 0)
  const head = { type: MACHINE_BLOCK as typeof MACHINE_BLOCK, title: `Where you are with ${whoOf(e)}`, view: 'person' as const, ...(accounts.length ? { accounts: accounts.slice(0, MACHINE_LIMITS.accounts) } : {}) }
  if (lanes.length === 1) {
    const lane = laneOf(lead, accounts, true)
    const where = linkedCount > 1 ? `across ${linkedCount} linked accounts` : `on ${lead.platform}`
    const summary = `${whoOf(e)} ${where} stands at "${labelOf(lead)}"${steps ? ` after ${steps} step${steps === 1 ? '' : 's'}` : ''}${nextText(lane.transitions.find((t) => t.next))}${through(throughSeq)}`
    if (linkedCount < 2) for (const t of lane.transitions) delete t.platform
    return { ...head, summary, states: lane.states, transitions: lane.transitions.slice(0, MACHINE_LIMITS.transitions) }
  }
  const joined = joinedLanes(lanes.map((l, i) => ({ platform: l.platform, lane: laneOf(l, accounts, i === 0, i === 0 ? null : nameOf(lead.platform)), lead: i === 0 })))
  const others = lanes.slice(1).map((l) => `${nameOf(l.platform)} "${labelOf(l)}"`).join(', ')
  const summary = `${whoOf(e)} across ${lanes.length} platforms is furthest along on ${nameOf(lead.platform)}, at "${labelOf(lead)}"${others ? `; ${others}` : ''}${nextText(joined.transitions.find((t) => t.next))}${through(throughSeq)}`
  return { ...head, summary, states: joined.states, transitions: joined.transitions }
}

export function networkBlock(standings: readonly PersonStanding[], throughSeq: number | null, now: number = Date.now(), ladder: Ladder = LADDERS.all): StateMachineBlock {
  const ids = ladder.states.map((s) => s.id)
  const byStage = new Map<Stage, PersonStanding[]>(ids.map((s) => [s, []]))
  for (const s of standings) (byStage.get(s.stage) ?? byStage.get(ids[0])!).push(s)
  const edgeCount = new Map<string, number>()
  const extra = new Map<string, { from: Stage; to: Stage; count: number }>()
  for (const s of standings) {
    for (const t of pathOf(s.steps, ladder).taken) {
      const base = ladder.edges.find((x) => x.from === t.from && x.to === t.to)
      if (base) edgeCount.set(base.id, (edgeCount.get(base.id) ?? 0) + 1)
      else {
        const key = `${t.from}To${t.to[0].toUpperCase()}${t.to.slice(1)}`
        const held = extra.get(key) ?? { from: t.from, to: t.to, count: 0 }
        held.count += 1
        extra.set(key, held)
      }
    }
  }
  const transitions: MachineTransition[] = ladder.edges.map((spec) => ({ ...baseTransition(spec, ladder), count: edgeCount.get(spec.id) ?? 0, ...(edgeCount.get(spec.id) ? { taken: true } : {}) }))
  for (const [id, x] of extra) transitions.push({ id, from: x.from, to: x.to, event: stateIn(ladder, x.to)?.arrived ?? x.to, count: x.count, taken: true, by: 'them', dashed: true })
  const stuck = (people: PersonStanding[]) => people.filter((s) => s.evidence.lastAt !== null && now - s.evidence.lastAt > STUCK_AFTER_MS).length
  const states = ladder.states.map((state) => {
    const people = [...byStage.get(state.id)!].sort((a, b) => (b.evidence.lastAt ?? 0) - (a.evidence.lastAt ?? 0))
    const names = people.slice(0, NETWORK_NAMES).map((s) => clip(whoOf(s.evidence), 20))
    const quiet = state.id === ids[0] ? 0 : stuck(people)
    const chips = [...(quiet ? [`${quiet} quiet 14d+`] : []), ...names]
    const details: MachineDetail[] = [{ label: 'People here', value: String(people.length) }, ...(quiet ? [{ label: 'Quiet for 14 days or more', value: String(quiet) }] : []), ...people.slice(0, 8).map((s) => ({ label: whoOf(s.evidence), value: `${s.evidence.platform}, last ${isoDay(s.evidence.lastAt)}` }))]
    const onward = transitions.filter((t) => t.from === state.id).map((t) => t.event)
    const explain = explained(`${people.length.toLocaleString('en-US')} ${people.length === 1 ? 'person stands' : 'people stand'} here${quiet ? `, ${quiet} quiet for 14 days or more` : ''}${onward.length ? `; the way on: ${either(onward)}` : '; the end of the road: keep these conversations going'}.`)
    return ladderState(state, ladder, { count: people.length, visited: people.length > 0, explain, chips: chips.slice(0, MACHINE_LIMITS.chips), details: details.slice(0, MACHINE_LIMITS.details) })
  })
  const most = [...states].filter((s) => s.id !== ids[0]).sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0]
  const summary = `${standings.length.toLocaleString('en-US')} people across ${ids.length} states${most?.count ? `; most stand at "${most.label}" (${most.count})` : ''}${through(throughSeq)}`
  return { type: MACHINE_BLOCK, title: 'Your network as a state machine', view: 'network', summary, states, transitions: transitions.slice(0, MACHINE_LIMITS.transitions) }
}

const stageLabel = (platform: string, stage: Stage): string => stateIn(ladderOf(platform), stage)?.label ?? stage

export function routeBlock(owner: { label: string; note: string }, target: PersonStanding, links: readonly RouteLink[], throughSeq: number | null): StateMachineBlock {
  const t = target.evidence
  const best = links[0]
  const states: MachineState[] = [{ id: 'you', label: 'You', note: owner.note, explain: explained(best ? `You start here; the best move is to ask @${best.handle} for an intro.` : `You start here; nobody you know connects to ${whoOf(t)} yet, so reach out directly.`), tone: 'gray', initial: true, current: true, visited: true, details: [{ label: 'Accounts', value: owner.note }] }]
  const transitions: MachineTransition[] = []
  links.forEach((link, i) => {
    const id = `via${i + 1}`
    const standing = stageLabel(link.platform, link.stage)
    states.push({ id, label: clip(`@${link.handle}`, 28), note: standing, explain: explained(`${i === 0 ? 'Best connector' : 'Another connector'} (${standing.toLowerCase()}): ${link.reasons[0] ?? 'close to the target'}.`), tone: stateIn(ladderOf(link.platform), link.stage)?.tone ?? 'gray', visited: true, chips: link.reasons.slice(0, 2).map((r) => clip(r, 28)), ...(link.lastAt ? { at: link.lastAt } : {}), details: [{ label: 'With you', value: standing }, { label: 'Platform', value: link.platform }, ...link.reasons.map((r) => ({ label: 'Link to the target', value: r }))] })
    const dm = toolFor(link.platform, 'dm')
    transitions.push({ id: `ask${i + 1}`, from: 'you', to: id, event: 'ask for an intro', ...(dm ? { tool: dm } : {}), by: 'you', ...(i === 0 ? { next: true } : {}) })
    transitions.push({ id: `intro${i + 1}`, from: id, to: 'target', event: 'introduces you', by: 'them', note: clip(link.reasons[0] ?? '', 40), ...(i === 0 ? {} : { dashed: true }) })
  })
  const lead = target.lanes?.[0] ?? target
  const now = stageLabel(lead.platform, lead.stage)
  states.push({ id: 'target', label: clip(whoOf(t), 28), note: now, explain: explained(`Where they stand: ${now.toLowerCase()}; ${best ? `an intro from @${best.handle} is the warmest way in` : 'a direct message is the only way in so far'}.`), tone: 'purple', final: true, visited: true, ...(t.lastAt ? { at: t.lastAt } : {}), details: [{ label: 'With you now', value: now }, { label: 'Platform', value: t.platform }, ...(t.near.length ? [{ label: 'Shared', value: t.near.join(', ') }] : [])] })
  const early = tierRank(lead.tier) <= tierRank('followsYou')
  const direct = toolFor(t.platform, early && toolFor(t.platform, 'follow') ? 'follow' : 'dm')
  transitions.push({ id: 'direct', from: 'you', to: 'target', event: links.length ? 'cold opener' : 'reach out directly', ...(direct ? { tool: direct } : {}), by: 'you', dashed: links.length > 0, ...(links.length ? {} : { next: true }) })
  const summary = best ? `Best route to ${whoOf(t)}: ask @${best.handle} (${stageLabel(best.platform, best.stage).toLowerCase()} with you; ${best.reasons[0] ?? 'shares their circles'}) for an intro${links.length > 1 ? `, or ${links.slice(1).map((l) => `@${l.handle}`).join(', ')}` : ''}${through(throughSeq)}` : `No one you know connects to ${whoOf(t)} in the graph yet: reach out directly.`
  return { type: MACHINE_BLOCK, title: `How to reach ${whoOf(t)}`, view: 'route', summary, states, transitions }
}

export function rankLinks(candidates: readonly (RouteLink & { tier: Tier; rooms: number; circles: number; mentions: number; orbit: number })[], limit: number): RouteLink[] {
  const scored = candidates
    .filter((c) => tierRank(c.tier) >= tierRank('followsYou'))
    .map((c) => ({ ...c, score: tierRank(c.tier) * 10 + c.rooms * 3 + c.circles * 2 + c.mentions * 3 + c.orbit }))
    .sort((a, b) => b.score - a.score || (b.lastAt ?? 0) - (a.lastAt ?? 0) || a.handle.localeCompare(b.handle))
  return scored.slice(0, limit).map(({ key, handle, platform, stage, reasons, score, lastAt }) => ({ key, handle, platform, stage, reasons, score, lastAt }))
}
