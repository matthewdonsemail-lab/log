import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, GlobeIcon, MessagesSquare, SearchIcon, Users } from 'lucide-react'
import {
  acceptCommunity,
  COMMUNITY_TOPICS,
  getCommunities,
  joinCommunity,
  joinCommunityByUrl,
  type Community,
} from '../lib/communities'
import { getAccounts, type ConnectionRecord } from '../lib/connections'
import { createKeyword } from '../lib/keywords'
import type { FirehoseEvent } from '../lib/analytics'
import { eventComments } from '../lib/analytics/mock'
import { suggestAcross } from '../lib/brand/query'
import { GROUP_QUERIES } from '../lib/reveal/flow'
import { SOCIAL_ICONS, SocialGlyph } from '../lib/social-icons'
import { ChainOfThought, ChainOfThoughtStep } from './ai-elements/chain-of-thought'
import { mainStep, terminalStep, trunkStep } from './ai-elements/chain-joints'
import { Source, SourceContent, SourceTrigger } from './ai-elements/source'
import type { RelatedMentionsState } from './RelatedMentionsChain'

/**
 * "Find related groups / communities" as its own chain of thought — the same
 * branching joints and `brand-blue` tone as RelatedMentionsChain, and the
 * same opening: analyse the post, read the thread. This is where it
 * deviates — it never asks the user to pick keywords (that multi-select is
 * the mentions chain's job). Instead it comes out of the comments announcing
 * what people kept saying, then asks a yes/no: want me to search those
 * keywords to find a new community?
 *
 *   analyse post → read thread → reply phrases → search? (yes/no) →
 *   fit loop → joins → keyword × community map
 *
 * Yes runs a web search over the reply phrases (mock dork queries landing
 * one by one) and ranks sibling communities against that keyword set; the
 * fit loop asks "do any of these look like a fit?" — Continue takes the
 * picks into joins, "try again" rejects the round and surfaces fresh
 * communities until the rounds run out. No skips the hunt and drops straight
 * to the map on the existing scope. Every decision advances only through its
 * own button — cards only ever mark. Saving creates real listening keywords
 * (joins are real store joins) — facebook/reddit phrases ride on joined
 * communities, X phrases ride free.
 *
 * The parent owns the final save: `saveRef` receives the save handler and
 * `onStateChange` mirrors `{ picked, footer, saving, saved }` so the sheet's
 * confirm button stays hidden through the interactive stages, offers the
 * save on the map, then flips to Done.
 */

/** Gated stages, forward-only — each decision below advances explicitly. */
type CommunitiesStep =
  | 'analyzing'
  | 'thread'
  | 'phrases'
  | 'finding'
  | 'rounds'
  | 'joins'
  | 'map'
  | 'saving'
  | 'saved'

/** Machine stage order — later subtrees render once the flow reaches them, frozen as history. */
const STAGE_ORDER: Record<CommunitiesStep, number> = {
  analyzing: 0,
  thread: 1,
  phrases: 2,
  finding: 3,
  rounds: 4,
  joins: 5,
  map: 6,
  saving: 6,
  saved: 6,
}

/** Fit-loop rounds before the chain stops offering fresh communities. */
const MAX_ROUNDS = 2

/** Communities per fit round. */
const ROUND_SIZE = 3

/** The label span every step in this compact chain shares (smaller than onboarding's 2xl). */
const LABEL = 'text-base font-medium leading-snug'

/** One streamed beat: its words, then a settle pause so the rail finishes drawing first. */
interface BeatDef {
  words: string[]
  settleMs: number
}

/**
 * Runs beats strictly in order: streams each beat's words, waits out its
 * settle pause, then advances. `onDone` fires once when the last settle
 * lands.
 */
