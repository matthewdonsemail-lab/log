import { useCallback, useEffect, useRef, useState } from 'react'
import { Badge, Button, useToast } from '@listeningkit/ui'
import { ChevronLeft, ChevronRight, Pencil, Tag, Trash2 } from 'lucide-react'
import {
  LISTING_STATUS_LABELS,
  listingActions,
  setListingStatus,
  type ListingRecord,
  type ListingStatus
} from '../lib/listings'
import { getAccounts, type ConnectionRecord } from '../lib/connections'
import { healthForAccountId, healthForLabel } from '../lib/health'
import { SOCIAL_ICONS, SocialGlyph } from '../lib/social-icons'
import { AccountHealthBadge } from './AccountHealthBadge'
import { AccountTooltip } from './AccountTooltip'
import { DashboardFormSheet } from './DashboardFormSheet'
import { STATUS_COLOR, flagForLocation, formatPublished } from './listing-shared'
import Dither from './Dither'

const facebookIcon = SOCIAL_ICONS.find((icon) => icon.id === 'facebook')

/**
 * One line per status — what this listing's state means and what can happen
 * to it next. The platform-removed variant of `removed` gets its own copy:
 * that one is Facebook's removal (violation / rejection / inactivity), not
 * the seller's own delist, so relist is off the table and the appeal is the
 * only way back.
 */
function statusNote(listing: ListingRecord): string {
  switch (listing.status) {
    case 'active':
      return 'Live — buyers can see it and buy it. Facebook approved it out of review.'
    case 'under-review':
      return 'With Facebook for review. It goes live on approval, or lands in a duplicate hold / gets removed on rejection.'
    case 'under-review-duplicate':
      return 'Facebook is holding this as a duplicate of an existing listing. Change the title or price and re-save — that is the usual unblock.'
    case 'sold':
      return 'You marked this sold — buyers who inquired get notified. Mark it available again or remove it to archive.'
    case 'removed':
      return listing.removedBy === 'platform'
        ? 'Facebook removed this (policy violation, a rejected review, or inactivity). Re-listing is blocked — request a review from the listing page if you believe it was a mistake.'
        : 'You took this down. Relist it to put it back on the feed, or delete the row for good.'
    case 'login-wall':
      return 'The poller hit a login wall and cannot see this listing right now. Fix the account session on the Accounts page — the next poll re-reads the real state.'
    case 'unknown':
      return 'The poller could not classify this listing. Nothing to act on until the next poll resolves its real state.'
  }
}

/** Horizontal pixels of drag before the carousel commits to a page turn. */
const DRAG_THRESHOLD = 48

/**
 * Listing photo carousel: dots pin the bottom, photos turn by chevron,
 * arrow key, or horizontal drag/swipe (one Pointer Events handler covers
 * mouse + touch). Single-photo and photo-less listings hide the controls.
 */
function ListingCarousel({ images, title }: { images: string[]; title: string }) {
  const count = images.length
  const [index, setIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef<number | null>(null)

  // A new listing (or a fresh fetch) restarts the deck at the cover photo.
  useEffect(() => {
    setIndex(0)
    setDragX(0)
  }, [images])

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((prev) => (prev + dir + count) % count)
      setDragX(0)
    },
    [count]
  )

  // Arrow keys page through the photos while the form is open.
  useEffect(() => {
    if (count <= 1) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') go(-1)
      else if (event.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count, go])

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-black/5 text-sm font-medium text-text-secondary">
        No photos for this listing yet.
      </div>
    )
  }

  function beginDrag(clientX: number) {
    if (count <= 1) return
    startX.current = clientX
    setDragging(true)
  }

  function endDrag() {
    if (!dragging) return
    setDragging(false)
    startX.current = null
    if (dragX <= -DRAG_THRESHOLD) go(1)
    else if (dragX >= DRAG_THRESHOLD) go(-1)
    else setDragX(0)
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} — ${count} photo${count === 1 ? '' : 's'}`}
      className="relative aspect-[4/3] w-full cursor-grab touch-pan-y select-none overflow-hidden rounded-xl bg-black/5 active:cursor-grabbing"
      onPointerDown={(event) => {
        beginDrag(event.clientX)
        event.currentTarget.setPointerCapture(event.pointerId)
      }}
      onPointerMove={(event) => {
        if (dragging && startX.current !== null) setDragX(event.clientX - startX.current)
      }}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translateX(calc(${-index * 100}% + ${dragging ? dragX : 0}px))`,
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="h-full min-w-full">
            <img
              src={src}
              alt={`${title} — photo ${i + 1} of ${count}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
              className="pointer-events-none h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              go(-1)
            }}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
          >
            <ChevronLeft size={16} strokeWidth={2.25} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              go(1)
            }}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
          >
            <ChevronRight size={16} strokeWidth={2.25} aria-hidden="true" />
          </button>
          <span
            aria-hidden="true"
            className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white"
          >
            {index + 1} / {count}
          </span>
          <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((src, i) => (
              <button
                key={`${src}-dot-${i}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setIndex(i)
                  setDragX(0)
                }}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}

