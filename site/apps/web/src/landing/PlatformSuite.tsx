import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'motion/react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faFacebook, faLinkedin, faReddit, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faClockRotateLeft, faCodeFork, faStar } from '@fortawesome/free-solid-svg-icons'
import { BrandMark, type BrandMarkId } from './BrandMark'
import { PLATFORM_DEMOS } from './PlatformDemos'
import { TILT_QUERY, useMediaQuery } from './useMediaQuery'

type Platform = {
  id: string
  icon: IconDefinition
  label: string
  body: string
  example: string
  docsHref: string
  does: string[]
}

const PLATFORMS: Platform[] = [
  {
    id: 'x',
    icon: faXTwitter,
    label: 'X',
    body: 'log reads **both inboxes**, shows who is **waiting on you**, and sends your replies, posts and DMs the moment you say so.',
    example: 'log twitter dms --account you --waiting',
    docsHref: '/docs/platforms/x',
    does: [
      'log twitter dms --waiting: one inbox across the old DMs and the encrypted X Chat, showing who is waiting on a reply and who opened your message without answering',
      'log twitter reply, quote, post, like, repost, follow and dm: each one a dry run until --live',
      'log twitter queue build, approve, then run: replies or DMs to many people, approved first, sent one at a time at random moments inside a window, skipping anyone you already talked to',
      'log twitter followers and follows: who follows you and who you follow back',
      'log voice: checks a draft sounds like you before it is sent',
    ],
  },
  {
    id: 'facebook',
    icon: faFacebook,
    label: 'Facebook',
    body: 'log posts your **Marketplace listings**, reads your local **groups** and keeps every account warmed up in its own browser.',
    example: 'log facebook read group --account you --group <group>',
    docsHref: '/docs/platforms/facebook',
    does: [
      "log facebook listing create, publish and remove: Marketplace listings from a file, posted from the account's own browser",
      'log facebook campaign fill and run: one ad on several accounts in one area',
      "log facebook check and scan: whether each account can still sell, each listing's state and clicks, and the seller inbox",
      'log facebook join group, read group, read members and poll: join local groups, read new posts and comments, and their newest members',
      "log facebook host start and warmup: one browser per account for its day, with a proxy in the account's home country, warmed up like a person would",
    ],
  },
  {
    id: 'discord',
    icon: faDiscord,
    label: 'Discord',
    body: 'log reads your DMs, groups and channels, **watches live** and sends the messages for you.',
    example: 'log discord watch --account you',
    docsHref: '/docs/platforms/discord',
    does: [
      'log discord chats: your DMs and group DMs',
      'log discord read: the latest messages in any chat or server channel',
      'log discord watch: every new message the moment it arrives',
      'log discord send: one message to a DM, a group or a channel, a dry run until --live',
      'log search: finds old conversations by words and by meaning',
    ],
  },
  {
    id: 'reddit',
    icon: faReddit,
    label: 'Reddit',
    body: 'log keeps your Reddit account **signed in** and runs your **recorded steps** again in its own browser.',
    example: 'log reddit session check --account you',
    docsHref: '/docs/platforms/reddit',
    does: [
      'log reddit session check: checks Reddit still accepts the saved session',
      "log inspect start and do: opens the account's own browser on Reddit and works one step at a time",
      'log flow run: runs recorded steps again, a dry run until --live',
    ],
  },
  {
    id: 'linkedin',
    icon: faLinkedin,
    label: 'LinkedIn',
    body: 'log saves your LinkedIn **session**, checks it is still good, and opens the account in **its own browser**.',
    example: 'log linkedin session check --account you',
    docsHref: '/docs/platforms/linkedin',
    does: [
      'log linkedin cookies save: saves the session from two cookies, checked with LinkedIn before it is kept',
      'log linkedin session check: checks LinkedIn still accepts it',
      "log inspect start: opens the account's own browser on LinkedIn",
    ],
  },
]

const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'
const LIP = 'shadow-[0_0_0_1px_#C9E3FF,0_3px_0_#B5D6FF]'

