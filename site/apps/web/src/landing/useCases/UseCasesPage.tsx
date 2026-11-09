import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { TextMorph } from 'torph/react'
import { Building2, Rocket, User, Users } from 'lucide-react'
import { siYcombinator } from 'simple-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComments } from '@fortawesome/free-regular-svg-icons'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faAnglesRight, faArrowRight, faCheck, faCopy, faFaceSmile, faImage, faMicrophone } from '@fortawesome/free-solid-svg-icons'
import Dither from '@/components/Dither'
import { AreaChart } from '@/components/dither-kit/area-chart'
import { Area } from '@/components/dither-kit/area'
import { useChart } from '@/components/dither-kit/chart-context'
import { Header } from '../Header'
import { SiteFooter } from '../SiteFooter'
import { ClayClouds } from '../ClayClouds'
import { DitherFade } from './DitherFade'
import { HowItWorks } from './HowItWorks'
import { PlatformScroll } from './platformStories'
import { PLATFORM_SESSIONS } from './platformSessions'
import { Control, Dashed } from '../Control'
import { PLATFORMS, type Platform } from '../PlatformSuite'
import { LogWith, PlatformMoney } from './PlatformMoney'
import { HandArrow, LOG_REPO_URL, RepoLink, ReviewMarquee, parseRepoUrl } from '../RepoLink'
import { GG_REVIEWS } from '../ggReviews'
import '../RepoModal.css'
import { USE_CASES, type ShowcaseId, type UseCase } from './useCaseCatalog'
import { PLATFORM_PAGES, pageForPlatform, type Moment, type PageId, type PlatformPage, type Play } from './platformPages'
import { QUICK_ANSWERS } from './quickAnswers'
import { StoryFaq } from '../story/StorySections'

const LIP = 'shadow-[0_0_0_1px_#C9E3FF,0_3px_0_#B5D6FF]'
const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'
const HAND = { fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }
const LOG_REPO = parseRepoUrl(LOG_REPO_URL)!
const SETUP_HREF = LOG_REPO_URL
const INSTALL = 'curl -fsSL https://log.listeningkit.com/install.sh | sh'

type Tab = { id: ShowcaseId | 'reddit' | 'linkedin'; label: string; icon: IconDefinition }

const platformOf = (id: string) => PLATFORMS.find((platform) => platform.id === id)!

const TABS: Tab[] = [
  ...(['x', 'facebook', 'discord', 'slack', 'instagram'] as const).map((id) => ({ id, label: platformOf(id).label, icon: platformOf(id).icon })),
  { id: 'everyChat', label: 'Every chat', icon: faComments },
  ...(['reddit', 'linkedin'] as const).map((id) => ({ id, label: platformOf(id).label, icon: platformOf(id).icon })),
]

const tabOf = (id: string) => TABS.find((tab) => tab.id === id)!


const FIRST_PLAYS = ['slack/dmReply', 'instagram/dmReply', 'twitter/dmInbox', 'discord/memeReply', 'facebook/marketplaceListings', 'inbox/voiceNote']

const ALL_PLAYS = [
  ...FIRST_PLAYS.map((page) => USE_CASES.find((useCase) => useCase.page === page)!),
  ...USE_CASES.filter((useCase) => !FIRST_PLAYS.includes(useCase.page)),
]

const docsHrefOf = (useCase: UseCase) => `/docs/useCases/${useCase.page}`

const casesFor = (page: PlatformPage | null) => {
  if (!page) return ALL_PLAYS
  if (!page.showcaseId) return []
  return [...USE_CASES.filter((useCase) => useCase.platform === page.showcaseId), ...USE_CASES.filter((useCase) => useCase.platform === 'everyChat')]
}


const AGENTS = [
  { id: 'claude', label: 'Claude Code', line: 'claude mcp add log -- logMcp' },
  { id: 'codex', label: 'Codex', line: 'codex mcp add log -- logMcp' },
  { id: 'cursor', label: 'Cursor', line: 'add logMcp to the MCP servers in Cursor' },
  { id: 'any', label: 'Any MCP client', line: 'the command is logMcp' },
]


function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#2A8CFF]">{children}</p>
}

function SendsTag({ useCase }: { useCase: UseCase }) {
  return useCase.readsOnly ? (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8F7EE] px-2 py-0.5 text-[12px] font-bold text-[#1E8E4F]">
      <span className="size-1.5 rounded-full bg-[#1E8E4F]" />
      {useCase.sends}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#EAF3FF] px-2 py-0.5 text-[12px] font-bold text-[#1F6FE6]">
      <span className="size-1.5 rounded-full bg-[#2A8CFF]" />
      {useCase.sends}
    </span>
  )
}

function PlatformTag({ id }: { id: string }) {
  const tab = tabOf(id)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F3F6FA] px-2 py-0.5 text-[12px] font-bold text-[#0D2A4C]/75">
      <FontAwesomeIcon icon={tab.icon} className="text-[11px] text-[#2A8CFF]" />
      {tab.label}
    </span>
  )
}

function useCycle(length: number, ms: number) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (length < 2) return
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % length), ms)
    return () => window.clearInterval(timer)
  }, [length, ms])
  return index
}

type GraphEvent = { id: string; icon: IconDefinition; label: string; tool: string; href: string }

const TIER_PX = [44, 118, 192, 81, 155]

const iconOfMoment = (moment: Moment, platform: Platform) =>
  moment.kind === 'react' ? faFaceSmile : moment.kind === 'voice' ? faMicrophone : moment.kind === 'meme' ? faImage : moment.kind === 'voiceGate' ? faCheck : platform.icon

const graphEvents = (platform: Platform | null, moments: Moment[]): GraphEvent[] => {
  if (!platform)
    return PLATFORMS.map((item) => ({ id: item.id, icon: item.icon, label: `log on ${item.label}`, tool: '', href: pageForPlatform(item.id)?.path ?? item.docsHref }))
  return moments.map((moment, index) => ({ id: `${moment.tool}${index}`, icon: iconOfMoment(moment, platform), label: moment.label, tool: moment.tool, href: SETUP_HREF }))
}

type GraphPoint = { event: GraphEvent | null; value: number }