function useBeatRunner(beats: BeatDef[], active: boolean, onDone: () => void) {
  const [beat, setBeat] = useState(0)
  const [shown, setShown] = useState(0)
  const done = beat >= beats.length
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  const firedRef = useRef(false)
  useEffect(() => {
    if (!active || done) return
    const current = beats[beat]
    if (shown < current.words.length) {
      const id = window.setTimeout(() => setShown((prev) => Math.min(prev + 1, current.words.length)), 80)
      return () => window.clearTimeout(id)
    }
    const id = window.setTimeout(() => {
      setBeat((prev) => prev + 1)
      setShown(0)
    }, current.settleMs)
    return () => window.clearTimeout(id)
  }, [active, done, beat, shown, beats])
  useEffect(() => {
    if (active && done && !firedRef.current) {
      firedRef.current = true
      onDoneRef.current()
    }
  }, [active, done])
  return { beat, shown, done }
}

/**
 * Streams words without moving layout: the full text renders invisibly to
 * reserve the final height, while the visible copy streams over the top.
 */
function StreamedLabel({ words, shown, complete }: { words: string[]; shown: number; complete: boolean }) {
  return (
    <span className="relative block">
      <span aria-hidden="true" className="invisible">
        {words.join(' ')}
      </span>
      <span className="absolute inset-0" aria-live="polite">
        {words.slice(0, shown).join(' ')}
        {complete ? '' : '▍'}
      </span>
    </span>
  )
}

/** Blur-then-act for buttons that unmount on answer — a focused node vanishing
 * mid-transition makes the browser fire its own scroll that cancels ours. */
function blurAnd(sendFn: () => void) {
  return (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()
    sendFn()
  }
}

