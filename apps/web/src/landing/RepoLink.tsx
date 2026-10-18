import { Suspense, forwardRef, lazy, useEffect, useRef, useState } from 'react'
import type { AnchorHTMLAttributes, FormEvent, MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, ArrowUpRight, Lock, Star, UserPlus, X } from 'lucide-react'
import { GG_REVIEWS, type Review } from './ggReviews'
import './RepoModal.css'

// The gg page's video player loads only when the modal reaches the video, not with the landing page.
const VslPlayer = lazy(() => import('./VslPlayer'))

// A link to a GitHub repository that opens a friendly newsletter modal first. Ported from ui-kit's
// member sites (memberSites/engine/RepoLink.tsx) so the landing page behaves the same way. Subscribers
// go straight to the repository; someone who skips watches the start of the go getters video first
// (WATCH_GATE_SECONDS), then gets the repository plus the invitation to the community.

/** Seconds of the video someone who skips plays before "Continue to the repository" unlocks. */
const WATCH_GATE_SECONDS = 20

/** The repository every GitHub button and "Get started" on the landing page points at. */
export const LOG_REPO_URL = 'https://github.com/matthewdonsemail-lab/log'

/**
 * Same newsletter endpoint as the member sites. vercel.json rewrites it to listeningkit.com
 * (and vite.config.ts proxies it in dev), so the browser posts same-origin with no CORS.
 */
const ENDPOINT = '/api/kit/subscribe'
const SEEN_KEY = 'lk:repo-modal:subscribed'

/**
 * The second part of the modal, once someone has subscribed or skipped: the paid-community call to
 * action from the member-site offer funnel (ui-kit memberSites/matthew/funnel.ts `paid`, rendered by
 * CommunityCta), with the gg page's own video player in place of the X embed, the pitch, and the
 * join button (to the gg page's form) with the "Find new customers" note.
 */
// Worded like the gg page (ui-kit memberSites/engine/GoGettersPage.tsx): a comm, we/us, never a paid pitch or a price.
const COMMUNITY = {
  eyebrow: 'go getters',
  title: 'We used Log to find people just like us',
  blurb:
    'We indexed **3 months** of X posts with Log and mapped out __300+ people__ in our industry doing the same work. Now we\'re a **comm of operators**: 2 calls a week on X, daily accountability, and open source tools we build together.',
  href: 'https://gg.listeningkit.com/#apply',
  cta: 'Save your spot',
  sticker: { src: '/images/FindNewCustomers.png', alt: 'Find new customers' },
}

const REPO_URL = /^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)\/?$/

/** `owner` and `repo` when the href is a bare GitHub repository URL; pull requests, profiles etc. return null. */
export function parseRepoUrl(href: string | undefined): { owner: string; repo: string } | null {
  const m = href?.match(REPO_URL)
  return m ? { owner: m[1], repo: m[2] } : null
}

function alreadySubscribed() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * True when a click on a repository link should open the modal instead of navigating: a plain
 * left click by someone who has not subscribed yet. New-tab gestures and subscribers go straight through.
 */
export function shouldOpenRepoModal(e: MouseEvent<HTMLElement>) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false
  return !alreadySubscribed()
}

let deepLinkHandled = false

/** True once, for the link matching `?repo=<name>` or `?repo=<owner>/<name>`, so a shared URL opens the modal on load. */
function matchesDeepLink(owner: string, repo: string) {
  if (deepLinkHandled || typeof window === 'undefined') return false
  const want = new URLSearchParams(window.location.search).get('repo')?.toLowerCase()
  if (!want || (want !== repo.toLowerCase() && want !== `${owner}/${repo}`.toLowerCase())) return false
  deepLinkHandled = true
  return true
}

/**
 * Drop-in replacement for `<a>`: repository URLs get the modal, anything else stays a plain link.
 * Forwards its ref so it can sit under `<Button asChild>`.
 */
export const RepoLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function RepoLink(
  { href, onClick, children, ...rest },
  ref,
) {
  const repo = parseRepoUrl(href)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (repo && !alreadySubscribed() && matchesDeepLink(repo.owner, repo.repo)) setOpen(true)
  }, [repo?.owner, repo?.repo])

  if (!repo || !href) {
    return (
      <a ref={ref} href={href} onClick={onClick} {...rest}>
        {children}
      </a>
    )
  }

  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e)
    if (!shouldOpenRepoModal(e)) return
    e.preventDefault()
    setOpen(true)
  }

  return (
    <>
      <a ref={ref} href={href} target="_blank" rel="noreferrer" {...rest} onClick={handle}>
        {children}
      </a>
      {open ? <RepoModal owner={repo.owner} repo={repo.repo} href={href} onClose={() => setOpen(false)} /> : null}
    </>
  )
})

