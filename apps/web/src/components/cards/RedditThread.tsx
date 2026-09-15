/**
 * from Paper
 * https://app.paper.design/file/01M1DEEQY42BZFA01XT004M9ZZ/01K4GP58P8JRM8PGBP0586VKYV/1R3-0
 * on Sep 15, 2026
 *
 * NOTE: Paper exports Tailwind v4 utilities and absolute-positioned
 * noise; this is a cleaned, prop-driven rewrite for Tailwind v3.4 with
 * the same visual recipe (post header, 24px title, 14px body, vote pill,
 * nested comment). Avatars are initials — no remote Paper asset URLs
 * (the agent avatar is the local ListeningKit logo at /logo.svg).
 * The nested Paper comment (Used-Comfortable-726 in the export) is the
 * ListeningKit Agent reply driven by the Live simulator.
 *
 * IMPORTANT — this component is read-only/presentational. `reply` is the
 * ONLY prop that can change at runtime from the Live simulator, and it only
 * ever renders inside the nested agent comment below. It never touches
 * `postTitle` / `postBody` / `postAuthor` — those describe the fixed
 * Reddit post this thread is replying to, not something typed live. If you
 * need typing to update the top post itself, that's a different behavior
 * and belongs in a different component (that's how TwitterThreads works,
 * intentionally, for the X tab).
 */

// ---------------------------------------------------------------------------
// Design tokens — named instead of inlined so the JSX below reads as intent,
// not a wall of hex codes.
// ---------------------------------------------------------------------------
const COLOR = {
  subredditName: '#333D42',
  metaText: '#576F76',
  postTitle: '#0F1A1C',
  postBody: '#2A3C42',
  chipBg: '#EAEDEF',
  chipText: '#576F76',
  agentBubbleBg: '#2A8CFF',
} as const

type PillTone = 'neutral' | 'onAccent'

export type RedditThreadProps = {
  subreddit?: string
  postAuthor?: string
  postTimeAgo?: string
  postTitle?: string
  postBody?: string
  upvotes?: number
  commentCount?: number
  /** Agent reply typed in the Live simulator. Renders ONLY inside the nested ListeningKit Agent comment — see file header note. */
  reply?: string
  /** Agent display name on the nested reply. Replaces Used-Comfortable-726 from the Paper export. */
  agentName?: string
  /** Agent avatar — the ListeningKit logo. */
  agentAvatarSrc?: string
  agentTimeAgo?: string
  commentUpvotes?: number
  className?: string
}

/** Letter-in-circle avatar, used for the subreddit/post-author side of the header — never the agent. */
function PostAuthorAvatar({ name, className = '' }: { name: string; className?: string }) {
  const initial = (name.trim().charAt(0) || 'r').toUpperCase()
  return (
    <span
      aria-hidden="true"
      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${className}`}
      style={{ backgroundColor: COLOR.chipBg, color: COLOR.chipText }}
    >
      {initial}
    </span>
  )
}

/** Up/down vote count pill. `tone="onAccent"` is for use on the blue agent-comment background; `tone="neutral"` is the default grey chip. */
function VoteCountPill({ count, tone = 'neutral' }: { count: number; tone?: PillTone }) {
  const textClass = tone === 'onAccent' ? 'text-white' : 'text-black'
  return (
    <span
      className={`inline-flex h-8 items-center rounded-full ${tone === 'neutral' ? '' : ''}`}
      style={tone === 'neutral' ? { backgroundColor: COLOR.chipBg } : undefined}
    >
      <span className="flex h-8 w-8 items-center justify-center" aria-hidden="true">
        <svg height="16" viewBox="0 0 20 20" width="16" aria-hidden="true">
          <path
            d="M10 19a3.966 3.966 0 01-3.96-3.962V10.98H2.838a1.731 1.731 0 01-1.605-1.073 1.734 1.734 0 01.377-1.895L9.364.254a.925.925 0 011.272 0l7.754 7.759c.498.499.646 1.242.376 1.894-.27.652-.9 1.073-1.605 1.073h-3.202v4.058A3.965 3.965 0 019.999 19H10ZM2.989 9.179H7.84v5.731c0 1.13.81 2.163 1.934 2.278a2.163 2.163 0 002.386-2.15V9.179h4.851L10 2.163 2.989 9.179Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className={`text-center text-[12px] font-semibold leading-4 tracking-[-0.012px] ${textClass}`}>
        {count}
      </span>
      <span className="flex h-8 w-8 items-center justify-center" aria-hidden="true">
        <svg height="16" viewBox="0 0 20 20" width="16" aria-hidden="true">
          <path
            d="M10 1a3.966 3.966 0 013.96 3.962V9.02h3.202c.706 0 1.335.42 1.605 1.073.27.652.122 1.396-.377 1.895l-7.754 7.759a.925.925 0 01-1.272 0l-7.754-7.76a1.734 1.734 0 01-.376-1.894c.27-.652.9-1.073 1.605-1.073h3.202V4.962A3.965 3.965 0 0110 1Zm7.01 9.82h-4.85V5.09c0-1.13-.81-2.163-1.934-2.278a2.163 2.163 0 00-2.386 2.15v5.859H2.989l7.01 7.016 7.012-7.016Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </span>
  )
}

/** Reply / Award / Share style action chip. `tone="onAccent"` is for the blue agent-comment background. */
function ActionChip({
  label,
  iconPath,
  tone = 'neutral',
}: {
  label: string
  iconPath: string
  tone?: PillTone
}) {
  return (
    <span
      className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-3 ${
        tone === 'onAccent' ? 'text-white' : 'text-black'
      }`}
      style={tone === 'neutral' ? { backgroundColor: COLOR.chipBg } : undefined}
    >
      <svg height="16" viewBox="0 0 20 20" width="16" aria-hidden="true">
        <path d={iconPath} fill="currentColor" />
      </svg>
      <span className="text-center text-[12px] font-semibold leading-4 tracking-[-0.012px]">
        {label}
      </span>
    </span>
  )
}

