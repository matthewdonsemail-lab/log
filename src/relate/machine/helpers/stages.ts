import { MACHINE_BLOCK, MACHINE_EDGES, MACHINE_LIMITS, NETWORK_NAMES, PLATFORM_MOVES, RING_STAGE, STAGE_FACTS, STAGES, STUCK_AFTER_MS } from '../types'
import type { EvidenceTime, MachineAccount, MachineDetail, MachineEdgeSpec, MachineState, MachineTransition, Move, PersonStanding, RouteLink, Stage, StageEvidence, StageStep, StateMachineBlock } from '../types'

const rankOf = (stage: Stage): number => STAGES.indexOf(stage)

const ARRIVED: Record<Stage, string> = { new: 'met', followsYou: 'they followed', nearYou: 'joined your circles', engaged: 'they engaged', reachedOut: 'you DMed', inConversation: 'you both wrote' }

export const toolFor = (platform: string, move: Move): string | undefined => PLATFORM_MOVES[platform]?.[move]

export const whoOf = (e: Pick<StageEvidence, 'handle' | 'name' | 'key'>): string => (e.handle ? `@${e.handle}` : e.name ?? e.key)

const isoDay = (ms: number | null): string => (ms ? new Date(ms).toISOString().slice(0, 10) : 'unknown')

export function stepsOf(e: StageEvidence): StageStep[] {
  const on = (field: EvidenceTime): string => e.from?.[field] ?? e.platform
  const steps: StageStep[] = []
  if (e.follows) steps.push({ stage: 'followsYou', at: e.followedAt, event: 'they followed you', by: 'them', platform: on('followedAt') })
  if (e.near.length) steps.push({ stage: 'nearYou', at: e.nearAt, event: `in ${e.near[0]}`, by: 'them', platform: on('nearAt') })
  if (e.engagedAt !== null || e.engagedHow) steps.push({ stage: 'engaged', at: e.engagedAt, event: e.engagedHow ? `they ${e.engagedHow}` : 'they engaged', by: 'them', platform: on('engagedAt') })
  const they = e.theyWroteAt
  const you = e.youWroteAt
  if (they !== null && (you === null || they <= you)) steps.push({ stage: 'engaged', at: they, event: 'they DMed you', by: 'them', platform: on('theyWroteAt') })
  if (you !== null && (they === null || you < they)) steps.push({ stage: 'reachedOut', at: you, event: 'you DMed them', by: 'you', platform: on('youWroteAt') })
  if (they !== null && you !== null) steps.push(they <= you ? { stage: 'inConversation', at: you, event: 'you answered', by: 'you', platform: on('youWroteAt') } : { stage: 'inConversation', at: they, event: 'they replied', by: 'them', platform: on('theyWroteAt') })
  const ringStage = e.ring !== null ? RING_STAGE[e.ring] : undefined
  if (ringStage && ringStage !== 'new' && !steps.some((s) => s.stage === ringStage)) steps.push({ stage: ringStage, at: null, event: `network map ring ${e.ring}`, by: 'them', platform: e.platform })
  return steps.sort((a, b) => (a.at ?? Number.MAX_SAFE_INTEGER) - (b.at ?? Number.MAX_SAFE_INTEGER) || rankOf(a.stage) - rankOf(b.stage))
}

export function standingOf(e: StageEvidence): PersonStanding {
  const steps = stepsOf(e)
  const stage = steps.reduce<Stage>((best, s) => (rankOf(s.stage) > rankOf(best) ? s.stage : best), 'new')
  return { evidence: e, stage, steps }
}

interface Taken {
  from: Stage
  to: Stage
  step: StageStep
}

export function pathOf(steps: readonly StageStep[]): { taken: Taken[]; reached: Map<Stage, StageStep>; also: StageStep[] } {
  let at: Stage = 'new'
  const taken: Taken[] = []
  const reached = new Map<Stage, StageStep>()
  const also: StageStep[] = []
  for (const step of steps) {
    if (rankOf(step.stage) > rankOf(at)) {
      taken.push({ from: at, to: step.stage, step })
      at = step.stage
    } else also.push(step)
    if (!reached.has(step.stage)) reached.set(step.stage, step)
  }
  return { taken, reached, also }
}

function nextOf(standing: PersonStanding, platform: string): { edge: MachineEdgeSpec | null; dynamic: MachineTransition | null } {
  const stage = standing.stage
  const e = standing.evidence
  if (stage === 'inConversation') return { edge: null, dynamic: null }
  if (stage === 'reachedOut') return { edge: MACHINE_EDGES.find((x) => x.id === 'theyReplied')!, dynamic: null }
  if (stage === 'engaged') return { edge: MACHINE_EDGES.find((x) => x.id === (e.theyWroteAt !== null && e.youWroteAt === null ? 'answer' : 'dm'))!, dynamic: null }
  const mine = MACHINE_EDGES.find((x) => x.from === stage && x.by === 'you' && toolFor(platform, x.move))
  if (mine) return { edge: mine, dynamic: null }
  const dm = toolFor(platform, 'dm')
  return { edge: null, dynamic: dm ? { id: 'dmNow', from: stage, to: 'reachedOut', event: 'DM', tool: dm, by: 'you', next: true } : null }
}

