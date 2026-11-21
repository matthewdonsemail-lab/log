export const MACHINE_BLOCK = 'stateMachine'

export const MACHINE_VIEWS = ['person', 'route', 'network'] as const

export type MachineView = (typeof MACHINE_VIEWS)[number]

export const MACHINE_FORMS = ['view', 'genui'] as const

export type MachineForm = (typeof MACHINE_FORMS)[number]

export const MACHINE_TONES = ['gray', 'blue', 'teal', 'green', 'yellow', 'orange', 'red', 'pink', 'purple'] as const

export type MachineTone = (typeof MACHINE_TONES)[number]

export const MACHINE_DIRECTIONS = ['right', 'down'] as const

export type MachineDirection = (typeof MACHINE_DIRECTIONS)[number]

export const MACHINE_LIMITS = { states: 16, transitions: 24, chips: 6, details: 12, id: 40, label: 60, note: 200, explain: 400, event: 40, tool: 40, accounts: 12, platform: 20 } as const

export const MACHINE_PLATFORMS = ['all', 'twitter', 'discord', 'instagram', 'slack', 'reddit', 'facebook', 'linkedin'] as const

export type MachinePlatform = (typeof MACHINE_PLATFORMS)[number]

export const PLATFORM_NAMES: Record<MachinePlatform, string> = { all: 'All', twitter: 'X', discord: 'Discord', instagram: 'Instagram', slack: 'Slack', reddit: 'Reddit', facebook: 'Facebook', linkedin: 'LinkedIn' }

export const PLATFORM_MARKS: Record<string, string> = { twitter: 'X', discord: 'DC', instagram: 'IG', slack: 'SL', reddit: 'RD', facebook: 'FB', linkedin: 'IN' }

export interface MachineDetail {
  label: string
  value: string
}

export interface MachineState {
  id: string
  label: string
  note?: string
  explain?: string
  tone?: MachineTone
  count?: number
  chips?: string[]
  at?: number | null
  current?: boolean
  visited?: boolean
  initial?: boolean
  final?: boolean
  details?: MachineDetail[]
  platform?: string
}

export interface MachineTransition {
  id: string
  from: string
  to: string
  event: string
  tool?: string
  by?: 'you' | 'them'
  at?: number | null
  count?: number
  taken?: boolean
  next?: boolean
  dashed?: boolean
  note?: string
  platform?: string
}

export interface MachineAccount {
  platform: string
  handle: string
  link: 'linked' | 'suggested'
}

export interface MachinePlatformView {
  platform: MachinePlatform
  count: number
  summary?: string
  states: MachineState[]
  transitions: MachineTransition[]
}

export interface StateMachineBlock {
  type: typeof MACHINE_BLOCK
  title?: string
  view?: MachineView
  direction?: MachineDirection
  summary?: string
  states: MachineState[]
  transitions: MachineTransition[]
  platform?: MachinePlatform
  accounts?: MachineAccount[]
  platforms?: MachinePlatformView[]
}

export const TIERS = ['new', 'followsYou', 'nearYou', 'engaged', 'reachedOut', 'inConversation'] as const

export type Tier = (typeof TIERS)[number]

export const STAGES = TIERS

export type Stage = string

export const SIGNALS = ['follows', 'near', 'group', 'server', 'channel', 'pointed', 'engaged', 'theyWrote', 'youWrote', 'conversation'] as const

export type Signal = (typeof SIGNALS)[number]

export const MOVES = ['follow', 'like', 'reply', 'dm', 'read', 'notices', 'search'] as const

export type Move = (typeof MOVES)[number]

export interface LadderState {
  id: string
  label: string
  note: string
  tone: MachineTone
  tier: Tier
  theirTier?: Tier
  signals: readonly Signal[]
  arrived: string
}

export interface MachineEdgeSpec {
  id: string
  from: Stage
  to: Stage
  event: string
  move?: Move
  by: 'you' | 'them'
  needs?: readonly Signal[]
  unless?: readonly Signal[]
  note?: string
}

