import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Button } from '@listeningkit/ui'
import { FacebookPostText } from '@/components/cards/FacebookCard'
import { RedditPostText } from '@/components/cards/RedditCard'
import { TwitterPostText } from '@/components/cards/TwitterCard'
import { FeedCardFrame } from '@/components/cards/FeedCardFrame'
import { SOCIAL_ICONS, SocialBadge } from '@/lib/social-icons'

const SOCIAL_CARDS = [
  { platform: 'reddit', title: 'Our bathroom ceiling is leaking again. Who can actually fix this?' },
  { platform: 'facebook', title: 'The company never showed up and now the leak is worse.' },
  { platform: 'twitter', title: 'Three calls later and nobody has answered about my broken boiler.' },
  { platform: 'reddit', title: 'Paid for the repair last week, but the same problem is already back.' },
  { platform: 'facebook', title: 'Does anyone know a reliable local business that responds quickly?' },
  { platform: 'twitter', title: 'Really wish someone had warned me about this service before I booked.' },
  { platform: 'reddit', title: 'Need an honest recommendation before I spend more money on this.' },
  { platform: 'facebook', title: 'The quote changed twice and the work still is not finished.' },
  { platform: 'twitter', title: 'I just want a real answer from someone who knows what they are doing.' },
] as const

function SocialCard({ card }: { card: (typeof SOCIAL_CARDS)[number] }) {
  const content =
    card.platform === 'reddit' ? (
      <RedditPostText communityName="r/LocalAdvice" title={card.title} likes="42" shares="8" />
    ) : card.platform === 'facebook' ? (
      <FacebookPostText lines={[card.title, 'Has anyone found a good answer?']} likes="24" comments="6 comments" shares="3 shares" />
    ) : (
      <TwitterPostText body={`${card.title} Would love a recommendation.`} replies="4" reposts="7" likes="31" />
    )

  return (
    <div className="pointer-events-none flex w-1/3 shrink-0 justify-center text-left">
      <FeedCardFrame
        naturalWidth={card.platform === 'reddit' ? 864 : card.platform === 'facebook' ? 713.42 : 484}
      >
        {content}
      </FeedCardFrame>
    </div>
  )
}

/** Introductory statement above the use-case walkthrough. */
export function ListeningIntro() {
  return (
    <section id="how-it-works" className="relative isolate overflow-hidden bg-white px-6 py-24 text-center sm:px-10 sm:py-36">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden flex-col gap-[-4rem] md:flex"
        animate={{ y: ['0%', '-50%'] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 14 }, (_, row) => (
          <div key={row} className="flex h-[16rem] w-full items-center justify-between">
            {[0, 1, 2].map((column) => {
              const card = SOCIAL_CARDS[(row * 3 + column) % SOCIAL_CARDS.length]
              return <SocialCard key={`${row}-${column}`} card={card} />
            })}
          </div>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_34%,rgba(255,255,255,0.86)_70%,#fff_94%)]" />
      <div className="relative z-20 mx-auto flex max-w-5xl flex-col items-center px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[-7rem] -z-10 rounded-[6rem] bg-white blur-2xl"
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 42%, rgba(0,0,0,0.9) 68%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 42%, rgba(0,0,0,0.9) 68%, transparent 100%)',
          }}
        />
        <img
          src="/logo.svg"
          alt="ListeningKit logo"
          className="size-24 rounded-[22%] object-contain sm:size-32"
        />
        <h2 className="mt-8 max-w-4xl text-4xl font-black leading-[0.98] text-[#2A8CFF] sm:text-6xl lg:text-7xl">
          Your (potential) customers are{' '}
          <img
            src="/logos/moaning.svg"
            alt="moaning"
            className="mx-1 inline-block h-[0.85em] w-auto align-[-0.08em]"
          />{' '}
          about something on{' '}
          <img
            src="/logos/SocialMedia.svg"
            alt="social media"
            className="mx-1 inline-block h-[0.85em] w-auto align-[-0.08em]"
          />.
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-xl leading-snug text-[#0D2A4C]/70 sm:text-2xl">
          Listen to your competitors across{' '}
          <span className="mx-1 inline-flex items-center gap-1.5 align-middle">
            {SOCIAL_ICONS.map((icon) => (
              <SocialBadge key={icon.id} icon={icon} variant="blue" />
            ))}
          </span>{' '}
          Twitter, Reddit and Facebook, help their customers, and you&apos;ll get new customers. It&apos;s simple.
        </p>
        <Button variant="blue" asChild className="mt-8 rounded-xl px-8 py-5 text-xl font-bold uppercase">
          <Link to="/onboarding" className="inline-block text-center">
            Get started
          </Link>
        </Button>
      </div>
    </section>
  )
}
