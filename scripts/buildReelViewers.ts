#!/usr/bin/env bun
/**
 * Builds `~/.logCli/datasets/reelViewers/kuaiRand1k.json` from KuaiRand-1K's
 * standard logs (`~/.logCli/datasets/kuaiRand/KuaiRand-1K/data/log_standard_*.csv`):
 * each user's sessions in the swipe feed (`src/warmup/viewer`, rule 50).
 * Streams the CSVs line by line, one progress line per million rows (rule 26).
 *
 *   bun scripts/buildReelViewers.ts [dataDir]
 */
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { datasetsDir } from '../src/warmup/persona/index'
import { buildViewers, SWIPE_FEED_TAB, viewersPath } from '../src/warmup/viewer/index'
import type { KuaiRow, ReelViewer } from '../src/warmup/viewer/index'

const dataDir = process.argv[2] ?? join(datasetsDir(), 'kuaiRand', 'KuaiRand-1K', 'data')
const files = readdirSync(dataDir).filter((f) => /^log_standard_.*\.csv$/.test(f)).sort()
if (!files.length) {
  console.error(`no log_standard_*.csv in ${dataDir}`)
  process.exit(1)
}
const byUser = new Map<number, KuaiRow[]>()
let read = 0
for (const file of files) {
  console.error(`reading ${file}`)
  const reader = Bun.file(join(dataDir, file)).stream().pipeThrough(new TextDecoderStream()).getReader()
  let header: string[] | null = null
  let col: Record<string, number> = {}
  let rest = ''
  for (;;) {
    const { value, done } = await reader.read()
    const text = rest + (value ?? '')
    const lines = text.split('\n')
    rest = done ? '' : (lines.pop() ?? '')
    for (const line of lines) {
      if (!line.trim()) continue
      const cells = line.trim().split(',')
      if (!header) {
        header = cells
        col = Object.fromEntries(header.map((h, i) => [h, i]))
        continue
      }
      read++
      if (read % 1_000_000 === 0) console.error(`  ${read / 1_000_000}M rows`)
      if (Number(cells[col.tab]) !== SWIPE_FEED_TAB) continue
      const userId = Number(cells[col.user_id])
      const list = byUser.get(userId) ?? []
      list.push({
        userId,
        timeMs: Number(cells[col.time_ms]),
        tab: SWIPE_FEED_TAB,
        playMs: Number(cells[col.play_time_ms]),
        durationMs: Number(cells[col.duration_ms]),
        commentMs: Number(cells[col.comment_stay_time]),
        profileMs: Number(cells[col.profile_stay_time]),
        liked: Number(cells[col.is_like])
      })
      byUser.set(userId, list)
    }
    if (done) break
  }
}
console.error(`${read} rows, ${byUser.size} users in the swipe feed; cutting sessions`)
const viewers: ReelViewer[] = []
for (const rows of byUser.values()) viewers.push(...buildViewers(rows, 'kuaiRand1k'))
viewers.sort((a, b) => a.userId - b.userId)
const out = viewersPath()
mkdirSync(join(out, '..'), { recursive: true })
writeFileSync(out, JSON.stringify({ source: 'KuaiRand-1K log_standard (kuairand.com, zenodo.org/records/10439422)', built: new Date().toISOString(), viewers }))
console.error(`${viewers.length} viewers → ${out}`)
