import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { SectionHeading } from './ConsoleLayout'

const fieldClass = 'h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 outline-none focus:border-[#2A8CFF] focus:ring-2 focus:ring-blue-100'
const tabs = [{ id: 'password', label: 'Change password' }, { id: 'delete', label: 'Delete account' }] as const
type SettingsTab = typeof tabs[number]['id']

function PasswordSettings() {
  const id = useId()
  const [notice, setNotice] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const confirmation = form.elements.namedItem('confirmPassword') as HTMLInputElement
    if (data.get('newPassword') !== data.get('confirmPassword')) {
      confirmation.setCustomValidity('Your passwords do not match.')
      confirmation.reportValidity()
      return
    }
    form.reset()
    setNotice('Password changes are not available yet. Your password has not changed.')
  }
  return <div className="max-w-md">
    <h2 className="text-lg font-semibold text-[#0D2A4C]">Change password</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Update the password for your account.</p>
    <form onSubmit={submit} className="mt-6 space-y-5">
      {[{ name: 'currentPassword', label: 'Current password', autoComplete: 'current-password' }, { name: 'newPassword', label: 'New password', autoComplete: 'new-password' }, { name: 'confirmPassword', label: 'Confirm new password', autoComplete: 'new-password' }].map((field) => <div key={field.name}>
        <label htmlFor={`${id}-${field.name}`} className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</label>
        <input id={`${id}-${field.name}`} name={field.name} type="password" autoComplete={field.autoComplete} required className={fieldClass} onInput={(event) => { (event.currentTarget.form?.elements.namedItem('confirmPassword') as HTMLInputElement | null)?.setCustomValidity(''); setNotice('') }} />
      </div>)}
      <button type="submit" className="rounded-lg bg-[#2A8CFF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">Update password</button>
      {notice ? <p role="status" className="text-sm leading-6 text-slate-600">{notice}</p> : null}
    </form>
  </div>
}

function DeleteAccountSettings() {
  const id = useId()
  const [confirmation, setConfirmation] = useState('')
  const [notice, setNotice] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (confirmation !== 'DELETE') return
    setConfirmation('')
    setNotice('Account deletion is not available yet. Your account has not been deleted.')
  }
  return <div className="max-w-md">
    <h2 className="text-lg font-semibold text-[#0D2A4C]">Delete account</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">Permanently delete your ListeningKit account. This action cannot be undone.</p>
    <form onSubmit={submit} className="mt-6 space-y-5">
      <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">Type DELETE to confirm</label><input id={id} name="confirmation" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setNotice('') }} autoComplete="off" spellCheck={false} required pattern="DELETE" className={fieldClass} /></div>
      <button type="submit" disabled={confirmation !== 'DELETE'} className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-50">Delete account</button>
      {notice ? <p role="status" className="text-sm leading-6 text-slate-600">{notice}</p> : null}
    </form>
  </div>
}

export function AccountSettings() {
  const [tab, setTab] = useState<SettingsTab>('password')
  const id = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = (index + 1) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return
    event.preventDefault()
    setTab(tabs[next].id)
    tabRefs.current[next]?.focus()
  }
  return <section className="mb-10">
    <SectionHeading title="Account" />
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div role="tablist" aria-label="Account settings" className="flex gap-5 border-b border-slate-200 px-5 sm:px-6">{tabs.map((item, index) => <button key={item.id} ref={(node) => { tabRefs.current[index] = node }} id={`${id}-${item.id}`} type="button" role="tab" aria-selected={tab === item.id} aria-controls={`${id}-panel`} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={(event) => navigate(event, index)} className={`border-b-2 px-1 py-4 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-300 ${tab === item.id ? 'border-[#2A8CFF] text-[#2A8CFF]' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>{item.label}</button>)}</div>
      <section id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} tabIndex={0} className="p-5 outline-none sm:p-6">{tab === 'password' ? <PasswordSettings /> : <DeleteAccountSettings />}</section>
    </div>
  </section>
}
