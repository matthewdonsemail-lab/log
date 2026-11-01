import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTime, useTransform, type MotionValue } from 'motion/react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcase, faCheck, faCircleNotch, faGift, faPlug, faRobot } from '@fortawesome/free-solid-svg-icons'
import { faFacebook, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { useDragCarousel } from './useDragCarousel'

const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'

function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).map((part, index): ReactNode => {
        if (part.startsWith('**')) return <span key={index} className={STICKER}>{part.slice(2, -2)}</span>
        if (part.startsWith('__'))
          return (
            <span key={index} className="font-black underline decoration-dashed underline-offset-4">
              {part.slice(2, -2)}
            </span>
          )
        return <span key={index}>{part}</span>
      })}
    </>
  )
}

function useTicker(length: number, running: boolean, ms = 1100) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => setStep((value) => (value + 1) % (length + 3)), ms)
    return () => window.clearTimeout(id)
  }, [step, running, length, ms])
  return Math.min(step, length)
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-[380px] w-full flex-col gap-2 text-left text-[#0D2A4C]">
      <span className="mb-2 inline-flex self-start rounded-md bg-white px-3 py-1.5 text-[13px] font-bold text-[#2A8CFF] shadow-[0_0_0_1px_#C9E3FF,0_3px_0_#B5D6FF]" style={{ transform: 'translateZ(30px)' }}>
        {title}
      </span>
      {children}
    </div>
  )
}

const ORBIT = [
  { name: 'Dana', label: '@dana_builds', color: '#1D9BF0', icon: faXTwitter, event: 'replied in your voice' },
  { name: 'Leo', label: '@leo_ops', color: '#7856FF', icon: faXTwitter, event: '18 openers queued' },
  { name: 'Bethlehem', label: 'Marketplace', color: '#0866FF', icon: faFacebook, event: 'listing posted in Bethlehem' },
  { name: 'X', label: 'X limit', color: '#0F1419', icon: faXTwitter, event: '344, waited 12m, carried on' },
  { name: 'Mira', label: '@mira_ugc', color: '#F91880', icon: faXTwitter, event: 'answered, reply drafted' },
]

const ORBIT_RX = 36
const ORBIT_RY = 33
const ORBIT_SECONDS = 40
const STEP_MS = 1900

function orbitPoint(time: number, index: number) {
  const angle = (index / ORBIT.length) * Math.PI * 2 - Math.PI / 2 + (time / 1000 / ORBIT_SECONDS) * Math.PI * 2
  return { x: 50 + ORBIT_RX * Math.cos(angle), y: 50 + ORBIT_RY * Math.sin(angle) }
}

function OrbitNode({ index, time, lit }: { index: number; time: MotionValue<number>; lit: boolean }) {
  const node = ORBIT[index]
  const left = useTransform(time, (t) => `${orbitPoint(t, index).x}%`)
  const top = useTransform(time, (t) => `${orbitPoint(t, index).y}%`)
  return (
    <motion.div className="absolute z-10" style={{ left, top }}>
      <div className="flex flex-col items-center gap-1" style={{ transform: 'translate(-50%, -50%) translateZ(40px)' }}>
        <span
          className="relative grid size-11 place-items-center rounded-full text-sm font-black text-white transition-transform duration-300"
          style={{ background: node.color, transform: lit ? 'scale(1.18)' : 'scale(1)', boxShadow: lit ? '0 0 0 4px rgba(42,140,255,0.35)' : '0 0 0 3px #fff' }}
        >
          {node.name[0]}
          <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-white text-[10px]" style={{ color: node.color }}>
            <FontAwesomeIcon icon={node.icon} />
          </span>
        </span>
        <span className="whitespace-nowrap rounded bg-white/90 px-1 text-[11px] font-bold text-[#0D2A4C]/70">{node.label}</span>
      </div>
    </motion.div>
  )
}

function OrbitLine({ index, time, lit }: { index: number; time: MotionValue<number> ; lit: boolean }) {
  const x2 = useTransform(time, (t) => orbitPoint(t, index).x * 4)
  const y2 = useTransform(time, (t) => orbitPoint(t, index).y * 3.4)
  return <motion.line x1={200} y1={170} x2={x2} y2={y2} stroke={lit ? '#2A8CFF' : '#C9E3FF'} strokeWidth={lit ? 2.5 : 1.5} strokeDasharray={lit ? '0' : '4 5'} />
}

