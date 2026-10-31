import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CircleCheck, Clock, Copy, ExternalLink, Globe, HelpCircle, LogIn, Pencil, Plus, Tag, Trash, Trash2 } from 'lucide-react'
import { Badge, Button, Dropdown, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, useToast } from '@listeningkit/ui'
import { getAccounts, type ConnectionRecord } from '../lib/connections'
import { healthForAccountId, healthForLabel } from '../lib/health'
import { getListings, LISTING_STATUSES, LISTING_STATUS_LABELS, deleteListing, listingActions, setListingStatus, type ListingRecord, type ListingStatus } from '../lib/listings'
import { SocialBadge, SocialGlyph, SOCIAL_ICONS } from '../lib/social-icons'
import { MarketplaceImages } from './MarketplaceImages'
import { STATUS_COLOR, flagForLocation, formatPublished } from './listing-shared'
import { AccountHealthBadge } from './AccountHealthBadge'
import { AccountTooltip } from './AccountTooltip'
import { DashboardListingCreateForm } from './DashboardListingCreateForm'
import { DashboardListingInspectForm } from './DashboardListingInspectForm'
import { useDashboardFormSlot } from './DashboardFormSlot'

const facebookIcon = SOCIAL_ICONS.find((icon) => icon.id === 'facebook')

/** Base list view; a clicked row deep-links to `${LISTINGS_URL}/{uuid}`. */
const LISTINGS_URL = '/dashboard/facebook/listings'

// One glyph per status so the trigger icon follows the selection, the same
// way the Accounts platform filter's trigger icon follows its selection.
const STATUS_ICON: Record<ListingStatus, ReactNode> = {
  active: <CircleCheck aria-hidden="true" className="size-3.5" strokeWidth={2.25} />,
  'under-review': <Clock aria-hidden="true" className="size-3.5" strokeWidth={2.25} />,
  'under-review-duplicate': <Copy aria-hidden="true" className="size-3.5" strokeWidth={2.25} />,
  sold: <Tag aria-hidden="true" className="size-3.5" strokeWidth={2.25} />,
  removed: <Trash2 aria-hidden="true" className="size-3.5" strokeWidth={2.25} />,
  'login-wall': <LogIn aria-hidden="true" className="size-3.5" strokeWidth={2.25} />,
  unknown: <HelpCircle aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
}

