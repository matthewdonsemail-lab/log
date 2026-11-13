import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash, faSpinner, faKey, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useMediaQuery } from '@/landing/useMediaQuery'
import { errorText } from '@/lib/controlApi'
import { readConnectionKeys, type ExtensionConnection } from './connectionsData'
import type { ConsoleTarget } from './consoleClient'
import { useToast } from '@listeningkit/ui'

export type KeyProvider = { key: string; label: string; logo: string; meta: string }
const slide = { type: 'spring', stiffness: 340, damping: 34, mass: 0.9 } as const
const settle = { duration: 0.26, ease: [0.22, 1, 0.36, 1] } as const

export function AddKeyDialog({ open, provider, providers, credentials, target, onClose, onSave }: {
  open: boolean; provider: KeyProvider | null; providers: KeyProvider[]; credentials: ExtensionConnection[]; target: ConsoleTarget | null; onClose: () => void; onSave?: (provider: string, values: Record<string, string>) => Promise<void>
}) {
  const [chosen, setChosen] = useState<KeyProvider | null>(provider)
  const [values, setValues] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLElement | null>(null)
  const desktop = useMediaQuery('(min-width: 640px)')
  const credential = credentials.find((item) => item.key === chosen?.key)
  const configured = credential?.state === 'configured'
  const fields = credential?.fields ?? []
  const complete = fields.every((field) => field.required === false || Boolean(values[field.id]?.trim()))
  const canSave = Boolean(onSave && fields.length && complete && !loading && !loadFailed)

  useEffect(() => { if (open) setChosen(provider) }, [open, provider])
  useEffect(() => {
    setValues({}); setVisible({}); setLoadFailed(false)
    if (!open || !chosen || !target || chosen.key !== 'adsPower') { setLoading(false); return }
    const controller = new AbortController()
    setLoading(true)
    readConnectionKeys(target, chosen.key, controller.signal).then((keys) => {
      if (controller.signal.aborted) return
      setValues(keys)
    }).catch((error) => {
      if (controller.signal.aborted) return
      setLoadFailed(true); toast.error('Could not load the saved settings', errorText(error))
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => { controller.abort() }
  }, [open, chosen?.key, target, toast.error])
  useEffect(() => {
    if (!open) return
    trigger.current = document.activeElement as HTMLElement | null
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous; trigger.current?.focus() }
  }, [open])
  useEffect(() => { if (open && !loading) panel.current?.querySelector<HTMLElement>('input:not(:disabled)')?.focus() }, [open, loading, chosen?.key])

  async function submit() {
    if (!chosen || !canSave || !onSave || saving) return
    setSaving(true)
    try {
      const submitted = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, value.trim()]).filter(([, value]) => value))
      await onSave(chosen.key, submitted)
      setValues({}); setVisible({}); onClose()
      toast.success(chosen.key === 'adsPower' ? 'AdsPower saved' : 'Key saved', chosen.key === 'adsPower' ? 'Your browser settings have been saved.' : 'Your provider accepted the key.')
    } catch (error) {
      toast.error('Key not saved', errorText(error))
    } finally { setSaving(false) }
  }

  return <AnimatePresence>{open ? <motion.div key="manageKey" className="fixed inset-0 z-[10001] flex items-end justify-center bg-[#0D2A4C]/45 backdrop-blur-[2px] sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={settle} onMouseDown={() => { if (!saving) onClose() }}>
    <motion.div ref={panel} role="dialog" aria-modal="true" aria-labelledby="manage-key-title" onMouseDown={(event) => event.stopPropagation()} onKeyDown={(event) => {
      if (event.key === 'Escape' && !saving) { event.stopPropagation(); onClose() }
      if (event.key === 'Tab') {
        const elements = [...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)') ?? [])].filter((element) => !element.hasAttribute('readonly'))
        const first = elements[0]; const last = elements[elements.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }} initial={desktop ? { opacity: 0, scale: 0.96 } : { y: '100%' }} animate={desktop ? { opacity: 1, scale: 1 } : { y: 0 }} exit={desktop ? { opacity: 0, scale: 0.96 } : { y: '100%' }} transition={desktop ? settle : slide} className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
      <div className="mb-6 flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5">{chosen?.logo ? <img src={chosen.logo} alt="" className="size-full object-contain" /> : <FontAwesomeIcon icon={faKey} className="size-5 text-[#2A8CFF]" />}</span><div className="min-w-0 flex-1"><h2 id="manage-key-title" className="text-lg font-bold text-slate-900">{chosen ? chosen.key === 'adsPower' ? `${configured ? 'Manage' : 'Add'} AdsPower` : `${configured ? 'Manage' : 'Add'} ${chosen.label} key` : 'Add a key'}</h2><p className="mt-1 text-sm text-slate-600">{target?.kind === 'hosted' ? 'Stored in your workspace.' : 'Stored in your local workspace.'}</p></div><button type="button" disabled={saving} onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"><FontAwesomeIcon icon={faXmark} className="size-4" /></button></div>
      {chosen ? <form aria-busy={saving || loading} onSubmit={(event) => { event.preventDefault(); void submit() }} className="space-y-5">
        {fields.map((field) => <div key={field.id}>
          <label htmlFor={`credential-${field.id}`} className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</label>
          {field.id === 'LOG_ADSPOWER_HOMES' ? <p className="mb-2 text-sm text-slate-500">Country codes separated by commas, such as US, CA. Enter all to allow every country.</p> : null}
          <div className="relative">
            <input id={`credential-${field.id}`} name={field.id} type={field.inputType === 'text' ? 'text' : field.inputType === 'url' ? 'url' : visible[field.id] ? 'text' : 'password'} autoComplete="off" autoCapitalize="none" spellCheck={false} required={field.required !== false} disabled={saving || loading || loadFailed} value={values[field.id] ?? ''} onChange={(event) => setValues((current) => ({ ...current, [field.id]: event.target.value }))} placeholder={field.inputType === 'text' ? 'US, CA' : field.inputType === 'url' ? 'http://local.adspower.net:50325' : field.masked ? `${field.masked} saved, paste a new key to replace it` : 'Paste your key'} className="h-11 w-full rounded-lg border border-slate-300 py-2 pl-3 pr-12 text-base outline-none placeholder:text-slate-400 focus:border-[#2A8CFF] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50" />
            {field.inputType !== 'url' && field.inputType !== 'text' ? <button type="button" disabled={saving || loading || loadFailed || !values[field.id]} aria-label={`${visible[field.id] ? 'Hide' : 'Show'} ${field.label}`} aria-pressed={Boolean(visible[field.id])} aria-controls={`credential-${field.id}`} onClick={() => setVisible((current) => ({ ...current, [field.id]: !current[field.id] }))} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 hover:text-[#2A8CFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-40"><FontAwesomeIcon icon={visible[field.id] ? faEyeSlash : faEye} className="size-4" /></button> : null}
          </div>
        </div>)}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" disabled={saving} onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">Cancel</button><button type="submit" disabled={!canSave || saving} className="inline-flex min-w-28 items-center justify-center gap-2 rounded-lg bg-[#2A8CFF] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-500">{saving ? <><FontAwesomeIcon icon={faSpinner} className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Checking…</> : chosen?.key === 'adsPower' ? 'Save settings' : 'Save key'}</button></div>
      </form> : <div className="space-y-2">{providers.map((item) => <button key={item.key} type="button" onClick={() => setChosen(item)} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"><img src={item.logo} alt="" className="size-8 object-contain" /><span className="text-sm font-semibold text-slate-900">{item.label}</span></button>)}</div>}
    </motion.div>
  </motion.div> : null}</AnimatePresence>
}
