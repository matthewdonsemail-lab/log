import { Link } from 'react-router-dom'
import { useId, useState } from 'react'

const entries = [
  { kind: 'Decision model', status: 'OK', time: '1h ago' },
  { kind: 'Platform read', status: 'OK', time: '1h ago' },
  { kind: 'Platform action', status: 'Failed', time: '1h ago' },
  { kind: 'Decision model', status: 'OK', time: '1h ago' },
]

const requests = Array.from({ length: 40 }, (_, index) => ({
  kind: entries[index % entries.length].kind,
  failed: index === 22,
  time: `04:${String(8 + index).padStart(2, '0')}:28`,
  duration: (0.8 + (index * 17 % 75) / 10).toFixed(2),
  firstToken: (0.3 + (index * 7 % 20) / 10).toFixed(1),
  inputTokens: 111 + index * 13,
  outputTokens: 419 + index * 19,
  cost: (0.0017 + index * 0.0001).toFixed(4),
}))

export function UsageLogs({ example }: { example: boolean }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const tooltipId = useId()
  const active = activeIndex === null ? null : requests[activeIndex]
  return <section className="min-w-0 rounded-xl bg-white p-5 sm:p-6" aria-label="Recent call logs">
    <div className="flex items-center justify-between gap-4">
      <div><h2 className="text-lg font-semibold text-[#0D2A4C]">Logs</h2><p className="mt-1 text-sm text-slate-600">{example ? 'Last 40 requests' : 'Recent requests'}</p></div>
      <Link to="/console/events" aria-label="View all logs" className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-xl text-slate-600 transition-colors hover:bg-slate-50">›</Link>
    </div>
    {example ? <>
      <div className="relative my-7" onMouseLeave={() => setActiveIndex(null)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActiveIndex(null) }} onKeyDown={(event) => { if (event.key === 'Escape') setActiveIndex(null) }}>
        {active ? <div id={tooltipId} role="tooltip" className="pointer-events-none absolute bottom-full z-40 mb-3 w-[min(280px,100%)] rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl" style={{ left: `clamp(0px, calc(${((activeIndex ?? 0) + 0.5) / 40 * 100}% - 140px), max(0px, 100% - 280px))` }}>
          <p className="mb-3 text-sm font-semibold text-slate-600">{active.time} · 1h ago</p>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><span className={`rounded border px-2 py-0.5 text-sm ${active.failed ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-100 text-slate-700'}`}>{active.failed ? 'Failed' : 'OK'}</span><span>{active.kind}</span></div>
          <dl className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between gap-3"><dt>Duration</dt><dd className="font-medium tabular-nums text-slate-900">{active.duration} s</dd></div>
            {active.kind === 'Decision model' ? <>
              <div className="flex justify-between gap-3"><dt>First token</dt><dd className="font-medium tabular-nums text-slate-900">{active.firstToken} s</dd></div>
              <div className="flex justify-between gap-3"><dt>Tokens</dt><dd className="font-medium tabular-nums text-slate-900">{active.inputTokens} in · {active.outputTokens} out</dd></div>
              <div className="flex justify-between gap-3"><dt>Cost</dt><dd className="font-medium tabular-nums text-slate-900">${active.cost}</dd></div>
            </> : null}
          </dl>
          <p className="mt-3 text-sm text-slate-600">Example request</p>
        </div> : null}
        <div className="grid h-10 gap-1" style={{ gridTemplateColumns: 'repeat(40, minmax(0, 1fr))' }} role="group" aria-label="Example activity for the last 40 requests">
          {requests.map((request, index) => <button type="button" key={index} aria-label={`${request.kind}, ${request.failed ? 'failed' : 'succeeded'}, ${request.duration} seconds`} aria-describedby={activeIndex === index ? tooltipId : undefined} onMouseEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onClick={() => setActiveIndex(index)} className="flex h-10 min-w-0 flex-col justify-end gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
            <span className={`block w-full rounded-[1px] transition-colors ${activeIndex === index ? 'bg-[#2A8CFF]' : 'bg-slate-400'}`} style={{ height: 8 + (index * 7 % 10) }} />
            <span className={`block w-full rounded-[1px] transition-colors ${request.failed ? 'bg-red-500' : activeIndex === index ? 'bg-[#2A8CFF]' : 'bg-slate-500'}`} style={{ height: 13 + (index * 3 % 9) }} />
          </button>)}
        </div>
      </div>
      <ul className="space-y-4">{entries.map((entry, index) => <li key={index} className="flex min-w-0 items-center gap-2 text-sm">
        <span className={`min-w-12 rounded px-2 py-0.5 text-center text-sm font-semibold ${entry.status === 'Failed' ? 'border border-red-300 bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{entry.status}</span>
        <span className="min-w-0 flex-1 font-semibold text-slate-900">{entry.kind}</span>
        <span className="ml-auto shrink-0 text-sm text-slate-600">{entry.time}</span>
      </li>)}</ul>
    </> : <p className="mt-7 text-sm text-slate-600">Recent call logs are not available from this workspace connection.</p>}
  </section>
}




