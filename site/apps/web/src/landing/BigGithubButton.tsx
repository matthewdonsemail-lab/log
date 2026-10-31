import { siGithub } from 'simple-icons'
import { cn } from '@listeningkit/ui'
import { LOG_REPO_URL, RepoLink } from './RepoLink'

const TONES = {
  /** Blue gradient with the inner glow, for white sections (Control). */
  blue: {
    style: {
      backgroundImage: 'linear-gradient(180deg, #117EFF -12.71%, #1E88FF 44.69%, #5EA7FF 102.1%)',
      boxShadow: 'inset 0 2px 30px #5EA7FF',
    },
    icon: 'text-white',
    eyebrow: 'text-white/90',
    title: 'text-white',
  },
  /** White inside the same blue inner glow, so it stands out on the blue hero instead of blending in. */
  white: {
    style: { backgroundColor: '#FFFFFF', boxShadow: 'inset 0 2px 30px #5EA7FF' },
    icon: 'text-[#2A8CFF]',
    eyebrow: 'text-[#2A8CFF]/80',
    title: 'text-[#2A8CFF]',
  },
} as const

/**
 * The big "Get Log by ListeningKit" GitHub card. It sits in the hero (where the website form used
 * to be) and again in the Control section, and opens the repository modal like every GitHub button.
 */
export function BigGithubButton({ className, tone = 'blue' }: { className?: string; tone?: keyof typeof TONES }) {
  const t = TONES[tone]
  return (
    <RepoLink
      href={LOG_REPO_URL}
      className={cn(
        'mx-auto flex min-h-0 w-full max-w-3xl items-center gap-4 overflow-hidden rounded-3xl px-6 py-6 text-left outline outline-1 outline-neutral-300 shadow-xl transition-all hover:scale-[1.01] hover:brightness-105 sm:gap-6 sm:px-8 sm:py-7 md:gap-8 md:rounded-[40px] md:px-10 md:py-8 lg:max-w-4xl',
        className,
      )}
      style={t.style}
    >
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-label="GitHub"
        className={cn('pointer-events-none size-14 shrink-0 opacity-95 sm:size-16 md:size-24 lg:size-28', t.icon)}
        fill="currentColor"
      >
        <path d={siGithub.path} />
      </svg>
      <div className="min-w-0 flex-1">
        <p className={cn('text-sm font-bold leading-snug sm:text-base md:text-xl', t.eyebrow)}>Get Log by ListeningKit</p>
        <p
          className={cn(
            'mt-1.5 text-xl font-black leading-tight sm:mt-2 sm:text-2xl md:text-3xl lg:whitespace-nowrap lg:text-4xl',
            t.title,
          )}
        >
          getting{' '}
          <img src="/logos/jobs.svg" alt="jobs" className="mx-1 inline-block h-[0.85em] w-auto align-[-0.08em]" />{' '}
          never been this easy!
        </p>
      </div>
    </RepoLink>
  )
}
