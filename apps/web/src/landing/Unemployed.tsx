import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Button } from '@listeningkit/ui'
import { FacebookPostText } from '@/components/cards/FacebookCard'
import { RedditPostText } from '@/components/cards/RedditCard'
import { TwitterPostText } from '@/components/cards/TwitterCard'
import { FeedCardFrame } from '@/components/cards/FeedCardFrame'

const SOCIAL_CARDS = [
  { platform: 'reddit', title: "We're looking for a growth marketer who can run our LinkedIn from scratch." },
  { platform: 'facebook', title: "Hiring a junior web dev to fix our checkout bug, available this week." },
  { platform: 'twitter', title: 'Need a VA who knows Google Ads. Paying well, remote.' },
  { platform: 'reddit', title: 'Startup looking for a founding designer. You would own the whole brand.' },
  { platform: 'facebook', title: 'We want a content creator to shoot 3 reels a week for the kitchen brand.' },
  { platform: 'twitter', title: 'Hiring a data analyst. Must know Python, dashboards, and dbt.' },
  { platform: 'reddit', title: 'Small agency will pay for you to take over our ad accounts.' },
  { platform: 'facebook', title: "Our shop is looking for a socials person to keep the feed alive." },
  { platform: 'twitter', title: 'We need a founder who can ship the landing page by Friday.' },
] as const

function SocialCard({ card }: { card: (typeof SOCIAL_CARDS)[number] }) {
  const content =
    card.platform === 'reddit' ? (
      <RedditPostText communityName="r/jobs" title={card.title} likes="12" shares="3" />
    ) : card.platform === 'facebook' ? (
      <FacebookPostText lines={[card.title, 'DM us to apply.']} likes="8" comments="3 comments" shares="1 shares" />
    ) : (
      <TwitterPostText
        body={card.title}
        authorName="Hiring Team"
        handle="@hiring"
        replies="2"
        reposts="5"
        likes="21"
      />
    )

  return (
    <div className="pointer-events-none flex h-full w-1/3 shrink-0 items-center justify-center text-left">
      <FeedCardFrame
        naturalWidth={card.platform === 'reddit' ? 864 : card.platform === 'facebook' ? 713.42 : 484}
      >
        {content}
      </FeedCardFrame>
    </div>
  )
}

/**
 * Unemployed band: a giant "massive news for the unemployed" headline
 * with a bracketed promise underneath, while looping hiring-post social
 * cards scroll behind it.
 */
export function Unemployed() {
  return (
    <section className="relative isolate overflow-hidden bg-white px-6 py-24 text-center sm:px-10 sm:py-36">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden flex-col gap-[-4rem] md:flex"
        animate={{ y: ['0%', '-50%'] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 14 }, (_, row) => (
          <div key={row} className="flex h-72 w-full items-center justify-between">
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
        <h2 className="mt-8 max-w-4xl text-4xl font-black leading-[0.98] text-[#2A8CFF] sm:text-6xl lg:text-7xl">
          <img
            src="/logos/BREAKINGNEWS.svg"
            alt="breaking news"
            className="mx-1 inline-block h-[0.85em] w-auto align-[-0.08em]"
          />{' '}
          for the{' '}
          <img
            src="/logos/unemployed.svg"
            alt="unemployed"
            className="mx-1 inline-block h-[0.85em] w-auto align-[-0.08em]"
          />
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-xl leading-snug text-[#0D2A4C]/70 sm:text-2xl">
          (if you set up{' '}
          <img src="/logo.svg" alt="" aria-hidden className="mx-1 inline-block size-[1.2em] rounded-[22%] align-[-0.2em]" />{' '}
          <strong className="font-black text-[#2A8CFF]">ListeningKit</strong>, you&apos;ll 100% find more{' '}
          <img
            src="/logos/jobs.svg"
            alt="jobs"
            className="mx-1 inline-block h-[0.85em] w-auto align-[-0.08em]"
          />
          )
        </p>
        <Button variant="blue" asChild className="mt-8 rounded-xl px-8 py-5 text-xl font-bold uppercase">
          <Link to="/onboarding" className="inline-block text-center">
            Get started it&apos;s free!
          </Link>
        </Button>
      </div>
    </section>
  )
}
