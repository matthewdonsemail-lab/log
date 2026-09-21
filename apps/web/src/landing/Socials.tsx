import { useEffect, useId, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { SocialsExplainerWithComparison } from './SocialsExplainer'

const HEADLINE = 'LISTENINNNNNN EVERYWHEREEEEEEEEEEEEEEE'
const FONT = "'Satoshi', 'Inter', system-ui, sans-serif"

/**
 * Full-bleed socials band. A tall track pins the viewport while the page
 * scrolls: the photo settles its zoom on entry and the headline travels
 * across and zooms up until its letters fill the screen.
 *
 * The backdrop hard-swaps between the two listening photos as you
 * scroll (matt <-> mandee), both riding the same zoom so only the
 * photo itself cuts.
 *
 * Everything lives in ONE SVG so the geometry is shared by construction:
 * the white headline and the clipPath letters are the same <text> under the
  * same transform. The white SVG scene is used only for the letter reveal;
  * the final logo lockup is rendered once, correctly, by SocialsExplainer's
  * plain HTML header when the opaque end card cuts in.
 */
export function Socials() {
  const ref = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<SVGTextElement | null>(null)
  const headlineGroupRef = useRef<SVGGElement | null>(null)
  const clipTextRef = useRef<SVGTextElement | null>(null)
  const headlineRef = useRef<SVGTextElement | null>(null)
  const revealRef = useRef<SVGGElement | null>(null)
  const fullRevealRef = useRef<SVGGElement | null>(null)
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const clipId = `lk-socials-clip-${id}`
  const [size, setSize] = useState({ w: 0, h: 0, textW: 0 })

  useEffect(() => {
    const measure = () => {
      const vp = viewportRef.current
      if (!vp) return
      const textW = measureRef.current?.getBBox().width ?? 0
      setSize({ w: vp.clientWidth, h: vp.clientHeight, textW })
    }
    const observer = new ResizeObserver(measure)
    if (viewportRef.current) observer.observe(viewportRef.current)
    void document.fonts.ready.then(measure)
    measure()
    return () => observer.disconnect()
  }, [])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1])
  const y = useTransform(scrollYProgress, [0, 1], [-300, 0])

  const { scrollYProgress: travel } = useScroll({ target: ref, offset: ['start end', 'end end'] })

  // Backdrop alternation: hard swap between all four listening photos.
  const photoRefs = useRef<Array<HTMLImageElement | null>>([])
  const applySwap = (v: number) => {
    const activePhoto = Math.floor(v * 20) % 4
    photoRefs.current.forEach((el, index) => {
      if (el) el.style.visibility = index === activePhoto ? 'visible' : 'hidden'
    })
  }
  useMotionValueEvent(travel, 'change', applySwap)
  useEffect(() => applySwap(travel.get()), [travel])

  // Slide across the viewport while zooming up hard. The end shift parks the
  // upright stem of the "L" over the viewport center; a vertical stem has no
  // slant, so once scale exceeds the ratio (viewport width / stem width) it
  // fully covers the screen with no photo peeking through the edges.
  const textTransform = useTransform(travel, (v) => {
    const cx = size.w / 2
    const cy = size.h / 2
    // At v=1 the text's LEFT edge (the "L") sits on the viewport center.
    // The shift lands at zero by v=0.9 (the furthest this track's scroll
    // reaches) so the huge scale stays centered instead of flinging the
    // text millions of pixels off-screen.
    const shift = 9 * size.textW * Math.max(0, 1 - v / 0.9)
    const grow = 1 + 4000 * v * v * v
    return `translate(${cx + shift} ${cy}) scale(${grow}) translate(${-cx} ${-cy})`
  })
  const applyTransform = (t: string) => {
    headlineGroupRef.current?.setAttribute('transform', t)
    clipTextRef.current?.setAttribute('transform', t)
  }
  useMotionValueEvent(textTransform, 'change', applyTransform)
  useEffect(() => applyTransform(textTransform.get()), [textTransform, size])

  // Crossfade: solid white letters hand over to Stateful seen through them.
  // The destination is a REAL scene, not a fade: once the reveal lands,
  // cut to the opaque end card below at full opacity. Drop back to the
  // transition under 0.85 so scrolling back up replays it.
  const [endSceneOn, setEndSceneOn] = useState(false)
  const headlineOpacity = useTransform(travel, [0.8, 0.9], [1, 0])
  const revealOpacity = useTransform(travel, [0.8, 0.9], [0, 1])
  useMotionValueEvent(headlineOpacity, 'change', (o) => {
    headlineRef.current?.setAttribute('opacity', String(o))
  })
  useMotionValueEvent(revealOpacity, 'change', (o) => {
    revealRef.current?.setAttribute('opacity', String(o))
    fullRevealRef.current?.setAttribute('opacity', String(o))
    if (o >= 1) setEndSceneOn(true)
  })
  useMotionValueEvent(travel, 'change', (v) => {
    if (v < 0.85) setEndSceneOn(false)
  })
  useEffect(() => {
    if (revealOpacity.get() >= 1) setEndSceneOn(true)
  }, [revealOpacity])

  const fontSize = Math.max(16, Math.min(32, size.w * 0.025))

  return (
    <section ref={ref} className="relative h-[280vh] w-full">
      <div ref={viewportRef} className="sticky top-0 h-screen overflow-hidden">
        {[
          '/images/mattlistening.png',
          '/images/johnlistening.png',
          '/images/kennedylistneing.png',
          '/images/mandeeplistening.png',
        ].map((src, index) => (
          <motion.img
            key={src}
            ref={(el) => {
              photoRefs.current[index] = el
            }}
            src={src}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            style={{ scale, y, visibility: index === 0 ? 'visible' : 'hidden' }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ))}
        <h2 className="sr-only">{HEADLINE}</h2>

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <text
                ref={clipTextRef}
                x={size.w / 2}
                y={size.h / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                fontWeight={900}
                style={{ fontFamily: FONT }}
              >
                {HEADLINE}
              </text>
            </clipPath>
          </defs>

          {/* Hidden copy used only to measure the headline width. */}
          <text
            ref={measureRef}
            x={0}
            y={0}
            fontSize={fontSize}
            fontWeight={900}
            style={{ fontFamily: FONT }}
            opacity={0}
          >
            {HEADLINE}
          </text>

          {/* Full Stateful scene, same position, fading in on the same
              timing as the masked reveal (renders under the letters).
              Logo mark only — no SVG-rendered wordmark; see file header. */}
          <g ref={fullRevealRef} opacity={0}>
            <rect x={0} y={0} width={size.w} height={size.h} fill="#ffffff" />
          </g>

          {/* Stateful scene, seen only through the letter shapes. */}
          <g ref={revealRef} opacity={0} clipPath={`url(#${clipId})`}>
            <rect x={0} y={0} width={size.w} height={size.h} fill="#ffffff" />
          </g>

          {/* Solid white headline, same transform as the clip letters. */}
          <g ref={headlineGroupRef}>
            <text
              ref={headlineRef}
              x={size.w / 2}
              y={size.h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fontWeight={900}
              fill="#ffffff"
              opacity={1}
              style={{ fontFamily: FONT }}
            >
              {HEADLINE}
            </text>
          </g>
        </svg>
        {endSceneOn ? (
          // One centered flex slot for the whole end card. SocialsExplainer
          // renders its own brand mark (logo + wordmark, correct HTML text)
          // as its header, then the chain underneath — both parts of the
          // same `mb-auto mt-8` block, so the block anchors near the top of
          // this slot and only grows downward, instead of the wordmark
          // sitting at a fixed y computed separately from a chain that could
          // grow past the bottom of this fixed, non-scrolling viewport.
          <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-white px-6 sm:px-10 [mask-image:linear-gradient(to_bottom,black_88%,transparent)]">
             <div className="w-full">
               <SocialsExplainerWithComparison started={endSceneOn} />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
