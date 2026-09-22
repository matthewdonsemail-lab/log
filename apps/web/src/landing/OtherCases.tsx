import { motion } from 'motion/react'
import { Users, Zap, Timer, BarChart3 } from 'lucide-react'
import Dither from '@/components/Dither'

type DitherVariant = {
  waveSpeed: number
  waveFrequency: number
  waveAmplitude: number
  pixelSize: number
  colorNum: number
}

type OtherCase = {
  icon: typeof Zap
  title: string
  description: string
  videoSrc: string
  dither: DitherVariant
}

const EYEBROW = 'Made for every trade'
const HEADLINE = 'Other cases, one listening kit'
const LEDE_STRONG = 'Plumbing is where ListeningKit got its start — but the same pipeline'
const LEDE_REST =
  'works for any trade that lives on posts from people in need: your keywords, your platforms, your replies, your payments, everywhere your customers are asking.'

/** The four cards spin off the Usecase walkthrough: same pipeline, new angle per video. */
const CASES: OtherCase[] = [
  {
    icon: Users,
    title: 'Catch every cry for help',
    description:
      'Someone posts about a burst pipe at midnight. Your keywords match it, the auto-reply lands before a competitor even wakes up.',
    videoSrc: '/video/Facebook1.webm',
    dither: { waveSpeed: 0.035, waveFrequency: 3, waveAmplitude: 0.2, pixelSize: 3, colorNum: 4 },
  },
  {
    icon: Timer,
    title: 'Skip the noise, keep the jobs',
    description:
      'Jokes and rants get filtered out. Only posts with real intent reach your inbox, so every reply counts.',
    videoSrc: '/video/Facebook2.webm',
    dither: { waveSpeed: 0.05, waveFrequency: 4, waveAmplitude: 0.3, pixelSize: 2, colorNum: 5 },
  },
  {
    icon: Zap,
    title: 'Quote to cash in one chat',
    description:
      'Availability, Stripe link, address confirmed. The whole job books itself while you are on the tools.',
    videoSrc: '/video/Facebook3.webm',
    dither: { waveSpeed: 0.025, waveFrequency: 2, waveAmplitude: 0.25, pixelSize: 4, colorNum: 4 },
  },
  {
    icon: BarChart3,
    title: 'Hundreds of chats, zero chaos',
    description:
      'Follow-ups go out on their own and hot deals surface to the top. You just show up and close.',
    videoSrc: '/video/Facebook4.webm',
    dither: { waveSpeed: 0.06, waveFrequency: 5, waveAmplitude: 0.15, pixelSize: 2, colorNum: 6 },
  },
]

function CaseCard({ item, index }: { item: OtherCase; index: number }) {
  const Icon = item.icon
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
            <video
              src={item.videoSrc}
              autoPlay
              muted
              loop
              playsInline
              className="aspect-[9/16] h-[70%] w-auto max-w-[80%] object-cover"
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Icon className="size-6 text-ink" aria-hidden />
          <h3 className="text-xl font-black text-ink">{item.title}</h3>
        </div>
        <p className="text-lg leading-snug text-ink/70">{item.description}</p>
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
            <div className="inline-flex rounded-full bg-[#f2f1f3] px-4 py-1.5">
              <p className="text-xs font-black uppercase text-ink">{EYEBROW}</p>
            </div>
            <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">{HEADLINE}</h2>
            <p className="mt-5 text-lg leading-snug text-ink/70">
              <strong className="font-black text-ink">{LEDE_STRONG}</strong> {LEDE_REST}
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
