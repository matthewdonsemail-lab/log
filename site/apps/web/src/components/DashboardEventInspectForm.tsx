import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@listeningkit/ui'
import {
  Brain,
  ChevronDown,
  FileText,
  Flame,
  Lightbulb,
  Link2,
  MapPin,
  MessageSquareText,
  SearchIcon,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Youtube,
  Zap
} from 'lucide-react'
import {
  EVENT_SENTIMENT_LABELS,
  FIREHOSE_TYPE_LABELS,
  type EventSentiment,
  type FirehoseEvent,
  type FirehoseEventType
} from '../lib/analytics'
import { accountIssueSnapshot } from '../lib/account-issues'
import { getAccounts, type ConnectionRecord } from '../lib/connections'
import { getBrand, type AiQuery } from '../lib/brand'
import { buildAiQuery, draftReply, suggestResource } from '../lib/brand/query'
import { SOCIAL_ICONS, SocialGlyph } from '../lib/social-icons'
import { AccountHealthBadge } from './AccountHealthBadge'
import { AccountTooltip } from './AccountTooltip'
import { DashboardFormSheet } from './DashboardFormSheet'
import { FacebookPostText } from './cards/FacebookCard'
import { CARD_NATURAL_WIDTHS, FeedCardFrame } from './cards/FeedCardFrame'
import { RedditPostText } from './cards/RedditCard'
import { TwitterPostText } from './cards/TwitterCard'
import Dither from './Dither'

const SENTIMENT_BADGE: Record<EventSentiment, 'success' | 'muted' | 'danger'> = {
  positive: 'success',
  neutral: 'muted',
  negative: 'danger'
}

const AI_SUMMARY_BY_TYPE: Record<FirehoseEventType, string> = {
  mention: 'This post signals casual brand awareness rather than an active need. Low urgency, but worth tracking if the volume keeps climbing.',
  question: 'This post signals growing interest in finding a reliable option nearby. The repeated discussion suggests a clear service opportunity.',
  complaint: 'This post signals rising support friction. The tone suggests the issue is compounding and worth escalating quickly.',
  praise: 'This post signals genuine advocacy. The enthusiasm here makes it a strong candidate for a review or testimonial ask.'
}

type AiTagTone = 'red' | 'blue' | 'purple' | 'green'

const AI_TAG_TONE_STYLES: Record<AiTagTone, string> = {
  red: 'bg-red-50 text-red-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-violet-50 text-violet-600',
  green: 'bg-emerald-50 text-emerald-600'
}

const AI_TAGS_BY_TYPE: Record<FirehoseEventType, { label: string; icon: typeof Flame; tone: AiTagTone }[]> = {
  mention: [
    { label: 'Awareness', icon: Flame, tone: 'red' },
    { label: 'Local', icon: MapPin, tone: 'blue' }
  ],
  question: [
    { label: 'High intent', icon: Flame, tone: 'red' },
    { label: 'Local', icon: MapPin, tone: 'blue' },
    { label: 'Trending', icon: TrendingUp, tone: 'purple' },
    { label: 'Opportunity', icon: Zap, tone: 'green' }
  ],
  complaint: [
    { label: 'Urgent', icon: Flame, tone: 'red' },
    { label: 'Support risk', icon: MapPin, tone: 'blue' }
  ],
  praise: [
    { label: 'Advocacy', icon: Flame, tone: 'red' },
    { label: 'Opportunity', icon: Zap, tone: 'green' }
  ]
}

const AI_NEXT_ACTIONS = [
  { id: 'related', label: 'Find related mentions', icon: SearchIcon },
  { id: 'communities', label: 'Find related groups', icon: Users },
  { id: 'reply', label: 'Draft a response', icon: MessageSquareText }
] as const

type AiFollowUpId = (typeof AI_NEXT_ACTIONS)[number]['id']

