import { useEffect, useId, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faXmark } from '@fortawesome/free-solid-svg-icons'
import { toast } from '@listeningkit/ui'
import type { ConsoleTarget } from './consoleClient'
import type { LocalConnection } from './connectionsData'

export type BrowserCheckProps = { account: LocalConnection; target: ConsoleTarget; onClose: () => void; onResolved: () => void; onConfigureProvider: () => void }

export function useBrowserCheck() {
  const [browserCheckAccountId, setBrowserCheckAccountId] = useState<string | null>(null)
  return { browserCheckAccountId, openBrowserCheck: (accountId: string) => setBrowserCheckAccountId(accountId), closeBrowserCheck: () => setBrowserCheckAccountId(null) }
}

export function BrowserCheckSeam({ account, target, onClose }: BrowserCheckProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const command = account.platform === 'facebook' ? `log facebook connect --account ${account.name}` : `log inspect start --account ${account.name}`
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    dialog.current?.showModal()
    return () => trigger?.focus()
  }, [])
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }} className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-slate-200 bg-white p-0 font-sans text-slate-900 shadow-xl backdrop:bg-[#0D2A4C]/45 backdrop:backdrop-blur-[2px]">
    <div className="relative p-6">
      <button type="button" autoFocus onClick={onClose} aria-label="Close browser check" className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"><FontAwesomeIcon icon={faXmark} className="size-4" /></button>
      <div className="flex items-start gap-3 pr-9">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2A8CFF]"><FontAwesomeIcon icon={faDesktop} className="size-[1.1rem]" /></span>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-base font-bold text-slate-900">Check {account.name} in its browser</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{target.kind === 'local' ? 'The account signs in in its own browser on this machine. In a terminal, run:' : 'The account signs in in its own browser in your workspace. In that workspace’s terminal, run:'}</p>
        </div>
      </div>
      <code className="mt-5 block overflow-x-auto rounded-xl bg-[#0D2A4C] px-4 py-3 text-sm text-white">{command}</code>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="h-10 rounded-lg px-3 text-sm font-bold text-slate-600 hover:bg-slate-100">Close</button>
        <button type="button" onClick={() => { void navigator.clipboard?.writeText(command); toast.success('Command copied') }} className="h-10 rounded-lg bg-[#2A8CFF] px-4 text-sm font-bold text-white hover:bg-[#1F6FE6]">Copy command</button>
      </div>
    </div>
  </dialog>
}