/**
 * The inspect view for one marketplace listing: the photos as a paginated
 * carousel over the same dither backdrop as the event inspect form, the
 * price/location/account meta, and the sold/remove actions. Registered into
 * the dashboard form slot from the listings table (row click), docking in
 * the layout's form column without reflow. The original listing URL is the
 * confirm.
 */
export function DashboardListingInspectForm({
  listing: initialListing,
  onClose,
  onEdit,
  onChanged
}: {
  listing: ListingRecord
  onClose: () => void
  /** Transitions the form slot into the create form in edit mode for this
   *  listing (the parent owns that switch). */
  onEdit?: (listing: ListingRecord) => void
  /** Fired after a sold/remove round-trip so the table reloads its rows. */
  onChanged: () => void
}) {
  const { success, error: notifyError } = useToast()
  // Own display copy: status actions refresh it from the API response while
  // the parent reloads the table rows behind it.
  const [listing, setListing] = useState(initialListing)
  useEffect(() => {
    setListing((prev) => (prev.id === initialListing.id ? prev : initialListing))
  }, [initialListing])

  const [accounts, setAccounts] = useState<ConnectionRecord[] | null>(null)
  useEffect(() => {
    getAccounts().then(setAccounts).catch(() => setAccounts([]))
  }, [])

  const [busyAction, setBusyAction] = useState<ListingStatus | null>(null)

  const health =
    healthForAccountId(accounts ?? [], listing.accountId) ?? healthForLabel(accounts ?? [], listing.account)

  // The machine (allowedTransition via listingActions) decides which
  // seller actions this status — combined with the owning account's issue
  // — actually allows; the store 409s the same set, so a hidden button and
  // a rejected round-trip never diverge.
  const accountIssue = accounts?.find((row) => row.id === listing.accountId)?.lastIssue ?? undefined
  const actions = listingActions(listing.status, {
    removedBy: listing.removedBy,
    accountIssue
  })

  async function handleStatusChange(status: ListingStatus) {
    if (busyAction) return
    setBusyAction(status)
    const from = listing.status
    try {
      const res = await setListingStatus(listing.id, status)
      setListing(res.listing)
      onChanged()
      success(
        `“${listing.title}” ${
          status === 'sold'
            ? 'marked as sold'
            : status === 'removed'
              ? from === 'sold'
                ? 'archived'
                : 'removed from Marketplace'
              : status === 'active'
                ? from === 'sold'
                  ? 'is back on sale'
                  : 'relisted'
                : `moved to ${LISTING_STATUS_LABELS[status].toLowerCase()}`
        }`,
        LISTING_STATUS_LABELS[status]
      )
    } catch (err: unknown) {
      notifyError('Could not update the listing', err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <DashboardFormSheet
      open
      title={listing.title}
      subtitle={
        <>
          <Badge variant="trigger" color={STATUS_COLOR[listing.status]}>
            {LISTING_STATUS_LABELS[listing.status]}
          </Badge>
          <span className="font-semibold text-text-primary">€{listing.price}</span>
          <AccountTooltip
            label={listing.account}
            health={health}
            labelIcon={facebookIcon ? <SocialGlyph icon={facebookIcon} className="size-3" /> : null}
            badge={
              health ? (
                <AccountHealthBadge
                  label={listing.account}
                  health={health}
                  icon={facebookIcon ? <SocialGlyph icon={facebookIcon} className="size-3.5" /> : undefined}
                />
              ) : (
                <Badge
                  variant="muted"
                  icon={facebookIcon ? <SocialGlyph icon={facebookIcon} className="size-3.5" /> : undefined}
                >
                  {listing.account}
                </Badge>
              )
            }
          >
            <span className="flex items-center gap-1.5 whitespace-nowrap text-white/80">
              <span className="block max-w-48 truncate">{listing.location}</span>
              <span aria-hidden="true">·</span>
              <span>€{listing.price}</span>
            </span>
          </AccountTooltip>
        </>
      }
      onClose={onClose}
      confirmLabel="Open original listing"
      onConfirm={() => window.open(listing.listingUrl, '_blank', 'noopener,noreferrer')}
    >
      <div className="flex items-center justify-between gap-2 rounded-lg border border-[#1E66C9] bg-[#2A8CFF] px-3 py-2">
        <p className="text-[11px] font-bold uppercase tracking-wide text-white">The listing</p>
        <Badge variant="trigger" color={STATUS_COLOR[listing.status]} className="shrink-0">
          {LISTING_STATUS_LABELS[listing.status]}
        </Badge>
      </div>
      <div className="relative rounded-xl p-4">
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
        <div className="relative">
          <ListingCarousel images={listing.images} title={listing.title} />
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <p className="mb-3 leading-5 text-text-secondary">{statusNote(listing)}</p>
        <dl className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-text-secondary">Price</dt>
            <dd className="truncate text-lg font-bold text-text-primary">€{listing.price}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-text-secondary">Location</dt>
            <dd className="flex min-w-0 items-center gap-1.5 font-medium text-text-primary">
              {flagForLocation(listing.location)}
              <span className="truncate">{listing.location}</span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-text-secondary">Category</dt>
            <dd className="truncate font-medium text-text-primary">
              {listing.category}
              {listing.condition ? ` · ${listing.condition}` : ''}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="shrink-0 text-text-secondary">Published</dt>
            <dd className="font-medium tabular-nums text-text-primary">{formatPublished(listing.publishedAt)}</dd>
          </div>
        </dl>
      </div>
      <div className="flex flex-wrap gap-2">
        {onEdit && actions.edit ? (
          <Button
            type="button"
            variant="blue"
            size="lg"
            disabled={busyAction !== null}
            onClick={() => onEdit(listing)}
            className="flex-1 font-bold text-white"
          >
            <Pencil aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
            Edit
          </Button>
        ) : null}
        {actions.markSold ? (
          <Button
            type="button"
            variant="blue"
            size="lg"
            disabled={busyAction !== null}
            onClick={() => handleStatusChange('sold')}
            className="flex-1 font-bold text-white"
          >
            <Tag aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
            {busyAction === 'sold' ? 'Working…' : 'Mark as sold'}
          </Button>
        ) : null}
        {actions.markAvailable ? (
          <Button
            type="button"
            variant="blue"
            size="lg"
            disabled={busyAction !== null}
            onClick={() => handleStatusChange('active')}
            className="flex-1 font-bold text-white"
          >
            {busyAction === 'active' ? 'Working…' : 'Mark as available'}
          </Button>
        ) : null}
        {actions.relist ? (
          <Button
            type="button"
            variant="blue"
            size="lg"
            disabled={busyAction !== null}
            onClick={() => handleStatusChange('active')}
            className="flex-1 font-bold text-white"
          >
            {busyAction === 'active' ? 'Working…' : 'Relist'}
          </Button>
        ) : null}
        {actions.remove ? (
          <Button
            type="button"
            variant="destructive"
            size="lg"
            disabled={busyAction !== null}
            onClick={() => handleStatusChange('removed')}
            className="flex-1"
          >
            <Trash2 aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
            {busyAction === 'removed' ? 'Working…' : listing.status === 'sold' ? 'Archive listing' : 'Remove listing'}
          </Button>
        ) : null}
      </div>
    </DashboardFormSheet>
  )
}
