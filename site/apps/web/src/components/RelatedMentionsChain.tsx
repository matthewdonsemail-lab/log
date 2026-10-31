import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, GlobeIcon, HelpCircle, Search as SearchIcon, Users } from 'lucide-react'
import { useMachine } from '@xstate/react'
import { suggestAcross, suggestKeywords } from '../lib/brand/query'
import { acceptCommunity, getCommunities, joinCommunity, joinCommunityByUrl, type Community } from '../lib/communities'
import { getAccounts, type ConnectionRecord } from '../lib/connections'
import { createKeyword } from '../lib/keywords'
import type { FirehoseEvent } from '../lib/analytics'
import { eventComments } from '../lib/analytics/mock'
import { relatedMentionsMachine } from '../lib/related-mentions'
import { GROUP_QUERIES } from '../lib/reveal/flow'
import { SOCIAL_ICONS, SocialGlyph } from '../lib/social-icons'
import {
  ChainOfThought,
  ChainOfThoughtStep,
} from './ai-elements/chain-of-thought'
import {
  mainStep,
  nestedIntroStep,
  nestedTerminalStep,
  subStep,
  terminalStep,
  trunkStep,
} from './ai-elements/chain-joints'
import { Source, SourceContent, SourceTrigger } from './ai-elements/source'

/**
 * "Find related mentions" as a chain of thought: the same branching joints
 * and elbows as the onboarding reveal, in the `brand-blue` tone — blue rails
 * and tracks, blue icon boxes with white glyphs, navy labels — so the joints
 * read on the white card. Forward-only, like the reveal: the chain reads the
 * post, lands a multi-select ask ("which look promising?"), then either digs
 * through the replies for a second round, looks online with Google dorks,
 * finds sibling communities to join, and ends on a keyword × community map
 * that the sheet footer saves. Saving creates real listening keywords (and
 * the joins are real store joins) — facebook/reddit phrases ride on joined
 * communities, X phrases ride free.
 *
 * The parent owns the final save: `saveRef` receives the save handler and
 * `onStateChange` mirrors `{ picked, footer, saving, saved }` so the sheet's
 * confirm button stays hidden through the interactive stages, offers the
 * save on the map, then flips to Done.
 */

/**
 * Streams words without moving layout: the full text renders invisibly to
 * reserve the final height, while the visible copy streams over the top.
 * (Mirrors BrandRevealStep's private helper — that one isn't exported.)
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

/** The label span every step in this compact chain shares (smaller than onboarding's 2xl). */
const LABEL = 'text-base font-medium leading-snug'

/** Machine stage order — later subtrees render once the flow reaches them, frozen as history. */
const STAGE_ORDER: Record<string, number> = {
  scanning: 0,
  picking: 1,
  retrying: 2,
  repicking: 3,
  onlineAsk: 4,
  searching: 5,
  groups: 6,
  mapReady: 7,
  saving: 7,
  saved: 7,
  dismissed: 3,
}

/** One streamed beat: its words, then a settle pause so the rail finishes drawing first. */
interface BeatDef {
  words: string[]
  settleMs: number
}

/**
 * Runs beats strictly in order: streams each beat's words, waits out its
 * settle pause, then advances. `onDone` fires once when the last settle
 * lands. Separate runners drive the scan, retry and (item-based) search
 * phases so each plays sequentially instead of piling status flips on top
 * of unfinished rail animations.
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

/** Blur-then-act for buttons that unmount on answer — a focused node vanishing
 * mid-transition makes the browser fire its own scroll that cancels ours. */
function blurAnd(sendFn: () => void) {
  return (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur()
    sendFn()
  }
}

/** Channel the post came from — the first thing the chain pins down. */
function channelFor(event: FirehoseEvent): { icon?: (typeof SOCIAL_ICONS)[number]; name: string; kind: string } {
  const icon = SOCIAL_ICONS.find((row) => row.id === event.platform)
  if (event.platform === 'facebook') return { icon, name: event.group, kind: 'Facebook group' }
  if (event.platform === 'reddit') return { icon, name: event.group, kind: 'subreddit' }
  return { icon, name: `the ${event.group} crowd`, kind: 'X' }
}

export interface RelatedMentionsState {
  picked: string[]
  /** What the sheet footer should do: hidden while interactive, save on the map, done after. */
  footer: 'hidden' | 'save' | 'done'
  saving: boolean
  saved: boolean
}

