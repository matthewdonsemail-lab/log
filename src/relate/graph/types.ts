export const PROJECTOR_VERSION = 5

export const MEMORY_RECALL = 5

export const GRAPH_FILE_PREFIX = 'graph-'

export const GRAPH_FILE_SUFFIX = '.rl'

export const KEPT_SNAPSHOTS = 3

export const WRITE_BATCH = 1000

export const QUERY_ROWS = 100

export const PLATFORM_PARAM = /\$platform\b/

export const CONTEXT_CHARS = 2000

export const MENTIONED_PEOPLE = 3

export const LISTED = 5

export const TOKEN_MIN = 4

export const KEYED_LABELS: readonly string[] = ['Account', 'Identity', 'Room', 'Post', 'Server', 'Person', 'Snapshot', 'Leader', 'Community']

export const BUILD_CHILD_MS = 300_000

export const NAME_MIN = 3

export const NETWORK_LIMIT = { postChars: 280 }

export const KNOWN_RING = 4

export const KNOWN_REASON = 'known'

export const IMPORTED_REASON = 'imported'

export const APPLY_MAX_EVENTS = 20_000

export const CHECKPOINT_ROWS = 20_000

export const OPEN_RETRY_MS = 30_000

export const OPEN_RETRY_STEP_MS = 250

export type Ask = (cypher: string, params?: Record<string, unknown>) => Promise<Record<string, unknown>[]>

export interface GraphStore {
  file: string
  db: import('@relate/relate').Database
  connect: () => import('@relate/relate').Connection
  release: (conn: import('@relate/relate').Connection) => void
  close: () => void
}

export interface StoreOffset {
  throughSeq: number
  interactionsThrough: number | null
  mergesThrough: number | null
  networkStamp: string | null
  generation: number
}

export interface BuiltFile {
  file: string
  throughSeq: number
  schemaVersion: number
  builtAt: string
  ms: number
  counts: GraphCounts
  networkCounts: NetworkGraphCounts
  interactionsThrough: number
  mergesThrough: number
  networkStamp: string | null
}

export interface GraphPointer {
  file: string
  throughSeq: number
  projectorVersion: number
  schemaVersion: number
  workspace: string
  builtAt: string
  ms: number
  counts: GraphCounts
  networkCounts?: NetworkGraphCounts
  mode?: 'full' | 'applied'
  applied?: number
  stages?: Record<string, number>
  walRows?: number
  interactionsThrough?: number
  mergesThrough?: number
  networkStamp?: string | null
  generation?: number
}

export interface GraphCounts {
  accounts: number
  identities: number
  rooms: number
  posts: number
  memberOf: number
  said: number
  engaged: number
  servers: number
  inServer: number
  persons: number
  linkedTo: number
  repliedTo: number
  mentioned: number
}

export interface AccountRow {
  key: string
  platform: string
  account: string
  userId: string | null
}

export interface IdentityRow {
  key: string
  platform: string
  userId: string
  handle: string | null
  handleLower: string | null
  name: string | null
  nameLower: string | null
  labels: string[]
  aliases: string[]
  owner: boolean
  personId: string | null
  personNames: string[]
  inNetwork?: boolean
  band?: string | null
  ring?: number | null
  degree?: number | null
  fit?: number | null
  themes?: string[]
  ringReason?: string
  ringSinceMs?: number | null
  followsOwner?: boolean
  placeholder?: boolean
}

export interface ProjectionScope {
  rooms: ReadonlySet<string>
  actors: ReadonlySet<string>
  identities: ReadonlySet<string>
  memory?: boolean
}

export const MEMORY_EVENTS: readonly string[] = ['personFactRecorded', 'identityLinked', 'identityUnlinked']

export interface RoomRow {
  key: string
  platform: string
  account: string
  accountKey: string
  conversationId: string
  kind: string
  name: string | null
  server: string | null
  serverKey: string | null
  lastAtMs: number | null
}

export interface ServerRow {
  key: string
  platform: string
  serverId: string
  name: string | null
}

export interface PersonRow {
  key: string
  personId: string
  name: string | null
  ring?: number
  ringReason?: string
  ringPlatform?: string | null
  lead?: string | null
  platforms?: string[]
  accounts?: string[]
  dm?: boolean
}

