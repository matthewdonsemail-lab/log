import { ConsoleLayout } from './ConsoleLayout'

export function ConsolePlaceholderPage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <ConsoleLayout title={title} subtitle={subtitle}>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="text-sm font-semibold text-slate-700">{title} is next</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          The frame, navigation, team and workspace status are live. This section’s own screen is being built.
        </p>
      </div>
    </ConsoleLayout>
  )
}