function baseTransition(spec: MachineEdgeSpec, platform: string): MachineTransition {
  const tool = toolFor(platform, spec.move)
  return { id: spec.id, from: spec.from, to: spec.to, event: spec.event, ...(tool ? { tool } : {}), by: spec.by, ...(spec.id === 'intro' ? { note: 'through a connector' } : {}) }
}

const clip = (text: string, n: number): string => (text.length > n ? `${text.slice(0, n - 1)}…` : text)

const explained = (text: string): string => clip(text, MACHINE_LIMITS.explain)

const either = (words: readonly string[]): string => (words.length > 1 ? `${words.slice(0, -1).join(', ')} or ${words[words.length - 1]}` : words[0] ?? '')

const moveOf = (t: MachineTransition): string => `${t.event}${t.tool ? ` with ${t.tool}` : ''}`

function personExplain(stage: Stage, standing: PersonStanding, step: StageStep | undefined, next: MachineTransition | undefined): string {
  if (stage === standing.stage) {
    const why = step ? `since ${isoDay(step.at)}: ${step.event}` : 'because nothing has passed between you yet'
    const move = next ? (next.by === 'them' ? `the next move is theirs: ${next.event}` : `the next move is yours: ${moveOf(next)}`) : 'you are both writing, so keep the thread going'
    return explained(`You stand here ${why}; ${move}.`)
  }
  if (step) return explained(`Behind you: ${step.event} on ${isoDay(step.at)}.`)
  if (stage === 'new') return explained('Where every relationship starts.')
  if (rankOf(stage) < rankOf(standing.stage)) return explained(`Skipped on the way to ${STAGE_FACTS[standing.stage].label.toLowerCase()}.`)
  return explained(`Ahead, reached by: ${either(MACHINE_EDGES.filter((x) => x.to === stage).map((x) => x.event))}.`)
}

function stageState(stage: Stage, extra: Partial<MachineState> = {}): MachineState {
  const facts = STAGE_FACTS[stage]
  return { id: stage, label: facts.label, note: facts.note, tone: facts.tone, ...(stage === 'new' ? { initial: true } : {}), ...(stage === 'inConversation' ? { final: true } : {}), ...extra }
}

