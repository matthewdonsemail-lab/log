import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { UsageForecast } from './UsageForecast'
import { UsageLogs } from './UsageLogs'
import { ConsoleLayout } from './ConsoleLayout'
import { exampleUsage, loadUsageSummary } from './usageData'


export function UsagePage() {
  const [days] = useState(7)
  const [source] = useState<'example' | 'workspace'>('example')
  const preview = useMemo(() => exampleUsage(days), [days])
  const query = useQuery({ queryKey: ['consoleUsage', days], queryFn: ({ signal }) => loadUsageSummary(days, signal), enabled: source === 'workspace', retry: false, refetchOnWindowFocus: false })
  const summary = source === 'example' ? preview : query.data
  return (
    <ConsoleLayout title="Usage" subtitle="Call volume, response times and failures by event type.">
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
    </ConsoleLayout>
  )
}









