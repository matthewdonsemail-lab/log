import { forwardRef, useEffect, useRef, useState } from 'react'
import type { AnchorHTMLAttributes, FormEvent, MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, ArrowUpRight, Star, UserPlus, X } from 'lucide-react'
import './RepoModal.css'

// A link to a GitHub repository that opens a friendly newsletter modal first. Ported from ui-kit's
// member sites (memberSites/engine/RepoLink.tsx) so the landing page behaves the same way. The
// visitor is never blocked: they can subscribe, skip, or close, and every path ends at the repository.

/** The repository every GitHub button and "Get started" on the landing page points at. */
export const LOG_REPO_URL = 'https://github.com/matthewdonsemail-lab/log'

/**
 * Same newsletter endpoint as the member sites. vercel.json rewrites it to listeningkit.com
 * (and vite.config.ts proxies it in dev), so the browser posts same-origin with no CORS.
 */
const ENDPOINT = '/api/kit/subscribe'
const SEEN_KEY = 'lk:repo-modal:subscribed'
/** After a skip, the star/follow ask waits this long so it reads as a gentle follow-up, not a wall. */
const FOLLOW_UP_DELAY_MS = 3500

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

/** Bold `**words**` become Schoolbell sticker keywords, as on the member sites. */
function Sticker({ text, size = 'lk-bluekey text-3xl' }: { text: string; size?: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith('**') ? (
          <span key={i} className={size}>
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
  const [showFollowUp, setShowFollowUp] = useState(false)
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

  useEffect(() => {
    if (step !== 'skipped') return
    const t = window.setTimeout(() => setShowFollowUp(true), FOLLOW_UP_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [step])

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
                    ? 'Skipping is **fine**, too.'
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

          <div className="lk-box mt-7 w-full max-w-md p-5 text-left">
            {step === 'thanks' ? (
              <div role="status">
                <p className="lk-body text-base font-medium">We hope you enjoy the repository.</p>
                <button type="button" onClick={go} className="lk-btn mt-4 w-full">
                  Continue to the repository <ArrowUpRight size={14} strokeWidth={3} />
                </button>
              </div>
            ) : step === 'skipped' ? (
              <div role="status">
                <p className="lk-body text-base font-medium">
                  No need to subscribe, but it really helps us out. Your support keeps everything free.
                </p>
                {showFollowUp ? (
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
                ) : null}
                <button type="button" onClick={go} className="lk-btn mt-4 w-full">
                  Continue to the repository <ArrowUpRight size={14} strokeWidth={3} />
                </button>
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
        </div>
      </div>
    </div>,
    document.body,
  )
}
