import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons'
import { BrandMark, type BrandMarkId } from '../BrandMark'

export type HowStep = { icon: IconDefinition; label: string; tool: string }
export type HowRow = { who: string; what: string; status: string }

const POP = { type: 'spring' as const, stiffness: 520, damping: 15 }
const TICK_MS = 100
const CHAR_MS = 22
const LINE_MS = 170
const STEP_MS = 480
const ROW_MS = 260
const HOLD_MS = 4200
const SCROLL_MS_PER_PX = 14
const AGENTS: { id: BrandMarkId; name: string; tone: string }[] = [
  { id: 'claude', name: 'Claude Code', tone: 'text-[#c96442]' },
  { id: 'chatgpt', name: 'Codex', tone: 'text-[#0D2A4C]' },
]

type Timeline = { typed: number; onIt: number; code: number; flow: number; results: number; logo: number; end: number }

const slugOf = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map((word, index) => (index ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join('')

function codeLines(title: string, steps: HowStep[]) {
  return [
    `export default definePlay('${slugOf(title)}', async (log) => {`,
    ...steps.flatMap((step) => [`  // ${step.label}`, `  await log.${step.tool}()`]),
    '})',
  ]
}

function timelineOf(ask: string, lines: number, steps: number, rows: number): Timeline {
  const typed = Math.min(2400, ask.length * CHAR_MS) + 300
  const onIt = typed + 500
  const code = onIt + 600
  const flow = code + lines * LINE_MS + 700
  const results = flow + steps * STEP_MS + 500
  const logo = results + rows * ROW_MS + 500
  const end = logo + HOLD_MS
  return { typed, onIt, code, flow, results, logo, end }
}

function useClock(running: boolean, end: number, floor: { current: number }) {
  const [state, setState] = useState({ now: 0, round: 0 })
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setState((current) => {
        const next = Math.max(current.now + TICK_MS, floor.current)
        if (next < end) return { now: next, round: current.round }
        if (floor.current > 0) return { now: end - TICK_MS, round: current.round }
        return { now: 0, round: current.round + 1 }
      })
    }, TICK_MS)
    let last = window.scrollY
    const onScroll = () => {
      const delta = window.scrollY - last
      last = window.scrollY
      if (delta <= 0) return
      setState((current) => ({ now: Math.min(end - TICK_MS, current.now + delta * SCROLL_MS_PER_PX), round: current.round }))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [running, end])
  return state
}

const BLUR = { duration: 0.45, ease: 'easeOut' as const }

function Blurred({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <motion.div initial={{ filter: 'blur(8px)' }} animate={{ filter: on ? 'blur(0px)' : 'blur(8px)' }} transition={BLUR} className="absolute inset-0">
      {children}
    </motion.div>
  )
}

function AgentDemo({ ask, done, now, round, timeline }: { ask: string; done: string; now: number; round: number; timeline: Timeline }) {
  const agent = AGENTS[round % AGENTS.length]
  const typed = Math.min(ask.length, Math.floor(now / CHAR_MS))
  const bubbles = [
    now >= timeline.onIt ? 'On it. Running the play with log.' : null,
    now >= timeline.results ? done : null,
  ].filter((line): line is string => Boolean(line))
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-[0_4px_0_#1A5FC8,0_12px_24px_-10px_rgba(13,42,76,0.4)]">
      <div className="flex items-center gap-2 border-b border-[#0D2A4C]/8 px-3 py-2 text-[13px] font-bold text-[#0D2A4C]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={agent.name} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={POP} className="flex items-center gap-2">
            <BrandMark id={agent.id} className={`size-4 ${agent.tone}`} />
            {agent.name}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-2 overflow-hidden p-3">
        <p className="m-0 max-w-[92%] self-end rounded-xl bg-[#2A8CFF] px-3 py-2 text-[12px] leading-snug text-white">
          <code className="mr-1 rounded bg-white/20 px-1 font-mono text-[10.5px] font-bold">/log</code>
          {ask.slice(0, typed)}
          {typed < ask.length ? (
            <motion.span className="ml-px inline-block h-3 w-[2px] translate-y-[2px] bg-white" animate={{ scaleY: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />
          ) : null}
        </p>
        {bubbles.map((line) => (
          <motion.p
            key={line}
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={POP}
            style={{ transformOrigin: 'left bottom' }}
            className="m-0 max-w-[92%] self-start rounded-xl bg-[#F3F6FA] px-3 py-2 text-[12px] leading-snug text-[#0D2A4C]"
          >
            {line}
          </motion.p>
        ))}
      </div>
    </div>
  )
}

function CodeView({ lines, shown }: { lines: string[]; shown: number }) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-[#0D1117] text-left font-mono text-[10.5px] shadow-[0_4px_0_#1A5FC8,0_12px_24px_-10px_rgba(13,42,76,0.4)]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex gap-1">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="size-2 rounded-full bg-white/25" />
          ))}
        </span>
        <span className="rounded-t bg-white/10 px-2 py-0.5 text-[10.5px] text-white/80">play.ts</span>
      </div>
      <div className="flex flex-1 flex-col justify-end overflow-hidden px-3 py-2">
        {lines.slice(0, shown).map((line, index) => {
          const comment = line.trim().startsWith('//')
          return (
            <motion.p key={index} initial={{ x: -10 }} animate={{ x: 0 }} transition={POP} className="m-0 whitespace-pre leading-[1.55]">
              <span className="mr-2.5 inline-block w-4 text-right text-white/25">{index + 1}</span>
              {comment ? (
                <span className="text-[#8B949E]">{line}</span>
              ) : line.includes('await log.') ? (
                <>
                  <span className="text-[#FF7B72]">{'  await'}</span> <span className="text-[#79C0FF]">log</span>
                  <span className="text-white/70">.</span>
                  <span className="text-[#D2A8FF]">{line.split('log.')[1].replace('()', '')}</span>
                  <span className="text-white/70">()</span>
                </>
              ) : (
                <span className="text-[#E6EDF3]">{line}</span>
              )}
            </motion.p>
          )
        })}
      </div>
    </div>
  )
}

