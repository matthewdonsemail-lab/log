import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { seeded } from '../../../facebook/warmup/activities/helpers/reelSession'
import type { BehaviourProfile, DatasetRow } from '../types'

/** `~/.logCli/datasets`, or LOG_DATASETS_DIR. */
export function datasetsDir(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_DATASETS_DIR || join(homedir(), '.logCli', 'datasets')
}

/** A CSV or tab file → rows by header, quoted fields kept whole. Pure. */
export function parseTable(text: string, separator: ',' | '\t'): Record<string, string>[] {
  // Lines end in CRLF, LF, or CR alone (the FB conversions file).
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim())
  const split = (line: string) => {
    const out: string[] = []
    let cell = ''
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      if (c === '"') {
        if (quoted && line[i + 1] === '"') {
          cell += '"'
          i++
        } else quoted = !quoted
      } else if (c === separator && !quoted) {
        out.push(cell)
        cell = ''
      } else cell += c
    }
    out.push(cell)
    return out
  }
  const header = split(lines[0])
  return lines.slice(1).map((line) => {
    const cells = split(line)
    return Object.fromEntries(header.map((h, i) => [h, cells[i] ?? '']))
  })
}

/** How each dataset names a country (the account's is an ISO code). */
const COUNTRY_NAMES: Record<string, { doomscrolling: string; socialBehaviour: string }> = {
  US: { doomscrolling: 'United States', socialBehaviour: 'USA' },
  GB: { doomscrolling: 'United Kingdom', socialBehaviour: 'UK' },
  CA: { doomscrolling: 'Canada', socialBehaviour: 'Canada' },
  AU: { doomscrolling: 'Australia', socialBehaviour: 'Australia' },
  DE: { doomscrolling: 'Germany', socialBehaviour: 'Germany' }
}

/** People whose main platform is where this warm-up runs: Facebook, or Instagram (its Reels). */
const REELS_PLATFORMS = new Set(['Facebook', 'Instagram Reels', 'Instagram'])

export interface DatasetFiles {
  doomscrolling: Record<string, string>[]
  socialBehaviour: Record<string, string>[]
  shortFormMemory: Record<string, string>[]
}

/** The three datasets from their folder; a missing one says where to put it. */
export function readDatasets(dir = datasetsDir()): DatasetFiles {
  const read = (path: string, sep: ',' | '\t', name: string) => {
    const full = join(dir, path)
    if (!existsSync(full)) throw Object.assign(new Error(`${name} isn't in ${dir} (${path})`), { code: 'datasetMissing' })
    return parseTable(readFileSync(full, 'utf8'), sep)
  }
  // DaRUS serves its tables as CSV (`?format=original`), under the .tab name.
  return {
    doomscrolling: read('doomscrollingAlgorithmFatigue/doomscrolling_algorithm_fatigue_dataset.csv', ',', 'the doomscrolling dataset'),
    socialBehaviour: read('socialMediaUserBehavior/social_media_user_behavior.csv', ',', 'the social media user behaviour dataset'),
    shortFormMemory: read('darus3327/q.tab', ',', 'DaRUS-3327 q.tab')
  }
}

/**
 * One persona, drawn: a row from each dataset, matched to the account's
 * country and to Facebook or Instagram as the main platform where the
 * dataset has those (all its rows when none match), and a TikTok-condition
 * participant from DaRUS-3327. Pure, given its seed and the datasets.
 */
export function drawPersona(files: DatasetFiles, country: string, seed: number): BehaviourProfile {
  const rng = seeded(seed)
  const pick = <T>(rows: T[]) => rows[Math.floor(rng() * rows.length)]
  const names = COUNTRY_NAMES[country.toUpperCase()]
  const narrow = (rows: Record<string, string>[], countryName: string | undefined) => {
    const inCountry = countryName ? rows.filter((r) => r.country === countryName) : rows
    const onReels = inCountry.filter((r) => REELS_PLATFORMS.has(r.primary_platform))
    return onReels.length ? onReels : inCountry.length ? inCountry : rows
  }
  const doom = pick(narrow(files.doomscrolling, names?.doomscrolling))
  const social = pick(narrow(files.socialBehaviour, names?.socialBehaviour))
  const tiktok = files.shortFormMemory.filter((r) => r.interrupt === 'tiktok')
  const memory = pick(tiktok.length ? tiktok : files.shortFormMemory)
  const rows: DatasetRow[] = [
    { source: `doomscrolling ${doom.respondent_id}`, fields: doom },
    { source: `socialBehaviour ${social.user_id}`, fields: social },
    { source: `shortFormMemory ${memory.folder_id}`, fields: memory }
  ]
  return {
    seed,
    country,
    rows,
    summary: {
      age: doom.age,
      gender: doom.gender,
      occupation: doom.occupation_category,
      mainPlatform: doom.primary_platform,
      whyTheyScroll: doom.primary_motivation,
      whenTheyScroll: doom.time_of_day_most_used,
      sessionsPerDay: doom.daily_scroll_sessions_count,
      minutesPerSession: doom.avg_session_length_minutes,
      doomscrolling: doom.doomscrolling_frequency,
      preferredContent: social.preferred_content_type,
      purpose: social.primary_purpose,
      scrollSpeed: social.scroll_speed,
      likesPerDay: social.likes_given_per_day,
      commentsPerDay: social.comments_per_day,
      moodWhileScrolling: social.mood_while_scrolling,
      shortFormEngagement: memory.ENGAGE,
      socialMediaAddictionBSMARS: memory.BSMARS
    }
  }
}
