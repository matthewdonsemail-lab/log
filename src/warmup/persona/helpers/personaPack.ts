import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { seeded } from '../../../facebook/warmup/activities/helpers/reelSession'
import type { ReelViewer } from '../../viewer/types'
import type { BehaviourProfile, PersonaPack, PersonaSegment } from '../types'
import { datasetsDir, parseTable } from './drawPersona'

/**
 * The extra datasets a persona pack draws from (the persona-conditioned Reels
 * handoff matt collated, 2026-10-20), installed under `~/.logCli/datasets/`
 * (`SOURCES.md` there). Only the columns the pack uses are kept.
 */
export interface PackDatasets {
  brainRot: Record<string, string>[]
  global2026: Record<string, string>[]
  adEngagement: Record<string, string>[]
  fbConversions: Record<string, string>[]
  customerPersonality: Record<string, string>[]
  instagramComments: string[]
  movieLens: { id: string; age: number; gender: string; occupation: string }[]
  /** KuaiRand-Pure's swipe feed: the comment times (ms) of plays whose comments were opened. */
  kuaiRandPureCommentMs: number[]
}

const keep = (rows: Record<string, string>[], cols: string[]) => rows.map((r) => Object.fromEntries(cols.map((c) => [c, r[c] ?? ''])))

/** The pack's datasets from their folder; a missing one says which. */
export function readPackDatasets(dir = datasetsDir()): PackDatasets {
  const text = (path: string) => {
    const full = join(dir, path)
    if (!existsSync(full)) throw Object.assign(new Error(`${path} isn't in ${dir} (see SOURCES.md there)`), { code: 'datasetMissing' })
    return readFileSync(full, 'utf8')
  }
  const table = (path: string, cols: string[], sep: ',' | '\t' = ',') => keep(parseTable(text(path), sep), cols)
  const pure = text('kuaiRand/KuaiRand-Pure/data/log_standard_4_08_to_4_21_pure.csv').split('\n')
  const header = pure[0].trim().split(',')
  const tab = header.indexOf('tab')
  const stay = header.indexOf('comment_stay_time')
  const kuaiRandPureCommentMs: number[] = []
  for (const line of pure.slice(1)) {
    const cells = line.split(',')
    if (cells[tab] === '1' && Number(cells[stay]) > 0) kuaiRandPureCommentMs.push(Number(cells[stay]))
  }
  return {
    brainRot: table('brainRotShortForm/short_form_brain_rot_cognitive_decay.csv', ['participant_id', 'age', 'gender', 'primary_platform', 'sustained_attention_span_sec', 'attention_retention_pct', 'swipes_per_minute', 'scroll_sessions_day']),
    global2026: table('socialMediaUserBehaviorGlobal2026/social_media_user_behavior.csv', ['user_id', 'age', 'gender', 'country', 'primary_platform', 'likes_per_day', 'comments_per_day', 'engagement_rate_pct', 'ad_click_frequency', 'weekly_sessions', 'preferred_content_type']),
    adEngagement: table('socialMediaAdEngagement/ad_campaign_data.csv', ['user_id', 'age', 'gender', 'impressions', 'clicks', 'previous_interaction_score']),
    fbConversions: table('clicksConversionTracking/KAG_conversion_data.csv', ['ad_id', 'age', 'gender', 'Impressions', 'Clicks']),
    customerPersonality: table('customerPersonality/marketing_campaign.csv', ['ID', 'Year_Birth', 'NumWebVisitsMonth', 'NumWebPurchases'], '\t'),
    instagramComments: parseTable(text('instagramUserBehavior/comments_cleaned.csv'), ',').map((r) => r.comment ?? r.comments ?? r.text ?? Object.values(r).find((v) => v.split(' ').length > 2) ?? ''),
    movieLens: text('movieLens100k/ml-100k/u.user')
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => {
        const [id, age, gender, occupation] = l.split('|')
        return { id, age: Number(age), gender, occupation }
      }),
    kuaiRandPureCommentMs
  }
}

const num = (x: string | undefined) => {
  const n = Number(x)
  return Number.isFinite(n) ? n : 0
}
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? s[Math.floor(s.length / 2)] : 0
}
const genderLetter = (g: string) => (/^f/i.test(g) ? 'F' : /^m/i.test(g) ? 'M' : '')