function ContinueButton({ disabled, onClick, children }: { disabled?: boolean; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode }) {
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

function GhostButton({ onClick, children }: { onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode }) {
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

export function RelatedMentionsChain({
  event,
  trackedPhrases,
  entry = 'keywords',
  saveRef,
  onStateChange,
}: {
  event: FirehoseEvent
  /** Phrases already tracked — the dedup beat reports against these. */
  trackedPhrases: string[]
  /**
   * 'keywords' runs the full hunt; 'communities' jumps straight to the
   * online search with the tracked phrase preset as the pick.
   */
  entry?: 'keywords' | 'communities'
  /** When set, the chain parks its save handler here for a parent footer. */
  saveRef?: { current: (() => void) | null }
  /** Mirrors the machine state so a parent footer can drive the save. */
  onStateChange?: (state: RelatedMentionsState) => void
}) {
  const suggestions = useMemo(
    () => suggestKeywords(event, trackedPhrases),
    [event, trackedPhrases]
  )
  const [snapshot, send] = useMachine(relatedMentionsMachine)
  const { picked, rejected, saved, joinedIds, error } = snapshot.context
  const stage = STAGE_ORDER[snapshot.value] ?? 0
  const channel = channelFor(event)

  // Communities entry skips the keyword hunt: the tracked phrase goes in as
  // the pick and the flow jumps straight to the online search.
  const presetPhrase = trackedPhrases[0] ?? ''
  const autoAdvanced = useRef(false)
  useEffect(() => {
    if (entry !== 'communities' || autoAdvanced.current || !presetPhrase) return
    autoAdvanced.current = true
    send({ type: 'TOGGLE_PICK', phrase: presetPhrase })
    send({ type: 'CONTINUE' })
    send({ type: 'LOOK_ONLINE' })
  }, [entry, presetPhrase, send])

  // Round two reads the replies — somewhere the first pass didn't look —
  // minus everything already rejected, so it always suggests fresh phrases.
  const retryComments = useMemo(() => eventComments(event), [event])
  const suggestions2 = useMemo(
    () =>
      suggestAcross(
        [event.text, ...retryComments.map((comment) => comment.text)],
        event,
        [...trackedPhrases, ...rejected]
      ),
    [event, trackedPhrases, rejected, retryComments]
  )

  // Main scan beats, in a human voice — each settles so its rail finishes
  // drawing before the next beat starts.
  const MAIN_BEATS: BeatDef[] = useMemo(
    () => [
      {
        words: `Let me read through this post and the comments to see what people are really asking for…`.split(' '),
        settleMs: 600,
      },
      { words: `Reading the full thread…`.split(' '), settleMs: 1000 },
      { words: `Pulling out the phrases people keep repeating…`.split(' '), settleMs: 600 },
      { words: `Working out what this post is really about…`.split(' '), settleMs: 600 },
      {
        words: (
          trackedPhrases.length === 1
            ? `Skipping the 1 phrase you already listen for…`
            : `Skipping the ${trackedPhrases.length} phrases you already listen for…`
        ).split(' '),
        settleMs: 600,
      },
      {
        words: (
          suggestions.length === 0
            ? `Nothing clean in this one…`
            : suggestions.length === 1
              ? `Keeping 1 clean candidate…`
              : `Keeping ${suggestions.length} clean candidates…`
        ).split(' '),
        settleMs: 800,
      },
    ],
    [trackedPhrases.length, suggestions.length]
  )
  const main = useBeatRunner(MAIN_BEATS, entry === 'keywords', () => send({ type: 'STREAM_DONE' }))
  const mainStepDone = (index: number) =>
    main.beat > index || (main.beat === index && main.shown >= MAIN_BEATS[index].words.length)
  const scanDone = mainStepDone(0)

  const RETRY_BEATS: BeatDef[] = useMemo(
    () => [
      { words: `Okay — none of those landed. Let me dig through the comments instead…`.split(' '), settleMs: 600 },
      { words: `Pulling fresh phrases from what people replied…`.split(' '), settleMs: 800 },
    ],
    []
  )
  const retry = useBeatRunner(RETRY_BEATS, snapshot.value === 'retrying', () => send({ type: 'RETRY_DONE' }))
  const retryStepDone = (index: number) =>
    retry.beat > index || (retry.beat === index && retry.shown >= RETRY_BEATS[index].words.length)

  // Online search: dork queries land one by one, onboarding found-item style.
  const DORKS = useMemo(() => GROUP_QUERIES.slice(0, 3), [])
  const [dorksShown, setDorksShown] = useState(0)
  const dorksAll = dorksShown >= DORKS.length
  useEffect(() => {
    if (snapshot.value !== 'searching' || dorksAll) return
    const id = window.setTimeout(() => setDorksShown((prev) => prev + 1), 550)
    return () => window.clearTimeout(id)
  }, [snapshot.value, dorksShown, dorksAll])
  useEffect(() => {
    if (snapshot.value !== 'searching' || !dorksAll) return
    const id = window.setTimeout(() => send({ type: 'SEARCH_DONE' }), 800)
    return () => window.clearTimeout(id)
  }, [snapshot.value, dorksAll, send])

  // Communities + accounts load once the flow can need them (groups, or the
  // map after skipping online) — the join cards and the map read this list.
  const [communities, setCommunities] = useState<Community[] | null>(null)
  const [accountList, setAccountList] = useState<ConnectionRecord[]>([])
  useEffect(() => {
    if (stage < 6 || communities) return
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

  const discovered = useMemo(
    () => (communities ?? []).filter((community) => community.joinState !== 'accepted').slice(0, 3),
    [communities]
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

  // Per-card join UI state.
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [accountPick, setAccountPick] = useState<Record<string, string>>({})
  const [fbAnswers, setFbAnswers] = useState<Record<string, string[]>>({})
  const fbAccounts = useMemo(() => accountList.filter((account) => account.platform === 'facebook'), [accountList])

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
      send({ type: 'JOINED', id: group.id })
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not join that community.')
    } finally {
      setJoiningId(null)
    }
  }

  async function savePicked() {
    if (snapshot.value !== 'mapReady') return
    send({ type: 'SAVE_START' })
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
      for (const phrase of picked) {
        for (const scope of scopes) {
          try {
            await createKeyword({ phrase, platform: event.platform, groupId: scope })
          } catch (err) {
            // Already listening there counts — only real failures abort.
            if (!(err instanceof Error) || !/already exists/.test(err.message)) throw err
          }
        }
      }
      send({ type: 'SAVE_SUCCESS' })
    } catch (err) {
      send({
        type: 'SAVE_ERROR',
        message: err instanceof Error ? err.message : 'Could not save those keywords.',
      })
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

  // Mirror machine state to the parent footer: hidden while the chain asks
  // its own questions inline, save on the map, done after.
  useEffect(() => {
    if (!onStateChange) return
    const value = snapshot.value
    onStateChange({
      picked,
      footer: value === 'saved' || value === 'dismissed' ? 'done' : value === 'mapReady' ? 'save' : 'hidden',
      saving: value === 'saving',
      saved: value === 'saved',
    })
  }, [picked, snapshot.value, onStateChange])

  // Each new subtree scrolls itself into view — the sheet scrolls, and the
  // stream above is what puts fresh content below the fold.
  const stageAnchors = useRef<Partial<Record<string, HTMLDivElement | null>>>({})
  useEffect(() => {
    const el = stageAnchors.current[snapshot.value]
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = window.setTimeout(
      () => el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }),
      80
    )
    return () => window.clearTimeout(id)
  }, [snapshot.value])

  const firstPick = picked[0] ?? ''
  const mapPhrases = picked.length > 0 ? picked : saved

  function setAnchor(key: string) {
    return (el: HTMLDivElement | null) => {
      stageAnchors.current[key] = el
    }
  }

  function renderPickCards(phrases: string[], interactive: boolean) {
    return (
      <div className="flex flex-col gap-1.5">
        {phrases.map((phrase) => {
          const active = picked.includes(phrase)
          const savedHere = saved.includes(phrase)
          return (
            <button
              key={phrase}
              type="button"
              disabled={!interactive || savedHere}
              aria-pressed={active}
              onClick={blurAnd(() => send({ type: 'TOGGLE_PICK', phrase }))}
              className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors ${
                savedHere
                  ? 'cursor-default border-[#2A8CFF] bg-[#EAF3FF]'
                  : active
                    ? 'border-[#2A8CFF] bg-[#EAF3FF]'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={`min-w-0 flex-1 truncate text-sm font-bold ${active || savedHere ? 'text-[#0B3E91]' : 'text-slate-800'}`}>
                “{phrase}”
              </span>
              <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  active || savedHere ? 'border-[#2A8CFF] bg-[#2A8CFF]' : 'border-slate-300 bg-transparent'
                }`}
              >
                {active || savedHere ? <Check aria-hidden="true" className="size-3.5 text-white" /> : null}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  function renderChannelContext() {
    return (
      <>
        <div className="shadow-hard flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          {channel.icon ? (
            <SocialGlyph icon={channel.icon} className="size-6 shrink-0 text-[#2A8CFF]" />
          ) : null}
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold text-slate-900">{channel.name}</span>
            <span className="block truncate text-xs text-slate-500">
              {channel.kind}
              {event.author ? ` · ${event.author}` : ''}
            </span>
          </span>
        </div>
        <Source href={event.url}>
          <SourceTrigger showFavicon label={event.url} className="max-w-28 rounded-sm" />
          <SourceContent
            title={`Original post — ${event.author}`}
            description="Opens the exact post this scan started from."
          />
        </Source>
      </>
    )
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-xl bg-white p-4">
        {entry === 'communities' ? (
          <div className="mb-2 space-y-1">{renderChannelContext()}</div>
        ) : null}
        <ChainOfThought className="space-y-0">
          {entry === 'keywords' ? (
            <ChainOfThoughtStep
              icon={SearchIcon}
            tone="brand-blue"
            status={scanDone ? 'complete' : 'active'}
            label={
              <span className={LABEL}>
                <StreamedLabel words={MAIN_BEATS[0].words} shown={main.beat > 0 ? MAIN_BEATS[0].words.length : main.shown} complete={scanDone} />
              </span>
            }
            className={`${trunkStep('brand-blue')} [&>div:last-child]:min-w-0`}
          >
              {scanDone ? (
                <div className="mt-2 space-y-1">
                  {renderChannelContext()}
                  <ChainOfThought className="space-y-0 pt-2">
                  {MAIN_BEATS.slice(1).map((beatDef, position) => {
                    const index = position + 1
                    if (main.beat < index) return null
                    const isFirst = index === 1
                    const isLast = index === MAIN_BEATS.length - 1
                    const complete = main.beat > index || (main.beat === index && main.shown >= beatDef.words.length)
                    return (
                      <ChainOfThoughtStep
                        key={index}
                        icon={isFirst ? SearchIcon : Check}
                        tone="brand-blue"
                        status={complete ? 'complete' : 'active'}
                        compact={!isFirst && !(main.done && isLast)}
                        elbow={main.done && isLast ? 'out' : isFirst ? 'in' : undefined}
                        label={
                          <span className={LABEL}>
                            <StreamedLabel
                              words={beatDef.words}
                              shown={main.beat > index ? beatDef.words.length : main.shown}
                              complete={complete}
                            />
                          </span>
                        }
                        className={`${isFirst ? nestedIntroStep('brand-blue') : subStep('brand-blue')}${isLast ? '' : ' pb-3'}`}
                      />
                    )
                  })}
                </ChainOfThought>
              </div>
            ) : null}
            </ChainOfThoughtStep>
          ) : null}

          {entry === 'keywords' && stage >= 1 ? (
            <div ref={setAnchor('picking')}>
              <ChainOfThoughtStep
                icon={HelpCircle}
                tone="brand-blue"
                status={stage > 1 ? 'complete' : 'active'}
                label={<span className={LABEL}>Out of these, which ones look promising?</span>}
                className={mainStep('brand-blue')}
              >
                {suggestions.length === 0 ? (
                  <p className="text-sm text-slate-500">Nothing in this post beyond what you already track.</p>
                ) : (
                  renderPickCards(suggestions, stage === 1)
                )}
                {stage === 1 ? (
                  <>
                    {suggestions.length > 0 ? (
                      <ContinueButton disabled={picked.length === 0} onClick={blurAnd(() => send({ type: 'CONTINUE' }))}>
                        Continue
                      </ContinueButton>
                    ) : null}
                    <GhostButton onClick={blurAnd(() => send({ type: 'NONE_RELEVANT' }))}>
                      {suggestions.length > 0 ? 'None of these are relevant' : 'Dig through the comments instead'}
                    </GhostButton>
                  </>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {entry === 'keywords' && stage >= 2 ? (
            <div ref={setAnchor('retrying')}>
              <ChainOfThoughtStep
                icon={SearchIcon}
                tone="brand-blue"
                status={retryStepDone(0) ? 'complete' : 'active'}
                label={
                  <span className={LABEL}>
                    <StreamedLabel
                      words={RETRY_BEATS[0].words}
                      shown={retry.beat > 0 ? RETRY_BEATS[0].words.length : retry.shown}
                      complete={retryStepDone(0)}
                    />
                  </span>
                }
                className={`${trunkStep('brand-blue')} [&>div:last-child]:min-w-0`}
              >
                {retry.beat >= 1 ? (
                  <ChainOfThought className="space-y-0 pt-2">
                    <ChainOfThoughtStep
                      icon={Check}
                      tone="brand-blue"
                      status={retryStepDone(1) ? 'complete' : 'active'}
                      elbow="in"
                      label={
                        <span className={LABEL}>
                          <StreamedLabel
                            words={RETRY_BEATS[1].words}
                            shown={retry.beat > 1 ? RETRY_BEATS[1].words.length : retry.shown}
                            complete={retryStepDone(1)}
                          />
                        </span>
                      }
                      className={nestedTerminalStep('brand-blue')}
                    />
                  </ChainOfThought>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {entry === 'keywords' && stage >= 3 && snapshot.value !== 'dismissed' ? (
            <div ref={setAnchor('repicking')}>
              <ChainOfThoughtStep
                icon={HelpCircle}
                tone="brand-blue"
                status={stage > 3 ? 'complete' : 'active'}
                label={<span className={LABEL}>How about these ones?</span>}
                className={mainStep('brand-blue')}
              >
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold uppercase text-slate-500">From the replies</p>
                  {retryComments.map((comment) => (
                    <div key={`${comment.author}-${comment.text}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-xs font-bold text-[#0B3E91]">{comment.author}</p>
                      <p className="text-sm text-slate-700">“{comment.text}”</p>
                    </div>
                  ))}
                </div>
                {suggestions2.length === 0 ? (
                  <p className="text-sm text-slate-500">Still nothing in the replies either.</p>
                ) : (
                  renderPickCards(suggestions2, stage === 3)
                )}
                {stage === 3 ? (
                  <>
                    {suggestions2.length > 0 ? (
                      <ContinueButton disabled={picked.length === 0} onClick={blurAnd(() => send({ type: 'CONTINUE' }))}>
                        Continue
                      </ContinueButton>
                    ) : null}
                    <GhostButton onClick={blurAnd(() => send({ type: 'NONE_RELEVANT' }))}>
                      {suggestions2.length > 0 ? 'Still nothing' : 'Wrap it up'}
                    </GhostButton>
                  </>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {snapshot.value === 'dismissed' ? (
            <div ref={setAnchor('dismissed')}>
              <ChainOfThoughtStep
                icon={HelpCircle}
                tone="brand-blue"
                status="complete"
                label={<span className={LABEL}>No problem — I&apos;ll keep listening to what you&apos;ve already got.</span>}
                className={terminalStep('brand-blue')}
              />
            </div>
          ) : null}

          {entry === 'keywords' && stage >= 4 ? (
            <div ref={setAnchor('onlineAsk')}>
              <ChainOfThoughtStep
                icon={HelpCircle}
                tone="brand-blue"
                status={stage > 4 ? 'complete' : 'active'}
                label={<span className={LABEL}>Want me to look online for more places talking about this?</span>}
                className={mainStep('brand-blue')}
              >
                {stage === 4 ? (
                  <>
                    <ContinueButton onClick={blurAnd(() => send({ type: 'LOOK_ONLINE' }))}>
                      Yes, look online
                    </ContinueButton>
                    <GhostButton onClick={blurAnd(() => send({ type: 'SKIP_ONLINE' }))}>
                      No, just these
                    </GhostButton>
                  </>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {stage >= 5 ? (
            <div ref={setAnchor('searching')}>
              <ChainOfThoughtStep
                icon={GlobeIcon}
                tone="brand-blue"
                status={dorksAll ? 'complete' : 'active'}
                label={<span className={LABEL}>Checking what&apos;s out there…</span>}
                className={`${trunkStep('brand-blue')} [&>div:last-child]:min-w-0`}
              >
                <ChainOfThought className="space-y-0 pt-2">
                  {DORKS.slice(0, dorksShown).map((dork, index) => {
                    const isLastDork = dorksAll && index === dorksShown - 1
                    return (
                      <ChainOfThoughtStep
                        key={dork}
                        icon={GlobeIcon}
                        tone="brand-blue"
                        status="complete"
                        compact={!isLastDork}
                        elbow={isLastDork ? 'out' : index === 0 ? 'in' : undefined}
                        label={<span className={LABEL}>Google dork · {dork}</span>}
                        className={`${subStep('brand-blue')}${isLastDork ? '' : ' pb-3'}`}
                      />
                    )
                  })}
                </ChainOfThought>
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {stage >= 6 ? (
            <div ref={setAnchor('groups')}>
              <ChainOfThoughtStep
                icon={Users}
                tone="brand-blue"
                status={stage > 6 ? 'complete' : 'active'}
                label={<span className={LABEL}>Found a few places worth a look.</span>}
                className={mainStep('brand-blue')}
              >
                {!communities ? (
                  <p className="text-sm text-slate-500">Checking the neighbourhood…</p>
                ) : discovered.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    You&apos;re already in every place I know on this platform — the map will stick to this one.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {discovered.map((group) => {
                      const groupIcon = SOCIAL_ICONS.find((row) => row.id === group.platform)
                      const joined = joinedIds.includes(group.id) || group.joinState === 'accepted'
                      const pending = !joined && group.joinState === 'pending'
                      const busy = joiningId === group.id
                      return (
                        <div key={group.id} className="shadow-hard rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                          <div className="flex items-center gap-2.5">
                            {groupIcon ? (
                              <SocialGlyph icon={groupIcon} className="size-6 shrink-0 text-[#2A8CFF]" />
                            ) : null}
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
                            ) : group.platform !== 'facebook' && stage === 6 ? (
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
                          <p className="mt-0.5 truncate text-xs font-semibold text-[#0B3E91]">
                            Looks relevant for “{firstPick}”.
                          </p>
                          {group.platform === 'facebook' && !joined && !pending && stage === 6 ? (
                            <div className="mt-2 space-y-1.5 border-t border-slate-200 pt-2">
                              <label className="block text-xs font-semibold text-slate-600">
                                Join with
                                {fbAccounts.length === 0 ? (
                                  <span className="mt-1 block font-normal text-slate-500">
                                    Connect a Facebook account to join.
                                  </span>
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
                )}
                {joinError ? <p className="text-sm font-semibold text-red-600">{joinError}</p> : null}
                {stage === 6 ? (
                  <ContinueButton onClick={blurAnd(() => send({ type: 'CONTINUE_GROUPS' }))}>
                    Continue
                  </ContinueButton>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {stage >= 7 && snapshot.value !== 'dismissed' ? (
            <div ref={setAnchor('mapReady')}>
              <ChainOfThoughtStep
                icon={Check}
                tone="brand-blue"
                status={snapshot.value === 'saved' ? 'complete' : 'active'}
                label={<span className={LABEL}>Here&apos;s the map.</span>}
                className={terminalStep('brand-blue')}
              >
                <div className="flex flex-col gap-1.5">
                  {mapPhrases.map((phrase) => (
                    <div key={phrase} className="rounded-xl border border-[#2A8CFF] bg-[#EAF3FF] px-3 py-2">
                      <p className="truncate text-sm font-bold text-[#0B3E91]">“{phrase}”</p>
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {scopeNames.length > 0 ? scopeNames.join(' + ') : 'No joined community yet'}
                      </p>
                    </div>
                  ))}
                </div>
                {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
                {snapshot.value === 'saved' ? (
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                    <Check className="size-4" />
                    {saved.length} {saved.length === 1 ? 'keyword' : 'keywords'} saved — now listening
                  </p>
                ) : null}
              </ChainOfThoughtStep>
            </div>
          ) : null}
        </ChainOfThought>
      </div>
      {snapshot.value === 'saved' ? (
        <p className="px-1 text-xs text-slate-500">
          New keywords appear on their own analytics pages once the first signals land.
        </p>
      ) : null}
    </div>
  )
}