export function personBlock(standing: PersonStanding, throughSeq: number | null, accounts: readonly MachineAccount[] = []): StateMachineBlock {
  const e = standing.evidence
  const platform = e.platform
  const { taken, reached, also } = pathOf(standing.steps)
  const transitions: MachineTransition[] = MACHINE_EDGES.map((spec) => baseTransition(spec, platform))
  let extra = 0
  for (const t of taken) {
    const base = transitions.find((x) => x.from === t.from && x.to === t.to)
    const mark = { taken: true, at: t.step.at, by: t.step.by, note: t.step.event, ...(t.step.platform ? { platform: t.step.platform } : {}) }
    const spec = MACHINE_EDGES.find((x) => x.from === t.from && x.to === t.to)
    const stepTool = spec && t.step.platform ? toolFor(t.step.platform, spec.move) : undefined
    if (base) {
      Object.assign(base, mark)
      if (t.step.platform && t.step.platform !== platform) {
        if (stepTool) base.tool = stepTool
        else delete base.tool
      }
    }
    else transitions.push({ id: `took${++extra}`, from: t.from, to: t.to, event: t.step.event, ...mark, note: undefined })
  }
  const next = nextOf(standing, platform)
  if (next.edge) {
    const t = transitions.find((x) => x.id === next.edge!.id)
    if (t) {
      t.next = true
      if (next.edge.by === 'them') t.note = 'waiting on them'
    }
  }
  if (next.dynamic) transitions.push(next.dynamic)
  const nextT = transitions.find((t) => t.next)
  const details = (stage: Stage): MachineDetail[] => {
    const out: MachineDetail[] = []
    const step = reached.get(stage)
    if (step) out.push({ label: 'Reached', value: `${isoDay(step.at)}: ${step.event}` })
    for (const s of also.filter((a) => a.stage === stage)) out.push({ label: 'Also', value: `${isoDay(s.at)}: ${s.event}` })
    if (stage === 'nearYou' && e.near.length) out.push({ label: 'Shared', value: e.near.join(', ') })
    if (stage === standing.stage) {
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
  const states = STAGES.map((stage) => {
    const step = reached.get(stage)
    const visited = stage === 'new' || Boolean(step)
    const chips = stage === 'nearYou' && e.near.length ? [clip(e.near[0], 28)] : []
    return stageState(stage, { visited, explain: personExplain(stage, standing, step, nextT), ...(step?.at ? { at: step.at } : {}), ...(stage === standing.stage ? { current: true } : {}), ...(chips.length ? { chips } : {}), details: details(stage) })
  })
  const linkedCount = accounts.filter((a) => a.link === 'linked').length
  const where = linkedCount > 1 ? `across ${linkedCount} linked accounts` : `on ${platform}`
  const summary = `${whoOf(e)} ${where} stands at "${STAGE_FACTS[standing.stage].label}"${standing.steps.length ? ` after ${standing.steps.length} step${standing.steps.length === 1 ? '' : 's'}` : ''}${nextT ? `; next: ${nextT.event}${nextT.tool ? ` (${nextT.tool})` : ''}` : ''}${throughSeq !== null ? `. Relate graph through event ${throughSeq}.` : '.'}`
  if (linkedCount < 2) for (const t of transitions) delete t.platform
  return { type: MACHINE_BLOCK, title: `Where you are with ${whoOf(e)}`, view: 'person', summary, states, transitions: transitions.slice(0, MACHINE_LIMITS.transitions), ...(accounts.length ? { accounts: accounts.slice(0, MACHINE_LIMITS.accounts) } : {}) }
}

export function networkBlock(standings: readonly PersonStanding[], throughSeq: number | null, now: number = Date.now()): StateMachineBlock {
  const byStage = new Map<Stage, PersonStanding[]>(STAGES.map((s) => [s, []]))
  for (const s of standings) byStage.get(s.stage)!.push(s)
  const edgeCount = new Map<string, number>()
  const extra = new Map<string, { from: Stage; to: Stage; count: number }>()
  for (const s of standings) {
    for (const t of pathOf(s.steps).taken) {
      const base = MACHINE_EDGES.find((x) => x.from === t.from && x.to === t.to)
      if (base) edgeCount.set(base.id, (edgeCount.get(base.id) ?? 0) + 1)
      else {
        const key = `${t.from}To${t.to[0].toUpperCase()}${t.to.slice(1)}`
        const held = extra.get(key) ?? { from: t.from, to: t.to, count: 0 }
        held.count += 1
        extra.set(key, held)
      }
    }
  }
  const platforms = new Map<string, number>()
  for (const s of standings) platforms.set(s.evidence.platform, (platforms.get(s.evidence.platform) ?? 0) + 1)
  const main = [...platforms.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
  const transitions: MachineTransition[] = MACHINE_EDGES.map((spec) => ({ ...baseTransition(spec, main), count: edgeCount.get(spec.id) ?? 0, ...(edgeCount.get(spec.id) ? { taken: true } : {}) }))
  for (const [id, x] of extra) transitions.push({ id, from: x.from, to: x.to, event: ARRIVED[x.to], count: x.count, taken: true, by: 'them', dashed: true })
  const stuck = (list: PersonStanding[]) => list.filter((s) => s.evidence.lastAt !== null && now - s.evidence.lastAt > STUCK_AFTER_MS).length
  const states = STAGES.map((stage) => {
    const list = [...byStage.get(stage)!].sort((a, b) => (b.evidence.lastAt ?? 0) - (a.evidence.lastAt ?? 0))
    const names = list.slice(0, NETWORK_NAMES).map((s) => clip(whoOf(s.evidence), 20))
    const quiet = stage === 'new' ? 0 : stuck(list)
    const chips = [...(quiet ? [`${quiet} quiet 14d+`] : []), ...names]
    const details: MachineDetail[] = [{ label: 'People here', value: String(list.length) }, ...(quiet ? [{ label: 'Quiet for 14 days or more', value: String(quiet) }] : []), ...list.slice(0, 8).map((s) => ({ label: whoOf(s.evidence), value: `${s.evidence.platform}, last ${isoDay(s.evidence.lastAt)}` }))]
    const onward = transitions.filter((t) => t.from === stage).map((t) => t.event)
    const explain = explained(`${list.length.toLocaleString('en-US')} ${list.length === 1 ? 'person stands' : 'people stand'} here${quiet ? `, ${quiet} quiet for 14 days or more` : ''}${onward.length ? `; the way on: ${either(onward)}` : '; the end of the road: keep these conversations going'}.`)
    return stageState(stage, { count: list.length, visited: list.length > 0, explain, chips: chips.slice(0, MACHINE_LIMITS.chips), details: details.slice(0, MACHINE_LIMITS.details) })
  })
  const most = [...states].filter((s) => s.id !== 'new').sort((a, b) => (b.count ?? 0) - (a.count ?? 0))[0]
  const summary = `${standings.length.toLocaleString('en-US')} people across ${STAGES.length} states${most?.count ? `; most stand at "${most.label}" (${most.count})` : ''}${throughSeq !== null ? `. Relate graph through event ${throughSeq}.` : '.'}`
  return { type: MACHINE_BLOCK, title: 'Your network as a state machine', view: 'network', summary, states, transitions: transitions.slice(0, MACHINE_LIMITS.transitions) }
}

export function routeBlock(owner: { label: string; note: string }, target: PersonStanding, links: readonly RouteLink[], throughSeq: number | null): StateMachineBlock {
  const t = target.evidence
  const best = links[0]
  const states: MachineState[] = [{ id: 'you', label: 'You', note: owner.note, explain: explained(best ? `You start here; the best move is to ask @${best.handle} for an intro.` : `You start here; nobody you know connects to ${whoOf(t)} yet, so reach out directly.`), tone: 'gray', initial: true, current: true, visited: true, details: [{ label: 'Accounts', value: owner.note }] }]
  const transitions: MachineTransition[] = []
  links.forEach((link, i) => {
    const id = `via${i + 1}`
    states.push({ id, label: clip(`@${link.handle}`, 28), note: STAGE_FACTS[link.stage].label, explain: explained(`${i === 0 ? 'Best connector' : 'Another connector'} (${STAGE_FACTS[link.stage].label.toLowerCase()}): ${link.reasons[0] ?? 'close to the target'}.`), tone: STAGE_FACTS[link.stage].tone, visited: true, chips: link.reasons.slice(0, 2).map((r) => clip(r, 28)), ...(link.lastAt ? { at: link.lastAt } : {}), details: [{ label: 'With you', value: STAGE_FACTS[link.stage].label }, { label: 'Platform', value: link.platform }, ...link.reasons.map((r) => ({ label: 'Link to the target', value: r }))] })
    const dm = toolFor(link.platform, 'dm')
    transitions.push({ id: `ask${i + 1}`, from: 'you', to: id, event: 'ask for an intro', ...(dm ? { tool: dm } : {}), by: 'you', ...(i === 0 ? { next: true } : {}) })
    transitions.push({ id: `intro${i + 1}`, from: id, to: 'target', event: 'introduces you', by: 'them', note: clip(link.reasons[0] ?? '', 40), ...(i === 0 ? {} : { dashed: true }) })
  })
  const tStage = target.stage
  states.push({ id: 'target', label: clip(whoOf(t), 28), note: STAGE_FACTS[tStage].label, explain: explained(`Where they stand: ${STAGE_FACTS[tStage].label.toLowerCase()}; ${best ? `an intro from @${best.handle} is the warmest way in` : 'a direct message is the only way in so far'}.`), tone: 'purple', final: true, visited: true, ...(t.lastAt ? { at: t.lastAt } : {}), details: [{ label: 'With you now', value: STAGE_FACTS[tStage].label }, { label: 'Platform', value: t.platform }, ...(t.near.length ? [{ label: 'Shared', value: t.near.join(', ') }] : [])] })
  const direct = toolFor(t.platform, tStage === 'new' || tStage === 'followsYou' ? (toolFor(t.platform, 'follow') ? 'follow' : 'dm') : 'dm')
  transitions.push({ id: 'direct', from: 'you', to: 'target', event: links.length ? 'cold opener' : 'reach out directly', ...(direct ? { tool: direct } : {}), by: 'you', dashed: links.length > 0, ...(links.length ? {} : { next: true }) })
  const summary = best ? `Best route to ${whoOf(t)}: ask @${best.handle} (${STAGE_FACTS[best.stage].label.toLowerCase()} with you; ${best.reasons[0] ?? 'shares their circles'}) for an intro${links.length > 1 ? `, or ${links.slice(1).map((l) => `@${l.handle}`).join(', ')}` : ''}${throughSeq !== null ? `. Relate graph through event ${throughSeq}.` : '.'}` : `No one you know connects to ${whoOf(t)} in the graph yet: reach out directly.`
  return { type: MACHINE_BLOCK, title: `How to reach ${whoOf(t)}`, view: 'route', summary, states, transitions }
}

export function rankLinks(candidates: readonly (RouteLink & { rooms: number; circles: number; mentions: number; orbit: number })[], limit: number): RouteLink[] {
  const scored = candidates
    .filter((c) => rankOf(c.stage) >= rankOf('followsYou'))
    .map((c) => ({ ...c, score: rankOf(c.stage) * 10 + c.rooms * 3 + c.circles * 2 + c.mentions * 3 + c.orbit }))
    .sort((a, b) => b.score - a.score || (b.lastAt ?? 0) - (a.lastAt ?? 0) || a.handle.localeCompare(b.handle))
  return scored.slice(0, limit).map(({ key, handle, platform, stage, reasons, score, lastAt }) => ({ key, handle, platform, stage, reasons, score, lastAt }))
}