/** The rows nearest the persona: same gender where the dataset has it, age within `span` (widening until some match). Pure. */
function nearest<T>(rows: T[], ageOf: (r: T) => number, genderOf: (r: T) => string, age: number, gender: string, extra: (r: T) => boolean = () => true): T[] {
  for (const span of [2, 5, 10, 100]) {
    const found = rows.filter((r) => Math.abs(ageOf(r) - age) <= span && (!gender || !genderOf(r) || genderLetter(genderOf(r)) === gender) && extra(r))
    if (found.length) return found
  }
  return rows
}

/** An age band like the FB conversions data's ("30-34"): its middle. */
const bandMiddle = (band: string) => {
  const [lo, hi] = band.split('-').map(Number)
  return Number.isFinite(hi) ? (lo + hi) / 2 : num(band)
}

/** The datasets' content preferences and motivations as the reel labels; formats (Photos, Stories, Text Post…) say nothing of content. */
const INTEREST_OF: Record<string, string> = {
  Educational: 'educational',
  Memes: 'memes',
  Meme: 'memes',
  News: 'news',
  'News & Current Events': 'news',
  Entertainment: 'entertainment',
  'Social Connection': 'socialConnection',
  'Work/Research': 'workResearch',
  'Article/Blog': 'educational',
  Infographic: 'educational',
  'Podcast/Audio': 'educational'
}

/** Reading speed for comments: a common adult silent-reading rate, words per minute. */
const READING_WPM = 238

/**
 * The persona pack: the persona and its real viewer turned into the numbers
 * the action orderer runs on, each from the dataset named in `provenance`
 * (real or synthetic said there). The anchor is the persona's doomscrolling
 * row (age, gender, country); every other dataset gives its nearest row,
 * drawn with the persona's seed. Rates per reel come from rates per day over
 * the reels a day of sessions holds. Pure, given its datasets.
 */
