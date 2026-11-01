/**
 * Cloud artwork credit (file in public/clouds):
 * - twemoji-cloud.svg: Twemoji by Twitter, CC-BY 4.0
 *   https://github.com/twitter/twemoji (assets/svg/2601.svg)
 */
import type { ReactNode } from 'react'
import Dither from '@/components/Dither'
import './Clouds.css'

const CLOUD_SRC = '/clouds/twemoji-cloud.svg'

type CloudSlot = {
  /** Per-cloud height — mixed large and small so no two clouds match. */
  size: string
  /** Slight horizontal offset so spacing feels organic, not tiled. */
  x: string
  /** Slight vertical nudge within the row. */
  y: string
}

type CloudRow = {
  /** Depth label, used for the CSS class. */
  depth: 'back' | 'mid' | 'front'
  /** Row transparency — farther rows fade into the sky. */
  rowClass: string
  /** Per-cloud sizes/offsets — nearer rows run larger overall. */
  slots: CloudSlot[]
}

const ROWS: CloudRow[] = [
  {
    depth: 'back',
    rowClass: 'opacity-60',
    slots: [
      { size: 'h-12 sm:h-14', x: '', y: 'mt-3' },
      { size: 'h-16 sm:h-20', x: '-ml-4', y: '-mt-2' },
      { size: 'h-10 sm:h-12', x: 'ml-2', y: 'mt-4' },
      { size: 'h-20 sm:h-24', x: '-ml-6', y: '' },
      { size: 'h-14 sm:h-16', x: '-ml-3', y: 'mt-2' },
    ],
  },
  {
    depth: 'mid',
    rowClass: 'opacity-80',
    slots: [
      { size: 'h-20 sm:h-24', x: '', y: '-mt-3' },
      { size: 'h-28 sm:h-32', x: '-ml-6', y: 'mt-2' },
      { size: 'h-16 sm:h-20', x: 'ml-3', y: '-mt-4' },
      { size: 'h-32 sm:h-40', x: '-ml-8', y: '' },
      { size: 'h-24 sm:h-28', x: '-ml-4', y: 'mt-3' },
    ],
  },
  {
    depth: 'front',
    rowClass: 'opacity-100',
    slots: [
      { size: 'h-32 sm:h-40', x: '', y: 'mt-4' },
      { size: 'h-48 sm:h-56', x: '-ml-8', y: '-mt-3' },
      { size: 'h-28 sm:h-32', x: 'ml-4', y: 'mt-5' },
      { size: 'h-40 sm:h-48', x: '-ml-6', y: '' },
      { size: 'h-36 sm:h-44', x: '-ml-5', y: '-mt-2' },
    ],
  },
]

/**
 * How many times the cloud sequence repeats inside each half. One half must
 * stay wider than the viewport on ultrawide screens, otherwise blank gaps
 * show mid-loop. The two halves stay identical so the -50% slide loops
 * seamlessly.
 */
const REPEATS_PER_HALF = 4

/**
 * Full-width looping cloud band. Three depth rows drift at different
 * speeds (far = slow, near = fast) for a parallax feel. Each row renders
 * two identical halves and slides exactly one half-width, so the loop
 * is seamless — the per-cloud offsets are identical in both halves.
 * Motion halts under prefers-reduced-motion (see Clouds.css).
 */
export function Clouds({
  children,
  className = 'h-[40rem]',
  edgeFade = true,
}: {
  children?: ReactNode
  className?: string
  /**
   * Paint the solid side/radial fades inside the band (landing default).
   * Pass false when an outer page vignette already handles the edges, so
   * the hero and the content below share one continuous treatment instead
   * of two stacked ones with a seam between them.
   */
  edgeFade?: boolean
}) {
  return (
    <div aria-hidden={children ? undefined : true} className={`lk-clouds relative w-full overflow-hidden ${className}`}>
      {ROWS.map((row) => (
        <div key={row.depth} className={`lk-cloud-row lk-cloud-row-${row.depth} absolute inset-x-0 z-[1] ${row.rowClass}`}>
          <div className={`lk-cloud-strip lk-cloud-drift-${row.depth} relative flex w-max items-center`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-[2] opacity-30 mix-blend-screen"
              style={{
                maskImage: `url(${CLOUD_SRC})`,
                WebkitMaskImage: `url(${CLOUD_SRC})`,
                maskMode: 'alpha',
                maskRepeat: 'repeat',
                WebkitMaskRepeat: 'repeat',
                maskSize: '180px 120px',
                WebkitMaskSize: '180px 120px',
              }}
            >
              <Dither
                waveColor={[0.7, 0.88, 1]}
                backgroundColor={[0.165, 0.55, 1]}
                colorNum={4}
                pixelSize={3}
                waveAmplitude={0.2}
                waveFrequency={3}
                waveSpeed={0.035}
                enableMouseInteraction={false}
              />
            </div>
            {[0, 1].map((half) => (
              <div key={half} aria-hidden={half === 1} className="relative z-[1] flex items-center gap-20 pr-20">
                {Array.from({ length: REPEATS_PER_HALF }).flatMap((_, repeat) =>
                  row.slots.map((slot, i) => (
                    <img
                      key={`${repeat}-${i}`}
                      src={CLOUD_SRC}
                      alt=""
                      draggable={false}
                      className={`${slot.size} ${slot.x} ${slot.y} w-auto shrink-0 select-none`}
                    />
                  )),
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {edgeFade ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[3]"
            style={{
              background: 'linear-gradient(to right, #2a8cff 0%, transparent 18%, transparent 82%, #2a8cff 100%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[3]"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 42%, rgba(42,140,255,0.18) 72%, #2a8cff 100%)',
            }}
          />
        </>
      ) : null}
      {children ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {children}
        </div>
      ) : null}
    </div>
  )
}
