import { useEffect, useRef, useState } from 'react'
import {
  autoUpdate,
  FloatingPortal,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions
} from '@floating-ui/react'
import { Circle, CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  cn,
  SquircleBorder,
  useComposedRef,
  useSquircleBorder,
  useSquircleClip
} from '@listeningkit/ui'
import { DEFAULT_LISTING_LOCATION, type ListingLocation } from '../lib/listings'

// Grey monochrome basemap (no API key): CartoDB Positron.
const POSITRON_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
const POSITRON_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

const FIELD_RADIUS = 14

/** Free geocoding (no key, CORS-open) — pairs with the OSM/Carto grey tiles. */
const NOMINATIM = 'https://nominatim.openstreetmap.org/search'

type GeoResult = {
  /** Human label, e.g. "Galway, County Galway, Ireland". */
  label: string
  lat: number
  lng: number
}

/** Place search — returns Nominatim rows as lat/lng + display label. */
async function searchPlaces(query: string): Promise<GeoResult[]> {
  const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=jsonv2&limit=6&addressdetails=0`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return []
  const rows = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>
  return rows
    .map((row) => {
      const lat = Number(row.lat)
      const lng = Number(row.lon)
      return Number.isFinite(lat) && Number.isFinite(lng)
        ? { label: row.display_name, lat, lng }
        : null
    })
    .filter((row): row is GeoResult => row !== null)
}

/** Click the map to drop the pinpoint — the Marketplace-style target. */
function PickLayer({
  center,
  onPick
}: {
  center: [number, number]
  onPick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    }
  })
  return (
    <CircleMarker
      center={{
        lat: center[0],
        lng: center[1]
      }}
      radius={9}
      pathOptions={{ color: '#FFFFFF', weight: 3, fillColor: '#2A8CFF', fillOpacity: 1 }}
    />
  )
}

/** Recents the Leaflet view whenever the visible center changes. */
function Center({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo(center, Math.max(map.getZoom(), 13), { duration: 0.45 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], map])
  return null
}

/**
 * Inline grey Leaflet picker — always rendered above the Location input.
 * Click to move the pinpoint; the delivery-radius slider drives the metre
 * circle. Every change commits live via `onChange`, so the draft tracks the
 * map with no confirm step. Search-result picks recents the view there too.
 */
function LocationMap({ value, onChange }: { value: ListingLocation; onChange: (next: ListingLocation) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-60 overflow-hidden rounded-xl border border-[#E4E7EC]">
        <MapContainer
          center={[value.lat, value.lng]}
          zoom={12}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url={POSITRON_URL} attribution={POSITRON_ATTR} />
          <Center center={[value.lat, value.lng]} />
          <PickLayer
            center={[value.lat, value.lng]}
            onPick={(lat, lng) => onChange({ ...value, lat, lng })}
          />
          <Circle
            center={[value.lat, value.lng]}
            radius={value.radiusKm * 1000}
            pathOptions={{
              color: '#2A8CFF',
              weight: 1.5,
              fillColor: '#2A8CFF',
              fillOpacity: 0.08
            }}
          />
        </MapContainer>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="location-radius" className="text-xs font-semibold text-text-secondary">
            Delivery radius
          </label>
          <span className="text-xs font-bold text-text-primary">{value.radiusKm} km</span>
        </div>
        <input
          id="location-radius"
          type="range"
          min={1}
          max={50}
          step={1}
          value={value.radiusKm}
          onChange={(event) => onChange({ ...value, radiusKm: Number(event.target.value) })}
          className="w-full accent-[#2A8CFF]"
        />
      </div>
    </div>
  )
}

/**
 * Location field with typeahead. The grey Leaflet picker sits inline above
 * the search input (always visible): click to move the pinpoint, adjust
 * the delivery-radius slider, and every change commits live. Typing a place
 * drops Nominatim results into a floating portal under the input; picking one
 * autofills the text and drops the pinpoint there. The h-12 squircle search
 * field keeps the row height uniform with every other form field.
 */
export function LocationField({
  value,
  point,
  onChange,
  onPointChange
}: {
  value: string
  onChange: (next: string) => void
  point: ListingLocation
  onPointChange: (next: ListingLocation) => void
}) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<GeoResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)

  // Current point in a ref so a result pick preserves the chosen radius.
  const pointRef = useRef(point)
  pointRef.current = point

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLUListElement>(null)

  const inputClip = useSquircleClip<HTMLInputElement>(FIELD_RADIUS)
  const inputBorder = useSquircleBorder<HTMLInputElement>(FIELD_RADIUS + 1)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (next: boolean) => setOpen(next),
    placement: 'bottom-start',
    strategy: 'fixed',
    transform: false,
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, update, {
        ancestorScroll: true,
        ancestorResize: true,
        elementResize: true
      }),
    middleware: [offset(6), flip({ padding: 6 }), shift({ padding: 6 })]
  })

  const dismiss = useDismiss(context, { escapeKey: true })
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss])

  // Debounced place search while the dropdown is open.
  useEffect(() => {
    if (!open) {
      setResults([])
      return
    }
    const query = value.trim()
    if (query.length < 2) {
      setResults([])
      return
    }
    let cancelled = false
    const handle = setTimeout(() => {
      searchPlaces(query).then((found) => {
        if (!cancelled) {
          setResults(found)
          setActiveIndex(-1)
        }
      })
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(handle)
    }
  }, [value, open])

  // Keep the highlighted row in view.
  useEffect(() => {
    if (activeIndex < 0) return
    const el = resultsRef.current?.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const pick = (result: GeoResult) => {
    onPointChange({ lat: result.lat, lng: result.lng, radiusKm: pointRef.current.radiusKm })
    onChange(result.label)
    setOpen(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = event
    if (key === 'ArrowDown' && !open && value.trim().length >= 2) {
      setOpen(true)
      event.preventDefault()
      return
    }
    if (!open) return
    const length = results.length
    if (key === 'ArrowDown') setActiveIndex((index) => Math.min(index + 1, length - 1))
    else if (key === 'ArrowUp') setActiveIndex((index) => Math.max(index - 1, 0))
    else if (key === 'Home') setActiveIndex(0)
    else if (key === 'End') setActiveIndex(length - 1)
    else if (key === 'Enter' && activeIndex >= 0) {
      pick(results[activeIndex])
      event.preventDefault()
    } else if (key === 'Escape') {
      setOpen(false)
      event.preventDefault()
    }
  }

  const setInputRef = useComposedRef(refs.setReference, inputRef, inputClip.ref, inputBorder.ref)
  const referenceProps = getReferenceProps({
    role: 'combobox',
    'aria-expanded': open,
    'aria-controls': 'location-results',
    'aria-autocomplete': 'list',
    'aria-activedescendant':
      activeIndex >= 0 ? `location-option-${activeIndex}` : undefined
  })

  return (
    <div className="flex flex-col gap-3">
      <LocationMap value={point} onChange={onPointChange} />
      <div className="relative min-w-0">
        <input
          ref={setInputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => value.trim().length >= 2 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search a place — e.g. Galway"
          autoComplete="off"
          style={inputClip.style}
          aria-label="Location"
          className="relative h-12 w-full bg-white pl-4 pr-10 text-sm text-text-primary placeholder:text-text-tertiary outline-none"
          {...referenceProps}
        />
        <SquircleBorder
          border={inputBorder.state}
          stroke={open ? '#2A8CFF' : '#E4E7EC'}
          strokeWidth={open ? 2 : 1.5}
          transitionStroke={false}
        />
      </div>

      <FloatingPortal root={typeof document !== 'undefined' ? document.body : undefined}>
        {open ? (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 w-[min(20rem,calc(100vw-3rem))]"
          >
            <div className="relative overflow-hidden rounded-[14px] border border-[#E4E7EC] bg-white shadow-lg">
              <ul id="location-results" ref={resultsRef} className="max-h-64 overflow-auto py-1">
                {results.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-text-secondary">
                    No places found for “{value.trim()}”
                  </li>
                ) : (
                  results.map((result, index) => {
                    const active = index === activeIndex
                    const [primary, ...rest] = result.label.split(',')
                    return (
                      <li
                        key={`${result.lat},${result.lng}`}
                        id={`location-option-${index}`}
                        role="option"
                        aria-selected={active}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => pick(result)}
                        className={cn(
                          'flex cursor-pointer flex-col gap-0.5 px-4 py-2.5 text-sm',
                          active ? 'bg-black/[0.04]' : 'bg-white'
                        )}
                      >
                        <span className="font-semibold text-text-primary">{primary}</span>
                        {rest.length > 0 ? (
                          <span className="text-xs text-text-tertiary">{rest.join(',').trim()}</span>
                        ) : null}
                      </li>
                    )
                    })
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </FloatingPortal>
    </div>
  )
}

export { DEFAULT_LISTING_LOCATION }