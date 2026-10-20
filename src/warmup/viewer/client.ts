import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { datasetsDir } from '../persona/helpers/drawPersona'
import { seeded } from '../facebook/helpers/reelSession'
import type { InterestEffect } from './helpers/interestEffect'
import type { ReelViewer, ViewerFile } from './types'

/** `~/.logCli/datasets/reelViewers/kuaiRand1k.json`, built by `scripts/buildReelViewers.ts`. */
export const viewersPath = (dir = datasetsDir()) => join(dir, 'reelViewers', 'kuaiRand1k.json')

/** `~/.logCli/datasets/reelViewers/interestEffect.json`, built by `scripts/buildInterestEffect.ts`. */
export const interestEffectPath = (dir = datasetsDir()) => join(dir, 'reelViewers', 'interestEffect.json')

export function readInterestEffect(path = interestEffectPath()): InterestEffect {
  if (!existsSync(path)) throw Object.assign(new Error(`the interest effect isn't measured yet (${path}): bun scripts/buildInterestEffect.ts`), { code: 'interestEffectMissing' })
  return JSON.parse(readFileSync(path, 'utf8')) as InterestEffect
}

export function readViewers(path = viewersPath()): ViewerFile {
  if (!existsSync(path)) throw Object.assign(new Error(`the real viewers aren't built yet (${path}): bun scripts/buildReelViewers.ts`), { code: 'viewersMissing' })
  return JSON.parse(readFileSync(path, 'utf8')) as ViewerFile
}

/** Viewers with at least this many swipes, so their fifths of plays have plays enough in each. */
export const MIN_VIEWER_SWIPES = 100

/**
 * The viewers that fit the persona's scroll speed (the social behaviour
 * dataset's Fast, Medium or Slow): the quickest, middle or slowest third by
 * median play, among those with `MIN_VIEWER_SWIPES`. Pure.
 */
export function viewersForSpeed(viewers: ReelViewer[], scrollSpeed: string | undefined): ReelViewer[] {
  const rich = viewers.filter((v) => v.stats.swipes >= MIN_VIEWER_SWIPES)
  const pool = (rich.length ? rich : viewers).slice().sort((a, b) => a.stats.playMs[2] - b.stats.playMs[2])
  const third = Math.ceil(pool.length / 3)
  const at = { fast: 0, medium: 1, slow: 2 }[(scrollSpeed ?? '').toLowerCase()]
  return at === undefined ? pool : pool.slice(at * third, (at + 1) * third)
}

/**
 * The account's viewer: the one kept with its persona (`<account>.viewer.json`
 * beside it), else one drawn with the account's seed from the viewers that
 * fit the persona's scroll speed, and kept. `fresh` draws another.
 */
export function viewerFor(personaPath: string, seed: number, options: { fresh?: boolean; file?: ViewerFile; scrollSpeed?: string } = {}): { viewer: ReelViewer; drawn: boolean } {
  const keptPath = personaPath.replace(/\.json$/, '.viewer.json')
  const file = options.file ?? readViewers()
  if (!options.fresh && existsSync(keptPath)) {
    const kept = JSON.parse(readFileSync(keptPath, 'utf8')) as { source: string }
    const viewer = file.viewers.find((v) => v.source === kept.source)
    if (viewer) return { viewer, drawn: false }
  }
  const rng = seeded(options.fresh ? Math.floor(Math.random() * 2 ** 31) : seed)
  const pool = viewersForSpeed(file.viewers, options.scrollSpeed)
  const viewer = pool[Math.floor(rng() * pool.length)]
  mkdirSync(join(keptPath, '..'), { recursive: true })
  writeFileSync(keptPath, `${JSON.stringify({ source: viewer.source, from: file.source, scrollSpeed: options.scrollSpeed ?? null }, null, 2)}\n`)
  return { viewer, drawn: true }
}
