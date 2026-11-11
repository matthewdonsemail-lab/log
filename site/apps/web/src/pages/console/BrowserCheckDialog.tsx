import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useMachine } from '@xstate/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faXmark, faSpinner, faCheck, faArrowLeft, faRotateRight, faLock, faArrowPointer } from '@fortawesome/free-solid-svg-icons'
import { faFacebook } from '@fortawesome/free-brands-svg-icons'
import { browserCheckMachine } from './browserCheckMachine'
import type { LocalConnection } from './connectionsData'
import type { BrowserPhase } from './browserCheckTypes'

const phaseLabels: Record<BrowserPhase, string> = { profileSetupBlocked: 'Browser profile setup blocked', operationUncertain: 'Browser operation not confirmed', serviceUnavailable: 'Browser service unavailable', launchCooldown: 'Browser launch is cooling down', waitingForOwner: 'Account browser is already in use', launchBlocked: 'Browser launch blocked', launchUncertain: 'Browser launch not confirmed', providerSetupRequired: 'Browser setup required', profileRequired: 'Browser profile required', browserMissing: 'Browser is not running', viewerUnavailable: 'Browser view unavailable', ready: 'Browser connected', signInRequired: 'Sign-in required', needsResolution: 'Check needs resolving', needsAttention: 'Your attention is required', stopped: 'Browser check stopped', unknown: 'Session not verified', verified: 'Session verified', busy: 'Browser is working…' }
const phaseNotes: Partial<Record<BrowserPhase, string>> = { profileSetupBlocked: 'Review the account country and AdsPower settings.', operationUncertain: 'The runtime has not confirmed the last operation.', serviceUnavailable: 'The browser service could not return its current state.', providerSetupRequired: 'Configure AdsPower in Extensions.', profileRequired: 'Link this account to its own AdsPower profile.', browserMissing: 'Open the account’s saved browser to check its session.', viewerUnavailable: 'This running session does not have a browser viewer. Its browser has been left open.', signInRequired: 'Click a field in the browser to enter your sign-in details.', needsResolution: 'Resolve the recorded check, then verify the session.', needsAttention: 'This check needs a person. Continuation is stopped.', stopped: 'The account or browser has a recorded stop. It cannot continue.', unknown: 'Check the session before continuing.', verified: 'The session was confirmed from recorded platform evidence.' }

