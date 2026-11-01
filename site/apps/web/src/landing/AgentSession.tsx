import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faArrowUp,
  faCheck,
  faChevronDown,
  faCircleNotch,
  faCodeBranch,
  faFolder,
  faPenToSquare,
  faPlug,
  faPlus,
  faTerminal,
} from '@fortawesome/free-solid-svg-icons'
import { BrandMark } from './BrandMark'
import { SESSION } from './agentSessionScript'

const STEP_MS = { user: 2400, tool: 1700, assistant: 3400 }
const END_PAUSE_MS = 5000

function useSessionClock(running: boolean) {
  const [step, setStep] = useState(0)
  const [settled, setSettled] = useState(0)
  const [round, setRound] = useState(0)
  useEffect(() => {
    if (!running) return
    if (step >= SESSION.length) {
      const id = window.setTimeout(() => {
        setSettled(0)
        setStep(0)
        setRound((value) => value + 1)
      }, END_PAUSE_MS)
      return () => window.clearTimeout(id)
    }
    const kind = SESSION[step].kind
    const settle = window.setTimeout(() => setSettled(step + 1), STEP_MS[kind] * 0.6)
    const next = window.setTimeout(() => setStep(step + 1), STEP_MS[kind])
    return () => {
      window.clearTimeout(settle)
      window.clearTimeout(next)
    }
  }, [running, step])
  const visible = running || step > 0 ? Math.min(step + 1, SESSION.length) : 0
  return { visible, settled, round }
}

function Typed({ text, done, perWord = false }: { text: string; done: boolean; perWord?: boolean }) {
  const parts = perWord ? text.split(/(\s+)/) : Array.from(text)
  const [count, setCount] = useState(done ? parts.length : 0)
  useEffect(() => {
    if (done) {
      setCount(parts.length)
      return
    }
    if (count >= parts.length) return
    const id = window.setTimeout(() => setCount((value) => value + 1), perWord ? 30 : 20)
    return () => window.clearTimeout(id)
  }, [count, done, parts.length, perWord])
  return <>{parts.slice(0, count).join('')}</>
}

