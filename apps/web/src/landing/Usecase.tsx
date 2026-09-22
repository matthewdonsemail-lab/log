import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button, cn, useSquircleClip } from '@listeningkit/ui'
import Dither from '@/components/Dither'
import './Usecase.css'

type UsecaseSlide = {
  title: string
  body: string
}

const SLIDES: UsecaseSlide[] = [
  {
    title: 'Spot the emergency the second it’s posted',
    body: 'Real posts stream in — “leak in my toilet”, “pipe burst”, “any good plumbers in Dallas?” — each one matched by keyword, each one answered with auto-reply to all brand mentions.',
  },
  {
    title: 'The AI bins the junk, keeps the jobs',
    body: 'It semantically analyses what’s actually being said — a joke about “kidney pie” is noise, while a genuine “leak in my toilet” signals intent. The noise is filtered out so only real customers reach you.',
  },
  {
    title: 'From first message to paid in one chat',
    body: 'The conversation runs itself — “we can get out in the next 1-2 hours”, a Stripe link takes the card payment, the address lands, “thank you, excellent”. Quote to cash without lifting a finger.',
  },
  {
    title: 'Let AI manage hundreds of conversations at once',
    body: 'Keep “every chat” moving without losing the human thread — let AI handle the “follow-ups”, surface the “deals that matter”, and help you close more of them.',
  },
]

const USECASE_EAR_SETS = [
  [
    { src: '/images/ears/ear1.png', className: 'left-[-4%] top-[8%] size-64', rotate: -3 },
    { src: '/images/ears/ear4.png', className: 'right-[-3%] top-[34%] size-80', rotate: 2 },
    { src: '/images/ears/ear7.png', className: 'left-[4%] bottom-[4%] size-72', rotate: -2 },
  ],
  [
    { src: '/images/ears/ear2.png', className: 'right-[-4%] top-[6%] size-72', rotate: 2 },
    { src: '/images/ears/ear5.png', className: 'left-[-4%] top-[40%] size-96', rotate: -3 },
    { src: '/images/ears/ear8.png', className: 'right-[4%] bottom-[3%] size-64', rotate: 3 },
  ],
  [
    { src: '/images/ears/ear3.png', className: 'left-[-2%] top-[4%] size-80', rotate: -2 },
    { src: '/images/ears/ear6.png', className: 'right-[-5%] top-[38%] size-64', rotate: 3 },
    { src: '/images/ears/ear1.png', className: 'left-[6%] bottom-[2%] size-96', rotate: -3 },
  ],
  [
    { src: '/images/ears/ear4.png', className: 'right-[-4%] top-[2%] size-96', rotate: 3 },
    { src: '/images/ears/ear7.png', className: 'left-[-5%] top-[36%] size-72', rotate: -2 },
    { src: '/images/ears/ear2.png', className: 'right-[5%] bottom-[1%] size-80', rotate: 2 },
  ],
]

/**
 * Steps render wordmark SVGs inline: emergency.svg in step 1, jobs.svg in
 * step 2, paid.svg where the title says "paid", hoondreds.svg where it says
 * "hundreds".
 */
function SlideTitle({ index, title, className }: { index: number; title: string; className: string }) {
  if (index === 0)
    return (
      <h2 className={className}>
        Spot the{' '}
        <img src="/logos/emergency.svg" alt="emergency" className="inline h-[0.9em] w-auto" />{' '}
        the second it’s posted
      </h2>
    )
  if (index === 1)
    return (
      <h2 className={className}>
        The AI bins the junk, keeps the{' '}
        <img src="/logos/jobs.svg" alt="jobs" className="inline h-[0.9em] w-auto" />
      </h2>
    )
  if (index === 2)
    return (
      <h2 className={className}>
        From first message to{' '}
        <img src="/logos/paid.svg" alt="paid" className="inline h-[0.9em] w-auto" />{' '}
        in one chat
      </h2>
    )
  if (index === 3)
    return (
      <h2 className={className}>
        Let AI manage{' '}
        <img src="/logos/hoondreds.svg" alt="hundreds" className="inline h-[0.9em] w-auto" />{' '}
        of conversations at once
      </h2>
    )
  return <h2 className={className}>{title}</h2>
}

/**
 * Video slide marker shown above the copy on each left-side slide.
 * Plays `/video/usecase/<n>.mp4` inside the blue squircle with a faint
 * white vignette; falls back to the number badge until that clip lands.
 */
