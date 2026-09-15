import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Plus, RotateCw, X } from 'lucide-react'
import { Badge, Button, Select, useToast } from '@listeningkit/ui'
import { SOCIAL_ICONS, SocialBadge } from '../lib/social-icons'
import {
  buildBrandSystemPrompt,
  clearBrandAsync,
  getBrandAsync,
  indexBrandAsync,
  PROMPT_VERSION,
  removeSourceAsync,
  saveBrandAsync,
  type BrandEntity,
  type BrandFormality,
  type BrandOffering,
  type BrandVoiceExample,
} from '../lib/brand'
import { FormInput, LoadingLine } from './DashboardFormPrimitives'

const FORMALITY_OPTIONS: Array<{ value: BrandFormality; label: string }> = [
  { value: 'casual', label: 'Casual' },
  { value: 'professional', label: 'Professional' },
  { value: 'formal', label: 'Formal' },
]

const SOURCE_STATUS_COLOR = {
  indexed: 'success',
  pending: 'warning',
  failed: 'danger',
} as const

const globeIcon = SOCIAL_ICONS.find((icon) => icon.id === 'facebook')

/**
 * Dashboard home for the brand saved during onboarding — identity, voice
 * (+ the exact system prompt it compiles to), offerings, location, indexed
 * sources, and the reveal's intelligence. Reads through `GET /brand`, edits
 * round-trip `PUT /brand`, re-index runs `POST /brand/index`, reset clears
 * via `DELETE /brand`. The mock stays the source of truth throughout.
 */
