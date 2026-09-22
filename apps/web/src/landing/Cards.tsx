import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { SOCIAL_ICONS, SocialGlyph } from '@/lib/social-icons'

const CARDS = [
  {
    id: 'reddit',
    label: 'Reddit',
    caption: 'Catch buying questions and complaints the minute they post.',
    href: '/onboarding',
  },
  {
    id: 'x',
    label: 'X',
    caption: 'Hear what people say about you in real time, as it happens.',
    href: '/onboarding',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    caption: 'Follow groups and pages where your customers hang out.',
    href: '/onboarding',
  },
]

/**
 * Three platform cards over the blue grid, fading in as the Socials
 * text finishes its travel — the giant type acts as the reveal mask.
 */
export function Cards() {
  return (
    <section className="relative w-full bg-white">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, #2A8CFF 2px, transparent 2px), linear-gradient(to bottom, #2A8CFF 2px, transparent 2px)',
          backgroundSize: 'calc(100% / 6) calc(100% / 3)',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-120px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 px-6 py-28 sm:px-10 md:grid-cols-3"
      >
        {CARDS.map((card) => {
          const icon = SOCIAL_ICONS.find((entry) => entry.id === card.id)
          return (
            <Link
              key={card.id}
              to={card.href}
              className="flex flex-col items-start rounded-2xl bg-white p-6 text-left shadow-xl shadow-[#0D2A4C]/10 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                {icon ? (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#2A8CFF] text-white">
                    <SocialGlyph icon={icon} className="size-6" />
                  </span>
                ) : null}
                <h3 className="text-xl font-bold text-[#0D2A4C]">{card.label}</h3>
              </div>
              <p className="mb-4 mt-3 text-[15px] leading-snug text-[#0D2A4C]/70">{card.caption}</p>
              <span className="mt-auto flex items-center gap-2 text-sm font-bold uppercase text-[#2A8CFF]">
                <span className="underline underline-offset-4">Learn more</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </span>
            </Link>
          )
        })}
      </motion.div>
    </section>
  )
}
