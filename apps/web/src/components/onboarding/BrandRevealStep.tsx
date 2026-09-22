import { useEffect, useMemo, useState } from 'react'
import { Button, useSquircleClip } from '@listeningkit/ui'
import { Check, KeyRound, SearchIcon, Swords, Users } from 'lucide-react'
import { SOCIAL_ICONS, SocialGlyph } from '@/lib/social-icons'
import { highlightQuote } from '@/components/cards/QuoteHighlight'
import type { BrandEntity, CommunityPick } from '@/lib/brand'
import { saveKeywordMapping } from '@/lib/brand'
import { brandOnConvex, readSiteMap } from '@/lib/live-brand'
import { suggestKeywordsFromBrand, type KeywordSuggestion } from '@/lib/reveal/suggest'
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'
import {
  subStep,
  terminalStep,
  trunkStep,
} from '@/components/ai-elements/chain-joints'
import {
  Source,
  SourceContent,
  SourceTrigger,
} from '@/components/ai-elements/source'

type PagesState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ready'; links: { url: string; title?: string }[] }
  | { status: 'error'; reason: string }
  | { status: 'skipped' }

const inputClass =
  'h-12 w-full rounded-xl border border-white/30 bg-white/10 px-4 text-white outline-none placeholder:text-white/50 focus:border-white/70'

const skipClass =
  'mt-3 bg-transparent p-0 text-sm font-semibold text-white/70 underline decoration-dashed underline-offset-4 transition-colors hover:text-white'

function pageLabel(link: { url: string; title?: string }): string {
  if (link.title) return link.title
  try {
    const path = new URL(link.url).pathname.replace(/\/$/, '')
    return path || '/'
  } catch {
    return link.url
  }
}

/** A name the person typed is linkable only when it looks like a domain. */
function competitorHref(value: string): string | null {
  return /^[^\s]+\.[a-z]{2,}(\/\S*)?$/i.test(value.trim()) ? `https://${value.trim()}` : null
}

function slugId(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || 'group'
}

/**
 * White variant of the dashboard KeywordCard: same squircle surface, icon
 * rail and quoted-phrase layout, but paper-white for the onboarding backdrop.
 * Single-select — picking one saves the mapping and unlocks the next stage.
 */