export function buildPersonaPack(persona: BehaviourProfile, viewer: ReelViewer, data: PackDatasets): PersonaPack {
  const rng = seeded(persona.seed ^ 0x5eed)
  const pick = <T>(rows: T[]) => rows[Math.floor(rng() * rows.length)]
  const doom = persona.rows.find((r) => r.source.startsWith('doomscrolling'))?.fields ?? {}
  const social = persona.rows.find((r) => r.source.startsWith('socialBehaviour'))?.fields ?? {}
  const age = num(doom.age) || 30
  const gender = genderLetter(doom.gender ?? '')
  const t = viewer.stats

  // Real viewer (KuaiRand-1K): the watch times, in their sessions' own order, and their rates.
  const meanReelS = mean(viewer.sessions.flat().map((w) => w[0])) / 1000 + 1
  // Session length (doomscrolling, synthetic): minutes per session over the viewer's own reel time, with their real sessions.
  const doomReels = (num(doom.avg_session_length_minutes) * 60) / Math.max(meanReelS, 1)
  const fatigue = { 'Almost Daily': 1.3, Often: 1.15, Sometimes: 1, Rarely: 0.75 }[doom.doomscrolling_frequency ?? ''] ?? 1
  const sessionReels = Math.round(clamp(mean([doomReels, t.sessionSwipes].filter((x) => x > 0)) * fatigue, 6, 60))
  const sessionsPerDay = num(social.sessions_per_day) || num(doom.daily_scroll_sessions_count) || 5
  const reelsPerDay = Math.max(sessionsPerDay * sessionReels, 1)

  // Brain-rot (synthetic): the attention cap on one watch, and how much of a reel they finish.
  const brain = pick(nearest(data.brainRot, (r) => num(r.age), (r) => r.gender, age, gender, (r) => /Reels|TikTok/.test(r.primary_platform)))
  // Global 2026 (synthetic): likes and comments a day, engagement rate, ad clicks; nearest in the persona's country.
  const country = doom.country ?? 'United States'
  const global = pick(nearest(data.global2026, (r) => num(r.age), (r) => r.gender, age, gender, (r) => r.country === country && /Facebook|Instagram/.test(r.primary_platform)))
  // Ad engagement (synthetic), FB conversions (real, by age band and gender), customer personality (real, by birth year): click-through.
  const ad = pick(nearest(data.adEngagement, (r) => num(r.age), (r) => r.gender, age, gender))
  const fb = pick(nearest(data.fbConversions, (r) => bandMiddle(r.age), (r) => r.gender, age, gender))
  const shopper = pick(nearest(data.customerPersonality, (r) => 2014 - num(r.Year_Birth), () => '', age, ''))
  // MovieLens 100K (real): a demographic shell, no ID join: one real person's age, gender and occupation.
  const shell = pick(nearest(data.movieLens, (r) => r.age, (r) => r.gender, age, gender))

  const likeP = clamp(mean([t.likeRate, num(social.likes_given_per_day) / reelsPerDay, num(global.likes_per_day) / reelsPerDay, num(global.engagement_rate_pct) / 100]), 0, 0.5)
  const commentP = clamp(mean([t.commentRate, num(social.comments_per_day) / reelsPerDay, num(global.comments_per_day) / reelsPerDay]), 0, 0.4)
  // Click-through: the real rates (the viewer's, FB conversions', the shopper's web visits a session) and the
  // social set's ad click rate as the base; the synthetic ad set (median CTR about 0.5) only as a relative nudge.
  const ctr = (r: Record<string, string>) => (num(r.impressions) ? num(r.clicks) / num(r.impressions) : 0)
  const adMedian = median(data.adEngagement.map(ctr)) || 1
  const adNudge = clamp(ctr(ad) / adMedian, 0.5, 1.5)
  const fbClick = num(fb.Impressions) ? num(fb.Clicks) / num(fb.Impressions) : 0
  const profileP = clamp(mean([t.profileRate, num(social.ad_click_rate), fbClick, num(shopper.NumWebVisitsMonth) / 30 / sessionsPerDay]) * adNudge, 0, 0.3)
  // Comment reading time: the viewer's own, else KuaiRand-Pure's swipe feed, with the Instagram comments' length as the floor.
  const words = median(data.instagramComments.map((c) => c.split(/\s+/).filter(Boolean).length).filter((n) => n > 0)) || 8
  const readMs = Math.round((words / READING_WPM) * 60_000 * 3)
  const commentMs = Math.max(t.commentMs || median(data.kuaiRandPureCommentMs), readMs)
  const trust = num(doom.content_algorithm_trust_score)
  const traits = {
    ageBand: `${Math.floor(age / 5) * 5}-${Math.floor(age / 5) * 5 + 4}`,
    gender: gender || doom.gender || '',
    occupation: shell.occupation,
    attentionCapS: Math.round(num(brain.sustained_attention_span_sec)) || 60,
    completionP: Math.round(clamp(num(brain.attention_retention_pct) / 100, 0, 1) * 100) / 100,
    skipP: Math.round(t.under2s * 100) / 100,
    likeP: Math.round(likeP * 1000) / 1000,
    commentP: Math.round(commentP * 1000) / 1000,
    profileP: Math.round(profileP * 1000) / 1000,
    commentMs,
    profileMs: t.profileMs || 6000,
    sessionReels,
    // The trust score runs 0-100.
    adSkipP: Math.round(clamp(doom.content_algorithm_trust_score ? 1 - trust / 100 : 0.5, 0, 1) * 100) / 100,
    likeCooldownReels: 3
  }
  // Interests: social behaviour's preferred content, doomscrolling's motivation, global 2026's preferred content.
  const interests = [...new Set([social.preferred_content_type, doom.primary_motivation, global.preferred_content_type].map((v) => INTEREST_OF[v ?? '']).filter((v): v is string => Boolean(v)))]
  return {
    personaId: `${viewer.source.replace(' ', '_')}_${persona.seed}`,
    segment: segmentOf(traits),
    interests,
    traits,
    provenance: [
      `${viewer.source} (real): watch times in session order, skipP, rates`,
      `${persona.rows.find((r) => r.source.startsWith('doomscrolling'))?.source} (synthetic): age, gender, country, sessionReels, adSkipP`,
      `${persona.rows.find((r) => r.source.startsWith('socialBehaviour'))?.source} (synthetic): likes and comments a day, ad click rate, preferred content (interests)`,
      `brainRot ${brain.participant_id} (synthetic): attentionCapS, completionP`,
      `global2026 ${global.user_id} (synthetic): likes, comments, engagement rate, preferred content (interests)`,
      `adEngagement ${ad.user_id} (synthetic), fbConversions ${fb.ad_id} (real), customerPersonality ${shopper.ID} (real): profileP`,
      `kuaiRandPure swipe feed (real) and instagramComments (comments only): commentMs`,
      `movieLens100k ${shell.id} (real): occupation, the demographic shell`
    ]
  }
}

/** The pack's segment (the handoff's four), from its traits. Pure. */
export function segmentOf(traits: Pick<PersonaPack['traits'], 'skipP' | 'likeP' | 'commentP' | 'profileP'>): PersonaSegment {
  if (traits.likeP + traits.commentP >= 0.12) return 'social'
  if (traits.profileP >= 0.08) return 'commerce'
  if (traits.skipP >= 0.4) return 'skipper'
  return 'lurker'
}
