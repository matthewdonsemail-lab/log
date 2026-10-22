import type { VariationParams } from '../types'

const between = (rng: () => number, min: number, max: number) => min + (max - min) * rng()
const round = (n: number, places = 3) => Math.round(n * 10 ** places) / 10 ** places

export function variationParams(rng: () => number = Math.random): VariationParams {
  const sign = () => (rng() < 0.5 ? -1 : 1)
  const blurInstead = rng() < 0.5
  return {
    crop: {
      top: round(between(rng, 0.02, 0.05)),
      right: round(between(rng, 0.02, 0.05)),
      bottom: round(between(rng, 0.02, 0.05)),
      left: round(between(rng, 0.02, 0.05))
    },
    rotate: round(sign() * between(rng, 1, 3), 2),
    brightness: round(between(rng, 0.9, 1.1)),
    saturation: round(between(rng, 0.95, 1.05)),
    hue: Math.round(sign() * between(rng, 0, 8)),
    contrast: round(between(rng, 0.9, 1.1)),
    blur: blurInstead ? round(between(rng, 0.3, 0.9), 2) : null,
    sharpen: blurInstead ? null : 0.8,
    scale: round(between(rng, 0.95, 1.05)),
    noise: round(between(rng, 0.03, 0.08)),
    quality: Math.round(between(rng, 80, 95))
  }
}
