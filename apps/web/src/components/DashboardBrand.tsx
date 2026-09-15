// apps/web/src/components/DashboardBrand.tsx
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Brain, Globe, MapPin, Pencil, RotateCcw } from 'lucide-react'
import { Button, Select, useSquircleClip, useToast } from '@listeningkit/ui'
import { SOCIAL_ICONS, SocialGlyph, type SocialIcon } from '../lib/social-icons'
import {
  clearBrandAsync,
  getBrandAsync,
  saveBrandAsync,
  simulateOutbound,
  type BrandChannel,
  type BrandEntity,
  type ChannelProfile,
  type ChannelStyle,
} from '../lib/brand'
import { ChatBubble, FormInput, LoadingLine } from './DashboardFormPrimitives'
import { RedditThread } from './cards/RedditThread'
import { TwitterThreads, TwitterThreadReply } from './cards/TwitterThreads'
import { DashboardTab } from './DashboardTab'
import { useDashboardFormSlot } from './DashboardFormSlot'
import { DashboardBrandForm, type BrandNamespace } from './DashboardBrandForm'

type BrandTab = 'facebook' | 'memory' | 'x' | 'reddit'

const TAB_CHANNEL: Record<BrandTab, BrandChannel> = {
  facebook: 'facebook',
  memory: 'facebook',
  x: 'x',
  reddit: 'reddit',
}

/** Page section card: r20 squircle, white — the Analytics card recipe. */
function BrandSurface({ children, className = '' }: { children: ReactNode; className?: string }) {
  const clip = useSquircleClip<HTMLElement>(20)
  return (
    <section ref={clip.ref} style={clip.style} className={`bg-white p-5 ${className}`}>
      {children}
    </section>
  )
}

/**
 * The agent's communication brain & memory hub — read-only display. All
 * configuration lives in `DashboardBrandForm`, registered into the layout
 * overlay through `DashboardFormSlot`; the page opens it pre-scoped to the
 * tab being edited and reloads on save. The Live simulator previews the
 * saved record only — drafts are heard inside the form before they commit.
 */
