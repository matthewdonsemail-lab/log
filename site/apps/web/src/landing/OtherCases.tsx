import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBolt, faChartColumn, faFilter, faUsers } from '@fortawesome/free-solid-svg-icons'
import Dither from '@/components/Dither'
import { LazyVideo } from './LazyVideo'

type DitherVariant = {
  waveSpeed: number
  waveFrequency: number
  waveAmplitude: number
  pixelSize: number
  colorNum: number
}

type OtherCase = {
  icon: IconDefinition
  title: string
  description: string
  videoSrc: string
  dither: DitherVariant
}

const EYEBROW = 'Made for every trade'
const LEDE =
  'Plumbing is where ListeningKit got its start, but the same pipeline works for __any trade__ that lives on posts from people in need: your __keywords__, your __platforms__, your __replies__, your __payments__, everywhere your customers are **asking.**'

const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'

function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).map((part, index): ReactNode => {
        if (part.startsWith('**')) return <span key={index} className={STICKER}>{part.slice(2, -2)}</span>
        if (part.startsWith('__'))
          return (
            <span key={index} className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">
              {part.slice(2, -2)}
            </span>
          )
        return <span key={index}>{part}</span>
      })}
    </>
  )
}

/** The four cards spin off the Usecase walkthrough: same pipeline, new angle per video. */
const CASES: OtherCase[] = [
  {
    icon: faUsers,
    title: 'Catch every **cry for help**',
    description:
      'Someone posts about a __burst pipe at midnight__. Your keywords match it, and the reply lands __before a competitor__ even wakes up.',
    videoSrc: '/video/Facebook1.webm',
    dither: { waveSpeed: 0.035, waveFrequency: 3, waveAmplitude: 0.2, pixelSize: 3, colorNum: 4 },
  },
  {
    icon: faFilter,
    title: 'Skip the noise, **keep the jobs**',
    description:
      'Jokes and rants get __filtered out__. Only posts with __real intent__ reach your inbox, so every reply counts.',
    videoSrc: '/video/Facebook2.webm',
    dither: { waveSpeed: 0.05, waveFrequency: 4, waveAmplitude: 0.3, pixelSize: 2, colorNum: 5 },
  },
  {
    icon: faBolt,
    title: 'Quote to cash **in one chat**',
    description:
      'Availability, __Stripe link__, address confirmed. The whole job __books itself__ while you are on the tools.',
    videoSrc: '/video/Facebook3.webm',
    dither: { waveSpeed: 0.025, waveFrequency: 2, waveAmplitude: 0.25, pixelSize: 4, colorNum: 4 },
  },
  {
    icon: faChartColumn,
    title: 'Hundreds of chats, **zero chaos**',
    description:
      'Follow-ups __go out on their own__ and __hot deals__ surface to the top. You just show up and close.',
    videoSrc: '/video/Facebook4.webm',
    dither: { waveSpeed: 0.06, waveFrequency: 5, waveAmplitude: 0.15, pixelSize: 2, colorNum: 6 },
  },
]

function CaseCard({ item, index }: { item: OtherCase; index: number }) {
  return (
    <motion.li
      className="p-5 sm:p-6"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: (index % 2) * 0.08 }}
    >
      <div className="flex flex-col gap-3">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-white">
          <div aria-hidden className="absolute inset-0">
            <Dither
              waveColor={[0.16, 0.55, 1]}
              backgroundColor={[1, 1, 1]}
              colorNum={item.dither.colorNum}
              pixelSize={item.dither.pixelSize}
              waveAmplitude={item.dither.waveAmplitude}
              waveFrequency={item.dither.waveFrequency}
              waveSpeed={item.dither.waveSpeed}
              enableMouseInteraction={false}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <LazyVideo
              src={item.videoSrc}
              autoPlay
              muted
              loop
              playsInline
              className="aspect-[9/16] h-[70%] w-auto max-w-[80%] object-cover"
            />
          </div>
        </div>
        <div className="mt-1 flex items-start gap-3">
          <span className="button-glow grid size-9 shrink-0 place-items-center rounded-lg text-white shadow-[0_3px_0_#1A5FC8]">
            <FontAwesomeIcon icon={item.icon} className="text-[15px]" />
          </span>
          <h3 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-[#0D2A4C]">
            <Marked text={item.title} />
          </h3>
        </div>
        <p className="text-lg font-semibold leading-snug text-[#0D2A4C]/80">
          <Marked text={item.description} />
        </p>
      </div>
    </motion.li>
  )
}

/**
 * White-background band: sticky aside on the left (eyebrow in a gray
 * rounded pill, headline, lede), a 2-column grid of case cards on the
 * right — each card spins off a Usecase slide, with a blue-dither media
 * block (varied per card) playing a small cut of the matching video.
 */
export function OtherCases() {
  return (
    <section id="other-cases" className="w-full bg-white text-ink">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 sm:px-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-[14px] font-bold text-[#2A8CFF] shadow-[0_0_0_1px_#C9E3FF,0_3px_0_#B5D6FF]">
              <FontAwesomeIcon icon={faBolt} className="text-[13px]" />
              {EYEBROW}
            </span>
            <h2 className="text-title mt-5 text-[#0D2A4C]">
              Other cases,{' '}
              <span className={STICKER}>one listening kit.</span>
            </h2>
            <p className="text-lede mt-5 font-semibold text-[#0D2A4C]/85">
              <Marked text={LEDE} />
            </p>
          </div>
        </aside>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CASES.map((item, index) => (
            <CaseCard key={item.title} item={item} index={index} />
          ))}
        </ul>
      </div>
    </section>
  )
}