export function DashboardBrand() {
  const { success, error: notifyError } = useToast()
  const [brand, setBrand] = useState<BrandEntity | null | undefined>(undefined)
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [indexing, setIndexing] = useState(false)
  const [copied, setCopied] = useState(false)

  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [tagline, setTagline] = useState('')
  const [tone, setTone] = useState('')
  const [formality, setFormality] = useState<BrandFormality>('professional')
  const [dos, setDos] = useState('')
  const [donts, setDonts] = useState('')
  const [examples, setExamples] = useState<BrandVoiceExample[]>([])
  const [offerings, setOfferings] = useState<BrandOffering[]>([])
  const [locationLabel, setLocationLabel] = useState('')
  const [radiusKm, setRadiusKm] = useState('10')

  useEffect(() => {
    let cancelled = false
    getBrandAsync()
      .then((record) => {
        if (!cancelled) setBrand(record)
      })
      .catch(() => {
        if (!cancelled) setBrand(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const prompt = useMemo(() => (brand ? buildBrandSystemPrompt(brand) : ''), [brand])

  function beginEdit(record: BrandEntity) {
    setName(record.identity.name)
    setWebsite(record.identity.website)
    setTagline(record.identity.tagline)
    setTone(record.voice.tone)
    setFormality(record.voice.formality)
    setDos(record.voice.dos.join('\n'))
    setDonts(record.voice.donts.join('\n'))
    setExamples(record.voice.examples.map((example) => ({ ...example })))
    setOfferings(record.offerings.map((offering) => ({ ...offering })))
    setLocationLabel(record.location.label)
    setRadiusKm(String(record.location.radiusKm))
    setEditing(true)
  }

  function linesOf(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }

  async function handleSave() {
    if (!brand || busy) return
    const radius = Math.min(200, Math.max(1, Math.round(Number(radiusKm) || 10)))
    setBusy(true)
    try {
      const next = await saveBrandAsync({
        identity: {
          ...brand.identity,
          name: name.trim() || brand.identity.name,
          website: website.trim() || brand.identity.website,
          tagline: tagline.trim(),
        },
        voice: {
          tone: tone.trim() || brand.voice.tone,
          formality,
          dos: linesOf(dos),
          donts: linesOf(donts),
          examples: examples.filter((example) => example.situation.trim() && example.reply.trim()),
        },
        offerings: offerings.filter((offering) => offering.name.trim()),
        location: {
          ...brand.location,
          label: locationLabel.trim(),
          radiusKm: radius,
        },
      })
      setBrand(next)
      setEditing(false)
      success('Brand updated', 'Drafts and replies will sound like you.')
    } catch (err: unknown) {
      notifyError('Could not save the brand', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function handleReset() {
    if (busy) return
    setBusy(true)
    try {
      await clearBrandAsync()
      setBrand(null)
      setEditing(false)
      success('Brand cleared', 'Onboarding will ask for it again.')
    } catch (err: unknown) {
      notifyError('Could not clear the brand', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  async function handleIndex() {
    if (indexing) return
    setIndexing(true)
    try {
      const next = await indexBrandAsync({ sitemap: true })
      setBrand(next)
      success('Site indexed', `${next.sources.length} pages ready to quote.`)
    } catch (err: unknown) {
      notifyError('Could not index the site', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIndexing(false)
    }
  }

  async function handleRemoveSource(url: string) {
    try {
      const next = await removeSourceAsync(url)
      setBrand(next)
    } catch (err: unknown) {
      notifyError('Could not remove the source', err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable on non-secure origins — non-fatal nicety.
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {globeIcon ? <SocialBadge icon={globeIcon} variant="blue" /> : null}
          <div>
            <h1 className="text-xl font-bold text-text-primary">Brand</h1>
            <p className="text-sm text-text-secondary">
              {brand === undefined
                ? 'Loading brand…'
                : brand === null
                  ? 'No brand saved yet — onboarding creates it.'
                  : `Listening for ${brand.identity.name} · prompt v${PROMPT_VERSION}.`}
            </p>
          </div>
        </div>
        {brand && !editing ? (
          <div className="flex items-center gap-2">
            <Button type="button" variant="blue" size="lg" shadow="hard" onClick={() => beginEdit(brand)}>
              Edit brand
            </Button>
            <Button type="button" variant="outline" size="lg" disabled={busy} onClick={handleReset}>
              Reset
            </Button>
          </div>
        ) : null}
      </div>

      {brand === undefined ? (
        <LoadingLine label="Loading the brand…" />
      ) : brand === null ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
          Nothing here yet —{' '}
          <Link to="/onboarding" className="font-semibold text-[#2A8CFF] hover:underline">
            run onboarding
          </Link>{' '}
          to pull your brand profile.
        </p>
      ) : editing ? (
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5">
          <SectionTitle>Identity</SectionTitle>
          <Field label="Brand name">
            <FormInput type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme Plumbing" autoComplete="off" />
          </Field>
          <Field label="Website">
            <FormInput type="text" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://acmeplumbing.com" autoComplete="off" />
          </Field>
          <Field label="Tagline">
            <FormInput type="text" value={tagline} onChange={(event) => setTagline(event.target.value)} placeholder="Heard across social" autoComplete="off" />
          </Field>

          <SectionTitle>Voice — what the agent is told</SectionTitle>
          <Field label="Tone">
            <FormInput type="text" value={tone} onChange={(event) => setTone(event.target.value)} placeholder="Friendly, plain-spoken local pro" autoComplete="off" />
          </Field>
          <Field label="Formality">
            <Select
              size="lg"
              value={formality}
              onChange={(value) => setFormality(value as BrandFormality)}
              aria-label="Voice formality"
              options={FORMALITY_OPTIONS}
            />
          </Field>
          <Field label="Dos — one rule per line">
            <textarea
              value={dos}
              onChange={(event) => setDos(event.target.value)}
              rows={3}
              placeholder={'Lead with the fix\nName the arrival window'}
              className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#2A8CFF] focus:outline-none"
            />
          </Field>
          <Field label="Don'ts — one rule per line">
            <textarea
              value={donts}
              onChange={(event) => setDonts(event.target.value)}
              rows={3}
              placeholder={'Never quote a price in a reply\nNever promise same-day'}
              className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-[#2A8CFF] focus:outline-none"
            />
          </Field>
          <Field label="Gold examples — replies the agent mimics">
            <ExampleEditor examples={examples} onChange={setExamples} />
          </Field>

          <SectionTitle>Offerings</SectionTitle>
          <OfferingEditor offerings={offerings} onChange={setOfferings} />

          <SectionTitle>Location</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px]">
            <Field label="Service area">
              <FormInput type="text" value={locationLabel} onChange={(event) => setLocationLabel(event.target.value)} placeholder="Galway, Ireland" autoComplete="off" />
            </Field>
            <Field label="Radius (km)">
              <FormInput type="number" min={1} value={radiusKm} onChange={(event) => setRadiusKm(event.target.value)} placeholder="10" />
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="blue" size="lg" shadow="hard" disabled={busy} onClick={handleSave}>
              {busy ? 'Saving…' : 'Save changes'}
            </Button>
            <Button type="button" variant="outline" size="lg" disabled={busy} onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-2xl bg-white p-5">
            <SectionTitle>Identity</SectionTitle>
            <p className="mt-1 text-2xl font-bold text-text-primary">{brand.identity.name}</p>
            <p className="mt-0.5 text-sm text-text-secondary">{brand.identity.tagline || 'No tagline yet.'}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <MetaRow term="Site" value={brand.identity.website || '—'} />
              <MetaRow term="Source" value={brand.sourceUrl || '—'} />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-5">
            <SectionTitle>Location</SectionTitle>
            <p className="mt-1 text-2xl font-bold text-text-primary">{brand.location.label || 'No area set'}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <MetaRow
                term="Pinpoint"
                value={`${brand.location.lat.toFixed(4)}, ${brand.location.lng.toFixed(4)} · ${brand.location.radiusKm} km radius`}
              />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-5">
            <SectionTitle>Voice</SectionTitle>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-text-primary">{brand.voice.tone}</span>
              <Badge variant="trigger" color="info">
                {FORMALITY_OPTIONS.find((option) => option.value === brand.voice.formality)?.label ?? brand.voice.formality}
              </Badge>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <MetaRow term="Do" value={brand.voice.dos.length > 0 ? brand.voice.dos.join(' · ') : '—'} />
              <MetaRow term="Never" value={brand.voice.donts.length > 0 ? brand.voice.donts.join(' · ') : '—'} />
              <MetaRow
                term="Examples"
                value={brand.voice.examples.length > 0 ? `${brand.voice.examples.length} gold replies` : '—'}
              />
            </dl>
          </section>

          <section className="rounded-2xl bg-white p-5">
            <SectionTitle>Offerings</SectionTitle>
            {brand.offerings.length === 0 ? (
              <p className="mt-1 text-sm text-text-secondary">None detected yet — add services so replies can quote them.</p>
            ) : (
              <dl className="mt-1 space-y-2 text-sm">
                {brand.offerings.map((offering) => (
                  <MetaRow key={offering.name} term={offering.name} value={offering.detail || '—'} />
                ))}
              </dl>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle>System prompt — exactly what the agent is told</SectionTitle>
              <Button type="button" variant="outline" size="lg" onClick={handleCopyPrompt}>
                <Copy aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
                {copied ? 'Copied' : `Copy v${PROMPT_VERSION}`}
              </Button>
            </div>
            <pre className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100">
              {prompt || 'No brand — the agent falls back to generic phrasing.'}
            </pre>
          </section>

          <section className="rounded-2xl bg-white p-5 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SectionTitle>Sources — indexed from your site</SectionTitle>
              <Button type="button" variant="blue" size="lg" shadow="hard" disabled={indexing} onClick={handleIndex}>
                <RotateCw aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
                {indexing ? 'Indexing…' : 'Re-index site'}
              </Button>
            </div>
            {brand.sources.length === 0 ? (
              <p className="mt-2 text-sm text-text-secondary">No pages indexed yet — run the indexer to quote real copy.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {brand.sources.map((page) => (
                  <li key={page.url} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                    <Badge variant="trigger" color={SOURCE_STATUS_COLOR[page.status]}>
                      {page.status}
                    </Badge>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-text-primary">{page.title}</span>
                      <span className="block truncate text-xs text-text-secondary">{page.url}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${page.title}`}
                      onClick={() => handleRemoveSource(page.url)}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-black/5 hover:text-text-primary"
                    >
                      <X size={14} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 lg:col-span-2">
            <SectionTitle>Intelligence</SectionTitle>
            <dl className="mt-1 space-y-2 text-sm">
              <MetaRow term="Keyword" value={brand.intelligence.selectedKeyword ?? '—'} />
              <MetaRow
                term="Competitors"
                value={brand.intelligence.competitors.length > 0 ? brand.intelligence.competitors.join(', ') : '—'}
              />
            </dl>
            <div className="mt-2 flex flex-col gap-1.5">
              {brand.intelligence.targetCommunities.length === 0 ? (
                <p className="text-sm text-text-secondary">No target communities yet.</p>
              ) : (
                brand.intelligence.targetCommunities.map((pick) => (
                  <p key={pick.id} className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">{pick.name}</span> · {pick.detail}
                  </p>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-wide text-[#2A8CFF]">{children}</p>
}

function MetaRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-text-secondary">{term}</dt>
      <dd className="min-w-0 truncate font-medium text-text-primary" title={value}>
        {value}
      </dd>
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

function OfferingEditor({
  offerings,
  onChange,
}: {
  offerings: BrandOffering[]
  onChange: (next: BrandOffering[]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {offerings.map((offering, index) => (
        <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <FormInput
            type="text"
            value={offering.name}
            onChange={(event) =>
              onChange(offerings.map((row, i) => (i === index ? { ...row, name: event.target.value } : row)))
            }
            placeholder="Service name"
            aria-label={`Offering ${index + 1} name`}
            autoComplete="off"
          />
          <FormInput
            type="text"
            value={offering.detail}
            onChange={(event) =>
              onChange(offerings.map((row, i) => (i === index ? { ...row, detail: event.target.value } : row)))
            }
            placeholder="One-line detail the agent quotes"
            aria-label={`Offering ${index + 1} detail`}
            autoComplete="off"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label={`Remove offering ${index + 1}`}
            onClick={() => onChange(offerings.filter((_, i) => i !== index))}
          >
            <X size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => onChange([...offerings, { name: '', detail: '' }])}
      >
        <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
        Add offering
      </Button>
    </div>
  )
}

function ExampleEditor({
  examples,
  onChange,
}: {
  examples: BrandVoiceExample[]
  onChange: (next: BrandVoiceExample[]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {examples.map((example, index) => (
        <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr_auto]">
          <FormInput
            type="text"
            value={example.situation}
            onChange={(event) =>
              onChange(examples.map((row, i) => (i === index ? { ...row, situation: event.target.value } : row)))
            }
            placeholder="question"
            aria-label={`Example ${index + 1} situation`}
            autoComplete="off"
          />
          <FormInput
            type="text"
            value={example.reply}
            onChange={(event) =>
              onChange(examples.map((row, i) => (i === index ? { ...row, reply: event.target.value } : row)))
            }
            placeholder="Gold reply the agent mimics"
            aria-label={`Example ${index + 1} reply`}
            autoComplete="off"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            aria-label={`Remove example ${index + 1}`}
            onClick={() => onChange(examples.filter((_, i) => i !== index))}
          >
            <X size={16} aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => onChange([...examples, { situation: '', reply: '' }])}
      >
        <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
        Add example
      </Button>
    </div>
  )
}
