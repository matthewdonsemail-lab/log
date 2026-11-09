import { RepoLink } from '../RepoLink'
import { createContext, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faInstagram, faReddit, faSlack, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faArrowRight, faCamera, faChevronLeft, faForward, faHashtag, faHeart, faMicrophone, faPlay, faRetweet } from '@fortawesome/free-solid-svg-icons'
import { faComment } from '@fortawesome/free-regular-svg-icons'

const DESIGN_WIDTH = 360
const DESIGN_HEIGHT = 640
const BAR_HEIGHT = 64
const EASE = [0.22, 1, 0.36, 1] as const
const POP = { type: 'spring' as const, stiffness: 520, damping: 15, mass: 0.9 }
const CHAR_MS = 26
const MIN_PHASE_MS = 2800
const HOLD_SPEED = 2

type Clock = {
  after: (ms: number, run: () => void) => () => void
  now: () => number
}

const wallClock: Clock = {
  after: (ms, run) => {
    const timer = window.setTimeout(run, ms)
    return () => window.clearTimeout(timer)
  },
  now: () => performance.now(),
}

const ClockContext = createContext<Clock>(wallClock)

function useStoryTime() {
  const speed = useRef(1)
  const time = useRef(0)
  const jobs = useRef(new Map<number, { at: number; run: () => void }>())
  const listeners = useRef(new Set<(now: number) => void>())
  const nextId = useRef(0)
  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const loop = (stamp: number) => {
      time.current += Math.min(100, stamp - last) * speed.current
      last = stamp
      for (const [key, job] of jobs.current) {
        if (job.at > time.current) continue
        jobs.current.delete(key)
        job.run()
      }
      listeners.current.forEach((listen) => listen(time.current))
      frame = window.requestAnimationFrame(loop)
    }
    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [])
  const clock = useMemo<Clock>(
    () => ({
      after: (ms, run) => {
        nextId.current += 1
        const key = nextId.current
        jobs.current.set(key, { at: time.current + ms, run })
        return () => {
          jobs.current.delete(key)
        }
      },
      now: () => time.current,
    }),
    [],
  )
  return { clock, speed, listeners }
}

type ChromeId = 'slack' | 'discord' | 'instagram' | 'x' | 'reddit'

type Item =
  | {
      id: string
      kind: 'msg'
      who: string
      text: string
      you?: boolean
      react?: { emoji: string; phase: number }
    }
  | { id: string; kind: 'meme'; src: string; you?: boolean }
  | { id: string; kind: 'voice'; seconds: number; you?: boolean }
  | { id: string; kind: 'post'; who: string; handle: string; text: string; video?: string; image?: string }
  | { id: string; kind: 'reply'; who: string; text: string; you?: boolean }
  | { id: string; kind: 'redditPost'; sub: string; title: string; text: string }
  | { id: string; kind: 'signedIn'; name: string }
  | { id: string; kind: 'snapshot' }
  | { id: string; kind: 'notify'; who: string; text: string }

type Phase = { caption: string; screen: string; title: string; items: Item[] }

type Story = { id: string; chrome: ChromeId; phases: Phase[] }

type Slide = { lead: string; sticker: string; body: string; story: Story }

type Look = {
  icon: IconDefinition
  page: string
  bar: string
  text: string
  muted: string
  bubbles: boolean
  them: string
  you: string
  font: CSSProperties
}

const SANS = {
  fontFamily: "'Satoshi', Inter, system-ui, sans-serif",
}

const LOOKS: Record<ChromeId, Look> = {
  slack: {
    icon: faSlack,
    page: 'bg-white',
    bar: 'bg-[#3F0E40] text-white',
    text: 'text-[#1D1C1D]',
    muted: 'text-[#616061]',
    bubbles: false,
    them: '',
    you: '',
    font: SANS,
  },
  discord: {
    icon: faDiscord,
    page: 'bg-[#313338]',
    bar: 'bg-[#2B2D31] text-[#F2F3F5]',
    text: 'text-[#DBDEE1]',
    muted: 'text-[#949BA4]',
    bubbles: false,
    them: '',
    you: '',
    font: SANS,
  },
  instagram: {
    icon: faInstagram,
    page: 'bg-black',
    bar: 'bg-black text-white',
    text: 'text-white',
    muted: 'text-[#A8A8A8]',
    bubbles: true,
    them: 'bg-[#262626] text-white',
    you: 'bg-[#6E3FF3] text-white',
    font: SANS,
  },
  x: {
    icon: faXTwitter,
    page: 'bg-black',
    bar: 'bg-black text-[#E7E9EA]',
    text: 'text-[#E7E9EA]',
    muted: 'text-[#71767B]',
    bubbles: true,
    them: 'bg-[#2F3336] text-[#E7E9EA]',
    you: 'bg-[#1D9BF0] text-white',
    font: SANS,
  },
  reddit: {
    icon: faReddit,
    page: 'bg-[#DAE0E6]',
    bar: 'bg-white text-[#1A1A1B]',
    text: 'text-[#1A1A1B]',
    muted: 'text-[#7C7C7C]',
    bubbles: false,
    them: '',
    you: '',
    font: SANS,
  },
}

const TONES = ['#E01E5A', '#2EB67D', '#ECB22E', '#8E5CF7', '#F2683A', '#1D9BF0']

const toneOf = (name: string) => TONES[name.length % TONES.length]

const textOf = (item: Item) => ('text' in item ? item.text : '')

const typingSeconds = (item: Item) => 0.45 + (textOf(item).length * CHAR_MS) / 1000 + 0.35

const PICK_LEAD = 1.9
const DOTS_LEAD = 0.9

const leadOf = (item: Item) => (item.kind === 'meme' || item.kind === 'voice' ? PICK_LEAD : item.kind === 'msg' && !item.you ? DOTS_LEAD : 0)

const spanOf = (item: Item) => (item.kind === 'meme' || item.kind === 'voice' ? 1.3 : item.kind === 'notify' ? 2.4 : typingSeconds(item))

const delaysOf = (items: Item[]) => {
  let at = 0.35
  return items.map((item) => {
    const delay = at + leadOf(item)
    at = delay + spanOf(item)
    return delay
  })
}

const phaseMs = (story: Story, index: number) => {
  const phase = story.phases[index]
  const delays = delaysOf(phase.items)
  const last = phase.items.length ? delays[delays.length - 1] + spanOf(phase.items[phase.items.length - 1]) : 0
  const reacts = story.phases.flatMap((each) => each.items).some((item) => item.kind === 'msg' && item.react?.phase === index)
  return Math.max(MIN_PHASE_MS, (last + (reacts ? 2.4 : 0) + 1.3) * 1000)
}

function Typed({ text, delay }: { text: string; delay: number }) {
  const clock = useContext(ClockContext)
  const startDelay = useRef(delay)
  const [count, setCount] = useState(delay < 0 ? text.length : 0)
  useEffect(() => {
    if (startDelay.current < 0) return
    let cancel = () => {}
    let index = 0
    const step = () => {
      index += 1
      setCount(index)
      if (index < text.length) cancel = clock.after(CHAR_MS, step)
    }
    cancel = clock.after(startDelay.current * 1000 + 300, step)
    return () => cancel()
  }, [text, clock])
  return (
    <>
      {text.slice(0, count)}
      <span className="opacity-0">{text.slice(count)}</span>
    </>
  )
}