export function BrowserCheckDialog({ account, onClose, onResolved }: { account: LocalConnection; onClose: () => void; onResolved: () => void; onConfigureProvider: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const titleId = useId()
  const queued = useRef<Record<string, unknown>[]>([])
  const [inputVersion, setInputVersion] = useState(0)
  const [hasControl, setHasControl] = useState(false)
  const drawFrame = useCallback(async (blob: Blob) => {
    const bitmap = await createImageBitmap(blob)
    try { const target = canvas.current; if (!target) return; const context = target.getContext('2d'); if (!context) throw new Error('browserCanvasUnavailable'); if (target.width !== bitmap.width || target.height !== bitmap.height) { target.width = bitmap.width; target.height = bitmap.height } context.drawImage(bitmap, 0, 0) } finally { bitmap.close() }
  }, [])
  const [snapshot, send] = useMachine(browserCheckMachine, { input: { accountId: account.id, drawFrame } })
  const { view, hasFrame, pending, error } = snapshot.context
  const disconnected = snapshot.matches('disconnected')
  const failed = snapshot.matches('failure') || snapshot.matches('closeFailed') || disconnected
  const phase = view?.phase
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
  const label = snapshot.matches('closing') || snapshot.context.closeRequested && pending ? 'Closing browser…' : snapshot.matches('closeFailed') ? 'Browser closure could not be confirmed' : error === 'browserProfileHomeExcluded' ? 'Account country is excluded by browser settings' : disconnected ? 'Browser viewer could not connect' : reconnecting ? 'Connecting to browser…' : failed ? error === 'browserCheckStopped' || error === 'browserInputStopped' ? 'Browser check stopped' : error === 'browserStateChanged' || error === 'browserGenerationChanged' ? 'Browser state changed' : 'Browser operation failed' : snapshot.matches('opening') ? 'Opening account browser…' : snapshot.matches('linking') ? 'Preparing browser profile…' : snapshot.matches({ session: 'navigating' }) ? 'Loading page…' : checking ? 'Verifying session…' : resolving ? 'Resolving check…' : completing ? 'Saving confirmed session…' : starting || (!hasFrame && view?.viewerId) ? 'Connecting to browser…' : phase ? phaseLabels[phase] : 'Connecting to browser…'
  const busy = reconnecting || starting || (pending && !snapshot.matches({ session: 'interacting' })) || (!failed && !!view?.viewerId && !hasFrame)
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'; dialog.current?.showModal()
    return () => { document.body.style.overflow = previous; trigger?.focus() }
  }, [])
  useEffect(() => { if (snapshot.status === 'done') { if (snapshot.matches('closed')) onClose(); else onResolved() } }, [snapshot.status, snapshot.value, onClose, onResolved])
  useEffect(() => { console.info('[browserCheck] machine', { state: snapshot.value, phase: view?.phase ?? null, reason: view?.reason ?? null, attempt: snapshot.context.attempts, hasFrame, pending, error }) }, [snapshot.value, view?.phase, view?.reason, snapshot.context.attempts, hasFrame, pending, error])
  const enqueue = (input: Record<string, unknown>) => {
    if (!keyboardAllowed || queued.current.length >= 100) return
    const last = queued.current.at(-1)
    if (input.type === 'text' && last?.type === 'text' && String(last.text).length + String(input.text).length <= 2048) last.text = String(last.text) + String(input.text)
    else queued.current.push(input)
    setInputVersion((version) => version + 1)
  }
  useEffect(() => {
    if (failed || !view?.canInteract) { queued.current = []; return }
    if (!inputAllowed || !queued.current.length) return
    const timer = setTimeout(() => {
      const input = queued.current.shift()
      if (input) send({ type: 'INPUT', input })
    }, queued.current[0].type === 'text' ? 120 : 0)
    return () => clearTimeout(timer)
  }, [inputAllowed, inputVersion, failed, view?.canInteract, send])
  useEffect(() => () => { queued.current = [] }, [])
  useEffect(() => { setHasControl(false) }, [view?.generation])


  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); send({ type: 'CLOSE' }) }} onClose={() => send({ type: 'CLOSE' })} className="m-auto max-h-[94dvh] w-[calc(100%-1rem)] max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 font-sans text-slate-900 shadow-xl backdrop:bg-[#0D2A4C]/45 backdrop:backdrop-blur-[2px]">
    <header className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5"><FontAwesomeIcon icon={faFacebook} className="size-5 shrink-0 text-[#1877F2]" /><h2 id={titleId} className="text-base font-semibold">Facebook</h2><span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><span aria-hidden="true" className={`size-1.5 rounded-full ${connected ? 'animate-pulse bg-emerald-500 motion-reduce:animate-none' : 'bg-slate-400'}`} />{connected ? 'Live browser' : busy ? 'Connecting' : 'Not connected'}</span><span className="hidden truncate text-sm text-slate-500 sm:block">{account.name}</span></div>
        <button type="button" autoFocus disabled={snapshot.matches('closing') || snapshot.context.closeRequested && pending} onClick={() => send({ type: 'CLOSE' })} aria-label="Close browser check" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 disabled:opacity-40"><FontAwesomeIcon icon={snapshot.matches('closing') ? faSpinner : faXmark} className={`size-4 ${snapshot.matches('closing') ? 'animate-spin motion-reduce:animate-none' : ''}`}  /></button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button type="button" disabled={!navigationAllowed || !view?.canGoBack} onClick={() => { setHasControl(true); send({ type: 'NAVIGATE', action: 'back' }) }} aria-label="Go back" title="Go back" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-30"><FontAwesomeIcon icon={faArrowLeft} className="size-4" /></button>
        <button type="button" disabled={!navigationAllowed} onClick={() => { setHasControl(true); send({ type: 'NAVIGATE', action: 'reload' }) }} aria-label="Reload page" title="Reload page" className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/70 disabled:cursor-not-allowed disabled:opacity-30"><FontAwesomeIcon icon={faRotateRight} className={`size-4 ${snapshot.matches({ session: 'navigating' }) ? 'animate-spin motion-reduce:animate-none' : ''}`} /></button>
        <div role="group" aria-label="Browser address" className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600">{view?.address ? <FontAwesomeIcon icon={faLock} className="size-3 shrink-0 text-slate-400" /> : null}<span className="truncate">{view?.address ?? 'Waiting for page…'}</span></div>
      </div>
    </header>
    <div role="status" aria-live="polite" className="sr-only"><FontAwesomeIcon icon={busy ? faSpinner : phase === 'verified' && !failed ? faCheck : faDesktop} className={`size-4 shrink-0 ${busy ? 'animate-spin motion-reduce:animate-none text-[#2A8CFF]' : failed || phase === 'stopped' || phase === 'needsAttention' ? 'text-red-600' : 'text-slate-500'}`} />{label}</div>
    <div className="relative m-4 flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:min-h-96">
      <canvas ref={canvas} width={1280} height={800} role="application" aria-label={`${account.name} browser. Click and type directly into the browser.`} tabIndex={hasFrame ? 0 : -1} className={`h-auto max-h-[60dvh] w-auto max-w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${hasFrame ? '' : 'invisible'} ${inputAllowed ? 'cursor-pointer' : 'cursor-default'}`} onClick={(event) => { if (!inputAllowed) return; const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.focus(); setHasControl(true); enqueue({ type: 'click', x: (event.clientX - rect.left) * event.currentTarget.width / rect.width, y: (event.clientY - rect.top) * event.currentTarget.height / rect.height }) }} onPaste={(event) => { if (!keyboardAllowed) return; setHasControl(true); event.preventDefault(); const value = event.clipboardData.getData('text'); if (value && value.length <= 2048) enqueue({ type: 'text', text: value }) }} onKeyDown={(event) => { if (!keyboardAllowed || event.nativeEvent.isComposing || event.altKey || event.metaKey || event.ctrlKey) return; setHasControl(true); if (event.key.length === 1) { event.preventDefault(); enqueue({ type: 'text', text: event.key }) } else if (['Enter', 'Tab', 'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) { event.preventDefault(); enqueue({ type: 'key', key: event.key }) } }} />
      {inputAllowed && !busy && !hasControl ? <button type="button" onClick={() => { setHasControl(true); canvas.current?.focus() }} className="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-blue-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#0D2A4C] shadow-md backdrop-blur-sm transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><FontAwesomeIcon icon={faArrowPointer} className="size-3.5 text-[#2A8CFF]" />Click to take control</button> : null}
      {!hasFrame || busy || failed ? <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center ${hasFrame ? 'bg-white/85' : 'bg-slate-100'}`}>{busy ? <FontAwesomeIcon icon={faSpinner} className="size-6 animate-spin motion-reduce:animate-none text-[#2A8CFF]" /> : <FontAwesomeIcon icon={faDesktop} className="size-8 text-slate-400" />}<p className="text-sm font-semibold text-slate-700">{label}</p>{!busy ? <p className="max-w-md text-sm leading-6 text-slate-500">{failed ? error === 'browserProfileHomeExcluded' ? 'This account’s home country is outside LOG_ADSPOWER_HOMES. Profile creation was skipped.' : disconnected ? 'No browser frames were received after five attempts. Check the console for the connection stage and error. An existing browser session may not support the viewer yet.' : 'The check has not been confirmed.' : phase ? phaseNotes[phase] : null}</p> : null}</div> : null}
    </div>
  </dialog>
}
