import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, Brain, Pencil } from 'lucide-react'
import { Button, useSquircleClip, useToast } from '@listeningkit/ui'
import { SOCIAL_ICONS, SocialBadge, SocialGlyph } from '../lib/social-icons'
import {
  clearBrandAsync,
  getBrandAsync,
  simulateReply,
  type BrandChannel,
  type BrandEntity,
  type ChannelProfile,
} from '../lib/brand'
import { ChatBubble, FormInput, LoadingLine } from './DashboardFormPrimitives'
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

const facebookIcon = SOCIAL_ICONS.find((icon) => icon.id === 'facebook')
const xIcon = SOCIAL_ICONS.find((icon) => icon.id === 'x')
const redditIcon = SOCIAL_ICONS.find((icon) => icon.id === 'reddit')

/** Page section card: r20 squircle, white — the Analytics card recipe. */
function BrandCard({ children }: { children: ReactNode }) {
  const clip = useSquircleClip<HTMLElement>(20)
  return (
    <section ref={clip.ref} style={clip.style} className="bg-white p-5">
      {children}
    </section>
  )
}

/**
 * The agent's communication brain & memory hub — read-only display. All
 * configuration lives in `DashboardBrandForm`, registered into the layout
 * overlay through `DashboardFormSlot`; the page opens it pre-scoped to the
 * tab being edited and reloads on save. The Test-it simulator previews the
 * saved record only — drafts are heard inside the form before they commit.
 */