const ICON_PATH = {
  reply:
    'M10 1a9 9 0 00-9 9c0 1.947.79 3.58 1.935 4.957L.231 17.661A.784.784 0 00.785 19H10a9 9 0 009-9 9 9 0 00-9-9Zm0 16.2H6.162c-.994.004-1.907.053-3.045.144l-.076-.188a36.981 36.981 0 002.328-2.087l-1.05-1.263C3.297 12.576 2.8 11.331 2.8 10c0-3.97 3.23-7.2 7.2-7.2s7.2 3.23 7.2 7.2-3.23 7.2-7.2 7.2Z',
  award:
    'm18.75 14.536-2.414-3.581A6.947 6.947 0 0017 8c0-3.86-3.14-7-6.999-7-3.859 0-6.999 3.14-6.999 7 0 1.057.242 2.056.664 2.955l-2.414 3.581c-.289.428-.33.962-.109 1.429.22.467.658.776 1.173.826l1.575.151.758 1.494a1.435 1.435 0 001.297.795c.482 0 .926-.234 1.198-.639l2.437-3.612c.14.008.28.021.423.021.143 0 .282-.013.423-.021l2.437 3.612c.272.405.716.639 1.198.639.031 0 .062 0 .094-.003a1.435 1.435 0 001.203-.791l.758-1.495 1.576-.151c.514-.05.952-.358 1.172-.826a1.434 1.434 0 00-.109-1.429h-.006ZM10 2.8A5.205 5.205 0 0115.2 8c0 2.867-2.333 5.2-5.2 5.2A5.205 5.205 0 014.801 8c0-2.867 2.332-5.2 5.2-5.2ZM5.982 17.09l-.937-1.846-1.974-.189 1.66-2.462a7.02 7.02 0 002.936 1.999L5.982 17.09Zm10.947-2.035-1.974.189-.937 1.846-1.685-2.499a7.013 7.013 0 002.936-1.999l1.66 2.462v.001Z',
  share:
    'm12.8 17.524 6.89-6.887a.9.9 0 000-1.273L12.8 2.477a1.64 1.64 0 00-1.782-.349 1.64 1.64 0 00-1.014 1.518v2.593C4.054 6.728 1.192 12.075 1 17.376a1.353 1.353 0 00.862 1.32 1.35 1.35 0 001.531-.364l.334-.381c1.705-1.944 3.323-3.791 6.277-4.103v2.509c0 .667.398 1.262 1.014 1.518a1.638 1.638 0 001.783-.349v-.002Zm-.994-1.548V12h-.9c-3.969 0-6.162 2.1-8.001 4.161.514-4.011 2.823-8.16 8-8.16h.9V4.024L17.784 10l-5.977 5.976Z',
} as const