function Appear({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}

function Feed({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 px-5 pb-4">{children}</div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[var(--feed-bg)] to-transparent" />
    </div>
  )
}

function ClaudeWindow({ visible, settled, round }: { visible: number; settled: number; round: number }) {
  return (
    <div className="flex h-[520px] w-full overflow-hidden rounded-xl border border-[#DCD4C2] bg-[#F0ECE0] text-left text-[#1a1a18]" style={{ ['--feed-bg' as string]: '#F0ECE0' }}>
      <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r border-[#DCD4C2] bg-[#EAE4D3] p-3 font-sans text-sm sm:flex">
        <div className="mb-3 flex items-center gap-2 px-2 pt-1">
          <BrandMark id="claude" className="size-5 text-[#c96442]" />
          <span className="font-serif text-lg">Claude</span>
        </div>
        <span className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[#3d3a35]">
          <FontAwesomeIcon icon={faPlus} className="text-xs text-[#c96442]" />
          New session
        </span>
        <span className="rounded-md px-2 py-1.5 text-[#5b5950]">Chats</span>
        <span className="rounded-md bg-[#1a1a18]/5 px-2 py-1.5 font-medium text-[#1a1a18]">Code</span>
        <div className="mt-4 px-2 text-xs text-[#8a8780]">Recents</div>
        <span className="truncate rounded-md px-2 py-1.5 text-[#3d3a35]">X inbox follow-ups</span>
        <span className="truncate rounded-md px-2 py-1.5 text-[#5b5950]">Marketplace listings</span>
        <span className="truncate rounded-md px-2 py-1.5 text-[#5b5950]">Group listening</span>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-[#DCD4C2] px-5 py-2.5 font-sans text-sm text-[#5b5950]">
          <FontAwesomeIcon icon={faFolder} className="text-xs" />
          your-marketing
          <FontAwesomeIcon icon={faCodeBranch} className="ml-3 text-xs" />
          main
        </div>
        <Feed>
          {SESSION.slice(0, visible).map((event, index) => {
            const done = settled > index
            if (event.kind === 'user') {
              return (
                <Appear key={`${round}-${index}`}>
                  <div className="ml-auto max-w-[80%] rounded-2xl bg-[#E5E0D6] px-4 py-2.5 font-sans text-[15px]">
                    <Typed text={event.text} done={done} />
                  </div>
                </Appear>
              )
            }
            if (event.kind === 'assistant') {
              return (
                <Appear key={`${round}-${index}`}>
                  <p className="m-0 font-serif text-[16px] leading-[1.6rem]">
                    <Typed text={event.text} done={done} perWord />
                  </p>
                </Appear>
              )
            }
            return (
              <Appear key={`${round}-${index}`}>
                <div className="overflow-hidden rounded-lg border border-[#E5E0D6] bg-white/60 font-sans text-sm">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <FontAwesomeIcon icon={faPlug} className="text-xs text-[#8a8780]" />
                    <span className="font-medium">log</span>
                    <span className="text-[#8a8780]">·</span>
                    <span className="font-medium">{event.name}</span>
                    <span className="min-w-0 flex-1 truncate font-mono text-xs text-[#8a8780]">{event.args}</span>
                    {done ? (
                      <FontAwesomeIcon icon={faCheck} className="text-xs text-[#5a8a3c]" />
                    ) : (
                      <FontAwesomeIcon icon={faCircleNotch} spin className="text-xs text-[#c96442]" />
                    )}
                  </div>
                  {done ? (
                    <div className="border-t border-[#E5E0D6] px-3 py-2 font-mono text-xs leading-5 text-[#5b5950]">
                      {event.result.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Appear>
            )
          })}
        </Feed>
        <div className="px-5 pb-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-[#E5E0D6] bg-white px-3.5 pb-2.5 pt-3 font-sans">
            <span className="text-[15px] text-[#9a9893]">Reply to Claude…</span>
            <div className="flex items-center gap-2 text-sm text-[#5b5950]">
              <FontAwesomeIcon icon={faPlus} />
              <span className="ml-auto flex items-center gap-1 text-[#1a1a18]">
                Opus 5.5
                <FontAwesomeIcon icon={faChevronDown} className="text-[10px]" />
              </span>
              <span className="flex size-8 items-center justify-center rounded-md bg-[#c96442] text-white">
                <FontAwesomeIcon icon={faArrowUp} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CodexWindow({ visible, settled, round }: { visible: number; settled: number; round: number }) {
  return (
    <div
      className="flex h-[520px] w-full overflow-hidden rounded-xl border border-[#e5e5e5] bg-white text-left font-sans text-[#0d0d0d]"
      style={{ ['--feed-bg' as string]: '#ffffff' }}
    >
      <aside className="hidden w-52 shrink-0 flex-col gap-1 border-r border-[#ececec] bg-[#f9f9f9] p-3 text-sm sm:flex">
        <div className="mb-3 flex items-center gap-2 px-2 pt-1">
          <BrandMark id="chatgpt" className="size-5" />
          <span className="text-[15px] font-semibold">Codex</span>
        </div>
        <span className="flex items-center gap-2 rounded-lg px-2 py-1.5">
          <FontAwesomeIcon icon={faPenToSquare} className="text-xs" />
          New thread
        </span>
        <div className="mt-4 px-2 text-xs text-[#8f8f8f]">your-marketing</div>
        <span className="truncate rounded-lg bg-[#ececec] px-2 py-1.5">Answer my X DMs</span>
        <span className="truncate rounded-lg px-2 py-1.5 text-[#5d5d5d]">Post the listings</span>
        <span className="truncate rounded-lg px-2 py-1.5 text-[#5d5d5d]">Read the groups</span>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-[#ececec] px-5 py-2.5 text-sm">
          <span className="font-medium">Answer my X DMs</span>
          <span className="flex items-center gap-1.5 text-[#8f8f8f]">
            <FontAwesomeIcon icon={faCodeBranch} className="text-xs" />
            main
          </span>
        </div>
        <Feed>
          {SESSION.slice(0, visible).map((event, index) => {
            const done = settled > index
            if (event.kind === 'user') {
              return (
                <Appear key={`${round}-${index}`}>
                  <div className="ml-auto max-w-[80%] rounded-3xl bg-[#f3f3f3] px-4 py-2.5 text-[15px]">
                    <Typed text={event.text} done={done} />
                  </div>
                </Appear>
              )
            }
            if (event.kind === 'assistant') {
              return (
                <Appear key={`${round}-${index}`}>
                  <p className="m-0 text-[15px] leading-6">
                    <Typed text={event.text} done={done} perWord />
                  </p>
                </Appear>
              )
            }
            return (
              <Appear key={`${round}-${index}`}>
                <div className="text-sm">
                  <div className="flex items-center gap-2 text-[#5d5d5d]">
                    {done ? (
                      <FontAwesomeIcon icon={faTerminal} className="text-[11px]" />
                    ) : (
                      <FontAwesomeIcon icon={faCircleNotch} spin className="text-[11px]" />
                    )}
                    <span>{done ? 'Called' : 'Calling'}</span>
                    <span className="rounded bg-[#f3f3f3] px-1.5 py-0.5 font-mono text-xs text-[#0d0d0d]">log.{event.name}</span>
                  </div>
                  {done ? (
                    <div className="mt-2 rounded-xl bg-[#f9f9f9] px-3 py-2 font-mono text-xs leading-5 text-[#5d5d5d]">
                      <div className="truncate text-[#8f8f8f]">{event.args}</div>
                      {event.result.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Appear>
            )
          })}
        </Feed>
        <div className="px-5 pb-4">
          <div className="flex items-center gap-3 rounded-3xl border border-[#e5e5e5] px-4 py-3">
            <FontAwesomeIcon icon={faPlus} className="text-[#5d5d5d]" />
            <span className="flex-1 text-[15px] text-[#8f8f8f]">Ask Codex anything</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-[#0d0d0d] text-white">
              <FontAwesomeIcon icon={faArrowUp} className="text-sm" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const APPS = [
  { id: 'claude', label: 'Watch it work in Claude Code', mark: 'claude' as const },
  { id: 'codex', label: 'Watch it work in Codex', mark: 'chatgpt' as const },
]

export function AgentSession() {
  const [app, setApp] = useState(0)
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const { visible, settled, round } = useSessionClock(inView)
  return (
    <div ref={ref} className="mx-auto mt-12 flex w-full max-w-4xl flex-col items-center gap-5">
      <div role="tablist" aria-label="Agent" className="flex flex-wrap justify-center gap-2">
        {APPS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={index === app}
            onClick={() => setApp(index)}
            className={
              index === app
                ? 'button-glow inline-flex items-center gap-2 rounded-xl border border-white/35 px-4 py-2 text-[15px] font-bold text-white'
                : 'inline-flex items-center gap-2 rounded-xl bg-[#F3F6FA] px-4 py-2 text-[15px] font-medium text-[#0D2A4C]/70 transition-colors hover:bg-[#E7EDF5] hover:text-[#0D2A4C]'
            }
          >
            <BrandMark id={item.mark} className="size-4" />
            {item.label}
          </button>
        ))}
      </div>
      <div className="w-full rounded-[22px] p-1.5" style={{ background: 'rgba(42, 140, 255, 0.22)' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={APPS[app].id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {app === 0 ? <ClaudeWindow visible={visible} settled={settled} round={round} /> : <CodexWindow visible={visible} settled={settled} round={round} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex w-full items-center gap-3 px-1">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#2A8CFF]/15">
          <div
            className="h-full rounded-full bg-[#2A8CFF] transition-[width] duration-500 ease-out"
            style={{ width: `${(settled / SESSION.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs text-[#0D2A4C]/60">
          step {Math.max(visible, 1)} of {SESSION.length}
        </span>
      </div>
      <p className="m-0 text-sm text-[#0D2A4C]/60">
        Connect it once with <code className="rounded bg-[#F3F6FA] px-1.5 py-0.5 text-[#0D2A4C]">claude mcp add log -- logMcp</code> or{' '}
        <code className="rounded bg-[#F3F6FA] px-1.5 py-0.5 text-[#0D2A4C]">codex mcp add log -- logMcp</code>
      </p>
    </div>
  )
}
