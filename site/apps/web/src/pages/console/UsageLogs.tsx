import { Link } from 'react-router-dom'
import { useId, useMemo, useState } from 'react'
import { usageKindLabels, type UsageCall } from './usageData'

function elapsed(time: number, asOf: string) {
  const seconds = Math.max(0, (Date.parse(asOf) - time) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const duration = (ms: number) => ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`

export function UsageLogs({ requests, asOf }: { requests: UsageCall[]; asOf: string }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const tooltipId = useId()
  const chronological = useMemo(() => [...requests].reverse(), [requests])
  const activeIndex = chronological.findIndex((request) => request.id === activeId)
  const active = activeIndex < 0 ? null : chronological[activeIndex]
  const maximum = Math.max(1, ...requests.map((request) => request.durationMs))
  return <section className="min-w-0 rounded-xl bg-white p-5 sm:p-6" aria-label="Recent call logs">
    <div className="flex items-center justify-between gap-4">
      <div><h2 className="text-lg font-semibold text-[#0D2A4C]">Logs</h2><p className="mt-1 text-sm text-slate-600">Last {requests.length} {requests.length === 1 ? 'request' : 'requests'}</p></div>
      <Link to="/console/events" aria-label="View all logs" className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl text-slate-600 transition-colors hover:bg-slate-50">›</Link>
    </div>
    {requests.length ? <>
      <div className="relative my-7" onMouseLeave={() => setActiveId(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActiveId(null) }} onKeyDown={(event) => { if (event.key === 'Escape') setActiveId(null) }}>
        {active ? <div id={tooltipId} role="tooltip" className="pointer-events-none absolute bottom-full z-40 mb-3 w-[min(280px,100%)] rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl" style={{ left: `clamp(0px, calc(${(activeIndex + 0.5) / chronological.length * 100}% - 140px), max(0px, 100% - 280px))` }}>
          <p className="mb-3 text-sm font-semibold text-slate-600">{new Date(active.time).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' })} UTC</p>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><span className={`rounded border px-2 py-0.5 text-sm ${active.status === 'failed' ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>{active.status === 'failed' ? 'Failed' : 'OK'}</span><span>{usageKindLabels[active.kind]}</span></div>
          <dl className="space-y-2 text-sm text-slate-600"><div className="flex justify-between gap-3"><dt>Duration</dt><dd className="font-medium tabular-nums text-slate-900">{duration(active.durationMs)}</dd></div><div className="flex justify-between gap-3"><dt>When</dt><dd className="font-medium text-slate-900">{elapsed(active.time, asOf)}</dd></div></dl>
        </div> : null}
        <div className="grid h-10 gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(1, chronological.length)}, minmax(0, 1fr))` }} role="group" aria-label="Recent request durations, oldest to newest">
          {chronological.map((request) => <button type="button" key={request.id} aria-label={`${usageKindLabels[request.kind]}, ${request.status}, ${duration(request.durationMs)}`} aria-describedby={activeId === request.id ? tooltipId : undefined} onMouseEnter={() => setActiveId(request.id)} onFocus={() => setActiveId(request.id)} onClick={() => setActiveId(request.id)} className="flex h-10 min-w-0 items-end rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"><span className={`block w-full rounded-[1px] transition-colors ${request.status === 'failed' ? 'bg-red-500' : activeId === request.id ? 'bg-[#2A8CFF]' : 'bg-slate-500'}`} style={{ height: Math.max(6, request.durationMs / maximum * 40) }} /></button>)}
        </div>
      </div>
      <ul className="space-y-4">{requests.slice(0, 4).map((entry) => <li key={entry.id} className="flex min-w-0 items-center gap-2 text-sm">
        <span className={`min-w-12 rounded px-2 py-0.5 text-center text-sm font-semibold ${entry.status === 'failed' ? 'border border-red-300 bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{entry.status === 'failed' ? 'Failed' : 'OK'}</span>
        <span className="min-w-0 flex-1 font-semibold text-slate-900">{usageKindLabels[entry.kind]}</span>
        <span className="ml-auto shrink-0 text-sm text-slate-600">{elapsed(entry.time, asOf)}</span>
      </li>)}</ul>
    </> : <p className="mt-7 text-sm text-slate-600">No requests recorded in the last 30 days.</p>}
  </section>
}
