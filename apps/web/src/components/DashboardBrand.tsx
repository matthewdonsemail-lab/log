// apps/web/src/components/DashboardBrand.tsx
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Brain, Globe, MapPin, Pencil, RotateCcw } from 'lucide-react'
import { Button, Select, buttonVariants, useSquircleClip, useToast } from '@listeningkit/ui'
import { SOCIAL_ICONS, SocialGlyph, type SocialIcon } from '../lib/social-icons'
import {
  clearBrandAsync,
  getBrandAsync,
  saveBrandAsync,
  simulateOutbound,
  type Autoreply,
  type BrandChannel,
  type BrandEntity,
  type ChannelProfile,
  type ChannelStyle,
} from '../lib/brand'
import { ChatBubble, EmptyBanner, FormInput, LoadingLine, Toggle } from './DashboardFormPrimitives'
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
 * The agent's communication brain & memory hub — display with two instant
 * controls (the channel tone Select, the autoreply toggles) that save
 * direct through `PUT /brand`. All other configuration lives in
 * `DashboardBrandForm`, registered into the layout overlay through
 * `DashboardFormSlot`; the page opens it pre-scoped to the tab being edited
 * and reloads on save. The Live simulator previews the saved record only —
 * drafts are heard inside the form before they commit.
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
  const [channelBusy, setChannelBusy] = useState(false)

  async function changeStyle(channel: BrandChannel, style: ChannelStyle) {
    if (!brand || busy || channelBusy) return
    setChannelBusy(true)
    try {
      const next = await saveBrandAsync({
        channels: { ...brand.channels, [channel]: { ...brand.channels[channel], style } },
      })
      setBrand(next)
    } catch (err: unknown) {
      notifyError('Could not update the tone', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setChannelBusy(false)
    }
  }

  async function saveAutoreplies(channel: BrandChannel, autoreplies: Autoreply[]) {
    if (!brand || busy || channelBusy) return
    setChannelBusy(true)
    try {
      const next = await saveBrandAsync({
        channels: { ...brand.channels, [channel]: { ...brand.channels[channel], autoreplies } },
      })
      setBrand(next)
    } catch (err: unknown) {
      notifyError('Could not update the autoreplies', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setChannelBusy(false)
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
        <EmptyBanner
          title="Nothing here yet"
          body="Run onboarding to pull your brand profile."
          action={
            <Link to="/onboarding" className={buttonVariants({ size: 'sm' })}>
              Run onboarding
            </Link>
          }
        />
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
                      disabled={busy || channelBusy}
                      onChange={(style) => changeStyle('facebook', style)}
                    />

                  <h3 className="mt-4 text-sm font-semibold text-text-primary">
                    How we actually text
                  </h3>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    Real conversational fragments. No formal sign-offs or canned corporate lines.
                  </p>
                  <GoldExamples
                    profile={brand.channels.facebook}
                    channelLabel="Facebook"
                    onEdit={() => setFormNamespace('facebook')}
                  />

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
                    <EmptyBanner
                      className="mt-2"
                      title="No triage flow yet"
                      body="e.g. ask for photos of the job, then lock in a pickup time."
                      action={
                        <Button type="button" size="sm" onClick={() => setFormNamespace('facebook')}>
                          Edit Facebook
                        </Button>
                      }
                    />
                  )}

                  <AutorepliesSection
                    channel="facebook"
                    label="Facebook"
                    profile={brand.channels.facebook}
                    disabled={busy || channelBusy}
                    onToggle={saveAutoreplies}
                    onEdit={() => setFormNamespace('facebook')}
                  />
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
                        {preview.matchedSource === 'autoreply'
                          ? `Matched autoreply${preview.matchedTrigger ? ` · ${preview.matchedTrigger}` : ''}`
                          : preview.matchedSource === 'example'
                            ? 'Matched a gold example'
                            : 'No close match — style fallback'}
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
                <EmptyBanner
                  className="mt-3"
                  title="No working facts yet"
                  body="Add pricing baselines, boundaries, jobs taken and declined."
                  action={
                    <Button type="button" size="sm" onClick={() => setFormNamespace('memory')}>
                      Edit memory
                    </Button>
                  }
                />
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
                      disabled={busy || channelBusy}
                      onChange={(style) => changeStyle(tab, style)}
                    />

                  <h3 className="mt-4 text-sm font-semibold text-text-primary">How we actually text</h3>
                  <GoldExamples
                    profile={brand.channels[tab]}
                    channelLabel={tab === 'x' ? 'X' : 'Reddit'}
                    onEdit={() => setFormNamespace(tab)}
                  />

                  <AutorepliesSection
                    channel={tab}
                    label={tab === 'x' ? 'X' : 'Reddit'}
                    profile={brand.channels[tab]}
                    disabled={busy || channelBusy}
                    onToggle={saveAutoreplies}
                    onEdit={() => setFormNamespace(tab)}
                  />
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
function GoldExamples({
  profile,
  channelLabel,
  onEdit,
}: {
  profile: ChannelProfile
  channelLabel: string
  onEdit: () => void
}) {
  if (profile.examples.length === 0) {
    return (
      <EmptyBanner
        className="mt-2"
        title="No snippets yet"
        body="Paste 3–5 messages you would actually send here."
        action={
          <Button type="button" size="sm" onClick={onEdit}>
            Edit {channelLabel}
          </Button>
        }
      />
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
 * Per-channel autoreplies: toggle rows that save direct, add/edit/delete
 * through the channel overlay form. Mounted inside each channel panel so
 * the base lines sit next to the style and snippets they send with.
 */
function AutorepliesSection({
  channel,
  label,
  profile,
  disabled,
  onToggle,
  onEdit,
}: {
  channel: BrandChannel
  label: string
  profile: ChannelProfile
  disabled: boolean
  onToggle: (channel: BrandChannel, next: Autoreply[]) => void
  onEdit: () => void
}) {
  const enabledCount = profile.autoreplies.filter((entry) => entry.enabled).length
  return (
    <>
      <h3 className="mt-4 text-sm font-semibold text-text-primary">Autoreplies</h3>
      {profile.autoreplies.length === 0 ? (
        <EmptyBanner
          className="mt-2"
          title="No base replies yet"
          body="Add the lines that send as-is when the lead context matches."
          action={
            <Button type="button" size="sm" onClick={onEdit}>
              Edit {label}
            </Button>
          }
        />
      ) : (
        <p className="mt-0.5 text-xs text-text-secondary">
          {`Base lines that send when the lead context matches — ${enabledCount} of ${profile.autoreplies.length} on.`}
        </p>
      )}
      {profile.autoreplies.length > 0 ? (
        <ul className="mt-2 flex flex-col gap-1.5">
          {profile.autoreplies.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-2.5 rounded-lg bg-black/[0.03] px-3 py-2"
            >
              <Toggle
                checked={entry.enabled}
                disabled={disabled}
                onChange={(enabled) =>
                  onToggle(
                    channel,
                    profile.autoreplies.map((candidate) =>
                      candidate.id === entry.id ? { ...candidate, enabled } : candidate
                    )
                  )
                }
                label={`${label} autoreply ${entry.trigger || 'base reply'} enabled`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {entry.trigger || 'Base reply'}
                </p>
                <p className="truncate text-xs text-text-secondary">{entry.reply}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </>
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
