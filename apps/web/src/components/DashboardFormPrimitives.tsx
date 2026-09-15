import {
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactNode
} from 'react'
import { Check } from 'lucide-react'
import {
  cn,
  SquircleBorder,
  useComposedRef,
  useSquircleBorder,
  useSquircleClip,
} from '@listeningkit/ui'
import type { ConnectionPlatform } from '../lib/connections'
import { SOCIAL_ICONS, SocialGlyph, type SocialIcon } from '../lib/social-icons'

/**
 * Shared primitives for the dashboard form sheets (listings / keywords /
 * groups): one platform tile grid, one select-row shape, one loading line.
 * Every form renders the same pieces so the flows feel consistent.
 *
 * All squircle surfaces follow the codebase rule: the shape comes from
 * `useSquircleClip` (clipPath) and the stroke from `useSquircleBorder`
 * (figma squircle path), exactly like `SocialBadge` and the messages
 * composer. No element carries `rounded-*` or `border-*` classes when the
 * squircle primitives own its shape and border.
 */

const NEUTRAL_STROKE = '#E4E7EC'
const ACTIVE_STROKE = '#2A8CFF'

/** Shared squircle stroke colors so form surfaces stay consistent. */
export const SQUIRCLE_NEUTRAL_STROKE = NEUTRAL_STROKE
export const SQUIRCLE_ACTIVE_STROKE = ACTIVE_STROKE

/** Stroke overlay for a squircle surface: the border path, never a CSS border. */
export { SquircleBorder, SquircleStroke } from '@listeningkit/ui'

export function PlatformPick({
  value,
  onChange
}: {
  value: ConnectionPlatform | null
  onChange: (platform: ConnectionPlatform) => void
}) {
  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Platform">
      {SOCIAL_ICONS.map((icon) => (
        <PlatformTile
          key={icon.id}
          icon={icon}
          active={value === icon.id}
          onClick={() => onChange(icon.id as ConnectionPlatform)}
        />
      ))}
    </div>
  )
}

/**
 * One platform tile, styled like the onboarding platform cards: a
 * full-width tappable card with a bare logo, the platform name, and a
 * tap-to-select hint — vertically stacked so the choice reads clearly in
 * the narrow sheet. Selecting only marks the card; the sheet's Continue
 * button advances. The picked card flips blue (card and glyph) so the
 * choice reads as made. Shape and stroke come from the squircle primitives.
 */
function PlatformTile({
  icon,
  active,
  onClick
}: {
  icon: SocialIcon
  active: boolean
  onClick: () => void
}) {
  const clip = useSquircleClip<HTMLButtonElement>(16)
  const border = useSquircleBorder<HTMLButtonElement>(17)
  const setRef = useComposedRef(clip.ref, border.ref)
  return (
    <button
      ref={setRef}
      style={clip.style}
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-4 p-4 text-left',
        active ? 'bg-[#2A8CFF]' : 'bg-white hover:bg-black/[0.02]'
      )}
    >
      <SquircleBorder
        border={border.state}
        stroke={active ? '#FFFFFF' : NEUTRAL_STROKE}
        strokeWidth={active ? 2 : 1.5}
        transitionStroke={false}
      />
      <SocialGlyph
        icon={icon}
        className={cn('relative z-10 size-12 shrink-0', active ? 'text-white' : 'text-[#2A8CFF]')}
      />
      <span className="relative z-10 min-w-0 flex-1">
        <span className={cn('block truncate text-base font-bold', active ? 'text-white' : 'text-text-primary')}>
          {icon.label}
        </span>
        <span className={cn('mt-0.5 block truncate text-sm', active ? 'text-white/75' : 'text-text-secondary')}>
          {active ? 'Selected — press Continue' : 'Tap to select'}
        </span>
      </span>
    </button>
  )
}

