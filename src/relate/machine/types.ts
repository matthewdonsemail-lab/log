export const MACHINE_BLOCK = 'stateMachine'

export const MACHINE_VIEWS = ['person', 'route', 'network'] as const

export type MachineView = (typeof MACHINE_VIEWS)[number]

export const MACHINE_TONES = ['gray', 'blue', 'teal', 'green', 'yellow', 'orange', 'red', 'pink', 'purple'] as const

export type MachineTone = (typeof MACHINE_TONES)[number]

export const MACHINE_DIRECTIONS = ['right', 'down'] as const

export type MachineDirection = (typeof MACHINE_DIRECTIONS)[number]

export const MACHINE_LIMITS = { states: 16, transitions: 24, chips: 6, details: 12, label: 60, note: 200, event: 40, tool: 40 } as const

export interface MachineDetail {
  label: string
  value: string
}

export interface MachineState {
  id: string
  label: string
  note?: string
  tone?: MachineTone
  count?: number
  chips?: string[]
  at?: number | null
  current?: boolean
  visited?: boolean
  initial?: boolean
  final?: boolean
  details?: MachineDetail[]
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
}

export interface StateMachineBlock {
  type: typeof MACHINE_BLOCK
  title?: string
  view?: MachineView
  direction?: MachineDirection
  summary?: string
  states: MachineState[]
  transitions: MachineTransition[]
}

export const STAGES = ['new', 'followsYou', 'nearYou', 'engaged', 'reachedOut', 'inConversation'] as const

export type Stage = (typeof STAGES)[number]

export const STAGE_FACTS: Record<Stage, { label: string; note: string; tone: MachineTone }> = {
  new: { label: 'New', note: 'Known to log, nothing between you yet', tone: 'gray' },
  followsYou: { label: 'Follows you', note: 'They follow one of your accounts', tone: 'blue' },
  nearYou: { label: 'Talks to your followers', note: 'In your groups or circles, next to people you talk to', tone: 'teal' },
  engaged: { label: 'Engaged with you', note: 'Liked, replied to or mentioned you, or wrote first', tone: 'orange' },
  reachedOut: { label: 'You reached out', note: 'You wrote to them; their answer is the next step', tone: 'yellow' },
  inConversation: { label: 'In conversation', note: 'You have both written in a direct chat', tone: 'green' },
}

export const MOVES = ['follow', 'like', 'reply', 'dm', 'read', 'notices'] as const

export type Move = (typeof MOVES)[number]

export interface MachineEdgeSpec {
  id: string
  from: Stage
  to: Stage
  event: string
  move: Move
  by: 'you' | 'them'
}

export const MACHINE_EDGES: readonly MachineEdgeSpec[] = [
  { id: 'follow', from: 'new', to: 'followsYou', event: 'follow', move: 'follow', by: 'you' },
  { id: 'like', from: 'followsYou', to: 'nearYou', event: 'like their post', move: 'like', by: 'you' },
  { id: 'reply', from: 'nearYou', to: 'engaged', event: 'reply', move: 'reply', by: 'you' },
  { id: 'theyEngaged', from: 'new', to: 'engaged', event: 'they engaged', move: 'notices', by: 'them' },
  { id: 'dm', from: 'engaged', to: 'reachedOut', event: 'DM', move: 'dm', by: 'you' },
  { id: 'intro', from: 'nearYou', to: 'reachedOut', event: 'intro', move: 'dm', by: 'you' },
  { id: 'answer', from: 'engaged', to: 'inConversation', event: 'answer their DM', move: 'dm', by: 'you' },
  { id: 'theyReplied', from: 'reachedOut', to: 'inConversation', event: 'they replied', move: 'read', by: 'them' },
]

export const PLATFORM_MOVES: Record<string, Partial<Record<Move, string>>> = {
  twitter: { follow: 'twitterFollow', like: 'twitterLike', reply: 'twitterReply', dm: 'twitterDm', read: 'twitterDms', notices: 'twitterNotifications' },
  discord: { like: 'discordReact', reply: 'discordSend', dm: 'discordSend', read: 'discordRead', notices: 'discordRead' },
  slack: { like: 'slackReact', reply: 'slackSend', dm: 'slackSend', read: 'slackRead', notices: 'slackRead' },
  instagram: { like: 'instagramReact', reply: 'instagramSend', dm: 'instagramSend', read: 'instagramDms', notices: 'instagramDms' },
  linkedin: { follow: 'linkedinConnect', like: 'linkedinLike', reply: 'linkedinMessage', dm: 'linkedinMessage', read: 'linkedinMessages', notices: 'linkedinInbox' },
  reddit: { like: 'redditVote', reply: 'redditReply', read: 'redditReadPosts', notices: 'redditReadHome' },
}

export const STUCK_AFTER_MS = 14 * 86_400_000

export const ROUTE_CONNECTORS = 3

export const NETWORK_NAMES = 3

export const RING_STAGE: Record<number, Stage> = { 1: 'engaged', 2: 'nearYou', 3: 'followsYou', 4: 'new' }

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
}

export interface StageStep {
  stage: Stage
  at: number | null
  event: string
  by: 'you' | 'them'
}

export interface PersonStanding {
  evidence: StageEvidence
  stage: Stage
  steps: StageStep[]
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
