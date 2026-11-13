import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useMachine } from '@xstate/react'
import { TextMorph } from 'torph/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop, faXmark, faSpinner, faLock, faArrowPointer } from '@fortawesome/free-solid-svg-icons'
import { toast } from '@listeningkit/ui'
import { browserCheckMachine } from './browserCheckMachine'
import { browserKeys, type BrowserInput, type BrowserPhase } from './browserCheckTypes'

const phaseLabels: Record<BrowserPhase, string> = { browserMissing: 'Browser is not running', viewerUnavailable: 'Browser view unavailable', signInRequired: 'Sign-in required', needsAttention: 'Your attention is required', busy: 'Browser is working…', ready: 'Browser connected' }
const phaseNotes: Record<BrowserPhase, string> = { browserMissing: 'Open the account’s browser with log inspect start, then it shows here.', viewerUnavailable: 'This running session does not have a browser viewer. Its browser has been left open.', signInRequired: 'Click a field in the browser to enter your sign-in details.', needsAttention: 'This page needs a person. Input stays off and the run is stopped.', busy: 'The browser is running a step.', ready: 'The page does not ask for sign-in, so input is off.' }
const errorTitles: Record<string, string> = { browserStateChanged: 'The page changed before your input, so it was not sent', browserInputStopped: 'The page no longer asks for sign-in, so input is off', browserBusy: 'The browser is running another step', browserGenerationChanged: 'The account browser was restarted', browserViewerUnavailable: 'The browser view could not be reached', browserInputInvalid: 'That input was rejected', browserInputFailed: 'That input failed in the browser' }

const loadingLines = ['Waking the browser up…', 'Untangling the tabs…', 'Asking the page to hurry…', 'Counting pixels, nearly done…', 'Polishing the frames…', 'Talking the server round…', 'Almost there, promise…']

function LoadingLine({ active }: { active: boolean }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * loadingLines.length))
  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % loadingLines.length), 2400)
    return () => window.clearInterval(timer)
  }, [active])
  return <span aria-hidden="true" className="block"><TextMorph as="span" duration={420} className="text-xl font-bold text-white sm:text-2xl">{loadingLines[index]}</TextMorph></span>
}