export function RedditThread({
  subreddit = 'r/gtmengineering',
  postAuthor = 'CoolFounder',
  postTimeAgo = '7d ago',
  postTitle = 'After years of building LinkedIn tools, here is how you actually get banned',
  postBody = 'I’ve worked on lemlist and Taplio, and there is a lot of bad advice about LinkedIn automation online.',
  upvotes = 20,
  commentCount = 4,
  reply = '',
  agentName = 'ListeningKit Agent',
  agentAvatarSrc = '/logo.svg',
  agentTimeAgo = 'now',
  commentUpvotes = 2,
  className = '',
}: RedditThreadProps) {
  const agentReplyText = reply.trim()

  return (
    <article
      className={`w-full break-words bg-white text-[12px] leading-4 antialiased [font-synthesis:none] ${className}`}
    >
      {/* --- Post header: subreddit + author, fixed (not simulator-driven) --- */}
      <div className="flex items-center gap-2 pt-2">
        <PostAuthorAvatar name={subreddit.replace(/^r\//, '')} />
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-1">
            <span className="font-bold" style={{ color: COLOR.subredditName }}>
              {subreddit}
            </span>
            <span style={{ color: COLOR.metaText }}>•</span>
            <span style={{ color: COLOR.metaText }}>{postTimeAgo}</span>
          </div>
          <span style={{ color: COLOR.subredditName }}>{postAuthor}</span>
        </div>
      </div>

      {/* --- Post body: also fixed, never bound to the simulator input --- */}
      <h3
        className="mt-2 font-[system-ui,sans-serif] text-[24px] font-semibold leading-7"
        style={{ color: COLOR.postTitle }}
      >
        {postTitle}
      </h3>
      <p
        className="mb-2 mt-1 font-[system-ui,sans-serif] text-[14px] leading-5"
        style={{ color: COLOR.postBody }}
      >
        {postBody}
      </p>

      {/* --- Post actions --- */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <VoteCountPill count={upvotes} />
        <ActionChip label={String(commentCount)} iconPath={ICON_PATH.reply} />
        <ActionChip label="Share" iconPath={ICON_PATH.share} />
      </div>

      {/* --- Nested agent reply: the ONLY part driven by `reply` --- */}
      <div
        className="mt-4 grid grid-cols-[32px_minmax(0px,1fr)] gap-0 rounded-xl p-2"
        style={{ backgroundColor: COLOR.agentBubbleBg }}
      >
        <div className="flex justify-center">
          <img
            src={agentAvatarSrc}
            alt={`${agentName} logo`}
            className="size-8 shrink-0 rounded-full object-cover"
          />
        </div>
        <div className="flex min-w-2 max-w-full items-center py-0.5 pl-2">
          <div className="flex items-center gap-1">
            <span className="line-clamp-1 font-[system-ui,sans-serif] text-[12px] font-bold leading-4 text-white">
              {agentName}
            </span>
            <span aria-hidden="true" className="font-[system-ui,sans-serif] text-[12px] font-bold leading-4 text-white/70">
              •
            </span>
            <span className="font-[system-ui,sans-serif] text-[12px] font-bold leading-4 text-white/70">
              {agentTimeAgo}
            </span>
          </div>
        </div>
        <div className="col-start-2 min-w-0">
          <div className="overflow-clip rounded-lg py-1">
            {agentReplyText ? (
              <p className="mx-2 font-[system-ui,sans-serif] text-[14px] leading-5 text-white">
                {agentReplyText}
              </p>
            ) : (
              <p className="mx-2 font-[system-ui,sans-serif] text-[14px] italic leading-5 text-white/70">
                Type the agent&apos;s reply above to preview it here.
              </p>
            )}
          </div>
        </div>
        <div className="col-start-2 min-w-0">
          <div className="flex min-h-8 flex-wrap items-center text-white">
            <VoteCountPill count={commentUpvotes} tone="onAccent" />
            <ActionChip label="Reply" iconPath={ICON_PATH.reply} tone="onAccent" />
            <ActionChip label="Award" iconPath={ICON_PATH.award} tone="onAccent" />
            <ActionChip label="Share" iconPath={ICON_PATH.share} tone="onAccent" />
          </div>
        </div>
      </div>
    </article>
  )
}

export default RedditThread