function SlideMarker({ index }: { index: number }) {
  const clip = useSquircleClip<HTMLDivElement>(18)
  const [missing, setMissing] = useState(false)
  if (missing) {
    return (
      <div
        ref={clip.ref}
        style={clip.style}
        aria-hidden
        className="mx-auto mb-6 flex size-14 items-center justify-center bg-[#2A8CFF] text-xl font-black text-white"
      >
        {index + 1}
      </div>
    )
  }
  return (
    <div
      ref={clip.ref}
      style={clip.style}
      aria-hidden
      className="relative mx-auto mb-6 size-14 overflow-hidden bg-[#2A8CFF]"
    >
      <video
        src={`/video/usecase/${index + 1}.mp4`}
        autoPlay
        muted
        loop
        playsInline
        onError={() => setMissing(true)}
        className="size-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(255,255,255,0.55) 100%)' }}
      />
    </div>
  )
}

function renderBody(body: string) {
  return body.split(/(“[^”]*”)/g).map((part, index) =>
    /^“[^”]*”$/.test(part) ? (
      <span key={index} className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">
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
    <section ref={trackRef} className="relative hidden overflow-x-clip bg-white md:block" style={{ height: 'calc(100vh + 4800px)' }}>
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
                    <SlideMarker index={i} />
                    <SlideTitle index={i} title={slide.title} className="text-5xl font-black leading-tight text-ink" />
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
            style={{ backgroundColor: `rgba(42, 140, 255, ${(enter * 0.09).toFixed(3)})` }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-25">
              <Dither
                waveColor={[0.16, 0.55, 1]}
                backgroundColor={[1, 1, 1]}
                colorNum={4}
                pixelSize={3}
                waveAmplitude={0.2}
                waveFrequency={3}
                waveSpeed={0.035}
                enableMouseInteraction={false}
              />
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(42,140,255,${enter.toFixed(3)}) 2px, transparent 2px), linear-gradient(to bottom, rgba(42,140,255,${enter.toFixed(3)}) 2px, transparent 2px)`,
                backgroundSize: 'calc(100% / 3) calc(100% / 3)',
                maskImage: `linear-gradient(to top, black ${(enter * 100).toFixed(1)}%, transparent ${Math.min(100, enter * 100 + 15).toFixed(1)}%)`,
                WebkitMaskImage: `linear-gradient(to top, black ${(enter * 100).toFixed(1)}%, transparent ${Math.min(100, enter * 100 + 15).toFixed(1)}%)`,
              }}
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3] hidden md:block">
              {USECASE_EAR_SETS[active].map((ear, index) => (
                <motion.img
                  key={`${active}-${ear.src}`}
                  src={ear.src}
                  alt=""
                  className={`absolute object-contain ${ear.className}`}
                  style={{ y: -fill * (8 + index * 4) }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: [0, 1.12, 0.97, 1] }}
                  viewport={{ once: true, amount: 0.2 }}
                  animate={{ rotate: [ear.rotate, -ear.rotate, ear.rotate] }}
                  transition={{
                    scale: { duration: 0.65, delay: index * 0.12, ease: [0.34, 1.56, 0.64, 1] },
                    rotate: { duration: 4 + index, repeat: Infinity, ease: 'easeInOut' },
                  }}
                />
              ))}
            </div>
            <div className="relative z-[2] h-screen w-full overflow-hidden">
              <motion.div
                animate={{ y: `${-active * 25}%` }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-[400%] w-full flex-col"
              >
                {SLIDES.map((slide, i) => (
                  <div key={slide.title} className="flex h-1/4 w-full shrink-0 items-center justify-center pt-[9.2rem]">
                    {i === 0 ? (
                      <video
                        src="/video/Facebook1.webm"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="mx-auto aspect-[9/16] h-[80vh] max-h-[80vh] w-auto max-w-[80%] object-cover"
                      />
                    ) : i === 1 ? (
                      <video
                        src="/video/Facebook2.webm"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="mx-auto aspect-[9/16] h-[80vh] max-h-[80vh] w-auto max-w-[80%] object-cover"
                      />
                    ) : i === 2 ? (
                      <video
                        src="/video/Facebook3.webm"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="mx-auto aspect-[9/16] h-[80vh] max-h-[80vh] w-auto max-w-[80%] object-cover"
                      />
                    ) : i === 3 ? (
                      <video
                        src="/video/Facebook4.webm"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="mx-auto aspect-[9/16] h-[80vh] max-h-[80vh] w-auto max-w-[80%] object-cover"
                      />
                    ) : (
                      <div className="mx-auto flex aspect-[9/16] h-[80vh] max-h-[80vh] w-auto max-w-[80%] items-center justify-center overflow-hidden rounded-[2rem] bg-slate-200 text-center">
                        <div className="max-w-lg p-12">
                          <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Use case {i + 1}</p>
                          <p className="mt-4 text-3xl font-black leading-tight text-slate-700">{slide.title}</p>
                        </div>
                      </div>
                    )}
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
        {SLIDES.map((slide, i) => (
          <div key={slide.title} className="border-t border-black/10 py-10 first:border-t-0 first:pt-0">
            <SlideTitle index={i} title={slide.title} className="text-3xl font-black leading-tight text-ink" />
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
