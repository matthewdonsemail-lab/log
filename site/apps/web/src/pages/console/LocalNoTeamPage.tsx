import { LOCAL_NO_TEAM } from '@/lib/consoleMode'
import { ConsoleLayout } from './ConsoleLayout'

export function LocalNoTeamPage({ title }: { title: string }) {
  return (
    <ConsoleLayout title={title} subtitle="This console runs on this machine.">
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-slate-700">{LOCAL_NO_TEAM}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Everything here is read from this machine. To use a team, run <code className="rounded bg-slate-100 px-1">log login</code> in a terminal.
        </p>
      </div>
    </ConsoleLayout>
  )
}
