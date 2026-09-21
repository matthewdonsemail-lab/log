import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
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
import { mcpUrl } from '../lib/api-keys-live'

/**
 * Hover tooltip for a plugs icon. Shows a docs button left of the title,
 * per-tool setup words, plus the MCP server address to copy,
 * in a white floating panel.
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
  // The address an MCP client connects to: this site's own /mcp (on the live site, the Convex site address).
  const serverAddress = mcpUrl() ?? '/mcp'
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
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

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(serverAddress)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable — the command stays visible to copy by hand */
    }
  }

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()} className="flex items-center">
        {children}
      </span>
      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 w-max max-w-[260px] rounded-xl bg-white px-4 py-3 text-left shadow-xl"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#2A8CFF]">
                <img src={src} alt="" width="18" height="18" className="brightness-0 invert" />
              </span>
              <p className="text-sm font-bold text-ink">{label}</p>
            </div>
            <p className="mt-2 text-[13px] leading-snug text-ink/70">{setup}</p>
            <div className="mt-2 flex items-center gap-1 rounded-md bg-ink/5 py-1 pl-2 pr-1">
              <code className="min-w-0 grow break-all text-[13px] text-ink">
                {serverAddress}
              </code>
              <Button
                variant={copied ? 'blue' : 'ghost'}
                size="icon-sm"
                onClick={copyCommand}
                aria-label="Copy the MCP server address"
                className="shrink-0 text-ink/60"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
            <Button variant="blue" asChild className="mt-2 w-full">
              <a href={docsHref} target="_blank" rel="noopener noreferrer">
                Read the docs
              </a>
            </Button>
          </div>
        </FloatingPortal>
      ) : null}
      {copied ? (
        <FloatingPortal>
          <div className="fixed bottom-4 right-4 z-[80] rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-xl">
            Copied to clipboard
          </div>
        </FloatingPortal>
      ) : null}
    </>
  )
}
