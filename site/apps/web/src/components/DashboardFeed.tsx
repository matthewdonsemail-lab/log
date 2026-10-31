import { useEffect, useMemo, useState } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { Button, useSquircleClip, useToast } from '@listeningkit/ui'
import { SOCIAL_ICONS, type SocialIcon } from '@/lib/social-icons'
import { getFeed, syncFeed, formatCount, type FeedItem, type FeedPlatform } from '@/lib/feed'
import { remoteFeedSchema } from '@/lib/feed/remote'
import { convexUrl, feedListRef } from '@/lib/convex'
import { apiMode } from '@/lib/transport'
import { getKeywords } from '@/lib/keywords'
import { type FirehoseEvent } from '@/lib/analytics'
import { DashboardEventInspectForm } from './DashboardEventInspectForm'
import { DashboardRelatedKeywordsForm } from './DashboardRelatedKeywordsForm'
import { DashboardRelatedCommunitiesForm } from './DashboardRelatedCommunitiesForm'
import { useDashboardFormSlot } from './DashboardFormSlot'
import { DashboardFeedHeader } from './DashboardFeedHeader'
import { FeedCardFrame, CARD_NATURAL_WIDTHS } from './cards/FeedCardFrame'
import { FacebookPostImage, FacebookPostText } from './cards/FacebookCard'
import { RedditPostText, RedditComment } from './cards/RedditCard'
import { TwitterPostText, TwitterPostImage } from './cards/TwitterCard'

/** A feed card is a captured post; shape it into the firehose event the inspect sheet expects. */
function toInspectEvent(item: FeedItem): FirehoseEvent {
  return {
    id: item.id,
    keywordId: item.keywordId ?? 'feed',
    ts: item.timestamp ?? new Date().toISOString(),
    type: 'mention',
    sentiment: (item.intent === 'looking_for_help' || item.intent === 'buying') ? 'positive'
      : item.intent === 'complaint' ? 'negative' : 'neutral',
    platform: item.platform,
    author: item.authorName,
    group: item.community ?? (item.handle ? item.handle : item.platform),
    accountId: null,
    text: [item.title, ...item.body].filter(Boolean).join(' '),
    url: `https://example.com/${item.id}`
  }
}

function FeedCard({ item, highlight }: { item: FeedItem; highlight: string[] }) {
  switch (item.platform) {
    case 'facebook':
      return item.variant === 'post-image' ? (
        <FacebookPostImage
          authorName={item.authorName}
          timeAgo={item.timeAgo}
          lines={item.body}
          imageSrc={item.imageSrc}
          avatarUrl={item.avatarUrl}
          likes={`${formatCount(item.likes)}`}
          comments={`${formatCount(item.comments)} comments`}
          shares={`${formatCount(item.shares ?? 0)} shares`}
          highlight={highlight}
        />
      ) : (
        <FacebookPostText
          authorName={item.authorName}
          timeAgo={item.timeAgo}
          lines={item.body}
          avatarUrl={item.avatarUrl}
          likes={`${formatCount(item.likes)}`}
          comments={`${formatCount(item.comments)} comments`}
          shares={`${formatCount(item.shares ?? 0)} shares`}
          highlight={highlight}
        />
      )
    case 'x':
      return item.variant === 'post-image' ? (
        <TwitterPostImage
          authorName={item.authorName}
          handle={item.handle}
          body={item.body.join(' ')}
          timestamp={item.timestamp ?? item.timeAgo}
          avatarUrl={item.avatarUrl}
          imageSrc={item.imageSrc}
          views={item.views !== undefined ? formatCount(item.views) : undefined}
          replies={item.replies !== undefined ? formatCount(item.replies) : undefined}
          reposts={item.reposts !== undefined ? formatCount(item.reposts) : undefined}
          likes={formatCount(item.likes)}
          highlight={highlight}
        />
      ) : (
        <TwitterPostText
          authorName={item.authorName}
          handle={item.handle}
          body={item.body.join(' ')}
          timestamp={item.timestamp ?? item.timeAgo}
          avatarUrl={item.avatarUrl}
          views={item.views !== undefined ? formatCount(item.views) : undefined}
          replies={item.replies !== undefined ? formatCount(item.replies) : undefined}
          reposts={item.reposts !== undefined ? formatCount(item.reposts) : undefined}
          likes={formatCount(item.likes)}
          highlight={highlight}
        />
      )
    case 'reddit':
      return item.variant === 'comment' ? (
        <RedditComment
          authorName={item.authorName}
          body={item.body.join(' ')}
          likes={formatCount(item.likes)}
          shares={formatCount(item.shares ?? 0)}
          highlight={highlight}
        />
      ) : (
        <RedditPostText
          communityName={item.community ?? item.authorName}
          title={item.title ?? item.body.join(' ')}
          likes={formatCount(item.likes)}
          shares={formatCount(item.shares ?? 0)}
          highlight={highlight}
        />
      )
  }
}

