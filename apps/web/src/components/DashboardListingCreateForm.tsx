import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Select, useToast } from '@listeningkit/ui'
import { getAccounts, type ConnectionRecord } from '../lib/connections'
import { createListing, DEFAULT_LISTING_LOCATION, saveListing, type ListingLocation, type ListingRecord } from '../lib/listings'
import { SOCIAL_ICONS, SocialGlyph, type SocialIcon } from '../lib/social-icons'
import { DashboardFormSheet } from './DashboardFormSheet'
import { EmptyLine, FormInput, LoadingLine, PickRow } from './DashboardFormPrimitives'
import { LocationField } from './DashboardLocationPicker'
import Dither from './Dither'

const facebookIcon: SocialIcon = SOCIAL_ICONS.find((icon) => icon.id === 'facebook') ?? SOCIAL_ICONS[0]

// The category / condition lists mirror the marketplace schemas the mock
// rows were captured from (facebook-camofox-client), so form output always
// lands in a bucket the status poller understands.
const CATEGORIES = ['Household', 'Furniture', 'Electronics', 'Clothing', 'Services']
const CONDITIONS = ['New', 'Used - like new', 'Used - good', 'Used - fair']
const CONDITION_NONE = 'n/a'

// Marketplace fans up to four 9:16 photos per listing (MarketplaceImages);
// the picker enforces the same cap, first pick = cover.
const MAX_PHOTOS = 4

/**
 * Publish a Facebook Marketplace listing. Two steps, in order:
 *  - pick one of the connected facebook accounts (the draft's `account` is
 *    the same label space as lib/connections) — auto-advances on select,
 *  - the details block (title / price / category / condition / location)
 *    plus the photos, right on the same step — advances on Continue once
 *    valid.
 * The draft goes out through `POST /listings` (which rejects photo-less
 * drafts) and comes back as `under-review` until the client clears it.
 *
 * Edit mode (`initialListing`): pre-fills every field and jumps straight to
 * the details step with the account scope fixed — Back is hidden and the
 * final confirm saves through `PATCH /listings/:id` instead of creating.
 */
