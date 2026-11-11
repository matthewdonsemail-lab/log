import { useState } from 'react'
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

type PlatformOption = { value: string; label: string; icon: IconDefinition; count: number }

export function ConnectionPlatformFilter({ options, selected, onChange }: { options: PlatformOption[]; selected: string[]; onChange: (selected: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const { refs, floatingStyles, context } = useFloating({ open, onOpenChange: setOpen, placement: 'bottom-end', strategy: 'fixed', middleware: [offset(8), flip(), shift({ padding: 12 })], whileElementsMounted: autoUpdate })
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context, { role: 'dialog' })])
  return <>
    <button ref={refs.setReference} type="button" {...getReferenceProps()} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${selected.length ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`} aria-label={selected.length ? `Filter social platforms, ${selected.length} selected` : 'Filter social platforms'}><FontAwesomeIcon icon={faFilter} className="size-3.5" />Filter{selected.length ? <span className="rounded bg-white px-1.5 py-0.5 text-sm tabular-nums">{selected.length}</span> : null}</button>
    {open ? <FloatingPortal><FloatingFocusManager context={context} modal={false}>
      <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 10000 }} {...getFloatingProps()} aria-label="Filter connected profiles by social platform" className="max-h-[80dvh] w-72 max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 font-sans text-sm text-slate-900 shadow-xl">
        <fieldset><legend className="px-2 pb-2 pt-1 font-semibold">Social platforms</legend>
          {options.map((option) => <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-200"><input type="checkbox" checked={selected.includes(option.value)} onChange={(event) => onChange(event.target.checked ? [...selected, option.value] : selected.filter((value) => value !== option.value))} className="size-4 shrink-0 accent-[#2A8CFF]" /><FontAwesomeIcon icon={option.icon} className="size-4 text-slate-600" /><span className="flex-1 font-medium">{option.label}</span><span aria-label={`${option.count} profiles`} className="tabular-nums text-slate-500">{option.count}</span></label>)}
        </fieldset>
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3"><button type="button" onClick={() => onChange([])} disabled={!selected.length} className="rounded-md px-2 py-1.5 font-semibold text-blue-700 hover:bg-blue-50 disabled:text-slate-400">Clear filters</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-[#2A8CFF] px-3 py-1.5 font-semibold text-white hover:bg-blue-600">Done</button></div>
      </div>
    </FloatingFocusManager></FloatingPortal> : null}
  </>
}