function FeedColumn({ icon, items, highlight, onInspect }: {
  icon: SocialIcon
  items: FeedItem[]
  highlight: string[]
  onInspect: (item: FeedItem) => void
}) {
  const naturalWidth = CARD_NATURAL_WIDTHS[icon.id as FeedPlatform] ?? 484
  return (
    <div className="lk-no-scrollbar flex min-h-0 flex-col gap-3 overflow-y-auto pb-4">
      <DashboardFeedHeader icon={icon} />
      {items.map((item) => (
        <FeedCardFrame
          key={item.id}
          naturalWidth={naturalWidth}
          score={item.score}
          intent={item.intent}
          reason={item.reason}
          onInspect={() => onInspect(item)}
        >
          <FeedCard item={item} highlight={highlight} />
        </FeedCardFrame>
      ))}
    </div>
  )
}

function FeedSkeletonColumn({ icon }: { icon: SocialIcon }) {
  const clip = useSquircleClip<HTMLDivElement>(20)

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <DashboardFeedHeader icon={icon} />
      <section
        ref={clip.ref}
        style={clip.style}
        aria-label={`${icon.label} feed loading`}
        className="flex flex-col gap-2.5 bg-white p-5"
      >
        <div className="h-3 animate-pulse rounded-full bg-black/5" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-black/5" />
        <div className="h-3 w-3/5 animate-pulse rounded-full bg-black/5" />
      </section>
    </div>
  )
}

/** Phrases currently listened for — cards quote-highlight these words. */
function useListeningPhrases(): string[] {
  const [phrases, setPhrases] = useState<string[]>([])
  useEffect(() => {
    let cancelled = false
    getKeywords()
      .then((list) => {
        if (!cancelled) {
          setPhrases(list.filter((keyword) => keyword.status === 'listening').map((keyword) => keyword.phrase))
        }
      })
      .catch(() => {
        if (!cancelled) setPhrases([])
      })
    return () => {
      cancelled = true
    }
  }, [])
  return phrases
}

function FeedGrid({ items, phrases, onInspect }: {
  items: FeedItem[] | null
  phrases: string[]
  onInspect: (item: FeedItem) => void
}) {
  const byPlatform = (platform: FeedPlatform) => (items ?? []).filter((item) => item.platform === platform)
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-3 gap-4 sm:grid-cols-2 sm:grid-rows-2 sm:gap-5 xl:grid-cols-3 xl:grid-rows-1">
      {SOCIAL_ICONS.map((icon) =>
        items === null ? (
          <FeedSkeletonColumn key={icon.id} icon={icon} />
        ) : (
          <FeedColumn key={icon.id} icon={icon} items={byPlatform(icon.id as FeedPlatform)} highlight={phrases} onInspect={onInspect} />
        )
      )}
    </div>
  )
}

function SyncBar({ subreddit, onSubreddit, syncing, onSync }: {
  subreddit: string
  onSubreddit: (value: string) => void
  syncing: boolean
  onSync: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-500">
        r/
        <input
          value={subreddit}
          onChange={(e) => onSubreddit(e.target.value)}
          placeholder="marketing"
          autoComplete="off"
          spellCheck={false}
          aria-label="Subreddit to sync"
          className="w-36 bg-transparent text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none"
        />
      </label>
      <Button type="button" variant="blue" disabled={syncing} onClick={onSync} className="h-10 rounded-xl px-4 text-sm font-bold">
        {syncing ? 'Syncing…' : 'Sync now'}
      </Button>
    </div>
  )
}

