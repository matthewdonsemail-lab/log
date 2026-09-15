import type { ChatMessage, Thread } from '../types'
import type { PlatformSeed } from '../store'

/**
 * Reddit private-message seed — per connected account.
 *
 * Native shape mirrored here: Reddit has no conversation object. The client
 * pulls the inbox and outbox as flat listings of message children
 * (`{ data: { id, name, author, dest, subject, body, created_utc, new,
 * was_comment } }`) and groups them into threads by `first_message_name` —
 * the `t4_` fullname of the thread's first message. Each thread's
 * `platformThreadId` below is exactly that first message's id, and every
 * message id is a `t4_` fullname. Threads also carry the PM `subject`.
 */
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
    id: 're-t1',
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
    id: 're-t2',
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
    id: 're-t3',
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
  're-t1': [
    {
      id: 're-t1-m1',
      threadId: 're-t1',
      from: 'them',
      platformMessageId: 't4_ra0000001',
      body: 'Found the broken floor drain in the garage slab. Sprayed water into each drain and located the one with negative pressure.',
      sentAt: '2026-09-15T14:02:00.000Z',
    },
    {
      id: 're-t1-m2',
      threadId: 're-t1',
      from: 'me',
      platformMessageId: 't4_ra0000002',
      body: 'Solid write-up — which camera did you use on the drain line?',
      sentAt: '2026-09-15T14:15:00.000Z',
    },
    {
      id: 're-t1-m3',
      threadId: 're-t1',
      from: 'them',
      platformMessageId: 't4_ra0000003',
      body: 'A generic 10m one, honestly — image quality was enough to see the crack.',
      sentAt: '2026-09-15T14:38:00.000Z',
    },
    {
      id: 're-t1-m4',
      threadId: 're-t1',
      from: 'them',
      platformMessageId: 't4_ra0000004',
      body: 'Worst part was access — had to cut a hole in the driveway to reach the line.',
      sentAt: '2026-09-15T14:44:00.000Z',
    },
    {
      id: 're-t1-m5',
      threadId: 're-t1',
      from: 'them',
      platformMessageId: 't4_ra0000005',
      body: 'Ended up replacing a 20ft poly section and repouring the patch.',
      sentAt: '2026-09-15T14:52:00.000Z',
    },
  ],
  're-t2': [
    {
      id: 're-t2-m1',
      threadId: 're-t2',
      from: 'them',
      platformMessageId: 't4_rb0000001',
      body: 'Kitchen sink clogged again. Anyone know a pro that does simple unclogging?',
      sentAt: '2026-09-16T07:40:00.000Z',
    },
    {
      id: 're-t2-m2',
      threadId: 're-t2',
      from: 'me',
      platformMessageId: 't4_rb0000002',
      body: 'A drain patrol service does same-day calls for 120 euro flat. No upsell mid-job.',
      sentAt: '2026-09-16T07:58:00.000Z',
    },
    {
      id: 're-t2-m3',
      threadId: 're-t2',
      from: 'them',
      platformMessageId: 't4_rb0000003',
      body: 'Thanks, I will give them a call this morning.',
      sentAt: '2026-09-16T08:10:00.000Z',
    },
  ],
}

const subwatcherMessages: Record<string, ChatMessage[]> = {
  're-t3': [
    {
      id: 're-t3-m1',
      threadId: 're-t3',
      from: 'them',
      platformMessageId: 't4_rc0000001',
      body: 'Clogged the drain moving the cupboard, water pooling. Anyone in the Galway area responding fast?',
      sentAt: '2026-09-16T10:25:00.000Z',
    },
    {
      id: 're-t3-m2',
      threadId: 're-t3',
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