/**
 * A behaviour profile for the persona behind an account's warm-up (rule 50),
 * drawn at random, one row from each dataset matt named, matched to the
 * account's country where the dataset has one, and to people whose main
 * platform is Facebook or Instagram (Reels):
 *
 *   doomscrolling     Kaggle hamnamunir/doomscrolling-and-algorithm-fatigue-dataset (4,000 respondents)
 *   socialBehaviour   Kaggle hamnamunir/social-media-user-behavior-dataset (2,000, CC0, synthetic), the
 *                     one shree0910/social-media-user-behavior-prediction reads
 *   shortFormMemory   DaRUS doi:10.18419/DARUS-3327 (CHI '23, 60 participants, CC BY 4.0): its TikTok condition
 *
 * Read from `~/.logCli/datasets/` (`LOG_DATASETS_DIR`), never committed. The
 * profile primes SubQ's decisions on each reel (`warmup/facebook/reelDecision`).
 */

export interface DatasetRow {
  /** Which dataset and which row: `doomscrolling D00041`. */
  source: string
  fields: Record<string, string>
}

export interface BehaviourProfile {
  /** The draw's seed: the same seed, the same persona. */
  seed: number
  country: string
  /** The rows it was drawn from, as they are in the datasets. */
  rows: DatasetRow[]
  /** The fields SubQ is primed with, in plain words, each from its row. */
  summary: Record<string, string>
}

/** The handoff's four segments: each has its own base order of actions (`warmup/facebook/reelOrderer`). */
export type PersonaSegment = 'lurker' | 'skipper' | 'social' | 'commerce'

/**
 * A persona pack (the persona-conditioned Reels handoff, 2026-10-20): the
 * numbers the action orderer runs on, small enough (about 300 tokens) to send
 * to SubQ on a close call. Each trait's dataset, real or synthetic, is in
 * `provenance` (`buildPersonaPack`).
 */
export interface PersonaPack {
  personaId: string
  segment: PersonaSegment
  /** What they are into, as the reel labels (`REEL_LABELS`), from the datasets' content preferences and motivations. */
  interests: string[]
  traits: {
    ageBand: string
    gender: string
    occupation: string
    /** No one watch runs longer than this (brain-rot's sustained attention span). */
    attentionCapS: number
    completionP: number
    /** The real viewer's share of plays under 2 s. */
    skipP: number
    /** Per reel. */
    likeP: number
    commentP: number
    profileP: number
    commentMs: number
    profileMs: number
    sessionReels: number
    /** Skipping a sponsored reel at once (doomscrolling's trust in the feed's picks). */
    adSkipP: number
    likeCooldownReels: number
  }
  provenance: string[]
}