function Avatar({ name, round = true, size = 'size-8' }: { name: string; round?: boolean; size?: string }) {
  return (
    <span className={`grid ${size} shrink-0 place-items-center text-[12px] font-black text-white ${round ? 'rounded-full' : 'rounded-lg'}`} style={{ backgroundColor: toneOf(name) }}>
      {name.charAt(0).toUpperCase()}
    </span>
  )
}

function Tap() {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80 bg-white/45"
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.25, 0.9, 1, 0] }}
      transition={{ duration: 1.1, times: [0, 0.25, 0.4, 0.75, 1] }}
    />
  )
}

function ReactionBadge({ emoji, fresh, look }: { emoji: string; fresh: boolean; look: Look }) {
  return (
    <motion.span
      initial={fresh ? { scale: 0 } : false}
      animate={{ scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 16,
        delay: fresh ? 1.4 : 0,
      }}
      className={`absolute -bottom-3 right-2 z-20 grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[13px] shadow-sm ${look.bubbles ? 'bg-[#262626] ring-2 ring-black' : 'bg-white ring-1 ring-[#DDDDDD]'}`}
    >
      {emoji}
    </motion.span>
  )
}

const PICKER = ['❤️', '😂', '😮', '🙌', '🔥', '👍']

function EmojiPicker({ chosen, look }: { chosen: string; look: Look }) {
  const row = PICKER.includes(chosen) ? PICKER : [chosen, ...PICKER.slice(1)]
  return (
    <motion.div
      initial={{ scale: 0, y: 10 }}
      animate={{ scale: [0, 1.18, 0.95, 1, 1, 0], y: [10, 0, 0, 0, 0, 0] }}
      transition={{ duration: 1.5, times: [0, 0.14, 0.22, 0.3, 0.85, 1] }}
      className={`absolute -top-12 left-0 z-30 flex gap-1 rounded-full px-2 py-1.5 shadow-lg ${look.bubbles || look === LOOKS.discord ? 'bg-[#262626]' : 'bg-white ring-1 ring-[#DDDDDD]'}`}
    >
      {row.map((emoji) => (
        <motion.span key={emoji} className="text-[18px]" animate={emoji === chosen ? { scale: [1, 1, 1.5, 1.5] } : { scale: 1 }} transition={{ duration: 1.2, times: [0, 0.5, 0.7, 1] }}>
          {emoji}
        </motion.span>
      ))}
    </motion.div>
  )
}

