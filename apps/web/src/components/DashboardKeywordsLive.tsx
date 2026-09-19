import { useMemo, useState } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { Link } from 'react-router-dom'
import { Badge, Button, useToast } from '@listeningkit/ui'
import { SOCIAL_ICONS, SocialGlyph } from '@/lib/social-icons'
import { hitsListRef, keywordsListRef, sessionsListRef } from '@/lib/convex'
import { syncFeed } from '@/lib/feed'
import {
  createLiveKeyword, intentLabel, liveHitsSchema, liveKeywordsSchema, removeLiveKeyword, scoreBand, setLiveKeywordStatus, sortHits,
  type LiveHit, type LiveKeyword,
} from '@/lib/live-keywords'
import { liveSessionsSchema } from '@/lib/live-sessions'
import { LIVE_PLATFORMS } from '@/lib/platform-support'
import type { Platform } from '@/lib/platform'

const SUGGESTED_SUBREDDITS = ['smallbusiness', 'marketing', 'entrepreneur', 'startups', 'freelance']

const PLATFORM_CHOICES: { id: Platform; label: string; ready: boolean }[] = (
  [['reddit', 'Reddit'], ['x', 'X'], ['facebook', 'Facebook']] as const
).map(([id, label]) => ({ id, label, ready: LIVE_PLATFORMS.includes(id) }))

function ago(ms: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - ms) / 60000))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  return hours < 24 ? `${hours} hr ago` : `${Math.round(hours / 24)} d ago`
}

/** When this phrase's community was last read, and a plain warning when the data may be old. */
export function freshness(keyword: Pick<LiveKeyword, 'lastCheckedAt' | 'lastSource'> & { platform?: LiveKeyword['platform'] }): string {
  if (keyword.lastCheckedAt === null) {
    return keyword.platform && keyword.platform !== 'reddit' ? 'waiting for the helper on your computer' : 'not checked yet'
  }
  const when = `checked ${ago(keyword.lastCheckedAt)}`
  if (keyword.lastSource === 'mirror') return `${when} from a backup source, posts may be hours old`
  return keyword.lastSource === 'helper' ? `${when} by your helper` : when
}

const HELPERS = {
  x: { name: 'X', script: 'x_push.py' },
  facebook: { name: 'Facebook', script: 'facebook_push.py' },
} as const

/** What a person needs to do before X or Facebook phrases start filling in: both are read by a helper on their own computer. */
function HelperNote({ platform, connected }: { platform: keyof typeof HELPERS; connected: boolean | null }) {
  const { name, script } = HELPERS[platform]
  const link = 'font-semibold underline decoration-dashed underline-offset-4'
  return (
    <div className="rounded-xl bg-[#eaf3ff] p-4 text-sm text-slate-700">
      <p className="font-bold text-text-primary">{name} is read by a small helper on your computer</p>
      <p className="mt-1">It uses your own connected {name} login, so your login never leaves your machine unencrypted. Three steps, one time:</p>
      <ol className="ml-5 mt-2 list-decimal space-y-1">
        <li>
          {connected ? `${name} is connected.` : (
            <>Connect {name}: <Link to="/dashboard/settings" className={link}>open Settings</Link> and paste your {name} token.</>
          )}
        </li>
        <li>Make a key on <Link to="/dashboard/settings" className={link}>Settings, Send posts in</Link>.</li>
        <li>Run the helper: <code className="rounded bg-white px-1.5 py-0.5">python clients/{script} --interval 300</code></li>
      </ol>
    </div>
  )
}

