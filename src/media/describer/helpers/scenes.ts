import { MAX_SCENES, MIN_SCENE_SECONDS } from '../types'
import type { Describer, Scene, SpeechWord } from '../types'

export interface Span {
  start: number
  end: number
}

export function spansOf(cuts: readonly number[], seconds: number, max = MAX_SCENES, minimum = MIN_SCENE_SECONDS): Span[] {
  if (!(seconds > 0)) return [{ start: 0, end: 0 }]
  const sorted = [...new Set(cuts.filter((t) => t > 0 && t < seconds))].sort((a, b) => a - b)
  const kept: number[] = []
  for (const cut of sorted) if (cut - (kept.at(-1) ?? 0) >= minimum && seconds - cut >= minimum) kept.push(cut)
  let bounds = [0, ...kept, seconds]
  while (bounds.length - 1 > max) {
    let shortest = 1
    for (let i = 1; i < bounds.length - 1; i++) if (bounds[i + 1] - bounds[i - 1] < bounds[shortest + 1] - bounds[shortest - 1]) shortest = i
    bounds = bounds.filter((_, i) => i !== shortest)
  }
  return bounds.slice(0, -1).map((start, i) => ({ start, end: bounds[i + 1] }))
}

export function speechIn(words: readonly SpeechWord[], span: Span, last: boolean): string {
  return words.filter((w) => w.start / 1000 >= span.start && (last ? true : w.start / 1000 < span.end)).map((w) => w.text).join(' ').trim()
}

export function clock(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

export function sceneLine(scene: Scene): string {
  return `[${clock(scene.start)}-${clock(scene.end)}] screen: ${scene.screen || '(nothing described)'} | speech: ${scene.speech ? `"${scene.speech}"` : 'none'}`
}

export function timelineOf(scenes: readonly Scene[]): string {
  return scenes.map(sceneLine).join(' · ')
}

export async function describeWith(describers: readonly Describer[], input: string | Uint8Array, prompt?: string): Promise<{ text: string; model: string; tried: string[] }> {
  const tried: string[] = []
  for (const describer of describers) {
    try {
      const text = (await describer.describe(input, prompt)).trim()
      if (text) return { text, model: describer.model, tried: [...tried, `${describer.model}: ok`] }
      tried.push(`${describer.model}: empty answer`)
    } catch (error) {
      tried.push(`${describer.model}: ${error instanceof Error ? error.message : String(error)}`.slice(0, 200))
    }
  }
  throw new Error(`no describer could describe it (${tried.join('; ') || 'none loaded'})`)
}
