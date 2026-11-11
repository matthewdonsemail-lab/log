import { useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useListNavigation, useRole } from '@floating-ui/react'
import { AgentPlatformLogo, agentPlatforms, type AgentPlatform } from './agentPlatforms'

export function AgentPlatformSelector({ value, onChange }: { value: AgentPlatform; onChange: (value: AgentPlatform) => void }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const listRef = useRef<Array<HTMLButtonElement | null>>([])
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (nextOpen) => {
      setOpen(nextOpen)
      if (nextOpen) setActiveIndex(agentPlatforms.findIndex((option) => option.id === value))
    },
    placement: 'bottom-end',
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'listbox' })
  const selectedIndex = agentPlatforms.findIndex((option) => option.id === value)
  const navigation = useListNavigation(context, { listRef, activeIndex, selectedIndex, onNavigate: setActiveIndex, loop: true })
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([click, dismiss, role, navigation])
  const selected = agentPlatforms[selectedIndex] ?? agentPlatforms[0]

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        aria-label={`AI harness: ${selected.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex max-w-[11rem] shrink-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        {...getReferenceProps()}
      >
        <AgentPlatformLogo platform={value} />
        <span className="truncate">{selected.label}</span>
        <FontAwesomeIcon icon={faChevronDown} className="ml-auto size-3 text-slate-500" aria-hidden="true" />
      </button>
      {open ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, zIndex: 10000 }}
              aria-label="AI harness"
              className="max-h-80 min-w-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 font-sans text-slate-900 shadow-xl outline-none"
              {...getFloatingProps()}
            >
              {agentPlatforms.map((option, index) => (
                <button
                  key={option.id}
                  ref={(node) => { listRef.current[index] = node }}
                  type="button"
                  role="option"
                  aria-selected={option.id === value}
                  tabIndex={activeIndex === index ? 0 : -1}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm outline-none transition-colors ${activeIndex === index ? 'bg-blue-50 text-blue-900' : option.id === value ? 'bg-slate-100 font-semibold text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                  {...getItemProps({
                    onClick: () => {
                      onChange(option.id)
                      setActiveIndex(index)
                      setOpen(false)
                    },
                  })}
                >
                  <AgentPlatformLogo platform={option.id} />
                  <span className="flex-1">{option.label}</span>
                  {option.id === value ? <FontAwesomeIcon icon={faCheck} className="size-3 text-blue-600" aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  )
}
