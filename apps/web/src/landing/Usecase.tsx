import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button, cn } from '@listeningkit/ui'
import './Usecase.css'

type UsecaseSlide = {
  title: string
  body: string
}

const SLIDES: UsecaseSlide[] = [
  {
    title: 'Turn comments into conversations that sell',
    body: '“How much is this?” or “Do you ship to Mars?” Instant reply. Boom — wallets open, money lands, and you didn’t even blink.',
  },
  {
    title: 'Personal conversations; Profitable conversations',
    body: 'Identify high-intent leads, nurture relationships, and close sales — all through rapid, authentic, automated conversation.',
  },
  {
    title: 'Engage followers instantly with automatic replies',
    body: 'Respond instantly to comments, DMs, and Story mentions across Reddit, X, and Facebook.',
  },
  {
    title: 'Expand your empire',
    body: 'Don’t leave your success to chance: grow across platforms, build your lists, and diversify revenue in one move.',
  },
]

function renderBody(body: string) {
  return body.split(/(“[^”]*”)/g).map((part, index) =>
    /^“[^”]*”$/.test(part) ? (
      <span key={index} className="font-black text-[#2A8CFF]">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  )
}

/**
 * Scroll-driven use-case section. A tall track pins a full-viewport
 * two-column grid while the page scrolls: copy crossfades on the left,
 * visuals crossfade on the right, one slide per quarter of the track.
 */
export function Usecase() {
  const trackRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(0)
  const [fill, setFill] = useState(0)
  const [enter, setEnter] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = trackRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / total))
      // 0 as the track first enters the viewport, 1 once pinned.
      const entered = Math.min(1, Math.max(0, 1 - rect.top / window.innerHeight))
      setEnter((prev) => (Math.abs(prev - entered) < 0.001 ? prev : entered))
       setActive((prev) => {
         // Keep a full quarter of the scroll track for each visual card.
         // Rounding at the midpoint makes each card take over predictably.
         const next = Math.min(SLIDES.length - 1, Math.floor(progress * SLIDES.length + 0.5))
        return prev === next ? prev : next
      })
      setFill((prev) => {
        const next = progress * SLIDES.length
        return Math.abs(prev - next) < 0.001 ? prev : next
      })
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
    <section ref={trackRef} className="relative hidden bg-white md:block" style={{ height: 'calc(100vh + 4800px)' }}>
      <div className="h-full w-full">
        <div className="sticky left-0 top-0 grid h-screen w-full grid-cols-2">
          <div className="flex h-screen w-full justify-center">
            <div className="relative mx-6 flex h-full w-full max-w-3xl justify-center text-center">
              <div className="absolute left-1/2 top-[9.8rem] flex -translate-x-1/2 items-center gap-2">
                {SLIDES.map((slide, i) => {
                  const barFill = Math.min(1, Math.max(0, fill - i))
                  return (
                    <span key={slide.title} className="h-2 w-10 overflow-hidden rounded-full bg-ink/15">
                      <motion.span
                        className="block h-full rounded-full bg-[#2A8CFF]"
                        animate={{ width: `${Math.round(barFill * 100)}%` }}
                        transition={{ ease: 'linear', duration: 0.1 }}
                      />
                    </span>
                  )
                })}
              </div>
              {SLIDES.map((slide, i) => (
                <div
                  key={`${slide.title}-${i === active ? 'on' : 'off'}`}
                  aria-hidden={i !== active}
                  className={cn(
                    'lk-usecase-stage absolute inset-0 flex items-center justify-center transition-opacity duration-700',
                    i === active ? 'opacity-100' : 'pointer-events-none opacity-0',
                  )}
                >
                  <div className={cn('w-full text-center text-balance', i === active && 'lk-flip-in')}>
                    <h2 className="text-5xl font-black leading-tight text-ink">{slide.title}</h2>
                    <p className="mx-auto mt-6 max-w-xl text-xl leading-snug text-ink/70">{renderBody(slide.body)}</p>
                  </div>
                </div>
              ))}
              <div className="absolute inset-x-0 bottom-8 z-[1]">
                <Button
                  variant="blue"
                  asChild
                  className="w-full whitespace-nowrap rounded-xl px-8 py-5 text-xl font-bold uppercase tracking-wide"
                >
                  <Link to="/onboarding" className="inline-block w-full text-center">
                    Get started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div
            className="relative flex h-screen w-full items-center justify-center bg-white px-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(42,140,255,${enter.toFixed(3)}) 2px, transparent 2px), linear-gradient(to bottom, rgba(42,140,255,${enter.toFixed(3)}) 2px, transparent 2px)`,
                backgroundSize: 'calc(100% / 3) calc(100% / 3)',
                maskImage: `linear-gradient(to top, black ${(enter * 100).toFixed(1)}%, transparent ${Math.min(100, enter * 100 + 15).toFixed(1)}%)`,
                WebkitMaskImage: `linear-gradient(to top, black ${(enter * 100).toFixed(1)}%, transparent ${Math.min(100, enter * 100 + 15).toFixed(1)}%)`,
              }}
            />
            <div className="relative z-[1] h-screen w-full overflow-hidden">
              <motion.div
                animate={{ y: `${-active * 25}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-[400%] w-full flex-col"
              >
                {SLIDES.map((slide, i) => (
                  <div key={slide.title} className="flex h-1/4 w-full shrink-0 items-center justify-center pt-[9.2rem]">
                    <div className="mx-auto flex aspect-[9/16] h-[80vh] max-h-[80vh] w-auto max-w-[80%] items-center justify-center rounded-[2rem] bg-slate-200 p-12 text-center">
                      <div className="max-w-lg">
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Use case {i + 1}</p>
                        <p className="mt-4 text-3xl font-black leading-tight text-slate-700">{slide.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="w-full bg-white md:hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-16">
        {SLIDES.map((slide) => (
          <div key={slide.title} className="border-t border-black/10 py-10 first:border-t-0 first:pt-0">
            <h2 className="text-3xl font-black leading-tight text-ink">{slide.title}</h2>
            <p className="mt-3 text-base leading-snug text-ink/70">{renderBody(slide.body)}</p>
          </div>
        ))}
        <Button
          variant="blue"
          asChild
          className="mt-4 w-full rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide"
        >
          <Link to="/onboarding" className="inline-block w-full text-center">
            Get started
          </Link>
        </Button>
      </div>
    </section>
    </>
  )
}