function Message({ item, delay, phase, look }: { item: Extract<Item, { kind: 'msg' }>; delay: number; phase: number; look: Look }) {
  const reacted = item.react && phase >= item.react.phase
  const fresh = Boolean(item.react && phase === item.react.phase)
  if (look.bubbles) {
    return (
      <div className={`relative flex max-w-[80%] ${item.you ? 'self-end' : 'self-start'}`}>
        {fresh && item.react ? <EmojiPicker chosen={item.react.emoji} look={look} /> : null}
        <motion.span
          className={`relative rounded-[20px] px-3.5 py-2.5 text-[14px] leading-snug ${item.you ? look.you : look.them}`}
          animate={fresh ? { scale: [1, 0.95, 1] } : { scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typed text={item.text} delay={delay} />
          {fresh ? <Tap /> : null}
        </motion.span>
        {reacted && item.react ? <ReactionBadge emoji={item.react.emoji} fresh={fresh} look={look} /> : null}
      </div>
    )
  }
  return (
    <div className="relative flex items-start gap-2.5 px-1">
      <Avatar name={item.who} round={look === LOOKS.discord} size="size-9" />
      <div className="relative min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className={`text-[14px] font-bold ${look === LOOKS.discord ? 'text-white' : look.text}`}>{item.who}</span>
          <span className={`text-[11px] ${look.muted}`}>{item.you ? 'now' : '4:12 PM'}</span>
        </div>
        {fresh && item.react ? <EmojiPicker chosen={item.react.emoji} look={look} /> : null}
        <p className={`relative text-[14px] leading-snug ${look.text}`}>
          <Typed text={item.text} delay={delay} />
          {fresh ? <Tap /> : null}
        </p>
        {reacted && item.react ? (
          <motion.span
            initial={fresh ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 420,
              damping: 16,
              delay: fresh ? 1.4 : 0,
            }}
            className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] ${look === LOOKS.discord ? 'border-[#5865F2] bg-[#3B405A] text-white' : 'border-[#1D9BD1] bg-[#E8F5FA] text-[#1264A3]'}`}
          >
            {item.react.emoji} <span className="font-bold">1</span>
          </motion.span>
        ) : null}
      </div>
    </div>
  )
}

function Meme({ item, look }: { item: Extract<Item, { kind: 'meme' }>; look: Look }) {
  return (
    <div className={look.bubbles ? `max-w-[72%] ${item.you ? 'self-end' : 'self-start'}` : 'flex items-start gap-2.5 px-1'}>
      {look.bubbles ? null : <Avatar name="You" round={look === LOOKS.discord} size="size-9" />}
      <div className={look.bubbles ? '' : 'min-w-0 flex-1'}>
        {look.bubbles ? null : <span className={`text-[14px] font-bold ${look === LOOKS.discord ? 'text-white' : look.text}`}>You</span>}
        <motion.img
          src={item.src}
          alt=""
          className={`block w-full rounded-2xl object-cover ${look.bubbles ? '' : 'mt-1 max-w-[230px] rounded-lg'}`}
          style={{ transformOrigin: 'bottom right' }}
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={POP}
        />
      </div>
    </div>
  )
}

function Voice({ item, look }: { item: Extract<Item, { kind: 'voice' }>; look: Look }) {
  const bars = [6, 12, 18, 10, 22, 14, 8, 16, 20, 9, 13, 18, 7, 11, 15, 19, 9, 12]
  const tone = look.bubbles ? look.you : 'bg-[#2A8CFF] text-white'
  return (
    <div className={`flex items-center gap-2.5 rounded-full px-3 py-2.5 ${tone} ${look.bubbles ? 'self-end' : 'ml-12 self-start'}`}>
      <span className="grid size-7 place-items-center rounded-full bg-white/25 text-[11px]">
        <FontAwesomeIcon icon={faPlay} />
      </span>
      <span className="flex h-6 items-center gap-[2px]">
        {bars.map((height, index) => (
          <motion.span
            key={index}
            className="w-[2.5px] rounded-full bg-current"
            animate={{ height: [height * 0.45, height, height * 0.45] }}
            transition={{ duration: 1, repeat: Infinity, delay: index * 0.05 }}
          />
        ))}
      </span>
      <span className="text-[12px] font-bold tabular-nums">0:{String(item.seconds).padStart(2, '0')}</span>
      <FontAwesomeIcon icon={faMicrophone} className="text-[11px] opacity-80" />
    </div>
  )
}

function Post({ item }: { item: Extract<Item, { kind: 'post' }> }) {
  return (
    <div className="flex gap-2.5 border-b border-[#2F3336] px-1 pb-3">
      <Avatar name={item.who} size="size-10" />
      <div className="min-w-0 flex-1">
        <p className="text-[14px]">
          <span className="font-bold text-[#E7E9EA]">{item.who}</span> <span className="text-[#71767B]">{item.handle} · 2h</span>
        </p>
        <p className="mt-0.5 text-[15px] leading-snug text-[#E7E9EA]">{item.text}</p>
        {item.video ? (
          <video src={item.video} className="mt-2 block max-h-[15rem] w-full rounded-2xl border border-[#2F3336] bg-black object-cover" autoPlay muted loop playsInline preload="metadata" />
        ) : item.image ? (
          <img src={item.image} alt="" className="mt-2 block max-h-[15rem] w-full rounded-2xl border border-[#2F3336] object-cover" />
        ) : null}
        <div className="mt-2 flex justify-between pr-6 text-[12px] text-[#71767B]">
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faComment} /> 18
          </span>
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faRetweet} /> 6
          </span>
          <span className="flex items-center gap-1.5">
            <FontAwesomeIcon icon={faHeart} /> 124
          </span>
        </div>
      </div>
    </div>
  )
}

function Reply({ item, delay }: { item: Extract<Item, { kind: 'reply' }>; delay: number }) {
  return (
    <div className={`flex gap-2.5 px-1 ${item.you ? 'pl-8' : ''}`}>
      <Avatar name={item.who} size="size-8" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px]">
          <span className="font-bold text-[#E7E9EA]">{item.who}</span> <span className="text-[#71767B]">{item.you ? '· now' : '· 1h'}</span>
        </p>
        <p className="text-[14px] leading-snug text-[#E7E9EA]">
          <Typed text={item.text} delay={delay} />
        </p>
      </div>
    </div>
  )
}

function RedditComment({ item, delay }: { item: Extract<Item, { kind: 'reply' }>; delay: number }) {
  return (
    <div className={`flex gap-2.5 rounded-md bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.12)] ${item.you ? 'ml-6 border-l-2 border-[#FF4500]' : ''}`}>
      <Avatar name={item.who} size="size-7" />
      <div className="min-w-0 flex-1">
        <p className="text-[12px]">
          <span className="font-bold text-[#1A1A1B]">{item.who}</span> <span className="text-[#7C7C7C]">{item.you ? '· now' : '· 1h'}</span>
        </p>
        <p className="text-[14px] leading-snug text-[#1A1A1B]">
          <Typed text={item.text} delay={delay} />
        </p>
      </div>
    </div>
  )
}

function RedditPost({ item }: { item: Extract<Item, { kind: 'redditPost' }> }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
      <span className="flex items-center gap-1.5 text-[11px] text-[#7C7C7C]">
        <span className="grid size-5 place-items-center rounded-full bg-[#FF4500] text-[10px] text-white">
          <FontAwesomeIcon icon={faReddit} />
        </span>
        <span className="font-bold text-[#1A1A1B]">{item.sub}</span> · 3h
      </span>
      <span className="text-[16px] font-bold leading-snug text-[#1A1A1B]">{item.title}</span>
      <span className="text-[13px] leading-snug text-[#1A1A1B]/80">{item.text}</span>
      <span className="mt-1 flex gap-4 text-[12px] font-bold text-[#7C7C7C]">
        <span>▲ 214 ▼</span>
        <span>
          <FontAwesomeIcon icon={faComment} /> 87
        </span>
      </span>
    </div>
  )
}

function SignedIn({ item }: { item: Extract<Item, { kind: 'signedIn' }> }) {
  return (
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={POP} className="flex items-center gap-3 self-center rounded-full bg-white py-2 pl-2 pr-4 shadow-[0_1px_2px_rgba(0,0,0,0.12)]">
      <span className="grid size-9 place-items-center rounded-full bg-[#FF4500] text-[16px] text-white">
        <FontAwesomeIcon icon={faReddit} />
      </span>
      <span className="flex flex-col">
        <span className="text-[13px] font-bold text-[#1A1A1B]">u/{item.name}</span>
        <span className="text-[11px] font-bold text-[#46D160]">● signed in</span>
      </span>
    </motion.div>
  )
}

function Snapshot() {
  return (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-white"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 0] }}
        transition={{ duration: 0.6, times: [0, 0.4, 1] }}
      />
      <motion.span
        initial={{ y: 12, scale: 0 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ ...POP, delay: 0.5 }}
        className="flex items-center gap-2 self-center rounded-full bg-[#1A1A1B] px-3 py-1.5 text-[12px] font-bold text-white"
      >
        <FontAwesomeIcon icon={faCamera} /> Snapshot taken, nothing clicked
      </motion.span>
    </>
  )
}

function ItemView({ item, delay, phase, look }: { item: Item; delay: number; phase: number; look: Look }) {
  if (item.kind === 'msg') return <Message item={item} delay={delay} phase={phase} look={look} />
  if (item.kind === 'meme') return <Meme item={item} look={look} />
  if (item.kind === 'voice') return <Voice item={item} look={look} />
  if (item.kind === 'post') return <Post item={item} />
  if (item.kind === 'reply') return look.bubbles === false && look.page === 'bg-[#DAE0E6]' ? <RedditComment item={item} delay={delay} /> : <Reply item={item} delay={delay} />
  if (item.kind === 'redditPost') return <RedditPost item={item} />
  if (item.kind === 'signedIn') return <SignedIn item={item} />
  if (item.kind === 'snapshot') return <Snapshot />
  return null
}

function TopBar({ look, chrome, title }: { look: Look; chrome: ChromeId; title: string }) {
  const channel = title.startsWith('#')
  return (
    <div
      className={`flex items-center gap-2.5 px-4 pb-3 pt-5 ${look.bar} ${chrome === 'instagram' || chrome === 'x' ? 'border-b border-white/10' : ''} ${chrome === 'reddit' ? 'border-b border-[#EDEFF1]' : ''}`}
    >
      <FontAwesomeIcon icon={faChevronLeft} className="text-[14px] opacity-80" />
      {channel ? (
        <FontAwesomeIcon icon={faHashtag} className="text-[15px] opacity-80" />
      ) : chrome === 'reddit' ? (
        <FontAwesomeIcon icon={faReddit} className="text-[20px] text-[#FF4500]" />
      ) : (
        <Avatar name={title} round={chrome !== 'slack'} size="size-7" />
      )}
      <span className="truncate text-[15px] font-bold">{title.replace(/^#\s?/, '')}</span>
      <FontAwesomeIcon icon={LOOKS[chrome].icon} className="ml-auto text-[15px] opacity-70" />
    </div>
  )
}

function TypingDots({ look, who }: { look: Look; who: string }) {
  const dots = (
    <span className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <motion.span key={index} className="size-1.5 rounded-full bg-current" animate={{ y: [0, -5, 0], scale: [1, 1.3, 1] }} transition={{ duration: 0.7, repeat: Infinity, delay: index * 0.15 }} />
      ))}
    </span>
  )
  if (look.bubbles) return <span className={`self-start rounded-[20px] px-4 py-3.5 ${look.them}`}>{dots}</span>
  return (
    <span className={`ml-12 flex items-center gap-2 text-[12px] ${look.muted}`}>
      {dots}
      <span className="font-bold">{who}</span> is typing…
    </span>
  )
}

function Arriving({ after, lead, typing, children }: { after: number; lead: number; typing: ReactNode; children: ReactNode }) {
  const clock = useContext(ClockContext)
  const startAfter = useRef(after)
  const [stage, setStage] = useState<'away' | 'typing' | 'here'>(after <= 0 ? 'here' : 'away')
  useEffect(() => {
    if (startAfter.current <= 0) return
    const cancels = [clock.after(startAfter.current * 1000, () => setStage('here'))]
    if (typing && lead > 0) cancels.push(clock.after(Math.max(0, startAfter.current - lead) * 1000, () => setStage('typing')))
    return () => cancels.forEach((cancel) => cancel())
  }, [clock])
  if (stage === 'away') return null
  if (stage === 'typing') {
    return (
      <motion.div layout className="flex flex-col" style={{ transformOrigin: 'bottom left' }} initial={{ scale: 0, y: 10 }} animate={{ scale: 1, y: 0 }} transition={POP}>
        {typing}
      </motion.div>
    )
  }
  return (
    <motion.div
      layout
      className="flex flex-col"
      style={{ transformOrigin: 'bottom center' }}
      initial={startAfter.current < 0 ? { y: 0, scale: 1 } : { y: 18, scale: 0.5 }}
      animate={{ y: 0, scale: 1 }}
      transition={POP}
    >
      {children}
    </motion.div>
  )
}

function Swipe() {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute top-1/2 z-40 size-12 rounded-full border-2 border-white/80 bg-white/45"
      initial={{ left: '82%', scale: 0 }}
      animate={{ left: ['82%', '82%', '14%', '14%'], scale: [0, 1.2, 1, 0] }}
      transition={{ duration: 0.8, times: [0, 0.2, 0.75, 1] }}
    />
  )
}

function LockScreen({ item, chrome }: { item: Extract<Item, { kind: 'notify' }>; chrome: ChromeId }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center bg-gradient-to-b from-[#1F6FE6] via-[#5CA7FF] to-[#BFDDFF] pt-14 text-white" style={SANS}>
      <span className="text-[13px] font-bold opacity-80">Thursday 6 November</span>
      <span className="text-[64px] font-bold leading-none tracking-[-0.03em]">4:12</span>
      <motion.div
        initial={{ y: -260, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.5 }}
        className="relative mt-8 flex w-[88%] items-center gap-3 rounded-[22px] bg-white/85 p-3 text-[#0D2A4C] shadow-lg backdrop-blur"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#0D2A4C] text-[17px] text-white">
          <FontAwesomeIcon icon={LOOKS[chrome].icon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex justify-between text-[12px] font-bold">
            {item.who}
            <span className="font-medium opacity-60">now</span>
          </span>
          <span className="block truncate text-[13px]">{item.text}</span>
        </span>
        <motion.span
          aria-hidden
          className="absolute left-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/50"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.25, 0.9, 0] }}
          transition={{ duration: 0.8, delay: 1.6, times: [0, 0.35, 0.6, 1] }}
        />
      </motion.div>
    </div>
  )
}

function Picker({ kind, look, start }: { kind: 'meme' | 'voice'; look: Look; start: number }) {
  const clock = useContext(ClockContext)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const cancels = [clock.after(start * 1000, () => setOpen(true)), clock.after((start + PICK_LEAD - 0.15) * 1000, () => setOpen(false))]
    return () => cancels.forEach((cancel) => cancel())
  }, [start, clock])
  const dark = look.bubbles || look === LOOKS.discord
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.4, ease: EASE }}
          className={`absolute inset-x-0 bottom-0 z-30 rounded-t-[22px] px-4 pb-6 pt-3 ${dark ? 'bg-[#1C1C1E] text-white' : 'bg-white text-[#1D1C1D] shadow-[0_-6px_20px_rgba(0,0,0,0.12)]'}`}
        >
          <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-current opacity-30" />
          {kind === 'meme' ? (
            <>
              <span className="text-[12px] font-bold opacity-70">Memes</span>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {['/memes/beatTheAllegations.webp', '/memes/surprisedSnoop.webp', '/memes/beatTheAllegations.webp'].map((src, index) => (
                  <span key={index} className="relative aspect-square overflow-hidden rounded-lg">
                    <img src={src} alt="" className={`size-full object-cover ${index === 2 ? 'opacity-40 grayscale' : ''}`} />
                    {index === 0 ? <Tap /> : null}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="text-[13px] font-bold tabular-nums">
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="mr-1.5 inline-block size-2 rounded-full bg-[#FF3B30]" />
                Recording
              </span>
              <span className="relative grid size-16 place-items-center">
                <motion.span className="absolute inset-0 rounded-full bg-[#2A8CFF]/30" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
                <span className="relative grid size-14 place-items-center rounded-full bg-[#2A8CFF] text-[22px] text-white">
                  <FontAwesomeIcon icon={faMicrophone} />
                </span>
              </span>
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function Screen({ story, phase }: { story: Story; phase: number }) {
  const look = LOOKS[story.chrome]
  const current = story.phases[phase]
  let first = phase
  while (first > 0 && story.phases[first - 1].screen === current.screen) first -= 1
  const rows = story.phases.slice(first, phase + 1).flatMap((each, offset) => {
    const delays = delaysOf(each.items)
    const live = first + offset === phase
    return each.items.map((item, index) => ({
      item,
      delay: live ? delays[index] : -10,
      live,
    }))
  })
  const topAnchored = rows.some((row) => row.item.kind === 'post' || row.item.kind === 'redditPost')
  const notify = rows.find((row) => row.item.kind === 'notify')?.item
  const pickers = rows.filter((row) => row.live && (row.item.kind === 'meme' || row.item.kind === 'voice'))
  return (
    <motion.div
      key={`${current.screen}${first}`}
      className={`absolute inset-0 flex flex-col ${look.page}`}
      initial={first === 0 ? { x: 0 } : { x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '-35%' }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {notify && notify.kind === 'notify' ? (
        <LockScreen item={notify} chrome={story.chrome} />
      ) : (
        <>
          <TopBar look={look} chrome={story.chrome} title={current.title} />
          <div className={`relative flex flex-1 flex-col gap-3.5 overflow-hidden px-3 pb-5 pt-4 ${topAnchored ? 'justify-start' : 'justify-end'}`}>
            {rows.map((row) => (
              <Arriving
                key={row.item.id}
                after={row.live ? Math.max(0, row.delay) : -1}
                lead={leadOf(row.item)}
                typing={row.item.kind === 'msg' && !row.item.you ? <TypingDots look={look} who={row.item.who} /> : null}
              >
                <ItemView item={row.item} delay={row.live ? 0 : -1} phase={phase} look={look} />
              </Arriving>
            ))}
            {pickers.map((row) =>
              row.item.kind === 'meme' || row.item.kind === 'voice' ? <Picker key={`pick${row.item.id}`} kind={row.item.kind} look={look} start={Math.max(0, row.delay - PICK_LEAD)} /> : null,
            )}
          </div>
          {first > 0 ? <Swipe /> : null}
        </>
      )}
    </motion.div>
  )
}

function useStoryClock(story: Story, playing: boolean, clock: Clock) {
  const [state, setState] = useState({ phase: 0, loop: 0 })
  const phaseStart = useRef({ at: 0, ms: phaseMs(story, 0) })
  useEffect(() => {
    setState({ phase: 0, loop: 0 })
    phaseStart.current = { at: clock.now(), ms: phaseMs(story, 0) }
    if (!playing) return
    let cancel = () => {}
    let phase = 0
    let loop = 0
    const next = () => {
      cancel = clock.after(phaseMs(story, phase), () => {
        phase += 1
        if (phase >= story.phases.length) {
          phase = 0
          loop += 1
        }
        phaseStart.current = { at: clock.now(), ms: phaseMs(story, phase) }
        setState({ phase, loop })
        next()
      })
    }
    next()
    return () => cancel()
  }, [playing, story, clock])
  return { ...state, phaseStart }
}

function StoryPhone({ story, playing }: { story: Story; playing: boolean }) {
  const reduced = useReducedMotion()
  const live = playing && !reduced
  const { clock, speed, listeners } = useStoryTime()
  const { phase, loop, phaseStart } = useStoryClock(story, live, clock)
  const barRef = useRef<HTMLSpanElement>(null)
  const [fast, setFast] = useState(false)
  useEffect(() => {
    const listen = (now: number) => {
      if (!barRef.current) return
      const done = live ? Math.min(1, (now - phaseStart.current.at) / phaseStart.current.ms) : 1
      barRef.current.style.width = `${done * 100}%`
    }
    listeners.current.add(listen)
    return () => {
      listeners.current.delete(listen)
    }
  }, [live, listeners, phaseStart])
  const hold = (on: boolean) => {
    speed.current = on ? HOLD_SPEED : 1
    setFast(on)
  }
  const shown = reduced ? story.phases.length - 1 : phase
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / DESIGN_WIDTH))
    observer.observe(box)
    return () => observer.disconnect()
  }, [])
  return (
    <ClockContext.Provider value={clock}>
      <motion.div
        ref={boxRef}
        animate={{ scale: fast ? 0.96 : 1 }}
        transition={POP}
        className="relative size-full cursor-pointer touch-pan-y select-none [-webkit-touch-callout:none]"
        onPointerDown={() => hold(true)}
        onPointerUp={() => hold(false)}
        onPointerLeave={() => hold(false)}
        onPointerCancel={() => hold(false)}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
          }}
        >
          <div className="absolute inset-x-0 top-0 overflow-hidden rounded-[24px]" style={{ ...LOOKS[story.chrome].font, bottom: BAR_HEIGHT + 14 }}>
            <AnimatePresence>
              <Screen key={`${loop}-${story.phases[shown].screen}-${shownRunStart(story, shown)}`} story={story} phase={shown} />
            </AnimatePresence>
          </div>
          <div className="absolute inset-x-0 bottom-0 overflow-hidden bg-[#2A8CFF] px-4 text-white" style={{ height: BAR_HEIGHT }}>
            <div className="flex h-full items-center justify-between gap-3 text-[15px] font-bold">
              <motion.span key={shown} className="inline-block" style={{ transformOrigin: 'left center' }} initial={{ scale: 0.6, y: 10 }} animate={{ scale: 1, y: 0 }} transition={POP}>
                {story.phases[shown].caption}
              </motion.span>
              <span className="shrink-0 tabular-nums">
                {shown + 1}/{story.phases.length}
              </span>
            </div>
            <span ref={barRef} className="absolute bottom-0 left-0 h-[3px] bg-white" style={{ width: live ? '0%' : '100%' }} />
          </div>
          <AnimatePresence>
            {fast ? (
              <motion.span
                key="fast"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={POP}
                className="absolute right-3 top-3 z-50 flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[13px] font-bold text-white"
              >
                2× <FontAwesomeIcon icon={faForward} className="text-[11px]" />
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </ClockContext.Provider>
  )
}

function shownRunStart(story: Story, phase: number) {
  let first = phase
  while (first > 0 && story.phases[first - 1].screen === story.phases[phase].screen) first -= 1
  return first
}

const SLACK_SLIDES: Slide[] = [
  {
    lead: 'Answer a DM,',
    sticker: 'one line at a time.',
    body: 'log holds **Slack’s own live connection**, reads the chat when Priya writes, and sends your reply **in your voice, one message per line**.',
    story: {
      id: 'slackReply',
      chrome: 'slack',
      phases: [
        {
          caption: 'A message lands',
          screen: 'lock',
          title: 'Priya',
          items: [
            {
              id: 'n1',
              kind: 'notify',
              who: 'Priya',
              text: 'did the outreach sheet work for you?',
            },
          ],
        },
        {
          caption: 'Priya DMs you',
          screen: 'dm',
          title: 'Priya',
          items: [
            {
              id: 'p1',
              kind: 'msg',
              who: 'Priya',
              text: 'did the outreach sheet work for you?',
            },
            {
              id: 'p2',
              kind: 'msg',
              who: 'Priya',
              text: 'we got 9 calls booked off it this week',
            },
          ],
        },
        {
          caption: 'Replied in your voice',
          screen: 'dm',
          title: 'Priya',
          items: [
            {
              id: 'y1',
              kind: 'msg',
              who: 'You',
              you: true,
              text: 'that’s brilliant',
            },
            {
              id: 'y2',
              kind: 'msg',
              who: 'You',
              you: true,
              text: 'what changed from last week?',
            },
          ],
        },
      ],
    },
  },
  {
    lead: 'React to the',
    sticker: 'moment.',
    body: 'An emoji on her message, **the way a person answers a moment** without typing.',
    story: {
      id: 'slackReact',
      chrome: 'slack',
      phases: [
        {
          caption: 'She answers',
          screen: 'dm',
          title: 'Priya',
          items: [
            {
              id: 'y2',
              kind: 'msg',
              who: 'You',
              you: true,
              text: 'what changed from last week?',
            },
            {
              id: 'p3',
              kind: 'msg',
              who: 'Priya',
              text: 'we made the first line about their own post',
              react: { emoji: '🙌', phase: 1 },
            },
          ],
        },
        { caption: 'React to it', screen: 'dm', title: 'Priya', items: [] },
      ],
    },
  },
  {
    lead: 'A voice note,',
    sticker: 'in your voice.',
    body: 'Your words, said in **your own cloned voice** and sent as Slack’s own voice clip. **Only when you ask** for one.',
    story: {
      id: 'slackVoice',
      chrome: 'slack',
      phases: [
        {
          caption: 'Send her a voice note',
          screen: 'dm',
          title: 'Priya',
          items: [
            {
              id: 'p3',
              kind: 'msg',
              who: 'Priya',
              text: 'we made the first line about their own post',
            },
            { id: 'v1', kind: 'voice', seconds: 14 },
          ],
        },
        {
          caption: 'She listens',
          screen: 'dm',
          title: 'Priya',
          items: [
            {
              id: 'p4',
              kind: 'msg',
              who: 'Priya',
              text: 'haha love that, sending it to the team',
            },
          ],
        },
      ],
    },
  },
]

const INSTAGRAM_SLIDES: Slide[] = [
  {
    lead: 'A DM lands.',
    sticker: 'You answer it.',
    body: 'log holds **Instagram’s own realtime connection** and answers through Instagram’s own app calls, in your voice. **No browser opens**.',
    story: {
      id: 'igReply',
      chrome: 'instagram',
      phases: [
        {
          caption: 'A message lands',
          screen: 'lock',
          title: 'maya.makes',
          items: [
            {
              id: 'n1',
              kind: 'notify',
              who: 'maya.makes',
              text: 'finally launched the shop',
            },
          ],
        },
        {
          caption: 'maya.makes DMs you',
          screen: 'dm',
          title: 'maya.makes',
          items: [
            {
              id: 'm1',
              kind: 'msg',
              who: 'maya.makes',
              text: 'finally launched the shop',
            },
            {
              id: 'm2',
              kind: 'msg',
              who: 'maya.makes',
              text: 'took me 8 months lol',
            },
          ],
        },
        {
          caption: 'Answered in your voice',
          screen: 'dm',
          title: 'maya.makes',
          items: [
            { id: 'y1', kind: 'msg', who: 'You', you: true, text: 'massive' },
            {
              id: 'y2',
              kind: 'msg',
              who: 'You',
              you: true,
              text: 'what are you selling first?',
            },
          ],
        },
      ],
    },
  },
  {
    lead: 'A meme that',
    sticker: 'fits the moment.',
    body: 'log **finds a meme** for what she just said, **checks it like any other send**, and **sends it as a picture**.',
    story: {
      id: 'igMeme',
      chrome: 'instagram',
      phases: [
        {
          caption: 'She says it took 8 months',
          screen: 'dm',
          title: 'maya.makes',
          items: [
            {
              id: 'm2',
              kind: 'msg',
              who: 'maya.makes',
              text: 'took me 8 months lol',
            },
          ],
        },
        {
          caption: 'Send a meme that fits',
          screen: 'dm',
          title: 'maya.makes',
          items: [
            {
              id: 'meme',
              kind: 'meme',
              src: '/memes/beatTheAllegations.webp',
              you: true,
            },
            {
              id: 'm3',
              kind: 'msg',
              who: 'maya.makes',
              text: 'LMAOO literally',
            },
          ],
        },
      ],
    },
  },
  {
    lead: 'Heart it, or send',
    sticker: 'a voice note.',
    body: 'An emoji on her reply, or a voice note in your own cloned voice, sent as Instagram’s own voice clip. Only when you ask.',
    story: {
      id: 'igVoice',
      chrome: 'instagram',
      phases: [
        {
          caption: 'She tells you more',
          screen: 'dm',
          title: 'maya.makes',
          items: [
            {
              id: 'y2',
              kind: 'msg',
              who: 'You',
              you: true,
              text: 'what are you selling first?',
            },
            {
              id: 'm4',
              kind: 'msg',
              who: 'maya.makes',
              text: 'the candles!! 3 scents to start',
              react: { emoji: '❤️', phase: 1 },
            },
          ],
        },
        { caption: 'Heart it', screen: 'dm', title: 'maya.makes', items: [] },
        {
          caption: 'A voice note, when you ask',
          screen: 'dm',
          title: 'maya.makes',
          items: [{ id: 'v1', kind: 'voice', seconds: 11, you: true }],
        },
      ],
    },
  },
]

const DISCORD_SLIDES: Slide[] = [
  {
    lead: 'Read the whole chat,',
    sticker: 'then join in.',
    body: 'log **reads the channel back** over the last few hours, so your agent knows **who said what** before you say a word.',
    story: {
      id: 'discordRead',
      chrome: 'discord',
      phases: [
        {
          caption: 'A message lands',
          screen: 'lock',
          title: '# marketing',
          items: [
            {
              id: 'n1',
              kind: 'notify',
              who: 'mila in #marketing',
              text: 'anyone tried the new ads manager?',
            },
          ],
        },
        {
          caption: 'The chat lights up',
          screen: 'channel',
          title: '# marketing',
          items: [
            {
              id: 'd1',
              kind: 'msg',
              who: 'mila',
              text: 'anyone tried the new ads manager?',
            },
            {
              id: 'd2',
              kind: 'msg',
              who: 'deano',
              text: 'yeah, cut our cost per lead in half',
            },
          ],
        },
        {
          caption: 'You join in',
          screen: 'channel',
          title: '# marketing',
          items: [
            {
              id: 'y1',
              kind: 'msg',
              who: 'You',
              you: true,
              text: 'deano what did you change first?',
            },
          ],
        },
      ],
    },
  },
  {
    lead: 'Drop a meme,',
    sticker: 'shown inline.',
    body: 'log finds a meme for what was just said, checks it like any other send, and drops it in the chat, where **Discord shows it inline**.',
    story: {
      id: 'discordMeme',
      chrome: 'discord',
      phases: [
        {
          caption: 'Someone can’t believe it',
          screen: 'channel',
          title: '# marketing',
          items: [
            {
              id: 'd2',
              kind: 'msg',
              who: 'deano',
              text: 'yeah, cut our cost per lead in half',
            },
            {
              id: 'd3',
              kind: 'msg',
              who: 'mila',
              text: 'wait it actually worked??',
            },
          ],
        },
        {
          caption: 'Drop the meme',
          screen: 'channel',
          title: '# marketing',
          items: [
            {
              id: 'meme',
              kind: 'meme',
              src: '/memes/surprisedSnoop.webp',
              you: true,
            },
          ],
        },
      ],
    },
  },
  {
    lead: 'React, or send',
    sticker: 'a voice note.',
    body: 'An emoji on someone’s message, or a voice note to the group in your own cloned voice, sent as Discord’s own voice message. Only when you ask.',
    story: {
      id: 'discordVoice',
      chrome: 'discord',
      phases: [
        {
          caption: 'deano answers',
          screen: 'channel',
          title: '# marketing',
          items: [
            {
              id: 'd4',
              kind: 'msg',
              who: 'deano',
              text: 'haha I’ll share the setup later',
              react: { emoji: '🔥', phase: 1 },
            },
          ],
        },
        {
          caption: 'React to it',
          screen: 'channel',
          title: '# marketing',
          items: [],
        },
        {
          caption: 'A voice note to the group',
          screen: 'channel',
          title: '# marketing',
          items: [{ id: 'v1', kind: 'voice', seconds: 16, you: true }],
        },
      ],
    },
  },
]

const X_SLIDES: Slide[] = [
  {
    lead: 'Answer everyone',
    sticker: 'who commented.',
    body: 'The people who comment on your post are **your warmest on X**. Each one gets a reply about what they said, in your voice.',
    story: {
      id: 'xReplies',
      chrome: 'x',
      phases: [
        {
          caption: 'Someone comments',
          screen: 'post',
          title: 'Post',
          items: [
            {
              id: 'post',
              kind: 'post',
              who: 'You',
              handle: '@you',
              text: 'we booked 40 calls last month without a single ad. here is the whole setup',
            },
            {
              id: 'r1',
              kind: 'reply',
              who: 'Sarah',
              text: 'how much for a full site?',
            },
          ],
        },
        {
          caption: 'Reply to them',
          screen: 'post',
          title: 'Post',
          items: [
            {
              id: 'r2',
              kind: 'reply',
              who: 'You',
              you: true,
              text: 'depends on the pages, what is it for?',
            },
          ],
        },
      ],
    },
  },
  {
    lead: 'Their whole thread,',
    sticker: 'then your reply.',
    body: 'Before a word is written, log **reads their whole thread**, **the old DMs and X Chat as one**, and what they did on your posts.',
    story: {
      id: 'xDm',
      chrome: 'x',
      phases: [
        {
          caption: 'A message lands',
          screen: 'lock',
          title: 'Jay',
          items: [
            {
              id: 'n1',
              kind: 'notify',
              who: 'Jay',
              text: 'yeah let’s do thursday',
            },
          ],
        },
        {
          caption: 'Jay DMs you',
          screen: 'dm',
          title: 'Jay',
          items: [
            {
              id: 'j1',
              kind: 'msg',
              who: 'Jay',
              text: 'yeah let’s do thursday',
            },
          ],
        },
        {
          caption: 'Replied in your voice',
          screen: 'dm',
          title: 'Jay',
          items: [
            {
              id: 'y1',
              kind: 'msg',
              who: 'You',
              you: true,
              text: 'thursday works',
            },
            {
              id: 'y2',
              kind: 'msg',
              who: 'You',
              you: true,
              text: 'morning or afternoon?',
            },
          ],
        },
      ],
    },
  },
  {
    lead: 'React, or send',
    sticker: 'a voice note.',
    body: 'An emoji on their message, or a voice note in your own cloned voice, sent as an X Chat voice message. Only when you ask.',
    story: {
      id: 'xVoice',
      chrome: 'x',
      phases: [
        {
          caption: 'Jay answers',
          screen: 'dm',
          title: 'Jay',
          items: [
            {
              id: 'j2',
              kind: 'msg',
              who: 'Jay',
              text: 'morning, 10am?',
              react: { emoji: '👍', phase: 1 },
            },
          ],
        },
        { caption: 'React to it', screen: 'dm', title: 'Jay', items: [] },
        {
          caption: 'A voice note, when you ask',
          screen: 'dm',
          title: 'Jay',
          items: [{ id: 'v1', kind: 'voice', seconds: 9, you: true }],
        },
      ],
    },
  },
]

const REDDIT_POST: Item = {
  id: 'rp',
  kind: 'redditPost',
  sub: 'r/smallbusiness',
  title: 'Need a website that takes bookings. Where do I even start?',
  text: 'Cleaning business, 2 vans. Losing jobs because people can’t book online.',
}

const REDDIT_SLIDES: Slide[] = [
  {
    lead: 'Automate the research,',
    sticker: 'not the karma.',
    body: 'log reads the **subreddits** your buyers post in and finds the threads where they **describe their problem**. That’s the half of Reddit worth automating.',
    story: {
      id: 'redditFind',
      chrome: 'reddit',
      phases: [
        { caption: 'r/smallbusiness, this week', screen: 'post', title: 'r/smallbusiness', items: [REDDIT_POST] },
        {
          caption: 'Someone asking for what you sell',
          screen: 'post',
          title: 'r/smallbusiness',
          items: [{ id: 'c1', kind: 'reply', who: 'u/vanlife_dan', text: 'just use wix lol' }],
        },
      ],
    },
  },
  {
    lead: 'Answer with value,',
    sticker: 'never a link.',
    body: 'Every comment is read first, so the draft adds what nobody has said yet, **in your own voice**, with no link to your product. The engagement stays human: **you press send** from your real account.',
    story: {
      id: 'redditAnswer',
      chrome: 'reddit',
      phases: [
        { caption: 'What’s been said', screen: 'post', title: 'r/smallbusiness', items: [REDDIT_POST, { id: 'c1', kind: 'reply', who: 'u/vanlife_dan', text: 'just use wix lol' }] },
        {
          caption: 'Your answer, in your voice',
          screen: 'post',
          title: 'r/smallbusiness',
          items: [{ id: 'c2', kind: 'reply', who: 'You', you: true, text: 'wix will do it but the booking bit is where you lose people. put the calendar on the first screen and take a deposit so they don’t ghost' }],
        },
      ],
    },
  },
  {
    lead: 'Grow your own',
    sticker: 'subreddit.',
    body: 'Like a daily brief: your agent reads the subreddits your community cares about, drafts **the day’s signal** for your own subreddit, and helps you answer every comment on it.',
    story: {
      id: 'redditCommunity',
      chrome: 'reddit',
      phases: [
        {
          caption: 'Today’s signal, posted',
          screen: 'post',
          title: 'r/yourcommunity',
          items: [{ id: 'd1', kind: 'redditPost', sub: 'r/yourcommunity', title: 'What small business owners asked for this week', text: '3 wanted online booking, 2 lost jobs to slow replies, 1 asked who does it for them.' }],
        },
        {
          caption: 'Every comment answered',
          screen: 'post',
          title: 'r/yourcommunity',
          items: [
            { id: 'd2', kind: 'reply', who: 'u/plumbpro', text: 'the slow replies one is so real' },
            { id: 'd3', kind: 'reply', who: 'You', you: true, text: 'right, most of them were answering the next morning. the ones who replied in an hour got the job' },
          ],
        },
      ],
    },
  },
]

const REA_SLIDES: Slide[] = [
  {
    lead: 'Find what made him',
    sticker: 'go viral.',
    body: 'treg pulls **his 40 most viral clips** and the clip farms around him, and SubQ picks **the formats that win**. Nightclub, hot take, repeat.',
    story: {
      id: 'reaClips',
      chrome: 'x',
      phases: [
        {
          caption: 'His clip blows up',
          screen: 'post',
          title: 'Post',
          items: [
            { id: 'p1', kind: 'post', who: 'Clip farm', handle: '@bestclavicularclips', text: 'Clavicular revealed why you should NEVER DRINK 🥃😳 (578K views)', video: '/video/reaLooksmaxxing/clipFarm.webm' },
            { id: 'r1', kind: 'reply', who: 'gymcel_99', text: 'what is his skincare routine??' },
          ],
        },
        {
          caption: 'SubQ picks the formula',
          screen: 'post',
          title: 'Post',
          items: [{ id: 'r2', kind: 'reply', who: 'You', you: true, text: 'comedy skit 3.7M, mog edit 1.75M, morning routine 1.5M. noted.' }],
        },
      ],
    },
  },
  {
    lead: 'Post through every',
    sticker: 'account.',
    body: 'log **warms up every account** in its own browser and posts through each one’s **single session**, so the bot farm never looks like one.',
    story: {
      id: 'reaPost',
      chrome: 'x',
      phases: [
        {
          caption: 'Your clip goes out',
          screen: 'post',
          title: 'Post',
          items: [
            { id: 'p1', kind: 'post', who: 'You', handle: '@you', text: 'NEVER sleep on your back if you want a jawline. here is why', video: '/video/reaLooksmaxxing/yourClip.webm' },
            { id: 'r1', kind: 'reply', who: 'mogger_420', text: 'bro this is actually insane' },
          ],
        },
        {
          caption: 'The comments flood in',
          screen: 'post',
          title: 'Post',
          items: [
            { id: 'r2', kind: 'reply', who: 'lookscope_ana', text: 'is this ai' },
            { id: 'r3', kind: 'reply', who: 'You', you: true, text: 'the jawline is real. everything else is Claude Code' },
          ],
        },
      ],
    },
  },
  {
    lead: 'Funnel them into',
    sticker: 'your offer.',
    body: 'Every **“how do I look like that”** gets an answer in your voice, then a seat in **the Discord**. Like Clav, but with Claude Code in your DMs.',
    story: {
      id: 'reaFunnel',
      chrome: 'discord',
      phases: [
        {
          caption: 'A DM lands',
          screen: 'lock',
          title: 'mogger_420',
          items: [{ id: 'n1', kind: 'notify', who: 'mogger_420', text: 'how do i look like that' }],
        },
        {
          caption: 'Answered, then funnelled',
          screen: 'dm',
          title: 'mogger_420',
          items: [
            { id: 'd1', kind: 'msg', who: 'mogger_420', text: 'how do i look like that' },
            { id: 'd2', kind: 'msg', who: 'You', you: true, text: 'start with the morning routine, its all in the discord' },
            { id: 'd2b', kind: 'meme', src: '/images/reaLooksmaxxing/club.webp', you: true },
            { id: 'd3', kind: 'msg', who: 'mogger_420', text: 'joining rn', react: { emoji: '🔥', phase: 1 } },
          ],
        },
      ],
    },
  },
]

const SLIDES_BY_PLATFORM: Record<string, Slide[]> = {
  reaLooksmaxxing: REA_SLIDES,
  slack: SLACK_SLIDES,
  instagram: INSTAGRAM_SLIDES,
  discord: DISCORD_SLIDES,
  x: X_SLIDES,
  reddit: REDDIT_SLIDES,
}

function InViewStory({ story }: { story: Story }) {
  const ref = useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.4 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="size-full">
      <StoryPhone story={story} playing={playing} />
    </div>
  )
}

function SlideTitle({ slide, className }: { slide: Slide; className: string }): ReactNode {
  return (
    <h2 className={className}>
      {slide.lead} <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">{slide.sticker}</span>
    </h2>
  )
}

function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
        part.startsWith('**') ? (
          <span key={index} className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">
            {part.slice(2, -2)}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}

export function PlatformScroll({ platformId, ctaHref }: { platformId: string; ctaHref: string }) {
  const slides = SLIDES_BY_PLATFORM[platformId] ?? SLACK_SLIDES
  const trackRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const element = trackRef.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const total = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.min(1, Math.max(0, -rect.top / total))
      const entered = Math.min(1, Math.max(0, 1 - rect.top / window.innerHeight))
      element.style.setProperty('--uc-fill', (progress * slides.length).toFixed(4))
      element.style.setProperty('--uc-enter', entered.toFixed(4))
      setInView(rect.top < window.innerHeight && rect.bottom > 0)
      setActive(Math.min(slides.length - 1, Math.floor(progress * slides.length)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [slides.length])
  const share = 100 / slides.length
  return (
    <>
      <section
        ref={trackRef}
        aria-label="How it works"
        className="relative hidden overflow-x-clip bg-white md:block"
        style={
          {
            height: `calc(100vh + ${slides.length * 1000}px)`,
            '--uc-fill': 0,
            '--uc-enter': 0,
          } as CSSProperties
        }
      >
        <div className="sticky top-0 grid h-screen w-full grid-cols-2">
          <div className="flex h-screen w-full justify-center">
            <div className="relative mx-6 flex h-full w-full max-w-2xl justify-center text-center">
              <div className="absolute left-1/2 top-[8.5rem] flex -translate-x-1/2 items-center gap-2">
                {slides.map((slide, index) => (
                  <span key={slide.story.id} className="h-2 w-10 overflow-hidden rounded-full bg-[#0D2A4C]/15">
                    <span
                      className="block h-full rounded-full bg-[#2A8CFF] transition-[width] duration-100 ease-linear"
                      style={{
                        width: `calc(clamp(0, var(--uc-fill) - ${index}, 1) * 100%)`,
                      }}
                    />
                  </span>
                ))}
              </div>
              {slides.map((slide, index) => (
                <div
                  key={slide.story.id}
                  aria-hidden={index !== active}
                  className={`absolute inset-0 flex items-center justify-center ${index === active ? 'visible' : 'pointer-events-none invisible'}`}
                >
                  <motion.div key={index === active ? 'on' : 'off'} initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} transition={POP} className="w-full text-balance text-center">
                    <SlideTitle slide={slide} className="text-title mx-auto max-w-2xl text-[#0D2A4C]" />
                    <p className="text-lede mx-auto mt-6 max-w-xl font-semibold text-[#0D2A4C]/85">
                      <Marked text={slide.body} />
                    </p>
                  </motion.div>
                </div>
              ))}
              <div className="absolute inset-x-0 bottom-8 z-[1] flex flex-col items-center gap-3">
                <RepoLink href={ctaHref} className="button-glow flex w-full items-center justify-center gap-2 rounded-xl border border-white/35 px-8 py-4 text-xl font-bold uppercase text-white">
                  Set up log
                  <FontAwesomeIcon icon={faArrowRight} className="text-[16px]" />
                </RepoLink>
              </div>
            </div>
          </div>
          <div
            className="relative flex h-screen w-full items-center justify-center"
            style={{
              backgroundImage:
                'linear-gradient(to bottom, rgb(255 255 255) 0%, rgb(42 140 255 / calc(var(--uc-enter) * 0.07)) 30%, rgb(42 140 255 / calc(var(--uc-enter) * 0.07)) 70%, rgb(255 255 255) 100%)',
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgb(42 140 255 / calc(var(--uc-enter) * 0.5)) 2px, transparent 2px), linear-gradient(to bottom, rgb(42 140 255 / calc(var(--uc-enter) * 0.5)) 2px, transparent 2px)',
                backgroundSize: 'calc(100% / 3) calc(100% / 3)',
                maskImage:
                  'linear-gradient(to top, black calc(var(--uc-enter) * 100%), transparent min(100%, calc(var(--uc-enter) * 100% + 15%))), linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
                maskComposite: 'intersect',
              }}
            />
            <div className="relative z-[2] h-screen w-full overflow-hidden">
              <motion.div animate={{ y: `${-active * share}%` }} transition={{ duration: 0.55, ease: EASE }} className="flex w-full flex-col" style={{ height: `${slides.length * 100}%` }}>
                {slides.map((slide, index) => (
                  <div key={slide.story.id} className="flex w-full shrink-0 items-center justify-center pt-12" style={{ height: `${share}%` }}>
                    <div className="aspect-[9/16] h-[76vh]">
                      <StoryPhone story={slide.story} playing={inView && index === active} />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      <section aria-label="How it works" className="w-full bg-white px-6 py-16 md:hidden">
        <div className="mx-auto flex max-w-md flex-col gap-16">
          {slides.map((slide) => (
            <div key={slide.story.id} className="flex flex-col gap-6">
              <div>
                <SlideTitle slide={slide} className="text-title text-[#0D2A4C]" />
                <p className="text-lede mt-3 font-semibold text-[#0D2A4C]/85">
                  <Marked text={slide.body} />
                </p>
              </div>
              <div className="mx-auto aspect-[9/16] w-[78%]">
                <InViewStory story={slide.story} />
              </div>
            </div>
          ))}
          <RepoLink href={ctaHref} className="button-glow flex w-full items-center justify-center gap-2 rounded-full border border-white/35 px-8 py-4 text-sm font-bold uppercase text-white">
            Set up log
            <FontAwesomeIcon icon={faArrowRight} className="text-[12px]" />
          </RepoLink>
        </div>
      </section>
    </>
  )
}
