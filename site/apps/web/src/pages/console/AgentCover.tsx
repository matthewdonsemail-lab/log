import { useCallback, useEffect, useState } from 'react'
import { FastAverageColor } from 'fast-average-color'
import { AnimatePresence, motion } from 'motion/react'
import Dither from '../../components/Dither'
import { getAgentPlatform, type AgentPlatform } from './agentPlatforms'

type CoverColor = [number, number, number]
type CoverArtwork = { platform: AgentPlatform; label: string; logo: string; tint: CoverColor }

const neutral: CoverColor = [0.32, 0.32, 0.32]

function lighten(color: CoverColor, amount: number): CoverColor {
  return color.map((channel) => channel + (1 - channel) * amount) as CoverColor
}

export function AgentCover({ platform }: { platform: AgentPlatform }) {
  const selected = getAgentPlatform(platform)
  const coverLogo = platform === 'hermes' ? 'hermes.svg' : selected.logo
  const logo = `/logos/tools/${coverLogo}`
  const [artwork, setArtwork] = useState<CoverArtwork | null>(null)
  const [ditherReady, setDitherReady] = useState(false)
  const handleDitherReady = useCallback(() => setDitherReady(true), [])

  useEffect(() => {
    const extractor = new FastAverageColor()
    let cancelled = false
    extractor.getColorAsync(logo, { algorithm: 'dominant' }).then((color) => {
      const channels = color.value.slice(0, 3)
      const chromatic = Math.max(...channels) - Math.min(...channels) > 24
      const gray = Math.min(0.55, Math.max(0.18, (channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722) / 255))
      const tint: CoverColor = chromatic ? channels.map((channel) => channel / 255) as CoverColor : [gray, gray, gray]
      if (!cancelled) setArtwork({ platform, label: selected.label, logo, tint })
    }).catch(() => {
      if (!cancelled) setArtwork({ platform, label: selected.label, logo, tint: neutral })
    }).finally(() => extractor.destroy())
    return () => { cancelled = true }
  }, [logo, platform, selected.label])

  const tint = artwork?.tint ?? neutral

  return (
    <div role="img" aria-label={`${selected.label} preview`} className="relative mt-4 aspect-[1.1] max-h-80 w-full overflow-hidden rounded-lg bg-slate-200">
      <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ditherReady ? 1 : 0 }} transition={{ duration: 0.65 }} aria-hidden="true">
        <Dither
          waveColor={lighten(tint, 0.8)}
          backgroundColor={lighten(tint, 0.3)}
          onReady={handleDitherReady}
          colorNum={4}
          pixelSize={3}
          waveAmplitude={0.2}
          waveFrequency={3}
          waveSpeed={0.035}
          enableMouseInteraction={false}
        />
      </motion.div>
      <AnimatePresence>
        {artwork ? <motion.div key={artwork.platform} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }} className="absolute inset-0" aria-hidden="true">
          <img src={artwork.logo} alt="" className="absolute -bottom-[9%] -right-[8%] h-[94%] w-[86%] object-contain object-right-bottom" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.6)_0.65px,transparent_0.9px)] [background-size:4px_4px] [mask-image:linear-gradient(black,transparent_85%)]" />
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 font-sans text-[clamp(1.5rem,8vw,2.75rem)] font-medium leading-tight tracking-tight text-white">{artwork.label}</span>
        </motion.div> : null}
      </AnimatePresence>
    </div>
  )
}
