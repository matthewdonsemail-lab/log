import { IDENTITY_PROFILE_EXTRA_KEYS } from '../types'
import type { IdentityProfileExtra, IdentityProfileExtraKey, IdentityProfileFields } from '../types'
import { textOf } from './ids'

export interface ProfileSighting {
  userId: string
  handle: string | null
  displayName: string | null
  fields: IdentityProfileFields
}

const numberOf = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null)

const flagOf = (value: unknown): boolean | null => (typeof value === 'boolean' ? value : null)

export function profileExtraOf(extra: Record<string, unknown> | null | undefined): IdentityProfileExtra | null {
  if (!extra) return null
  const out: IdentityProfileExtra = {}
  for (const key of IDENTITY_PROFILE_EXTRA_KEYS) {
    const value = extra[key]
    if (typeof value === 'string' ? value.trim() !== '' : typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) out[key as IdentityProfileExtraKey] = value as string | number | boolean
  }
  return Object.keys(out).length ? out : null
}

export function profileFieldsOf(fields: IdentityProfileFields): IdentityProfileFields | null {
  const out: IdentityProfileFields = {}
  const bio = textOf(fields.bio)
  if (bio) out.bio = bio
  const avatarHash = textOf(fields.avatarHash)
  if (avatarHash) out.avatarHash = avatarHash
  const followerCount = numberOf(fields.followerCount)
  if (followerCount !== null) out.followerCount = followerCount
  const verified = flagOf(fields.verified)
  if (verified !== null) out.verified = verified
  const extra = profileExtraOf(fields.extra as Record<string, unknown> | null | undefined)
  if (extra) out.extra = extra
  return Object.keys(out).length ? out : null
}

function sighting(answer: Record<string, unknown>, displayName: unknown, fields: IdentityProfileFields): ProfileSighting | null {
  const userId = textOf(answer.userId)
  if (!userId) return null
  return { userId, handle: textOf(answer.screenName), displayName: textOf(displayName), fields }
}

export function discordAvatarUrl(answer: Record<string, unknown>): string | null {
  const userId = textOf(answer.userId)
  const avatar = textOf(answer.avatar)
  return userId && avatar && /^(a_)?[0-9a-f]{32}$/.test(avatar) ? `https://cdn.discordapp.com/avatars/${userId}/${avatar}.png` : null
}

const SESSION_PROFILES: Readonly<Record<string, (answer: Record<string, unknown>) => ProfileSighting | null>> = {
  twitter: (answer) => sighting(answer, answer.name, {}),
  discord: (answer) => sighting(answer, answer.globalName, { verified: flagOf(answer.verified), extra: { pictureUrl: discordAvatarUrl(answer) ?? undefined } }),
  linkedin: (answer) => sighting(answer, answer.name, { extra: { premium: flagOf(answer.premium) ?? undefined } }),
}

export function sessionProfileOf(platform: string, answer: Record<string, unknown>): ProfileSighting | null {
  if (answer.ok !== true || answer.loginState !== 'loggedIn') return null
  return SESSION_PROFILES[platform]?.(answer) ?? null
}

export function twitterFollowerProfile(follower: Record<string, unknown>): ProfileSighting | null {
  const userId = textOf(follower.userId)
  if (!userId) return null
  return {
    userId,
    handle: textOf(follower.handle),
    displayName: textOf(follower.name),
    fields: {
      bio: textOf(follower.bio),
      followerCount: numberOf(follower.followers),
      extra: { location: textOf(follower.location) ?? undefined, followingCount: numberOf(follower.following) ?? undefined, postCount: numberOf(follower.posts) ?? undefined, canDm: flagOf(follower.canDm) ?? undefined, protected: flagOf(follower.protected) ?? undefined, joinedAt: textOf(follower.createdAt) ?? undefined, pictureUrl: textOf(follower.pictureUrl) ?? undefined },
    },
  }
}
