#!/usr/bin/env bun
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { listUseCases } from '../../src/mcp/server/helpers/index.ts'
import { localEmbedder } from '../../src/search/conversations/helpers/embed.ts'
import { EMBED_MODEL } from '../../src/search/conversations/types.ts'
import { FALSE_FIRE_CAP } from '../../src/useCases/router/index'
import { labelledPath } from '../../src/contextLayer/service/index'
import { buildRouteIndex, matchPlays, routePrompt } from '../../src/useCases/router/index'
import type { Utterance } from '../../src/useCases/router/index'

type Labelled = { prompt: string; play: string; also?: string[] }
type Outcome = { label: Labelled; top: string; score: number; ms: number; ranked?: { id: string; score: number }[] }

const FOLDS = 5
const fixtures = join(import.meta.dir, '..', '..', 'src', 'useCases', 'router', 'fixtures')
const labelled = (JSON.parse(readFileSync(labelledPath(), 'utf8')) as Labelled[]).map((l, i) => ({ ...l, fold: i % FOLDS }))
const useCases = listUseCases()
const MODEL = process.env.LOG_ROUTER_MODEL || EMBED_MODEL
const embedder = localEmbedder(MODEL)
const embed = (texts: string[]) => embedder.embed(texts)
const pct = (values: number[], p: number) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.round((p / 100) * (sorted.length - 1)))] ?? 0
}
const ok = (label: Labelled, top: string) => top === label.play || (top !== 'none' && (label.also ?? []).includes(top))

function score(outcomes: Outcome[], threshold: number) {
  let right = 0, falseFire = 0, missed = 0, wrongPlay = 0
  const none = outcomes.filter((o) => o.label.play === 'none').length
  for (const o of outcomes) {
    const top = o.score >= threshold ? o.top : 'none'
    if (ok(o.label, top)) right++
    else if (o.label.play === 'none') falseFire++
    else if (top === 'none') missed++
    else wrongPlay++
  }
  const plays = outcomes.length - none
  return { threshold, accuracy: right / outcomes.length, playsCaught: plays ? (plays - missed - wrongPlay) / plays : 0, falseFireRate: none ? falseFire / none : 0, missed, wrongPlay, falseFire }
}

const started = performance.now()
const outcomes: Outcome[] = []
for (let fold = 0; fold < FOLDS; fold++) {
  const train: Utterance[] = labelled.filter((l) => l.fold !== fold && l.play !== 'none').map((l) => ({ route: l.play, text: l.prompt.toLowerCase().slice(0, 400) }))
  const index = await buildRouteIndex(useCases, embed, MODEL, train, useCases.map((u) => u.text).join(' '))
  for (const label of labelled.filter((l) => l.fold === fold)) {
    const decision = await routePrompt(label.prompt, index, embed, { default: 0 })
    outcomes.push({ label, top: decision.matches[0]?.id ?? 'none', score: decision.matches[0]?.score ?? 0, ms: decision.ms.total, ranked: decision.ranked.map((r) => ({ id: r.id, score: r.score })) })
  }
  process.stderr.write(`fold ${fold + 1}/${FOLDS} done (${Math.round((performance.now() - started) / 1000)} s)\n`)
}

const sweep = Array.from({ length: 81 }, (_, i) => 0.3 + i * 0.0075).map((t) => score(outcomes, t))
const allowed = sweep.filter((s) => s.falseFireRate <= FALSE_FIRE_CAP)
const best = (allowed.length ? allowed : sweep).reduce((a, b) => (b.playsCaught > a.playsCaught || (b.playsCaught === a.playsCaught && b.falseFireRate < a.falseFireRate) ? b : a))
function menu(outcomes: Outcome[], floor: number) {
  const plays = outcomes.filter((o) => o.label.play !== 'none')
  const none = outcomes.filter((o) => o.label.play === 'none')
  const shown = (o: Outcome) => (o.ranked ?? []).filter((r) => r.score >= floor)
  const inMenu = (o: Outcome) => shown(o).some((r) => r.id === o.label.play || (o.label.also ?? []).includes(r.id))
  return { floor, playInTop3: plays.filter(inMenu).length / plays.length, menuShownOnNone: none.filter((o) => shown(o).length > 0).length / none.length }
}
const menus = Array.from({ length: 25 }, (_, i) => 0.4 + i * 0.0125).map((f) => menu(outcomes, f))
const baseline = labelled.map((l) => ({ label: l, top: matchPlays(l.prompt, useCases)[0]?.id ?? 'none', score: 1, ms: 0 }))
const ms = outcomes.map((o) => o.ms)
const report = {
  model: MODEL,
  prompts: labelled.length,
  plays: labelled.filter((l) => l.play !== 'none').length,
  none: labelled.filter((l) => l.play === 'none').length,
  oldWordMatcher: score(baseline, 0.5),
  router: best,
  top3Menu: menus.filter((_, i) => i % 3 === 0),
  latencyMs: { p50: pct(ms, 50), p95: pct(ms, 95), p99: pct(ms, 99), max: Math.max(...ms) },
  wrong: outcomes.filter((o) => !ok(o.label, o.score >= best.threshold ? o.top : 'none')).slice(0, 40).map((o) => ({ said: o.label.prompt.slice(0, 110), meant: o.label.play, got: o.score >= best.threshold ? o.top : 'none', score: Number(o.score.toFixed(3)) })),
}
if (process.argv.includes('--fit')) writeFileSync(join(fixtures, 'thresholds.json'), `${JSON.stringify({ default: Number(best.threshold.toFixed(4)) }, null, 2)}\n`)
console.log(JSON.stringify(report, null, 2))
embedder.stop?.()
process.exit(0)