function FlowView({ steps, done }: { steps: HowStep[]; done: number }) {
  return (
    <div className="flex size-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-[0_4px_0_#1A5FC8,0_12px_24px_-10px_rgba(13,42,76,0.4)]">
      <div className="flex items-center gap-2 border-b border-[#0D2A4C]/8 px-3 py-2 text-[13px] font-bold text-[#0D2A4C]">
        <span className="size-2 rounded-full bg-[#1E8E4F]" />
        Running the play
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1.5 overflow-hidden px-3">
        {steps.map((step, index) => {
          const isDone = index < done
          return (
            <div key={`${step.tool}${index}`} className="flex h-7 items-center gap-2 rounded-lg bg-[#F3F6FA] px-2.5">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-[#EAF3FF] text-[10px] text-[#2A8CFF]">
                <FontAwesomeIcon icon={step.icon} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[11.5px] font-bold text-[#0D2A4C]">{step.label}</span>
              <span className="grid w-12 justify-items-end">
                {isDone ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={POP} className="flex items-center gap-1 text-[10px] font-bold text-[#1E8E4F]">
                    <FontAwesomeIcon icon={faCheck} />
                    Done
                  </motion.span>
                ) : (
                  <span className="text-[10px] font-bold text-[#0D2A4C]/40">Next</span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PlayDemo({ title, steps, now, timeline }: { title: string; steps: HowStep[]; now: number; timeline: Timeline }) {
  const lines = codeLines(title, steps)
  const flowing = now >= timeline.flow
  const shown = now < timeline.code ? 0 : Math.min(lines.length, Math.floor((now - timeline.code) / LINE_MS) + 1)
  const done = flowing ? Math.min(steps.length, Math.floor((now - timeline.flow) / STEP_MS)) : 0
  return (
    <div className="relative size-full">
      {flowing ? (
        <Blurred key="flow" on>
          <FlowView steps={steps} done={done} />
        </Blurred>
      ) : (
        <Blurred key="code" on={now >= timeline.code}>
          <CodeView lines={lines} shown={shown} />
        </Blurred>
      )}
    </div>
  )
}

function ResultsDemo({ rows, now, timeline, platformLabel, platformIcon }: { rows: HowRow[]; now: number; timeline: Timeline; platformLabel: string; platformIcon: IconDefinition }) {
  const shown = now < timeline.results ? 0 : Math.min(rows.length, Math.floor((now - timeline.results) / ROW_MS) + 1)
  const landed = now >= timeline.logo
  return (
    <div className="relative size-full">
      <Blurred on={now >= timeline.results}>
        <div className="flex size-full flex-col overflow-hidden rounded-xl bg-white text-left shadow-[0_4px_0_#1A5FC8,0_12px_24px_-10px_rgba(13,42,76,0.4)]">
          <div className="grid grid-cols-[1.2fr_1.3fr_0.8fr] gap-2 border-b border-[#0D2A4C]/8 px-3 py-2 text-[10.5px] font-bold text-[#0D2A4C]/55">
            <span>Who</span>
            <span>What log did</span>
            <span>Status</span>
          </div>
          <div className="flex-1">
            {rows.map((row, index) => (
              <div key={row.who} className="grid h-9 grid-cols-[1.2fr_1.3fr_0.8fr] items-center gap-2 border-b border-[#0D2A4C]/5 px-3 text-[11px] text-[#0D2A4C]">
                {index < shown ? (
                  <>
                    <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={POP} style={{ transformOrigin: 'left center' }} className="truncate font-bold">
                      {row.who}
                    </motion.span>
                    <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={POP} style={{ transformOrigin: 'left center' }} className="truncate text-[#0D2A4C]/70">
                      {row.what}
                    </motion.span>
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={POP} className="w-fit rounded bg-[#E8F7EE] px-1.5 py-0.5 text-[10px] font-bold text-[#1E8E4F]">
                      {row.status}
                    </motion.span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-16 rounded bg-[#0D2A4C]/8" />
                    <span className="h-2 w-20 rounded bg-[#0D2A4C]/8" />
                    <span className="h-2 w-8 rounded bg-[#0D2A4C]/8" />
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex h-14 items-center justify-center gap-2 border-t border-[#0D2A4C]/8 bg-[#F7F9FC] text-[12px] font-bold text-[#0D2A4C]">
            {landed ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={POP} className="flex items-center gap-2">
                <span title={platformLabel} className="grid size-8 place-items-center rounded-lg bg-[#2A8CFF] text-[16px] text-white shadow-[0_3px_0_#1A5FC8]">
                  <FontAwesomeIcon icon={platformIcon} />
                </span>
                Landed on {platformLabel}
              </motion.span>
            ) : null}
          </div>
        </div>
      </Blurred>
    </div>
  )
}

export function HowItWorks({
  ask,
  done,
  title,
  steps,
  platformLabel,
  platformIcon,
  rows,
  onWhite = false,
}: {
  ask: string
  done: string
  title: string
  steps: HowStep[]
  platformLabel: string
  platformIcon: IconDefinition
  rows: HowRow[]
  onWhite?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.3 })
  const flowSteps = steps.slice(0, 5)
  const timeline = timelineOf(ask, codeLines(title, flowSteps).length, flowSteps.length, rows.length)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const floor = useRef(0)
  const starts = [0, timeline.code, timeline.results]
  const startsKey = starts.join('|')
  useEffect(() => {
    const seen = new Set<number>()
    const stacked = () => !window.matchMedia('(min-width: 768px)').matches
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = cardRefs.current.indexOf(entry.target as HTMLDivElement)
          if (entry.isIntersecting) seen.add(index)
          else seen.delete(index)
        }
        floor.current = stacked() && seen.size ? starts[Math.max(...seen)] : 0
      },
      { threshold: 0.5 },
    )
    cardRefs.current.forEach((card) => card && observer.observe(card))
    return () => observer.disconnect()
  }, [startsKey])
  const { now, round } = useClock(inView, timeline.end, floor)
  const cards: { title: string; body: string; demo: ReactNode }[] = [
    { title: 'Ask your agent', body: `The play: ${title}.`, demo: <AgentDemo ask={ask} done={done} now={now} round={round} timeline={timeline} /> },
    { title: 'log writes and runs the play', body: `${steps.length} steps, each one checked before the next.`, demo: <PlayDemo title={title} steps={flowSteps} now={now} timeline={timeline} /> },
    {
      title: `It lands on ${platformLabel}`,
      body: 'Every message sent from your own account, in your own voice.',
      demo: <ResultsDemo rows={rows} now={now} timeline={timeline} platformLabel={platformLabel} platformIcon={platformIcon} />,
    },
  ]
  return (
    <div ref={ref} className="mx-auto mt-24 flex w-full max-w-6xl flex-col items-center text-left">
      <h2 className="text-title text-center text-[#0D2A4C]">
        <span className={onWhite ? 'text-[#0D2A4C]' : 'text-white'}>Ask your agent once.</span>
        <br />
        <span className="sticker-word inline-block px-[0.08em] text-[1.18em] leading-none">log runs the whole play.</span>
      </h2>
      <div className="mt-12 grid w-full grid-cols-1 items-stretch gap-y-10 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-x-10">
        {cards.map((card, index) => (
          <div key={card.title} className="contents">
            <div
              ref={(element) => {
                cardRefs.current[index] = element
              }}
              className="flex h-full flex-col gap-6 rounded-3xl px-6 pb-7 pt-8 text-white shadow-[0_6px_0_#1A5FC8]"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, #4FA6FF 0%, #2A8CFF 55%, #1F78F0 100%)' }}
            >
              <div key={`${index}-${round}`} className="relative z-10 -mx-2 flex h-[17rem] items-center justify-center md:-mx-14">
                {card.demo}
              </div>
              <div className="flex min-h-[8.5rem] flex-col gap-1">
                <p className="text-5xl font-black leading-none tracking-[-0.045em]">Step {index + 1}</p>
                <p className="mt-1 text-xl font-bold tracking-[-0.01em]">{card.title}</p>
                <p className="text-[15px] text-white/80">{card.body}</p>
              </div>
            </div>
            {index < cards.length - 1 ? (
              <div aria-hidden className="relative z-20 hidden items-center md:flex">
                <span className="grid size-9 place-items-center rounded-full bg-[#0D2A4C] text-white">
                  <FontAwesomeIcon icon={faArrowRight} className="text-[13px]" />
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
