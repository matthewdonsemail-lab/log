export const MATCHES_SHOWN = 3

export const MIN_PHRASE_WORDS = 2

export const SHORT_PROMPT_WORDS = 3

export const TOP_K = 5

export const DENSE_WEIGHT = 0.7

export const WINDOW_WORDS = 14

export const WINDOW_STEP = 7

export const ASK_HEAD_WORDS = 120

export const ASK_TAIL_WORDS = 40

export const DEFAULT_THRESHOLD = 0.63

export const DEFAULT_MENU_FLOOR = 0.4375

export const AMBIGUITY_BAND = 0.03

export const WORD_THRESHOLD = 0.6

export const WORD_MENU_FLOOR = 0.5

export const WORD_AMBIGUITY_BAND = 0.1

export const PLATFORM_BONUS = 0.1

export const FALSE_FIRE_CAP = 0.03

export const ROUTE_UTTERANCES_FILE = 'utterances.json'

export const THRESHOLDS_FILE = 'thresholds.json'

export const GOLDEN_FILE = 'golden.json'

export const NOT_A_PROMPT: readonly RegExp[] = [/<task-notification>/i, /^\s*</, /^\[SYSTEM NOTIFICATION/i, /This session is being continued from a previous conversation/i]

export const STOP_WORDS: ReadonlySet<string> = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'bro', 'but', 'can', 'could', 'do', 'for', 'from', 'get', 'go', 'going', 'got', 'had', 'has', 'have', 'he', 'her', 'him', 'his', 'how', 'i', 'if', 'im', 'in', 'into', 'is', 'it', 'its', 'just', 'like', 'make', 'me', 'my', 'need', 'now', 'of', 'on', 'or', 'our', 'out', 'over', 'so', 'some', 'that', 'the', 'their', 'them', 'then', 'there', 'they', 'this', 'to', 'up', 'us', 'want', 'was', 'we', 'what', 'when', 'which', 'who', 'will', 'with', 'would', 'yeah', 'yo', 'you', 'your',
])

export const PLATFORM_WORDS: Readonly<Record<string, string>> = {
  twitter: 'twitter',
  x: 'twitter',
  tweet: 'twitter',
  retweet: 'twitter',
  retweeted: 'twitter',
  discord: 'discord',
  server: 'discord',
  guild: 'discord',
  slack: 'slack',
  workspace: 'slack',
  reddit: 'reddit',
  subreddit: 'reddit',
  upvote: 'reddit',
  instagram: 'instagram',
  insta: 'instagram',
  ig: 'instagram',
  facebook: 'facebook',
  fb: 'facebook',
  marketplace: 'facebook',
  messenger: 'facebook',
  linkedin: 'linkedin',
  tiktok: 'tiktok',
}

export const PLATFORM_FOLDERS: ReadonlySet<string> = new Set(Object.values(PLATFORM_WORDS))

export interface RoutableUseCase {
  id: string
  title: string
  asks: string
}

export interface PlayMatch {
  id: string
  title: string
  score: number
  phrase: string
}

export interface Utterance {
  route: string
  text: string
}

export interface RouteIndex {
  model: string
  useCases: RoutableUseCase[]
  utterances: Utterance[]
  extra: Utterance[]
  vectors: Float32Array[]
  vocabulary: Set<string>
  titles: Map<string, string>
}

export type DenseScores = ReadonlyMap<string, { score: number; text: string }>

export interface RouteContext {
  useCases: readonly RoutableUseCase[]
  extra?: readonly Utterance[]
  dense?: DenseScores
  thresholds?: Thresholds
  vocabulary?: ReadonlySet<string> | null
}

export type RouteOutcome = 'play' | 'menu' | 'none'

export interface RouteDecision {
  outcome: RouteOutcome
  play: PlayMatch | null
  matches: PlayMatch[]
  ranked: PlayMatch[]
  menu: PlayMatch[]
  platforms: string[]
  skipped?: 'notAPrompt' | 'trivial'
  corrected: string[]
  ms: { correct: number; embed: number; score: number; total: number }
}

export interface GoldenPrompt {
  prompt: string
  expect: string
  menu?: string
  note?: string
}

export type Thresholds = Record<string, number>

export type EmbedTexts = (texts: string[]) => Promise<Float32Array[]>

export const TOOL_INDEX_FILE = 'tools.json'

export const TOOL_GOLDEN_FILE = 'toolGolden.json'

export const TOOLS_SHOWN = 4

export const TOOL_MIN_SCORE = 4

export const TOOL_PLATFORM_BONUS = 0.3

export const PLATFORM_NAME_ALIASES: readonly string[] = ['x', 'insta', 'ig', 'fb']

export const TOOL_KEEP_SHARE = 0.6

export const TOOL_TEXT_BUDGET = 500

export const TOOL_SUMMARY_CHARS = 70

export const BM25_K1 = 1.2

export const BM25_B = 0.75

export const TOOL_FIELD_WEIGHTS = { name: 3, summary: 2, asks: 1.5, steps: 1, flags: 1, notes: 0.5 } as const

export const TOOL_SYNONYMS: Readonly<Record<string, string>> = {
  convo: 'conversation',
  convos: 'conversation',
  summarize: 'summarise',
  stats: 'statistic',
  stat: 'statistic',
  dm: 'dms',
  slowness: 'slow',
  latency: 'slow',
}