/** Live mode on Convex: a subscription, so synced or pushed posts appear with no reload. */
function ConvexFeed() {
  const { isAuthenticated } = useConvexAuth()
  const data = useQuery(feedListRef, isAuthenticated ? {} : 'skip')
  const phrases = useListeningPhrases()
  const [subreddit, setSubreddit] = useState('marketing')
  const [syncing, setSyncing] = useState(false)
  const [inspectedEvent, setInspectedEvent] = useState<FirehoseEvent | null>(null)
  const [relatedEvent, setRelatedEvent] = useState<FirehoseEvent | null>(null)
  const [communityEvent, setCommunityEvent] = useState<FirehoseEvent | null>(null)
  const setFormSlot = useDashboardFormSlot()
  const { error: notifyError, success: notifySuccess } = useToast()

  const parsed = useMemo(() => (data === undefined ? null : remoteFeedSchema.safeParse(data)), [data])
  const items = parsed === null ? null : parsed.success ? parsed.data.items : []

  useEffect(() => {
    if (parsed && !parsed.success) notifyError('Feed failed to load', 'Live feed returned an invalid response.')
  }, [parsed, notifyError])

  useEffect(() => {
    setFormSlot(
      relatedEvent ? (
        <DashboardRelatedKeywordsForm event={relatedEvent} phrases={phrases} onClose={() => setRelatedEvent(null)} />
      ) : communityEvent ? (
        <DashboardRelatedCommunitiesForm event={communityEvent} phrases={phrases} onClose={() => setCommunityEvent(null)} />
      ) : inspectedEvent ? (
        <DashboardEventInspectForm
          event={inspectedEvent}
          phrases={phrases}
          onClose={() => setInspectedEvent(null)}
          onFindRelated={(found) => setRelatedEvent(found)}
          onFindCommunities={(found) => setCommunityEvent(found)}
        />
      ) : null
    )
    return () => setFormSlot(null)
  }, [relatedEvent, communityEvent, inspectedEvent, phrases, setFormSlot])

  function handleInspect(item: FeedItem) {
    setInspectedEvent(toInspectEvent(item))
  }

  async function syncNow() {
    if (syncing) return
    setSyncing(true)
    try {
      const result = await syncFeed(subreddit)
      notifySuccess(`Synced r/${subreddit.trim()}`, `${result.ingested} new posts in your feed.`)
    } catch (err: unknown) {
      notifyError('Reddit sync failed', err instanceof Error ? err.message : 'Could not sync.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <SyncBar subreddit={subreddit} onSubreddit={setSubreddit} syncing={syncing} onSync={syncNow} />
      <FeedGrid items={items} phrases={phrases} onInspect={handleInspect} />
    </div>
  )
}

export function DashboardFeed() {
  return apiMode() === 'live' && convexUrl() ? <ConvexFeed /> : <ClassicFeed />
}

function ClassicFeed() {
  const [items, setItems] = useState<FeedItem[] | null>(null)
  const phrases = useListeningPhrases()
  // Live Reddit sync: subreddit picker + refresh counter that re-runs the feed load.
  const [subreddit, setSubreddit] = useState('marketing')
  const [syncing, setSyncing] = useState(false)
  const [reloads, setReloads] = useState(0)
  const [inspectedEvent, setInspectedEvent] = useState<FirehoseEvent | null>(null)
  const [relatedEvent, setRelatedEvent] = useState<FirehoseEvent | null>(null)
  const [communityEvent, setCommunityEvent] = useState<FirehoseEvent | null>(null)
  const setFormSlot = useDashboardFormSlot()
  const { error: notifyError, success: notifySuccess } = useToast()
  const live = apiMode() === 'live'

  useEffect(() => {
    let cancelled = false
    getFeed()
      .then((res) => {
        if (!cancelled) setItems(res.items)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          notifyError('Feed failed to load', err instanceof Error ? err.message : 'Could not load the feed.')
          setItems([])
        }
      })
    return () => {
      cancelled = true
    }
  }, [notifyError, reloads])

  useEffect(() => {
    setFormSlot(
      relatedEvent ? (
        <DashboardRelatedKeywordsForm event={relatedEvent} phrases={phrases} onClose={() => setRelatedEvent(null)} />
      ) : communityEvent ? (
        <DashboardRelatedCommunitiesForm event={communityEvent} phrases={phrases} onClose={() => setCommunityEvent(null)} />
      ) : inspectedEvent ? (
        <DashboardEventInspectForm
          event={inspectedEvent}
          phrases={phrases}
          onClose={() => setInspectedEvent(null)}
          onFindRelated={(found) => setRelatedEvent(found)}
          onFindCommunities={(found) => setCommunityEvent(found)}
        />
      ) : null
    )
    return () => setFormSlot(null)
  }, [relatedEvent, communityEvent, inspectedEvent, phrases, setFormSlot])

  function handleInspect(item: FeedItem) {
    setInspectedEvent(toInspectEvent(item))
  }

  async function syncNow() {
    if (syncing) return
    setSyncing(true)
    try {
      const result = await syncFeed(subreddit)
      notifySuccess(`Synced r/${subreddit.trim()}`, `${result.ingested} new posts in your feed.`)
      setReloads((n) => n + 1)
    } catch (err: unknown) {
      notifyError('Reddit sync failed', err instanceof Error ? err.message : 'Could not sync.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {live ? <SyncBar subreddit={subreddit} onSubreddit={setSubreddit} syncing={syncing} onSync={syncNow} /> : null}
      <FeedGrid items={items} phrases={phrases} onInspect={handleInspect} />
    </div>
  )
}
