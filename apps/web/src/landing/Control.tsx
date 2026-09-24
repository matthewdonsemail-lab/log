import { useEffect } from 'react'
import { motion } from 'motion/react'
import { siGithub } from 'simple-icons'
import Dither from '@/components/Dither'

const TEAM_PHOTOS = [
  '/images/mattlistening.webp',
  '/images/johnlistening.webp',
  '/images/kennedylistneing.webp',
  '/images/mandeeplistening.webp',
]

const EAR_IMAGES = [
  'ear1.webp',
  'ear2.webp',
  'ear3.webp',
  'ear4.webp',
  'ear5.webp',
  'ear6.webp',
  'ear7.webp',
  'ear8.webp',
]
const EAR_POSITIONS = [
  'left-[-16rem] lg:left-[-22rem] xl:left-[-26rem] top-[3%]',
  'right-[-16rem] lg:right-[-22rem] xl:right-[-26rem] top-[12%]',
  'left-[-14rem] lg:left-[-20rem] xl:left-[-24rem] top-[22%]',
  'right-[-14rem] lg:right-[-20rem] xl:right-[-24rem] top-[31%]',
  'left-[-18rem] lg:left-[-24rem] xl:left-[-28rem] top-[41%]',
  'right-[-16rem] lg:right-[-22rem] xl:right-[-26rem] top-[51%]',
  'left-[-14rem] lg:left-[-20rem] xl:left-[-24rem] top-[60%]',
  'right-[-16rem] lg:right-[-22rem] xl:right-[-26rem] top-[70%]',
]
const EAR_SIZES = [
  'size-72 lg:size-96 xl:size-[28rem]',
  'size-80 lg:size-[26rem] xl:size-[32rem]',
  'size-64 lg:size-80 xl:size-96',
  'size-96 lg:size-[30rem] xl:size-[36rem]',
  'size-80 lg:size-[26rem] xl:size-[30rem]',
  'size-64 lg:size-84 xl:size-96',
  'size-88 lg:size-[28rem] xl:size-[32rem]',
  'size-72 lg:size-96 xl:size-[28rem]',
]
const EAR_FILTERS = [
  'hue-rotate(90deg) saturate(2.3) brightness(1.1)',
  'hue-rotate(180deg) saturate(2.1) brightness(1.05)',
  'hue-rotate(270deg) saturate(2) contrast(1.15)',
  'hue-rotate(45deg) saturate(2.4) brightness(1.1)',
  'hue-rotate(210deg) saturate(2.2) brightness(1.15)',
  'hue-rotate(330deg) saturate(2.5) contrast(1.1)',
  'hue-rotate(135deg) saturate(2) brightness(1.05)',
  'hue-rotate(300deg) saturate(2.2) brightness(1.2)',
]
const EAR_JITTER = [true, false, false, false, true, false, false, false]

/**
 * Closing statement beneath the social-listening reveal.
 * The message is intentionally direct: ownership and control are the point.
 */
