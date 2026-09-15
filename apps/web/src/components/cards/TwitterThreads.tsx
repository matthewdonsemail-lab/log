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
 * - `TwitterThreads` is the opening post only — a hardcoded inbound mention
 *   from someone else (plain initials avatar). Static demo copy; the Live
 *   simulator does NOT drive it.
 * - `TwitterThreadReply` is the agent's own reply — a self-contained blue
 *   card (brand blue, white text) with the ListeningKit logo avatar,
 *   "Replying to" line, and thread connector. `reply` is what the Live
 *   simulator input drives. The two must never share an avatar or the
 *   same string.
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
  mentionerBg: '#EAEDEF',
  mentionerText: '#576F76',
  replyText: '#FFFFFF',
  replyMuted: 'rgba(255,255,255,0.7)',
  replyConnector: 'rgba(255,255,255,0.45)',
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
  /** Listened phrases to quote-highlight inside the tweet body. */
  highlight?: string[]
  className?: string
}

export type TwitterThreadReplyProps = {
  /** Name/handle for the agent's own reply — always the brand identity. */
  authorName?: string
  handle?: string
  timeAgo?: string
  /** Handle of the person being replied to. */
  replyToHandle?: string
  /** Agent reply typed in the simulator — renders as the reply tweet body. */
  reply?: string
  replyReplyCount?: number
  replyRepostCount?: number
  replyLikeCount?: number
  replyHint?: string | null
  /** Listened phrases to quote-highlight inside the reply body. */
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

/** The agent's own avatar — the ListeningKit logo, only ever used on the agent's reply. */
function AgentAvatar() {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-white/80"
    >
      <svg viewBox="0 0 1080 1080" className="size-6" fill={COLOR.brandBlue} xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M794.126 607.774L799.018 519.176C799.291 514.237 797.317 509.44 793.647 506.127L724.695 443.873L788.79 376.577C791.859 373.355 793.484 369.022 793.292 364.577L789.032 265.842C788.838 261.345 786.801 257.126 783.4 254.18L579.095 77.1887C570.973 70.1523 558.372 76.2278 558.808 86.9707L566.872 286.021L484.302 315.589C480.187 317.062 476.832 320.122 474.985 324.085L392.75 500.545C254.445 502.807 148.482 550.23 126.713 631.472C94.8392 750.428 255.543 896.845 485.656 958.504C594.27 987.607 698.935 992.625 782.531 977.301C786.867 976.506 790.387 973.377 791.778 969.192L808.259 919.616L848.514 952.536C851.974 955.366 856.716 956.106 860.821 954.335C912.675 931.967 948.385 898.196 960.025 854.757C981.853 773.294 913.367 678.953 794.126 607.774ZM537.402 773.284C640.49 800.907 736.552 795.238 783.777 763.425C785.431 771.929 785.271 780.267 783.12 788.294C767.329 847.227 650.206 867.048 521.517 832.566C392.829 798.084 301.307 722.356 317.098 663.424C319.249 655.397 323.279 648.095 328.963 641.558C353.956 692.721 434.313 745.662 537.402 773.284Z"
        />
      </svg>
    </span>
  )
}

/** Short vertical connector above the agent avatar — the classic thread line. */
function ThreadConnector() {
  return (
    <span
      aria-hidden="true"
      className="h-2 w-0.5 shrink-0 rounded-full"
      style={{ backgroundColor: COLOR.replyConnector }}
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
    <span
      className="flex items-center gap-1.5 text-[13px]"
      style={{ color: COLOR.replyMuted }}
      title={label}
    >
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
      <span className="flex" style={{ color: COLOR.replyMuted }} title="Share">
        <span aria-hidden="true" className="flex">
          <Share size={18} />
        </span>
      </span>
    </div>
  )
}

function MoreButton() {
  return (
    <span className="flex shrink-0" style={{ color: COLOR.replyMuted }} title="More">
      <span aria-hidden="true" className="flex">
        <MoreHorizontal size={18} />
      </span>
    </span>
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
  highlight = [],
  className = '',
}: TwitterThreadsProps) {
  const openingTweetText = openingBody.trim()

  return (
    <article className={`w-full rounded-xl bg-white pt-4 antialiased ${className}`}>
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
        <MoreButton />
      </div>
    </article>
  )
}

/**
 * The nested reply tweet — the agent's own reply, always the ListeningKit
 * identity: a self-contained blue card with white text, thread connector,
 * and logo avatar. The simulator input drives `reply`.
 */
export function TwitterThreadReply({
  authorName = 'ListeningKit Agent',
  handle = '@listeningkit',
  timeAgo = 'May 17',
  replyToHandle = '@alex_builds',
  reply = '',
  replyReplyCount = 5,
  replyRepostCount = 1,
  replyLikeCount = 4,
  replyHint = null,
  highlight = [],
  className = '',
}: TwitterThreadReplyProps) {
  const agentReplyText = reply.trim()

  return (
    <div
      className={`rounded-xl p-3 antialiased ${className}`}
      style={{ backgroundColor: COLOR.brandBlue }}
    >
      <div className="flex gap-3">
        <div aria-hidden="true" className="flex w-10 shrink-0 flex-col items-center gap-1">
          <ThreadConnector />
          <AgentAvatar />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[15px]">
            <span className="truncate font-bold" style={{ color: COLOR.replyText }}>
              {authorName}
            </span>
            <span className="truncate" style={{ color: COLOR.replyMuted }}>
              {handle} • {timeAgo}
            </span>
          </div>
          <p className="text-sm" style={{ color: COLOR.replyMuted }}>
            Replying to {replyToHandle}
          </p>
          {agentReplyText ? (
            <p className="mt-0.5 whitespace-pre-line text-[15px] leading-6" style={{ color: COLOR.replyText }}>
              {highlightQuote(agentReplyText, highlight)}
            </p>
          ) : (
            <p className="mt-0.5 rounded-xl bg-white/15 p-3 text-sm italic text-white/85">
              The agent&apos;s reply previews here.
            </p>
          )}
          <ThreadActions
            replyCount={replyReplyCount}
            repostCount={replyRepostCount}
            likeCount={replyLikeCount}
          />
          {replyHint ? (
            <p className="mt-1 text-[11px]" style={{ color: COLOR.replyMuted }}>
              {replyHint}
            </p>
          ) : null}
        </div>
        <MoreButton />
      </div>
    </div>
  )
}

export default TwitterThreads