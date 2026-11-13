import { useCallback, useEffect, useId, useRef, useState, type ClipboardEvent, type KeyboardEvent, type MouseEvent } from 'react'
import { useMachine } from '@xstate/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faXmark, faSpinner, faCheck, faArrowLeft, faRotateRight, faLock, faArrowPointer, faUserCheck, faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import { toast } from '@listeningkit/ui'
import { CONSOLE_MESSAGES, type ConsoleTarget } from './consoleClient'
import { browserCheckMachine } from './browserCheckMachine'
import { browserKeys, type BrowserInput, type BrowserPhase } from './browserCheckTypes'
import type { LocalConnection } from './connectionsData'

const phaseLabels: Record<BrowserPhase, string> = { operationUncertain: 'Browser operation not confirmed', providerSetupRequired: 'Browser setup required', profileRequired: 'Browser profile required', browserMissing: 'Browser is not running', viewerUnavailable: 'Browser view unavailable', ready: 'Browser connected', signInRequired: 'Sign-in required', needsResolution: 'Check needs resolving', needsAttention: 'Your attention is required', verified: 'Session verified', busy: 'Browser is working…' }
const phaseNotes: Partial<Record<BrowserPhase, string>> = { operationUncertain: 'The runtime has not confirmed the last operation.', providerSetupRequired: 'Configure AdsPower in Extensions.', profileRequired: 'Link this account to its own AdsPower profile.', browserMissing: 'Open the account’s saved browser to check its session.', viewerUnavailable: 'This running session does not have a browser viewer. Its browser has been left open.', signInRequired: 'Click a field in the browser to enter your sign-in details.', needsResolution: 'Resolve the recorded check, then verify the session.', needsAttention: 'This page needs a person. Input stays off and the run is stopped.', ready: 'Verify the session to confirm it is signed in.', verified: 'The session was confirmed from the page. Save it to finish.' }
const errorTitles: Record<string, string> = { browserStateChanged: 'The page changed first, so nothing was sent', browserInputStopped: 'The page no longer allows that', browserBusy: 'The browser is running another step', browserGenerationChanged: 'The account browser was restarted', browserViewerUnavailable: 'The browser view could not be reached', browserInputInvalid: 'That input was rejected', browserInputFailed: 'That input failed in the browser', browserCheckUnresolved: 'The check is not resolved yet', browserOperationRefused: 'log refused that browser step', accountDeactivated: 'Browser check stopped', accountCheckStopped: 'Browser check stopped' }
const buttonClass = 'inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-40'

