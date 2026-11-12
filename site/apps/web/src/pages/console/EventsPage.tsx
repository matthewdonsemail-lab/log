import { useQuery } from '@tanstack/react-query'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import { ConsoleLayout } from './ConsoleLayout'
import { useErrorToast } from '@/lib/useErrorToast'
import { loadConsoleEvents, eventDuration, eventTime, type ConsoleEvent } from './eventsData'

function EventStatus({ status }: { status: ConsoleEvent['status'] }) {
  return <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-sm font-medium ${status === 'failed' ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}><span className={`size-1.5 rounded-full ${status === 'failed' ? 'bg-red-500' : 'bg-[#2A8CFF]'}`} />{status === 'failed' ? 'Failed' : status === 'succeeded' ? 'OK' : status === 'recorded' ? 'Recorded' : 'Unknown'}</span>
}

function EventDetails({ event, onClose }: { event: ConsoleEvent; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => { ref.current?.showModal() }, [])
  const fields = [
    ['Time (UTC)', eventTime(event.time)],
    ['Event type', event.kind],
    ['Duration', eventDuration(event.durationMs)],
    ...(event.model ? [['Model', event.model]] : []),
    ...(event.usage?.type === 'tokens' ? [['Input tokens', event.usage.input.toLocaleString()], ['Output tokens', event.usage.output.toLocaleString()]] : []),
    ...(event.usage?.type === 'balance' ? [['Balance', `$${event.usage.amount.toFixed(4)}`]] : []),
  ]
  return <dialog ref={ref} aria-labelledby={titleId} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose() }} className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-6 font-sans text-slate-900 shadow-xl backdrop:bg-slate-950/30">
    <div className="mb-6 flex items-center justify-between gap-3"><h2 id={titleId} className="text-lg font-semibold">Call details</h2><button type="button" onClick={onClose} aria-label="Close call details" className="rounded-lg px-3 py-1 text-xl text-slate-600 hover:bg-slate-100">×</button></div>
    <EventStatus status={event.status} />
    <dl className="mt-5 divide-y divide-slate-100">{fields.map(([label, value]) => <div key={label} className="flex justify-between gap-5 py-3 text-sm"><dt className="text-slate-600">{label}</dt><dd className="text-right font-medium tabular-nums">{value}</dd></div>)}</dl>
  </dialog>
}

