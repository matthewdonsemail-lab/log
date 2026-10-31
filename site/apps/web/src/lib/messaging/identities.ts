import type { Participant } from './types'

/**
 * Messaging identity for a connected account — what the account is on the
 * platform itself. The unofficial browser clients see exactly these
 * identities in the native UI (X user id + @handle, Facebook person/page id,
 * Reddit username), and the mock speaks them verbatim so the normalized API
 * needs no translation layer.
 *
 * One per `MOCK_CONNECTIONS` account; ids are synthetic but shaped like
 * production values:
 *  - X: numeric user id (19 digits) + @handle
 *  - Facebook: 15-digit person/page id, no handle
 *  - Reddit: the username itself (public, no separate id)
 *
 * `self` is how the account renders on its own side of a conversation, should
 * a client ever show it.
 */
export interface MessagingIdentity {
  accountId: string
  /** Mirror of the ConnectionRecord label, for display. */
  accountLabel: string
  /** The account's platform-native id (see type-shape notes above). */
  platformUserId: string
  /** Platform handle if the platform has one; null for Facebook. */
  handle: string | null
  self: Participant
}

function selfParticipant(name: string, color: string): Participant {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
  return { name, initials: initials || '?', color }
}

export const MESSAGING_IDENTITIES: readonly MessagingIdentity[] = [
  // Facebook — person/page ids, no handles.
  {
    accountId: 'fb-galway-rubbish',
    accountLabel: 'Galway Rubbish Co',
    platformUserId: '100329084711206',
    handle: null,
    self: selfParticipant('Galway Rubbish Co', '#2A8CFF'),
  },
  {
    accountId: 'fb-pacer',
    accountLabel: 'Pacer Marketplace',
    platformUserId: '100340117286453',
    handle: null,
    self: selfParticipant('Pacer Marketplace', '#7C3AED'),
  },
  {
    accountId: 'fb-personal',
    accountLabel: 'Facebook',
    platformUserId: '100064912847365',
    handle: null,
    self: selfParticipant('Galway Plumbing', '#2A8CFF'),
  },
  // X — 19-digit user ids with @handles.
  {
    accountId: 'x-listeningkit',
    accountLabel: 'X',
    platformUserId: '1548002134917649408',
    handle: 'listeningkit',
    self: selfParticipant('ListeningKit', '#0F1419'),
  },
  {
    accountId: 'x-ops',
    accountLabel: 'drainpatrol88',
    platformUserId: '1892467001234500096',
    handle: 'drainpatrol88',
    self: selfParticipant('drainpatrol88', '#1D9BF0'),
  },
  {
    accountId: 'x-legacy',
    accountLabel: 'rustyvalve_92',
    platformUserId: '1317009284550263808',
    handle: 'rustyvalve_92',
    self: selfParticipant('rustyvalve_92', '#DC2626'),
  },
  {
    accountId: 'x-archived',
    accountLabel: 'retiredwrench',
    platformUserId: '1299383740112890880',
    handle: 'retiredwrench',
    self: selfParticipant('retiredwrench', '#6B7280'),
  },
  {
    accountId: 'x-challenge',
    accountLabel: 'flowwatch_x',
    platformUserId: '1702814665001234944',
    handle: 'flowwatch_x',
    self: selfParticipant('flowwatch_x', '#F97316'),
  },
  // Reddit — the username is the identity.
  {
    accountId: 'reddit-listeningkit',
    accountLabel: 'Reddit',
    platformUserId: 'galwaydrips',
    handle: 'galwaydrips',
    self: selfParticipant('u/galwaydrips', '#FF4500'),
  },
  {
    accountId: 'reddit-watch',
    accountLabel: 'subwatcher_dan',
    platformUserId: 'subwatcher_dan',
    handle: 'subwatcher_dan',
    self: selfParticipant('u/subwatcher_dan', '#14A800'),
  },
  {
    accountId: 'reddit-captcha',
    accountLabel: 'captcha_curtain',
    platformUserId: 'captcha_curtain',
    handle: 'captcha_curtain',
    self: selfParticipant('u/captcha_curtain', '#B45309'),
  },
]

/** Default messaging account per platform — what the dashboard selects first. */
export const DEFAULT_MESSAGING_ACCOUNT: Record<'facebook' | 'x' | 'reddit', string> = {
  facebook: 'fb-personal',
  x: 'x-ops',
  reddit: 'reddit-listeningkit',
}

export function identityFor(accountId: string): MessagingIdentity | undefined {
  return MESSAGING_IDENTITIES.find((identity) => identity.accountId === accountId)
}