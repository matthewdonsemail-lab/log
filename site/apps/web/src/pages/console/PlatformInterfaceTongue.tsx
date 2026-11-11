import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { AnimatePresence, motion } from 'motion/react'
import { AgentPlatformLogo, getAgentPlatform, type AgentPlatform } from './agentPlatforms'
import { AgentToolCall, type AgentToolCallData } from '../../components/ai-elements/agentToolCall'

type PreviewStep = AgentToolCallData
type PlaybackProps = { previewIndex: number; active: boolean; onCycleComplete: (index: number) => void }

function PlayTranscript({ platform, prompt, steps, previewIndex, active, onCycleComplete }: { platform: AgentPlatform; prompt: string; steps: PreviewStep[] } & PlaybackProps) {
  const [tick, setTick] = useState(0)
  const [round, setRound] = useState(0)
  const feedRef = useRef<HTMLDivElement>(null)
  const dark = getAgentPlatform(platform).theme === 'dark'
  const complete = tick >= steps.length * 2

  useEffect(() => {
    if (!active) return
    const timer = window.setTimeout(() => {
      if (complete) {
        setTick(0)
        setRound((value) => value + 1)
        onCycleComplete(previewIndex)
      } else {
        setTick((value) => value + 1)
      }
    }, complete ? 4000 : tick === 0 ? 2200 : tick % 2 === 1 ? 1600 : 650)
    return () => window.clearTimeout(timer)
  }, [active, complete, onCycleComplete, previewIndex, tick])

  useEffect(() => {
    const feed = feedRef.current
    if (feed) feed.scrollTo({ top: tick === 0 ? 0 : feed.scrollHeight, behavior: tick === 0 ? 'instant' : 'smooth' })
  }, [tick])

  return (
    <div ref={feedRef} className="h-0 min-h-0 flex-1 basis-0 overflow-hidden" aria-live="off">
      <div className="flex min-h-full flex-col gap-3 p-3 pb-6">
        <motion.div
          key={`prompt-${round}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-[94%] px-3 py-2 text-xs leading-5 ${dark ? 'font-mono text-sky-200' : platform === 'claude' ? 'ml-auto rounded-xl bg-[#E6E0D2]' : 'ml-auto rounded-xl bg-slate-100'}`}
        >
          {dark ? <span className="mr-2 text-emerald-300">›</span> : null}{prompt}
        </motion.div>
        {steps.slice(0, Math.ceil(tick / 2)).map((step, index) => {
          const done = tick >= (index + 1) * 2
          return (
            <motion.div key={`${round}-${index}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <AgentToolCall call={step} done={done} running={active} variant={dark ? 'dark' : platform === 'claude' ? 'claude' : 'codex'} />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export function PlatformInterfaceTongue({ platform, prompt, steps, previewIndex, active, onVisibilityChange, onCycleComplete }: { platform: AgentPlatform; prompt: string; steps: PreviewStep[]; onVisibilityChange: (index: number, visible: boolean) => void } & PlaybackProps) {
  const selected = getAgentPlatform(platform)
  const dark = selected.theme === 'dark'
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const observer = new IntersectionObserver(([entry]) => onVisibilityChange(previewIndex, entry.intersectionRatio >= 0.4), { threshold: [0, 0.4] })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [onVisibilityChange, previewIndex])

  return (
    <div ref={frameRef} className="relative mx-4 h-[21rem] shrink-0 overflow-hidden md:h-[23rem]" role="region" aria-label={`${selected.label} play preview`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`absolute inset-0 flex h-full min-h-0 flex-col overflow-hidden rounded-md border ${dark ? 'border-slate-600 bg-[#101820] text-slate-100' : platform === 'claude' ? 'border-[#DCD4C2] bg-[#F0ECE0] text-[#1a1a18]' : 'border-slate-300 bg-white text-slate-900'}`}
        >
          <div className={`flex h-11 shrink-0 items-center gap-2 border-b px-3 text-xs font-semibold ${dark ? 'border-white/10 bg-[#17232e]' : platform === 'claude' ? 'border-[#DCD4C2] bg-[#EAE4D3]' : platform === 'antigravity' ? 'border-blue-100 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
            <AgentPlatformLogo platform={platform} dark={dark} />
            <span>{selected.label}</span>
            <span className="ml-auto text-[10px] font-normal opacity-55">Demo</span>
          </div>
          {platform === 'antigravity' ? <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold text-blue-600">Agent Manager / log workspace</div> : null}
          <PlayTranscript platform={platform} prompt={prompt} steps={steps} previewIndex={previewIndex} active={active} onCycleComplete={onCycleComplete} />
          <div className={`m-3 mb-6 flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-xs ${dark ? 'border-white/10 bg-white/[0.04] font-mono text-slate-400' : platform === 'claude' ? 'border-[#DCD4C2] bg-white/70 text-[#77746d]' : 'border-slate-200 bg-white text-slate-400'}`}>
            <span className="flex-1">{dark ? '› Ask anything…' : `Message ${selected.label}`}</span>
            <span className={`flex size-6 items-center justify-center rounded-full text-white ${platform === 'claude' ? 'bg-[#c96442]' : dark ? 'bg-slate-600' : 'bg-slate-900'}`}>
              <FontAwesomeIcon icon={faArrowUp} className="size-3" />
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