export function BrowserCheckDialog({ account, platformLabel, onClose }: { account: string; platformLabel: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const titleId = useId()
  const queued = useRef<BrowserInput[]>([])
  const [inputVersion, setInputVersion] = useState(0)
  const [hasControl, setHasControl] = useState(false)
  const drawFrame = useCallback(async (blob: Blob) => {
    const bitmap = await createImageBitmap(blob)
    try { const target = canvas.current; if (!target) return; const context = target.getContext('2d'); if (!context) throw new Error('browserCanvasUnavailable'); if (target.width !== bitmap.width || target.height !== bitmap.height) { target.width = bitmap.width; target.height = bitmap.height } context.drawImage(bitmap, 0, 0) } finally { bitmap.close() }
  }, [])
  const [snapshot, send] = useMachine(browserCheckMachine, { input: { account, drawFrame } })
  const { view, hasFrame, pending, error } = snapshot.context
  const disconnected = snapshot.matches('disconnected')
  const phase = view?.phase
  const reconnecting = snapshot.matches('reconnecting')
  const starting = snapshot.matches('connecting')
  const inSession = snapshot.matches('session')
  const connected = hasFrame && inSession
  const stream = view?.stream ?? null
  const inputAllowed = snapshot.matches({ session: 'viewing' }) && hasFrame && view?.canInteract === true
  const keyboardAllowed = hasFrame && view?.canInteract === true && inSession
  const busy = reconnecting || starting || (inSession && !hasFrame)
  const label = disconnected ? 'Browser viewer could not connect' : busy ? 'Connecting to browser…' : phase ? phaseLabels[phase] : 'Connecting to browser…'

  useEffect(() => { dialog.current?.showModal(); const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous } }, [])
  useEffect(() => { if (snapshot.status === 'done') onClose() }, [snapshot.status, onClose])
  useEffect(() => { if (error) toast.error(errorTitles[error] ?? 'The browser operation failed', error) }, [error, snapshot.context.attempts])
  useEffect(() => { setHasControl(false) }, [view?.generation])
  const enqueue = (input: BrowserInput) => {
    if (!keyboardAllowed || queued.current.length >= 100) return
    const last = queued.current.at(-1)
    if (input.type === 'text' && last?.type === 'text' && last.text.length + input.text.length <= 2048) last.text += input.text
    else queued.current.push(input)
    setInputVersion((version) => version + 1)
  }
  useEffect(() => {
    if (!view?.canInteract) { queued.current = []; return }
    if (!inputAllowed || !queued.current.length) return
    const timer = setTimeout(() => { const input = queued.current.shift(); if (input) send({ type: 'INPUT', input }) }, queued.current[0].type === 'text' ? 120 : 0)
    return () => clearTimeout(timer)
  }, [inputAllowed, inputVersion, view?.canInteract, send])

  const pointAt = (event: React.MouseEvent<HTMLElement>, width: number, height: number) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: (event.clientX - rect.left) * width / rect.width, y: (event.clientY - rect.top) * height / rect.height } }
  const handlers = (width: () => number, height: () => number) => ({
    onClick: (event: React.MouseEvent<HTMLElement>) => { if (!inputAllowed) return; event.currentTarget.focus(); setHasControl(true); enqueue({ type: 'click', ...pointAt(event, width(), height()) }) },
    onWheel: (event: React.WheelEvent<HTMLElement>) => { if (!inputAllowed) return; enqueue({ type: 'scroll', deltaY: Math.max(-600, Math.min(600, event.deltaY)) }) },
    onPaste: (event: React.ClipboardEvent<HTMLElement>) => { if (!keyboardAllowed) return; setHasControl(true); event.preventDefault(); const value = event.clipboardData.getData('text'); if (value && value.length <= 2048) enqueue({ type: 'text', text: value }) },
    onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => { if (!keyboardAllowed || event.nativeEvent.isComposing || event.altKey || event.metaKey || event.ctrlKey) return; setHasControl(true); if (event.key.length === 1) { event.preventDefault(); enqueue({ type: 'text', text: event.key }) } else if ((browserKeys as readonly string[]).includes(event.key)) { event.preventDefault(); enqueue({ type: 'key', key: event.key }) } },
  })

  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); send({ type: 'CLOSE' }) }} className="m-auto max-h-[94dvh] w-[calc(100%-1rem)] max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 font-sans text-slate-900 shadow-xl backdrop:bg-[#0D2A4C]/45 backdrop:backdrop-blur-[2px]">
    <header className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5"><FontAwesomeIcon icon={faDesktop} className="size-5 shrink-0 text-[#2A8CFF]" /><h2 id={titleId} className="text-base font-semibold">{platformLabel}</h2><span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${connected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><span aria-hidden="true" className={`size-1.5 rounded-full ${connected ? 'animate-pulse bg-emerald-500 motion-reduce:animate-none' : 'bg-slate-400'}`} />{connected ? 'Live browser' : busy ? 'Connecting' : 'Not connected'}</span><span className="hidden truncate text-sm text-slate-500 sm:block">{account}</span></div>
        <button type="button" autoFocus onClick={() => send({ type: 'CLOSE' })} aria-label="Close browser view" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70"><FontAwesomeIcon icon={faXmark} className="size-4" /></button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div role="group" aria-label="Browser address" className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600">{view?.address ? <FontAwesomeIcon icon={faLock} className="size-3 shrink-0 text-slate-400" /> : null}<span className="truncate">{view?.address ?? 'Waiting for page…'}</span></div>
      </div>
    </header>
    <div role="status" aria-live="polite" className="sr-only">{label}{pending ? ', sending input' : ''}</div>
    <div className="relative m-4 flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:min-h-96">
      {stream ? <div className="relative w-full" style={{ aspectRatio: `${stream.page.width} / ${stream.page.height}` }}><iframe src={stream.url} title={`${account} browser stream`} className="absolute inset-0 size-full rounded-lg border-0" sandbox="allow-scripts allow-same-origin" /><div role="application" aria-label={`${account} browser. Click and type directly into the browser.`} tabIndex={hasFrame ? 0 : -1} className={`absolute inset-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${inputAllowed ? 'cursor-pointer' : 'cursor-default'}`} {...handlers(() => stream.page.width, () => stream.page.height)} /></div> : <canvas ref={canvas} width={1280} height={800} role="application" aria-label={`${account} browser. Click and type directly into the browser.`} tabIndex={hasFrame ? 0 : -1} className={`h-auto max-h-[60dvh] w-auto max-w-full outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${hasFrame ? '' : 'invisible'} ${inputAllowed ? 'cursor-pointer' : 'cursor-default'}`} {...handlers(() => canvas.current?.width ?? 1, () => canvas.current?.height ?? 1)} />}
      {inputAllowed && !busy && !hasControl ? <button type="button" onClick={() => { setHasControl(true); canvas.current?.focus() }} className="absolute left-1/2 top-5 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-blue-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-[#0D2A4C] shadow-md backdrop-blur-sm transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><FontAwesomeIcon icon={faArrowPointer} className="size-3.5 text-[#2A8CFF]" />Click to take control</button> : null}
      {!hasFrame || busy || disconnected || !inSession ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center" style={{ background: 'radial-gradient(at 50% 0%, #4FA6FF 0%, #2A8CFF 55%, #1F78F0 100%)' }}>{busy ? <FontAwesomeIcon icon={faSpinner} className="size-7 animate-spin text-white motion-reduce:animate-none" /> : <FontAwesomeIcon icon={faDesktop} className="size-8 text-white/80" />}{busy ? <LoadingLine active={busy} /> : null}<p className="text-base font-semibold text-white">{label}</p>{!busy && phase ? <p className="max-w-md text-sm leading-6 text-white/85">{phaseNotes[phase]}</p> : null}{disconnected || snapshot.matches('missing') ? <button type="button" onClick={() => send({ type: 'RECONNECT' })} className="mt-2 h-9 rounded-lg bg-white px-3 text-sm font-bold text-[#0D2A4C] shadow-[0_3px_0_#1A5FC8]">Try again</button> : null}</div> : null}
      {inSession && hasFrame && phase && phase !== 'signInRequired' ? <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0D2A4C]/85 px-3 py-1.5 text-xs font-semibold text-white">{phaseLabels[phase]} · {phaseNotes[phase]}</p> : null}
    </div>
  </dialog>
}
