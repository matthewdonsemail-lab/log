import type { ChatMessage, Thread } from '../types'
import type { PlatformSeed } from '../store'

/**
 * X (Twitter) DM seed — per connected account.
 *
 * Native shape mirrored here: X ships no conversation list — the browser
 * client receives a flat feed of dm_events (`{ id, event_type, text,
 * sender_id, created_at, dm_conversation_id }`) and groups them by
 * `dm_conversation_id`, which for 1:1 DMs is `senderId-participantId` — the
 * two user ids joined with a dash. Each thread's `platformThreadId` below
 * is exactly that value, and message ids are 19-digit dm event ids.
 */
const dallasPlumber: Thread['participant'] = {
  name: 'dallasplumb911',
  handle: 'dallasplumb911',
  initials: 'DP',
  color: '#0F1419',
}
const mikeTorres: Thread['participant'] = {
  name: 'mike_torres',
  handle: 'mike_torres',
  initials: 'MT',
  color: '#1D9BF0',
}
const hometipsDal: Thread['participant'] = {
  name: 'hometips_dal',
  handle: 'hometips_dal',
  initials: 'HD',
  color: '#64748B',
}

const drainpatrol: Thread[] = [
  {
    id: 'x-t1',
    platform: 'x',
    accountId: 'x-ops',
    platformThreadId: '1892467001234500096-1740928100234123456',
    platformParticipantId: '1740928100234123456',
    participant: dallasPlumber,
    preview: 'Done, closing it out.',
    updatedAt: '2026-09-16T11:05:00.000Z',
    unread: 1,
  },
  {
    id: 'x-t2',
    platform: 'x',
    accountId: 'x-ops',
    platformThreadId: '1892467001234500096-1560118345012778890',
    platformParticipantId: '1560118345012778890',
    participant: mikeTorres,
    preview: 'Great — thanks.',
    updatedAt: '2026-09-15T18:40:00.000Z',
    unread: 0,
  },
]

const listeningkit: Thread[] = [
  {
    id: 'x-t3',
    platform: 'x',
    accountId: 'x-listeningkit',
    platformThreadId: '1548002134917649408-1622884570123345678',
    platformParticipantId: '1622884570123345678',
    participant: hometipsDal,
    preview: 'drainpatrol88 covers this area — they handled the same job for me.',
    updatedAt: '2026-09-16T08:19:00.000Z',
    unread: 0,
  },
]

const drainpatrolMessages: Record<string, ChatMessage[]> = {
  'x-t1': [
    {
      id: 'x-t1-m1',
      threadId: 'x-t1',
      from: 'them',
      platformMessageId: '1585047616894574596',
      body: 'That heater you installed on Maple — pressure is looking high again',
      sentAt: '2026-09-16T09:12:00.000Z',
    },
    {
      id: 'x-t1-m2',
      threadId: 'x-t1',
      from: 'me',
      platformMessageId: '1585048234501689213',
      body: 'Can you re-check the T&P valve? Add the gasket I loaned you last time',
      sentAt: '2026-09-16T09:30:00.000Z',
    },
    {
      id: 'x-t1-m3',
      threadId: 'x-t1',
      from: 'them',
      platformMessageId: '1585049021883745560',
      body: 'Confirmed — replaced the T&P, pressure back to 50 PSI',
      sentAt: '2026-09-16T10:41:00.000Z',
    },
    {
      id: 'x-t1-m4',
      threadId: 'x-t1',
      from: 'me',
      platformMessageId: '1585049677221094085',
      body: 'Good catch. Flagging the account notes so we watch it next visit',
      sentAt: '2026-09-16T11:02:00.000Z',
    },
    {
      id: 'x-t1-m5',
      threadId: 'x-t1',
      from: 'them',
      platformMessageId: '1585050113640218729',
      body: 'Done, closing it out.',
      sentAt: '2026-09-16T11:05:00.000Z',
    },
  ],
  'x-t2': [
    {
      id: 'x-t2-m1',
      threadId: 'x-t2',
      from: 'them',
      platformMessageId: '1584991207443826150',
      body: 'Do you do tankless installs? I am on a 40-gal tank right now and thinking about switching',
      sentAt: '2026-09-15T17:22:00.000Z',
    },
    {
      id: 'x-t2-m2',
      threadId: 'x-t2',
      from: 'me',
      platformMessageId: '1584992331554908112',
      body: 'Yes — for a ~35m2 house it runs 180k-240k euro before permits. I can send a written scope today',
      sentAt: '2026-09-15T18:10:00.000Z',
    },
    {
      id: 'x-t2-m3',
      threadId: 'x-t2',
      from: 'them',
      platformMessageId: '1584993018226745301',
      body: 'Great — thanks.',
      sentAt: '2026-09-15T18:40:00.000Z',
    },
  ],
}

const listeningkitMessages: Record<string, ChatMessage[]> = {
  'x-t3': [
    {
      id: 'x-t3-m1',
      threadId: 'x-t3',
      from: 'them',
      platformMessageId: '1585044120993817264',
      body: 'Burst pipe in the ceiling before work — anyone nearby who can get out fast?',
      sentAt: '2026-09-16T08:05:00.000Z',
    },
    {
      id: 'x-t3-m2',
      threadId: 'x-t3',
      from: 'me',
      platformMessageId: '1585044688150263917',
      body: 'drainpatrol88 covers this area — they handled the same job for me.',
      sentAt: '2026-09-16T08:19:00.000Z',
    },
  ],
}

export const X_SEEDS: Record<string, PlatformSeed> = {
  'x-ops': { threads: drainpatrol, messages: drainpatrolMessages },
  'x-listeningkit': { threads: listeningkit, messages: listeningkitMessages },
}