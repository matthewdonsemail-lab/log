/**
 * from Paper
 * https://app.paper.design/file/01M1DEEQY42BZFA01XT004M9ZZ/01K4GP58P8JRM8PGBP0586VKYV/1R4-0
 * on Sep 15, 2026
 *
 * NOTE: Paper exports Tailwind v4 utilities on a billboard-scale canvas
 * (p-25, text-[66px]); this is a cleaned, prop-driven rewrite for
 * Tailwind v3.4 at dashboard scale with the same visual recipe (white
 * thread card, avatar + name/handle header, body, media block on the
 * opening post, timestamp, count action row, nested reply with a
 * "Replying to" line and a thread connector). Avatars are initials — no
 * remote Paper asset URLs, except the agent's own avatar (ListeningKit logo).
 *
 * IDENTITY, on purpose:
 * - The OPENING tweet is a hardcoded inbound mention from someone else —
 *   the person the agent is replying to. It gets a plain initials avatar.
 *   `openingBody` is static demo copy; the Live simulator does NOT drive it.
 * - The NESTED reply is the agent's own reply. It gets the ListeningKit
 *   logo avatar. `reply` is what the Live simulator input drives — the
 *   typed text renders ONLY here, mirroring the Reddit thread behavior,
 *   and the two tweets must never share an avatar or the same string.
 */

import type { ComponentType } from 'react'
import { Heart, MessageCircle, MoreHorizontal, Repeat2, Share } from 'lucide-react'
import { highlightQuote } from './QuoteHighlight'

// ---------------------------------------------------------------------------
// Design tokens — named instead of inlined hex so the JSX below reads as
// intent, not a wall of color codes.
// ---------------------------------------------------------------------------
const COLOR = {
  brandBlue: '#2A8CFF',
  mediaPlaceholder: '#00C8FF',
  threadGrey: '#536471',
  connectorLine: '#E2E8F0', // slate-200
  mentionerBg: '#EAEDEF',
  mentionerText: '#576F76',
} as const

export type TwitterThreadsProps = {
  /** Name/handle of the person mentioning the brand — the opening tweet, not the agent. */
  authorName?: string
  handle?: string
  /** Hardcoded inbound mention copy — static demo content, never driven by the simulator. */
  openingBody?: string
  openingImageSrc?: string
  openingImageAlt?: string
  timestamp?: string
  replyCount?: number
  repostCount?: number
  likeCount?: number
  /** Name/handle for the agent's own reply — always the brand identity, independent of the mentioner's. */
  replyAuthorName?: string
  replyHandle?: string
  replyTimeAgo?: string
  /** Agent reply — a separately computed value (simulated agent output), renders ONLY as the nested reply tweet. */
  reply?: string
  replyReplyCount?: number
  replyRepostCount?: number
  replyLikeCount?: number
  replyHint?: string | null
  /** Listened phrases to quote-highlight inside both tweet bodies. */
  highlight?: string[]
  className?: string
}

/** Plain initials avatar for whoever mentioned the brand — never the agent. */
function MentionerAvatar({ name }: { name: string }) {
  const initial = (name.trim().replace(/^@/, '').charAt(0) || '?').toUpperCase()
  return (
    <span
      aria-hidden="true"
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
      style={{ backgroundColor: COLOR.mentionerBg, color: COLOR.mentionerText }}
    >
      {initial}
    </span>
  )
}

/** The agent's own avatar — the ListeningKit logo. Only ever used on the agent's reply. */
function AgentAvatar() {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: COLOR.brandBlue }}
    >
      <img src="/logo.svg" alt="ListeningKit logo" className="size-6 object-contain" />
    </span>
  )
}

/** Short vertical connector above the agent avatar, visually linking it back to the opening tweet — the classic thread line. */
function ThreadConnector() {
  return (
    <span
      aria-hidden="true"
      className="h-2 w-0.5 shrink-0 rounded-full"
      style={{ backgroundColor: COLOR.connectorLine }}
    />
  )
}

function ThreadMedia({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="mt-2 max-h-[420px] w-full rounded-2xl object-cover"
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className="mt-2 h-48 w-full rounded-2xl"
      style={{ backgroundColor: COLOR.mediaPlaceholder }}
    />
  )
}

function ThreadAction({
  icon: Icon,
  count,
  label,
}: {
  icon: ComponentType<{ size?: string | number; className?: string }>
  count: number
  label: string
}) {
  return (
    <span className="flex items-center gap-1.5 text-[13px]" style={{ color: COLOR.threadGrey }} title={label}>
      <span aria-hidden="true" className="flex">
        <Icon size={18} />
      </span>
      <span>{count}</span>
    </span>
  )
}

