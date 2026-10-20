import type { ReelViewer, ViewerSwipe } from '../types'

const s = (ms: number) => `${(ms / 1000).toFixed(1)} s`
const pct = (x: number) => `${Math.round(x * 100)}%`

/** One swipe in plain words: `0.9 s`, `14.2 s (comments 6.0 s, liked)`. Pure. */
export function describeSwipe(swipe: ViewerSwipe): string {
  const extra = [swipe[2] > 0 ? `comments ${s(swipe[2])}` : '', swipe[3] > 0 ? `profile ${s(swipe[3])}` : '', swipe[4] ? 'liked' : ''].filter(Boolean)
  return `${s(swipe[0])}${extra.length ? ` (${extra.join(', ')})` : ''}`
}

/**
 * The viewer's behaviour as SubQ's context: their own numbers and one of
 * their real sessions, swipe by swipe, so SubQ decides each reel the way this
 * person scrolls. Pure.
 */
export function describeViewer(viewer: ReelViewer, sessionIndex: number, maxSwipes = 40): string {
  const t = viewer.stats
  const session = viewer.sessions[sessionIndex % viewer.sessions.length] ?? []
  return [
    `A real short-form viewer's swipe-by-swipe behaviour (${viewer.source}, ${t.swipes} swipes over ${t.sessions} sessions).`,
    `They swipe 10% of videos by ${s(t.playMs[0])}, a quarter by ${s(t.playMs[1])}, half by ${s(t.playMs[2])}, 3 in 4 by ${s(t.playMs[3])}, 9 in 10 by ${s(t.playMs[4])}; ${pct(t.under1s)} under 1 s, ${pct(t.under2s)} under 2 s.`,
    `They open the comments on ${pct(t.commentRate)} of videos${t.commentRate ? ` (median ${s(t.commentMs)} in them)` : ''}, the author's profile on ${pct(t.profileRate)}, and like ${pct(t.likeRate)}. A session is a median ${t.sessionSwipes} swipes.`,
    `One of their sessions, in order: ${session.slice(0, maxSwipes).map(describeSwipe).join(', ')}.`
  ].join(' ')
}

/**
 * How long to watch, as levels of the viewer's own plays: five bands of equal
 * share (their quickest fifth to their longest), each named with its seconds,
 * so SubQ's score picks a band and the time is one of their real plays in it.
 * Pure.
 */
export function watchBands(viewer: ReelViewer): { label: string; plays: number[] }[] {
  const plays = viewer.sessions.flat().map((w) => w[0]).sort((a, b) => a - b)
  const names = ['Swipe straight past it', 'A glance', 'A few seconds', 'Most of it', 'All of it, or replay it']
  return names.map((name, i) => {
    const band = plays.slice(Math.floor((plays.length * i) / 5), Math.max(Math.floor((plays.length * (i + 1)) / 5), Math.floor((plays.length * i) / 5) + 1))
    return { label: `${name} (${s(band[0] ?? 0)}-${s(band[band.length - 1] ?? 0)}, like their ${['quickest', 'second', 'middle', 'fourth', 'longest'][i]} fifth of swipes)`, plays: band }
  })
}

/** One of the viewer's real times for this (comments, profile), drawn; their median when they have none. Pure, given its draw. */
export function drawRealMs(viewer: ReelViewer, field: 2 | 3, rng: () => number, fallbackMs: number): number {
  const times = viewer.sessions.flat().map((w) => w[field]).filter((x) => x > 0)
  return times.length ? times[Math.floor(rng() * times.length)] : fallbackMs
}