export function DashboardListingCreateForm({
  open,
  onClose,
  onCreated,
  initialListing = null
}: {
  open: boolean
  onClose: () => void
  /** Fires after a successful create so the parent page can reconcile. */
  onCreated: () => void
  /** Edit this listing instead of creating one: jumps to the details step. */
  initialListing?: ListingRecord | null
}) {
  const { success, error: notifyError } = useToast()
  const editing = initialListing ?? null
  const [step, setStep] = useState<1 | 2>(1)
  const [accounts, setAccounts] = useState<ConnectionRecord[] | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  // Picking an account only marks the row — Continue flips this and
  // unlocks the details step, so step one never auto-advances.
  const [accountConfirmed, setAccountConfirmed] = useState(false)
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [condition, setCondition] = useState(CONDITION_NONE)
  const [location, setLocation] = useState('')
  // Marketplace targeting point — picked on the grey map, stored on the
  // draft so the client can drop the same pinpoint Facebook expects.
  const [point, setPoint] = useState<ListingLocation>(DEFAULT_LISTING_LOCATION)
  const [images, setImages] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  const fbAccounts = (accounts ?? []).filter(
    (account) => account.platform === 'facebook' && account.connectedAt !== null
  )

  useEffect(() => {
    if (!open) return
    // Edit mode pre-fills from the record and jumps to details; create mode
    // starts blank on the account pick.
    setStep(editing ? 2 : 1)
    setAccounts(null)
    setAccountId(null)
    setAccountConfirmed(editing !== null)
    setTitle(editing?.title ?? '')
    setPrice(editing?.price ?? '')
    setCategory(editing?.category ?? CATEGORIES[0])
    setCondition(editing?.condition ?? CONDITION_NONE)
    setLocation(editing?.location ?? '')
    setPoint(editing?.locationPoint ?? DEFAULT_LISTING_LOCATION)
    setImages(editing ? [...editing.images] : [])
    setBusy(false)
    // The account step never renders in edit mode, so no roster to load.
    if (!editing) {
      getAccounts()
        .then(setAccounts)
        .catch(() => setAccounts([]))
    }
  }, [open, initialListing])

  const detailsValid = title.trim() !== '' && /^\d+$/.test(price.trim()) && location.trim() !== ''

  const stepHint =
    step === 1
      ? 'Pick the account, then press Continue.'
      : 'Title, price, and delivery area — plus at least one photo.'

  function back() {
    setStep(1)
    setAccountId(null)
    setAccountConfirmed(false)
  }

  // Step one's Continue: confirm the account pick and unlock details.
  // Selecting a row only marks it, so the advance lives here.
  function continueFromAccount() {
    if (accountId === null || accountConfirmed || busy) return
    setAccountConfirmed(true)
    setStep(2)
  }

  async function confirm() {
    if (busy) return
    if (step === 1) return
    if (!detailsValid || images.length === 0) return
    const draft = {
      title: title.trim(),
      price: price.trim(),
      category,
      condition: condition === CONDITION_NONE ? null : condition,
      location: location.trim(),
      locationPoint: point,
      images
    }
    setBusy(true)
    try {
      if (editing) {
        // Account scope is fixed in edit mode — the stored id rides along.
        const record = await saveListing(editing.id, { ...draft, accountId: editing.accountId })
        success(`“${record.title}” updated`, 'Changes are live on the listing.')
      } else {
        const account = fbAccounts.find((fb) => fb.id === accountId)
        if (!account) return
        const record = await createListing({ ...draft, accountId: account.id })
        success(`“${record.title}” published`, 'Under review on Facebook Marketplace.')
      }
      onCreated()
      onClose()
    } catch (err: unknown) {
      notifyError(
        editing ? 'Could not save the listing' : 'Could not publish the listing',
        err instanceof Error ? err.message : 'Something went wrong.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <DashboardFormSheet
      open={open}
      title={editing ? 'Edit listing' : 'New listing'}
      subtitle="Publish to Facebook Marketplace — it lands under review until the client clears it."
      step={step}
      stepCount={2}
      stepHint={stepHint}
      busy={busy}
      confirmLabel={step === 1 ? 'Continue' : editing ? 'Save changes' : 'Publish listing'}
      confirmDisabled={step === 1 ? accountId === null : !detailsValid || images.length === 0}
      onConfirm={step === 1 ? continueFromAccount : confirm}
      onBack={back}
      backDisabled={step === 1 || editing !== null}
      onClose={onClose}
    >
      {step === 1 ? (
        accounts === null ? (
          <LoadingLine label="Loading connected accounts…" />
        ) : fbAccounts.length === 0 ? (
          <EmptyLine label="No connected Facebook accounts yet — connect one in Settings first." />
        ) : (
          <div className="flex flex-col gap-2">
            {fbAccounts.map((account) => (
              <PickRow
                key={account.id}
                active={accountId === account.id}
                onClick={() => setAccountId(account.id)}
                label={account.label}
                sub={account.viaProxy ? 'via proxy' : 'direct connection'}
                tone="solid"
                icon={<SocialGlyph icon={facebookIcon} className="size-8 shrink-0" />}
              />
            ))}
          </div>
        )
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col gap-4">
          <Field label="Photos" required>
            <ImageStep
              images={images}
              busy={busy}
              onAdd={setImages}
              onRemove={(index) => setImages((current) => current.filter((_, i) => i !== index))}
            />
          </Field>
          <Field label="Title" required>
            <FormInput
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Rubbish Removal in Galway"
              autoComplete="off"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (€)" required>
              <FormInput
                type="number"
                min={0}
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="50"
              />
            </Field>
            <Field label="Category">
              <Select
                size="lg"
                value={category}
                onChange={(value) => setCategory(value)}
                aria-label="Listing category"
                options={CATEGORIES.map((name) => ({ value: name, label: name }))}
              />
            </Field>
          </div>
          <Field label="Condition">
            <Select
              size="lg"
              value={condition}
              onChange={(value) => setCondition(value)}
              aria-label="Listing condition"
              options={[
                { value: CONDITION_NONE, label: 'Not applicable' },
                ...CONDITIONS.map((name) => ({ value: name, label: name }))
              ]}
            />
          </Field>
          <Field label="Location" required>
            <LocationField
              value={location}
              onChange={setLocation}
              point={point}
              onPointChange={setPoint}
            />
          </Field>
        </div>
      ) : null}
    </DashboardFormSheet>
  )
}

function ImageStep({
  images,
  busy,
  onAdd,
  onRemove
}: {
  images: string[]
  busy: boolean
  onAdd: (next: string[]) => void
  onRemove: (index: number) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  // Panel-level drag highlight: a counter so moving across the thumbnails
  // inside doesn't flicker the blue state on every child enter/leave.
  const dragCount = useRef(0)
  const [dragOver, setDragOver] = useState(false)

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
  }

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    const room = MAX_PHOTOS - images.length
    const files = Array.from(list)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, room)
    if (files.length === 0) return
    setReading(true)
    try {
      const urls = await Promise.all(files.map(readFile))
      onAdd([...images, ...urls].slice(0, MAX_PHOTOS))
    } catch {
      // A single unreadable file shouldn't sink the whole batch — retry and
      // keep whichever ones decode.
      const urls = (
        await Promise.all(files.map((file) => readFile(file).catch(() => null)))
      ).filter((url): url is string => url !== null)
      if (urls.length > 0) onAdd([...images, ...urls].slice(0, MAX_PHOTOS))
    } finally {
      setReading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="relative rounded-xl p-4"
        onDragEnter={(event) => {
          event.preventDefault()
          dragCount.current += 1
          setDragOver(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => {
          dragCount.current = Math.max(0, dragCount.current - 1)
          if (dragCount.current === 0) setDragOver(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          dragCount.current = 0
          setDragOver(false)
          void handleFiles(event.dataTransfer.files)
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <Dither
            waveColor={[0.3, 0.65, 1]}
            backgroundColor={[0.04, 0.24, 0.57]}
            waveSpeed={0.08}
            colorNum={4}
            pixelSize={3}
            enableMouseInteraction={false}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 14%, rgba(255,255,255,0) 86%, #fff 100%)',
              'linear-gradient(to bottom, #fff 0%, rgba(255,255,255,0) 22%, rgba(255,255,255,0) 78%, #fff 100%)'
            ].join(', ')
          }}
        />
        <div className="relative flex flex-col gap-3">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] gap-3">
              {images[0] !== undefined ? (
                <div className="group relative row-span-2 min-h-[160px] overflow-hidden rounded-xl border border-black/10">
                  <img
                    src={images[0]}
                    alt="Listing photo 1"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Cover
                  </span>
                  <button
                    type="button"
                    aria-label="Remove photo 1"
                    disabled={busy}
                    onClick={() => onRemove(0)}
                    className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={12} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={busy || reading}
                  onClick={() => inputRef.current?.click()}
                  className={`row-span-2 flex min-h-[160px] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed transition-colors disabled:opacity-50 focus-visible:outline-none ${
                    dragOver
                      ? 'border-[#2A8CFF] bg-[#2A8CFF]/10 text-[#2A8CFF]'
                      : 'border-slate-300 bg-slate-50 text-text-secondary hover:border-[#2A8CFF] hover:bg-[#2A8CFF]/10 hover:text-[#2A8CFF] focus-visible:border-[#2A8CFF] focus-visible:text-[#2A8CFF]'
                  }`}
                >
                  {reading ? (
                    <span className="text-xs font-semibold">Reading…</span>
                  ) : (
                    <>
                      <ImagePlus size={22} strokeWidth={2} aria-hidden="true" />
                      <span className="text-[11px] font-semibold">Add photo</span>
                    </>
                  )}
                </button>
              )}
              {[1, 2, 3].map((slot) => {
                const src = images[slot]
                return src !== undefined ? (
                  <div
                    key={slot}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-black/10"
                  >
                    <img src={src} alt={`Listing photo ${slot + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      aria-label={`Remove photo ${slot + 1}`}
                      disabled={busy}
                      onClick={() => onRemove(slot)}
                      className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={12} strokeWidth={2.5} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <button
                    key={slot}
                    type="button"
                    disabled={busy || reading}
                    onClick={() => inputRef.current?.click()}
                    aria-label={`Add photo ${slot + 1}`}
                    className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed transition-colors disabled:opacity-50 focus-visible:outline-none ${
                      dragOver
                        ? 'border-[#2A8CFF] bg-[#2A8CFF]/10 text-[#2A8CFF]'
                        : 'border-slate-300 bg-slate-50 text-text-secondary hover:border-[#2A8CFF] hover:bg-[#2A8CFF]/10 hover:text-[#2A8CFF] focus-visible:border-[#2A8CFF] focus-visible:text-[#2A8CFF]'
                    }`}
                  >
                    {reading ? (
                      <span className="text-xs font-semibold">Reading…</span>
                    ) : (
                      <>
                        <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
                        <span className="text-[11px] font-semibold">Add</span>
                      </>
                    )}
                  </button>
                )
              })}
              <button
                type="button"
                disabled={busy || reading || images.length >= MAX_PHOTOS}
                onClick={() => inputRef.current?.click()}
                aria-label="Add another photo"
                title={images.length >= MAX_PHOTOS ? `Up to ${MAX_PHOTOS} photos` : 'Add another photo'}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed transition-colors disabled:opacity-40 focus-visible:outline-none ${
                  dragOver
                    ? 'border-[#2A8CFF] bg-[#2A8CFF]/10 text-[#2A8CFF]'
                    : 'border-slate-300 bg-slate-50 text-text-secondary hover:border-[#2A8CFF] hover:bg-[#2A8CFF]/10 hover:text-[#2A8CFF] focus-visible:border-[#2A8CFF] focus-visible:text-[#2A8CFF]'
                }`}
              >
                <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
                <span className="text-[11px] font-semibold">Add</span>
              </button>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />
        </div>
      </div>
      <p className="text-xs text-text-secondary">
        Up to {MAX_PHOTOS} photos — the large tile is the cover. Click a dashed tile or drag images straight in.
        JPG / PNG, from your device.
      </p>
    </div>
  )
}

function Field({
  label,
  required,
  children
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required ? <span className="text-[#2A8CFF]"> *</span> : null}
      </span>
      {children}
    </label>
  )
}