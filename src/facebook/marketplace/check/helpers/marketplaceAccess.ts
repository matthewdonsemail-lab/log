import type { MarketplaceAccess } from '../types.ts'
import { graphqlResponses, responseTexts } from './graphqlResponses.ts'

export function objectAfter(text: string, key: string): Record<string, unknown> | null {
  const at = text.indexOf(`"${key}":{`)
  if (at < 0) return null
  const start = text.indexOf('{', at + key.length + 2)
  let depth = 0
  let inString = false
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      if (c === '\\') i++
      else if (c === '"') inString = false
    } else if (c === '"') inString = true
    else if (c === '{') depth++
    else if (c === '}' && --depth === 0) {
      try {
        return JSON.parse(text.slice(start, i + 1)) as Record<string, unknown>
      } catch {
        return null
      }
    }
  }
  return null
}

export function marketplaceAccessOf(har: unknown): MarketplaceAccess | null {
  let model: Record<string, unknown> | null = null
  for (const body of graphqlResponses(har, 'CometMarketplaceStatusContentContainerQuery')) {
    model = (body as { data?: { viewer?: { marketplaceViolationTransparencyViewModel?: Record<string, unknown> } } }).data?.viewer?.marketplaceViolationTransparencyViewModel ?? null
    if (model) break
  }
  let sell: string | null = null
  for (const text of responseTexts(har)) {
    if (!model && text.includes('"access_state_title"')) model = objectAfter(text, 'marketplaceViolationTransparencyViewModel')
    if (!sell && text.includes('"marketplace_feature_access_status"')) sell = ((objectAfter(text, 'marketplace_feature_access_status') ?? {}).sell_on_marketplace as string | undefined) ?? null
  }
  if (!model) return null
  const survey = model.csat_survey as { profile_status?: string } | undefined
  return {
    title: (model.access_state_title as string | null) ?? null,
    body: (model.access_state_body as string | null) ?? null,
    banned: model.is_marketplace_access_banned === true,
    profileStatus: survey?.profile_status ?? null,
    enforcementId: (model.enforcement_instance_id as string | null) ?? null,
    sell
  }
}

export function accessProblem(access: MarketplaceAccess): string | null {
  const said = `${access.title ?? ''} ${access.body ?? ''}`.trim()
  if (access.banned) return `Marketplace access banned: ${said}`
  if (access.sell && access.sell !== 'ELIGIBLE') return `selling on Marketplace is ${access.sell}: ${said}`
  if (access.enforcementId) return `an enforcement is on the account (${access.enforcementId}): ${said}`
  if (access.profileStatus && access.profileStatus !== 'GOOD') return `profile status ${access.profileStatus}: ${said}`
  return null
}
