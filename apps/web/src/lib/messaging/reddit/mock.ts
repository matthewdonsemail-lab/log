import type { ChatMessage, Thread } from '../types'
import type { PlatformSeed } from '../store'
import { uuid } from '../uuid'

/**
 * Reddit private-message seed — per connected account.
 *
 * Native shape mirrored here: Reddit has no conversation object. The client
 * pulls the inbox and outbox as flat listings of message children
 * (`{ data: { id, name, author, dest, subject, body, created_utc, new,
 * was_comment } }`) and groups them into threads by `first_message_name` — the
 * `t4_` fullname of the thread's first message. Each thread's
 * `platformThreadId` below is exactly that first message's `t4_` id, and every
 * message `platformMessageId` is a `t4_` fullname. Threads also carry the PM
 * `subject`.
 *
 * The app-level `id`/threadId/message `id`s are real UUIDs v4 — the canonical
 * keys the store, routes, and deep-links use — opaque and independent of any
 * username. Each id is minted at module load via the shared `uuid()` helper —
 * stable within a process (so the tests that pin the exported constants hold)
 * but fresh on every load; the store mints the same way for
 * runtime-created threads/messages.
 */

// Seeded thread (and each thread's message) app-ids are generated UUIDs v4,
// minted once at module load via the shared `uuid()` helper. Exported so the
// contract tests can pin them without hardcoding a literal.
export const REDDIT_THREAD_IDS = {
  t1: uuid(),
  t2: uuid(),
  t3: uuid()
} as const

const RET1_M = [uuid(), uuid(), uuid(), uuid(), uuid()]
const RET2_M = [uuid(), uuid(), uuid()]
const RET3_M = [uuid(), uuid()]

const dallasPlumber: Thread['participant'] = {
  name: 'dallasplumb911',
  handle: 'dallasplumb911',
  initials: 'DP',
  color: '#FF4500',
}
const diyDan: Thread['participant'] = {
  name: 'diy_dan',
  handle: 'diy_dan',
  initials: 'DD',
  color: '#14A800',
}
const hoodfixerIe: Thread['participant'] = {
  name: 'hoodfixer_ie',
  handle: 'hoodfixer_ie',
  initials: 'HF',
  color: '#0EA5E9',
}

const galwaydrips: Thread[] = [
  {
    id: REDDIT_THREAD_IDS.t1,
    platform: 'reddit',
    accountId: 'reddit-listeningkit',
    platformThreadId: 't4_ra0000001',
    platformParticipantId: 'dallasplumb911',
    participant: dallasPlumber,
    subject: 'Leak near Rivergate — what actually worked',
    preview: 'Ended up replacing a 20ft poly section and repouring the patch.',
    updatedAt: '2026-09-15T14:52:00.000Z',
    unread: 3,
  },
  {
    id: REDDIT_THREAD_IDS.t2,
    platform: 'reddit',
    accountId: 'reddit-listeningkit',
    platformThreadId: 't4_rb0000001',
    platformParticipantId: 'diy_dan',
    participant: diyDan,
    subject: 'Sink clogged — quote for a pro',
    preview: 'Thanks, I will give them a call this morning.',
    updatedAt: '2026-09-16T08:10:00.000Z',
    unread: 0,
  },
]

const subwatcher: Thread[] = [
  {
    id: REDDIT_THREAD_IDS.t3,
    platform: 'reddit',
    accountId: 'reddit-watch',
    platformThreadId: 't4_rc0000001',
    platformParticipantId: 'hoodfixer_ie',
    participant: hoodfixerIe,
    subject: 'Clogged drain, any pros near Galway?',
    preview: 'Update: shut the water off and taped it for now.',
    updatedAt: '2026-09-16T10:31:00.000Z',
    unread: 2,
  },
]

const galwaydripsMessages: Record<string, ChatMessage[]> = {
  [REDDIT_THREAD_IDS.t1]: [
    {
      id: RET1_M[0],
      threadId: REDDIT_THREAD_IDS.t1,
      from: 'them',
      platformMessageId: 't4_ra0000001',
      body: 'Found the broken floor drain in the garage slab. Sprayed water into each drain and located the one with negative pressure.',
      sentAt: '2026-09-15T14:02:00.000Z',
    },
    {
      id: RET1_M[1],
      threadId: REDDIT_THREAD_IDS.t1,
      from: 'me',
      platformMessageId: 't4_ra0000002',
      body: 'Solid write-up — which camera did you use on the drain line?',
      sentAt: '2026-09-15T14:15:00.000Z',
    },
    {
      id: RET1_M[2],
      threadId: REDDIT_THREAD_IDS.t1,
      from: 'them',
      platformMessageId: 't4_ra0000003',
      body: 'A generic 10m one, honestly — image quality was enough to see the crack.',
      sentAt: '2026-09-15T14:38:00.000Z',
    },
    {
      id: RET1_M[3],
      threadId: REDDIT_THREAD_IDS.t1,
      from: 'them',
      platformMessageId: 't4_ra0000004',
      body: 'Worst part was access — had to cut a hole in the driveway to reach the line.',
      sentAt: '2026-09-15T14:44:00.000Z',
    },
    {
      id: RET1_M[4],
      threadId: REDDIT_THREAD_IDS.t1,
      from: 'them',
      platformMessageId: 't4_ra0000005',
      body: 'Ended up replacing a 20ft poly section and repouring the patch.',
      sentAt: '2026-09-15T14:52:00.000Z',
    },
  ],
  [REDDIT_THREAD_IDS.t2]: [
    {
      id: RET2_M[0],
      threadId: REDDIT_THREAD_IDS.t2,
      from: 'them',
      platformMessageId: 't4_rb0000001',
      body: 'Kitchen sink clogged again. Anyone know a pro that does simple unclogging?',
      sentAt: '2026-09-16T07:40:00.000Z',
    },
    {
      id: RET2_M[1],
      threadId: REDDIT_THREAD_IDS.t2,
      from: 'me',
      platformMessageId: 't4_rb0000002',
      body: 'A drain patrol service does same-day calls for 120 euro flat. No upsell mid-job.',
      sentAt: '2026-09-16T07:58:00.000Z',
    },
    {
      id: RET2_M[2],
      threadId: REDDIT_THREAD_IDS.t2,
      from: 'them',
      platformMessageId: 't4_rb0000003',
      body: 'Thanks, I will give them a call this morning.',
      sentAt: '2026-09-16T08:10:00.000Z',
    },
  ],
}

const subwatcherMessages: Record<string, ChatMessage[]> = {
  [REDDIT_THREAD_IDS.t3]: [
    {
      id: RET3_M[0],
      threadId: REDDIT_THREAD_IDS.t3,
      from: 'them',
      platformMessageId: 't4_rc0000001',
      body: 'Clogged the drain moving the cupboard, water pooling. Anyone in the Galway area responding fast?',
      sentAt: '2026-09-16T10:25:00.000Z',
    },
    {
      id: RET3_M[1],
      threadId: REDDIT_THREAD_IDS.t3,
      from: 'them',
      platformMessageId: 't4_rc0000002',
      body: 'Update: shut the water off and taped it for now.',
      sentAt: '2026-09-16T10:31:00.000Z',
    },
  ],
}

export const REDDIT_SEEDS: Record<string, PlatformSeed> = {
  'reddit-listeningkit': { threads: galwaydrips, messages: galwaydripsMessages },
  'reddit-watch': { threads: subwatcher, messages: subwatcherMessages },
}