function HitCard({ hit }: { hit: LiveHit }) {
  const icon = SOCIAL_ICONS.find((item) => item.id === hit.platform)
  return (
    <a
      href={hit.post.url}
      target="_blank"
      rel="noreferrer"
      className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-[#2a8cff]"
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        {icon ? <SocialGlyph icon={icon} className="size-4 text-slate-500" /> : null}
        <Badge variant="muted">{hit.phrase}</Badge>
        {hit.score !== null ? (
          <Badge variant={{ strong: 'success', maybe: 'warning', weak: 'muted' }[scoreBand(hit.score)] as 'success' | 'warning' | 'muted'}>
            {hit.score} · {intentLabel(hit.intent)}
          </Badge>
        ) : null}
        <span>by {hit.post.authorName}</span>
        <span>· matched {ago(hit.matchedAt)}</span>
      </div>
      {hit.reason ? <span className="text-sm italic text-slate-600">{hit.reason}</span> : null}
      <span className="font-bold text-text-primary">{hit.post.title ?? hit.post.snippet ?? 'Untitled post'}</span>
      {hit.post.title && hit.post.snippet ? (
        <span className="line-clamp-3 text-sm text-text-secondary">{hit.post.snippet}</span>
      ) : null}
    </a>
  )
}

function KeywordRow({ keyword, onToggle, onRemove }: { keyword: LiveKeyword; onToggle: () => void; onRemove: () => void }) {
  const listening = keyword.status === 'listening'
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-bold text-text-primary">“{keyword.phrase}”</span>
        <span className="truncate text-sm text-text-secondary">
          {keyword.platform === 'x' ? 'on X' : keyword.platform === 'facebook' ? 'on Facebook' : keyword.subreddit ? `in r/${keyword.subreddit}` : 'everywhere'} · {keyword.signalsCount}{' '}
          {keyword.signalsCount === 1 ? 'match' : 'matches'} · {freshness(keyword)}
        </span>
      </div>
      <Badge variant={listening ? 'success' : 'muted'}>{listening ? 'Listening' : 'Paused'}</Badge>
      <Button type="button" variant="gray" size="lg" onClick={onToggle}>{listening ? 'Pause' : 'Resume'}</Button>
      <Button type="button" variant="red" size="lg" shadow="hard" onClick={onRemove}>Remove</Button>
    </div>
  )
}

