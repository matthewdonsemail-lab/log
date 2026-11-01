import { useState, type ReactNode } from 'react'
import {
  FloatingPortal,
  autoUpdate,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
} from '@floating-ui/react'
import { Button } from '@listeningkit/ui'

/**
 * Hover tooltip for a "Works with" icon: the tool's name, one line on how it connects, and a button to
 * that tool's section of the MCP docs. Log is self-hosted now, so there is no shared server address to
 * show; the docs explain where each person's own deployment serves `/mcp`.
 */
export function PlugTooltip({
  label,
  setup,
  docsHref,
  src,
  children,
}: {
  label: string
  setup: string
  docsHref: string
  src: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    middleware: [offset(10), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  })
  const hover = useHover(context, {
    move: false,
    delay: { open: 75, close: 200 },
    handleClose: safePolygon(),
  })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss])

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()} className="flex items-center">
        {children}
      </span>
      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, zIndex: 9999 }}
            {...getFloatingProps()}
            className="z-[9999] w-max max-w-[260px] rounded-xl bg-white px-4 py-3 text-left shadow-xl"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2A8CFF]">
                <img src={src} alt="" width="18" height="18" className="brightness-0 invert" />
              </span>
              <p className="text-sm font-bold text-ink">{label}</p>
            </div>
            <p className="mt-2 text-[13px] leading-snug text-ink/70">{setup}</p>
            <Button variant="blue" asChild className="mt-2 w-full">
              <a href={docsHref} target="_blank" rel="noopener noreferrer">
                Read the MCP docs
              </a>
            </Button>
          </div>
        </FloatingPortal>
      ) : null}
    </>
  )
}
