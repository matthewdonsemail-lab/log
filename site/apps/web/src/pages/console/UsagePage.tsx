import { useQuery } from '@tanstack/react-query'
import { UsageForecast } from './UsageForecast'
import { UsageLogs } from './UsageLogs'
import { ConsoleLayout } from './ConsoleLayout'
import { loadUsageSummary } from './usageData'

export function UsagePage() {
  const query = useQuery({ queryKey: ['consoleUsage', 30], queryFn: ({ signal }) => loadUsageSummary(30, signal), retry: false, refetchOnWindowFocus: false })
  return <ConsoleLayout title="Usage" subtitle="Call volume, response times and failures by event type.">
    {query.isError ? <div role="status" className="mb-5 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Workspace usage is unavailable. <button type="button" onClick={() => query.refetch()} className="font-semibold text-[#2A8CFF]">Try again</button></div> : null}
    {query.data ? <div className="mt-5 grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <UsageForecast summary={query.data} />
      <UsageLogs requests={query.data.recentCalls} asOf={query.data.generatedAt} />
    </div> : !query.isError ? <div role="status" className="rounded-xl bg-white p-8 text-sm text-slate-600">Loading workspace usage…</div> : null}
  </ConsoleLayout>
}
