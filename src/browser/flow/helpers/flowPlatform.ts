import { isPlatform, PLATFORM_SITES, PLATFORMS } from '../../../cli/runner/helpers/platforms'
import type { Platform } from '../../../cli/runner/helpers/platforms'
import type { FlowDefinition } from '../types'

export function platformOfUrl(url: string): Platform | null {
  let host: string
  try {
    host = new URL(url.replace(/\{[^}]*\}/g, 'x')).hostname.toLowerCase()
  } catch {
    return null
  }
  return PLATFORMS.find((p) => PLATFORM_SITES[p].hosts.some((h) => host === h || host.endsWith(`.${h}`))) ?? null
}

export function flowPlatform(flow: Pick<FlowDefinition, 'platform' | 'steps'>): Platform | null {
  if (isPlatform(flow.platform)) return flow.platform
  for (const step of flow.steps) {
    const found = step.url ? platformOfUrl(step.url) : null
    if (found) return found
  }
  return null
}

const capital = (word: string): string => `${word[0].toUpperCase()}${word.slice(1)}`

export function flowToolName(flow: Pick<FlowDefinition, 'name' | 'platform' | 'steps'>): string {
  const platform = isPlatform(flow.platform) ? flow.platform : null
  if (!platform) return `flow${capital(flow.name)}`
  const own = flow.name.startsWith(platform) && /[A-Z]/.test(flow.name[platform.length] ?? '') ? flow.name.slice(platform.length) : flow.name
  return `${platform}Flow${capital(own)}`
}