export function Control() {
  useEffect(() => {
    const SCRIPT_SRC = 'https://platform.x.com/widgets.js'
    const win = window as unknown as { twttr?: { widgets?: { load?: () => void } } }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
    if (!existing) {
      const script = document.createElement('script')
      script.src = SCRIPT_SRC
      script.async = true
      script.charset = 'utf-8'
      script.onload = () => {
        win.twttr?.widgets?.load?.()
      }
      document.body.appendChild(script)
    } else {
      win.twttr?.widgets?.load?.()
    }
  }, [])

  return (
    <section id="why-free" className="relative overflow-hidden bg-white px-6 pb-24 text-center sm:px-10 sm:pb-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-[30%] md:block" style={{ maskImage: 'linear-gradient(to right, black 45%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 45%, transparent 100%)' }}>
        <Dither
          waveColor={[0.16, 0.55, 1]}
          backgroundColor={[1, 1, 1]}
          colorNum={4}
          pixelSize={3}
          waveAmplitude={0.25}
          waveFrequency={3}
          waveSpeed={0.04}
          enableMouseInteraction={false}
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[30%] md:block" style={{ maskImage: 'linear-gradient(to left, black 45%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 45%, transparent 100%)' }}>
        <Dither
          waveColor={[0.16, 0.55, 1]}
          backgroundColor={[1, 1, 1]}
          colorNum={4}
          pixelSize={3}
          waveAmplitude={0.25}
          waveFrequency={3}
          waveSpeed={0.04}
          enableMouseInteraction={false}
        />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-white via-white/80 to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:px-12 sm:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-[-3rem] z-10 hidden md:block">
          {EAR_IMAGES.map((image, index) => (
            <motion.div
              key={image}
              className={`absolute ${EAR_SIZES[index]} ${EAR_POSITIONS[index]}`}
              animate={{
                y: [-6, 6, -6],
                rotate: [-3, 3, -3],
              }}
              transition={{
                duration: 5 + index * 0.4,
                delay: index * 0.18,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.img
                src={`/images/ears/${image}`}
                alt=""
                style={{ filter: EAR_FILTERS[index] }}
                className="size-full object-contain"
                initial={{ scale: 0 }}
                whileInView={{ scale: [0, 1.14, 0.96, 1] }}
                viewport={{ once: true, amount: 0.2 }}
                animate={
                  EAR_JITTER[index]
                    ? {
                        x: [0, -5, 4, -4, 5, -3, 4, -2, 0],
                        y: [0, 4, -5, 3, -4, 5, -2, 3, 0],
                        rotate: [-3, -9, 8, -8, 7, -6, 6, -3],
                      }
                    : undefined
                }
                transition={{
                  scale: { duration: 0.65, delay: index * 0.18, ease: [0.34, 1.56, 0.64, 1] },
                  x: { duration: 0.22, repeat: Infinity, ease: 'easeInOut' },
                  y: { duration: 0.19, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 0.25, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            </motion.div>
          ))}
        </div>
        <div className="relative z-20">
          <div className="mb-10 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="ListeningKit logo" className="size-14 rounded-[22%] sm:size-20" />
            <span className="text-4xl font-black leading-none text-[#2A8CFF] sm:text-6xl">ListeningKit</span>
          </div>
          </div>
        <h2 className="text-3xl font-black leading-[0.98] text-[#2A8CFF] sm:text-5xl lg:text-6xl">
          The most Intelligent Social Listening Tools are the ones you control!
        </h2>
        <p className="mx-auto mt-8 max-w-2xl text-xl leading-snug text-[#0D2A4C]/70 sm:text-2xl">
          You don&apos;t own anything when you use tools like{' '}
          <a
            href="https://octolens.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2A8CFF] underline decoration-dashed underline-offset-4"
          >
            Octolens
          </a>{' '}
          and{' '}
          <a
            href="https://stalkr.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2A8CFF] underline decoration-dashed underline-offset-4"
          >
            Stalkr
          </a>
          .
        </p>
        <div className="mx-auto mt-12 flex w-full justify-center overflow-visible">
          <div className="flex w-full justify-center [zoom:1] sm:[zoom:1.25] md:[zoom:1.4] lg:[zoom:1.5] [&_.twitter-tweet]:!mx-auto [&_.twitter-tweet]:!rounded-3xl [&_.twitter-tweet]:!overflow-hidden [&_iframe]:!mx-auto [&_iframe]:!rounded-3xl [&_iframe]:!overflow-hidden">
            <div className="overflow-hidden rounded-3xl">
              <blockquote className="twitter-tweet" data-media-max-width="1000" data-width="700">
                <p lang="en" dir="ltr">
                  made a free tool to KILL <a href="https://x.com/Octolens?ref_src=twsrc%5Etfw">@Octolens</a> $1M (company btw) for the <a href="https://x.com/convex?ref_src=twsrc%5Etfw">@convex</a> hackathon. I&#39;ll show you a GTM strat no one is talking about... setup today for free.{' '}
                  <br />
                  <br />
                  We use <a href="https://x.com/treg_ai?ref_src=twsrc%5Etfw">@treg_ai</a> to find out our competitors <a href="https://x.com/firecrawl?ref_src=twsrc%5Etfw">@firecrawl</a> to find good comms and <a href="https://x.com/typesafeai?ref_src=twsrc%5Etfw">@typesafeai</a> for if content is relevant🤯🤯 <a href="https://t.co/GK2WPMh6qv">https://t.co/GK2WPMh6qv</a> <a href="https://t.co/z3JYP1fT3Q">pic.twitter.com/z3JYP1fT3Q</a>
                </p>
                &mdash; matt. (@matthewsoldit) <a href="https://x.com/matthewsoldit/status/2102520314483941446?ref_src=twsrc%5Etfw">September 22, 2026</a>
              </blockquote>
            </div>
          </div>
        </div>
        <p
          className="mx-auto mt-12 max-w-4xl text-center text-lg text-slate-500 sm:text-xl md:text-2xl lg:whitespace-nowrap"
          style={{ fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }}
        >
          Check out our repo and leave a star you&apos;ll definitely not regret it
        </p>
        <a
          href="https://github.com/matthewdonsemail-lab/log"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mt-4 flex min-h-0 w-full max-w-3xl items-center gap-4 overflow-hidden rounded-3xl px-6 py-6 text-left outline outline-1 outline-neutral-300 shadow-xl transition-all hover:scale-[1.01] hover:brightness-105 sm:gap-6 sm:px-8 sm:py-7 md:gap-8 md:rounded-[40px] md:px-10 md:py-8 lg:max-w-4xl"
          style={{
            backgroundImage:
              'linear-gradient(180deg, #117EFF -12.71%, #1E88FF 44.69%, #5EA7FF 102.1%)',
            boxShadow: 'inset 0 2px 30px #5EA7FF',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            role="img"
            aria-label="GitHub"
            className="pointer-events-none size-14 shrink-0 text-white opacity-95 sm:size-16 md:size-24 lg:size-28"
            fill="currentColor"
          >
            <path d={siGithub.path} />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold leading-snug text-white/90 sm:text-base md:text-xl">
              Get Log by ListeningKit
            </p>
            <p className="mt-1.5 text-xl font-black leading-tight text-white sm:mt-2 sm:text-2xl md:text-3xl lg:text-4xl lg:whitespace-nowrap">
              getting{' '}
              <img
                src="/logos/jobs.svg"
                alt="jobs"
                className="mx-1 inline-block h-[0.85em] w-auto align-[-0.08em]"
              />{' '}
              never been this easy!
            </p>
          </div>
        </a>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 px-2 sm:flex-row sm:gap-5">
          <div className="flex shrink-0 gap-1.5">
            {TEAM_PHOTOS.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden="true"
                className="size-10 rounded-lg border-2 border-[#2A8CFF] object-cover sm:size-12"
              />
            ))}
          </div>
          <p className="max-w-md text-center text-sm font-bold leading-tight text-slate-500 sm:text-left sm:text-base">
            shipped by{' '}
            <span className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">
              four hackers with zero chill
            </span>{' '}
            who think paying $400/mo for social listening is pure robbery.
          </p>
        </div>
        </div>
      </div>
    </section>
  )
}
