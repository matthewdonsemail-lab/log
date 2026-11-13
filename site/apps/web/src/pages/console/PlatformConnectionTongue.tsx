import { useEffect, useRef } from 'react'
import { useMachine } from '@xstate/react'
import { setup } from 'xstate'
import { motion, MotionConfig, useReducedMotion } from 'motion/react'
import { PLATFORM_DEMOS } from '../../landing/PlatformDemos'

const previewMachine = setup({
  types: { context: {} as { order: number }, input: {} as { order: number }, events: {} as { type: 'VISIBLE' | 'HIDDEN' } },
  delays: { revealDelay: ({ context }) => (context.order % 2) * 180 },
}).createMachine({
  initial: 'hidden', context: ({ input }) => input,
  states: {
    hidden: { on: { VISIBLE: 'entering' } },
    entering: { after: { revealDelay: 'playing' }, on: { HIDDEN: 'hidden' } },
    playing: { on: { HIDDEN: 'hidden' } },
  },
})

export function PlatformConnectionTongue({ platform, label, order }: { platform: string; label: string; order: number }) {
  const frame = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const [snapshot, send] = useMachine(previewMachine, { input: { order } })
  const Demo = PLATFORM_DEMOS[platform]
  const playing = snapshot.matches('playing')
  useEffect(() => {
    if (!frame.current) return
    const observer = new IntersectionObserver(([entry]) => send({ type: entry.isIntersecting ? 'VISIBLE' : 'HIDDEN' }), { threshold: 0.15 })
    observer.observe(frame.current)
    return () => observer.disconnect()
  }, [send])
  return <div ref={frame} role="img" aria-label={`${label} use-case preview`} className="relative isolate z-0 mx-4 h-80 min-w-0 overflow-visible font-sans [&_*]:!font-sans sm:mx-5 sm:h-[22rem]">
    <div className="absolute -inset-x-6 -top-6 bottom-0 overflow-hidden">
      <MotionConfig reducedMotion="user">
        <motion.div initial={false} animate={{ y: playing ? 0 : reduced ? 0 : 48, opacity: playing ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.4, ease: 'easeOut' }} className={`pointer-events-none absolute inset-x-6 bottom-0 top-9 min-w-0 ${platform === 'slack' ? '[&>div]:h-full' : ''}`} aria-hidden="true">
          {playing && Demo ? <Demo /> : null}
        </motion.div>
      </MotionConfig>
    </div>
  </div>
}