export function EventsPage() {
  const query = useQuery({ queryKey: ['consoleEvents'], queryFn: ({ signal }) => loadConsoleEvents(signal), retry: false, refetchOnWindowFocus: false })
  useErrorToast(query.isError, query.error, 'Could not load workspace events.')
  const [tab, setTab] = useState<'firehose' | 'inference'>('firehose')
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<ConsoleEvent | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({ open: filterOpen, onOpenChange: setFilterOpen, placement: 'bottom-start', strategy: 'fixed', middleware: [offset(8), flip(), shift({ padding: 12 })], whileElementsMounted: autoUpdate })
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context, { role: 'dialog' })])
  const filtered = useMemo(() => (query.data?.events ?? []).filter((event) => (tab === 'firehose' || event.type === 'inference') && (status === 'all' || event.status === status) && `${event.kind} ${event.model ?? ''}`.toLowerCase().includes(search.trim().toLowerCase())), [query.data, tab, status, search])
  const pageSize = 12
  const rows = filtered.slice(page * pageSize, (page + 1) * pageSize)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))

  return <ConsoleLayout title="Events" subtitle="Your calls, outcomes and usage in one place.">
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div role="group" aria-label="Event category" className="inline-flex rounded-lg border border-slate-200 bg-white p-1">{(['firehose', 'inference'] as const).map((value) => <button key={value} type="button" aria-pressed={tab === value} onClick={() => { setTab(value); setPage(0) }} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${tab === value ? 'bg-[#2A8CFF] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{value === 'inference' ? 'Inference' : 'Firehose'}</button>)}</div>
      <button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">{query.isFetching ? 'Refreshing…' : 'Refresh'}</button>
      <button ref={refs.setReference} type="button" {...getReferenceProps()} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 4h18l-7 8v7l-4 2v-9z" /></svg>Filter{status !== 'all' || search ? <span className="size-1.5 rounded-full bg-[#2A8CFF]" /> : null}</button>
      {filterOpen ? <FloatingPortal><FloatingFocusManager context={context} modal={false}><div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 10000 }} {...getFloatingProps()} aria-label="Filter events" className="w-72 space-y-4 rounded-xl border border-slate-200 bg-white p-4 font-sans text-sm shadow-xl">
        <label className="block font-semibold text-slate-700">Search<input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0) }} placeholder="Event type or model" className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal outline-none focus:border-blue-500" /></label>
        <fieldset><legend className="mb-2 font-semibold text-slate-700">Status</legend><div className="flex flex-wrap gap-2">{['all', 'recorded', 'succeeded', 'failed', 'unknown'].map((value) => <button type="button" key={value} aria-pressed={status === value} onClick={() => { setStatus(value); setPage(0) }} className={`rounded-md border px-2 py-1.5 ${status === value ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>{value === 'all' ? 'All' : value === 'failed' ? 'Failed' : value === 'recorded' ? 'Recorded' : value === 'unknown' ? 'Unknown' : 'Succeeded'}</button>)}</div></fieldset>
        <button type="button" onClick={() => { setStatus('all'); setSearch(''); setPage(0) }} className="font-semibold text-[#2A8CFF]">Clear filters</button>
      </div></FloatingFocusManager></FloatingPortal> : null}
    </div>
    {query.isError ? <div className="mb-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600"><button type="button" onClick={() => query.refetch()} className="font-semibold underline">Try again</button></div> : null}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white" aria-busy={query.isLoading}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <caption className="sr-only">{tab === 'inference' ? 'Inference' : 'Firehose'} events, newest first</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600"><tr>{['Time (UTC)', 'Status', tab === 'inference' ? 'Model' : 'Event type', 'Workspace', 'Duration', 'Usage'].map((label, index) => <th key={label} scope="col" className={`px-4 py-3 font-medium ${index > 3 ? 'text-right' : ''}`}>{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{rows.map((event) => <tr key={event.id} className="transition-colors hover:bg-blue-50/40">
            <td className="whitespace-nowrap px-4 py-3 text-slate-600"><time dateTime={new Date(event.time).toISOString()}>{eventTime(event.time)}</time></td>
            <td className="px-4 py-3"><EventStatus status={event.status} /></td>
            <td className="px-4 py-3"><button type="button" onClick={() => setSelected(event)} aria-label={`Inspect ${event.kind} at ${eventTime(event.time)}`} className="flex items-center gap-3 rounded text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-400"><span><span className="block font-semibold text-slate-900">{tab === 'inference' ? event.model : event.kind}</span><span className="mt-0.5 block text-slate-500">{event.type === 'inference' ? event.model : 'Event journal'}</span></span></button></td>
            <td className="px-4 py-3 text-slate-600">Workspace</td>
            <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">{eventDuration(event.durationMs)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">{event.usage?.type === 'tokens' ? `${(event.usage.input + event.usage.output).toLocaleString()} tokens` : event.usage?.type === 'balance' ? `$${event.usage.amount.toFixed(4)} balance` : '—'}</td>
          </tr>)}</tbody>
        </table>
        {!rows.length ? <p role="status" className="p-10 text-center text-sm text-slate-600">{query.isLoading ? 'Loading workspace events…' : query.isError ? 'No events to show.' : 'No events match your filters.'}</p> : null}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600"><span aria-live="polite">{filtered.length ? page * pageSize + 1 : 0}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}</span><div className="flex items-center gap-3"><button type="button" disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-md border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40">Previous</button><button type="button" disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)} className="rounded-md border border-slate-200 px-3 py-1.5 font-medium disabled:opacity-40">Next</button></div></div>
    </div>
    {selected ? <EventDetails key={selected.id} event={selected} onClose={() => setSelected(null)} /> : null}
  </ConsoleLayout>
}



