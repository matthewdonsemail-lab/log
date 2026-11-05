import { spawnSync } from 'node:child_process'
import { INSTAGRAM_LEVELS, PLATFORM_AUDIO } from '../types'
import type { VoiceNotePlatform } from '../types'

export interface AudioTools {
  ffmpeg: string
  ffprobe: string
}

export const AUDIO_TOOLS: AudioTools = { ffmpeg: process.env.LOG_FFMPEG || 'ffmpeg', ffprobe: process.env.LOG_FFPROBE || 'ffprobe' }

export function secondsOf(path: string, tools: AudioTools = AUDIO_TOOLS): number | null {
  const probe = spawnSync(tools.ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], { encoding: 'utf8', windowsHide: true })
  const seconds = Number.parseFloat(String(probe.stdout ?? '').trim())
  return probe.status === 0 && Number.isFinite(seconds) && seconds > 0 ? seconds : null
}

export function convertFor(platform: VoiceNotePlatform, from: string, to: string, tools: AudioTools = AUDIO_TOOLS): { ok: true } | { ok: false; detail: string } {
  const run = spawnSync(tools.ffmpeg, ['-v', 'error', '-y', '-i', from, '-vn', ...PLATFORM_AUDIO[platform].args, to], { encoding: 'utf8', windowsHide: true })
  if (run.status === 0) return { ok: true }
  return { ok: false, detail: `ffmpeg couldn't make ${PLATFORM_AUDIO[platform].container}: ${String(run.stderr || run.error?.message || `exit ${run.status}`).trim().slice(0, 300)}` }
}

export function samplesOf(path: string, rate = 8000, tools: AudioTools = AUDIO_TOOLS): Int16Array {
  const run = spawnSync(tools.ffmpeg, ['-v', 'error', '-i', path, '-f', 's16le', '-ac', '1', '-ar', String(rate), 'pipe:1'], { windowsHide: true, maxBuffer: 256 * 1024 * 1024 })
  const bytes = run.status === 0 && run.stdout ? Buffer.from(run.stdout) : Buffer.alloc(0)
  return new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.length / 2))
}

export function rmsLevels(samples: Int16Array, count: number): number[] {
  if (!samples.length || count < 1) return []
  const size = Math.max(1, Math.floor(samples.length / count))
  const levels: number[] = []
  for (let c = 0; c < count && c * size < samples.length; c++) {
    let sum = 0
    const end = Math.min(samples.length, (c + 1) * size)
    for (let i = c * size; i < end; i++) sum += (samples[i] / 32768) ** 2
    levels.push(Math.sqrt(sum / (end - c * size)))
  }
  const top = Math.max(...levels)
  return top > 0 ? levels.map((l) => l / top) : levels.map(() => 0)
}

export function discordWaveform(samples: Int16Array, seconds: number): string {
  const count = Math.min(Math.max(Math.floor(seconds * 10), 32), 256)
  return Buffer.from(rmsLevels(samples, count).map((l) => Math.floor(l * 255))).toString('base64')
}

export function instagramLevels(samples: Int16Array): number[] {
  return rmsLevels(samples, INSTAGRAM_LEVELS).map((l) => Math.round(Math.max(0.05, l) * 1000) / 1000)
}