function OrbitDot({ index, time, progress }: { index: number; time: MotionValue<number>; progress: MotionValue<number> }) {
  const cx = useTransform([time, progress] as MotionValue<number>[], ([t, p]: number[]) => 200 + (orbitPoint(t, index).x * 4 - 200) * p)
  const cy = useTransform([time, progress] as MotionValue<number>[], ([t, p]: number[]) => 170 + (orbitPoint(t, index).y * 3.4 - 170) * p)
  return <motion.circle cx={cx} cy={cy} r={5} fill="#2A8CFF" />
}

function OrbitCard({ index, time }: { index: number; time: MotionValue<number> }) {
  const node = ORBIT[index]
  const left = useTransform(time, (t) => `${Math.min(74, Math.max(26, orbitPoint(t, index).x))}%`)
  const top = useTransform(time, (t) => `${orbitPoint(t, index).y}%`)
  return (
    <motion.div className="pointer-events-none absolute z-20" style={{ left, top, translateZ: 90 }}>
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.9 }}
        animate={{ opacity: 1, y: -54, scale: 1 }}
        exit={{ opacity: 0, y: -70, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="-translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-[#0D2A4C] shadow-[0_0_0_6px_rgba(42,140,255,0.22),0_18px_30px_-16px_rgba(13,42,76,0.35)]"
      >
        <FontAwesomeIcon icon={faCheck} className="mr-1.5 text-[#2A8CFF]" />
        {node.event}
      </motion.div>
    </motion.div>
  )
}

function WhileOnACall({ running }: { running: boolean }) {
  const time = useTime()
  const progress = useMotionValue(0)
  const [active, setActive] = useState(0)
  const [arrived, setArrived] = useState(false)
  useEffect(() => {
    if (!running) return
    setArrived(false)
    progress.set(0)
    const travel = animate(progress, 1, { duration: 0.6, ease: 'easeInOut', onComplete: () => setArrived(true) })
    const next = window.setTimeout(() => setActive((value) => (value + 1) % ORBIT.length), STEP_MS)
    return () => {
      travel.stop()
      window.clearTimeout(next)
    }
  }, [active, running, progress])
  return (
    <Panel title="while you were on a call">
      <div className="relative -mx-2 aspect-[400/340] w-[calc(100%+1rem)]">
        <svg viewBox="0 0 400 340" className="absolute inset-0 size-full" aria-hidden>
          {ORBIT.map((_, index) => (
            <OrbitLine key={index} index={index} time={time} lit={index === active} />
          ))}
          <OrbitDot index={active} time={time} progress={progress} />
        </svg>
        <div className="absolute left-1/2 top-1/2 z-10" style={{ transform: 'translate(-50%, -50%) translateZ(60px)' }}>
          <span className="absolute inset-0 animate-ping rounded-2xl bg-[#2A8CFF]/30" />
          <span className="relative grid size-16 place-items-center rounded-2xl bg-white shadow-[0_0_0_6px_rgba(42,140,255,0.22),0_24px_40px_-18px_rgba(13,42,76,0.45)]">
            <img src="/logo.svg" alt="log" className="size-11 rounded-xl" />
          </span>
        </div>
        {ORBIT.map((_, index) => (
          <OrbitNode key={index} index={index} time={time} lit={index === active && arrived} />
        ))}
        <AnimatePresence>{arrived ? <OrbitCard key={active} index={active} time={time} /> : null}</AnimatePresence>
      </div>
    </Panel>
  )
}

const SHIFT = ['read every inbox', 'reply in your voice', 'follow up with who opened', 'post the listings', 'read the local groups', 'report what each platform answered']