export interface Ladder {
  states: readonly LadderState[]
  edges: readonly MachineEdgeSpec[]
  tools: Partial<Record<Move, string>>
}

const NEW_STATE: LadderState = { id: 'new', label: 'New', note: 'Known to log, nothing between you yet', tone: 'gray', tier: 'new', signals: [], arrived: 'met' }

const TALKING: LadderState = { id: 'inConversation', label: 'In conversation', note: 'You have both written in a direct chat', tone: 'green', tier: 'inConversation', signals: ['conversation'], arrived: 'you both wrote' }

const DM_OPENED: LadderState = { id: 'dmOpened', label: 'DM opened', note: 'A direct chat, opened by them or by you', tone: 'yellow', tier: 'reachedOut', theirTier: 'engaged', signals: ['theyWrote', 'youWrote'], arrived: 'a DM opened' }

const DM_ENDS: readonly MachineEdgeSpec[] = [
  { id: 'dmNew', from: 'new', to: 'dmOpened', event: 'DM them', move: 'dm', by: 'you' },
  { id: 'theyDmed', from: 'new', to: 'dmOpened', event: 'they DMed you', move: 'read', by: 'them' },
  { id: 'answer', from: 'dmOpened', to: 'inConversation', event: 'answer their DM', move: 'dm', by: 'you', needs: ['theyWrote'], unless: ['youWrote'] },
  { id: 'theyReplied', from: 'dmOpened', to: 'inConversation', event: 'they replied', move: 'read', by: 'them', needs: ['youWrote'], unless: ['theyWrote'] },
]