const graphData = (events: GraphEvent[]): GraphPoint[] => {
  const count = events.length
  const rise = events.map((event, index) => {
    const t = count > 1 ? index / (count - 1) : 1
    return { event, value: 8 + Math.pow(t, 1.5) * 52 + Math.sin(t * 8) * 2.5 }
  })
  return [{ event: null, value: 3 }, ...rise, { event: null, value: rise[rise.length - 1].value + 5 }]
}

const MotionRepoLink = motion.create(RepoLink)

const LINE_SECONDS = 0.9

function GraphPins({ points, end }: { points: GraphPoint[]; end: string }) {
  const chart = useChart()
  if (!chart.ready) return null
  const width = chart.plot.width
  const lastIndex = points.length - 2
  const line = points
    .map((point, index) => `${chart.margins.left + chart.xCenter(index)},${chart.margins.top + chart.y(point.value)}`)
    .join(' ')
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <motion.polyline
          points={line}
          fill="none"
          stroke="#5CA7FF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: LINE_SECONDS, ease: 'linear' }}
        />
      </svg>
      {points.map((point, index) => {
        if (!point.event) return null
        const x = chart.margins.left + chart.xCenter(index)
        const y = chart.margins.top + chart.y(point.value)
        const tier = TIER_PX[(index - 1) % TIER_PX.length]
        const flip = x > width * 0.62
        const reach = (index / (points.length - 1)) * LINE_SECONDS
        return (
          <div key={point.event.id} className="absolute" style={{ left: x, top: y }}>
            <motion.span
              className="absolute bottom-0 left-0 w-0.5 -translate-x-1/2 bg-[#1A5FC8]"
              style={{ height: tier, transformOrigin: 'bottom' }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ type: 'spring', stiffness: 420, damping: 11, delay: reach + 0.05 }}
            />
            <MotionRepoLink
              href={point.event.href}
              title={point.event.label}
              aria-label={point.event.label}
              initial={{ scale: 0, y: 40, rotate: flip ? 8 : -8 }}
              animate={{ scale: 1, y: [0, -6, 0], rotate: 0 }}
              transition={{
                scale: { type: 'spring', stiffness: 520, damping: 11, delay: reach + 0.05 },
                rotate: { type: 'spring', stiffness: 400, damping: 9, delay: reach + 0.05 },
                y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: reach + 0.6 + (index % 3) * 0.35 },
              }}
              className={`pointer-events-auto absolute flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-[#2A8CFF] p-1 text-white shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px lg:pr-2.5 ${flip ? '-right-[22px] flex-row-reverse lg:pl-2.5 lg:pr-1' : '-left-[22px]'}`}
              style={{ bottom: tier - 2 }}
            >
              <span className="grid size-9 shrink-0 place-items-center text-[19px] text-white">
                <FontAwesomeIcon icon={point.event.icon} />
              </span>
              <span className={`hidden flex-col leading-tight lg:flex ${flip ? 'items-end' : 'items-start'}`}>
                <span className="text-[14px] font-bold text-white">{point.event.label}</span>
              </span>
            </MotionRepoLink>
            {index === lastIndex ? (
              <motion.span
                className="absolute -left-[18px] -top-[18px] size-9"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 520, damping: 10, delay: reach }}
              >
                <motion.span
                  className="block size-full rounded-md bg-[#2A8CFF]/20"
                  animate={{ scale: [1, 1.35, 1] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: reach + 0.4 }}
                />
              </motion.span>
            ) : null}
            <motion.span
              className="absolute -left-2 -top-2 size-4 rounded-[3px] border-[3px] border-[#1A5FC8] bg-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 600, damping: 10, delay: reach }}
            />
            {index === lastIndex ? (
              <motion.span
                className="absolute left-0 top-9 whitespace-nowrap rounded-md bg-[#1F6FE6] px-2 py-1 font-mono text-[12px] font-bold text-white shadow-[0_3px_0_#1A5FC8] sm:text-[14px]"
                style={{ x: '-50%', transformOrigin: 'top center' }}
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 520, damping: 11, delay: reach + 0.15 }}
              >
                {end}
              </motion.span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

GraphPins.chartLayer = 'dom' as const

const GRAPH_CONFIG = { value: { label: 'Use cases', color: 'brand' as const } }

function HeroGraph({ events, end }: { events: GraphEvent[]; end: string }) {
  const key = events.map((event) => event.id).join('|')
  const points = useMemo(() => graphData(events), [key])
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box, { amount: 0.15 })
  const [run, setRun] = useState(0)
  useEffect(() => {
    if (inView) setRun((count) => count + 1)
  }, [inView])
  return (
    <div ref={box} className="relative -mx-4 mt-44 h-[340px] sm:h-[420px] md:-mx-6 lg:h-[480px]">
      {run ? (
        <AreaChart key={run} data={points} config={GRAPH_CONFIG} margins={{ top: 0, right: 0, bottom: 0, left: 0 }} interactive={false} animationDuration={LINE_SECONDS * 1000}>
          <Area dataKey="value" variant="fade" />
          <GraphPins points={points} end={end} />
        </AreaChart>
      ) : null}
    </div>
  )
}

const HEADLINE_MAX = 84
const HEADLINE_MIN = 26

function useWrapped(texts: string[]) {
  const box = useRef<HTMLDivElement>(null)
  const probe = useRef<HTMLSpanElement>(null)
  const [state, setState] = useState<{ size: number; lines: string[][] }>({ size: HEADLINE_MAX, lines: texts.map((text) => [text]) })
  const key = texts.join('|')
  useLayoutEffect(() => {
    const fit = () => {
      if (!box.current || !probe.current) return
      const room = box.current.clientWidth
      const size = Math.max(HEADLINE_MIN + 8, Math.min(HEADLINE_MAX, Math.floor(room / 11)))
      probe.current.style.fontSize = `${size}px`
      const width = (text: string) => {
        probe.current!.textContent = text
        return probe.current!.getBoundingClientRect().width
      }
      const lines = texts.map((text) => {
        const rows: string[] = []
        for (const word of text.split(' ').filter(Boolean)) {
          const last = rows[rows.length - 1]
          if (last !== undefined && width(`${last} ${word}`) <= room) rows[rows.length - 1] = `${last} ${word}`
          else rows.push(word)
        }
        return rows.length ? rows : ['']
      })
      setState({ size, lines })
    }
    fit()
    document.fonts?.ready.then(fit).catch(() => {})
    const observer = new ResizeObserver(fit)
    if (box.current) observer.observe(box.current)
    return () => observer.disconnect()
  }, [key])
  return { box, probe, ...state }
}