function Stickered({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith('**') ? (
          <span key={index} className={STICKER}>{part.slice(2, -2)}</span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}

const SITE = 'https://log.listeningkit.com'

function askAiPrompt(platform: Platform) {
  return [
    `I'm a marketer looking at log by ListeningKit (${SITE}, code at https://github.com/matthewdonsemail-lab/log). Read what it is below, then tell me how I'd use it on ${platform.label}.`,
    '',
    'What log is:',
    '- A free, open-source (MIT) social media tool that does the whole job, not only listening: it reads inboxes, groups and posts, then replies, DMs, posts and runs listings.',
    '- It runs on my own machine with my own accounts. Sessions and settings stay in ~/.logCli. Many accounts are kept in Twenty, an open-source CRM.',
    '- One command, `log`, and one MCP server, `logMcp`, so Claude Code, Codex or Cursor can run every command as a tool.',
    '- Nothing acts until I say so: anything that sends, posts or likes is a dry run until `--live`.',
    '- Each account keeps its own daily limits, pacing between actions and waking hours in its home timezone.',
    '- Platforms: X, Facebook (Marketplace and groups), Discord, Reddit and LinkedIn.',
    '- Install: curl -fsSL https://log.listeningkit.com/install.sh | sh, then `claude mcp add log -- logMcp`.',
    '',
    `What log does on ${platform.label}:`,
    ...platform.does.map((line) => `- ${line}`),
    '',
    `Docs: ${SITE}${platform.docsHref} and the step-by-step use cases at ${SITE}/docs/useCases.`,
    '',
    `Answer for log specifically, not other tools. Give me: 1) the three best ways a marketer like me would use log on ${platform.label}, 2) the exact log commands for each, in order, 3) what I'd ask my agent in plain words to run it, and 4) what I need to set up first.`,
  ].join('\n')
}

function askAiLinks(platform: Platform): { id: BrandMarkId; label: string; href: string }[] {
  const question = encodeURIComponent(askAiPrompt(platform))
  return [
    { id: 'chatgpt', label: 'ChatGPT', href: `https://chatgpt.com/?q=${question}` },
    { id: 'perplexity', label: 'Perplexity', href: `https://www.perplexity.ai/search?q=${question}` },
    { id: 'claude', label: 'Claude', href: `https://claude.ai/new?q=${question}` },
  ]
}

type RepoStats = { stars: number; forks: number; pushedAt: string }

function useLogRepoStats() {
  const [stats, setStats] = useState<RepoStats | null>(null)
  useEffect(() => {
    let cancelled = false
    fetch('https://api.github.com/repos/matthewdonsemail-lab/log')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { stargazers_count: number; forks_count: number; pushed_at: string } | null) => {
        if (!cancelled && data) setStats({ stars: data.stargazers_count, forks: data.forks_count, pushedAt: data.pushed_at })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])
  return stats
}

function sinceLabel(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 14) return `${days} days ago`
  if (days < 60) return `${Math.round(days / 7)} weeks ago`
  return `${Math.round(days / 30)} months ago`
}

function Mark({ children }: { children: string }) {
  return <span className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">{children}</span>
}

const SLIDE_GAP_REM = 3

function PlatformCard({
  platform,
  active,
  go,
  stats,
}: {
  platform: Platform
  active: number
  go: (index: number) => void
  stats: RepoStats | null
}) {
  const tilt = useMediaQuery(TILT_QUERY)
  const Demo = PLATFORM_DEMOS[platform.id]
  return (
    <div
      className="w-full rounded-[30px] p-1.5 [background:var(--ring-y)] md:[background:var(--ring-x)]"
      style={
        {
          '--ring-x': 'linear-gradient(to right, rgb(42 140 255 / 0.24) 0%, rgb(42 140 255 / 0.14) 55%, transparent 94%)',
          '--ring-y': 'linear-gradient(to bottom, rgb(42 140 255 / 0.28) 0%, rgb(42 140 255 / 0.16) 60%, rgb(42 140 255 / 0.08) 100%)',
        } as CSSProperties
      }
    >
      <div
        className="relative w-full rounded-3xl px-7 py-7 text-left [background:var(--card-y)] md:px-10 md:py-9 md:[background:var(--card-x)]"
        style={
          {
            '--card-x': 'linear-gradient(to right, #4FA6FF 0%, #78BBFF 38%, #C2E0FF 64%, #EEF6FF 82%, #FFFFFF 96%)',
            '--card-y': 'linear-gradient(to bottom, #4FA6FF 0%, #5DAEFF 50%, #78BBFF 80%, #A9D4FF 100%)',
          } as CSSProperties
        }
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl [mask-image:var(--glow-y)] md:[mask-image:var(--glow-x)]"
          style={
            {
              boxShadow:
                'inset 0 0 0 2px rgb(92 178 255 / 0.95), inset 0 0 28px 4px rgb(42 140 255 / 0.50), inset 0 0 72px 16px rgb(42 140 255 / 0.22)',
              '--glow-x': 'linear-gradient(to right, black 0%, black 30%, transparent 92%)',
              '--glow-y': 'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
            } as CSSProperties
          }
        />
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center md:gap-12">
          <div className="flex min-w-0 flex-col items-start gap-4">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-4xl leading-none md:text-5xl">
                <span className={STICKER}>{platform.label}</span>
              </span>
              <span className="text-2xl font-black tracking-[-0.02em] text-white/90 md:text-3xl">with log</span>
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={platform.docsHref}
                className={`inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-[14px] font-bold text-[#2A8CFF] transition-transform hover:-translate-y-px ${LIP}`}
              >
                <FontAwesomeIcon icon={platform.icon} className="text-[15px]" />
                Everything log does on {platform.label}
              </a>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-white" title="How can log help my marketing?">Ask AI</span>
                {askAiLinks(platform).map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ask ${link.label} how log can help my marketing on ${platform.label}`}
                    title={`Ask ${link.label}`}
                    className="button-glow grid size-8 place-items-center rounded-md text-white shadow-[0_3px_0_#1A5FC8] transition-[filter,transform] hover:brightness-110 active:translate-y-[3px] active:shadow-none"
                  >
                    <BrandMark id={link.id} className="size-4" />
                  </a>
                ))}
              </div>
            </div>
            <p className="text-xl leading-snug text-white md:text-2xl" style={{ fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }}>
              <Stickered text={platform.body} />
            </p>
            <code className="block max-w-full whitespace-pre-wrap [overflow-wrap:anywhere] rounded-md bg-[#0D2A4C] px-3 py-2 font-mono text-[13px] text-white shadow-[0_3px_0_#061a33]">
              <span className="text-[#5CA7FF]">$ </span>
              {platform.example}
            </code>
            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div className="flex items-center gap-2" role="group" aria-label="Choose a platform">
                {PLATFORMS.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={item.label}
                    aria-current={index === active}
                    onClick={() => go(index)}
                    className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${index === active ? 'w-10 bg-white' : 'w-2.5 bg-white/60 hover:bg-white/80'}`}
                  />
                ))}
              </div>
              {stats ? (
                <a
                  href="https://github.com/matthewdonsemail-lab/log"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-wrap items-center gap-2 text-[13px] font-bold"
                  aria-label={`log on GitHub: ${stats.stars} stars, ${stats.forks} forks`}
                >
                  <span className={`inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[#2A8CFF] ${LIP}`}>
                    <FontAwesomeIcon icon={faStar} className="text-[11px]" />
                    {stats.stars} {stats.stars === 1 ? 'star' : 'stars'}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[#2A8CFF] ${LIP}`}>
                    <FontAwesomeIcon icon={faCodeFork} className="text-[11px]" />
                    {stats.forks} {stats.forks === 1 ? 'fork' : 'forks'}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-[#2A8CFF] ${LIP}`}>
                    <FontAwesomeIcon icon={faClockRotateLeft} className="text-[11px]" />
                    Updated {sinceLabel(stats.pushedAt)}
                  </span>
                </a>
              ) : null}
            </div>
          </div>
          <div className="mx-auto w-full min-w-0 max-w-md py-6 md:[perspective:1400px] [zoom:0.85]">
            <motion.div
              className="demo-3d"
              animate={tilt ? { rotateY: [-18, -9, -18], rotateX: [9, 4, 9] } : { rotateY: 0, rotateX: 0 }}
              transition={tilt ? { duration: 9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
            >
              <Demo />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PlatformSuite() {
  const [active, setActive] = useState(0)
  const [drag, setDrag] = useState(0)
  const stats = useLogRepoStats()
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<{ x: number; y: number; id: number; horizontal: boolean | null } | null>(null)
  const dragRef = useRef(0)
  const wheelLock = useRef(0)
  const count = PLATFORMS.length
  const go = (next: number) => setActive(Math.min(count - 1, Math.max(0, next)))

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if ((event.target as HTMLElement).closest('a, button')) return
    dragStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId, horizontal: null }
  }

  const onPointerMove = (event: ReactPointerEvent) => {
    const start = dragStart.current
    if (!start || start.id !== event.pointerId) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (start.horizontal === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      start.horizontal = Math.abs(dx) > Math.abs(dy)
      if (start.horizontal) viewportRef.current?.setPointerCapture(event.pointerId)
    }
    if (!start.horizontal) return
    const atEdge = (active === 0 && dx > 0) || (active === count - 1 && dx < 0)
    dragRef.current = atEdge ? dx * 0.3 : dx
    setDrag(dragRef.current)
  }

  const onPointerEnd = () => {
    const start = dragStart.current
    dragStart.current = null
    if (!start?.horizontal) return
    const moved = dragRef.current
    const width = viewportRef.current?.offsetWidth ?? 1
    const threshold = Math.min(120, width * 0.15)
    if (moved <= -threshold) go(active + 1)
    else if (moved >= threshold) go(active - 1)
    dragRef.current = 0
    setDrag(0)
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 25) return
      event.preventDefault()
      const now = Date.now()
      if (now < wheelLock.current) return
      wheelLock.current = now + 600
      setActive((current) => Math.min(count - 1, Math.max(0, current + (event.deltaX > 0 ? 1 : -1))))
    }
    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [count])

  return (
    <section id="platforms" aria-label="What log does on each platform" className="w-full overflow-x-clip bg-white px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto flex w-full max-w-[86rem] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4 text-center md:gap-5">
          <h2 className="text-title max-w-4xl text-[#0D2A4C]">
            One tool for every platform
            <br className="hidden sm:block" />{' '}
            <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">you market on.</span>
          </h2>
          <p className="text-lede mx-auto max-w-2xl font-semibold text-[#0D2A4C]/85">
            Not just listening: log does <Mark>the whole job</Mark>. It <Mark>reads every inbox</Mark>,{' '}
            <Mark>replies and DMs</Mark>, <Mark>posts and lists</Mark> and keeps{' '}
            <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">every account</span> moving.
          </p>
        </div>

        <div role="tablist" aria-label="Platforms" className="flex flex-wrap justify-center gap-2">
          {PLATFORMS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-controls={`platform-slide-${item.id}`}
              onClick={() => go(index)}
              className={
                index === active
                  ? 'button-glow inline-flex items-center gap-2 rounded-xl border border-white/35 px-4 py-2 text-[15px] font-bold text-white'
                  : 'inline-flex items-center gap-2 rounded-xl bg-[#F3F6FA] px-4 py-2 text-[15px] font-medium text-[#0D2A4C]/70 transition-colors hover:bg-[#E7EDF5] hover:text-[#0D2A4C]'
              }
            >
              <FontAwesomeIcon icon={item.icon} className="text-[16px]" />
              {item.label}
            </button>
          ))}
        </div>

        <div
          ref={viewportRef}
          className={`w-full max-w-5xl touch-pan-y select-none [&_img]:[-webkit-user-drag:none] ${drag ? 'cursor-grabbing' : 'cursor-grab'}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onDragStart={(event) => event.preventDefault()}
        >
          <div
            className={`flex ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${drag ? '' : 'transition-transform duration-500'}`}
            style={{
              gap: `${SLIDE_GAP_REM}rem`,
              transform: `translateX(calc(${-active} * (100% + ${SLIDE_GAP_REM}rem) + ${drag}px))`,
            }}
          >
            {PLATFORMS.map((item, index) => (
              <div
                key={item.id}
                id={`platform-slide-${item.id}`}
                role="tabpanel"
                aria-label={item.label}
                aria-hidden={index !== active}
                className={`w-full shrink-0 transition-opacity duration-500 ${index === active ? 'opacity-100' : 'opacity-35'}`}
              >
                <PlatformCard platform={item} active={active} go={go} stats={stats} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