export const TOOL_STOP_WORDS: ReadonlySet<string> = new Set(['about', 'any', 'all', 'being', 'give', 'machine', 'please', 'see', 'show', 'tell', 'were'])

export const TOOL_WEAK_WORDS: ReadonlySet<string> = new Set(['check', 'find', 'list', 'look', 'read'])

export const TOOL_GENERIC_WORDS: ReadonlySet<string> = new Set(['again', 'already', 'anything', 'been', 'block', 'blocks', 'continue', 'does', 'doing', 'done', 'eta', 'finish', 'finished', 'go', 'going', 'guy', 'happen', 'happened', 'happening', 'here', 'long', 'longer', 'more', 'much', 'now', 'ok', 'okay', 'outline', 'ready', 'saying', 'status', 'stuck', 'take', 'taking', 'takes', 'there', 'thing', 'through', 'time', 'update', 'want', 'whats', 'why', 'work', 'working', 'yet'])

export const TOOL_RARE_DF = 3

export const TOOL_READ_EFFECTS: ReadonlySet<string> = new Set(['read', 'browser'])

export const TOOL_WRITE_WORDS: ReadonlySet<string> = new Set(['add', 'answer', 'approve', 'comment', 'connect', 'create', 'delete', 'dm', 'draft', 'edit', 'follow', 'invite', 'join', 'like', 'message', 'post', 'prune', 'publish', 'queue', 'quote', 'react', 'remove', 'repost', 'reply', 'respond', 'retweet', 'schedule', 'send', 'share', 'start', 'stop', 'tweet', 'upvote', 'vote', 'write'])

export const NAME_FLAGS: readonly string[] = ['channel', 'chat', 'with', 'handle']

export interface ToolFacts {
  name: string
  platform: string | null
  summary: string
  flags: string[]
  required: string[]
  notes: string
  effect: string
}

export interface ToolDoc extends ToolFacts {
  asks: string[]
  steps: string[]
  plays: number
}

export interface ToolMatch {
  name: string
  score: number
  call: string
  summary: string
}

export interface ToolFill {
  name?: string
  server?: string
  words?: string
  platforms: string[]
}

export interface ToolGolden {
  prompt: string
  expect: string[]
  never?: string[]
  note?: string
}

export type CatalogKind = 'play' | 'tool' | 'skill'

export type CatalogSource = 'own' | 'step'

export interface CatalogText {
  text: string
  source: CatalogSource
}

export interface CatalogItem {
  kind: CatalogKind
  id: string
  label: string
  texts: CatalogText[]
}

export interface SkillFacts {
  name: string
  description: string
  asks: string[]
  play: string | null
}

export interface MeaningIndex {
  model: string
  dimensions: number
  hash: string
  items: CatalogItem[]
  vectors: Float32Array[][]
}

export interface MeaningHit {
  id: string
  score: number
}

export interface RouterMeaning {
  model: string
  play: MeaningHit[]
  tool: MeaningHit[]
  skill: MeaningHit[]
  ms: number
}

export interface MeaningAnswer {
  meaning: RouterMeaning | null
  fallback?: 'notLoaded' | 'overBudget' | 'noService' | 'failed'
  ms: number
}

export interface FusedTools {
  matches: ToolMatch[]
  lexical: string[]
  meaning: string[]
}

export interface RouterSection {
  text: string
  tools: string[]
  skills: string[]
  play: string | null
}

export interface RouterGolden extends ToolGolden {
  skills?: string[]
}

export interface RouterMeaningFixture {
  model: string
  hash: string
  prompts: Record<string, Partial<Record<CatalogKind, [string, number][]>>>
}

export const ROUTER_INDEX_NAME = 'skillRouter'

export const ROUTER_VECTOR_KIND = 'routerCatalog'

export const ROUTER_MEANING_FILE = 'routerMeaning.json'

export const ROUTER_BUDGET_MS = 150

export const PLAY_ROUTE_BUDGET_MS = 200

export const RRF_K = 60

export const MEANING_DEPTH = 10

export const MEANING_STEP_DISCOUNT = 0.9

export const TOOL_MEANING_FLOOR = 0.42

export const SKILL_MEANING_FLOOR = 0.45

export const PLAY_MEANING_FLOOR = 0.5

export const SKILLS_SHOWN = 2

export const FUSED_TOOLS_SHOWN = 3

export const SKILL_DIRS: readonly string[] = ['hermesPlugin/skills', '.claude/skills', 'skills', 'skills/published']

export const TOOL_MEANING_SPREAD = 0.12

export const TOOL_LEXICAL_WEIGHT = 0.7

export const SKILL_WORD_FLOOR = 0.6

export const SKILL_SUMMARY_CHARS = 60

export const EMBED_BATCH = 64

export type ToolFusion = 'lexical' | 'meaning' | 'rrf' | 'weighted'

export const TYPO_HEAVY_SHARE = 0.5

export const TYPO_MIN_WORDS = 4

export const LOG_BUILD_STRONG: ReadonlySet<string> = new Set('repo pr prs commit commits branch merge merged worktree typecheck subagent subagents hook hooks bench benchmark spec specs plugin mcp router refactor codebase devlog ci tests'.split(' '))

export const LOG_BUILD_WEAK: ReadonlySet<string> = new Set('log code build built building fix fixed bug bugs feature implement deploy release test tool tools'.split(' '))
