import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { motion } from 'motion/react'
import { autoUpdate, flip, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faFacebook, faInstagram, faLinkedin, faReddit, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { BrandMark, type BrandMarkId } from './BrandMark'
import { PLATFORM_DEMOS } from './PlatformDemos'
import { pageForPlatform } from './useCases/platformPages'
import { TILT_QUERY, useMediaQuery } from './useMediaQuery'

export type Platform = {
  id: string
  icon: IconDefinition
  label: string
  body: string
  example: string
  docsHref: string
  does: string[]
}

export const PLATFORMS: Platform[] = [
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
    id: 'slack',
    icon: faSlack,
    label: 'Slack',
    body: 'log reads your **DMs and group DMs** in every workspace, **watches live** and sends your replies one line at a time.',
    example: 'log slack read --account you --chat <who>',
    docsHref: '/docs/platforms/slack',
    does: [
      'log slack workspaces and chats: every workspace your session is signed in to, and your DMs and group DMs in each',
      'log slack read: the latest messages in a chat, found by who it is with',
      "log slack watch: every new message the moment Slack's own websocket sends it",
      'log slack send: one message per line to a DM or a group, a dry run until --live',
      'log slack react and voice: an emoji on a message, or a voice note in your own cloned voice, only when you ask',
    ],
  },
  {
    id: 'instagram',
    icon: faInstagram,
    label: 'Instagram',
    body: 'log reads your **DMs**, **watches live** and sends text and memes straight through Instagram, with **no browser**.',
    example: 'log instagram dms --account you --with <who>',
    docsHref: '/docs/useCases/instagram/dmReply',
    does: [
      'log instagram dms: your DM threads, newest first, or one thread with --with',
      "log instagram watch: Instagram's own realtime connection, every new DM the moment it lands",
      'log instagram send: text one message per line, or a meme with --photo, a dry run until --live',
      'log instagram react and voice: an emoji on a message, or a voice note in your own cloned voice, only when you ask',
      'log instagram session check: checks Instagram still accepts the saved session',
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

const SITE = 'https://log.listeningkit.com'

export function askAiPrompt(platform: Platform) {
  return [
    `I'm a marketer looking at log by ListeningKit (${SITE}, code at https://github.com/matthewdonsemail-lab/log). Read what it is below, then tell me how I'd use it on ${platform.label}.`,
    '',
    'What log is:',
    '- A free, open-source (MIT) social media tool that does the whole job, not only listening: it reads inboxes, groups and posts, then replies, DMs, posts and runs listings.',
    '- It runs on my own machine with my own accounts. Sessions and settings stay in ~/.logCli. Many accounts are kept in Twenty, an open-source CRM.',
    '- One command, `log`, and one MCP server, `logMcp`, so Claude Code, Codex or Cursor can run every command as a tool.',
    '- Nothing acts until I say so: anything that sends, posts or likes is a dry run until `--live`.',
    '- Each account keeps its own daily limits, pacing between actions and waking hours in its home timezone.',
    '- Platforms: X, Facebook (Marketplace and groups), Discord, Slack, Instagram, Reddit and LinkedIn.',
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

export function askAiGeneralPrompt() {
  return [
    `I'm a marketer looking at log by ListeningKit (${SITE}, code at https://github.com/matthewdonsemail-lab/log). Read what it is below, then tell me how I'd use it for my social media marketing.`,
    '',
    'What log is:',
    '- A free, open-source (MIT) social media tool that does the whole job, not only listening: it reads inboxes, groups and posts, then replies, DMs, posts and runs listings.',
    '- It runs on my own machine with my own accounts. Sessions and settings stay in ~/.logCli. Many accounts are kept in Twenty, an open-source CRM.',
    '- One command, `log`, and one MCP server, `logMcp`, so Claude Code, Codex or Cursor can run every command as a tool.',
    '- Nothing acts until I say so: anything that sends, posts or likes is a dry run until `--live`.',
    '- Platforms: X, Facebook (Marketplace and groups), Discord, Slack, Instagram, Reddit and LinkedIn.',
    '- Install: curl -fsSL https://log.listeningkit.com/install.sh | sh, then `claude mcp add log -- logMcp`.',
    '',
    `Docs: ${SITE}/docs and the step-by-step use cases at ${SITE}/docs/useCases.`,
    '',
    'Answer for log specifically, not other tools. Give me: 1) which platforms I should start with and why, 2) the three best ways a marketer like me would use log, 3) what I would ask my agent in plain words to run each, and 4) what I need to set up first.',
  ].join('\n')
}

function askAiLinks(prompt: string): { id: BrandMarkId; label: string; href: string }[] {
  const question = encodeURIComponent(prompt)
  return [
    { id: 'chatgpt', label: 'ChatGPT', href: `https://chatgpt.com/?q=${question}` },
    { id: 'perplexity', label: 'Perplexity', href: `https://www.perplexity.ai/search?q=${question}` },
    { id: 'claude', label: 'Claude', href: `https://claude.ai/new?q=${question}` },
  ]
}

function Mark({ children }: { children: string }) {
  return <span className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">{children}</span>
}

const SLIDE_GAP_REM = 3

function Plain({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith('**') ? (
          <span key={index} className="font-black underline decoration-white/70 decoration-dashed underline-offset-4">
            {part.slice(2, -2)}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}

export function AskAi({ prompt, about, placement = 'bottom-start' }: { prompt: string; about: string; placement?: 'bottom-start' | 'top-start' }) {
  const [open, setOpen] = useState(false)
  const links = askAiLinks(prompt)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(10), flip(), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context, { role: 'menu' })])
  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        {...getReferenceProps()}
        className="inline-flex items-center gap-2.5 rounded-xl bg-white/15 py-1.5 pl-1.5 pr-3.5 text-[15px] font-bold text-white ring-1 ring-white/40 transition-colors hover:bg-white/25"
      >
        <span className="flex -space-x-2.5">
          {links.map((link) => (
            <span key={link.id} className="grid size-8 place-items-center rounded-full bg-white text-[#0D2A4C] ring-2 ring-[#5DAEFF]">
              <BrandMark id={link.id} className="size-4" />
            </span>
          ))}
        </span>
        Ask AI about log
      </button>
      {open ? (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="z-[80] w-64 rounded-2xl bg-white p-2 text-left shadow-[0_4px_0_#1A5FC8,0_18px_40px_-12px_rgba(13,42,76,0.45)] ring-1 ring-[#0D2A4C]/10">
            <p className="px-2.5 pb-1.5 pt-1 text-[12px] font-bold text-[#0D2A4C]/55">Ask how log helps {about}</p>
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-[15px] font-bold text-[#0D2A4C] transition-colors hover:bg-[#EAF3FF]"
              >
                <span className="grid size-8 place-items-center rounded-full bg-[#EAF3FF] text-[#2A8CFF]">
                  <BrandMark id={link.id} className="size-4" />
                </span>
                Ask {link.label}
                <FontAwesomeIcon icon={faArrowRight} className="ml-auto text-[12px] text-[#0D2A4C]/40" />
              </a>
            ))}
          </div>
        </FloatingPortal>
      ) : null}
    </>
  )
}

function PlatformCard({
  platform,
}: {
  platform: Platform
}) {
  const tilt = useMediaQuery(TILT_QUERY)
  const Demo = PLATFORM_DEMOS[platform.id]
  const page = pageForPlatform(platform.id)
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
            <p className="max-w-xl text-lg font-semibold leading-snug text-white md:text-xl">
              <Plain text={platform.body} />
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={page ? page.path : platform.docsHref}
                className="inline-flex items-center gap-2.5 rounded-xl bg-white px-5 py-3 text-[16px] font-bold text-[#2A8CFF] shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
              >
                <FontAwesomeIcon icon={platform.icon} className="text-[16px]" />
                {page ? `See what log does on ${platform.label}` : `Read how log works on ${platform.label}`}
                <FontAwesomeIcon icon={faArrowRight} className="text-[13px]" />
              </a>
              <AskAi prompt={askAiPrompt(platform)} about={`your ${platform.label} marketing`} />
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
          <a
            href="/useCases"
            className={`inline-flex items-center gap-2 rounded-md bg-white px-3.5 py-2 text-[15px] font-bold text-[#2A8CFF] transition-transform hover:-translate-y-px ${LIP}`}
          >
            Every use case, platform by platform
            <FontAwesomeIcon icon={faArrowRight} className="text-[13px]" />
          </a>
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
                <PlatformCard platform={item} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2" role="group" aria-label="Choose a platform">
          {PLATFORMS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={index === active}
              onClick={() => go(index)}
              className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${index === active ? 'w-10 bg-[#2A8CFF]' : 'w-2.5 bg-[#2A8CFF]/30 hover:bg-[#2A8CFF]/55'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