/** The normal-user Keywords page in live mode: say what to listen for, see matches arrive. */
export function DashboardKeywordsLive() {
  const { isAuthenticated } = useConvexAuth()
  const keywordData = useQuery(keywordsListRef, isAuthenticated ? {} : 'skip')
  const hitData = useQuery(hitsListRef, isAuthenticated ? {} : 'skip')
  const { error: notifyError, success: notifySuccess } = useToast()

  const [phrase, setPhrase] = useState('')
  const [subreddit, setSubreddit] = useState('')
  const [platform, setPlatform] = useState<'reddit' | 'x' | 'facebook'>('reddit')
  const [adding, setAdding] = useState(false)
  const [checking, setChecking] = useState(false)
  const [order, setOrder] = useState<'newest' | 'best'>('newest')

  const sessionData = useQuery(sessionsListRef, isAuthenticated ? {} : 'skip')
  const helperConnected = useMemo(() => {
    const parsed = sessionData === undefined ? null : liveSessionsSchema.safeParse(sessionData)
    return parsed?.success ? parsed.data.sessions.some((session) => session.platform === platform) : null
  }, [sessionData, platform])
  const canAdd = phrase.trim() !== '' && (platform !== 'reddit' || subreddit.trim() !== '')

  const keywords = useMemo(() => {
    const parsed = keywordData === undefined ? null : liveKeywordsSchema.safeParse(keywordData)
    return parsed?.success ? parsed.data.keywords : null
  }, [keywordData])
  const hits = useMemo(() => {
    const parsed = hitData === undefined ? null : liveHitsSchema.safeParse(hitData)
    return parsed?.success ? parsed.data.hits : null
  }, [hitData])

  const watched = useMemo(
    () => [...new Set((keywords ?? []).filter((k) => k.status === 'listening' && k.subreddit).map((k) => k.subreddit as string))],
    [keywords],
  )

  async function add() {
    if (adding || !canAdd) return
    setAdding(true)
    try {
      await createLiveKeyword({ phrase, platform, ...(platform === 'reddit' ? { subreddit } : {}) })
      notifySuccess('Listening', platform !== 'reddit'
        ? `We'll look for “${phrase.trim()}” on ${platform === 'x' ? 'X' : 'Facebook'} once your helper is running.`
        : `We'll watch r/${subreddit.trim().replace(/^\/?r\//i, '')} for “${phrase.trim()}”.`)
      setPhrase('')
    } catch (err: unknown) {
      notifyError('Could not add the phrase', err instanceof Error ? err.message : 'Try again.')
    } finally {
      setAdding(false)
    }
  }

  async function checkNow() {
    if (checking || watched.length === 0) return
    setChecking(true)
    try {
      let fetched = 0
      for (const name of watched) fetched += (await syncFeed(name)).ingested
      notifySuccess('Checked now', `Looked through ${fetched} recent posts in ${watched.length} ${watched.length === 1 ? 'community' : 'communities'}.`)
    } catch (err: unknown) {
      notifyError('Check failed', err instanceof Error ? err.message : 'Try again in a moment.')
    } finally {
      setChecking(false)
    }
  }

  async function run(action: () => Promise<void>, failure: string) {
    try { await action() } catch (err: unknown) {
      notifyError(failure, err instanceof Error ? err.message : 'Try again.')
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">What should we listen for?</h1>
        <p className="max-w-2xl text-sm text-text-secondary">
          Type a phrase people might say, like “need a bookkeeper”, and pick a community. We check it every 10 minutes and
          show every post that mentions it.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap gap-2">
          {PLATFORM_CHOICES.map((choice) => choice.ready ? (
            <button
              key={choice.id}
              type="button"
              aria-pressed={platform === choice.id}
              onClick={() => setPlatform(choice.id as 'reddit' | 'x' | 'facebook')}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${
                platform === choice.id ? 'border-[#2a8cff] bg-[#eaf3ff] text-[#1f6fe6]' : 'border-slate-200 text-text-secondary hover:border-[#2a8cff]'
              }`}
            >
              {choice.label}
            </button>
          ) : (
            <span key={choice.id} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-400">
              {choice.label}
              <span className="text-[11px] font-bold uppercase">Soon</span>
            </span>
          ))}
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Phrase</span>
          <input
            id="keyword-phrase"
            type="text"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void add() }}
            placeholder="e.g. need a bookkeeper"
            maxLength={100}
            autoComplete="off"
            className="h-14 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-[#2a8cff] focus:outline-none"
          />
        </label>
        {platform === 'x' || platform === 'facebook' ? <HelperNote platform={platform} connected={helperConnected} /> : null}
        {platform === 'reddit' ? (
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">Community</span>
          <div className="flex h-14 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 focus-within:border-[#2a8cff]">
            <span className="text-slate-500">r/</span>
            <input
              id="keyword-subreddit"
              type="text"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void add() }}
              placeholder="smallbusiness"
              maxLength={24}
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>
        ) : null}
        {platform === 'reddit' ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-text-secondary">Popular:</span>
          {SUGGESTED_SUBREDDITS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSubreddit(name)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-text-secondary hover:border-[#2a8cff] hover:text-[#2a8cff]"
            >
              r/{name}
            </button>
          ))}
        </div>
        ) : null}
        <div>
          <Button
            type="button"
            variant="blue"
            size="lg"
            shadow="hard"
            disabled={adding || !canAdd}
            onClick={add}
            className="font-bold text-white"
          >
            {adding ? 'Adding…' : 'Start listening'}
          </Button>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-text-primary">You’re listening for</h2>
          <Button type="button" variant="gray" size="lg" disabled={checking || watched.length === 0} onClick={checkNow}>
            {checking ? 'Checking…' : 'Check now'}
          </Button>
        </div>
        {(keywords ?? []).map((keyword) => (
          <KeywordRow
            key={keyword.id}
            keyword={keyword}
            onToggle={() => run(() => setLiveKeywordStatus(keyword.id, keyword.status === 'listening' ? 'paused' : 'listening'), 'Could not update the phrase')}
            onRemove={() => run(() => removeLiveKeyword(keyword.id), 'Could not remove the phrase')}
          />
        ))}
        {keywords === null ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">Loading your phrases…</p>
        ) : null}
        {keywords !== null && keywords.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
            Nothing yet. Add a phrase above to get started.
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-text-primary">Latest matches</h2>
          <div className="flex gap-2" role="group" aria-label="Order matches">
            {(['newest', 'best'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                aria-pressed={order === choice}
                onClick={() => setOrder(choice)}
                className={`rounded-full border px-3 py-1 text-sm font-semibold ${
                  order === choice ? 'border-[#2a8cff] bg-[#eaf3ff] text-[#1f6fe6]' : 'border-slate-200 text-text-secondary hover:border-[#2a8cff]'
                }`}
              >
                {choice === 'newest' ? 'Newest first' : 'Best matches first'}
              </button>
            ))}
          </div>
        </div>
        {sortHits(hits ?? [], order).map((hit) => <HitCard key={hit.id} hit={hit} />)}
        {hits === null ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">Loading matches…</p>
        ) : null}
        {hits !== null && hits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
            No matches yet. We check every 10 minutes. Press “Check now” to look right away.
          </p>
        ) : null}
      </section>
    </div>
  )
}
