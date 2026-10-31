import { DashboardFormSheet } from './DashboardFormSheet'
import type { HowItWorks } from '@/lib/how-it-works'

/**
 * The "How Does {Route} Work?" panel, rendered through the shared form
 * sheet so it docks exactly like every other dashboard form. It shows the
 * route's video up top with its brief description underneath — nothing
 * more.
 */
export function DashboardHowItWorks({
  entry,
  onClose
}: {
  entry: HowItWorks
  onClose: () => void
}) {
  return (
    <DashboardFormSheet
      open
      title={`How does ${entry.route} work?`}
      subtitle={`Watch the short video below — it explains how ${entry.route} works and how you get the most out of it.`}
      onClose={onClose}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <video
          src={entry.videoSrc}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          aria-label={`Video showing the ${entry.route} page in action`}
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur">
          {entry.route} in action
        </span>
      </div>
      <p className="text-sm leading-relaxed text-text-secondary">{entry.overview}</p>
    </DashboardFormSheet>
  )
}
