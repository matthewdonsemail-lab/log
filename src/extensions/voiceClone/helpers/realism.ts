import { spawnSync } from 'node:child_process'
import { REALISM } from '../types'
import { AUDIO_TOOLS } from './audio'
import type { AudioTools } from './audio'

export type Done = { ok: true } | { ok: false; detail: string }

export function decodeSamples(path: string, filter: string | null = null, tools: AudioTools = AUDIO_TOOLS): Float32Array | null {
  const run = spawnSync(tools.ffmpeg, ['-v', 'error', '-i', path, ...(filter ? ['-af', filter] : []), '-ac', '1', '-ar', String(REALISM.rate), '-f', 'f32le', 'pipe:1'], { windowsHide: true, maxBuffer: 1024 * 1024 * 1024 })
  if (run.status !== 0 || !run.stdout?.length) return null
  const bytes = run.stdout as Buffer
  const whole = bytes.length - (bytes.length % 4)
  return new Float32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + whole))
}

export function writeSamples(samples: Float32Array, path: string, tools: AudioTools = AUDIO_TOOLS): Done {
  const run = spawnSync(tools.ffmpeg, ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(REALISM.rate), '-ac', '1', '-i', 'pipe:0', '-c:a', 'pcm_s16le', path], { input: Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength), windowsHide: true })
  return run.status === 0 ? { ok: true } : { ok: false, detail: `ffmpeg couldn't write ${path}: ${String(run.stderr || run.error?.message || `exit ${run.status}`).trim().slice(0, 300)}` }
}

export function seeded(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function gaussian(rand: () => number): number {
  return Math.sqrt(-2 * Math.log(Math.max(rand(), 1e-12))) * Math.cos(2 * Math.PI * rand())
}

export function framesDb(samples: Float32Array, hop: number): number[] {
  const out: number[] = []
  for (let i = 0; i + hop <= samples.length; i += hop) {
    let sum = 0
    for (let j = i; j < i + hop; j++) sum += samples[j] * samples[j]
    out.push(20 * Math.log10(Math.sqrt(sum / hop) + 1e-9))
  }
  return out
}

export function percentile(values: readonly number[], p: number): number {
  if (!values.length) return -Infinity
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))))]
}

export function quietPieces(samples: Float32Array): Float32Array[] {
  const hop = Math.round(REALISM.frameSeconds * REALISM.rate)
  const fade = Math.round(REALISM.fadeSeconds * REALISM.rate)
  const levels = framesDb(samples, hop)
  const floor = percentile(levels, 10)
  if (floor < REALISM.silentFloorDb) return []
  const pieces: Float32Array[] = []
  let run = 0
  levels.forEach((level, i) => {
    run = level < floor + REALISM.quietAboveFloorDb ? run + 1 : 0
    if (run < REALISM.quietFrames) return
    const piece = samples.slice((i - REALISM.quietFrames + 1) * hop, (i + 1) * hop)
    for (let k = 0; k < fade; k++) {
      piece[k] *= k / fade
      piece[piece.length - 1 - k] *= k / fade
    }
    pieces.push(piece)
    run = 0
  })
  return pieces
}

export function roomTone(pieces: readonly Float32Array[], length: number, rand: () => number): Float32Array {
  const out = new Float32Array(length)
  if (!pieces.length) return out
  const fade = Math.round(REALISM.fadeSeconds * REALISM.rate)
  let at = 0
  while (at < length) {
    const piece = pieces[Math.floor(rand() * pieces.length)]
    const start = Math.max(0, at - fade)
    for (let k = 0; k < piece.length && start + k < length; k++) out[start + k] += piece[k]
    at = start + piece.length
  }
  return out
}

export function smoothNoise(length: number, hz: number, rand: () => number): Float32Array {
  const step = Math.max(1, Math.round(REALISM.rate / hz))
  const points = Array.from({ length: Math.ceil(length / step) + 2 }, () => gaussian(rand))
  const out = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    const at = i / step
    const k = Math.floor(at)
    out[i] = points[k] + (points[k + 1] - points[k]) * (at - k)
  }
  return out
}

function scaledToStd(values: Float32Array, std: number): Float32Array {
  let mean = 0
  for (const v of values) mean += v
  mean /= values.length || 1
  let spread = 0
  for (const v of values) spread += (v - mean) ** 2
  const now = Math.sqrt(spread / (values.length || 1)) || 1
  return values.map((v) => ((v - mean) / now) * std)
}

export function shapeLikeMatt(voice: Float32Array, pieces: readonly Float32Array[], rand: () => number): Float32Array {
  const n = voice.length
  const out = new Float32Array(n)
  const gain = scaledToStd(smoothNoise(n, REALISM.movementHz, rand), REALISM.movementDb)
  const sway = smoothNoise(n, REALISM.swayHz, rand)
  let low = 0
  for (let i = 0; i < n; i++) {
    const moved = voice[i] * 10 ** (gain[i] / 20)
    const cutoff = Math.min(REALISM.cutoffMost, Math.max(REALISM.cutoffLeast, REALISM.cutoffHz + sway[i] * REALISM.cutoffSwayHz))
    const a = Math.exp((-2 * Math.PI * cutoff) / REALISM.rate)
    low = (1 - a) * moved + a * low
    out[i] = 0.5 * low + 0.5 * moved * (1 - Math.min(0.3, Math.max(-0.3, sway[i] * 0.15)))
  }
  let peak = 0
  const magnitudes = Array.from(out, (v) => Math.abs(v))
  peak = percentile(magnitudes, 99.5) || 1
  const norm = Math.tanh(REALISM.drive)
  for (let i = 0; i < n; i++) out[i] = (Math.tanh((REALISM.drive * out[i]) / peak) / norm) * peak
  const tone = roomTone(pieces, n, rand)
  if (pieces.length) {
    const hop = Math.round(REALISM.frameSeconds * REALISM.rate)
    const speech = percentile(framesDb(out, hop), 90)
    let sum = 0
    for (const v of tone) sum += v * v
    const toneDb = 20 * Math.log10(Math.sqrt(sum / (n || 1)) + 1e-9)
    const scale = 10 ** ((speech - REALISM.snrDb - toneDb) / 20)
    for (let i = 0; i < n; i++) out[i] += tone[i] * scale
  }
  let top = 0
  for (const v of out) top = Math.max(top, Math.abs(v))
  const level = 10 ** (REALISM.peakDb / 20) / (top || 1)
  for (let i = 0; i < n; i++) out[i] *= level
  return out
}

export function phoneCurveFilter(curve: readonly (readonly [number, number])[] = REALISM.phoneCurve): string {
  return `firequalizer=delay=0.1:gain_entry='${curve.map(([hz, db]) => `entry(${hz},${db})`).join(';')}'`
}

export function processLikeMatt(from: string, to: string, references: readonly string[], seed: number, tools: AudioTools = AUDIO_TOOLS): Done {
  const voice = decodeSamples(from, `${REALISM.shape},${phoneCurveFilter()}`, tools)
  if (!voice?.length) return { ok: false, detail: `ffmpeg couldn't read the spoken audio in ${from}` }
  const pieces = references.flatMap((path) => {
    const samples = decodeSamples(path, null, tools)
    return samples ? quietPieces(samples) : []
  })
  return writeSamples(shapeLikeMatt(voice, pieces, seeded(seed)), to, tools)
}
