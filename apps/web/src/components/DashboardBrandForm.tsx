import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Select, useToast } from '@listeningkit/ui'
import {
  saveBrandAsync,
  simulateReply,
  type BrandChannel,
  type BrandEntity,
  type ChannelProfile,
  type ChannelStyle,
} from '../lib/brand'
import { DashboardFormSheet } from './DashboardFormSheet'
import { ChatBubble, FormInput } from './DashboardFormPrimitives'

/** Form scope — one namespace per open. The page's per-tab Edit buttons set it. */
export type BrandNamespace = 'business' | 'facebook' | 'memory' | 'x' | 'reddit'

const NAMESPACE_META: Record<BrandNamespace, { title: string; subtitle: string; stepHint: string }> = {
  business: {
    title: 'Business',
    subtitle: 'Who the agent speaks as and where it operates.',
    stepHint: 'Name, site, and service area.',
  },
  facebook: {
    title: 'Facebook cadence',
    subtitle: 'How the agent texts on Marketplace and Groups.',
    stepHint: 'Style, raw snippets, then the triage flow.',
  },
  memory: {
    title: 'Agent memory',
    subtitle: 'Working facts the agent keeps in mind on every reply.',
    stepHint: 'One fact per line — pricing, boundaries, jobs taken and declined.',
  },
  x: {
    title: 'X replies',
    subtitle: 'Quick, sharp one-liners. In and out.',
    stepHint: 'Style plus raw snippets that sound like you.',
  },
  reddit: {
    title: 'Reddit replies',
    subtitle: 'Helpful community member with technical context.',
    stepHint: 'Style plus raw snippets that answer, not pitch.',
  },
}

function blankChannels(): Record<BrandChannel, ChannelProfile> {
  const blank = (style: ChannelStyle): ChannelProfile => ({ style, examples: [], triage: [] })
  return { facebook: blank('casual'), x: blank('standard'), reddit: blank('standard') }
}

/**
 * Brand configuration form. Lives in the layout overlay through
 * `DashboardFormSlot` — never inline on the page. Opens pre-scoped to one
 * namespace; step 1 edits the section fields, step 2 previews the Test-it
 * simulator against the unsaved draft, and the confirm saves through
 * `PUT /brand`. Selecting a style only marks it — Continue advances.
 */