/** `**words**` become Schoolbell sticker keywords and `__words__` a dashed underline, as on the member sites. */
function Sticker({ text, size = 'lk-bluekey text-3xl' }: { text: string; size?: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).map((part, i) =>
        part.startsWith('**') ? (
          <span key={i} className={size}>
            {part.slice(2, -2)}
          </span>
        ) : part.startsWith('__') ? (
          <span key={i} className="font-bold underline decoration-dashed decoration-2 underline-offset-4">
            {part.slice(2, -2)}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function HandArrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 40 36"
      width="40"
      height="36"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-2 inline-block translate-y-3 align-bottom"
    >
      <path d="M3 5 C 24 2, 34 10, 30 28" />
      <path d="M22 21 L 30 29 L 36 20" />
    </svg>
  )
}

type Step = 'ask' | 'sending' | 'thanks' | 'skipped'

export function RepoModal({
  owner,
  repo,
  href,
  onClose,
  endpoint = ENDPOINT,
}: {
  owner: string
  repo: string
  href: string
  onClose: () => void
  endpoint?: string
}) {
  const [step, setStep] = useState<Step>('ask')
  const [error, setError] = useState(false)
  const [watched, setWatched] = useState(0)
  const unlocked = watched >= WATCH_GATE_SECONDS
  const panel = useRef<HTMLDivElement>(null)
  const close = useRef(onClose)
  close.current = onClose

  const go = () => {
    window.open(href, '_blank', 'noopener,noreferrer')
    onClose()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [])


  async function subscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get('email') ?? '').trim()
    setError(false)
    setStep('sending')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, member: repo, offer: `${owner}/${repo}` }),
      })
      if (!res.ok) throw new Error(String(res.status))
      try {
        window.localStorage.setItem(SEEN_KEY, '1')
      } catch {
        // Private mode: the modal just shows again next time.
      }
      setStep('thanks')
    } catch {
      setError(true)
      setStep('ask')
    }
  }

  const name = repo.charAt(0).toUpperCase() + repo.slice(1)

  return createPortal(
    <div className="lk-repo fixed inset-0 z-[100] grid place-items-center p-4">
      <div className="absolute inset-0 bg-[#0d2a4c]/60" onClick={onClose} aria-hidden />
      {/* The same blue card as the member-site funnel: label, big title, sticker blurb, then the white box. */}
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="repo-modal-title"
        tabIndex={-1}
        className="lk-repo-card relative max-h-[94vh] w-full max-w-3xl overflow-y-auto overflow-x-hidden rounded-md px-6 py-8 text-white outline-none sm:px-10 sm:py-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-sm text-white/90 hover:bg-white/20"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="lk-hand flex items-center gap-2 text-left text-2xl text-white">
            <span className="lk-bluekey text-3xl">Get {name} for Free</span>
            <HandArrow />
          </div>
          <h2 id="repo-modal-title" className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
            <Sticker
              text={
                step === 'thanks'
                  ? 'Thank you for **subscribing**!'
                  : step === 'skipped'
                    ? unlocked
                      ? 'Thanks for **watching**!'
                      : 'Skipping is **fine**, too.'
                    : 'We hope you **enjoy** it!'
              }
              size="lk-bluekey text-4xl sm:text-6xl"
            />
          </h2>
          {step === 'ask' || step === 'sending' ? (
            <p className="mt-5 max-w-2xl text-xl font-medium leading-snug text-white/95 sm:text-2xl">
              <Sticker text="All our work is **open source**. Your support keeps it free." />
            </p>
          ) : null}

          {step === 'skipped' ? (
            <>
              <p className="mt-5 max-w-2xl text-xl font-medium leading-snug text-white/95 sm:text-2xl">
                <Sticker
                  text={
                    unlocked
                      ? `You can get **${name}** now below, or keep watching. You might be a **good fit** for the comm.`
                      : `If you want **${name}**, you might be a **good fit** for our comm too. Watch a little first.`
                  }
                />
              </p>
              <div className="mt-7 w-full max-w-[550px]">
                <Suspense fallback={<div className="aspect-video w-full bg-black" />}>
                  <VslPlayer onWatched={setWatched} />
                </Suspense>
                {unlocked ? null : (
                  <div className="mt-3" aria-live="polite">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
                      <div
                        className="h-full rounded-full bg-white transition-[width] duration-300"
                        style={{ width: `${Math.min(100, (watched / WATCH_GATE_SECONDS) * 100)}%` }}
                      />
                    </div>
                    <p className="lk-hand mt-2 text-xl text-white">
                      {Math.max(0, Math.ceil(WATCH_GATE_SECONDS - watched))}s more and {name} unlocks below
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}

          <div className="lk-box mt-7 w-full max-w-md p-5 text-left">
            {step === 'thanks' ? (
              <div role="status">
                <p className="lk-body text-base font-medium">We hope you enjoy the repository.</p>
                <button type="button" onClick={go} className="lk-btn mt-4 w-full">
                  Continue to the repository <ArrowUpRight size={14} strokeWidth={3} />
                </button>
              </div>
            ) : step === 'skipped' && !unlocked ? (
              <div role="status">
                <p className="lk-body text-base font-medium">
                  No need to subscribe. Watch the start of the video and the repository unlocks right here.
                </p>
                <button type="button" disabled className="lk-btn mt-4 w-full opacity-60">
                  <Lock size={14} strokeWidth={3} /> Unlocks after a little watching
                </button>
              </div>
            ) : step === 'skipped' ? (
              <div role="status">
                <p className="lk-body text-base font-medium">
                  No need to subscribe, but it really helps us out. Your support keeps everything free.
                </p>
                <button type="button" onClick={go} className="lk-btn mt-4 w-full">
                  Continue to the repository <ArrowUpRight size={14} strokeWidth={3} />
                </button>
                {/* Shown with the button, not on a timer, so nothing shifts under someone who is watching. */}
                <div className="lk-follow mt-4 p-4">
                  <p className="text-base font-bold">Before you go, drop a follow or a star? It really helps!</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={href} target="_blank" rel="noreferrer" onClick={onClose} className="lk-ghost">
                      <Star size={15} strokeWidth={2.5} /> Leave a star
                    </a>
                    <a
                      href={`https://github.com/${owner}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={onClose}
                      className="lk-ghost"
                    >
                      <UserPlus size={15} strokeWidth={2.5} /> Follow {owner}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={subscribe} className="space-y-3">
                <p className="text-lg font-bold leading-snug">
                  <Sticker text="Join the **newsletter**" size="lk-bluekey text-3xl" />
                </p>
                <p className="lk-body text-base font-medium leading-snug">
                  <Sticker
                    text="New free tools and **GTM strategies** the moment we ship them, for founders, sales engineers and builders."
                    size="lk-bluekey text-2xl"
                  />
                </p>
                <label className="block">
                  <span className="sr-only">Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="lk-field"
                  />
                </label>
                <button type="submit" disabled={step === 'sending'} className="lk-btn w-full disabled:opacity-60">
                  {step === 'sending' ? 'Joining' : 'Join the newsletter'} <ArrowRight size={14} strokeWidth={3} />
                </button>
                {error ? (
                  <p role="alert" className="text-sm font-bold text-red-600">
                    That did not go through. Try again, or skip and continue.
                  </p>
                ) : null}
                <button type="button" onClick={() => setStep('skipped')} className="lk-ghost w-full">
                  Skip and continue to the repository
                </button>
              </form>
            )}
          </div>

          {/* While someone who skipped waits for the gate (and after), the gg page's replies run under the button. */}
          {step === 'skipped' ? (
            <div className="mt-10 w-full">
              <p className="lk-hand mb-5 text-left text-2xl leading-[2.4rem] text-white">
                Replies to our posts while you wait
                <HandArrow />
              </p>
              <ReviewMarquee reviews={GG_REVIEWS} />
            </div>
          ) : null}

          {/* Subscribers get the video with the pitch; for a skip the video is already up top. */}
          {step === 'thanks' ? <CommunityCta showVideo /> : null}
          {step === 'skipped' && unlocked ? <CommunityCta showVideo={false} /> : null}
        </div>

        {/* The gg page's phone join bar, stuck to the bottom of the modal from the skip on, with a note
            pointing at it, so "save my spot" is always one tap away while the video plays. */}
        {step === 'skipped' ? (
          <div
            className="lk-repo-card sticky bottom-[-2rem] z-10 -mx-6 -mb-8 mt-10 px-4 pb-4 pt-3 sm:bottom-[-2.5rem] sm:-mx-10 sm:-mb-10 sm:px-10"
            style={{ boxShadow: '0 -8px 28px rgba(42,140,255,.45)' }}
          >
            <p className="lk-hand mb-1 flex items-center justify-center gap-1 text-xl text-white">
              while you wait, save your spot in the comm
              <HandArrow />
            </p>
            <a
              href={COMMUNITY.href}
              target="_blank"
              rel="noreferrer"
              className="lk-btn w-full py-4 text-lg"
              style={{ background: '#fff', color: 'var(--lk-brand)' }}
            >
              save my spot <ArrowRight size={20} strokeWidth={3} />
            </a>
            <p className="mt-1.5 text-center text-xs font-black uppercase tracking-wide text-white/90">
              free · 5 quick questions · 2 minutes
            </p>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

/**
 * Rows of white review cards that bleed to the modal's edges, fade out at both and slide across forever
 * (ui-kit memberSites/engine/funnel-sections.tsx `ReviewMarquee`). The middle row runs the other way.
 */
function ReviewMarquee({ reviews }: { reviews: Review[] }) {
  return (
    <div
      className="-mx-6 sm:-mx-10"
      style={{
        maskImage: 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, #000 14%, #000 86%, transparent)',
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Replies on X"
    >
      <div className="space-y-4 pb-1.5">
        {[0, 1, 2].map((row) => {
          const at = Math.floor((row * reviews.length) / 3)
          const rotated = [...reviews.slice(at), ...reviews.slice(0, at)]
          return (
            <ul key={row} className={`lk-marquee flex w-max ${row === 1 ? 'lk-marquee-rev' : ''}`} aria-hidden={row > 0 ? true : undefined}>
              {[...rotated, ...rotated].map((r, i) => (
                <li key={i} className="mr-3 w-64 shrink-0 sm:w-80" aria-hidden={i >= rotated.length ? true : undefined}>
                  <figure className="lk-lip flex h-full flex-col gap-2 rounded-md bg-white p-3 text-left text-[#0d2a4c]">
                    <figcaption className="flex items-center gap-2.5">
                      <img src={r.photo} alt="" className="h-9 w-9 shrink-0 rounded-full border-2 border-[#d4e8ff] object-cover" />
                      <span className="min-w-0 text-sm font-black leading-tight">
                        {r.name}
                        <span className="lk-body block text-xs font-bold opacity-70">{r.handle}</span>
                      </span>
                    </figcaption>
                    <blockquote className="lk-body text-sm font-medium leading-snug">
                      &ldquo;<Sticker text={r.quote} size="lk-bluekey-sm text-xl" />&rdquo;
                    </blockquote>
                  </figure>
                </li>
              ))}
            </ul>
          )
        })}
      </div>
    </div>
  )
}

/** The comm block shown under the white box once the visitor has subscribed or watched past the gate. */
function CommunityCta({ showVideo }: { showVideo: boolean }) {
  return (
    <div className="mt-12 flex w-full flex-col items-center border-t border-white/25 pt-10">
      <div className="lk-hand flex items-center gap-2 text-left text-2xl text-white">
        <span className="lk-bluekey text-3xl">{COMMUNITY.eyebrow}</span>
        <HandArrow />
      </div>
      <h3 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">{COMMUNITY.title}</h3>
      {showVideo ? (
        // the gg page's own player, 550px like the gg page, so it plays straight away instead of waiting on X
        <div className="mt-8 w-full max-w-[550px]">
          <Suspense fallback={<div className="aspect-video w-full bg-black" />}>
            <VslPlayer />
          </Suspense>
        </div>
      ) : null}
      <p className="mt-8 max-w-2xl text-xl font-medium leading-snug text-white/95 sm:text-2xl">
        <Sticker text={COMMUNITY.blurb} />
      </p>
      <div className="mt-14 flex justify-center">
        {/* The sticker sits at the button's top-right corner with its arrow aimed down at it. */}
        <span className="relative inline-flex">
          <a
            href={COMMUNITY.href}
            target="_blank"
            rel="noreferrer"
            className="lk-btn px-6 py-4 text-base"
            style={{ background: '#fff', color: 'var(--lk-brand)' }}
          >
            {COMMUNITY.cta} <ArrowRight size={16} strokeWidth={3} />
          </a>
          <img
            src={COMMUNITY.sticker.src}
            alt={COMMUNITY.sticker.alt}
            className="pointer-events-none absolute bottom-full left-[calc(100%+0.25rem)] -mb-2 w-16 max-w-none rotate-3 drop-shadow-lg sm:w-20"
          />
        </span>
      </div>
    </div>
  )
}
