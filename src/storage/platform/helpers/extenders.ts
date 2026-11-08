import type { EventInput, ExtenderContext, InteractionRow, PlatformExtender } from '../types'
import { makeExtender } from './base'
import { isBareId, textOf } from './ids'

function pairOf(conversationId: string): [string, string] | null {
  const parts = conversationId.split(/[:-]/)
  return parts.length === 2 && parts.every((p) => /^\d+$/.test(p)) ? [parts[0], parts[1]] : null
}

function twitterSender(event: EventInput, context: ExtenderContext): string | null {
  const pair = pairOf(event.conversationId)
  if (!pair) return null
  if (isBareId(event.with) && pair.includes(event.with.replace(/^@/, ''))) return event.with.replace(/^@/, '')
  const owner = context.ownerIdOf(event.platform, event.account)
  return owner && pair.includes(owner) ? pair.find((id) => id !== owner) ?? null : null
}

function twitterOwner(event: EventInput, context: ExtenderContext): string | null {
  const pair = pairOf(event.conversationId)
  if (event.type === 'ownMessage' && pair && isBareId(event.with) && pair.includes(event.with)) return event.with
  return context.ownerIdOf(event.platform, event.account)
}

function twitterInteraction(event: EventInput): InteractionRow | null {
  if (event.type !== 'notification') return null
  const p = event.payload
  const actor = textOf(p.userId)
  const kind = textOf(p.kind)
  if (!actor || !kind) return null
  return { interactionKey: `twitter:${event.account}:${textOf(p.key) ?? event.eventId}`, kind, actorUserId: actor, targetRef: textOf(p.postId) ?? textOf(p.tweetId), targetText: textOf(p.postText), text: textOf(p.text), at: textOf(p.at) ?? event.receivedAt }
}

function slackInteraction(event: EventInput): InteractionRow | null {
  if (event.type !== 'reaction_added') return null
  const actor = textOf(event.payload.user)
  if (!actor) return null
  return { interactionKey: `slack:${event.account}:${event.eventId}`, kind: 'reaction', actorUserId: actor, targetRef: textOf(event.payload.ts), targetText: null, text: textOf(event.payload.reaction), at: event.sourceAt || event.receivedAt }
}

export const twitterExtender = makeExtender({
  platform: 'twitter',
  chatKind: (e) => (e.conversationId.startsWith('g') ? 'group' : 'dm'),
  senderIdOf: twitterSender,
  ownerIdOf: twitterOwner,
  toInteraction: twitterInteraction,
  toIdentities: (e) => {
    if (e.type !== 'notification') return []
    const userId = textOf(e.payload.userId)
    return userId ? [{ platform: 'twitter', userId, handle: textOf(e.payload.handle), displayName: textOf(e.payload.name) }] : []
  },
})

export const discordExtender = makeExtender({
  platform: 'discord',
  chatKind: (e) => (textOf(e.payload.serverId) ?? textOf(e.payload.guildId) ? 'channel' : e.box === 'group' ? 'group' : 'dm'),
  serverIdOf: (e) => textOf(e.payload.serverId) ?? textOf(e.payload.guildId),
})

export const slackExtender = makeExtender({
  platform: 'slack',
  chatKind: (e) => (e.conversationId.startsWith('D') ? 'dm' : e.conversationId.startsWith('G') ? 'group' : 'channel'),
  serverIdOf: (e) => textOf(e.payload.workspace) ?? textOf(e.payload.teamId),
  toInteraction: slackInteraction,
})

export const instagramExtender = makeExtender({
  platform: 'instagram',
  chatKind: () => 'dm',
})

export const redditExtender = makeExtender({
  platform: 'reddit',
  chatKind: () => 'dm',
})

export const EXTENDERS: Readonly<Record<string, PlatformExtender>> = {
  twitter: twitterExtender,
  discord: discordExtender,
  slack: slackExtender,
  instagram: instagramExtender,
  reddit: redditExtender,
}

export function extenderOf(platform: string): PlatformExtender {
  return EXTENDERS[platform] ?? makeExtender({ platform, chatKind: () => 'dm' })
}
