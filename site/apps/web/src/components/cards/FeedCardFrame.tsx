import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Badge, useComposedRef, useSquircleClip } from '@listeningkit/ui'
import { Bot, Zap } from 'lucide-react'
import { intentLabel } from '@/lib/live-keywords'

/**
 * Uniform feed wrapper: squircles the card, scales oversized Paper designs
 * down to fit the column (never up), and pads the mat so inset drop-shadows
 * survive the clip. Truncation lives on the card text nodes themselves.
 */

const FRAME_PADDING = 16 // must match the p-4 mat below

/** Full-size design widths in px for each platform's Paper card. */
export const CARD_NATURAL_WIDTHS = {
  facebook: 713.42,
  x: 484,
  reddit: 864
} as const

/**
 * The verdict strip under a card: a solid brand-blue badge with the best
 * match's score plus the AI's read of the author's intent (click it to open
 * the post in the inspect sheet), then a full-width two-button row
 * (Reply with AI / Auto-Reply). Rendered at 1x in the mat, never scaled
 * with the Paper design, so it stays legible in every column.
 */
export function ScoreChip({
  score,
  intent,
  reason
}: {
  score: number
  intent: string | null
  reason?: string | null
}) {
  return (
    <div className="lk-score-chip flex w-full flex-col gap-2">
      <Badge variant="solid" title={reason ?? undefined}>
        <span className="font-bold tabular-nums">{score}</span>
        <span aria-hidden="true" className="opacity-70">·</span>
        <span>{intentLabel(intent)}</span>
      </Badge>
      <div className="grid w-full grid-cols-2 gap-2">
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="flex w-full items-center justify-center gap-1.5 rounded-sm bg-[#2A8CFF] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1f6fe6]"
        >
          <Bot size={13} aria-hidden="true" />
          Reply with AI
        </button>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="flex w-full items-center justify-center gap-1.5 rounded-sm bg-[#2A8CFF] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1f6fe6]"
        >
          <Zap size={13} aria-hidden="true" />
          Auto-Reply
        </button>
      </div>
    </div>
  )
}

export function FeedCardFrame({
  naturalWidth,
  radius = 24,
  score,
  intent,
  reason,
  onInspect,
  children
}: {
  /** Full-size design width in px (Reddit 864, Facebook 713.42, X 484). */
  naturalWidth: number
  radius?: number
  /** Best match on this post; the chip hides when there is no score yet. */
  score?: number | null
  intent?: string | null
  reason?: string | null
  /** Opens the post in the dashboard inspect sheet. */
  onInspect?: () => void
  children: ReactNode
}) {
  const clip = useSquircleClip<HTMLDivElement>(radius)
  const outerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)
  const chipRef = useRef<HTMLDivElement | null>(null)
  const setOuterRef = useComposedRef(outerRef, clip.ref)
  const [scale, setScale] = useState(1)
  const [scaledWidth, setScaledWidth] = useState(naturalWidth)
  const [scaledInnerHeight, setScaledInnerHeight] = useState<number | undefined>(undefined)
  const [height, setHeight] = useState<number | undefined>(undefined)
  const hasChip = score !== undefined && score !== null

  useLayoutEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return
    const update = () => {
      const available = outer.clientWidth - FRAME_PADDING * 2
      const next = outer.clientWidth > 0 ? Math.min(1, available / naturalWidth) : 1
      setScale((prev) => (Math.abs(prev - next) < 0.001 ? prev : next))
      const scaledWidth = Math.round(naturalWidth * next)
      setScaledWidth((prev) => (prev === scaledWidth ? prev : scaledWidth))

      // transform:scale() never shrinks the box `inner` occupies in normal
      // flow, it only affects paint - so without an explicit height here,
      // the chip below it still gets laid out as if inner were full size.
      // Giving inner's wrapper this height (+ overflow hidden) is what
      // actually reclaims the space, so the chip lands right under the
      // visible card instead of past the outer clip line.
      const scaledInnerHeight = Math.round(inner.offsetHeight * next)
      setScaledInnerHeight((prev) => (prev === scaledInnerHeight ? prev : scaledInnerHeight))

      // The chip (when present) sits unscaled in the mat, so it must count
      // toward the measured height or the clip cuts it off.
      const chip = chipRef.current
      const chipHeight = chip ? chip.offsetHeight + 8 : 0
      const nextHeight = Math.max(0, Math.round(scaledInnerHeight + chipHeight + FRAME_PADDING * 2))
      setHeight((prev) => (prev === nextHeight ? prev : nextHeight))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(outer)
    observer.observe(inner)
    if (chipRef.current) observer.observe(chipRef.current)
    return () => observer.disconnect()
  }, [naturalWidth, hasChip])

  return (
    <div
      ref={setOuterRef}
      onClick={onInspect}
      style={{ ...clip.style, height }}
      className={onInspect ? 'w-full shrink-0 cursor-pointer overflow-hidden bg-white' : 'w-full shrink-0 overflow-hidden bg-white'}
    >
      <div className="p-4">
        <div style={{ height: scaledInnerHeight, overflow: 'hidden' }}>
          <div
            ref={innerRef}
            style={{ width: naturalWidth, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            {children}
          </div>
        </div>
        {hasChip ? (
          <div
            ref={chipRef}
            style={{ width: scaledWidth, marginLeft: 'auto', marginRight: 'auto', marginTop: 8 }}
          >
            <ScoreChip score={score as number} intent={intent ?? null} reason={reason ?? null} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