export function PickRow({
  active,
  onClick,
  label,
  sub,
  icon,
  tone = 'tint'
}: {
  active: boolean
  onClick: () => void
  label: string
  sub?: string
  icon: ReactNode
  /**
   * Active styling: `tint` (default) washes the row light blue and adds a
   * check badge; `solid` flips the whole card blue with white text like the
   * step-1 platform tiles (no check badge — pass a colorless glyph so it
   * follows the row: blue idle, white picked).
   */
  tone?: 'tint' | 'solid'
}) {
  const clip = useSquircleClip<HTMLButtonElement>(14)
  const border = useSquircleBorder<HTMLButtonElement>(15)
  const setRef = useComposedRef(clip.ref, border.ref)
  const solid = tone === 'solid'
  return (
    <button
      ref={setRef}
      style={clip.style}
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 px-3 py-3 text-left',
        active ? (solid ? 'bg-[#2A8CFF]' : 'bg-[#F4F9FF]') : 'bg-white hover:bg-black/[0.02]'
      )}
    >
      <SquircleBorder
        border={border.state}
        stroke={active ? (solid ? '#FFFFFF' : ACTIVE_STROKE) : NEUTRAL_STROKE}
        strokeWidth={active ? 2 : 1.5}
        transitionStroke={false}
      />
      <span
        className={cn(
          'relative z-10 shrink-0',
          solid && (active ? 'text-white' : 'text-[#2A8CFF]')
        )}
      >
        {icon}
      </span>
      <span className="relative z-10 min-w-0 flex-1">
        <span
          className={cn(
            'block truncate font-semibold',
            active ? (solid ? 'text-white' : 'text-text-primary') : 'text-text-primary'
          )}
        >
          {label}
        </span>
        {sub ? (
          <span
            className={cn(
              'block truncate text-xs',
              active && solid ? 'text-white/75' : 'text-text-secondary'
            )}
          >
            {sub}
          </span>
        ) : null}
      </span>
      {solid ? null : (
        <span
          className={cn(
            'relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full border',
            active ? 'border-[#2A8CFF] bg-[#2A8CFF] text-white' : 'border-black/20 text-transparent'
          )}
        >
          <Check size={12} strokeWidth={3} aria-hidden="true" />
        </span>
      )}
    </button>
  )
}

/**
 * Form input whose border is the squircle path: the element is clipped to a
 * squircle and the stroke is an SVG sibling overlay (inputs can't contain
 * children), so focus is a stroke-color change — never a CSS border/ring.
 * Pass `shape="rounded-md"` for a plain small-radius CSS border instead.
 */
export function FormInput({
  className,
  onFocus,
  onBlur,
  radius = 14,
  shape = 'squircle',
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'ref'> & {
  /** Squircle radius — defaults to 14; pass 8 to match button rounding. */
  radius?: number
  /** Shape treatment: squircle clip (default) or a plain `rounded-md` border. */
  shape?: 'squircle' | 'rounded-md'
}) {
  const clip = useSquircleClip<HTMLInputElement>(radius)
  const border = useSquircleBorder<HTMLInputElement>(radius + 1)
  const setRef = useComposedRef(clip.ref, border.ref)
  const [focused, setFocused] = useState(false)
  if (shape === 'rounded-md') {
    return (
      <input
        {...props}
        onFocus={(event: FocusEvent<HTMLInputElement>) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          setFocused(false)
          onBlur?.(event)
        }}
        className={cn(
          'h-12 w-full rounded-md border bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none',
          focused ? 'border-[#2A8CFF]' : 'border-[#E4E7EC]',
          className
        )}
      />
    )
  }
  return (
    <span className="relative block w-full">
      <input
        ref={setRef}
        style={clip.style}
        {...props}
        onFocus={(event: FocusEvent<HTMLInputElement>) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event: FocusEvent<HTMLInputElement>) => {
          setFocused(false)
          onBlur?.(event)
        }}
        className={cn(
          'h-12 w-full bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none',
          className
        )}
      />
      <SquircleBorder
        border={border.state}
        stroke={focused ? ACTIVE_STROKE : NEUTRAL_STROKE}
        strokeWidth={focused ? 2 : 1.5}
      />
    </span>
  )
}

export function LoadingLine({ label }: { label: string }) {  const clip = useSquircleClip<HTMLParagraphElement>(14)
  return (
    <p ref={clip.ref} style={clip.style} className="bg-black/5 p-4 text-sm text-text-secondary" aria-busy="true">
      {label}
    </p>
  )
}

export function EmptyLine({ label }: { label: string }) {
  const clip = useSquircleClip<HTMLParagraphElement>(14)
  const border = useSquircleBorder<HTMLParagraphElement>(15)
  const setRef = useComposedRef(clip.ref, border.ref)
  return (
    <p ref={setRef} style={clip.style} className="relative bg-white p-5 text-sm text-text-secondary">
      <SquircleBorder border={border.state} stroke={NEUTRAL_STROKE} />
      <span className="relative z-10">{label}</span>
    </p>
  )
}

/**
 * Chat bubble with the Messages shape: squircle r10 with a tightened tail
 * corner on the sending side — outgoing (blue, tail bottom-right) for the
 * agent's own voice (gold examples, simulated replies), incoming (grey,
 * tail bottom-left) for the buyer's side of the simulator.
 */
export function ChatBubble({ tone, children }: { tone: 'incoming' | 'outgoing'; children: ReactNode }) {
  const clip = useSquircleClip<HTMLDivElement>(
    10,
    1,
    tone === 'outgoing' ? { bottomRight: 2 } : { bottomLeft: 2 }
  )
  return (
    <div
      ref={clip.ref}
      style={clip.style}
      className={`max-w-[480px] px-4 py-2.5 text-sm leading-relaxed ${
        tone === 'outgoing' ? 'bg-[#2A8CFF] text-white' : 'bg-[#F1F5F9] text-text-primary'
      }`}
    >
      {children}
    </div>
  )
}