export const LADDERS: Record<MachinePlatform, Ladder> = {
  all: {
    states: [
      NEW_STATE,
      { id: 'followsYou', label: 'Follows you', note: 'They follow or connected with one of your accounts', tone: 'blue', tier: 'followsYou', signals: ['follows'], arrived: 'they followed' },
      { id: 'nearYou', label: 'Near you', note: 'Shares a server, channel, group or circle with you', tone: 'teal', tier: 'nearYou', signals: ['near', 'group', 'server', 'channel'], arrived: 'joined your places' },
      { id: 'engaged', label: 'Engaged with you', note: 'Liked, replied, mentioned or reacted, or wrote first', tone: 'orange', tier: 'engaged', signals: ['engaged', 'pointed', 'theyWrote'], arrived: 'they engaged' },
      { id: 'reachedOut', label: 'You reached out', note: 'You wrote to them; their answer is the next step', tone: 'yellow', tier: 'reachedOut', signals: ['youWrote'], arrived: 'you wrote' },
      TALKING,
    ],
    edges: [
      { id: 'follow', from: 'new', to: 'followsYou', event: 'they follow you', by: 'them' },
      { id: 'like', from: 'followsYou', to: 'nearYou', event: 'share a place', by: 'them' },
      { id: 'reply', from: 'nearYou', to: 'engaged', event: 'engage', by: 'you' },
      { id: 'theyEngaged', from: 'new', to: 'engaged', event: 'they engaged', by: 'them' },
      { id: 'dm', from: 'engaged', to: 'reachedOut', event: 'reach out', by: 'you' },
      { id: 'intro', from: 'nearYou', to: 'reachedOut', event: 'intro', by: 'you', note: 'through a connector' },
      { id: 'answer', from: 'engaged', to: 'inConversation', event: 'answer them', by: 'you' },
      { id: 'theyReplied', from: 'reachedOut', to: 'inConversation', event: 'they replied', by: 'them' },
    ],
    tools: {},
  },
  twitter: {
    states: [
      NEW_STATE,
      { id: 'followsYou', label: 'Follows you', note: 'They follow one of your accounts', tone: 'blue', tier: 'followsYou', signals: ['follows'], arrived: 'they followed' },
      { id: 'nearYou', label: 'In your groups or circles', note: 'In a group chat with you, or next to people you talk to', tone: 'teal', tier: 'nearYou', signals: ['near'], arrived: 'joined your circles' },
      { id: 'engaged', label: 'Engaged with you', note: 'Liked, replied, quoted, reposted or mentioned you, or DMed first', tone: 'orange', tier: 'engaged', signals: ['engaged', 'theyWrote'], arrived: 'they engaged' },
      { id: 'reachedOut', label: 'You reached out', note: 'You DMed them; their answer is the next step', tone: 'yellow', tier: 'reachedOut', signals: ['youWrote'], arrived: 'you DMed' },
      TALKING,
    ],
    edges: [
      { id: 'follow', from: 'new', to: 'followsYou', event: 'follow', move: 'follow', by: 'you' },
      { id: 'like', from: 'followsYou', to: 'nearYou', event: 'like their post', move: 'like', by: 'you' },
      { id: 'reply', from: 'nearYou', to: 'engaged', event: 'reply', move: 'reply', by: 'you' },
      { id: 'theyEngaged', from: 'new', to: 'engaged', event: 'they engaged', move: 'notices', by: 'them' },
      { id: 'dm', from: 'engaged', to: 'reachedOut', event: 'DM', move: 'dm', by: 'you', unless: ['theyWrote'] },
      { id: 'intro', from: 'nearYou', to: 'reachedOut', event: 'intro', move: 'dm', by: 'you', note: 'through a connector' },
      { id: 'answer', from: 'engaged', to: 'inConversation', event: 'answer their DM', move: 'dm', by: 'you', needs: ['theyWrote'], unless: ['youWrote'] },
      { id: 'theyReplied', from: 'reachedOut', to: 'inConversation', event: 'they replied', move: 'read', by: 'them' },
    ],
    tools: { follow: 'twitterFollow', like: 'twitterLike', reply: 'twitterReply', dm: 'twitterDm', read: 'twitterDms', notices: 'twitterNotifications' },
  },
  discord: {
    states: [
      NEW_STATE,
      { id: 'sharesServer', label: 'Shares a server', note: 'In a server you are in', tone: 'blue', tier: 'nearYou', signals: ['server'], arrived: 'in a server with you' },
      { id: 'sameChannel', label: 'Same channel', note: 'You both write in the same channel or group', tone: 'teal', tier: 'nearYou', signals: ['channel'], arrived: 'in a channel with you' },
      { id: 'mentioned', label: 'Replied or mentioned', note: 'Replied to or mentioned each other in a channel', tone: 'orange', tier: 'engaged', signals: ['pointed'], arrived: 'replied or mentioned' },
      DM_OPENED,
      TALKING,
    ],
    edges: [
      { id: 'server', from: 'new', to: 'sharesServer', event: 'in a server with you', move: 'search', by: 'them' },
      { id: 'write', from: 'sharesServer', to: 'sameChannel', event: 'write in their channel', move: 'reply', by: 'you' },
      { id: 'mention', from: 'sameChannel', to: 'mentioned', event: 'reply or mention them', move: 'reply', by: 'you' },
      { id: 'dm', from: 'mentioned', to: 'dmOpened', event: 'DM them', move: 'dm', by: 'you' },
      { id: 'dmChannel', from: 'sameChannel', to: 'dmOpened', event: 'DM them', move: 'dm', by: 'you' },
      ...DM_ENDS,
    ],
    tools: { reply: 'discordSend', dm: 'discordSend', read: 'discordRead', notices: 'discordRead', search: 'discordSearch', like: 'discordReact' },
  },
  instagram: {
    states: [
      NEW_STATE,
      { id: 'sharesGroup', label: 'Shares a group', note: 'In a group chat with you', tone: 'teal', tier: 'nearYou', signals: ['group'], arrived: 'in a group with you' },
      { id: 'reacted', label: 'Reacted to you', note: 'Liked or reacted to your message or post', tone: 'orange', tier: 'engaged', signals: ['engaged'], arrived: 'they reacted' },
      DM_OPENED,
      TALKING,
    ],
    edges: [
      { id: 'group', from: 'new', to: 'sharesGroup', event: 'in a group with you', move: 'read', by: 'them' },
      { id: 'theyReacted', from: 'new', to: 'reacted', event: 'they reacted', move: 'notices', by: 'them' },
      { id: 'dmGroup', from: 'sharesGroup', to: 'dmOpened', event: 'DM them', move: 'dm', by: 'you' },
      { id: 'dm', from: 'reacted', to: 'dmOpened', event: 'DM them', move: 'dm', by: 'you' },
      ...DM_ENDS,
    ],
    tools: { like: 'instagramReact', reply: 'instagramSend', dm: 'instagramSend', read: 'instagramDms', notices: 'instagramDms' },
  },
  slack: {
    states: [
      NEW_STATE,
      { id: 'sharesWorkspace', label: 'Shares a workspace', note: 'In a workspace you are in', tone: 'blue', tier: 'nearYou', signals: ['server'], arrived: 'in a workspace with you' },
      { id: 'sameChannel', label: 'Same channel', note: 'You both write in the same channel', tone: 'teal', tier: 'nearYou', signals: ['channel', 'group'], arrived: 'in a channel with you' },
      { id: 'mentioned', label: 'Mentioned or reacted', note: 'Replied to, mentioned or reacted to each other', tone: 'orange', tier: 'engaged', signals: ['pointed', 'engaged'], arrived: 'mentioned or reacted' },
      DM_OPENED,
      TALKING,
    ],
    edges: [
      { id: 'workspace', from: 'new', to: 'sharesWorkspace', event: 'in a workspace with you', move: 'read', by: 'them' },
      { id: 'write', from: 'sharesWorkspace', to: 'sameChannel', event: 'write in their channel', move: 'reply', by: 'you' },
      { id: 'mention', from: 'sameChannel', to: 'mentioned', event: 'mention or react', move: 'like', by: 'you' },
      { id: 'dm', from: 'mentioned', to: 'dmOpened', event: 'DM them', move: 'dm', by: 'you' },
      { id: 'dmChannel', from: 'sameChannel', to: 'dmOpened', event: 'DM them', move: 'dm', by: 'you' },
      ...DM_ENDS,
    ],
    tools: { like: 'slackReact', reply: 'slackSend', dm: 'slackSend', read: 'slackRead', notices: 'slackRead' },
  },
  reddit: {
    states: [NEW_STATE, { id: 'engaged', label: 'Replied to you', note: 'Replied to or mentioned you', tone: 'orange', tier: 'engaged', signals: ['engaged', 'pointed'], arrived: 'they replied' }],
    edges: [
      { id: 'reply', from: 'new', to: 'engaged', event: 'reply to their post', move: 'reply', by: 'you' },
      { id: 'theyEngaged', from: 'new', to: 'engaged', event: 'they replied', move: 'notices', by: 'them' },
    ],
    tools: { like: 'redditVote', reply: 'redditReply', read: 'redditReadPosts', notices: 'redditReadHome' },
  },
  facebook: {
    states: [NEW_STATE, { id: 'sharesGroup', label: 'Shares a group', note: 'In a group or group chat with you', tone: 'teal', tier: 'nearYou', signals: ['group', 'server'], arrived: 'in a group with you' }, DM_OPENED, TALKING],
    edges: [{ id: 'group', from: 'new', to: 'sharesGroup', event: 'in a group with you', by: 'them' }, { id: 'dmGroup', from: 'sharesGroup', to: 'dmOpened', event: 'DM them', move: 'dm', by: 'you' }, ...DM_ENDS],
    tools: {},
  },
  linkedin: {
    states: [
      NEW_STATE,
      { id: 'connected', label: 'Connected', note: 'Connected with your account', tone: 'blue', tier: 'followsYou', signals: ['follows'], arrived: 'connected' },
      { id: 'engaged', label: 'Engaged with you', note: 'Liked, commented on or mentioned your post', tone: 'orange', tier: 'engaged', signals: ['engaged', 'pointed'], arrived: 'they engaged' },
      DM_OPENED,
      TALKING,
    ],
    edges: [
      { id: 'connect', from: 'new', to: 'connected', event: 'connect', move: 'follow', by: 'you' },
      { id: 'like', from: 'connected', to: 'engaged', event: 'like their post', move: 'like', by: 'you' },
      { id: 'theyEngaged', from: 'new', to: 'engaged', event: 'they engaged', move: 'notices', by: 'them' },
      { id: 'dmConnected', from: 'connected', to: 'dmOpened', event: 'message them', move: 'dm', by: 'you' },
      { id: 'dm', from: 'engaged', to: 'dmOpened', event: 'message them', move: 'dm', by: 'you' },
      ...DM_ENDS,
    ],
    tools: { follow: 'linkedinConnect', like: 'linkedinLike', reply: 'linkedinMessage', dm: 'linkedinMessage', read: 'linkedinMessages', notices: 'linkedinInbox' },
  },
}

