import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faXmark } from '@fortawesome/free-solid-svg-icons'
import { MCP_PATH, MCP_PLAY } from './mcpContent'
import './McpPromo.css'

const CLOSED_KEY = 'logMcpPromoClosed'
const STEP_MS = 3400
const CARD_STYLE: CSSProperties = { background: 'radial-gradient(ellipse at 50% 0%, #4FA6FF 0%, #2A8CFF 55%, #1F78F0 100%)' }

function readClosed() {
  try {
    return window.localStorage.getItem(CLOSED_KEY) === '1'
  } catch {
    return false
  }
}

function saveClosed() {
  try {
    window.localStorage.setItem(CLOSED_KEY, '1')
  } catch {
    return
  }
}

function AskDemo() {
  return (
    <div className="w-full rounded-2xl bg-white px-4 py-3 text-left text-[#0D2A4C] shadow-[0_4px_0_rgba(13,42,76,0.18)]">
      <span className="font-mono text-[11px] font-bold text-[#2A8CFF]">/log</span>
      <p className="mt-0.5 text-[15px] font-bold leading-snug">{MCP_PLAY.ask}</p>
    </div>
  )
}

function CallsDemo() {
  return (
    <div className="flex w-full flex-wrap justify-center gap-1.5">
      {MCP_PLAY.calls.map((call, index) => (
        <motion.span
          key={call}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.18 }}
          className="rounded-full bg-white px-2.5 py-1 font-mono text-[12px] font-bold text-[#2A8CFF] shadow-[0_3px_0_rgba(13,42,76,0.18)]"
        >
          {call}
        </motion.span>
      ))}
    </div>
  )
}

function OutcomeDemo() {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {MCP_PLAY.how.rows.map((row, index) => (
        <motion.div
          key={row.who}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.18 }}
          className="flex items-center justify-between rounded-xl bg-white px-3 py-1.5 text-[13px] font-bold text-[#0D2A4C] shadow-[0_3px_0_rgba(13,42,76,0.18)]"
        >
          {row.who}
          <span className="rounded-full bg-[#EAF3FF] px-2 py-0.5 text-[11px] text-[#2A8CFF]">{row.status}</span>
        </motion.div>
      ))}
    </div>
  )
}

const STEPS: { demo: ReactNode; title: string; body: string }[] = [
  { demo: <AskDemo />, title: 'Ask your agent', body: 'Say it the way you’d say it, in Claude Code, Codex or Cursor.' },
  { demo: <CallsDemo />, title: 'log runs the play', body: 'Every log command is a tool, each step checked before the next.' },
  { demo: <OutcomeDemo />, title: 'It lands on your accounts', body: 'Sent from your own accounts, in your voice, once you say so.' },
]

function useStepCycle(paused: boolean) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (paused) return
    const id = window.setTimeout(() => setStep((value) => (value + 1) % STEPS.length), STEP_MS)
    return () => window.clearTimeout(id)
  }, [step, paused])
  return [step, setStep] as const
}

export function McpPromo() {
  const { pathname } = useLocation()
  const [closed, setClosed] = useState(readClosed)
  const [hovered, setHovered] = useState(false)
  const [step, setStep] = useStepCycle(hovered)
  const close = () => {
    saveClosed()
    setClosed(true)
  }
  const shown = !['/sign-in', '/verify', '/login'].includes(pathname) && !closed && pathname !== MCP_PATH && !pathname.startsWith('/shareCard')
  const current = STEPS[step]
  return (
    <AnimatePresence>
      {shown ? (
        <motion.aside
          key="mcpPromo"
          aria-label="New: the log MCP"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30, delay: 0.6 }}
          className="fixed bottom-4 left-4 z-[80] max-w-[calc(100vw-2rem)] sm:bottom-6 sm:left-6"
          style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif", color: 'var(--mcp-promo-ink)' }}
        >
          <div
            className="flex items-center gap-1 rounded-full py-1 pl-1 pr-1 shadow-[0_4px_0_#1A5FC8,0_12px_24px_-12px_rgba(13,42,76,0.45)] ring-1 sm:hidden"
            style={{ background: 'var(--mcp-promo-card)', '--tw-ring-color': 'var(--mcp-promo-ring)' } as CSSProperties}
          >
            <a href={MCP_PATH} className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-[13px] font-bold">
              <img src="/logo.svg" alt="" className="size-7 rounded-lg" />
              <span className="rounded-full bg-[#2A8CFF] px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white">New</span>
              log MCP
              <FontAwesomeIcon icon={faArrowRight} className="text-[11px] text-[#2A8CFF]" />
            </a>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="grid size-7 place-items-center rounded-full text-[13px] transition-colors hover:bg-[var(--mcp-promo-close-hover)]"
              style={{ color: 'var(--mcp-promo-muted)' }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>
          <div
            className="hidden w-[320px] flex-col gap-4 rounded-3xl px-5 pb-5 pt-4 text-white shadow-[0_6px_0_#1A5FC8,0_24px_48px_-16px_rgba(13,42,76,0.5)] sm:flex"
            style={CARD_STYLE}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#2A8CFF]">New: log MCP</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="grid size-8 place-items-center rounded-full text-[14px] text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-4"
              >
                <div className="flex h-[112px] items-center justify-center">{current.demo}</div>
                <div className="flex flex-col gap-1">
                  <p className="text-4xl font-black leading-none tracking-[-0.045em]">Step {step + 1}</p>
                  <p className="mt-1 text-lg font-bold tracking-[-0.01em]">{current.title}</p>
                  <p className="text-[14px] leading-snug text-white/80">{current.body}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center gap-1.5" role="tablist" aria-label="How the log MCP works">
              {STEPS.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  role="tab"
                  aria-selected={index === step}
                  aria-label={`Step ${index + 1}`}
                  onClick={() => setStep(index)}
                  className={`h-1.5 rounded-full transition-all ${index === step ? 'w-6 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/70'}`}
                />
              ))}
            </div>
            <a
              href={MCP_PATH}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[15px] font-bold text-[#2A8CFF] shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
            >
              See the log MCP
              <FontAwesomeIcon icon={faArrowRight} className="text-[12px]" />
            </a>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
