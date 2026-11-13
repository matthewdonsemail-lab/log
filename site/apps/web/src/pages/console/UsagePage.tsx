import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Spinner } from '@listeningkit/ui'
import { localConsole } from '@/lib/consoleMode'
import { useErrorToast } from '@/lib/useErrorToast'
import { UsageForecast } from './UsageForecast'
import { UsageLogs } from './UsageLogs'
import { ConsoleLayout, WorkspaceChip } from './ConsoleLayout'
import { loadUsageSummary } from './usageData'
import { targetKey } from './consoleClient'
import { useConsoleTarget } from './useConsoleTarget'

export function UsagePage() {
  const { target, workspaceState } = useConsoleTarget()
  const query = useQuery({ queryKey: ['consoleUsage', targetKey(target), 30], queryFn: ({ signal }) => loadUsageSummary(target!, 30, signal), enabled: Boolean(target), retry: false, refetchOnWindowFocus: false })
  useErrorToast(query.isError, query.error, 'Workspace usage is unavailable')
  return <ConsoleLayout title="Usage" subtitle="Call volume, response times and failures by event type.">
    {!localConsole ? <div className="mb-4 flex flex-wrap items-center gap-3">
      <WorkspaceChip state={workspaceState} />
      {workspaceState === 'notConnected' || workspaceState === 'awaitingConnection' ? <Link to="/console/settings" className="text-sm font-semibold text-[#1B6FD6]">Set up your workspace →</Link> : null}
    </div> : null}
    {!target ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">Usage shows while your workspace is connected. It stays in your workspace.</div>
      : query.isError ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><button type="button" onClick={() => query.refetch()} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Try again</button></div>
      : query.data ? <div className="mt-5 grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <UsageForecast summary={query.data} />
        <UsageLogs requests={query.data.recentCalls} asOf={query.data.generatedAt} />
      </div>
      : <Spinner className="min-h-0 py-10" label="Reading workspace usage" />}
  </ConsoleLayout>
}
