import { useState, type ReactNode } from 'react'
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions
} from '@floating-ui/react'
import type { AccountHealth } from '../lib/health'
import { SEVERITY_LIFECYCLE_LABEL } from './AccountStatus'

/**
 * Shared account hover tooltip: the serving account's badge wrapped in a
 * floating dark bubble (account name + per-surface context lines + health
 * line), with an optional frosted left visual (keyword surfaces pass their
 * mention sparkline; every other surface stays health-only).
 *
 * The tooltip portals to document.body (same pattern as the kit's
 * Dropdown/Select) because table rows carry a squircle `clip-path` — an
 * in-cell absolutely-positioned popup would be clipped to the row and
 * trapped in its stacking context. Placement stays `right` for the same
 * reason: nothing may overflow the row box top/bottom.
 *
 * Health-agnostic: `health` is the shared `lib/health` `AccountHealth`,
 * which both `healthForAccountId`/`healthForLabel` and
 * `accountIssueSnapshot().health` return.
 */
export function AccountTooltip({
  label,
  health,
  badge,
  labelIcon,
  visual,
  connectedLabel,
  children
}: {
  /** Account display name — the bold header line inside the bubble. */
  label: string
  /** Null when the scope carries no account (badge still renders, health line hidden). */
  health: AccountHealth | null
  /** The pill shown in the row — the hover target. */
  badge: ReactNode
  /** Optional leading glyph in the header line (e.g. the platform icon). */
  labelIcon?: ReactNode
  /** Optional frosted left chip (e.g. a mention sparkline). */
  visual?: ReactNode
  /** Healthy-state line; defaults to `Connected`. */
  connectedLabel?: string
  /** Per-surface context lines under the header (group link, members, …). */
  children?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'right',
    strategy: 'fixed',
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 })]
  })
  const hover = useHover(context, { delay: { open: 120, close: 100 }, move: false })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover])
  const flagged = health !== null && health.state !== 'healthy'
  return (
    <span ref={refs.setReference} {...getReferenceProps()} className="inline-flex">
      {badge}
      {open && (
        <FloatingPortal>
          <span
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            role="tooltip"
            className="z-50 flex w-max max-w-sm gap-2.5 whitespace-normal bg-text-primary p-4 text-xs leading-snug text-white shadow-lg [border-radius:14px]"
          >
            {visual ? (
              <span className="flex w-40 shrink-0 self-stretch items-center justify-center overflow-hidden bg-white/10 [border-radius:10px]">
                {visual}
              </span>
            ) : null}
            <span className="flex shrink-0 flex-col">
              <span className="flex items-center gap-1.5 whitespace-nowrap font-bold">
                {labelIcon}
                {label}
              </span>
              {children}
              {health ? (
                <span
                  className={`mt-0.5 flex items-center gap-1.5 whitespace-nowrap font-semibold ${flagged ? 'text-red-300' : 'text-emerald-300'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block size-1.5 shrink-0 rounded-full ${flagged ? 'bg-red-300' : 'bg-emerald-300'}`}
                  />
{health.state === 'unhealthy'
  ? `${SEVERITY_LIFECYCLE_LABEL.unhealthy} — flagged`
  : health.state === 'degraded'
    ? `${SEVERITY_LIFECYCLE_LABEL.degraded} — verify the connection`
    : (connectedLabel ?? SEVERITY_LIFECYCLE_LABEL.healthy)}
                </span>
              ) : null}
            </span>
          </span>
        </FloatingPortal>
      )}
    </span>
  )
}