type HeroLine = { before: string; after: string }

const JOB_LINES: HeroLine[] = [
  { before: 'Do the whole job on', after: '' },
  { before: 'Read every message on', after: '' },
  { before: 'Answer in your voice on', after: '' },
  { before: 'Send memes and voice notes on', after: '' },
  { before: 'Follow up for you on', after: '' },
]

const READ_ONLY_LINES: HeroLine[] = [
  { before: 'Do the whole job on', after: '' },
  { before: 'Read every thread on', after: '' },
  { before: 'Record each page on', after: '' },
  { before: 'Find what people ask for on', after: '' },
  { before: 'Never click a thing on', after: '' },
]

const jobLines = (platform: Platform) => (platform.id === 'reddit' ? READ_ONLY_LINES : JOB_LINES)

const HERO_VERBS = ['prospect', 'engage', 'book', 'convert', 'sell']

const HERO_LEDES: Record<string, string> = {
  x: 'log by ListeningKit lets your agent read **both inboxes** as one, see **who is waiting on you**, and send your replies, posts and DMs **in your own voice**, the moment you say so.',
  instagram: 'log by ListeningKit lets your agent answer every **DM** as it lands, with text or **a meme that fits**, straight through Instagram with **no browser**, the moment you say so.',
  slack: 'log by ListeningKit lets your agent read your **DMs and group DMs** in every workspace, **watch them live**, and reply **one line at a time** in your voice, the moment you say so.',
  discord: 'log by ListeningKit lets your agent read your **DMs, groups and channels**, **watch them live**, and reply with words or **a meme that fits**, the moment you say so.',
  reddit: 'log by ListeningKit lets your agent keep your Reddit account **signed in** and run your **recorded steps** in its own browser, **a dry run** until you say go.',
  all: 'log by ListeningKit lets your agent run **every use case** on every platform you market on, from **one ask** in plain words.',
}

const USED_BY = [
  { name: 'go-to-market engineering', Icon: Rocket },
  { name: 'Fortune 500 companies', Icon: Building2 },
  { name: 'agencies', Icon: Users },
  { name: 'solopreneurs', Icon: User },
]

function Hero({ platform }: { platform: Platform | null }) {
  const verb = useCycle(HERO_VERBS.length, 1800)
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [band, setBand] = useState<{ height: number; fade: number } | null>(null)
  useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    const frame = frameRef.current
    if (!section || !copy || !frame) return
    const measure = () => {
      const top = section.getBoundingClientRect().top
      const frameBox = frame.getBoundingClientRect()
      const height = Math.round(frameBox.top + frameBox.height / 2 - top)
      const fade = Math.max(96, Math.round(height - (copy.getBoundingClientRect().bottom - top + 8)))
      setBand({ height, fade })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(section)
    observer.observe(copy)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])
  const lede = HERO_LEDES[platform ? platform.id : 'all'] ?? HERO_LEDES.all
  const howPlatform = platform ?? platformOf('x')
  const howPage = pageForPlatform(howPlatform.id) ?? PLATFORM_PAGES[0]
  return (
    <section ref={sectionRef} aria-label="Hero" className="relative isolate w-full overflow-hidden text-left">
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 -z-10 overflow-hidden bg-[#2A8CFF] ${band ? '' : 'h-[calc(100%-8rem)] md:h-[calc(100%-14rem)]'}`}
        style={band ? { height: band.height } : undefined}
      >
        <div className="absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(ellipse_130%_100%_at_50%_0%,rgba(92,167,255,0.8)_0%,transparent_80%)]" />
        <ClayClouds className="absolute inset-x-0 top-12 h-[26rem] [mask-image:linear-gradient(to_bottom,black_75%,transparent)] md:top-14 md:h-[36rem]" />
        <DitherFade
          stops={['#2A8CFF', '#9CCBFF', '#FFFFFF']}
          cell={5}
          className={`absolute inset-x-0 bottom-0 w-full ${band ? '' : 'h-[22rem] md:h-[34rem]'}`}
          style={band ? { height: band.fade } : undefined}
        />
      </div>
      <div className="mx-auto w-full max-w-[86rem] px-4 pb-16 pt-72 md:px-6 md:pb-24 md:pt-[26rem]">
        <div ref={copyRef} className="grid items-end gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12 lg:gap-16">
          <h1 className="text-[clamp(2.75rem,1.4rem+4.2vw,5.25rem)] font-black leading-[0.95] tracking-[-0.04em] text-white">
            <span className="block whitespace-nowrap">
              Let AI{' '}
              <span className="inline-grid justify-items-start align-baseline">
                {HERO_VERBS.map((word) => (
                  <span key={word} aria-hidden className="invisible col-start-1 row-start-1">
                    {word}
                  </span>
                ))}
                <TextMorph as="span" duration={450} className="col-start-1 row-start-1">
                  {HERO_VERBS[verb]}
                </TextMorph>
              </span>
            </span>
            <span className="block text-white/65">
              to buyers desperate for your product on {platform ? platform.label : 'every platform'}
            </span>
          </h1>
          <div className="flex flex-col items-start gap-6 md:pb-2">
            <p className="text-2xl leading-tight text-white sm:text-3xl" style={HAND}>
              We&apos;re <span className="underline decoration-wavy decoration-2 underline-offset-4">NOT</span> backed by{' '}
              <span className="whitespace-nowrap">
                <span aria-hidden className="mr-[0.3em] inline-grid size-[0.9em] place-items-center overflow-hidden rounded-[0.12em] bg-white align-[-0.1em]">
                  <svg viewBox="0 0 24 24" className="size-full" fill={`#${siYcombinator.hex}`}>
                    <path d={siYcombinator.path} />
                  </svg>
                </span>
                Y Combinator
              </span>{' '}
              <span className="text-white/70">(yet)</span>
            </p>
            <p className="text-lede text-white/85">
              {lede.split(/(\*\*[^*]+\*\*)/g).map((part, partIndex) =>
                part.startsWith('**') ? (
                  <span key={partIndex} className="font-black text-white underline decoration-dashed underline-offset-4">
                    {part.slice(2, -2)}
                  </span>
                ) : (
                  <span key={partIndex}>{part}</span>
                ),
              )}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <RepoLink
                href={SETUP_HREF}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[16px] font-bold text-[#2A8CFF] shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
              >
                Set up log
                <FontAwesomeIcon icon={faArrowRight} className="text-[13px]" />
              </RepoLink>
              <a href="#play" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-[16px] font-bold text-white shadow-[0_3px_0_rgb(0_0_0/0.12)] transition-colors hover:bg-white/25">
                See the play
                <FontAwesomeIcon icon={faAnglesRight} className="text-[13px]" />
              </a>
            </div>
          </div>
        </div>
        <div ref={frameRef} aria-hidden className="h-40 md:h-48" />
        <div className="lk-repo relative mt-2 text-[#0D2A4C]" style={{ '--lk-brand-deep': '#c8d5e6' } as CSSProperties}>
          <p className="lk-hand mx-auto mb-5 max-w-6xl text-left text-2xl leading-[2.4rem] text-[#0D2A4C]">
            log&apos;s being <span className="lk-bluekey text-3xl">used</span> by leaders in{' '}
            {USED_BY.map(({ name, Icon }) => (
              <span
                key={name}
                className="mx-0.5 inline-flex items-center gap-1.5 rounded-sm bg-[#2A8CFF] px-1.5 py-0.5 align-middle text-lg leading-none text-white shadow-[0_3px_0_var(--lk-brand-deep)]"
              >
                <Icon size={16} strokeWidth={2.75} />
                {name}
              </span>
            ))}
            <HandArrow />
          </p>
          <ReviewMarquee reviews={GG_REVIEWS} />
        </div>
        <HowItWorks
          ask={howPage.play.ask}
          done={howPage.play.how.done}
          title={howPage.play.name}
          steps={howPage.play.how.steps.map((moment) => ({ icon: iconOfMoment(moment, howPlatform), label: moment.label, tool: moment.tool }))}
          platformLabel={howPlatform.label}
          platformIcon={howPlatform.icon}
          rows={howPage.play.how.rows}
        />
      </div>
    </section>
  )
}

export function CtaBand({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate w-full bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 22%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 22%, #000 70%, transparent 100%)',
        }}
      >
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
      {children}
    </div>
  )
}