export interface LinkRow {
  identity: string
  person: string
  linkedBy: string | null
  linkedAt: string | null
}

export interface PointedRow {
  from: string
  fromOwner: boolean
  to: string
  toOwner: boolean
  room: string
  times: number
  firstAtMs: number | null
  lastAtMs: number | null
}

export interface MemberRow {
  identity: string
  room: string
  firstSeenAt: string
  lastSeenAt: string
}

export interface SaidRow {
  identity: string
  room: string
  messages: number
  firstAtMs: number | null
  lastAtMs: number | null
  fromOwner: boolean
  accountKey: string
}

export interface PostRow {
  key: string
  platform: string
  account: string
  accountKey: string
  ref: string
  text: string | null
}

export interface EngagedRow {
  identity: string
  post: string | null
  accountKey: string
  kind: string
  times: number
  lastAtMs: number | null
}

export interface Projection {
  throughSeq: number
  schemaVersion: number
  accounts: AccountRow[]
  identities: IdentityRow[]
  rooms: RoomRow[]
  members: MemberRow[]
  said: SaidRow[]
  posts: PostRow[]
  engaged: EngagedRow[]
  servers: ServerRow[]
  persons: PersonRow[]
  links: LinkRow[]
  replies: PointedRow[]
  mentions: PointedRow[]
  network?: NetworkProjection
  memory?: MemoryProjection
  memoryWhole?: boolean
}

export interface MemoryProjection {
  episodes: { key: string; id: string; at: string; text: string; platform: string; room: string }[]
  facts: { key: string; id: string; text: string; slot: string; validFrom: string; validTo: string | null; closedAt: string | null; recordedAt: string; embedding: number[] | null }[]
  from: { fact: string; episode: string }[]
  about: { fact: string; subject: string; label: 'Person' | 'Identity' }[]
  supersedes: { fact: string; old: string }[]
  mentions: { episode: string; subject: string; label: 'Person' | 'Identity' }[]
}

export interface RecalledFact {
  id: string
  memory: string
  slot: string
  validFrom: string
  score: number
  evidence: string[]
  evidenceAt: string[]
  about: string[]
  replaced: string[]
}

export interface NetworkProjection {
  account: string | null
  leaders: { key: string; handle: string; handleLower: string; name: string | null; followers: number | null; world: string | null; identity: string | null }[]
  communities: { key: string; communityId: string; name: string | null; url: string | null; platform: string | null; topic: string | null }[]
  inCircle: { identity: string; leader: string }[]
  runs: { leader: string; community: string }[]
  mentioned: { from: string; to: string; times: number; lastAtMs: number | null }[]
  follows: { identity: string; accountKey: string }[]
  takeovers?: { identity: string; placeholder: string; leader?: string; moved?: boolean }[]
}

export interface NetworkGraphCounts {
  leaders: number
  communities: number
  inCircleOf: number
  runs: number
  networkMentioned: number
  follows: number
}

export interface PersonFound {
  key: string
  keys: string[]
  personId?: string | null
  platform: string
  handle: string | null
  name: string | null
}

export interface ConnectedContext {
  person: PersonFound
  talks: { account: string; kind: string; threads: number; theirs: number; ours: number; lastAtMs: number | null }[]
  engaged: { account: string; kind: string; times: number; post: string | null; lastAtMs: number | null }[]
  sharedRooms: { account: string; room: string; server: string | null; members: number }[]
  replied: { room: string; server: string | null; times: number; lastAtMs: number | null }[]
  introducers: { handle: string; rooms: number; lastDmAtMs: number | null }[]
  sameOrbit: { handle: string; posts: number }[]
  otherAccounts: string[]
  facts?: { slot: string; text: string; validFrom: string; quote: string | null }[]
}

export interface GraphVerify {
  ok: boolean
  pointer: GraphPointer | null
  expected: GraphCounts
  found: GraphCounts
  differs: string[]
  behind: number
  network?: { expected: NetworkGraphCounts; found: NetworkGraphCounts }
}

export const PRIOR_KAPPA = 0.5

export const PRIOR_FLOOR = 0.1

export const PRIOR_WEIGHT_SPOKE = 3

export const PRIOR_WEIGHT_NEAR = 1