export const ladderOf = (platform: string): Ladder => LADDERS[platform as MachinePlatform] ?? LADDERS.all

export const STAGE_FACTS: Record<Tier, { label: string; note: string; tone: MachineTone }> = Object.fromEntries(LADDERS.all.states.map((s) => [s.id, { label: s.label, note: s.note, tone: s.tone }])) as Record<Tier, { label: string; note: string; tone: MachineTone }>

export const MACHINE_EDGES: readonly MachineEdgeSpec[] = LADDERS.all.edges

export const PLATFORM_MOVES: Record<string, Partial<Record<Move, string>>> = Object.fromEntries(Object.entries(LADDERS).filter(([, l]) => Object.keys(l.tools).length).map(([p, l]) => [p, l.tools]))

export const STUCK_AFTER_MS = 14 * 86_400_000

export const ROUTE_CONNECTORS = 3

export const MACHINE_READ_MS = 60_000

export const NETWORK_NAMES = 3

export const RING_TIER: Record<number, Tier> = { 1: 'engaged', 2: 'nearYou', 3: 'followsYou', 4: 'new' }

export const INTRODUCERS = 3

export const MACHINE_REFUSALS = ['relateMachineNoGraph', 'relateMachineNobody'] as const

export interface StageEvidence {
  key: string
  personId: string | null
  platform: string
  handle: string | null
  name: string | null
  ring: number | null
  followedAt: number | null
  follows: boolean
  nearAt: number | null
  near: string[]
  engagedAt: number | null
  engagedHow: string | null
  theyWroteAt: number | null
  youWroteAt: number | null
  lastAt: number | null
  from?: Partial<Record<EvidenceTime, string>>
  rooms?: RoomFact[]
  pointedAt?: number | null
  pointedBy?: 'you' | 'them'
  pointedIn?: string | null
  introducers?: string[]
}

export interface RoomFact {
  key: string
  name: string | null
  server: string | null
  kind: string
  theirAt: number | null
  ownerAt: number | null
}

export type EvidenceTime = 'followedAt' | 'nearAt' | 'engagedAt' | 'theyWroteAt' | 'youWroteAt'

export interface StageStep {
  stage: Stage
  at: number | null
  event: string
  by: 'you' | 'them'
  platform?: string
  tier?: Tier
  where?: string
  chip?: string
}

export interface PersonStanding {
  evidence: StageEvidence
  platform: string
  stage: Stage
  tier: Tier
  steps: StageStep[]
  lanes?: PersonStanding[]
}

export interface RouteLink {
  key: string
  handle: string
  platform: string
  stage: Stage
  reasons: string[]
  score: number
  lastAt: number | null
}
