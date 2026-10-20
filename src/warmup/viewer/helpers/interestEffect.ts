/**
 * How much more a real viewer watches and engages when a video is their kind
 * of content: measured on KuaiRand-Pure (real). Each user's favourite
 * categories (`tag`) come from their normal swipe feed (`log_standard`, tab 1:
 * play ratio, likes and comments per category); the effect from the videos
 * they were shown at random (`log_random`, unbiased exposure), in their top
 * categories against outside them. Every ratio is against all random plays,
 * so a real viewer's own play (their overall behaviour) is scaled by it.
 */
export interface InterestEffect {
  /** Play time at the 25th, 50th, 75th and 90th percentile, in-interest over all and outside over all. */
  watchIn: [number, number, number, number]
  watchOut: [number, number, number, number]
  likeIn: number
  likeOut: number
  commentIn: number
  commentOut: number
  /** Share swiped within 2 s. */
  skipIn: number
  skipOut: number
  /** The random plays measured, in their categories and outside. */
  plays: { in: number; out: number }
  source: string
}

/** One play: user, video, play ms, liked, comments opened, the swipe feed or not. */
export interface TaggedPlay {
  user: string
  video: string
  playMs: number
  durationMs: number
  liked: boolean
  commented: boolean
}

const QS = [0.25, 0.5, 0.75, 0.9] as const
const quantiles = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return QS.map((q) => s[Math.min(s.length - 1, Math.floor(s.length * q))] ?? 0)
}
const round = (x: number) => Math.round(x * 1000) / 1000

/** The effect from the standard feed (interests) and the random log (exposure). Pure. */
export function measureInterestEffect(standard: TaggedPlay[], random: TaggedPlay[], tagOf: (video: string) => string | undefined, topN = 3): InterestEffect {
  const score = new Map<string, Map<string, number>>()
  for (const p of standard) {
    const tag = tagOf(p.video)
    if (!tag) continue
    const byTag = score.get(p.user) ?? new Map<string, number>()
    byTag.set(tag, (byTag.get(tag) ?? 0) + Math.min(p.playMs / Math.max(p.durationMs, 1), 2) + (p.liked ? 3 : 0) + (p.commented ? 3 : 0))
    score.set(p.user, byTag)
  }
  const top = new Map([...score.entries()].map(([u, byTag]) => [u, new Set([...byTag.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN).map(([t]) => t))]))
  const inside: TaggedPlay[] = []
  const outside: TaggedPlay[] = []
  for (const p of random) {
    const tag = tagOf(p.video)
    const favourites = top.get(p.user)
    if (!tag || !favourites || p.playMs <= 0) continue
    ;(favourites.has(tag) ? inside : outside).push(p)
  }
  const all = [...inside, ...outside]
  const rate = (xs: TaggedPlay[], f: (p: TaggedPlay) => boolean) => (xs.length ? xs.filter(f).length / xs.length : 0)
  const qa = quantiles(all.map((p) => p.playMs))
  const ratio = (xs: TaggedPlay[]) => quantiles(xs.map((p) => p.playMs)).map((v, i) => round(v / Math.max(qa[i], 1))) as InterestEffect['watchIn']
  const vs = (xs: TaggedPlay[], f: (p: TaggedPlay) => boolean) => round(rate(xs, f) / Math.max(rate(all, f), 1e-9))
  return {
    watchIn: ratio(inside),
    watchOut: ratio(outside),
    likeIn: vs(inside, (p) => p.liked),
    likeOut: vs(outside, (p) => p.liked),
    commentIn: vs(inside, (p) => p.commented),
    commentOut: vs(outside, (p) => p.commented),
    skipIn: round(rate(inside, (p) => p.playMs < 2000)),
    skipOut: round(rate(outside, (p) => p.playMs < 2000)),
    plays: { in: inside.length, out: outside.length },
    source: 'KuaiRand-Pure log_standard (interests) and log_random (exposure), tab 1'
  }
}

/** The watch ratio for a play at quantile `q` of the viewer's own plays, in or outside their interests. Pure. */
export function watchRatio(effect: InterestEffect, q: number, inInterest: boolean): number {
  const r = inInterest ? effect.watchIn : effect.watchOut
  const at = q <= 0.25 ? 0 : q <= 0.5 ? 1 : q <= 0.75 ? 2 : 3
  return r[at]
}
