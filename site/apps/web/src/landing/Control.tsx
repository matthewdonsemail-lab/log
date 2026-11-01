import { motion } from 'motion/react'
import Dither from '@/components/Dither'
import type { ReactNode } from 'react'
import { AgentSession } from './AgentSession'
import { BigGithubButton } from './BigGithubButton'

function Dashed({ children }: { children: ReactNode }) {
  return <span className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">{children}</span>
}

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
  return (
    <section id="why-free" className="relative overflow-clip bg-white px-6 pb-24 text-center sm:px-10 sm:pb-36">
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
        <h2 className="text-title mx-auto max-w-4xl text-[#0D2A4C]">
          The best tool for
          <br className="hidden sm:block" />{' '}
          <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">social media marketing.</span>
        </h2>
        <p className="text-lede mx-auto mt-5 max-w-2xl font-semibold text-[#0D2A4C]/85">
          Not another <Dashed>social listening tool</Dashed>. A <Dashed>full suite</Dashed> for any marketer working{' '}
          <Dashed>at scale</Dashed>: every account, every platform, from your terminal or{' '}
          <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">your AI agent.</span>
        </p>
        <AgentSession />
        <p
          className="mx-auto mt-12 max-w-4xl text-center text-lg text-slate-500 sm:text-xl md:text-2xl lg:whitespace-nowrap"
          style={{ fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }}
        >
          Check out our repo and leave a star you&apos;ll definitely not regret it
        </p>
        <BigGithubButton className="mt-4" />
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
              four hackers
            </span>{' '}
            who run their own marketing on it every day.
          </p>
        </div>
        </div>
      </div>
    </section>
  )
}