const CHAT_AGENTS = [
  { name: 'Claude Code', src: '/logos/tools/claude-desktop.svg', tone: '#c96442' },
  { name: 'Codex', src: '/logos/tools/chatgpt.svg', tone: '#0D2A4C' },
  { name: 'Hermes', src: '/logos/tools/hermes.svg', tone: '#2A8CFF' },
]

const CHAT_TYPE_MS = 24
const CHAT_TICK_MS = 100

function AgentIcon({ src, tone }: { src: string; tone: string }) {
  const mask: CSSProperties = { maskImage: `url(${src})`, WebkitMaskImage: `url(${src})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }
  return <span aria-hidden className="block size-3.5" style={{ ...mask, backgroundColor: tone }} />
}

export function PlayChat({ page, offset }: { page: PlatformPage; offset: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const ask = page.play.ask
  const rows = page.play.how.rows
  const typed = Math.min(2200, ask.length * CHAT_TYPE_MS) + 400
  const reply = typed + 500
  const outcome = reply + 1200
  const end = outcome + rows.length * 350 + 3200
  const [clock, setClock] = useState({ now: 0, round: offset })
  useEffect(() => {
    if (!inView) return
    let start = performance.now() - clock.now
    let round = clock.round
    const timer = window.setInterval(() => {
      let now = performance.now() - start
      if (now >= end) {
        start = performance.now()
        round += 1
        now = 0
      }
      setClock({ now, round })
    }, CHAT_TICK_MS)
    return () => window.clearInterval(timer)
  }, [inView, end])
  const { now, round } = clock
  const agent = CHAT_AGENTS[round % CHAT_AGENTS.length]
  const letters = Math.min(ask.length, Math.floor(now / CHAT_TYPE_MS))
  const shownRows = now < outcome ? 0 : Math.min(rows.length, Math.floor((now - outcome) / 350) + 1)
  const pop = { type: 'spring' as const, stiffness: 520, damping: 15 }
  return (
    <span ref={ref} className="flex h-[19rem] flex-col overflow-hidden rounded-xl bg-[#F7F9FC] ring-1 ring-[#0D2A4C]/8">
      <span className="flex items-center gap-1.5 border-b border-[#0D2A4C]/8 px-2.5 py-1.5 text-[11px] font-bold text-[#0D2A4C]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={agent.name} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={pop} className="flex items-center gap-1.5">
            <AgentIcon src={agent.src} tone={agent.tone} />
            {agent.name}
          </motion.span>
        </AnimatePresence>
      </span>
      <span key={round} className="flex flex-1 flex-col justify-end gap-2 overflow-hidden p-2.5">
        <span className="ml-auto max-w-[95%] rounded-xl bg-[#2A8CFF] px-3 py-2 text-[13px] leading-snug text-white">
          {ask.slice(0, letters)}
          <span className="opacity-0">{ask.slice(letters)}</span>
        </span>
        {now >= reply ? (
          <motion.span key={now >= outcome ? 'done' : 'onIt'} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={pop} style={{ transformOrigin: 'left bottom' }} className="max-w-[95%] self-start rounded-xl bg-white px-3 py-2 text-[13px] leading-snug text-[#0D2A4C] ring-1 ring-[#0D2A4C]/8">
            {now >= outcome ? page.play.how.done : 'On it. Running the play with log…'}
          </motion.span>
        ) : null}
        {now >= outcome ? (
          <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={pop} style={{ transformOrigin: 'left bottom' }} className="w-full overflow-hidden rounded-lg bg-white ring-1 ring-[#0D2A4C]/8">
            {rows.map((row, rowIndex) => (
              <span key={row.who} className="flex h-7 items-center gap-2 border-b border-[#0D2A4C]/5 px-2.5 text-[11px] last:border-0">
                {rowIndex < shownRows ? (
                  <>
                    <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={pop} style={{ transformOrigin: 'left center' }} className="truncate font-bold">
                      {row.who}
                    </motion.span>
                    <span className="min-w-0 flex-1 truncate text-[#0D2A4C]/60">{row.what}</span>
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={pop} className="rounded bg-[#E8F7EE] px-1.5 py-0.5 text-[10px] font-bold text-[#1E8E4F]">
                      {row.status}
                    </motion.span>
                  </>
                ) : (
                  <span className="h-2 w-full rounded bg-[#0D2A4C]/6" />
                )}
              </span>
            ))}
          </motion.span>
        ) : null}
      </span>
    </span>
  )
}

export function MoreUseCases({ current }: { current: PlatformPage | null }) {
  const others = PLATFORM_PAGES.filter((item) => item.id !== current?.id)
  return (
    <section aria-label="Other use cases" className="relative w-full bg-white px-4 pb-24 pt-20 text-center text-[#0D2A4C] md:px-6 md:pb-32">
      <h2 className="text-title mx-auto max-w-4xl">
        One tool for every platform.
        <br />
        <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">More plays to run.</span>
      </h2>
      <ul className="mx-auto mt-12 grid w-full max-w-[96rem] grid-cols-1 gap-4 text-left sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {others.map((item, index) => {
          const shown = platformOf(item.platformId)
          return (
            <motion.li
              key={item.id}
              initial={{ scale: 0.6, y: 30 }}
              whileInView={{ scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: 'spring', stiffness: 520, damping: 15, delay: index * 0.06 }}
            >
              <div
                className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5 shadow-[0_4px_0_#1A5FC8,0_12px_24px_-12px_rgba(13,42,76,0.35)] ring-1 ring-[#0D2A4C]/8 transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center gap-2 text-[15px] font-bold text-[#2A8CFF]">
                  <span className="grid size-9 place-items-center rounded-lg bg-[#2A8CFF] text-[17px] text-white shadow-[0_3px_0_#1A5FC8]">
                    <FontAwesomeIcon icon={shown.icon} />
                  </span>
                  {shown.label}
                </span>
                <span className="text-[20px] font-black leading-tight tracking-[-0.02em]">{item.play.name}</span>
                <PlayChat page={item} offset={index} />
                <a
                  href={`${item.path}#play`}
                  className="mt-auto flex w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[#2A8CFF] px-3 py-3 text-[14px] font-bold text-white shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
                >
                  Set up the play in
                  <FontAwesomeIcon icon={shown.icon} className="text-[15px]" />
                  {shown.label}
                </a>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}

function JobGraph({ platform, moments }: { platform: Platform | null; moments: Moment[] }) {
  const lines = platform ? jobLines(platform) : PLATFORMS.map(() => ({ before: 'Do the whole job on', after: '' }))
  const index = useCycle(lines.length, platform ? 2800 : 2200)
  const shown = platform ?? PLATFORMS[index]
  const line = lines[index]
  const { box, probe, size, lines: wrapped } = useWrapped(lines.map((item) => item.before))
  const rowCount = Math.max(1, ...wrapped.map((rows) => rows.length))
  const rows = wrapped[index] ?? [line.before]
  return (
    <section aria-label="The job" className="relative w-full overflow-x-clip px-4 pb-0 pt-0 text-center text-[#0D2A4C] md:px-6">
      <div ref={box} className="relative mx-auto w-full max-w-6xl">
        <span ref={probe} aria-hidden className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap font-black tracking-[-0.045em]" />
        <h2 className="flex flex-col items-center justify-end font-black leading-[1.05] tracking-[-0.045em]" style={{ fontSize: size, minHeight: `${(rowCount + 1) * 1.05}em` }}>
          {rows.map((row, rowIndex) => (
            <TextMorph key={rowIndex} as="span" duration={450} className="block whitespace-nowrap">
              {row}
            </TextMorph>
          ))}
          <span className="flex items-center justify-center gap-x-[0.24em] whitespace-nowrap">
            <span className="inline-flex items-center gap-[0.16em] text-[#2A8CFF]">
              <span className="relative inline-grid size-[0.9em] shrink-0">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={shown.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 15 }}
                    className="grid size-[0.9em] place-items-center rounded-[0.22em] bg-[#2A8CFF] text-white shadow-[0_0.06em_0.12em_rgba(42,140,255,0.35)]"
                  >
                    <FontAwesomeIcon icon={shown.icon} className="text-[0.52em]" />
                  </motion.span>
                </AnimatePresence>
              </span>
              <TextMorph as="span" duration={450}>
                {shown.label}
              </TextMorph>
            </span>
            {line.after ? (
              <TextMorph as="span" duration={450}>
                {line.after}
              </TextMorph>
            ) : null}
          </span>
        </h2>
      </div>
      <HeroGraph
        events={graphEvents(platform, moments)}
        end={platform ? `One job on ${platform.label}, ${moments.length} tools` : `${PLATFORMS.length} platforms, one agent`}
      />
    </section>
  )
}


