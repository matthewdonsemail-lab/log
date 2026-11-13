import { useRef, useState } from 'react'
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useListNavigation, useRole } from '@floating-ui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, faRotateRight, faSpinner, faDesktop } from '@fortawesome/free-solid-svg-icons'

export type ConnectionAction = { kind: 'sessionCheck' | 'browserCheck'; label: string; accessibleLabel: string; disabled: boolean; reason: string; pending: boolean; onClick: () => void }

export function ConnectionActionButton({ action }: { action: ConnectionAction }) {
  return <button type="button" aria-label={action.accessibleLabel} disabled={action.disabled} onClick={action.onClick} title={action.reason} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-50">{action.pending ? <FontAwesomeIcon icon={faSpinner} className="size-3.5 animate-spin motion-reduce:animate-none" /> : null}{action.label}</button>
}

export function ConnectionActions({ name, action }: { name: string; action: ConnectionAction }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const listRef = useRef<Array<HTMLElement | null>>([])
  const { refs, floatingStyles, context } = useFloating({ open, onOpenChange: setOpen, placement: 'bottom-end', strategy: 'fixed', middleware: [offset(6), flip(), shift({ padding: 12 })], whileElementsMounted: autoUpdate })
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([useClick(context), useDismiss(context), useRole(context, { role: 'menu' }), useListNavigation(context, { listRef, activeIndex, onNavigate: setActiveIndex, loop: true })])
  return <>
    <button ref={refs.setReference} type="button" {...getReferenceProps()} aria-label={`Actions for ${name}`} className={`inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${open ? 'bg-slate-100 text-slate-900' : ''}`}><FontAwesomeIcon icon={faEllipsis} className="size-5" /></button>
    {open ? <FloatingPortal><FloatingFocusManager context={context} modal={false}>
      <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 10000 }} {...getFloatingProps()} aria-label={`Actions for ${name}`} className="w-64 max-w-[calc(100vw-24px)] rounded-xl border border-slate-200 bg-white p-1.5 text-left font-sans text-sm text-slate-900 shadow-xl outline-none">
        <button ref={(element) => { listRef.current[0] = element }} type="button" role="menuitem" tabIndex={activeIndex === 0 ? 0 : -1} aria-label={action.accessibleLabel} aria-disabled={action.disabled} {...getItemProps({ onClick: () => { if (action.disabled) return; setOpen(false); action.onClick() } })} className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left outline-none hover:bg-slate-50 focus:bg-slate-50 aria-disabled:cursor-not-allowed aria-disabled:text-slate-400"><FontAwesomeIcon icon={action.pending ? faSpinner : action.kind === 'browserCheck' ? faDesktop : faRotateRight} className={`mt-0.5 size-4 shrink-0 ${action.pending ? 'animate-spin motion-reduce:animate-none' : ''}`} /><span className="min-w-0"><span className="block font-semibold">{action.label}</span>{action.disabled ? <span className="mt-1 block text-sm leading-5 text-slate-500">{action.reason}</span> : null}</span></button>
      </div>
    </FloatingFocusManager></FloatingPortal> : null}
  </>
}
