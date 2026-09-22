import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BellIcon, BookOpenIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { Button, useSquircleClip } from '@listeningkit/ui'
import { SOCIAL_ICONS, SocialBadge } from '@/lib/social-icons'
import { howItWorksForPathname, routeLabelForPathname } from '@/lib/how-it-works'
import { useDashboardFormSlot } from './DashboardFormSlot'
import { DashboardHowItWorks } from './DashboardHowItWorks'

// Floating white top card with the squircle clip, no border. On mobile the
// brand lockup sits top-left; the wide actions condense (Docs goes
// icon-only, Connect moves into the hamburger menu) so the row fits 360px.
// Renders `children` after the actions — DashboardLayout docks the mobile
// bottom nav here (self-gated to <sm, fixed positioning, zero layout impact
// on desktop).
export function DashboardHeader({ children }: { children?: ReactNode }) {
  const clip = useSquircleClip<HTMLElement>(20)
  const { pathname } = useLocation()
  const setFormSlot = useDashboardFormSlot()
  const [howOpen, setHowOpen] = useState(false)

  const label = routeLabelForPathname(pathname)
  const entry = howItWorksForPathname(pathname)

  // The "How Does {Route} Work?" panel docks in the dashboard form slot —
  // registered only while open, so the dashboard underneath keeps its full
  // width with zero reflow. Navigating away re-resolves the entry for the
  // new route; a path without content hides the button.
  useEffect(() => {
    if (!howOpen) return
    if (!entry) {
      setFormSlot(null)
      setHowOpen(false)
      return
    }
    setFormSlot(<DashboardHowItWorks entry={entry} onClose={() => setHowOpen(false)} />, { slots: 2 })
    return () => setFormSlot(null)
  }, [howOpen, entry, setFormSlot])

  // A scrim dismiss (backdrop click / Escape in the form sheet) clears the
  // rendered slot in the layout — mirror it here so the button stops
  // claiming the slot and the panel doesn't re-register on the next render.
  useEffect(() => {
    if (!howOpen) return
    const onExternalDismiss = () => setHowOpen(false)
    window.addEventListener('lk:form-dismissed', onExternalDismiss)
    return () => window.removeEventListener('lk:form-dismissed', onExternalDismiss)
  }, [howOpen])

  return (
    <header ref={clip.ref} style={clip.style} className="mx-3 mt-3 flex shrink-0 items-center justify-between bg-white px-4 py-3 sm:m-4 sm:justify-end sm:px-8 sm:py-4">
      <Link to="/dashboard" aria-label="ListeningKit home" className="flex min-w-0 items-center gap-2 sm:hidden">
        <img src="/logo.svg" alt="ListeningKit logo" className="size-9 shrink-0 rounded-[10px] object-contain" />
        <span className="truncate text-[17px] font-bold leading-tight text-text-primary">ListeningKit</span>
      </Link>
      <div className="flex items-center gap-3">
        {entry ? (
          <Button
            type="button"
            variant="gray"
            size="xl"
            shadow="hard"
            className="gap-2 font-bold max-sm:hidden"
            aria-label={`How does ${entry.route} work?`}
            onClick={() => setHowOpen(true)}
          >
            <QuestionMarkCircleIcon aria-hidden="true" className="size-5" />
            How does {label} work?
          </Button>
        ) : null}
        <Button asChild variant="blue" size="xl" shadow="hard" className="gap-2 font-bold" aria-label="Documentation">
          <Link to="/dashboard/docs">
            <BookOpenIcon aria-hidden="true" className="size-5" />
            <span className="hidden sm:inline">DOCS</span>
          </Link>
        </Button>
        <Button asChild variant="gray" size="xl" shadow="hard" className="font-bold max-sm:hidden" aria-label="Connect your socials">
          <Link to="/dashboard/settings?tab=connections">
            Connect your Socials
            <span className="flex items-center">
              {SOCIAL_ICONS.map((icon) => (
                <SocialBadge key={icon.id} icon={icon} variant="blue" className="-ml-2 first:ml-0" />
              ))}
            </span>
          </Link>
        </Button>
        <Button type="button" variant="blue" size="xl" shadow="hard" aria-label="Notifications" className="w-12 px-0 md:w-14">
          <BellIcon aria-hidden="true" className="size-5 text-white" />
        </Button>
      </div>
      {children}
    </header>
  )
}
