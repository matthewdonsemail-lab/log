import { useMemo, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { Check, Globe, Waves, X } from 'lucide-react'
import { Badge, useSquircleClip } from '@listeningkit/ui'
import type { ApiActivityEvent } from '../lib/api'
import { DashboardTab, type DashboardTabAccent } from './DashboardTab'

const FILTER_META: Record<
  'all' | 'allowed' | 'denied',
  { label: string; icon: ReactNode; accent: DashboardTabAccent }
> = {
  all: { label: 'All', icon: <Globe className="size-4" aria-hidden="true" />, accent: 'blue' },
  allowed: { label: 'Allowed', icon: <Check className="size-4" aria-hidden="true" />, accent: 'emerald' },
  denied: { label: 'Denied', icon: <X className="size-4" aria-hidden="true" />, accent: 'red' },
}

const RENDER_CAP = 50

const METHOD_BADGE: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
  GET: 'info',
  POST: 'success',
  PATCH: 'warning',
  DELETE: 'danger',
}

function formatTs(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

/**
 * Scope-activity firehose for one API key: every sampled route call the key
 * made, newest first — allowed rows show what it actually does, denied rows
 * say exactly which scope dimension stopped it. The observability half of
 * the key table row. Caps the list the same way the analytics console does.
 * Clicking a row opens that call in the activity inspect sheet.
 */
export function DashboardApiKeyConsole({
  keyName,
  activity,
  onSelect,
}: {
  keyName: string
  activity: ApiActivityEvent[]
  /** Row click override — the key page passes its inspect-sheet opener. */
  onSelect?: (event: ApiActivityEvent) => void
}) {
  const clip = useSquircleClip<HTMLDivElement>(20)
  const [filter, setFilter] = useState<'all' | 'allowed' | 'denied'>('all')

  const scoped = useMemo(
    () =>
      filter === 'all'
        ? activity
        : activity.filter((event) => (filter === 'allowed' ? event.allowed : !event.allowed)),
    [activity, filter]
  )
  const visible = scoped.slice(0, RENDER_CAP)
  const filters: Array<'all' | 'allowed' | 'denied'> = ['all', 'allowed', 'denied']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <div ref={clip.ref} style={clip.style} className="bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#2A8CFF] text-white"
            >
              <Waves className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Scope activity</h2>
              <p className="text-sm text-text-secondary">
                What {keyName} calls — and what its scopes stop.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by outcome">
            {filters.map((option) => {
              const meta = FILTER_META[option]
              return (
                <DashboardTab
                  key={option}
                  active={filter === option}
                  onClick={() => setFilter(option)}
                  label={meta.label}
                  icon={meta.icon}
                  accent={meta.accent}
                />
              )
            })}
          </div>
        </div>

        <div className="lk-no-scrollbar mt-4 flex max-h-80 min-h-0 flex-col gap-2 overflow-y-auto">
          {visible.map((event) => (
            <button
              type="button"
              key={event.id}
              onClick={() => onSelect?.(event)}
              title={
                onSelect
                  ? `Open the details of this call — ${event.method} ${event.path}`
                  : `${event.method} ${event.path}`
              }
              className="rounded-xl bg-black/[0.02] px-3 py-2 text-left transition-colors hover:bg-black/[0.05]"
            >
              <div className="flex w-full items-center gap-2.5">
                <Badge variant={METHOD_BADGE[event.method] ?? 'muted'} className="w-[70px] shrink-0 justify-center">
                  {event.method}
                </Badge>
                <span
                  className="min-w-0 flex-1 truncate text-xs text-text-primary"
                  title={`${event.method} ${event.path}`}
                >
                  {event.path}
                </span>
                <Badge variant={event.allowed ? 'success' : 'danger'} className="shrink-0">
                  {event.allowed ? 'Allowed' : 'Denied'}
                </Badge>
                <span className="shrink-0 text-xs tabular-nums text-text-secondary">
                  {formatTs(event.ts)}
                </span>
              </div>
              {!event.allowed && event.reason ? (
                <p className="mt-0.5 truncate text-xs text-red-600" title={event.reason}>
                  {event.reason}
                </p>
              ) : null}
            </button>
          ))}
          {visible.length === 0 ? (
            <p className="py-4 text-sm text-text-secondary">
              Nothing with this outcome in the stream — try another filter.
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
