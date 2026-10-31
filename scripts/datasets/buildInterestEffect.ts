#!/usr/bin/env bun
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { datasetsDir } from '../../src/warmup/persona/index'
import { interestEffectPath, measureInterestEffect } from '../../src/warmup/viewer/index'
import type { TaggedPlay } from '../../src/warmup/viewer/index'

const dataDir = process.argv[2] ?? join(datasetsDir(), 'kuaiRand', 'KuaiRand-Pure', 'data')
const csv = (file: string) => {
  console.error(`reading ${file}`)
  const lines = readFileSync(join(dataDir, file), 'utf8').split(/\r\n|\n|\r/).filter(Boolean)
  const header = lines[0].split(',')
  return { col: Object.fromEntries(header.map((h, i) => [h, i])) as Record<string, number>, rows: lines.slice(1).map((l) => l.split(',')) }
}
const videos = csv('video_features_basic_pure.csv')
const tags = new Map(videos.rows.map((r) => [r[videos.col.video_id], (r[videos.col.tag] ?? '').split(',')[0]]))
const plays = (file: string): TaggedPlay[] => {
  const { col, rows } = csv(file)
  return rows
    .filter((r) => r[col.tab] === '1')
    .map((r) => ({ user: r[col.user_id], video: r[col.video_id], playMs: Number(r[col.play_time_ms]), durationMs: Number(r[col.duration_ms]), liked: r[col.is_like] === '1', commented: Number(r[col.comment_stay_time]) > 0 }))
}
const standard = [...plays('log_standard_4_08_to_4_21_pure.csv'), ...plays('log_standard_4_22_to_5_08_pure.csv')]
const random = plays('log_random_4_22_to_5_08_pure.csv')
const effect = measureInterestEffect(standard, random, (v) => tags.get(v) || undefined)
const out = interestEffectPath()
mkdirSync(join(out, '..'), { recursive: true })
writeFileSync(out, `${JSON.stringify(effect, null, 2)}\n`)
console.error(JSON.stringify(effect))
console.error(`→ ${out}`)
