import type { ChatMessage, Thread } from '../types'
import type { PlatformSeed } from '../store'

/**
 * Facebook (Messenger) seed — per connected account.
 *
 * Native shape mirrored here: each thread is a conversation object with a
 * numeric conversation id (the `thread_key` the UI payloads carry), and each
 * message has an `mid`, a `created_time`, and `from`/`to` participant ids —
 * the message ids below (`fbm_…`) stand in for the `mid` values, and
 * `platformThreadId` stands in for the conversation id.
 */
const danaWhitfield: Thread['participant'] = {
  name: 'Dana Whitfield',
  initials: 'DW',
  color: '#2A8CFF',
}
const marcusWebb: Thread['participant'] = {
  name: 'Marcus Webb',
  initials: 'MW',
  color: '#7C3AED',
}
const roisinByrne: Thread['participant'] = {
  name: 'Roisin Byrne',
  initials: 'RB',
  color: '#059669',
}
const paddyFoley: Thread['participant'] = {
  name: 'Paddy Foley',
  initials: 'PF',
  color: '#DC2626',
}

const fbPersonal: Thread[] = [
  {
    id: 'fb-t1',
    platform: 'facebook',
    accountId: 'fb-personal',
    platformThreadId: '3430291847441239',
    platformParticipantId: '100064820100774',
    participant: danaWhitfield,
    preview: 'The old tap handle is loose too — could you check that while you are at it?',
    updatedAt: '2026-09-16T09:41:00.000Z',
    unread: 2,
  },
  {
    id: 'fb-t2',
    platform: 'facebook',
    accountId: 'fb-personal',
    platformThreadId: '3429981706532118',
    platformParticipantId: '100064831200571',
    participant: marcusWebb,
    preview: 'Alright then — book me in for Saturday morning.',
    updatedAt: '2026-09-15T16:02:00.000Z',
    unread: 0,
  },
]
const fbRubbish: Thread[] = [
  {
    id: 'fb-t3',
    platform: 'facebook',
    accountId: 'fb-galway-rubbish',
    platformThreadId: '3430112458770963',
    platformParticipantId: '100064900211835',
    participant: roisinByrne,
    preview: 'Perfect, we are home all day.',
    updatedAt: '2026-09-16T14:48:00.000Z',
    unread: 1,
  },
  {
    id: 'fb-t4',
    platform: 'facebook',
    accountId: 'fb-galway-rubbish',
    platformThreadId: '3429956641020845',
    platformParticipantId: '100064911360442',
    participant: paddyFoley,
    preview: 'Yes — 120 euro per pallet up to 4 m3.',
    updatedAt: '2026-09-15T09:02:00.000Z',
    unread: 0,
  },
]

const fbPersonalMessages: Record<string, ChatMessage[]> = {
  'fb-t1': [
    {
      id: 'fb-t1-m1',
      threadId: 'fb-t1',
      from: 'me',
      platformMessageId: 'fbm_9f2ak1q7',
      body: 'Morning — is today still the right day for the faucet swap?',
      sentAt: '2026-09-16T09:12:00.000Z',
    },
    {
      id: 'fb-t1-m2',
      threadId: 'fb-t1',
      from: 'them',
      platformMessageId: 'fbm_3h7md2zx',
      body: 'Yep, 9am is still good. I will be home the whole morning.',
      sentAt: '2026-09-16T09:15:00.000Z',
    },
    {
      id: 'fb-t1-m3',
      threadId: 'fb-t1',
      from: 'me',
      platformMessageId: 'fbm_8c1tp4wb',
      body: 'Great. I will bring the classic basin faucet — should only take about 45 min.',
      sentAt: '2026-09-16T09:28:00.000Z',
    },
    {
      id: 'fb-t1-m4',
      threadId: 'fb-t1',
      from: 'them',
      platformMessageId: 'fbm_5j9vk3rn',
      body: 'Right — getting the tap ready for you.',
      sentAt: '2026-09-16T09:37:00.000Z',
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
      replyTo: { platformMessageId: 'fbm_8c1tp4wb' },
    },
    {
      id: 'fb-t1-m5',
      threadId: 'fb-t1',
      from: 'them',
      platformMessageId: 'fbm_0d4gx6sy',
      body: 'The old tap handle is loose too — could you check that while you are at it?',
      sentAt: '2026-09-16T09:41:00.000Z',
    },
  ],
  'fb-t2': [
    {
      id: 'fb-t2-m1',
      threadId: 'fb-t2',
      from: 'them',
      platformMessageId: 'fbm_7q2lw8vc',
      body: 'Hey — roughly how much for a weekend call-out on a clog? Not in a rush.',
      sentAt: '2026-09-15T15:04:00.000Z',
    },
    {
      id: 'fb-t2-m2',
      threadId: 'fb-t2',
      from: 'me',
      platformMessageId: 'fbm_4s8zn5hb',
      body: 'Sat and Sun is 450 euro flat for a full drain. If it is a simple clog, about 40 min done.',
      sentAt: '2026-09-15T15:30:00.000Z',
    },
    {
      id: 'fb-t2-m3',
      threadId: 'fb-t2',
      from: 'them',
      platformMessageId: 'fbm_1r6fy9ke',
      body: 'Alright then — book me in for Saturday morning.',
      sentAt: '2026-09-15T16:02:00.000Z',
    },
  ],
}

const fbRubbishMessages: Record<string, ChatMessage[]> = {
  'fb-t3': [
    {
      id: 'fb-t3-m1',
      threadId: 'fb-t3',
      from: 'them',
      platformMessageId: 'fbm_6t3ud1mp',
      body: 'Got the clearance quote? We want to do the whole back garden.',
      sentAt: '2026-09-16T11:20:00.000Z',
    },
    {
      id: 'fb-t3-m2',
      threadId: 'fb-t3',
      from: 'me',
      platformMessageId: 'fbm_2w9cr7da',
      body: 'I will come over Tuesday to measure — you will have the quote by Wednesday.',
      sentAt: '2026-09-16T12:05:00.000Z',
    },
    {
      id: 'fb-t3-m3',
      threadId: 'fb-t3',
      from: 'them',
      platformMessageId: 'fbm_8v5hk3jt',
      body: 'Perfect, we are home all day.',
      sentAt: '2026-09-16T14:48:00.000Z',
    },
  ],
  'fb-t4': [
    {
      id: 'fb-t4-m1',
      threadId: 'fb-t4',
      from: 'them',
      platformMessageId: 'fbm_3b7xs2qe',
      body: 'Do you do pallet-sized runs to the tip? I have about 2 m3 of garden waste.',
      sentAt: '2026-09-15T08:15:00.000Z',
    },
    {
      id: 'fb-t4-m2',
      threadId: 'fb-t4',
      from: 'me',
      platformMessageId: 'fbm_9e1gp6wm',
      body: 'Yes — 120 euro per pallet up to 4 m3. Thursday or Friday works best for us.',
      sentAt: '2026-09-15T09:02:00.000Z',
    },
  ],
}

export const FACEBOOK_SEEDS: Record<string, PlatformSeed> = {
  'fb-personal': { threads: fbPersonal, messages: fbPersonalMessages },
  'fb-galway-rubbish': { threads: fbRubbish, messages: fbRubbishMessages },
}