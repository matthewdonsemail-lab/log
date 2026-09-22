import { motion } from 'motion/react'
import { siGithub } from 'simple-icons'
import Dither from '@/components/Dither'

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

/**
 * Closing statement beneath the social-listening reveal.
 * The message is intentionally direct: ownership and control are the point.
 */
export function Control() {
  return (
    <section id="why-free" className="relative bg-white px-6 pb-24 text-center sm:px-10 sm:pb-36">
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
                className="size-full object-contain"
                initial={{ scale: 0 }}
                whileInView={{ scale: [0, 1.14, 0.96, 1] }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, delay: index * 0.18, ease: [0.34, 1.56, 0.64, 1] }}
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
        <a
          href="https://github.com/matthewdonsemail-lab/log"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" role="img" aria-label="GitHub" className="size-8 shrink-0 text-[#0D2A4C]" fill="currentColor">
            <path d={siGithub.path} />
          </svg>
          <span className="text-base font-bold text-[#0D2A4C]">listeningkit / listeningkit</span>
        </a>
        </div>
      </div>
    </section>
  )
}