function ContinueButton({
  disabled,
  onClick,
  children,
}: {
  disabled?: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-1.5 w-full rounded-lg bg-[#2A8CFF] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1E66C9] disabled:opacity-40"
    >
      {children}
    </button>
  )
}

function GhostButton({
  onClick,
  children,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:bg-slate-50"
    >
      {children}
    </button>
  )
}

/**
 * Rank a community against the reply-phrase keyword set: every phrase token
 * that hits the community's mock topics (substring either way) scores, so
 * the keywords used together pull similar communities to the top.
 * Zero-score rows still order deterministically by id, so a round always has
 * content while undiscovered communities remain.
 */
function scoreCommunity(community: Community, phrases: string[]): number {
  const topics = (COMMUNITY_TOPICS[community.id] ?? []).map((topic) => topic.toLowerCase())
  if (topics.length === 0) return 0
  const hay = topics.join(' | ')
  let score = 0
  for (const phrase of phrases) {
    const lowered = phrase.toLowerCase()
    const tokens = lowered.split(/[^a-z0-9]+/).filter((token) => token.length >= 3)
    for (const token of tokens) {
      if (hay.includes(token)) {
        score += 2
        continue
      }
      if (topics.some((topic) => topic.split(/[^a-z0-9]+/).some((word) => word.length >= 3 && lowered.includes(word)))) {
        score += 1
      }
    }
  }
  return score
}

export function RelatedCommunitiesChain({
  event,
  trackedPhrases,
  saveRef,
  onStateChange,
}: {
  event: FirehoseEvent
  /** Listened phrases — the first is the fallback keyword when the replies yield nothing new. */
  trackedPhrases: string[]
  /** When set, the chain parks its save handler here for a parent footer. */
  saveRef?: { current: (() => void) | null }
  /** Mirrors the chain state so a parent footer can drive the save. */
  onStateChange?: (state: RelatedMentionsState) => void
}) {
  const [step, setStep] = useState<CommunitiesStep>('analyzing')
  const stage = STAGE_ORDER[step]
  // Per-stage confirm flags — a stage's subtree freezes once its decision
  // lands, so the walk reads as history instead of re-asking.
  const [roundsConfirmed, setRoundsConfirmed] = useState(false)
  const [joinsConfirmed, setJoinsConfirmed] = useState(false)
  // No skips the community hunt and drops straight to the map on the
  // existing scope.
  const [skippedSearch, setSkippedSearch] = useState(false)
  // Fit-loop state: current round, rejected community ids, marked fits.
  const [round, setRound] = useState(1)
  const [rejectedIds, setRejectedIds] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [joinedIds, setJoinedIds] = useState<string[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)

  const presetPhrase = trackedPhrases[0] ?? ''
  const comments = useMemo(() => eventComments(event), [event])

  // Opening beats: analyse the post, then read the thread. Timer-driven like
  // the keywords chain — the decisions (not the streams) sit behind buttons.
  const ANALYZE_BEATS: BeatDef[] = useMemo(
    () => [
      { words: `Let me analyse this post and work out what they're complaining about…`.split(' '), settleMs: 600 },
      { words: `Reading the full post…`.split(' '), settleMs: 800 },
      { words: `Noting it was posted in ${event.group}…`.split(' '), settleMs: 600 },
    ],
    [event.group]
  )
  const analyze = useBeatRunner(ANALYZE_BEATS, step === 'analyzing', () => setStep('thread'))
  const analyzeDone = (index: number) =>
    analyze.beat > index || (analyze.beat === index && analyze.shown >= ANALYZE_BEATS[index].words.length)
  const analyzeAll = analyze.done

  const THREAD_BEATS: BeatDef[] = useMemo(
    () => [
      { words: `Let me read the thread and see what other people are saying…`.split(' '), settleMs: 600 },
      { words: `Pulling the ${comments.length === 1 ? 'one reply' : `all ${comments.length} replies`}…`.split(' '), settleMs: 800 },
    ],
    [comments.length]
  )
  const thread = useBeatRunner(THREAD_BEATS, step === 'thread', () => setStep('phrases'))
  const threadDone = (index: number) =>
    thread.beat > index || (thread.beat === index && thread.shown >= THREAD_BEATS[index].words.length)

  // What people kept saying in the replies: post plus replies read together
  // (phrases never straddle a boundary), minus everything already tracked.
  // Announced by the chain — never a multi-select. Falls back to the tracked
  // phrase when the replies yield nothing new.
  const replyPhrases = useMemo(
    () => suggestAcross([event.text, ...comments.map((comment) => comment.text)], event, trackedPhrases, 3),
    [event, trackedPhrases, comments]
  )
  const huntPhrases = replyPhrases.length > 0 ? replyPhrases : presetPhrase ? [presetPhrase] : []
  const huntKey = huntPhrases.join('|')
  const fellBackToTracked = replyPhrases.length === 0 && huntPhrases.length > 0

  const FINDING_BEATS: BeatDef[] = useMemo(
    () => [
      {
        words: `Let me search the web for these keywords…`.split(' '),
        settleMs: 700,
      },
      {
        words: `Looking for communities talking about ${huntKey.split('|').filter(Boolean).join(' + ') || 'this'}…`.split(' '),
        settleMs: 700,
      },
    ],
    [huntKey]
  )
  const finding = useBeatRunner(FINDING_BEATS, step === 'finding', () => setStep('rounds'))
  const findingDone = (index: number) =>
    finding.beat > index || (finding.beat === index && finding.shown >= FINDING_BEATS[index].words.length)

  // Communities + accounts load once the flow can need them (the phrases
  // step) — the fit rounds, the join cards and the map all read this list.
  const [communities, setCommunities] = useState<Community[] | null>(null)
  const [accountList, setAccountList] = useState<ConnectionRecord[]>([])
  useEffect(() => {
    if (stage < 2 || communities) return
    let cancelled = false
    getCommunities({ platform: event.platform })
      .then((list) => {
        if (!cancelled) setCommunities(list)
      })
      .catch(() => {
        if (!cancelled) setCommunities([])
      })
    getAccounts()
      .then((list) => {
        if (!cancelled) setAccountList(list.filter((account) => account.platform === event.platform))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [stage, communities, event.platform])

  // Fit-round candidates: accepted rows are already scope, rejected rows
  // were passed on — the rest rank against the reply-phrase keyword set.
  const roundIds = useMemo(() => {
    const pool = (communities ?? []).filter(
      (community) => community.joinState !== 'accepted' && !rejectedIds.includes(community.id)
    )
    return pool
      .map((community) => ({ community, score: scoreCommunity(community, huntPhrases) }))
      .sort((a, b) => b.score - a.score || (a.community.id < b.community.id ? -1 : 1))
      .slice(0, ROUND_SIZE)
      .map((row) => row.community.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communities, rejectedIds, huntKey])

  const roundGroups = useMemo(
    () =>
      roundIds
        .map((id) => (communities ?? []).find((row) => row.id === id))
        .filter((row): row is Community => !!row),
    [roundIds, communities]
  )
  const selectedGroups = useMemo(
    () =>
      selectedIds
        .map((id) => (communities ?? []).find((row) => row.id === id))
        .filter((row): row is Community => !!row),
    [selectedIds, communities]
  )
  const acceptedScope = useMemo(
    () => (communities ?? []).find((community) => community.joinState === 'accepted') ?? null,
    [communities]
  )
  const scopeNames = useMemo(() => {
    const names: string[] = []
    if (event.platform === 'x') {
      names.push('This crowd')
    } else if (acceptedScope) {
      names.push(acceptedScope.name)
    }
    for (const id of joinedIds) {
      const found = (communities ?? []).find((row) => row.id === id)
      if (found && !names.includes(found.name)) names.push(found.name)
    }
    return names
  }, [event.platform, acceptedScope, joinedIds, communities])

  const isResolved = (group: Community) =>
    joinedIds.includes(group.id) || group.joinState === 'accepted' || group.joinState === 'pending'
  const joinsReady = selectedGroups.length > 0 && selectedGroups.every(isResolved)

  // Per-card join UI state.
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [accountPick, setAccountPick] = useState<Record<string, string>>({})
  const [fbAnswers, setFbAnswers] = useState<Record<string, string[]>>({})
  const fbAccounts = useMemo(() => accountList.filter((account) => account.platform === 'facebook'), [accountList])

  function toggleSibling(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]))
  }

  async function joinGroup(group: Community) {
    if (joiningId) return
    setJoiningId(group.id)
    setJoinError(null)
    try {
      if (group.platform === 'facebook') {
        const accountId = accountPick[group.id] ?? fbAccounts[0]?.id
        if (!accountId) throw new Error('Connect a Facebook account first — joins go out through one of yours.')
        const answers = fbAnswers[group.id] ?? []
        const res = await joinCommunityByUrl(group.url ?? '', { accountId, answers })
        let list = res.communities
        let current = res.community
        if (current.joinState === 'pending') {
          // Mock admin approves on the spot so the map can listen right away.
          current = await acceptCommunity(current.id)
          list = list.map((row) => (row.id === current.id ? current : row))
        }
        setCommunities(list)
      } else {
        const updated = await joinCommunity(group.id)
        setCommunities((prev) => (prev ?? []).map((row) => (row.id === updated.id ? updated : row)))
      }
      setJoinedIds((prev) => (prev.includes(group.id) ? prev : [...prev, group.id]))
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not join that community.')
    } finally {
      setJoiningId(null)
    }
  }

  async function savePicked() {
    if (step !== 'map') return
    if (huntPhrases.length === 0) {
      setSaveError('Nothing to listen for — no keyword came out of this post.')
      return
    }
    setStep('saving')
    setSaveError(null)
    try {
      const live = await getCommunities({ platform: event.platform })
      const acceptedNow = live.filter((community) => community.joinState === 'accepted')
      let scopes: (string | null)[]
      if (event.platform === 'x') {
        scopes = [null]
      } else {
        const ids = [
          ...(acceptedNow[0] ? [acceptedNow[0].id] : []),
          ...joinedIds.filter((id) => acceptedNow.some((community) => community.id === id)),
        ]
        const unique = [...new Set(ids)]
        if (unique.length === 0) {
          throw new Error(
            `Join a group on this platform first — ${event.platform === 'facebook' ? 'Facebook' : 'Reddit'} keywords need a group to listen in.`
          )
        }
        scopes = unique
      }
      for (const phrase of huntPhrases) {
        for (const scope of scopes) {
          try {
            await createKeyword({ phrase, platform: event.platform, groupId: scope })
          } catch (err) {
            // Already listening there counts — only real failures abort.
            if (!(err instanceof Error) || !/already exists/.test(err.message)) throw err
          }
        }
      }
      setStep('saved')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save those keywords.')
      setStep('map')
    }
  }

  // Park the save handler for a parent footer (the dashboard form sheet's
  // confirm button). Runs every render so the closure never goes stale.
  useEffect(() => {
    if (!saveRef) return
    saveRef.current = savePicked
    return () => {
      saveRef.current = null
    }
  })

  // Mirror chain state to the parent footer: hidden while the chain asks its
  // own questions inline, save on the map, done after.
  useEffect(() => {
    if (!onStateChange) return
    onStateChange({
      picked: huntPhrases,
      footer: step === 'saved' ? 'done' : step === 'map' ? 'save' : 'hidden',
      saving: step === 'saving',
      saved: step === 'saved',
    })
  }, [huntPhrases, huntKey, step, onStateChange])

  // Each new subtree scrolls itself into view — the sheet scrolls, and the
  // stream above is what puts fresh content below the fold.
  const stageAnchors = useRef<Partial<Record<string, HTMLDivElement | null>>>({})
  useEffect(() => {
    const el = stageAnchors.current[step]
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = window.setTimeout(() => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }), 80)
    return () => window.clearTimeout(id)
  }, [step])

  function setAnchor(key: string) {
    return (el: HTMLDivElement | null) => {
      stageAnchors.current[key] = el
    }
  }

  function renderReplyPhrases() {
    return (
      <div className="flex flex-col gap-1.5">
        {huntPhrases.map((phrase) => (
          <div key={phrase} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="truncate text-sm font-bold text-slate-900">“{phrase}”</p>
          </div>
        ))}
      </div>
    )
  }

  function renderRoundCards() {
    return (
      <div className="flex flex-col gap-1.5">
        {roundGroups.map((group) => {
          const groupIcon = SOCIAL_ICONS.find((row) => row.id === group.platform)
          const active = selectedIds.includes(group.id)
          const pending = group.joinState === 'pending'
          return (
            <button
              key={group.id}
              type="button"
              aria-pressed={active}
              onClick={blurAnd(() => toggleSibling(group.id))}
              className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                active ? 'border-[#2A8CFF] bg-[#EAF3FF]' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {groupIcon ? <SocialGlyph icon={groupIcon} className="size-6 shrink-0 text-[#2A8CFF]" /> : null}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-slate-900">{group.name}</span>
                <span className="block truncate text-xs text-slate-500">
                  {group.members}
                  {pending ? ' · request pending' : ''}
                </span>
              </span>
              <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  active ? 'border-[#2A8CFF] bg-[#2A8CFF]' : 'border-slate-300 bg-transparent'
                }`}
              >
                {active ? <Check aria-hidden="true" className="size-3.5 text-white" /> : null}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  function renderJoinCards() {
    return (
      <div className="flex flex-col gap-1.5">
        {selectedGroups.map((group) => {
          const groupIcon = SOCIAL_ICONS.find((row) => row.id === group.platform)
          const joined = joinedIds.includes(group.id) || group.joinState === 'accepted'
          const pending = !joined && group.joinState === 'pending'
          const busy = joiningId === group.id
          return (
            <div key={group.id} className="shadow-hard rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                {groupIcon ? <SocialGlyph icon={groupIcon} className="size-6 shrink-0 text-[#2A8CFF]" /> : null}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-slate-900">{group.name}</span>
                  <span className="block truncate text-xs text-slate-500">{group.members}</span>
                </span>
                {joined ? (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-emerald-600">
                    <Check className="size-4" /> Joined
                  </span>
                ) : pending ? (
                  <span className="shrink-0 text-xs font-semibold text-slate-500">Request pending…</span>
                ) : busy ? (
                  <span className="shrink-0 text-xs font-semibold text-slate-500">Joining…</span>
                ) : group.platform !== 'facebook' ? (
                  <button
                    type="button"
                    onClick={() => void joinGroup(group)}
                    className="shrink-0 rounded-lg bg-[#2A8CFF] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1E66C9]"
                  >
                    Join
                  </button>
                ) : null}
              </div>
              <p className="mt-1 truncate text-xs text-slate-500">{group.description}</p>
              {group.platform === 'facebook' && !joined && !pending ? (
                <div className="mt-2 space-y-1.5 border-t border-slate-200 pt-2">
                  <label className="block text-xs font-semibold text-slate-600">
                    Join with
                    {fbAccounts.length === 0 ? (
                      <span className="mt-1 block font-normal text-slate-500">Connect a Facebook account to join.</span>
                    ) : (
                      <select
                        value={accountPick[group.id] ?? fbAccounts[0]?.id ?? ''}
                        onChange={(e) => setAccountPick((prev) => ({ ...prev, [group.id]: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-normal text-slate-800"
                      >
                        {fbAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                  {group.entryQuestions.map((question, qi) => (
                    <label key={qi} className="block text-xs font-semibold text-slate-600">
                      {question}
                      <input
                        value={(fbAnswers[group.id] ?? [])[qi] ?? ''}
                        onChange={(e) =>
                          setFbAnswers((prev) => {
                            const next = [...(prev[group.id] ?? [])]
                            next[qi] = e.target.value
                            return { ...prev, [group.id]: next }
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-normal text-slate-800"
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    disabled={busy || fbAccounts.length === 0}
                    onClick={() => void joinGroup(group)}
                    className="w-full rounded-lg bg-[#2A8CFF] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#1E66C9] disabled:opacity-40"
                  >
                    Send join request
                  </button>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  const huntLabel = huntPhrases.join(' + ')

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl bg-white p-4">
        <ChainOfThought className="space-y-0">
          <div ref={setAnchor('analyzing')}>
            <ChainOfThoughtStep
              icon={SearchIcon}
              tone="brand-blue"
              status={stage > 0 ? 'complete' : 'active'}
              label={
                <span className={LABEL}>
                  <StreamedLabel
                    words={ANALYZE_BEATS[0].words}
                    shown={analyze.beat > 0 ? ANALYZE_BEATS[0].words.length : analyze.shown}
                    complete={analyzeDone(0)}
                  />
                </span>
              }
              className={`${trunkStep('brand-blue')} [&>div:last-child]:min-w-0`}
            >
              {analyzeDone(0) ? (
                <div className="mt-2 space-y-1">
                  <ChainOfThought className="space-y-0 pt-2">
                    {ANALYZE_BEATS.slice(1).map((beatDef, position) => {
                      const index = position + 1
                      if (analyze.beat < index) return null
                      const complete =
                        analyze.beat > index || (analyze.beat === index && analyze.shown >= beatDef.words.length)
                      return (
                        <ChainOfThoughtStep
                          key={index}
                          icon={index === 1 ? SearchIcon : Check}
                          tone="brand-blue"
                          status={complete ? 'complete' : 'active'}
                          compact={!(analyzeAll && index === ANALYZE_BEATS.length - 1)}
                          elbow={analyzeAll && index === ANALYZE_BEATS.length - 1 ? 'out' : index === 1 ? 'in' : undefined}
                          label={
                            <span className={LABEL}>
                              <StreamedLabel
                                words={beatDef.words}
                                shown={analyze.beat > index ? beatDef.words.length : analyze.shown}
                                complete={complete}
                              />
                            </span>
                          }
                          className={trunkStep('brand-blue')}
                        />
                      )
                    })}
                  </ChainOfThought>
                  {analyzeAll ? (
                    <Source href={event.url}>
                      <SourceTrigger showFavicon label={event.url} className="max-w-28 rounded-sm" />
                      <SourceContent
                        title={`Original post — ${event.author}`}
                        description="Opens the exact post this scan started from."
                      />
                    </Source>
                  ) : null}
                </div>
              ) : null}
            </ChainOfThoughtStep>
          </div>

          {stage >= 1 ? (
            <div ref={setAnchor('thread')}>
              <ChainOfThoughtStep
                icon={MessagesSquare}
                tone="brand-blue"
                status={stage > 1 ? 'complete' : 'active'}
                label={
                  <span className={LABEL}>
                    <StreamedLabel
                      words={THREAD_BEATS[0].words}
                      shown={thread.beat > 0 ? THREAD_BEATS[0].words.length : thread.shown}
                      complete={threadDone(0)}
                    />
                  </span>
                }
                className={`${trunkStep('brand-blue')} [&>div:last-child]:min-w-0`}
              >
                {thread.beat >= 1 ? (
                  <div className="mt-2 space-y-1">
                    <ChainOfThought className="space-y-0 pt-2">
                      <ChainOfThoughtStep
                        icon={Check}
                        tone="brand-blue"
                        status={threadDone(1) ? 'complete' : 'active'}
                        elbow="in"
                        label={
                          <span className={LABEL}>
                            <StreamedLabel
                              words={THREAD_BEATS[1].words}
                              shown={thread.beat > 1 ? THREAD_BEATS[1].words.length : thread.shown}
                              complete={threadDone(1)}
                            />
                          </span>
                        }
                        className={trunkStep('brand-blue')}
                      />
                    </ChainOfThought>
                    <div className="flex flex-col gap-1.5 pt-1">
                      {comments.map((comment) => (
                        <div
                          key={`${comment.author}-${comment.text}`}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                        >
                          <p className="text-xs font-bold text-[#0B3E91]">{comment.author}</p>
                          <p className="text-sm text-slate-700">“{comment.text}”</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {stage >= 2 ? (
            <div ref={setAnchor('phrases')}>
              <ChainOfThoughtStep
                icon={MessagesSquare}
                tone="brand-blue"
                status={stage > 2 ? 'complete' : 'active'}
                label={
                  <span className={LABEL}>
                    Okay — here&apos;s what people kept saying in the replies{fellBackToTracked ? ', so I’ll stick with what you already track' : ''}:
                  </span>
                }
                className={mainStep('brand-blue')}
              >
                {renderReplyPhrases()}
                {step === 'phrases' ? (
                  <>
                    <p className="pt-1 text-sm font-semibold text-slate-700">
                      Want me to search these keywords to try to find a new community?
                    </p>
                    <ContinueButton onClick={blurAnd(() => setStep('finding'))}>
                      Yes, search for a community
                    </ContinueButton>
                    <GhostButton
                      onClick={blurAnd(() => {
                        setSkippedSearch(true)
                        setStep('map')
                      })}
                    >
                      No, stick with what I&apos;ve got
                    </GhostButton>
                  </>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {stage >= 3 && !skippedSearch ? (
            <div ref={setAnchor('finding')}>
              <ChainOfThoughtStep
                icon={GlobeIcon}
                tone="brand-blue"
                status={finding.done ? 'complete' : 'active'}
                label={
                  <span className={LABEL}>
                    <StreamedLabel
                      words={FINDING_BEATS[0].words}
                      shown={finding.beat > 0 ? FINDING_BEATS[0].words.length : finding.shown}
                      complete={findingDone(0)}
                    />
                  </span>
                }
                className={`${trunkStep('brand-blue')} [&>div:last-child]:min-w-0`}
              >
                <ChainOfThought className="space-y-0 pt-2">
                  {(finding.beat >= 1 ? GROUP_QUERIES.slice(0, 3) : []).map((query, index, rows) => {
                    const isLast = index === rows.length - 1
                    return (
                      <ChainOfThoughtStep
                        key={query}
                        icon={GlobeIcon}
                        tone="brand-blue"
                        status="complete"
                        compact={!isLast}
                        elbow={isLast ? 'out' : index === 0 ? 'in' : undefined}
                        label={<span className={LABEL}>Web search · {query}</span>}
                        className={`${trunkStep('brand-blue')}${isLast ? '' : ' pb-3'}`}
                      />
                    )
                  })}
                  {finding.beat >= 1 ? (
                    <ChainOfThoughtStep
                      icon={Check}
                      tone="brand-blue"
                      status={findingDone(1) ? 'complete' : 'active'}
                      elbow="in"
                      label={
                        <span className={LABEL}>
                          <StreamedLabel
                            words={FINDING_BEATS[1].words}
                            shown={finding.beat > 1 ? FINDING_BEATS[1].words.length : finding.shown}
                            complete={findingDone(1)}
                          />
                        </span>
                      }
                      className={trunkStep('brand-blue')}
                    />
                  ) : null}
                </ChainOfThought>
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {stage >= 4 ? (
            <div ref={setAnchor('rounds')}>
              <ChainOfThoughtStep
                icon={Users}
                tone="brand-blue"
                status={stage > 4 ? 'complete' : 'active'}
                label={
                  <span className={LABEL}>
                    I found these communities — do any of them look like a fit{huntLabel ? ` for “${huntLabel}”` : ''}?
                  </span>
                }
                className={mainStep('brand-blue')}
              >
                {!communities ? (
                  <p className="text-sm text-slate-500">Checking the neighbourhood…</p>
                ) : roundGroups.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    That&apos;s every place I know on this platform — the map will stick to what you&apos;ve got.
                  </p>
                ) : (
                  renderRoundCards()
                )}
                {step === 'rounds' ? (
                  <>
                    <ContinueButton
                      disabled={roundGroups.length > 0 && selectedIds.length === 0}
                      onClick={blurAnd(() => {
                        setRoundsConfirmed(true)
                        setStep('joins')
                      })}
                    >
                      Continue
                    </ContinueButton>
                    {round < MAX_ROUNDS && roundGroups.length > 0 ? (
                      <GhostButton
                        onClick={blurAnd(() => {
                          setRejectedIds((prev) => [...prev, ...roundIds])
                          setSelectedIds([])
                          setRound((prev) => prev + 1)
                        })}
                      >
                        None of these fit — try again
                      </GhostButton>
                    ) : null}
                  </>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {stage >= 5 && roundsConfirmed ? (
            <div ref={setAnchor('joins')}>
              <ChainOfThoughtStep
                icon={Users}
                tone="brand-blue"
                status={stage > 5 ? 'complete' : 'active'}
                label={<span className={LABEL}>Let&apos;s get you in.</span>}
                className={mainStep('brand-blue')}
              >
                {selectedGroups.length === 0 ? (
                  <p className="text-sm text-slate-500">Nothing picked to join — the map will stick to this one.</p>
                ) : (
                  renderJoinCards()
                )}
                {joinError ? <p className="text-sm font-semibold text-red-600">{joinError}</p> : null}
                {step === 'joins' ? (
                  <>
                    <ContinueButton
                      disabled={!joinsReady}
                      onClick={blurAnd(() => {
                        setJoinsConfirmed(true)
                        setStep('map')
                      })}
                    >
                      Continue
                    </ContinueButton>
                    <GhostButton
                      onClick={blurAnd(() => {
                        setJoinsConfirmed(true)
                        setStep('map')
                      })}
                    >
                      Continue without joining
                    </GhostButton>
                  </>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {stage >= 6 && (joinsConfirmed || skippedSearch) ? (
            <div ref={setAnchor('map')}>
              <ChainOfThoughtStep
                icon={Check}
                tone="brand-blue"
                status={step === 'saved' ? 'complete' : 'active'}
                label={<span className={LABEL}>Here&apos;s the map.</span>}
                className={terminalStep('brand-blue')}
              >
                <div className="flex flex-col gap-1.5">
                  {huntPhrases.map((phrase) => (
                    <div key={phrase} className="rounded-xl border border-[#2A8CFF] bg-[#EAF3FF] px-3 py-2">
                      <p className="truncate text-sm font-bold text-[#0B3E91]">“{phrase}”</p>
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {scopeNames.length > 0 ? scopeNames.join(' + ') : 'No joined community yet'}
                      </p>
                    </div>
                  ))}
                </div>
                {saveError ? <p className="text-sm font-semibold text-red-600">{saveError}</p> : null}
                {step === 'saved' ? (
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <Check className="size-4" />
                    {huntPhrases.length} {huntPhrases.length === 1 ? 'keyword' : 'keywords'} saved — now listening
                  </p>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}
        </ChainOfThought>
      </div>
      {step === 'saved' ? (
        <p className="px-1 text-xs text-slate-500">
          New keywords appear on their own analytics pages once the first signals land.
        </p>
      ) : null}
    </div>
  )
}