function ThreadActions({
  replyCount,
  repostCount,
  likeCount,
}: {
  replyCount: number
  repostCount: number
  likeCount: number
}) {
  return (
    <div className="mt-2 flex max-w-md items-center justify-between">
      <ThreadAction icon={MessageCircle} count={replyCount} label="Replies" />
      <ThreadAction icon={Repeat2} count={repostCount} label="Reposts" />
      <ThreadAction icon={Heart} count={likeCount} label="Likes" />
      <span className="flex" style={{ color: COLOR.threadGrey }} title="Share">
        <span aria-hidden="true" className="flex">
          <Share size={18} />
        </span>
      </span>
    </div>
  )
}

export function TwitterThreads({
  authorName = 'Alex Rivera',
  handle = '@alex_builds',
  openingBody = 'hey does anyone know if this crew does same-day quotes? need someone out this week',
  openingImageSrc,
  openingImageAlt = 'Opening post image',
  timestamp = '11:18 PM · May 31, 2022 · Twitter Web App',
  replyCount = 5,
  repostCount = 1,
  likeCount = 4,
  replyAuthorName = 'ListeningKit Agent',
  replyHandle = '@listeningkit',
  replyTimeAgo = 'May 17',
  reply = '',
  replyReplyCount = 5,
  replyRepostCount = 1,
  replyLikeCount = 4,
  replyHint = null,
  highlight = [],
  className = '',
}: TwitterThreadsProps) {
  const openingTweetText = openingBody.trim()
  const agentReplyText = reply.trim()

  return (
    <article
      className={`w-full rounded-2xl bg-white p-4 antialiased [box-shadow:#0000000D_0px_14px_14px_9px] ${className}`}
    >
      {/* --- Opening tweet: the inbound mention from someone else --- */}
      <div className="flex gap-3">
        <MentionerAvatar name={authorName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[15px]">
            <span className="truncate font-bold text-black">{authorName}</span>
            <span className="truncate" style={{ color: COLOR.threadGrey }}>
              {handle}
            </span>
          </div>
          <p className="mt-0.5 whitespace-pre-line text-[15px] leading-6 text-black">
            {highlightQuote(openingTweetText, highlight)}
          </p>
          <ThreadMedia src={openingImageSrc} alt={openingImageAlt} />
          <p className="mt-2 text-[13px]" style={{ color: COLOR.threadGrey }}>
            {timestamp}
          </p>
          <ThreadActions replyCount={replyCount} repostCount={repostCount} likeCount={likeCount} />
        </div>
        <span className="flex shrink-0" style={{ color: COLOR.threadGrey }} title="More">
          <span aria-hidden="true" className="flex">
            <MoreHorizontal size={18} />
          </span>
        </span>
      </div>

      {/* --- Nested reply: the agent's own reply, always the ListeningKit identity --- */}
      <div className="mt-3 flex gap-3">
        <div aria-hidden="true" className="flex w-10 shrink-0 flex-col items-center gap-1">
          <ThreadConnector />
          <AgentAvatar />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[15px]">
            <span className="truncate font-bold text-black">{replyAuthorName}</span>
            <span className="truncate" style={{ color: COLOR.threadGrey }}>
              {replyHandle} • {replyTimeAgo}
            </span>
          </div>
          <p className="text-sm" style={{ color: COLOR.threadGrey }}>
            Replying to {handle}
          </p>
          {agentReplyText ? (
            <p className="mt-0.5 whitespace-pre-line text-[15px] leading-6 text-black">
              {highlightQuote(agentReplyText, highlight)}
            </p>
          ) : (
            <p className="mt-0.5 rounded-xl bg-black/5 p-3 text-sm italic text-text-secondary">
              The agent&apos;s reply previews here.
            </p>
          )}
          <ThreadActions
            replyCount={replyReplyCount}
            repostCount={replyRepostCount}
            likeCount={replyLikeCount}
          />
          {replyHint ? <p className="mt-1 text-[11px] text-text-secondary">{replyHint}</p> : null}
        </div>
        <span className="flex shrink-0" style={{ color: COLOR.threadGrey }} title="More">
          <span aria-hidden="true" className="flex">
            <MoreHorizontal size={18} />
          </span>
        </span>
      </div>
    </article>
  )
}

export default TwitterThreads