function formatTs(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function timeAgo(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const minutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

/** Stable per-event engagement stat in [min, max]. */
function statFor(id: string, salt: string, min: number, max: number): number {
  let hash = 0
  const input = `${id}:${salt}`
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) | 0
  return min + (Math.abs(hash) % (max - min + 1))
}

function handleFor(name: string): string {
  const cleaned = name.replace(/^@/, '').replace(/[^a-zA-Z0-9]/g, '')
  return cleaned ? `@${cleaned}` : '@user'
}

function AiTagPill({ label, icon: Icon, tone }: { label: string; icon: typeof Flame; tone: AiTagTone }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${AI_TAG_TONE_STYLES[tone]}`}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}

/**
 * "Draft a response": the event answered in the brand's voice, plus a
 * suggested resource (video, guide, page) built from the brand's own site
 * matched to what the post is about. Attaching appends the link to the
 * draft — the round-robin of post topic → brand answer → thing to send.
 */
function ReplyDraftPanel({ query }: { query: AiQuery }) {
  const reply = useMemo(() => draftReply(query), [query])
  const resource = useMemo(() => suggestResource(query), [query])
  const [attached, setAttached] = useState(false)
  const [sent, setSent] = useState(false)
  const fullReply = attached ? `${reply}\n\nMore here: ${resource.url}` : reply
  const ResourceIcon = resource.kind === 'video' ? Youtube : resource.kind === 'guide' ? FileText : Link2

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      {sent ? (
        <>
          <p className="text-sm font-bold text-emerald-600">Reply sent</p>
          <p className="mt-1 text-xs text-slate-500">
            The live client will post it to {query.author} on the thread.
          </p>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setSent(true)}
            className="w-full rounded-lg bg-[#2A8CFF] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1E66C9]"
          >
            Send reply
          </button>
          <div className="mt-2 rounded-lg bg-white p-3">
            {query.matchedAutoreply ? (
              <p className="mb-1.5 text-xs font-semibold text-emerald-700">
                Using autoreply{query.matchedAutoreply.trigger ? ` · ${query.matchedAutoreply.trigger}` : ''} ({query.matchedAutoreply.channel})
              </p>
            ) : null}
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-800">{fullReply}</p>
          </div>
          <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#0B3E91]">
              <ResourceIcon className="size-3.5 shrink-0 text-[#2A8CFF]" />
              Suggested {resource.kind === 'video' ? 'video' : resource.kind === 'guide' ? 'guide' : 'page'}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900" title={resource.title}>
              {resource.title}
            </p>
            <p className="truncate text-xs text-slate-500" title={resource.url}>
              {resource.url}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{resource.blurb}</p>
            <button
              type="button"
              onClick={() => setAttached((prev) => !prev)}
              aria-pressed={attached}
              className={`mt-2 w-full rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                attached
                  ? 'border-[#2A8CFF] bg-[#EAF3FF] text-[#0B3E91]'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              {attached ? 'Attached to the reply' : 'Attach to reply'}
            </button>
          </div>
          {!query.brand ? (
            <p className="mt-2 text-xs text-slate-500">
              No brand profile yet — add your website in onboarding for voice-matched replies.
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}

/**
 * The inspect view for one captured post: the post itself rendered as its
 * native platform card with the heard phrase drawn in the blue dashed quotes,
 * and the capturing account badge in the sheet header. The original link is
 * the confirm. Registered into the dashboard form slot from the per-keyword
 * analytics page, docking in the layout's form column without reflow.
 */
export function DashboardEventInspectForm({
  event,
  phrases,
  onClose,
  onFindRelated,
  onFindCommunities
}: {
  event: FirehoseEvent
  /** Listened phrases to highlight inside the post and its surroundings. */
  phrases?: string[]
  onClose: () => void
  /** "Find related mentions" opens the dedicated form (no inline chain). */
  onFindRelated: (event: FirehoseEvent) => void
  /** "Find related groups/communities" opens the dedicated form (facebook + reddit only). */
  onFindCommunities: (event: FirehoseEvent) => void
}) {
  const [capturing, setCapturing] = useState<ConnectionRecord | null | undefined>(undefined)

  useEffect(() => {
    if (!event.accountId) {
      setCapturing(null)
      return
    }
    let cancelled = false
    getAccounts()
      .then((list) => {
        if (cancelled) return
        setCapturing(list.find((row) => row.id === event.accountId) ?? null)
      })
      .catch(() => {
        if (!cancelled) setCapturing(null)
      })
    return () => {
      cancelled = true
    }
  }, [event.accountId])

  const platformIcon = SOCIAL_ICONS.find((icon) => icon.id === event.platform)

  const [openAction, setOpenAction] = useState<AiFollowUpId | null>(null)
  // Brand snapshot per event: later onboarding edits can't shift a draft mid-read.
  const brandSnapshot = useMemo(() => getBrand(), [event.id])
  const query = useMemo(
    () => (openAction ? buildAiQuery(openAction, event, brandSnapshot, phrases ?? []) : null),
    [openAction, event, brandSnapshot, phrases]
  )

  // X has no groups to find — the communities action only shows on facebook
  // (groups) and reddit (communities), with the label to match.
  const followUps = useMemo(
    () =>
      AI_NEXT_ACTIONS.filter((action) => action.id !== 'communities' || event.platform !== 'x').map((action) =>
        action.id === 'communities' && event.platform === 'reddit'
          ? { ...action, label: 'Find related communities' }
          : action
      ),
    [event.platform]
  )

  return (
    <DashboardFormSheet
      open
      title={FIREHOSE_TYPE_LABELS[event.type]}
      subtitle={
        <>
          <span>{formatTs(event.ts)}</span>
          {capturing === undefined ? (
            <span aria-busy="true">Loading account…</span>
          ) : capturing ? (
            <AccountTooltip
              label={capturing.label}
              health={accountIssueSnapshot(capturing).health}
              labelIcon={
                platformIcon ? (
                  <SocialGlyph icon={platformIcon} className="size-3" />
                ) : null
              }
              badge={
                <AccountHealthBadge
                  label={capturing.label}
                  health={accountIssueSnapshot(capturing).health}
                  icon={platformIcon ? <SocialGlyph icon={platformIcon} className="size-3.5" /> : undefined}
                />
              }
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap text-white/80">
                <span className="block max-w-48 truncate">{event.group}</span>
                <span aria-hidden="true">·</span>
                <span className="block max-w-48 truncate">{event.author}</span>
              </span>
            </AccountTooltip>
          ) : (
            <span>Not attributed to a connected account.</span>
          )}
        </>
      }
      onClose={onClose}
      confirmLabel="Open original post"
      onConfirm={() => window.open(event.url, '_blank', 'noopener,noreferrer')}
    >
      <div className="flex items-center justify-between gap-2 rounded-lg border border-[#1E66C9] bg-[#2A8CFF] px-3 py-2">
        <p className="text-[11px] font-bold uppercase text-white">
          The post
        </p>
        <Badge variant={SENTIMENT_BADGE[event.sentiment]} className="shrink-0">
          {EVENT_SENTIMENT_LABELS[event.sentiment]}
        </Badge>
      </div>
      <div className="relative rounded-xl p-4">
        <div className="pointer-events-none absolute inset-0">
          <Dither
            waveColor={[0.3, 0.65, 1]}
            backgroundColor={[0.04, 0.24, 0.57]}
            waveSpeed={0.08}
            colorNum={4}
            pixelSize={3}
            enableMouseInteraction={false}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 14%, rgba(255,255,255,0) 86%, #fff 100%)',
              'linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0) 22%, rgba(255,255,255,0) 78%, #fff 100%)'
            ].join(', ')
          }}
        />
        <div className="relative">
          {event.platform === 'facebook' ? (
            <FeedCardFrame naturalWidth={CARD_NATURAL_WIDTHS.facebook}>
              <FacebookPostText
                authorName={event.author}
                timeAgo={timeAgo(event.ts)}
                lines={[event.text]}
                likes={String(statFor(event.id, 'likes', 2, 87))}
                comments={`${statFor(event.id, 'comments', 0, 24)} comments`}
                shares={`${statFor(event.id, 'shares', 0, 12)} shares`}
                highlight={phrases}
              />
            </FeedCardFrame>
          ) : event.platform === 'x' ? (
            <FeedCardFrame naturalWidth={CARD_NATURAL_WIDTHS.x}>
              <TwitterPostText
                authorName={event.author}
                handle={handleFor(event.author)}
                body={event.text}
                timestamp={formatTs(event.ts)}
                views={String(statFor(event.id, 'views', 12, 9400))}
                replies={String(statFor(event.id, 'replies', 0, 18))}
                reposts={String(statFor(event.id, 'reposts', 0, 30))}
                likes={String(statFor(event.id, 'likes', 1, 120))}
                highlight={phrases}
              />
            </FeedCardFrame>
          ) : (
            <FeedCardFrame naturalWidth={CARD_NATURAL_WIDTHS.reddit}>
              <RedditPostText
                communityName={event.group}
                title={event.text}
                likes={String(statFor(event.id, 'upvotes', 3, 400))}
                shares={String(statFor(event.id, 'comments', 1, 60))}
                highlight={phrases}
              />
            </FeedCardFrame>
          )}
        </div>
      </div>
      <div className="bg-white">
        <div className="flex items-center gap-2 rounded-t-xl border border-slate-200 bg-[#EAF3FF] px-3 py-2.5">
          <Brain className="size-4 shrink-0 text-[#2A8CFF]" />
          <span className="text-xs font-semibold text-[#0B3E91]">AI Analysis</span>
          <span className="rounded-full bg-[#2A8CFF] px-1.5 py-px text-[9px] font-bold uppercase text-white">
            beta
          </span>
          <span className="ml-auto flex cursor-not-allowed items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-400">
            <SlidersHorizontal className="size-3" />
            Sentiment
            <ChevronDown className="size-3" />
          </span>
        </div>
        <div className="space-y-4 px-3 py-3">
          <p className="text-sm leading-relaxed text-slate-700">{AI_SUMMARY_BY_TYPE[event.type]}</p>
          <div className="flex flex-wrap gap-2">
            {AI_TAGS_BY_TYPE[event.type].map((tag) => (
              <AiTagPill key={tag.label} label={tag.label} icon={tag.icon} tone={tag.tone} />
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Lightbulb className="size-3.5 shrink-0 text-[#2A8CFF]" />
              <span className="text-xs font-semibold text-slate-700">What next?</span>
            </div>
            <div className="space-y-1">
              {followUps.map((action) => {
                const active = openAction === action.id
                return (
                  <button
                    key={action.id}
                    type="button"
                    aria-expanded={active}
                    onClick={() => {
                      if (action.id === 'related') {
                        onFindRelated(event)
                        return
                      }
                      if (action.id === 'communities') {
                        onFindCommunities(event)
                        return
                      }
                      setOpenAction((prev) => (prev === action.id ? null : action.id))
                    }}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                      active
                        ? 'border-[#2A8CFF] bg-[#EAF3FF] text-[#0B3E91]'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <action.icon className="size-4 shrink-0 text-[#2A8CFF]" />
                    {action.label}
                  </button>
                )
              })}
            </div>
            {openAction === 'reply' && query ? (
              <ReplyDraftPanel query={query} />
            ) : null}
          </div>
        </div>
      </div>
    </DashboardFormSheet>
  )
}	