export function BrowserCheckDialog({ account, target, autoSignIn = false, onClose, onResolved, onConfigureProvider }: { account: LocalConnection; target: ConsoleTarget; autoSignIn?: boolean; onClose: () => void; onResolved: () => void; onConfigureProvider: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const surface = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const queued = useRef<BrowserInput[]>([])
  const [inputVersion, setInputVersion] = useState(0)
  const [hasControl, setHasControl] = useState(false)
  const drawFrame = useCallback(async (blob: Blob) => {
    const bitmap = await createImageBitmap(blob)
    try { const element = canvas.current; if (!element) return; const context = element.getContext('2d'); if (!context) throw new Error('browserCanvasUnavailable'); if (element.width !== bitmap.width || element.height !== bitmap.height) { element.width = bitmap.width; element.height = bitmap.height } context.drawImage(bitmap, 0, 0) } finally { bitmap.close() }
  }, [])
  const [snapshot, send] = useMachine(browserCheckMachine, { input: { target, accountId: account.id, drawFrame, autoSignIn } })
  const { view, hasFrame, pending, error } = snapshot.context
  const disconnected = snapshot.matches('disconnected')
  const failed = snapshot.matches('failure') || snapshot.matches('closeFailed') || disconnected
  const phase = view?.phase
  const stream = view?.stream ?? null
  const local = view?.location !== 'remote'
  const reconnecting = snapshot.matches('reconnecting') || snapshot.matches('unavailable')
  const starting = snapshot.matches('connecting') || snapshot.matches('opening') || snapshot.matches('linking')
  const active = snapshot.matches({ session: 'viewing' })
  const connected = hasFrame && snapshot.matches('session') && !failed && !starting && !reconnecting
  const navigationAllowed = active && connected && view?.canNavigate === true && !pending
  const inputAllowed = active && hasFrame && view?.canInteract === true
  const keyboardAllowed = !snapshot.context.closeRequested && hasFrame && view?.canInteract === true && !failed
  const checking = snapshot.matches({ session: 'checking' })
  const resolving = snapshot.matches({ session: 'resolving' })
  const completing = snapshot.matches({ session: 'completing' })
  const closing = snapshot.matches('closing') || (snapshot.context.closeRequested && pending)
  const label = closing ? 'Closing browser…' : snapshot.matches('closeFailed') ? 'Browser closure could not be confirmed' : disconnected ? 'Browser viewer could not connect' : reconnecting ? 'Connecting to browser…' : failed ? errorTitles[error ?? ''] ?? 'Browser operation failed' : snapshot.matches('opening') ? 'Opening account browser…' : snapshot.matches('linking') ? 'Preparing browser profile…' : snapshot.matches({ session: 'navigating' }) ? 'Loading page…' : checking ? 'Verifying session…' : resolving ? 'Signing in with the saved login…' : completing ? 'Saving confirmed session…' : starting || (!hasFrame && view?.generation) ? 'Connecting to browser…' : phase ? phaseLabels[phase] : 'Connecting to browser…'
  const busy = reconnecting || starting || (pending && !snapshot.matches({ session: 'interacting' })) || (!failed && !!view?.generation && !hasFrame)
  const note = failed ? (error ? CONSOLE_MESSAGES[error] ?? view?.reason?.message ?? 'The check has not been confirmed.' : 'The check has not been confirmed.') : view?.reason?.message ?? (phase ? phaseNotes[phase] : null)
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'; dialog.current?.showModal()
    return () => { document.body.style.overflow = previous; trigger?.focus() }
  }, [])
  useEffect(() => { if (snapshot.status === 'done') { if (snapshot.matches('closed')) onClose(); else { toast.success('Session saved', `${account.name} is signed in. Its session stays in your workspace.`); onResolved() } } }, [snapshot.status, snapshot.value, onClose, onResolved, account.name])
  useEffect(() => { if (error && failed) toast.error(errorTitles[error] ?? 'The browser operation failed', CONSOLE_MESSAGES[error] ?? undefined) }, [error, failed])
  const enqueue = (input: BrowserInput) => {
    if (!keyboardAllowed || queued.current.length >= 100) return
    const last = queued.current.at(-1)
    if (input.type === 'text' && last?.type === 'text' && last.text.length + input.text.length <= 2048) last.text += input.text
    else queued.current.push(input)
    setInputVersion((version) => version + 1)
  }
  useEffect(() => {
    if (failed || !view?.canInteract) { queued.current = []; return }
    if (!inputAllowed || !queued.current.length) return
    const timer = setTimeout(() => { const input = queued.current.shift(); if (input) send({ type: 'INPUT', input }) }, queued.current[0].type === 'text' ? 120 : 0)
    return () => clearTimeout(timer)
  }, [inputAllowed, inputVersion, failed, view?.canInteract, send])
  useEffect(() => () => { queued.current = [] }, [])
  useEffect(() => { setHasControl(false) }, [view?.generation])
  const size = () => stream ? { width: stream.page.width, height: stream.page.height } : { width: canvas.current?.width ?? 1, height: canvas.current?.height ?? 1 }
  const handlers = {
    onClick: (event: MouseEvent<HTMLElement>) => { if (!inputAllowed) return; const rect = event.currentTarget.getBoundingClientRect(); const { width, height } = size(); event.currentTarget.focus(); setHasControl(true); enqueue({ type: 'click', x: (event.clientX - rect.left) * width / rect.width, y: (event.clientY - rect.top) * height / rect.height }) },
    onPaste: (event: ClipboardEvent<HTMLElement>) => { if (!keyboardAllowed) return; setHasControl(true); event.preventDefault(); const value = event.clipboardData.getData('text'); if (value && value.length <= 2048) enqueue({ type: 'text', text: value }) },
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => { if (!keyboardAllowed || event.nativeEvent.isComposing || event.altKey || event.metaKey || event.ctrlKey) return; setHasControl(true); if (event.key.length === 1) { event.preventDefault(); enqueue({ type: 'text', text: event.key }) } else if ((browserKeys as readonly string[]).includes(event.key)) { event.preventDefault(); enqueue({ type: 'key', key: event.key }) } },
  }

  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); send({ type: 'CLOSE' }) }} className="m-auto max-h-[94dvh] w-[calc(100%-1rem)] max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 font-sans text-slate-900 shadow-xl backdrop:bg-[#0D2A4C]/45 backdrop:backdrop-blur-[2px]">
    <header className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5"><FontAwesomeIcon icon={faFacebook} className="size-5 shrink-0 text-[#1877F2]" /><h2 id={titleId} className="text-base font-semibold">Facebook</h2><span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><span aria-hidden="true" className={`size-1.5 rounded-full ${connected ? 'animate-pulse bg-emerald-500 motion-reduce:animate-none' : 'bg-slate-400'}`} />{connected ? 'Live browser' : busy ? 'Connecting' : 'Not connected'}</span><span className="hidden truncate text-sm text-slate-500 sm:block">{account.name}</span></div>
        <button type="button" autoFocus disabled={closing} onClick={() => send({ type: 'CLOSE' })} aria-label="Close browser check" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 disabled:opacity-40"><FontAwesomeIcon icon={snapshot.matches('closing') ? faSpinner : faXmark} className={`size-4 ${snapshot.matches('closing') ? 'animate-spin motion-reduce:animate-none' : ''}`} /></button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" disabled={!navigationAllowed || !view?.canGoBack} onClick={() => { setHasControl(true); send({ type: 'NAVIGATE', action: 'back' }) }} aria-label="Go back" title="Go back" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-30"><FontAwesomeIcon icon={faArrowLeft} className="size-4" /></button>
        <button type="button" disabled={!navigationAllowed} onClick={() => { setHasControl(true); send({ type: 'NAVIGATE', action: 'reload' }) }} aria-label="Reload page" title="Reload page" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-30"><FontAwesomeIcon icon={faRotateRight} className={`size-4 ${snapshot.matches({ session: 'navigating' }) ? 'animate-spin motion-reduce:animate-none' : ''}`} /></button>
        <div role="group" aria-label="Browser address" className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600">{view?.address ? <FontAwesomeIcon icon={faLock} className="size-3 shrink-0 text-slate-400" /> : null}<span className="truncate">{view?.address ?? 'Waiting for page…'}</span></div>
      </div>
    </header>
    <div role="status" aria-live="polite" className="sr-only">{label}</div>
    {local && view?.generation ? <p className="mx-4 mt-4 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2 text-sm text-[#0D2A4C]">It’s open in the window on your screen too. Use either one.</p> : null}
    <div ref={surface} className="relative m-4 flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:min-h-96">
      {stream ? <div className="relative w-full" style={{ aspectRatio: `${stream.page.width} / ${stream.page.height}` }}><iframe src={stream.url} title={`${account.name} browser stream`} className="absolute inset-0 size-full border-0" sandbox="allow-scripts allow-same-origin" /><div role="application" aria-label={`${account.name} browser. Click and type directly into the browser.`} tabIndex={hasFrame ? 0 : -1} className={`absolute inset-0 outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${inputAllowed ? 'cursor-pointer' : 'cursor-default'}`} {...handlers} /></div>
        : <canvas ref={canvas} width={1280} height={800} role="application" aria-label={`${account.name} browser. Click and type directly into the browser.`} tabIndex={hasFrame ? 0 : -1} className={`h-auto max-h-[60dvh] w-auto max-w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${hasFrame ? '' : 'invisible'} ${inputAllowed ? 'cursor-pointer' : 'cursor-default'}`} {...handlers} />}
      {inputAllowed && !busy && !hasControl ? <button type="button" onClick={() => { setHasControl(true); (surface.current?.querySelector('[role=application]') as HTMLElement | null)?.focus() }} className="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-blue-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#0D2A4C] shadow-md backdrop-blur-sm transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><FontAwesomeIcon icon={faArrowPointer} className="size-3.5 text-[#2A8CFF]" />Click to take control</button> : null}
      {!hasFrame || busy || failed ? <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center ${hasFrame ? 'bg-white/85' : 'bg-slate-100'}`}>{busy ? <FontAwesomeIcon icon={faSpinner} className="size-6 animate-spin motion-reduce:animate-none text-[#2A8CFF]" /> : <FontAwesomeIcon icon={faDesktop} className="size-8 text-slate-400" />}<p className="text-sm font-semibold text-slate-700">{label}</p>{!busy && note ? <p className="max-w-md text-sm leading-6 text-slate-500">{note}</p> : null}
        {!busy && (failed || snapshot.matches('uncertain') || snapshot.matches('setupBlocked') || snapshot.matches('setupRequired')) ? <div className="flex flex-wrap justify-center gap-2">
          {snapshot.matches('uncertain') && phase === 'browserMissing' ? <button type="button" onClick={() => send({ type: 'OPEN' })} className={buttonClass}><FontAwesomeIcon icon={faDesktop} className="size-3.5" />Open browser</button> : null}
          {snapshot.matches('setupBlocked') ? <button type="button" onClick={() => send({ type: 'LINK_PROFILE' })} className={buttonClass}>Link browser profile</button> : null}
          {snapshot.matches('setupRequired') ? <button type="button" onClick={onConfigureProvider} className={buttonClass}>Configure AdsPower</button> : null}
          <button type="button" onClick={() => send({ type: 'RECONNECT' })} className={buttonClass}>Try again</button>
        </div> : null}
      </div> : null}
    </div>
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:px-5">
      <p className="flex min-w-0 items-center gap-2 text-sm text-slate-600"><FontAwesomeIcon icon={busy ? faSpinner : phase === 'verified' && !failed ? faCheck : faDesktop} className={`size-4 shrink-0 ${busy ? 'animate-spin motion-reduce:animate-none text-[#2A8CFF]' : failed || phase === 'needsAttention' ? 'text-red-600' : phase === 'verified' ? 'text-emerald-600' : 'text-slate-500'}`} /><span className="truncate">{label}</span></p>
      <div className="flex flex-wrap gap-2">
        {view?.canResolve ? <button type="button" disabled={!active || !hasFrame || pending} onClick={() => send({ type: 'RESOLVE' })} className={buttonClass}><FontAwesomeIcon icon={resolving ? faSpinner : faUserCheck} className={`size-3.5 ${resolving ? 'animate-spin motion-reduce:animate-none' : ''}`} />Sign in with saved login</button> : null}
        <button type="button" disabled={!active || !hasFrame || pending || !['ready', 'verified'].includes(phase ?? '')} onClick={() => send({ type: 'VERIFY' })} className={buttonClass}><FontAwesomeIcon icon={checking ? faSpinner : faCheck} className={`size-3.5 ${checking ? 'animate-spin motion-reduce:animate-none' : ''}`} />Verify session</button>
        <button type="button" disabled={!active || !hasFrame || pending || view?.canComplete !== true} onClick={() => send({ type: 'COMPLETE' })} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-[#2A8CFF] px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"><FontAwesomeIcon icon={completing ? faSpinner : faFloppyDisk} className={`size-3.5 ${completing ? 'animate-spin motion-reduce:animate-none' : ''}`} />Save session</button>
      </div>
    </footer>
  </dialog>
}