export function DashboardListings() {
  const { success, error: notifyError } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const { id: paramId } = useParams()
  const [listings, setListings] = useState<ListingRecord[] | null>(null)
  const [accounts, setAccounts] = useState<ConnectionRecord[] | null>(null)
  const [filter, setFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  // Edit scope: set alongside formOpen to jump the form straight to the
  // details step for this listing; null means create mode.
  const [editScope, setEditScope] = useState<ListingRecord | null>(null)

  // The URL is the source of truth for the inspect view: the `:id` segment
  // is the record's opaque id (UUID), so a shared
  // `/dashboard/facebook/listings/{uuid}` link opens exactly this inspect
  // form. Opening, closing and browser back all just move the URL.
  const inspectedListing = useMemo(
    () => (paramId && listings ? (listings.find((row) => row.id === paramId) ?? null) : null),
    [paramId, listings]
  )
  function inspectUrl(row: ListingRecord): string {
    return `${LISTINGS_URL}/${row.id}`
  }
  function closeInspect() {
    if (paramId) navigate(LISTINGS_URL, { replace: true })
  }

  const load = useCallback(() => {
    getListings()
      .then((res) => setListings(res.listings))
      .catch(() => setListings([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // An `:id` segment that isn't in the loaded roster (deleted or hand-typed):
  // drop it back to the list instead of rendering a dead inspect view — the
  // same guard the Messages thread segment uses.
  useEffect(() => {
    if (!paramId || listings === null) return
    if (!listings.some((row) => row.id === paramId)) {
      notifyError('Listing not found', 'That listing is not in this workspace.')
      navigate(LISTINGS_URL, { replace: true })
    }
  }, [paramId, listings, navigate, notifyError])

  // The form lives in the layout overlay, not in the page: register it
  // when open, clear it when closed or when the page unmounts. The slot
  // holds one node — inspect wins over create/edit when both are open.
  const setFormSlot = useDashboardFormSlot()
  useEffect(() => {
    if (inspectedListing) {
      setFormSlot(
        <DashboardListingInspectForm
          listing={inspectedListing}
          onClose={closeInspect}
          onEdit={handleEdit}
          onChanged={load}
        />
      )
      return () => setFormSlot(null)
    }
    if (!formOpen) {
      setFormSlot(null)
      return
    }
    setFormSlot(
      <DashboardListingCreateForm
        open
        onClose={() => setFormOpen(false)}
        onCreated={load}
        initialListing={editScope}
      />
    )
    return () => setFormSlot(null)
  }, [inspectedListing, formOpen, editScope, load, setFormSlot])

  // Scrim (backdrop) dismiss clears the rendered slot without touching page
  // state — without this reset the selection goes stale and a later click
  // on the same row no-ops.
  useEffect(() => {
    const onExternalDismiss = () => {
      setFormOpen(false)
      setEditScope(null)
      if (paramId) navigate(LISTINGS_URL, { replace: true })
    }
    window.addEventListener('lk:form-dismissed', onExternalDismiss)
    return () => window.removeEventListener('lk:form-dismissed', onExternalDismiss)
  }, [paramId, navigate])
  useEffect(() => {
    getAccounts().then(setAccounts).catch(() => setAccounts([]))
  }, [location])

  // Account badges read their health from the roster through the account
  // FK (`healthForAccountId`, label lookup as the legacy fallback) — the
  // same assessment every other account badge uses.
  // Status changes round-trip the API — the store (mock now, facebook
  // client later) is the source of truth, never local table state.
  async function handleStatusChange(listing: ListingRecord, status: ListingStatus) {
    const from = listing.status
    try {
      const res = await setListingStatus(listing.id, status)
      setListings(res.listings)
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
    }
  }

  // Jump the form straight to the details step for this listing.
  function handleEdit(listing: ListingRecord) {
    if (paramId) navigate(LISTINGS_URL, { replace: true })
    setEditScope(listing)
    setFormOpen(true)
  }

  // Hard delete — the row leaves the store entirely (unlike Remove listing,
  // which flips it to the removed status for record-keeping).
  async function handleDelete(listing: ListingRecord) {
    try {
      const res = await deleteListing(listing.id)
      if (paramId === listing.id) navigate(LISTINGS_URL, { replace: true })
      setListings(res.listings)
      success(`“${listing.title}” deleted`)
    } catch (err: unknown) {
      notifyError('Could not delete the listing', err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  // Row click deep-links the inspect view (the row dropdown stops
  // propagation, so its actions never trigger inspect).
  function handleOpen(listing: ListingRecord) {
    setFormOpen(false)
    navigate(inspectUrl(listing))
  }

  const copyLink = async (url: string) => {    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard can be unavailable on non-secure origins; the menu closes
      // either way so this stays a non-fatal nicety.
    }
  }

  const rows = (listings ?? []).filter((listing) => filter === 'all' || listing.status === filter)
  const activeCount = (listings ?? []).filter((listing) => listing.status === 'active').length

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          {facebookIcon ? <SocialBadge icon={facebookIcon} variant="blue" /> : null}
          <div>
            <h1 className="text-xl font-bold text-text-primary">Listings</h1>
            <p className="text-sm text-text-secondary">
              {listings === null
                ? 'Loading listings…'
                : `${activeCount} of ${listings.length} listings live on Facebook Marketplace.`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="blue" size="lg" shadow="hard" onClick={() => { if (paramId) navigate(LISTINGS_URL, { replace: true }); setEditScope(null); setFormOpen(true) }}>
            <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
            Add listing
          </Button>
          <Select
          matchWidth
          value={filter}
          onChange={setFilter}
          aria-label="Filter by status"
          options={[
            { value: 'all', label: 'All statuses', icon: <Globe aria-hidden="true" className="size-3.5" strokeWidth={2.25} /> },
            ...LISTING_STATUSES.map((status) => ({
              value: status,
              label: LISTING_STATUS_LABELS[status],
              icon: STATUS_ICON[status]
            }))
          ]}
        />
      </div>
        </div>

      {rows.length > 0 ? (
          <Table>
            <table className="w-full min-w-[880px] text-left">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Listing</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((listing) => {
                  const health =
                    healthForAccountId(accounts ?? [], listing.accountId) ??
                    healthForLabel(accounts ?? [], listing.account)
                  // The same machine gates the row menu as the store 409s:
                  // only the status's seller edges (composed with the account
                  // issue) appear, so the menu never offers a refused move.
                  const accountIssue = accounts?.find((row) => row.id === listing.accountId)?.lastIssue ?? undefined
                  const actions = listingActions(listing.status, {
                    removedBy: listing.removedBy,
                    accountIssue
                  })
                  const menuItems = [
                    actions.edit
                      ? {
                          id: 'edit',
                          label: 'Edit',
                          icon: <Pencil aria-hidden="true" className="size-4" />,
                          onSelect: () => handleEdit(listing)
                        }
                      : null,
                    {
                      id: 'view',
                      label: 'View listing',
                      icon: <ExternalLink aria-hidden="true" className="size-4" />,
                      onSelect: () => window.open(listing.listingUrl, '_blank', 'noreferrer')
                    },
                    {
                      id: 'copy',
                      label: 'Copy link',
                      icon: <Copy aria-hidden="true" className="size-4" />,
                      onSelect: () => copyLink(listing.listingUrl)
                    },
                    actions.markSold
                      ? {
                          id: 'sold',
                          label: 'Mark as sold',
                          icon: <Tag aria-hidden="true" className="size-4" />,
                          onSelect: () => handleStatusChange(listing, 'sold')
                        }
                      : null,
                    actions.markAvailable
                      ? {
                          id: 'available',
                          label: 'Mark as available',
                          icon: <CircleCheck aria-hidden="true" className="size-4" />,
                          onSelect: () => handleStatusChange(listing, 'active')
                        }
                      : null,
                    actions.relist
                      ? {
                          id: 'relist',
                          label: 'Relist',
                          icon: <CircleCheck aria-hidden="true" className="size-4" />,
                          onSelect: () => handleStatusChange(listing, 'active')
                        }
                      : null,
                    actions.remove
                      ? {
                          id: 'remove',
                          label: listing.status === 'sold' ? 'Archive listing' : 'Remove listing',
                          icon: <Trash2 aria-hidden="true" className="size-4" />,
                          onSelect: () => handleStatusChange(listing, 'removed')
                        }
                      : null,
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: <Trash aria-hidden="true" className="size-4" />,
                      danger: true,
                      onSelect: () => handleDelete(listing)
                    }
                  ].filter(Boolean) as {
                    id: string
                    label: string
                    icon: ReactNode
                    danger?: boolean
                    onSelect: () => void
                  }[]
                  return (
                  <TableRow
                    key={listing.id}
                    onClick={() => handleOpen(listing)}
                    title={`Inspect “${listing.title}”`}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <MarketplaceImages images={listing.images} title={listing.title} />
                        <div>
                          <div className="font-semibold">{listing.title}</div>
                          <div className="text-xs text-text-secondary">
                            {listing.category}
                            {listing.condition ? ` · ${listing.condition}` : ''}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <AccountTooltip
                        label={listing.account}
                        health={health}
                        labelIcon={
                          facebookIcon ? (
                            <SocialGlyph icon={facebookIcon} className="size-3" />
                          ) : null
                        }
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
                          <span className="block max-w-48 truncate">{listing.title}</span>
                          <span aria-hidden="true">·</span>
                          <span className="block max-w-48 truncate" title={listing.location}>{listing.location}</span>
                        </span>
                      </AccountTooltip>
                    </TableCell>
                    <TableCell className="max-w-48 text-text-secondary">
                      <span className="flex min-w-0 items-center gap-1.5">
                        {flagForLocation(listing.location)}
                        <span className="min-w-0 flex-1 truncate" title={listing.location}>{listing.location}</span>
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge variant="trigger" color={STATUS_COLOR[listing.status]}>
                        {LISTING_STATUS_LABELS[listing.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-semibold">€{listing.price}</TableCell>
                    <TableCell className="whitespace-nowrap text-right text-text-secondary">
                      {formatPublished(listing.publishedAt)}
                    </TableCell>
<TableCell className="text-right">
        <Dropdown
          aria-label="Listing actions"
          items={menuItems}
        />
        </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </table>
          </Table>
        ) : (
          listings !== null && (
            <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-text-secondary">
              No {filter === 'all' ? '' : LISTING_STATUS_LABELS[filter as ListingStatus] + ' '}listings yet.
            </p>
          )
)}
    </div>
  )
}