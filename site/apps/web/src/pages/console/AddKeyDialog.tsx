import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faKey, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useMediaQuery } from '@/landing/useMediaQuery'

export type KeyProvider = { key: string; label: string; logo: string; meta: string }

const SLIDE = { type: 'spring', stiffness: 340, damping: 34, mass: 0.9 } as const
const SETTLE = { duration: 0.26, ease: [0.22, 1, 0.36, 1] } as const

export function AddKeyDialog({
  open,
  provider,
  providers,
  onClose,
  onSave,
}: {
  open: boolean
  provider: KeyProvider | null
  providers: KeyProvider[]
  onClose: () => void
  onSave?: (provider: string, secret: string) => Promise<void>
}) {
  const [chosen, setChosen] = useState<KeyProvider | null>(provider)
  const [secret, setSecret] = useState('')
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const field = useRef<HTMLInputElement>(null)
  const picker = useRef<HTMLButtonElement>(null)
  const desktop = useMediaQuery('(min-width: 640px)')

  useEffect(() => {
    if (!open) {
      setSecret('')
      return
    }
    setChosen(provider)
    setSecret('')
    setDone(false)
    setError('')
  }, [open, provider])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    if (chosen && !done) field.current?.focus()
    if (!chosen) picker.current?.focus()
  }, [open, chosen, done])

  async function submit() {
    if (!chosen || !secret.trim() || !onSave || saving) return
    setSaving(true)
    setError('')
    try {
      await onSave(chosen.key, secret.trim())
      setSecret('')
      setDone(true)
    } catch {
      setError('The key could not be saved. Try again when your workspace is connected.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="addKey"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[#0D2A4C]/45 backdrop-blur-[2px] sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={SETTLE}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-key-title"
            onMouseDown={(event) => event.stopPropagation()}
            initial={desktop ? { opacity: 0, scale: 0.94, filter: 'blur(12px)' } : { y: '100%' }}
            animate={desktop ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : { y: 0 }}
            exit={desktop ? { opacity: 0, scale: 0.96, filter: 'blur(10px)' } : { y: '100%' }}
            transition={desktop ? SETTLE : SLIDE}
            className="relative w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-[0_30px_60px_-20px_rgba(13,42,76,0.35)] sm:rounded-3xl"
          >
            <div className="px-5 pb-4 pt-5">
              <div className="flex items-start gap-3">
                {chosen ? (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5">
                    <img src={chosen.logo} alt="" className="size-full object-contain" />
                  </span>
                ) : (
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                    <FontAwesomeIcon icon={faKey} className="size-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h2 id="add-key-title" className="text-base font-bold leading-tight text-slate-900">
                    {done ? 'Key saved' : chosen ? `Add a ${chosen.label} key` : 'Add a key'}
                  </h2>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {done ? 'It stays in your workspace.' : onSave ? 'Stored in your workspace, never on ListeningKit’s servers.' : 'Connect workspace storage to save this API key.'}
                  </p>
                </div>
                <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                  <FontAwesomeIcon icon={faXmark} className="size-4" />
                </button>
              </div>
            </div>

            <div className="px-5 py-5">
              {done ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <FontAwesomeIcon icon={faCheck} className="size-5" />
                  </span>
                  <p className="text-sm font-semibold text-slate-900">{chosen?.label} is ready to call</p>
                  <p className="max-w-xs text-sm leading-6 text-slate-600">Your agent can use it now. Remove it any time from this page.</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-1 h-10 rounded-lg bg-[#2A8CFF] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1F6FE6]"
                  >
                    Close
                  </button>
                </div>
              ) : chosen ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="key-secret" className="mb-1.5 block text-xs font-bold text-slate-700">
                      {chosen.meta}
                    </label>
                    <input
                      id="key-secret"
                      ref={field}
                      type="password"
                      autoComplete="off"
                      value={secret}
                      onChange={(event) => setSecret(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') submit()
                      }}
                      placeholder="Paste your key"
                      className="h-10 w-full rounded-xl border border-slate-300 px-3 font-mono text-sm outline-none placeholder:font-sans placeholder:text-slate-400 focus:border-[#2A8CFF] focus:ring-2 focus:ring-[#2A8CFF]/20"
                    />
                    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">{onSave ? 'Sent straight to your workspace over the paired connection.' : 'Key saving is not connected yet. Your key will not be stored in this browser.'}</p>
                    {error ? <p role="alert" className="mt-2 text-xs text-red-600">{error}</p> : null}
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={onClose} className="h-10 rounded-lg px-3 text-sm font-bold text-slate-600 hover:bg-slate-100">
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submit}
                      disabled={!secret.trim() || !onSave || saving}
                      className="h-10 rounded-lg bg-[#2A8CFF] px-4 text-sm font-bold text-white transition-colors hover:bg-[#1F6FE6] disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      {saving ? 'Saving…' : onSave ? 'Save key' : 'Needs workspace'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {providers.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setChosen(item)}
                      className="flex w-full items-center gap-3 rounded-xl border-2 border-[#C3D3E8] px-3 py-2.5 text-left transition-colors hover:border-[#2A8CFF]"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-1.5">
                        <img src={item.logo} alt="" className="size-full object-contain" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-900">{item.label}</span>
                        <span className="block text-[11px] font-semibold text-slate-500">{item.meta}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