function AgentShift({ running }: { running: boolean }) {
  const done = useTicker(SHIFT.length, running, 900)
  return (
    <Panel title="your agent’s shift">
      {SHIFT.map((task, index) => {
        const state = index < done ? 'done' : index === done ? 'doing' : 'todo'
        return (
          <div
            key={task}
            className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-[0_0_0_4px_rgba(42,140,255,0.18)] transition-transform duration-500"
            style={{ transform: `translateZ(${state === 'doing' ? 50 : state === 'done' ? 20 : 0}px)` }}
          >
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-md text-xs text-white transition-colors ${
                state === 'done' ? 'bg-[#2A8CFF]' : state === 'doing' ? 'bg-[#2A8CFF]/60' : 'bg-[#0D2A4C]/10'
              }`}
            >
              {state === 'done' ? <FontAwesomeIcon icon={faCheck} /> : state === 'doing' ? <FontAwesomeIcon icon={faCircleNotch} spin /> : null}
            </span>
            <span className={`text-[15px] font-semibold ${state === 'todo' ? 'text-[#0D2A4C]/40' : ''} ${state === 'done' ? 'line-through decoration-[#2A8CFF]/50' : ''}`}>
              {task}
            </span>
          </div>
        )
      })}
    </Panel>
  )
}

const TOOLS = ['twitterDms', 'voice', 'twitterDmLive', 'twitterQueueRunLive', 'publish', 'readGroup', 'readMembers', 'discordWatch', 'discordSendLive', 'search', 'kbSearch', 'check', 'warmup', 'getGuide']

function JustMcp({ running }: { running: boolean }) {
  const shown = useTicker(TOOLS.length, running, 380)
  return (
    <Panel title="the whole setup">
      <code className="block rounded-xl bg-[#0D2A4C] px-4 py-3 font-mono text-sm text-white">
        <span className="text-[#5CA7FF]">$ </span>claude mcp add log -- logMcp
      </code>
      <div className="mt-2 text-sm font-semibold text-[#0D2A4C]/60">and your agent gets every log command as a tool:</div>
      <div className="flex flex-wrap gap-1.5">
        {TOOLS.slice(0, shown).map((tool) => (
          <motion.span
            key={tool}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-md bg-[#F3F8FF] px-2 py-1 font-mono text-xs font-bold text-[#2A8CFF] shadow-[0_0_0_1px_#C9E3FF]"
          >
            {tool}
          </motion.span>
        ))}
        {shown >= TOOLS.length ? <span className="px-1 py-1 text-xs font-bold text-[#0D2A4C]/60">+ 140 more</span> : null}
      </div>
    </Panel>
  )
}

const DECODED = [
  { platform: 'Facebook', call: 'GroupsCometMembersPageNewMembersSectionRefetchQuery' },
  { platform: 'Facebook', call: 'useAccountStatusClearEnrollmentEntryPointActionMutation' },
  { platform: 'X', call: 'GetInitialXChatPageQuery' },
  { platform: 'X', call: 'GetInboxPageRequestQuery' },
  { platform: 'Reddit', call: '39 calls, 33 read from their own code' },
]

function Decoded({ running }: { running: boolean }) {
  const shown = useTicker(DECODED.length, running)
  return (
    <Panel title="what we reverse engineered">
      {DECODED.slice(0, shown).map((row) => (
        <motion.div key={row.call} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-[0_0_0_4px_rgba(42,140,255,0.18)]" style={{ transform: 'translateZ(25px)' }}>
          <FontAwesomeIcon icon={faCheck} className="text-xs text-[#2A8CFF]" />
          <span className="w-20 shrink-0 text-xs font-black uppercase text-[#0D2A4C]/50">{row.platform}</span>
          <span className="min-w-0 truncate font-mono text-xs font-semibold">{row.call}</span>
        </motion.div>
      ))}
      {shown >= DECODED.length ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-md bg-[#2A8CFF] px-2.5 py-1 text-xs font-bold text-white">235 Facebook calls documented</span>
          <span className="rounded-md bg-[#0D2A4C] px-2.5 py-1 text-xs font-bold text-white">MIT, free forever</span>
        </motion.div>
      ) : null}
    </Panel>
  )
}

const BELIEFS: { icon: IconDefinition; title: string; body: string; Example: (props: { running: boolean }) => ReactNode }[] = [
  {
    icon: faBriefcase,
    title: 'Made for people **too busy** to do it',
    body: 'You’re busy doing the things that __push the business forward__, and you still worry you’re __not reaching enough people__. log keeps going while you’re on the call.',
    Example: WhileOnACall,
  },
  {
    icon: faRobot,
    title: 'Social media is a **full-time job**',
    body: 'Running social media as a marketing channel is a __full-time role__. So we made it a job you can __hand to your AI__, start to finish.',
    Example: AgentShift,
  },
  {
    icon: faPlug,
    title: 'No dashboards. **Just MCP.**',
    body: 'We stripped out the dashboards and everything else. Interfaces __won’t matter__. What matters is an __MCP__ that connects your work to your agent without any fuss.',
    Example: JustMcp,
  },
  {
    icon: faGift,
    title: 'Our **gift** to the world',
    body: 'We fought hard, with __AI__ and by __reverse engineering__ every platform, to get this working. It’s free and open source: a look at how working on social media __will look__.',
    Example: Decoded,
  },
]

function BeliefCard({ belief, running, active, go }: { belief: (typeof BELIEFS)[number]; running: boolean; active: number; go: (index: number) => void }) {
  const Example = belief.Example
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
        <div className="relative grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
          <div className="flex flex-col items-start gap-4 text-white">
            <span className="grid size-11 place-items-center rounded-xl bg-white text-[#2A8CFF] shadow-[0_0_0_1px_#C9E3FF,0_3px_0_#B5D6FF]">
              <FontAwesomeIcon icon={belief.icon} className="text-lg" />
            </span>
            <h3 className="m-0 text-3xl font-black leading-tight tracking-[-0.02em] md:text-4xl">
              <Marked text={belief.title} />
            </h3>
            <p className="m-0 text-xl leading-snug md:text-2xl" style={{ fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }}>
              <Marked text={belief.body} />
            </p>
            <div className="mt-1 flex items-center gap-2" role="group" aria-label="Choose a belief">
              {BELIEFS.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={item.title.replace(/\*/g, '')}
                  aria-current={index === active}
                  onClick={() => go(index)}
                  className={`h-2.5 rounded-full transition-[width,background-color] duration-300 ${index === active ? 'w-10 bg-white' : 'w-2.5 bg-white/60 hover:bg-white/80'}`}
                />
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-md [perspective:1400px]">
            <motion.div
              key={running ? 'on' : 'off'}
              className="demo-3d no-frame"
              animate={{ rotateY: [-16, -8, -16], rotateX: [8, 3, 8] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Example running={running} />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HowWeThink() {
  const { active, go, viewportProps, trackProps } = useDragCarousel(BELIEFS.length)
  return (
    <section id="how-we-think" className="w-full overflow-x-clip bg-white px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto flex w-full max-w-[86rem] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4 text-center md:gap-5">
          <h2 className="text-title max-w-4xl text-[#0D2A4C]">
            Social media is a full-time job.
            <br className="hidden sm:block" /> <span className={STICKER}>Give it to your AI.</span>
          </h2>
          <p className="text-lede mx-auto max-w-2xl font-semibold text-[#0D2A4C]/85">
            Here’s how we think about it, and why log looks the way it does:{' '}
            <span className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">no dashboards</span>,{' '}
            <span className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">no SaaS</span>, just your accounts and{' '}
            <span className={STICKER}>your agent.</span>
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2" role="tablist" aria-label="How we think">
          {BELIEFS.map((belief, index) => (
            <button
              key={belief.title}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => go(index)}
              className={
                index === active
                  ? 'button-glow inline-flex items-center gap-2 rounded-xl border border-white/35 px-4 py-2 text-[15px] font-bold text-white'
                  : 'inline-flex items-center gap-2 rounded-xl bg-[#F3F6FA] px-4 py-2 text-[15px] font-medium text-[#0D2A4C]/70 transition-colors hover:bg-[#E7EDF5] hover:text-[#0D2A4C]'
              }
            >
              <FontAwesomeIcon icon={belief.icon} className="text-[15px]" />
              {belief.title.replace(/\*/g, '')}
            </button>
          ))}
        </div>
        <div {...viewportProps} className={`${viewportProps.className} max-w-5xl`}>
          <div {...trackProps}>
            {BELIEFS.map((belief, index) => (
              <div
                key={belief.title}
                aria-hidden={index !== active}
                className={`w-full shrink-0 transition-opacity duration-500 ${index === active ? 'opacity-100' : 'opacity-35'}`}
              >
                <BeliefCard belief={belief} running={index === active} active={active} go={go} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