export function DashboardBrand() {
  const { success, error: notifyError } = useToast()
  const [brand, setBrand] = useState<BrandEntity | null | undefined>(undefined)
  const [tab, setTab] = useState<BrandTab>('facebook')
  const [busy, setBusy] = useState(false)
  // Form scope: which namespace the overlay form edits; null means closed.
  const [formNamespace, setFormNamespace] = useState<BrandNamespace | null>(null)

  const [leadContext, setLeadContext] = useState('')
  const [simulated, setSimulated] = useState(false)
  const [styleBusy, setStyleBusy] = useState(false)

  async function changeStyle(channel: BrandChannel, style: ChannelStyle) {
    if (!brand || busy || styleBusy) return
    setStyleBusy(true)
    try {
      const next = await saveBrandAsync({
        channels: { ...brand.channels, [channel]: { ...brand.channels[channel], style } },
      })
      setBrand(next)
    } catch (err: unknown) {
      notifyError('Could not update the tone', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setStyleBusy(false)
    }
  }

  const load = useCallback(() => {
    getBrandAsync()
      .then(setBrand)
      .catch(() => setBrand(null))
  }, [])

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

  // The form lives in the layout overlay, not in the page: register it
  // when open, clear it when closed or when the page unmounts.
  const setFormSlot = useDashboardFormSlot()
  useEffect(() => {
    if (!formNamespace || !brand) {
      setFormSlot(null)
      return
    }
    setFormSlot(
      <DashboardBrandForm
        open
        onClose={() => setFormNamespace(null)}
        onSaved={load}
        initialBrand={brand}
        initialNamespace={formNamespace}
      />
    )
    return () => setFormSlot(null)
  }, [formNamespace, brand, load, setFormSlot])

  // Simulator follows the active tab and always reads the saved record.
  const simChannel = TAB_CHANNEL[tab]
  const preview = useMemo(
    () => (brand && leadContext.trim() ? simulateOutbound(brand, simChannel, leadContext) : null),
    [brand, simChannel, leadContext]
  )

  async function handleReset() {
    if (busy) return
    setBusy(true)
    try {
      await clearBrandAsync()
      setBrand(null)
      setFormNamespace(null)
      success('Brand cleared', 'Onboarding will ask for it again.')
    } catch (err: unknown) {
      notifyError('Could not clear the brand', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const fbIcon = SOCIAL_ICONS.find((icon) => icon.id === 'facebook') as SocialIcon
  const xIcon = SOCIAL_ICONS.find((icon) => icon.id === 'x') as SocialIcon
  const rdIcon = SOCIAL_ICONS.find((icon) => icon.id === 'reddit') as SocialIcon

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Brand</h1>
          <p className="text-sm text-text-secondary">
            {brand
              ? `The agent's communication brain & memory hub for ${brand.identity.name}.`
              : 'Configure how your agent reaches out to leads and what it remembers.'}
          </p>
        </div>
        {brand ? (
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="lg" onClick={() => setFormNamespace('business')}>
              <Pencil aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
              Edit business
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={busy}
              onClick={handleReset}
              title="Clear brand data"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
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
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-black/[0.03] px-4 py-2.5 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">{brand.identity.name}</span>
            {brand.identity.website ? (
              <span className="flex items-center gap-1">
                <Globe aria-hidden="true" className="size-3.5" />
                {brand.identity.website}
              </span>
            ) : null}
            {brand.location.label ? (
              <span className="flex items-center gap-1">
                <MapPin aria-hidden="true" className="size-3.5" />
                {brand.location.label}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <DashboardTab
              label="Facebook"
              icon={<SocialGlyph icon={fbIcon} className="size-4" />}
              active={tab === 'facebook'}
              onClick={() => setTab('facebook')}
            />
            <DashboardTab
              label="X"
              icon={<SocialGlyph icon={xIcon} className="size-4" />}
              active={tab === 'x'}
              onClick={() => setTab('x')}
              accent="sky"
            />
            <DashboardTab
              label="Reddit"
              icon={<SocialGlyph icon={rdIcon} className="size-4" />}
              active={tab === 'reddit'}
              onClick={() => setTab('reddit')}
              accent="red"
            />
            <DashboardTab
              label="Agent Memory"
              icon={<Brain aria-hidden="true" className="size-4" />}
              active={tab === 'memory'}
              onClick={() => setTab('memory')}
              accent="amber"
            />
          </div>

          {tab === 'facebook' ? (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="flex flex-col lg:col-span-3">
                <BrandSurface>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-text-primary">Messenger Cadence</h2>
                      <p className="text-xs text-text-secondary">
                        How the agent texts leads on Marketplace and Facebook Groups.
                      </p>
                    </div>
                    <EditButton label="Edit Facebook" onClick={() => setFormNamespace('facebook')} />
                  </div>

                  <StyleRow
                      style={brand.channels.facebook.style}
                      disabled={busy || styleBusy}
                      onChange={(style) => changeStyle('facebook', style)}
                    />

                  <h3 className="mt-4 text-sm font-semibold text-text-primary">
                    How we actually text
                  </h3>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    Real conversational fragments. No formal sign-offs or canned corporate lines.
                  </p>
                  <GoldExamples profile={brand.channels.facebook} />

                  <h3 className="mt-4 text-sm font-semibold text-text-primary">Triage flow</h3>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    What the agent pushes to qualify the deal before booking.
                  </p>
                  {brand.channels.facebook.triage.length > 0 ? (
                    <ol className="mt-2 flex flex-col gap-1.5">
                      {brand.channels.facebook.triage.map((step, index) => (
                        <li
                          key={step}
                          className="flex items-center gap-2.5 rounded-lg bg-black/[0.03] px-3 py-2 text-sm text-text-primary"
                        >
                          <span
                            aria-hidden="true"
                            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-semibold text-text-secondary"
                          >
                            {index + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="mt-2 rounded-xl bg-black/5 p-4 text-sm text-text-secondary">
                      No triage flow yet — e.g. ask for photos of the job, then lock in a pickup time.
                    </p>
                  )}
                </BrandSurface>
              </div>

              <div className="lg:col-span-2">
                <BrandSurface className="sticky top-6">
                  <h2 className="text-base font-bold text-text-primary">Live simulator</h2>
                  <p className="text-xs text-text-secondary">
                    Paste the detected post / lead context — the blue bubble is the first-touch
                    outbound message the agent sends.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <FormInput
                        type="text"
                        shape="rounded-md"
                        value={leadContext}
                        onChange={(event) => {
                          setLeadContext(event.target.value)
                          setSimulated(true)
                        }}
                        placeholder="e.g. anyone know someone with a van in salthill to clear an old shed?"
                        aria-label="Detected post / lead context"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  {leadContext.trim() ? (
                    <div className="mt-3 flex justify-start">
                      <ChatBubble tone="quote">{leadContext}</ChatBubble>
                    </div>
                  ) : null}
                  {simulated && preview ? (
                    <div className="mt-1.5 flex flex-col items-end gap-1">
                      <ChatBubble tone="outgoing">{preview.text}</ChatBubble>
                      <p className="text-[11px] text-text-secondary">
                        {preview.matched ? 'Matched a gold example' : 'No close example — style fallback'}
                      </p>
                    </div>
                  ) : null}
                </BrandSurface>
              </div>
            </div>
          ) : null}

          {tab === 'memory' ? (
            <BrandSurface>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-text-primary">Working facts</h2>
                  <p className="text-xs text-text-secondary">
                    What the agent remembers on every reply — pricing baselines, boundaries, jobs
                    taken and declined.
                  </p>
                </div>
                <EditButton label="Edit memory" onClick={() => setFormNamespace('memory')} />
              </div>
              {brand.memory.rules.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {brand.memory.rules.map((rule) => (
                    <li
                      key={rule}
                      className="flex items-start gap-2.5 rounded-xl bg-black/[0.03] px-3 py-2.5 text-sm text-text-primary"
                    >
                      <ArrowRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-text-secondary" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-xl bg-black/5 p-4 text-sm text-text-secondary">
                  No working facts yet — open the memory form and add the lines the agent must never
                  forget.
                </p>
              )}
            </BrandSurface>
          ) : null}

          {(tab === 'x' || tab === 'reddit') ? (
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="flex flex-col lg:col-span-3">
                <BrandSurface>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-text-primary">
                        {tab === 'x' ? 'X replies' : 'Reddit replies'}
                      </h2>
                      <p className="text-xs text-text-secondary">
                        {tab === 'x'
                          ? 'Quick, sharp one-liners. In and out.'
                          : 'Helpful community member with technical context — answers the question, skips the pitch.'}
                      </p>
                    </div>
                    <EditButton
                      label={tab === 'x' ? 'Edit X' : 'Edit Reddit'}
                      onClick={() => setFormNamespace(tab)}
                    />
                  </div>

                  <StyleRow
                      style={brand.channels[tab].style}
                      disabled={busy || styleBusy}
                      onChange={(style) => changeStyle(tab, style)}
                    />

                  <h3 className="mt-4 text-sm font-semibold text-text-primary">How we actually text</h3>
                  <GoldExamples profile={brand.channels[tab]} />
                </BrandSurface>
              </div>

              <div className="lg:col-span-2">
                <BrandSurface className="sticky top-6">
                  <div className="mt-4 rounded-xl bg-[#2A8CFF] p-4">
                    <h2 className="text-base font-bold text-white">Live simulator</h2>
                    <p className="text-xs text-white/70">
                      {tab === 'reddit'
                        ? 'Type the agent’s reply — it renders as the blue ListeningKit Agent comment in the thread.'
                        : 'Type the agent’s reply — it threads below the opening post.'}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <FormInput
                          type="text"
                          shape="rounded-md"
value={leadContext}
                           onChange={(event) => {
                             setLeadContext(event.target.value)
                             setSimulated(true)
                           }}
                          placeholder={
                            tab === 'reddit'
                              ? 'e.g. good flag — the ban usually comes from the login fingerprint…'
                              : 'e.g. Hey! We do same-day quotes — usually someone’s out within 48h…'
                          }
                          aria-label="Agent reply preview"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                  </div>
                  {tab === 'reddit' ? (
                    <div className="mt-3">
                      <RedditThread reply={leadContext} />
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-col">
                      <TwitterThreads />
                      <div className="w-full overflow-hidden rounded-xl bg-white">
                        <TwitterThreadReply reply={leadContext} />
                      </div>
                    </div>
                  )}
                </BrandSurface>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="lg" onClick={onClick}>
      <Pencil aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
      {label}
    </Button>
  )
}

/** Tone readout: eyebrow label plus a live Select bound to the saved style. */
function StyleRow({
  style,
  disabled,
  onChange,
}: {
  style: ChannelStyle
  disabled: boolean
  onChange: (style: ChannelStyle) => void
}) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Tone
        </span>
        <Select
          size="sm"
          value={style}
          disabled={disabled}
          onChange={(value) => onChange(value as ChannelStyle)}
          options={[
            { value: 'casual', label: 'Natural casual' },
            { value: 'standard', label: 'Standard' },
          ]}
        />
      </div>
    </div>
  )
}

/**
 * Gold examples are the agent's own voice, so they render as outgoing blue
 * bubbles — the grey quote tone is reserved for the lead's detected post in
 * the simulator.
 */
function GoldExamples({ profile }: { profile: ChannelProfile }) {
  if (profile.examples.length === 0) {
    return (
      <p className="mt-2 rounded-xl bg-black/5 p-4 text-sm text-text-secondary">
        No snippets yet — open the form and paste 3–5 messages you would actually send here.
      </p>
    )
  }
  return (
    <div className="mt-2 flex max-w-[480px] flex-col items-end gap-1.5">
      {profile.examples.map((example) => (
        <ChatBubble key={example} tone="outgoing">
          {example}
        </ChatBubble>
      ))}
    </div>
  )
}

/**
 * Thread previews for the Live simulator. The simulator is driven by the
 * actual thread type per channel — Reddit renders the real `RedditThread`
 * and X renders the real `TwitterThreads` above. Facebook keeps a
 * lightweight mock until its full Paper thread lands.
 */

/** Stubbed Facebook thread — Messenger chat stays the live path for now. */
export function FacebookThreadStub({ leadContext }: { leadContext: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
      {leadContext.trim() ? (
        <div className="flex justify-start">
          <ChatBubble tone="quote">{leadContext}</ChatBubble>
        </div>
      ) : (
        <p className="rounded-xl bg-black/5 p-3 text-sm text-text-secondary">
          Stubbed Facebook thread — the Messenger simulator is the live path.
        </p>
      )}
    </div>
  )
}
