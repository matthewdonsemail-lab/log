import type { Database } from 'bun:sqlite'
import { existsSync } from 'node:fs'
import { modelByKey } from '../../../models/manifest/index'
import { placeOf } from '../../../models/store/index'
import { SCREEN_MODEL_KEY, SCREEN_SETTING, STREAM_IDLE_MS, STREAM_RETRY_MS } from '../types'
import type { Screener, StreamReport } from '../types'
import { screenStream } from './extract'
import { gliner2Screener } from './screen'

export interface FactStream {
  tick: () => Promise<StreamReport | null>
  stop: () => void
}

export interface FactStreamOptions {
  env?: Record<string, string | undefined>
  screener?: () => Screener
  log?: (line: string) => void
  clock?: () => number
}

export function factStream(handle: Database, options: FactStreamOptions = {}): FactStream | null {
  const env = options.env ?? process.env
  if (env[SCREEN_SETTING] === 'off') return null
  const dir = placeOf(modelByKey(SCREEN_MODEL_KEY), env)
  if (!options.screener && (!dir || !existsSync(dir))) return null
  const make = options.screener ?? (() => gliner2Screener(dir))
  const log = options.log ?? (() => undefined)
  const clock = options.clock ?? Date.now
  let screener: Screener | null = null
  let busy = false
  let retryAt = 0
  let lastLines = clock()
  const stop = () => {
    screener?.stop?.()
    screener = null
  }
  return {
    async tick() {
      if (busy || clock() < retryAt) return null
      busy = true
      try {
        screener ??= make()
        const report = await screenStream(handle, screener, new Date(clock()))
        if (report.lines) {
          lastLines = clock()
          if (report.marked) log(`facts: screened ${report.lines} new dm line(s), marked ${report.marked} for the decider`)
        } else if (clock() - lastLines > STREAM_IDLE_MS) stop()
        return report
      } catch (error) {
        retryAt = clock() + STREAM_RETRY_MS
        stop()
        log(`facts: the fact screen stopped (${error instanceof Error ? error.message : String(error)}); trying again in ${Math.round(STREAM_RETRY_MS / 60_000)} min`)
        return null
      } finally {
        busy = false
      }
    },
    stop,
  }
}