export function DashboardBrand() {
  const { success, error: notifyError } = useToast()
  const [brand, setBrand] = useState<BrandEntity | null | undefined>(undefined)
  const [tab, setTab] = useState<BrandTab>('facebook')
  const [busy, setBusy] = useState(false)
  // Form scope: which namespace the overlay form edits; null means closed.
  const [formNamespace, setFormNamespace] = useState<BrandNamespace | null>(null)

  const [inbound, setInbound] = useState('')
  const [simulated, setSimulated] = useState(false)

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
    () => (brand && inbound.trim() ? simulateReply(brand, simChannel, inbound) : null),
    [brand, simChannel, inbound]
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

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {facebookIcon ? <SocialBadge icon={facebookIcon} variant="blue" /> : null}
          <div>
            <h1 className="text-xl font-bold text-text-primary">Brand</h1>
            <p className="text-sm text-text-secondary">
              {brand === undefined
                ? 'Loading brand…'
                : brand === null
                  ? 'No brand saved yet — onboarding creates it.'
                  : `The agent's communication brain & memory hub for ${brand.identity.name}.`}
            </p>
          </div>
        </div>
        {brand ? (
          <div className="flex items-center gap-2">
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
      ) : (
        <>
          <BrandCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-text-primary">{brand.identity.name}</h2>
                <p className="text-xs text-text-secondary">
                  {brand.identity.website || 'No site yet'}
                  {brand.location.label ? ` · ${brand.location.label}` : ''}
                </p>
              </div>
              <EditButton label="Edit business" onClick={() => setFormNamespace('business')} />
            </div>
          </BrandCard>

          <div className="flex flex-wrap gap-2">
            <DashboardTab
              label="Facebook"
              icon={facebookIcon ? <SocialGlyph icon={facebookIcon} className="size-4" /> : null}
              active={tab === 'facebook'}
              onClick={() => setTab('facebook')}
            />
            <DashboardTab
              label="Agent Memory"
              icon={<Brain size={16} aria-hidden="true" />}
              active={tab === 'memory'}
              onClick={() => setTab('memory')}
              accent="amber"
            />
            <DashboardTab
              label="X"
              icon={xIcon ? <SocialGlyph icon={xIcon} className="size-4" /> : null}
              active={tab === 'x'}
              onClick={() => setTab('x')}
              accent="sky"
            />
            <DashboardTab
              label="Reddit"
              icon={redditIcon ? <SocialGlyph icon={redditIcon} className="size-4" /> : null}
              active={tab === 'reddit'}
              onClick={() => setTab('reddit')}
              accent="red"
            />
          </div>

          {tab === 'facebook' ? (
            <ChannelSection
              title="Messenger Cadence"
              subtitle="How the agent drafts replies to inbound buyer inquiries on Marketplace and Groups."
              profile={brand.channels.facebook}
              showTriage
              editLabel="Edit Facebook"
              onEdit={() => setFormNamespace('facebook')}
            />
          ) : null}

          {tab === 'memory' ? (
            <BrandCard>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-text-primary">Working facts</h2>
                  <p className="text-xs text-text-secondary">
                    What the agent remembers on every reply — pricing baselines, boundaries, jobs taken and declined.
                  </p>
                </div>
                <EditButton label="Edit memory" onClick={() => setFormNamespace('memory')} />
              </div>
              {brand.memory.rules.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {brand.memory.rules.map((rule) => (
                    <li key={rule} className="flex items-start gap-2 rounded-xl bg-black/[0.03] px-3 py-2 text-sm text-text-primary">
                      <span aria-hidden="true" className="mt-0.5 font-bold text-[#2A8CFF]">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-xl bg-black/5 p-4 text-sm text-text-secondary">
                  No working facts yet — open the memory form and add the lines the agent must never forget.
                </p>
              )}
            </BrandCard>
          ) : null}

          {tab === 'x' ? (
            <ChannelSection
              title="X replies"
              subtitle="Quick, sharp one-liners. In and out."
              profile={brand.channels.x}
              editLabel="Edit X"
              onEdit={() => setFormNamespace('x')}
            />
          ) : null}

          {tab === 'reddit' ? (
            <ChannelSection
              title="Reddit replies"
              subtitle="Helpful community member with technical context — answers the question, skips the pitch."
              profile={brand.channels.reddit}
              editLabel="Edit Reddit"
              onEdit={() => setFormNamespace('reddit')}
            />
          ) : null}

          <BrandCard>
            <h2 className="text-base font-bold text-text-primary">Test it</h2>
            <p className="text-xs text-text-secondary">
              Type an inbound {simChannel === 'x' ? 'X mention' : simChannel === 'reddit' ? 'Reddit comment' : 'buyer message'} — the bubble shows the exact raw
              reply the agent would send{preview ? (preview.matched ? ' (matched a gold example)' : ' (style fallback — add a closer example)') : ''}.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <FormInput
                  type="text"
                  value={inbound}
                  onChange={(event) => {
                    setInbound(event.target.value)
                    setSimulated(true)
                  }}
                  placeholder={simChannel === 'facebook' ? 'e.g. is this still available and can you do 40?' : 'e.g. my boiler packed it in again ffs'}
                  aria-label="Inbound test message"
                  autoComplete="off"
                />
              </div>
              <Button
                type="button"
                variant="blue"
                size="icon-lg"
                className="shrink-0 rounded-full"
                title="Preview reply"
                aria-label="Preview reply"
                onClick={() => setSimulated(true)}
              >
                <ArrowUp size={18} aria-hidden="true" />
              </Button>
            </div>
            {simulated && preview ? (
              <div className="mt-3 flex justify-start">
                <ChatBubble tone="outgoing">{preview.text}</ChatBubble>
              </div>
            ) : null}
          </BrandCard>
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

function ChannelSection({
  title,
  subtitle,
  profile,
  showTriage = false,
  editLabel,
  onEdit,
}: {
  title: string
  subtitle: string
  profile: ChannelProfile
  showTriage?: boolean
  editLabel: string
  onEdit: () => void
}) {
  return (
    <BrandCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
          <p className="text-xs text-text-secondary">{subtitle}</p>
        </div>
        <EditButton label={editLabel} onClick={onEdit} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-text-primary">Communication style</h3>
      <p className="mt-1 text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">
          {profile.style === 'casual' ? 'Natural casual' : 'Standard'}
        </span>{' '}
        — {profile.style === 'casual'
          ? 'All-lowercase, short 1–2 sentence replies, typed fast like a human. No sign-offs.'
          : 'Complete sentences with normal punctuation. Still direct, never corporate.'}
      </p>

      <h3 className="mt-4 text-sm font-semibold text-text-primary">How we actually text</h3>
      {profile.examples.length > 0 ? (
        <div className="mt-2 flex max-w-[480px] flex-col items-start gap-1.5">
          {profile.examples.map((example) => (
            <ChatBubble key={example} tone="incoming">
              {example}
            </ChatBubble>
          ))}
        </div>
      ) : (
        <p className="mt-2 rounded-xl bg-black/5 p-4 text-sm text-text-secondary">
          No snippets yet — open the form and paste 3–5 messages you would actually send here.
        </p>
      )}

      {showTriage ? (
        <>
          <h3 className="mt-4 text-sm font-semibold text-text-primary">Messenger triage flow</h3>
          {profile.triage.length > 0 ? (
            <ol className="mt-2 flex flex-col gap-1.5">
              {profile.triage.map((step, index) => (
                <li key={step} className="flex items-center gap-2.5 text-sm text-text-primary">
                  <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2A8CFF]/10 text-xs font-bold text-[#2A8CFF]">
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
        </>
      ) : null}
    </BrandCard>
  )
}
