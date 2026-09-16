import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useComposedRef, useIsMobileViewport, useSquircleClip } from '@listeningkit/ui'
import { DashboardSidebar, DashboardMobileNav } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import { DashboardFormProvider, type FormSlotOptions, type FormSlotWidth } from './DashboardFormSlot'

const SQUIRCLE_RADIUS = 28

export function DashboardLayout() {
  const clip = useSquircleClip<HTMLDivElement>(SQUIRCLE_RADIUS)
  const toggleClip = useSquircleClip<HTMLButtonElement>(14)
  const panelRef = useComposedRef(clip.ref)
  const isMobile = useIsMobileViewport()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  // The form overlay: pages register their form node when open, null when
  // closed. Rendered ABOVE the layout at a higher z-level, never in-flow —
  // the dashboard underneath keeps its shape (sidebar | content) with zero
  // reflow while a form is up. `slots` widens the docked panel to two
  // columns for content that needs the room (e.g. an embedded browser view).
  const [formSlot, setFormSlot] = useState<{ node: ReactNode; slots: FormSlotWidth } | null>(null)
  // The registration callback the pages hold in their slot-effect dep
  // arrays: an inline arrow here gets a fresh identity every layout render,
  // so a page effect that registers its own form node (re)runs forever —
  // register → layout re-render → new identity → effect re-runs → register.
  const registerFormSlot = useCallback((node: ReactNode | null, options?: FormSlotOptions) => {
    setFormSlot(node ? { node, slots: options?.slots ?? 1 } : null)
  }, [])

  return (
    <DashboardFormProvider value={registerFormSlot}>
    <div className="h-screen supports-[height:100dvh]:h-dvh overflow-hidden bg-[#FBFCFE] p-0 sm:bg-[#2A8CFF] sm:p-6">
      <div className="relative mx-auto max-w-[1600px]">
        <div
          ref={panelRef}
          style={isMobile ? undefined : clip.style}
          className="relative flex h-screen supports-[height:100dvh]:h-dvh overflow-hidden bg-[#FBFCFE] text-text-primary sm:h-[calc(100vh_-_3rem)] sm:supports-[height:100dvh]:h-[calc(100dvh_-_2rem)]"
        >
          <DashboardSidebar collapsed={sidebarCollapsed} onToggleCollapsed={setSidebarCollapsed} />

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-transparent">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!sidebarCollapsed}
              ref={toggleClip.ref}
              style={toggleClip.style}
              className="absolute -left-3.5 top-1/2 z-10 hidden size-7 -translate-y-1/2 items-center justify-center border border-black/10 bg-white text-text-secondary outline-none transition-colors duration-150 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:flex"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={15} strokeWidth={2.25} aria-hidden="true" />
              ) : (
                <PanelLeftClose size={15} strokeWidth={2.25} aria-hidden="true" />
              )}
            </button>
            <DashboardHeader>
              {/* Mobile nav docks under the header; it self-gates to <sm.
                Hidden while a form is open — the form goes full-screen and
                the fixed bottom bar (root stacking context) would otherwise
                paint above the overlay. */}
              {formSlot ? null : <DashboardMobileNav />}
            </DashboardHeader>

            <div className="flex min-h-0 flex-1 items-stretch">
              <main className="lk-no-scrollbar flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto bg-[#FBFCFE] px-3 pb-20 pt-3 sm:px-4 sm:pb-0 sm:pt-4">
                <Outlet />
              </main>
            </div>
          </div>

          {/* The form floats above the layout at a higher z-level: a dark
            low-opacity scrim covering the whole layout, with the form docked
            on the right — one 400px column by default, two columns
            (400 + 400 + gutter) when the page registered `{ slots: 2 }` —
            the dashboard underneath keeps its full width with zero
            reflow. On mobile the overlay goes full-screen instead (no inset,
            no squircle, full-bleed panel). The panel lives in a memoized
            child so page re-renders (polling, filters, per-card busy states)
            never re-render it. Scrim dismiss only clears the rendered slot —
            pages own their open-state (e.g. ?eventId= deep-links), so the
            dismiss is also broadcast; pages that need to reset their state
            listen for it, the rest ignore it. */}
          <FormOverlay
            formSlot={formSlot}
            onDismiss={() => {
              setFormSlot(null)
              window.dispatchEvent(new CustomEvent('lk:form-dismissed'))
            }}
          />
        </div>
      </div>
    </div>
    </DashboardFormProvider>
  )
}

/**
 * The dashboard's form overlay. Memoized: it only re-renders when the
 * registered form node changes identity, never when the page underneath
 * re-renders. Covers the whole layout at a higher z-level with a dark
 * low-opacity scrim, and docks the form on the right — one 400px column by
 * default, two columns when the page registered `{ slots: 2 }` — so the
 * dashboard beneath never reflows. On mobile (<sm) the scrim and panel go
 * full-bleed with no inset or squircle. The layer is click-through except
 * for the panel itself; the form's own Cancel/Escape/confirm paths close it.
 */
const FormOverlay = memo(function FormOverlay({
  formSlot,
  onDismiss
}: {
  formSlot: { node: ReactNode; slots: FormSlotWidth } | null
  onDismiss: () => void
}) {
  // Inset + squircle-clipped to sit *inside* the panel: the scrim covers
  // only the inner dashboard layout, never the panel's squircle edge. The
  // scrim is the backdrop-click close path (same as Cancel/Escape) — the
  // form panel is a sibling, so clicks inside it never reach it.
  const overlayClip = useSquircleClip<HTMLDivElement>(20)
  const isMobile = useIsMobileViewport()
  // While the exit fade runs, the scrim and panel must not swallow clicks
  // aimed at the dashboard underneath (e.g. the very button that reopens
  // the form): pointer-events drop to none for the exit duration, then
  // return once the animation has fully committed out.
  const [isExiting, setIsExiting] = useState(false)
  const exitTimer = useRef<number | null>(null)
  useEffect(
    () => () => {
      if (exitTimer.current !== null) window.clearTimeout(exitTimer.current)
    },
    []
  )
  const onOverlayAnimationStart = (def: string) => {
    if (def !== 'exit') return
    setIsExiting(true)
    exitTimer.current = window.setTimeout(() => setIsExiting(false), 250)
  }
  return (
    <AnimatePresence initial={false}>
      {formSlot ? (
        <motion.div
          key="form-overlay"
          initial={{ opacity: 0, y: isMobile ? 24 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onAnimationStart={onOverlayAnimationStart}
          className="pointer-events-none absolute inset-0 z-30 sm:inset-2"
          aria-hidden={false}
        >
          <div ref={overlayClip.ref} style={isMobile ? undefined : overlayClip.style} className="relative h-full w-full overflow-hidden">
            <div
              className="absolute inset-0 bg-[#0A1830]/45"
              aria-hidden="true"
              onClick={onDismiss}
              style={{ pointerEvents: isExiting ? 'none' : 'auto', cursor: 'pointer' }}
            />
            <div
              className="absolute inset-0 sm:inset-y-0 sm:left-auto sm:right-0 sm:py-8 sm:pr-8"
              style={{ pointerEvents: isExiting ? 'none' : 'auto' }}
            >
              <div
                className={
                  formSlot.slots === 2
                    ? 'h-full w-full sm:w-[824px] sm:max-w-[calc(100%-3rem)]'
                    : 'h-full w-full sm:w-[400px]'
                }
                style={{ pointerEvents: isExiting ? 'none' : 'auto' }}
              >
                {formSlot.node}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
})
