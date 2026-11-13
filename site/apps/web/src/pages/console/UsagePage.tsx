import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UsageForecast } from './UsageForecast'
import { UsageLogs } from './UsageLogs'
import { ConsoleLayout } from './ConsoleLayout'
import { exampleUsage, loadUsageSummary, usageKindLabels } from './usageData'
import { localConsole } from '@/lib/consoleMode'
import { useErrorToast } from '@/lib/useErrorToast'

const LOCAL_DAYS = [1, 7, 30] as const

function ms(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(2)} s` : `${Math.round(value)} ms`
}

function LocalUsage() {
  const [days, setDays] = useState<(typeof LOCAL_DAYS)[number]>(7)
  const query = useQuery({ queryKey: ['consoleUsage', days], queryFn: ({ signal }) => loadUsageSummary(days, signal), retry: false, refetchOnWindowFocus: false })
  useErrorToast(query.isError, query.error, 'Could not read usage on this machine.')
  const summary = query.data
  const rows = summary ? [...summary.kinds.map((kind) => ({ label: usageKindLabels[kind.kind], ...kind })), { label: 'Total', ...summary.totals }] : []
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div role="group" aria-label="Days" className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1">
        {LOCAL_DAYS.map((value) => <button key={value} type="button" aria-pressed={days === value} onClick={() => setDays(value)} className={`rounded-md px-3 py-1.5 text-sm font-semibold ${days === value ? 'bg-[#2A8CFF] text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{value === 1 ? 'Today' : `${value} days`}</button>)}
      </div>
      {query.isError ? <p className="text-sm text-slate-600"><button type="button" onClick={() => query.refetch()} className="font-semibold underline">Try again</button></p> : null}
      {summary && summary.totals.calls ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Calls by kind over the last {days} day(s)</caption>
            <thead className="border-b border-slate-200 text-slate-600"><tr>{['Kind', 'Calls', 'OK', 'Failed', 'p50', 'p95'].map((label, index) => <th key={label} scope="col" className={`px-3 py-2 font-medium ${index ? 'text-right' : ''}`}>{label}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.label} className={row.label === 'Total' ? 'font-semibold' : ''}>
              <td className="px-3 py-2">{row.label}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.calls.toLocaleString()}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.succeeded.toLocaleString()}</td>
              <td className="px-3 py-2 text-right tabular-nums">{row.failed.toLocaleString()}</td>
              <td className="px-3 py-2 text-right tabular-nums">{ms(row.p50Ms)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{ms(row.p95Ms)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      ) : <p className="p-6 text-center text-sm text-slate-500">{query.isLoading ? 'Reading usage…' : `No calls in the last ${days} day(s).`}</p>}
    </section>
  )
}

function HostedUsage() {
  const [days] = useState(7)
  const [source] = useState<'example' | 'workspace'>('example')
  const preview = useMemo(() => exampleUsage(days), [days])
  const query = useQuery({ queryKey: ['consoleUsage', days], queryFn: ({ signal }) => loadUsageSummary(days, signal), enabled: source === 'workspace', retry: false, refetchOnWindowFocus: false })
  const summary = source === 'example' ? preview : query.data
  return (
    <>
      {source === 'workspace' && query.isError ? (
        <div role="status" className="mb-5 rounded-xl border border-slate-200 bg-white p-5">
          <p className="font-semibold text-slate-900">Workspace usage is unavailable</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">Connect your workspace to load a usage summary. Example data is available while the connection is being set up.</p>
          <button type="button" onClick={() => query.refetch()} className="mt-3 rounded-lg bg-[#0D2A4C] px-3 py-2 text-sm font-semibold text-white">Try again</button>
        </div>
      ) : null}

      {summary ? <>
        <div className="mt-5 grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <UsageForecast example={source === 'example'} />
          <UsageLogs example={source === 'example'} />
        </div>
      </> : <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{query.isLoading ? 'Loading workspace usage…' : 'No usage summary is available.'}</div>}
    </>
  )
}

export function UsagePage() {
  return (
    <ConsoleLayout title="Usage" subtitle="Call volume, response times and failures by event type.">
      {localConsole ? <LocalUsage /> : <HostedUsage />}
    </ConsoleLayout>
  )
}
