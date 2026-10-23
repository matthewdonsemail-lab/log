import type { CopyVersion, LiveCopy } from '../types'
import { MIN_COPY_VERSIONS } from '../types'
import { copyDistance } from './wordDistance'

export interface PickOptions {
  skip?: ReadonlySet<string>
  avoidId?: string | null
}

export function pickVersion(versions: readonly CopyVersion[], live: readonly LiveCopy[], options: PickOptions = {}): CopyVersion | null {
  if (!versions.length) return null
  const candidates = versions.length > 1 && options.avoidId ? versions.filter((v) => v.id !== options.avoidId) : versions
  const uses = (v: CopyVersion) => live.filter((l) => l.copyVersionId === v.id).length
  let best: { version: CopyVersion; nearest: number; uses: number; index: number } | null = null
  for (const [index, version] of candidates.entries()) {
    const nearest = live.length ? Math.min(...live.map((l) => copyDistance(version, l, options.skip))) : 1
    const entry = { version, nearest, uses: uses(version), index }
    if (!best || entry.nearest > best.nearest + 1e-9 || (Math.abs(entry.nearest - best.nearest) <= 1e-9 && (entry.uses < best.uses || (entry.uses === best.uses && entry.index < best.index)))) best = entry
  }
  return best?.version ?? null
}

export function requiredVersions(liveAfter: number): number {
  return Math.max(MIN_COPY_VERSIONS, liveAfter)
}
