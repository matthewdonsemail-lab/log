import React, { useEffect } from 'react'
import { motion } from 'motion/react'
import Vara from 'vara'
import Dither from '@/components/Dither'

const DEFAULT_LINES = [
  'Made for our mate',
  'Rasputin',
  'who was mega unemployed',
]

const TEAM_PHOTOS = [
  '/images/mattlistening.png',
  '/images/johnlistening.png',
  '/images/kennedylistneing.png',
  '/images/mandeeplistening.png',
]

const EAR_IMAGES = [
  'ear1.png',
  'ear2.png',
  'ear3.png',
  'ear4.png',
  'ear5.png',
  'ear6.png',
  'ear7.png',
  'ear8.png',
]
const EAR_POSITIONS = [
  'left-[-15rem] top-[2%]',
  'right-[-15rem] top-[8%]',
  'left-[-10rem] top-[24%]',
  'right-[-10rem] top-[32%]',
  'left-[-14rem] top-[44%]',
  'right-[-14rem] top-[50%]',
  'left-[-8rem] top-[64%]',
  'right-[-8rem] top-[72%]',
]
const EAR_SIZES = [
  'size-56 lg:size-72',
  'size-64 lg:size-80',
  'size-48 lg:size-64',
  'size-72 lg:size-96',
  'size-60 lg:size-76',
  'size-44 lg:size-60',
  'size-64 lg:size-80',
  'size-56 lg:size-72',
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

export const VaraText = React.memo(function VaraText({
  lines = DEFAULT_LINES,
}: {
  lines?: string[]
}) {
  useEffect(() => {
    const container = document.getElementById('vara-container')
    if (container) {
      container.innerHTML = ''
    }

    new Vara(
      '#vara-container',
      'https://raw.githubusercontent.com/akzhy/Vara/master/fonts/Satisfy/SatisfySL.json',
      lines.map((line, idx) => ({
        text: line,
        fontSize: idx === 1 ? 46 : 40,
        strokeWidth: idx === 1 ? 0.9 : 0.7,
        textAlign: 'center' as const,
      })),
      {
        textAlign: 'center',
      }
    )
  }, [lines])

  return (
    <div
      id="vara-container"
      className="z-[20] w-full min-h-[200px] text-center [&>svg]:w-full [&>svg]:max-w-full [&>svg]:mx-auto"
      style={{ width: '100%' }}
    ></div>
  )
})

export function Rasputin({
  className = '',
}: {
  className?: string
}) {
  return (
    <section id="rasputin" className={`relative bg-white px-6 pb-24 text-center sm:px-10 sm:pb-36 ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-0 hidden w-[30%] md:block"
        style={{
          maskImage: 'linear-gradient(to right, black 45%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 45%, transparent 100%)',
        }}
      >
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[30%] md:block"
        style={{
          maskImage: 'linear-gradient(to left, black 45%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to left, black 45%, transparent 100%)',
        }}
      >
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
        <div className="relative z-20 flex flex-col items-center">
          {/* Handwriting in rasputin in the middle */}
          <div className="w-full max-w-2xl px-4 py-6">
            <VaraText />
          </div>

          {/* Team photo strip & dashed underline message */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 px-2 sm:flex-row sm:gap-5">
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
              thanks so much to{' '}
              <span className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">
                bootoshi and the vcu boys
              </span>{' '}
              for helping us make it through this &lt;3
            </p>
          </div>

          {/* Scribble handwriting note hyperlinked to x.com/matthewsoldit */}
          <a
            href="https://x.com/matthewsoldit"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block max-w-xl text-center text-lg sm:text-xl text-slate-600 transition-all hover:scale-105 hover:text-[#2A8CFF]"
            style={{ fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }}
          >
            (also if you want a website and a crm you should hire us{' '}
            <span className="font-bold text-[#2A8CFF] underline decoration-wavy underline-offset-4">
              message matthew on X
            </span>
            )
          </a>
        </div>
      </div>
    </section>
  )
}

export default Rasputin
