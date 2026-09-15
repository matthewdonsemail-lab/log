import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Select, useToast } from '@listeningkit/ui'
import {
  saveBrandAsync,
  simulateOutbound,
  type Autoreply,
  type BrandChannel,
  type BrandEntity,
  type ChannelProfile,
  type ChannelStyle,
} from '../lib/brand'
import { DashboardFormSheet } from './DashboardFormSheet'
import { ChatBubble, FormInput, Toggle } from './DashboardFormPrimitives'

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
  const blank = (style: ChannelStyle): ChannelProfile => ({ style, examples: [], triage: [], autoreplies: [] })
  return { facebook: blank('casual'), x: blank('standard'), reddit: blank('standard') }
}

/** Deep copy for draft state — the form never mutates the saved record. */
function cloneProfile(profile: ChannelProfile): ChannelProfile {
  return {
    ...profile,
    examples: [...profile.examples],
    triage: [...profile.triage],
    autoreplies: profile.autoreplies.map((entry) => ({ ...entry })),
  }
}

/** Clean a draft profile for save: trim lines, drop empty base replies. */
function cleanProfile(profile: ChannelProfile): ChannelProfile {
  return {
    style: profile.style,
    examples: profile.examples.map((line) => line.trim()).filter(Boolean),
    triage: profile.triage.map((line) => line.trim()).filter(Boolean),
    autoreplies: profile.autoreplies
      .map((entry) => ({ ...entry, trigger: entry.trigger.trim(), reply: entry.reply.trim() }))
      .filter((entry) => entry.reply.length > 0),
  }
}

/** Stable ids for new rows — same recipe as the connections store. */
function newAutoreplyId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `autoreply-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
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
  const [testContext, setTestContext] = useState('')

  useEffect(() => {
    if (!open) return
    // Every open re-seeds from the saved record — discards are total, the
    // page's record is never touched until confirm.
    setStep(1)
    setBusy(false)
    setTestContext('')
    setName(initialBrand.identity.name)
    setWebsite(initialBrand.identity.website)
    setLocationLabel(initialBrand.location.label)
    setChannels({
      facebook: cloneProfile(initialBrand.channels.facebook),
      x: cloneProfile(initialBrand.channels.x),
      reddit: cloneProfile(initialBrand.channels.reddit),
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
        facebook: cleanProfile(channels.facebook),
        x: cleanProfile(channels.x),
        reddit: cleanProfile(channels.reddit),
      },
      memory: { rules: memoryRules.map((line) => line.trim()).filter(Boolean) },
    }),
    [initialBrand, name, channels, memoryRules]
  )

  const preview = testContext.trim() ? simulateOutbound(draftBrand, testChannel, testContext) : null

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
          <Field label={`Detected ${testChannel === 'x' ? 'X mention' : testChannel === 'reddit' ? 'Reddit comment' : 'lead context'}`}>
            <FormInput
              type="text"
              value={testContext}
              onChange={(event) => setTestContext(event.target.value)}
              placeholder="e.g. anyone know someone with a van in salthill to clear an old shed?"
              autoComplete="off"
            />
          </Field>
          {preview ? (
            <div className="flex flex-col items-end gap-1.5">
              <ChatBubble tone="outgoing">{preview.text}</ChatBubble>
              <p className="text-right text-xs text-text-secondary">
                {preview.matchedSource === 'autoreply'
                ? `Matched autoreply${preview.matchedTrigger ? ` · ${preview.matchedTrigger}` : ''}.`
                : preview.matchedSource === 'example'
                  ? 'Matched a gold example.'
                  : 'Style fallback — add a closer snippet.'}
              </p>
            </div>
          ) : (
            <p className="rounded-xl bg-black/5 p-4 text-sm text-text-secondary">
              Paste the detected post / lead above to hear this first-touch draft.
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
          placeholder="e.g. hey, saw you're after a shed clear — we're out your way thursday, want a spot?"
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
      <Field label="Auto-replies — base lines that send when toggled on">
        <AutorepliesEditor
          rows={profile.autoreplies}
          onChange={(autoreplies) => onChange({ autoreplies })}
        />
      </Field>
    </>
  )
}

function AutorepliesEditor({
  rows,
  onChange,
}: {
  rows: Autoreply[]
  onChange: (next: Autoreply[]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, index) => (
        <div key={row.id} className="flex flex-col gap-2 rounded-xl bg-black/[0.03] p-3">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <FormInput
                type="text"
                value={row.trigger}
                onChange={(event) =>
                  onChange(rows.map((entry, i) => (i === index ? { ...entry, trigger: event.target.value } : entry)))
                }
                placeholder="e.g. same-day quote request"
                aria-label={`Autoreply ${index + 1} trigger`}
                autoComplete="off"
              />
            </div>
            <Toggle
              checked={row.enabled}
              onChange={(enabled) =>
                onChange(rows.map((entry, i) => (i === index ? { ...entry, enabled } : entry)))
              }
              label={`Autoreply ${index + 1} enabled`}
            />
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label={`Remove autoreply ${index + 1}`}
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          </div>
          <FormInput
            type="text"
            value={row.reply}
            onChange={(event) =>
              onChange(rows.map((entry, i) => (i === index ? { ...entry, reply: event.target.value } : entry)))
            }
            placeholder="e.g. hey, saw you're after a shed clear — we're out your way thursday, want a spot?"
            aria-label={`Autoreply ${index + 1} reply`}
            autoComplete="off"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="dashed"
        size="lg"
        className="self-start px-3"
        onClick={() => onChange([...rows, { id: newAutoreplyId(), trigger: '', reply: '', enabled: true }])}
      >
        <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
        Add autoreply
      </Button>
    </div>
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
            <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-semibold text-text-secondary">
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
      <Button
        type="button"
        variant="dashed"
        size="lg"
        className="self-start px-3"
        onClick={() => onChange([...rows, ''])}
      >
        <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
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