function RelateKeywordCard({
  phrase,
  caption,
  selected,
  onSelect,
}: {
  phrase: string
  caption?: string
  selected: boolean
  onSelect: () => void
}) {
  const clip = useSquircleClip<HTMLDivElement>(20)
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} title={`Select “${phrase}”`} className="w-full text-left">
      <span
        ref={clip.ref}
        style={clip.style}
        className={`shadow-hard flex items-center gap-4 bg-white p-5 ${
          selected ? 'ring-4 ring-white ring-offset-2 ring-offset-[#2a8cff]' : ''
        }`}
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-lg font-bold text-slate-900">{highlightQuote(phrase, [phrase])}</span>
          {caption ? <span className="mt-0.5 truncate text-sm text-slate-500">{caption}</span> : null}
        </span>
        <span
          aria-hidden="true"
          className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            selected ? 'border-[#2a8cff] bg-[#2a8cff]' : 'border-slate-300 bg-transparent'
          }`}
        >
          {selected ? <Check aria-hidden="true" className="size-4 text-white" /> : null}
        </span>
      </span>
    </button>
  )
}

/**
 * Brand reveal: every stage shows what is really known, and every stage can
 * be skipped. Pages come from a live Firecrawl map of the person's own site;
 * competitors and groups are typed by the person (their own knowledge, never
 * looked up or guessed); keyword suggestions are derived from the offerings
 * and location the site read actually stated. A stage that cannot load shows
 * the plain-words reason and a skip — mock rows are never rendered.
 */
export function BrandRevealStep({
  profile,
  onContinue,
  leaving = false,
}: {
  profile: BrandEntity
  onContinue: () => void
  leaving?: boolean
}) {
  const siteHost = (() => {
    try {
      return new URL(profile.identity.website).hostname
    } catch {
      return profile.identity.website
    }
  })()

  // Stage 1 — pages from the live map.
  const [pages, setPages] = useState<PagesState>({ status: 'loading' })
  useEffect(() => {
    let live = true
    if (!brandOnConvex()) {
      setPages({ status: 'unavailable' })
      return
    }
    readSiteMap(profile.identity.website).then(
      (map) => {
        if (live) setPages({ status: 'ready', links: map.links })
      },
      (error: unknown) => {
        if (live) setPages({ status: 'error', reason: error instanceof Error ? error.message : 'Could not map that website' })
      },
    )
    return () => {
      live = false
    }
  }, [profile.identity.website])
  const pagesDone = pages.status === 'ready' || pages.status === 'skipped'

  // Stage 2 — competitors, typed by the person.
  const [competitors, setCompetitors] = useState<string[]>([])
  const [competitorDraft, setCompetitorDraft] = useState('')
  const [competitorsDone, setCompetitorsDone] = useState(false)
  function addCompetitor() {
    const clean = competitorDraft.trim()
    if (!clean || competitors.length >= 10) return
    if (competitors.some((row) => row.toLowerCase() === clean.toLowerCase())) return
    setCompetitors((prev) => [...prev, clean])
    setCompetitorDraft('')
  }

  // Stage 3 — keyword pick from real suggestions, or a typed phrase.
  const suggestions: KeywordSuggestion[] = useMemo(() => suggestKeywordsFromBrand(profile), [profile])
  const [keywordPick, setKeywordPick] = useState<string | null>(null)
  const [keywordDraft, setKeywordDraft] = useState('')
  const [keywordsDone, setKeywordsDone] = useState(false)
  function chooseKeyword(phrase: string) {
    const clean = phrase.trim()
    if (!clean) return
    setKeywordPick(clean)
    setKeywordsDone(true)
  }

  // Stage 4 — groups, typed by the person.
  const [groups, setGroups] = useState<CommunityPick[]>([])
  const [groupName, setGroupName] = useState('')
  const [groupPlatform, setGroupPlatform] = useState<'facebook' | 'reddit'>('facebook')
  const [groupsDone, setGroupsDone] = useState(false)
  function addGroup() {
    const name = groupName.trim()
    if (!name || groups.length >= 10) return
    const id = `${groupPlatform}-${slugId(name)}`
    if (groups.some((row) => row.id === id)) return
    const platformLabel = groupPlatform === 'facebook' ? 'Facebook' : 'Reddit'
    setGroups((prev) => [...prev, { id, platform: groupPlatform, name, detail: `${platformLabel} · added by you` }])
    setGroupName('')
  }

  function persist() {
    saveKeywordMapping({
      targets: [],
      strategies: [],
      selectedPhrase: keywordPick ?? undefined,
      competitors,
      groups,
      interested: groups.map((group) => group.id),
    })
  }

  function finishStage() {
    persist()
  }

  return (
    <div className="mb-auto mt-8 w-full">
      <div className="w-full text-left">
        <ChainOfThought className="space-y-0 text-white [&_svg.lucide]:size-6">
          <ChainOfThoughtHeader className="pb-8 text-6xl font-bold leading-tight text-white sm:text-8xl [&>span]:text-center [&>svg]:hidden">
            Tracking {profile.identity.name}
          </ChainOfThoughtHeader>

          {/* Stage 1 — pages from the live map. */}
          <div className="mx-auto w-full max-w-2xl">
            <ChainOfThoughtStep
              icon={SearchIcon}
              status={pagesDone ? 'complete' : 'active'}
              label={
                <span className="text-xl font-medium leading-relaxed text-white sm:text-2xl">
                  {pages.status === 'loading' ? `Reading ${siteHost} for its pages…` : null}
                  {pages.status === 'unavailable' ? `Page mapping needs the live backend.` : null}
                  {pages.status === 'ready'
                    ? pages.links.length > 0
                      ? `Found ${pages.links.length} ${pages.links.length === 1 ? 'page' : 'pages'} on ${siteHost}.`
                      : `The map came back with no pages on ${siteHost}.`
                    : null}
                  {pages.status === 'error' ? pages.reason : null}
                  {pages.status === 'skipped' ? `Skipped the page map — moving on.` : null}
                </span>
              }
              className={trunkStep()}
            >
              {pages.status === 'loading' ? (
                <p className="text-base text-white/70">This is a live read — it takes a few seconds.</p>
              ) : null}
              {pages.status === 'ready' && pages.links.length > 0 ? (
                <ChainOfThought className="space-y-0 pt-8 text-white">
                  {pages.links.map((link, index) => {
                    const isLast = index === pages.links.length - 1
                    return (
                      <ChainOfThoughtStep
                        key={link.url}
                        icon={Check}
                        status="complete"
                        compact={!isLast}
                        elbow={isLast ? 'out' : index === 0 ? 'in' : undefined}
                        label={
                          <span className="text-xl font-medium leading-relaxed text-white sm:text-2xl">
                            Found page {index + 1} — {pageLabel(link)}
                          </span>
                        }
                        className={subStep()}
                      >
                        <div className="flex flex-wrap items-center gap-2 -mt-1">
                          <Source href={link.url}>
                            <SourceTrigger showFavicon label={pageLabel(link)} className="rounded-sm" />
                            <SourceContent title={pageLabel(link)} description={`Mapped from ${siteHost}.`} />
                          </Source>
                        </div>
                      </ChainOfThoughtStep>
                    )
                  })}
                </ChainOfThought>
              ) : null}
              {pages.status === 'error' || pages.status === 'unavailable' || (pages.status === 'ready' && pages.links.length === 0) ? (
                <div className="pt-1">
                  <button type="button" onClick={() => setPages({ status: 'skipped' })} className={skipClass}>
                    Skip this step
                  </button>
                </div>
              ) : null}
            </ChainOfThoughtStep>
          </div>

          {/* Stage 2 — competitors, typed by the person. */}
          {pagesDone ? (
            <div className="mx-auto w-full max-w-2xl">
              <ChainOfThoughtStep
                icon={Swords}
                status={competitorsDone ? 'complete' : 'active'}
                label={
                  <span className="text-xl font-medium leading-relaxed text-white sm:text-2xl">
                    Who do you compete with?
                  </span>
                }
                className={trunkStep()}
              >
                <p className="text-base text-white/70">
                  Type a name or domain and add it — only what you enter is tracked. Nothing here is looked up or guessed.
                </p>
                {competitors.length > 0 ? (
                  <ul className="mt-3 flex flex-col gap-2">
                    {competitors.map((name) => {
                      const href = competitorHref(name)
                      return (
                        <li key={name} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                          <span className="min-w-0 flex-1 truncate font-bold text-white">{name}</span>
                          {href ? (
                            <Source href={href}>
                              <SourceTrigger showFavicon label={name} className="rounded-sm" />
                              <SourceContent title={name} description="Added by you." />
                            </Source>
                          ) : null}
                          {!competitorsDone ? (
                            <button
                              type="button"
                              onClick={() => setCompetitors((prev) => prev.filter((row) => row !== name))}
                              aria-label={`Remove ${name}`}
                              className="shrink-0 rounded-lg border border-white/40 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                            >
                              Remove
                            </button>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
                {!competitorsDone ? (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={competitorDraft}
                      onChange={(event) => setCompetitorDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') addCompetitor()
                      }}
                      placeholder="A competitor name or domain"
                      aria-label="Competitor name or domain"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addCompetitor}
                      className="h-12 shrink-0 rounded-xl bg-white px-5 font-bold text-slate-900 transition-colors hover:bg-white/90"
                    >
                      Add
                    </button>
                  </div>
                ) : null}
                {!competitorsDone ? (
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCompetitorsDone(true)
                        finishStage()
                      }}
                      className="rounded-lg bg-white px-5 py-2 text-sm font-bold text-slate-900 transition-colors hover:bg-white/90"
                    >
                      {competitors.length > 0 ? 'Done — track these' : 'I’ll add them later'}
                    </button>
                    {competitors.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          setCompetitorsDone(true)
                          finishStage()
                        }}
                        className={skipClass}
                      >
                        Skip — no competitors
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-base text-white/80">
                    {competitors.length > 0
                      ? `Nice — we'll track them against ${profile.identity.name}.`
                      : `No problem — we'll keep listening anyway.`}
                  </p>
                )}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {/* Stage 3 — keyword pick from real suggestions, or a typed phrase. */}
          {competitorsDone ? (
            <div className="mx-auto w-full max-w-2xl">
              <ChainOfThoughtStep
                icon={KeyRound}
                status={keywordsDone ? 'complete' : 'active'}
                label={
                  <span className="text-xl font-medium leading-relaxed text-white sm:text-2xl">
                    What should we listen for?
                  </span>
                }
                className={trunkStep()}
              >
                <p className="text-base text-white/70">
                  {suggestions.length > 0
                    ? 'Suggested from what your site actually says — pick one, or type your own below.'
                    : 'Your site didn’t name anything to listen for — type the phrase your customers would post.'}
                </p>
                {!keywordsDone ? (
                  <>
                    {suggestions.length > 0 ? (
                      <div className="mt-3 grid grid-cols-1 gap-4">
                        {suggestions.map((suggestion) => (
                          <RelateKeywordCard
                            key={suggestion.phrase}
                            phrase={suggestion.phrase}
                            caption={`Suggested · ${suggestion.basedOn}`}
                            selected={keywordPick === suggestion.phrase}
                            onSelect={() => chooseKeyword(suggestion.phrase)}
                          />
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-3 flex gap-2">
                      <input
                        value={keywordDraft}
                        onChange={(event) => setKeywordDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') chooseKeyword(keywordDraft)
                        }}
                        placeholder="Type your own phrase, e.g. need a plumber"
                        aria-label="Your own listening phrase"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => chooseKeyword(keywordDraft)}
                        className="h-12 shrink-0 rounded-xl bg-white px-5 font-bold text-slate-900 transition-colors hover:bg-white/90"
                      >
                        Use it
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setKeywordPick(null)
                        setKeywordsDone(true)
                        finishStage()
                      }}
                      className={skipClass}
                    >
                      Skip — I’ll add a phrase later
                    </button>
                  </>
                ) : (
                  <p className="text-base text-white/80">
                    {keywordPick ? `Sounds good — listening for “${keywordPick}”.` : `No problem — you can add a phrase anytime.`}
                  </p>
                )}
              </ChainOfThoughtStep>
            </div>
          ) : null}

          {/* Stage 4 — groups, typed by the person. */}
          {keywordsDone ? (
            <div className="mx-auto w-full max-w-2xl">
              <ChainOfThoughtStep
                icon={Users}
                status={groupsDone ? 'complete' : 'active'}
                label={
                  <span className="text-xl font-medium leading-relaxed text-white sm:text-2xl">
                    Where do your people hang out?
                  </span>
                }
                className={terminalStep()}
              >
                <p className="text-base text-white/70">
                  Name a Facebook group or subreddit you already know. Only what you enter is kept — nothing is looked up.
                </p>
                {groups.length > 0 ? (
                  <ul className="mt-3 flex flex-col gap-2">
                    {groups.map((group) => {
                      const icon = SOCIAL_ICONS.find((row) => row.id === group.platform)
                      return (
                        <li key={group.id} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3">
                          {icon ? <SocialGlyph icon={icon} className="size-8 shrink-0 text-white" /> : null}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold text-white">{group.name}</span>
                            <span className="block truncate text-sm text-white/70">{group.detail}</span>
                          </span>
                          {!groupsDone ? (
                            <button
                              type="button"
                              onClick={() => setGroups((prev) => prev.filter((row) => row.id !== group.id))}
                              aria-label={`Remove ${group.name}`}
                              className="shrink-0 rounded-lg border border-white/40 px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                            >
                              Remove
                            </button>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                ) : null}
                {!groupsDone ? (
                  <>
                    <div className="mt-3 flex gap-2">
                      <div className="flex shrink-0 overflow-hidden rounded-xl border border-white/30" role="group" aria-label="Platform">
                        {(['facebook', 'reddit'] as const).map((platform) => (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => setGroupPlatform(platform)}
                            aria-pressed={groupPlatform === platform}
                            className={`h-12 px-4 text-sm font-bold transition-colors ${
                              groupPlatform === platform ? 'bg-white text-slate-900' : 'bg-transparent text-white hover:bg-white/10'
                            }`}
                          >
                            {platform === 'facebook' ? 'Facebook' : 'Reddit'}
                          </button>
                        ))}
                      </div>
                      <input
                        value={groupName}
                        onChange={(event) => setGroupName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') addGroup()
                        }}
                        placeholder={groupPlatform === 'facebook' ? 'Group name' : 'Subreddit name'}
                        aria-label="Group or subreddit name"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={addGroup}
                        className="h-12 shrink-0 rounded-xl bg-white px-5 font-bold text-slate-900 transition-colors hover:bg-white/90"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setGroupsDone(true)
                          finishStage()
                        }}
                        className="rounded-lg bg-white px-5 py-2 text-sm font-bold text-slate-900 transition-colors hover:bg-white/90"
                      >
                        {groups.length > 0 ? 'Done — watch these' : 'I’ll add them later'}
                      </button>
                      {groups.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setGroupsDone(true)
                            finishStage()
                          }}
                          className={skipClass}
                        >
                          Skip — no groups yet
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-base text-white/80">
                    {groups.length > 0
                      ? `Posting and listening starts where your people already are.`
                      : `No problem — you can add groups anytime.`}
                  </p>
                )}
              </ChainOfThoughtStep>
            </div>
          ) : null}
        </ChainOfThought>
      </div>
      {groupsDone ? (
        <Button
          type="button"
          onClick={() => {
            persist()
            onContinue()
          }}
          disabled={leaving}
          size="xl"
          shadow="hard"
          className="mt-10 h-14 rounded-xl bg-white px-10 font-bold text-slate-900 hover:bg-white/90 disabled:opacity-70"
        >
          {leaving ? 'Wrapping up…' : 'Continue'}
        </Button>
      ) : null}
    </div>
  )
}