function useTyped(text: string, speed = 45, hold = 2200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(0)
    let current = 0
    let timer = 0
    const tick = () => {
      current = current >= text.length ? 0 : current + 1
      setCount(current)
      timer = window.setTimeout(tick, current >= text.length ? hold : current === 0 ? 400 : speed)
    }
    timer = window.setTimeout(tick, 600)
    return () => window.clearTimeout(timer)
  }, [text, speed, hold])
  return text.slice(0, count)
}

function AskDemo({ ask, icon }: { ask: string; icon: IconDefinition }) {
  const typed = useTyped(ask)
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex w-full items-center gap-2.5 rounded-xl bg-white px-3.5 py-3 text-left shadow-[0_4px_0_#1A5FC8]">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#2A8CFF] text-[13px] text-white">
          <FontAwesomeIcon icon={icon} />
        </span>
        <span className="min-w-0 font-mono text-[13px] leading-snug text-[#0D2A4C] [overflow-wrap:anywhere]">
          {typed}
          <span className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[2px] animate-pulse bg-[#2A8CFF]" />
        </span>
      </div>
      <span className="font-mono text-[12px] font-bold text-white/85">to your agent → log</span>
    </div>
  )
}

function HubDemo({ calls, icon }: { calls: string[]; icon: IconDefinition }) {
  const lit = useCycle(calls.length, 900)
  const spots = calls.map((call, index) => {
    const angle = (index / calls.length) * Math.PI * 2 - Math.PI / 2
    return { call, x: 50 + Math.cos(angle) * 38, y: 50 + Math.sin(angle) * 36 }
  })
  return (
    <div className="relative mx-auto aspect-[1.35] w-full max-w-[19rem]">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
        {spots.map((spot, index) => (
          <line
            key={spot.call}
            x1="50"
            y1="50"
            x2={spot.x}
            y2={spot.y}
            stroke="#ffffff"
            strokeOpacity={index === lit ? 0.95 : 0.35}
            strokeWidth="0.6"
            strokeDasharray="1.6 1.6"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <span className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-white shadow-[0_4px_0_#1A5FC8]">
        <img src="/logo.svg" alt="log" className="size-9 rounded-lg" />
      </span>
      {spots.map((spot, index) => (
        <span
          key={spot.call}
          className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-1 font-mono text-[10.5px] font-bold transition-all duration-300 ${
            index === lit ? 'scale-110 bg-white text-[#1F6FE6] shadow-[0_3px_0_#1A5FC8]' : 'bg-white/20 text-white'
          }`}
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
        >
          <FontAwesomeIcon icon={icon} className="text-[9px]" />
          {spot.call}
        </span>
      ))}
    </div>
  )
}

function OutDemo({ rows }: { rows: { label: string; tag: string }[] }) {
  const step = useCycle(rows.length + 2, 1100)
  return (
    <div className="flex w-full flex-col gap-2">
      {rows.map((row, index) => {
        const done = step > index
        return (
          <div
            key={row.label}
            className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-all duration-300 ${done ? 'bg-white shadow-[0_3px_0_#1A5FC8]' : 'bg-white/20'}`}
          >
            <span className={`flex items-center gap-2 text-[14px] font-bold ${done ? 'text-[#0D2A4C]' : 'text-white/80'}`}>
              <FontAwesomeIcon icon={faCheck} className={`text-[12px] ${done ? 'text-[#2A8CFF]' : 'text-white/40'}`} />
              {row.label}
            </span>
            <span className={`font-mono text-[11px] ${done ? 'text-[#0D2A4C]/60' : 'text-white/60'}`}>{row.tag}</span>
          </div>
        )
      })}
    </div>
  )
}


export function ThreeSteps({ play, platform, icon }: { play: Play; platform: Platform; icon: IconDefinition }) {
  const platformLabel = platform.label
  const steps = [
    { ...play.steps[0], demo: <AskDemo ask={play.ask} icon={icon} /> },
    { ...play.steps[1], demo: <HubDemo calls={play.calls} icon={icon} /> },
    { ...play.steps[2], demo: <OutDemo rows={play.outcome} /> },
  ]
  return (
    <section id="play" className="w-full scroll-mt-24 bg-white px-4 pb-20 pt-4 md:px-6">
      <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center gap-4 text-center">
        <h2 className="text-title text-[#0D2A4C]">
          Here’s a free play you can run on your {platformLabel} to earn some{' '}
          <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">$$$</span>
        </h2>
        <p className="text-lede font-semibold text-[#0D2A4C]/85">
          The play: <span className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">{play.name}</span>
        </p>
      </div>
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
        {steps.map((step, index) => (
          <div key={step.title} className="contents">
            <div
              className="flex flex-col gap-6 rounded-3xl px-6 pb-7 pt-8 text-white shadow-[0_6px_0_#1A5FC8]"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, #4FA6FF 0%, #2A8CFF 55%, #1F78F0 100%)' }}
            >
              <div className="flex h-[14rem] items-center justify-center">{step.demo}</div>
              <div className="flex flex-col gap-1">
                <p className="text-5xl font-black leading-none tracking-[-0.045em]">Step {index + 1}</p>
                <p className="mt-1 text-xl font-bold tracking-[-0.01em]">{step.title}</p>
                <p className="text-[15px] text-white/80">{step.body}</p>
              </div>
            </div>
            {index < steps.length - 1 ? (
              <div aria-hidden className="hidden items-center md:flex">
                <span className="grid size-9 place-items-center rounded-full bg-[#0D2A4C] text-white">
                  <FontAwesomeIcon icon={faArrowRight} className="text-[13px]" />
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function AskBubbles({ useCase }: { useCase: UseCase }) {
  const lines = useCase.asks.length ? useCase.asks.slice(0, 2) : [useCase.say]
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-[#F3F6FA] p-4">
      <span className="flex items-center gap-2 text-[12px] font-bold text-[#0D2A4C]/60">
        <img src="/logo.svg" alt="" className="size-5 rounded-md" />
        How you ask for it
      </span>
      {lines.map((line) => (
        <span
          key={line}
          className={`self-start rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[#0D2A4C] shadow-[0_2px_0_#E1E8F0] ${useCase.asks.length ? 'text-[17px] leading-snug' : 'font-mono text-[12.5px] [overflow-wrap:anywhere]'}`}
          style={useCase.asks.length ? HAND : undefined}
        >
          {useCase.asks.length ? `“${line}”` : line}
        </span>
      ))}
    </div>
  )
}

function UseCaseCard({ useCase, number, showPlatform }: { useCase: UseCase; number: number; showPlatform: boolean }) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-[#E1E8F0] bg-white p-4 shadow-[0_3px_0_#E1E8F0]">
      <AskBubbles useCase={useCase} />
      <div className="flex flex-1 flex-col gap-2 px-1">
        <span className="flex items-center gap-2 font-mono text-[13px] font-bold text-[#2A8CFF]">
          {String(number).padStart(2, '0')}
          {showPlatform ? <PlatformTag id={useCase.platform} /> : null}
        </span>
        <h3 className="text-xl font-bold leading-tight tracking-[-0.01em] text-[#0D2A4C]">{useCase.title}</h3>
        <p className="text-[15px] leading-snug text-[#0D2A4C]/70">{useCase.does}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <SendsTag useCase={useCase} />
        <a href={docsHrefOf(useCase)} className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#2A8CFF] hover:underline">
          Every step
          <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
        </a>
      </div>
    </article>
  )
}

function NoPageYet({ platform }: { platform: Platform }) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-dashed border-[#B5D6FF] bg-white p-6 md:col-span-2 lg:col-span-3">
      <p className="text-[15px] font-bold text-[#0D2A4C]">No use case page for {platform.label} yet. What log does there today:</p>
      <ul className="flex list-none flex-col gap-2 p-0">
        {platform.does.map((line) => (
          <li key={line} className="flex gap-2 text-[15px] text-[#0D2A4C]/75">
            <FontAwesomeIcon icon={faCheck} className="mt-1 text-[12px] text-[#2A8CFF]" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <a href={platform.docsHref} className={`inline-flex items-center gap-2 self-start rounded-md bg-white px-3 py-1.5 text-[14px] font-bold text-[#2A8CFF] ${LIP}`}>
        <FontAwesomeIcon icon={platform.icon} />
        Everything log does on {platform.label}
      </a>
    </article>
  )
}

const SHOWCASE_LIMIT = 6

function TabButton({ tab, active, onClick }: { tab: Tab; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? 'inline-flex items-center gap-2 rounded-xl bg-[#EAF3FF] px-3.5 py-2 text-[14px] font-bold text-[#0D2A4C] shadow-[inset_0_0_0_2px_#2A8CFF]'
          : 'inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[14px] font-medium text-[#0D2A4C]/70 transition-colors hover:bg-[#F3F6FA] hover:text-[#0D2A4C]'
      }
    >
      <FontAwesomeIcon icon={tab.icon} className="text-[14px] text-[#2A8CFF]" />
      {tab.label}
    </button>
  )
}

function Showcase({ page }: { page: PlatformPage | null }) {
  const [active, setActive] = useState<Tab['id']>('x')
  const [all, setAll] = useState(false)
  const platform = page ? platformOf(page.platformId) : null
  const cases = useMemo(
    () => (page ? casesFor(page) : USE_CASES.filter((useCase) => useCase.platform === active)),
    [page, active],
  )
  const shown = all ? cases : cases.slice(0, SHOWCASE_LIMIT)
  const tabPage = !page ? PLATFORM_PAGES.find((item) => item.showcaseId === active || item.platformId === active) : undefined
  const noPage = page ? !page.showcaseId : active === 'reddit' || active === 'linkedin'
  const choose = (id: Tab['id']) => {
    setActive(id)
    setAll(false)
  }
  return (
    <section id="showcase" className="w-full scroll-mt-24 bg-[#F7FAFD] px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <Eyebrow>The showcase</Eyebrow>
        <h2 className="text-title text-center text-[#0D2A4C]">
          {platform ? (
            <>
              Every <span className={STICKER}>{platform.label}</span> use case
            </>
          ) : (
            'Every use case, platform by platform'
          )}
        </h2>
        <p className="text-lede max-w-2xl text-center text-[#0D2A4C]/70">
          {platform
            ? noPage
              ? `${platform.label} has no use case page yet. This is what log does there today.`
              : `${cases.length} use cases that run on ${platform.label}, reactions and voice notes included. Each one is a page your agent runs from a fresh context.`
            : `${USE_CASES.length} use cases across ${PLATFORMS.length} platforms. Each one is a page your agent runs from a fresh context.`}
        </p>
        {!page ? (
          <div role="tablist" aria-label="Platforms" className="flex max-w-full flex-wrap justify-center gap-1.5 rounded-2xl bg-white p-1.5 shadow-[0_0_0_1px_#E1E8F0]">
            {TABS.map((tab) => (
              <TabButton key={tab.id} tab={tab} active={tab.id === active} onClick={() => choose(tab.id)} />
            ))}
          </div>
        ) : null}
        {!noPage ? <p className="font-mono text-[13px] text-[#2A8CFF]">What you say, then what log does.</p> : null}
        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {noPage ? (
            <NoPageYet platform={platformOf(page ? page.platformId : active)} />
          ) : (
            shown.map((useCase, index) => (
              <UseCaseCard key={useCase.page} useCase={useCase} number={index + 1} showPlatform={Boolean(page) && useCase.platform === 'everyChat'} />
            ))
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {cases.length > SHOWCASE_LIMIT ? (
            <button
              type="button"
              onClick={() => setAll((current) => !current)}
              className="rounded-xl bg-white px-4 py-2 text-[14px] font-bold text-[#0D2A4C] shadow-[0_0_0_1px_#E1E8F0,0_3px_0_#E1E8F0] transition-transform hover:-translate-y-px"
            >
              {all ? 'Show fewer' : `+ ${cases.length - SHOWCASE_LIMIT} more${platform ? '' : ` on ${tabOf(active).label}`}`}
            </button>
          ) : null}
          {tabPage ? (
            <a href={tabPage.path} className="button-glow inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-bold text-white shadow-[0_3px_0_#1A5FC8]">
              The {platformOf(tabPage.platformId).label} page
              <FontAwesomeIcon icon={faArrowRight} className="text-[12px]" />
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}

const PLAYS_LIMIT = 6

function Plays({ plays, title }: { plays: UseCase[]; title: string }) {
  const [all, setAll] = useState(false)
  const shown = all ? plays : plays.slice(0, PLAYS_LIMIT)
  return (
    <section id="plays" className="w-full scroll-mt-24 bg-white px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-title text-[#0D2A4C]">{title}</h2>
          <a href="/docs/useCases" className="button-glow inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[15px] font-bold text-white shadow-[0_3px_0_#1A5FC8]">
            Open the use cases
            <FontAwesomeIcon icon={faArrowRight} className="text-[12px]" />
          </a>
        </div>
        <ol className="grid list-none grid-cols-1 gap-x-8 gap-y-8 p-0 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((useCase, index) => (
            <li key={useCase.page} className="flex gap-3 border-l-2 border-[#E1E8F0] pl-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#F3F6FA] font-mono text-[11px] font-bold text-[#0D2A4C]/70">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="flex min-w-0 flex-col gap-2">
                <a href={docsHrefOf(useCase)} className="text-lg font-bold leading-tight text-[#0D2A4C] hover:text-[#2A8CFF]">
                  {useCase.title}
                </a>
                <div className="flex flex-wrap gap-1.5">
                  <PlatformTag id={useCase.platform} />
                  <SendsTag useCase={useCase} />
                </div>
                <p className="text-[14px] text-[#0D2A4C]/65">
                  <span className="font-bold text-[#0D2A4C]">→ Say </span>
                  <span className="font-mono text-[12.5px] [overflow-wrap:anywhere]">{useCase.say}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-col items-center gap-4">
          {plays.length > PLAYS_LIMIT ? (
            <button
              type="button"
              onClick={() => setAll((current) => !current)}
              className="rounded-xl bg-[#F3F6FA] px-4 py-2 text-[14px] font-bold text-[#0D2A4C] transition-colors hover:bg-[#E7EDF5]"
            >
              {all ? 'Show fewer' : `+ ${plays.length - PLAYS_LIMIT} more plays`}
            </button>
          ) : null}
          <span className="rounded-full bg-[#F3F6FA] px-4 py-2 text-[14px] font-semibold text-[#0D2A4C]/80">
            Every step, and what counts as done · <span className="font-bold text-[#2A8CFF]">in the docs</span>
          </span>
        </div>
      </div>
    </section>
  )
}

export function PromptCta({ title, ask, isCommand, install = INSTALL }: { title: string; ask: string; isCommand: boolean; install?: string }) {
  const [agent, setAgent] = useState(AGENTS[0])
  const [copied, setCopied] = useState(false)
  const prompt = [install, agent.line, isCommand ? `then: ${ask}` : `then say: "${ask}"`].join('\n')
  const copy = () => {
    navigator.clipboard
      ?.writeText(prompt)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => {})
  }
  return (
    <section id="prompt" className="w-full scroll-mt-24 bg-white px-4 pb-20 md:px-6 md:pb-28">
      <div
        className="mx-auto flex max-w-6xl flex-col items-center gap-6 rounded-[2rem] px-5 py-12 text-center text-white md:px-12 md:py-16"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #5CB2FF 0%, #1F6FE6 100%)' }}
      >
        <h2 className="text-title max-w-3xl">{title}</h2>
        <div role="tablist" aria-label="Agents" className="flex flex-wrap justify-center gap-1.5 rounded-2xl bg-white/15 p-1.5">
          {AGENTS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === agent.id}
              onClick={() => setAgent(item)}
              className={`rounded-xl px-3.5 py-2 text-[14px] font-bold transition-colors ${item.id === agent.id ? 'bg-white text-[#2A8CFF]' : 'text-white/85 hover:bg-white/10'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="w-full max-w-3xl rounded-2xl bg-[#0D2A4C] p-5 text-left font-mono text-[13px] shadow-[0_4px_0_#061a33] sm:text-[14px]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">Paste this into your terminal</p>
          <p className="[overflow-wrap:anywhere]"><span className="text-[#5CA7FF]">$ </span>{install}</p>
          <p className="mt-1 [overflow-wrap:anywhere]"><span className="text-[#5CA7FF]">$ </span>{agent.line}</p>
          {isCommand ? (
            <>
              <p className="mt-3 text-white/60">then:</p>
              <p className="mt-1 text-[#7BE3A4] [overflow-wrap:anywhere]"><span className="text-[#5CA7FF]">$ </span>{ask}</p>
            </>
          ) : (
            <>
              <p className="mt-3 text-white/60">then say to your agent:</p>
              <p className="mt-1 text-[#7BE3A4] [overflow-wrap:anywhere]">“{ask}”</p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={copy}
            className={`inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-[16px] font-bold text-[#2A8CFF] transition-transform hover:-translate-y-px ${LIP}`}
          >
            <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[14px]" />
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
          <RepoLink href={SETUP_HREF} className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-2.5 text-[16px] font-bold text-white hover:bg-white/10">
            The setup guide
          </RepoLink>
        </div>
      </div>
    </section>
  )
}


export function UseCasesPage({ platform: pageId }: { platform?: PageId }) {
  const page = pageId ? PLATFORM_PAGES.find((item) => item.id === pageId)! : null
  const platform = page ? platformOf(page.platformId) : null
  const cases = casesFor(page)
  const prompt = page ? page.prompt : 'go on docs/useCases/slack/dmReply.md for <someone>'
  const isCommand = prompt.startsWith('log ')
  useEffect(() => {
    const previous = document.title
    document.title = platform ? `${platform.label} · log by ListeningKit` : 'Use cases · log by ListeningKit'
    return () => {
      document.title = previous
    }
  }, [platform])
  return (
    <div className="flex min-h-screen flex-col bg-white" style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>
      <Header
        tone="light"
        homeHref="/"
        logoLabel="ListeningKit"
        githubRepo={`${LOG_REPO.owner}/${LOG_REPO.repo}`}
        className="z-[70]"
        accountItems={[{ href: SETUP_HREF, label: 'Set up log', variant: 'cta' }]}
      />
      <Hero platform={platform} />
      <PlatformScroll platformId={page ? page.platformId : 'slack'} ctaHref={SETUP_HREF} />
      {platform && page ? (
        <Control
          title={
            <>
              The best tool for
              <br className="hidden sm:block" />{' '}
              <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">{platform.label} marketing.</span>
            </>
          }
          lede={platform.body.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
            part.startsWith('**') ? <Dashed key={index}>{part.slice(2, -2)}</Dashed> : <span key={index}>{part}</span>,
          )}
          session={PLATFORM_SESSIONS[page.platformId]}
          platformLabel={platform.label}
        />
      ) : (
        <Control />
      )}
      <ThreeSteps play={(page ?? PLATFORM_PAGES.find((item) => item.id === 'twitter')!).play} platform={platform ?? platformOf('x')} icon={platform ? platform.icon : faXTwitter} />
      <PlatformMoney platformId={page ? page.platformId : 'x'} platformLabel={(platform ?? platformOf('x')).label} ctaHref={SETUP_HREF} />
      <CtaBand>
        <LogWith />
        <JobGraph platform={platform} moments={page ? page.moments : []} />
      </CtaBand>
      {page && platform ? (
        <div className="quick-answers">
          <StoryFaq title={`${platform.label} with log: quick answers`} items={QUICK_ANSWERS[page.id]} />
        </div>
      ) : null}
      <MoreUseCases current={page} />
      {page ? null : (
        <>
          <Showcase key="all" page={null} />
          <Plays plays={cases} title="Run these plays" />
          <PromptCta title="Run any use case with your agent" ask={prompt} isCommand={isCommand} />
        </>
      )}
      <SiteFooter />
    </div>
  )
}