export function DashboardBrandForm({
  open,
  onClose,
  onSaved,
  initialBrand,
  initialNamespace,
}: {
  open: boolean
  onClose: () => void
  /** Fires after a successful save so the parent page can reconcile. */
  onSaved: () => void
  /** The saved record to pre-fill from; the form never mutates it directly. */
  initialBrand: BrandEntity
  /** Which namespace this open edits. */
  initialNamespace: BrandNamespace
}) {
  const { success, error: notifyError } = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [busy, setBusy] = useState(false)

  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [locationLabel, setLocationLabel] = useState('')
  const [channels, setChannels] = useState<Record<BrandChannel, ChannelProfile>>(blankChannels)
  const [memoryRules, setMemoryRules] = useState<string[]>([])
  const [testInbound, setTestInbound] = useState('')

  useEffect(() => {
    if (!open) return
    // Every open re-seeds from the saved record — discards are total, the
    // page's record is never touched until confirm.
    setStep(1)
    setBusy(false)
    setTestInbound('')
    setName(initialBrand.identity.name)
    setWebsite(initialBrand.identity.website)
    setLocationLabel(initialBrand.location.label)
    setChannels({
      facebook: { ...initialBrand.channels.facebook, examples: [...initialBrand.channels.facebook.examples], triage: [...initialBrand.channels.facebook.triage] },
      x: { ...initialBrand.channels.x, examples: [...initialBrand.channels.x.examples], triage: [...initialBrand.channels.x.triage] },
      reddit: { ...initialBrand.channels.reddit, examples: [...initialBrand.channels.reddit.examples], triage: [...initialBrand.channels.reddit.triage] },
    })
    setMemoryRules([...initialBrand.memory.rules])
  }, [open, initialBrand, initialNamespace])

  const meta = NAMESPACE_META[initialNamespace]
  // The simulator previews the channel this namespace configures; business
  // and memory edits preview as Messenger since they shape every reply.
  const testChannel: BrandChannel =
    initialNamespace === 'x' ? 'x' : initialNamespace === 'reddit' ? 'reddit' : 'facebook'

  // Draft record for the test step — the unsaved channels over the saved
  // brand, so the preview hears edits before they commit.
  const draftBrand: BrandEntity = useMemo(
    () => ({
      ...initialBrand,
      identity: { ...initialBrand.identity, name: name.trim() || initialBrand.identity.name },
      channels: {
        facebook: {
          style: channels.facebook.style,
          examples: channels.facebook.examples.map((line) => line.trim()).filter(Boolean),
          triage: channels.facebook.triage.map((line) => line.trim()).filter(Boolean),
        },
        x: {
          style: channels.x.style,
          examples: channels.x.examples.map((line) => line.trim()).filter(Boolean),
          triage: channels.x.triage.map((line) => line.trim()).filter(Boolean),
        },
        reddit: {
          style: channels.reddit.style,
          examples: channels.reddit.examples.map((line) => line.trim()).filter(Boolean),
          triage: channels.reddit.triage.map((line) => line.trim()).filter(Boolean),
        },
      },
      memory: { rules: memoryRules.map((line) => line.trim()).filter(Boolean) },
    }),
    [initialBrand, name, channels, memoryRules]
  )

  const preview = testInbound.trim() ? simulateReply(draftBrand, testChannel, testInbound) : null

  function patchChannel(channel: BrandChannel, patch: Partial<ChannelProfile>) {
    setChannels((prev) => ({ ...prev, [channel]: { ...prev[channel], ...patch } }))
  }

  function back() {
    setStep(1)
  }

  function continueToTest() {
    if (busy) return
    setStep(2)
  }

  async function confirm() {
    if (busy) return
    if (step === 1) {
      continueToTest()
      return
    }
    setBusy(true)
    try {
      await saveBrandAsync({
        identity: {
          ...initialBrand.identity,
          name: name.trim() || initialBrand.identity.name,
          website: website.trim() || initialBrand.identity.website,
        },
        location: { ...initialBrand.location, label: locationLabel.trim() },
        channels: draftBrand.channels,
        memory: draftBrand.memory,
      })
      success('Brand updated', 'The agent texts and remembers like this now.')
      onSaved()
      onClose()
    } catch (err: unknown) {
      notifyError('Could not save the brand', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardFormSheet
      open={open}
      title={meta.title}
      subtitle={meta.subtitle}
      step={step}
      stepCount={2}
      stepHint={step === 1 ? meta.stepHint : 'Hear the unsaved draft before it commits.'}
      busy={busy}
      confirmLabel={step === 1 ? 'Continue' : 'Save changes'}
      onConfirm={confirm}
      onBack={back}
      backDisabled={step === 1}
      onClose={onClose}
    >
      {step === 1 ? (
        <div className="flex flex-col gap-4">
          {initialNamespace === 'business' ? (
            <>
              <Field label="Business name">
                <FormInput type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme Rubbish" autoComplete="off" />
              </Field>
              <Field label="Website">
                <FormInput type="text" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://acmerubbish.ie" autoComplete="off" />
              </Field>
              <Field label="Service area">
                <FormInput type="text" value={locationLabel} onChange={(event) => setLocationLabel(event.target.value)} placeholder="Galway, Ireland" autoComplete="off" />
              </Field>
            </>
          ) : null}

          {initialNamespace === 'facebook' || initialNamespace === 'x' || initialNamespace === 'reddit' ? (
            <ChannelFields
              channel={initialNamespace}
              profile={channels[initialNamespace]}
              showTriage={initialNamespace === 'facebook'}
              onChange={(patch) => patchChannel(initialNamespace, patch)}
            />
          ) : null}

          {initialNamespace === 'memory' ? (
            <Field label="Working facts — one per line">
              <StringListEditor
                rows={memoryRules}
                onChange={setMemoryRules}
                placeholder="e.g. minimum callout is €60"
                itemLabel="rule"
                addLabel="Add rule"
              />
            </Field>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Field label={`Inbound ${testChannel === 'x' ? 'X mention' : testChannel === 'reddit' ? 'Reddit comment' : 'buyer message'}`}>
            <FormInput
              type="text"
              value={testInbound}
              onChange={(event) => setTestInbound(event.target.value)}
              placeholder="e.g. is this still available and can you do 40?"
              autoComplete="off"
            />
          </Field>
          {preview ? (
            <div className="flex flex-col items-start gap-1.5">
              <ChatBubble tone="outgoing">{preview.text}</ChatBubble>
              <p className="text-xs text-text-secondary">
                {preview.matched ? 'Matched a gold example.' : 'Style fallback — add a closer snippet.'}
              </p>
            </div>
          ) : (
            <p className="rounded-xl bg-black/5 p-4 text-sm text-text-secondary">
              Type an inbound message above to hear this draft reply.
            </p>
          )}
        </div>
      )}
    </DashboardFormSheet>
  )
}

function ChannelFields({
  channel,
  profile,
  showTriage,
  onChange,
}: {
  channel: BrandChannel
  profile: ChannelProfile
  showTriage: boolean
  onChange: (patch: Partial<ChannelProfile>) => void
}) {
  return (
    <>
      <Field label="Communication style">
        <Select
          size="lg"
          value={profile.style}
          onChange={(value) => onChange({ style: value as ChannelStyle })}
          aria-label={`${channel} communication style`}
          options={[
            { value: 'casual', label: 'Natural casual' },
            { value: 'standard', label: 'Standard' },
          ]}
        />
      </Field>
      <Field label="How we actually text — raw snippets">
        <StringListEditor
          rows={profile.examples}
          onChange={(examples) => onChange({ examples })}
          placeholder="e.g. yeah still got it mate, when can you collect?"
          itemLabel="snippet"
          addLabel="Add snippet"
        />
      </Field>
      {showTriage ? (
        <Field label="Messenger triage flow — in order">
          <StringListEditor
            rows={profile.triage}
            onChange={(triage) => onChange({ triage })}
            placeholder="e.g. ask for their eircode"
            itemLabel="step"
            addLabel="Add step"
            numbered
          />
        </Field>
      ) : null}
    </>
  )
}

function StringListEditor({
  rows,
  onChange,
  placeholder,
  itemLabel,
  addLabel,
  numbered = false,
}: {
  rows: string[]
  onChange: (next: string[]) => void
  placeholder: string
  itemLabel: string
  addLabel: string
  numbered?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          {numbered ? (
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2A8CFF]/10 text-xs font-bold text-[#2A8CFF]">
              {index + 1}
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <FormInput
              type="text"
              value={row}
              onChange={(event) => onChange(rows.map((line, i) => (i === index ? event.target.value : line)))}
              placeholder={placeholder}
              aria-label={`${itemLabel} ${index + 1}`}
              autoComplete="off"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label={`Remove ${itemLabel} ${index + 1}`}
            onClick={() => onChange(rows.filter((_, i) => i !== index))}
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="lg" onClick={() => onChange([...rows, ''])}>
        <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
        {addLabel}
      </Button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  )
}
