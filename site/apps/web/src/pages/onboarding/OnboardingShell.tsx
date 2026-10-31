import type { CSSProperties, ReactNode } from 'react'
import Dither from '@/components/Dither'
import { Clouds } from '@/landing/Clouds'

const EDGE_DITHER = {
  waveColor: [0.75, 0.9, 1] as [number, number, number],
  backgroundColor: [0.165, 0.55, 1] as [number, number, number],
  colorNum: 4,
  pixelSize: 3,
  waveAmplitude: 0.25,
  waveFrequency: 2.5,
  waveSpeed: 0.03,
}

const EDGE_MASK = {
  maskImage: 'linear-gradient(to right, black 0%, transparent 20%, transparent 80%, black 100%)',
  WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 20%, transparent 80%, black 100%)',
} satisfies CSSProperties

const HERO_MASK = {
  maskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 7%, black 93%, transparent 100%)',
} satisfies CSSProperties

/**
 * Shared onboarding header: the ListeningKit mark inside the drifting cloud
 * band, same recipe as the landing hero. The shell renders it above every
 * screen's content, so the steps, sign-in, sign-up and loading states all
 * open identically — no per-screen header copies. The shell's full-height
 * Dither vignette is the single edge treatment for the whole page, so the
 * hero opts out of Clouds' own fades (edgeFade={false}); the narrow mask
 * only softens clouds sliced at the viewport edge, and behind it the same
 * shell vignette shows through, continuous with the content below.
 */
export function OnboardingHero() {
  return (
    <div className="w-full shrink-0" style={HERO_MASK}>
      <Clouds edgeFade={false} className="h-[19rem] shrink-0 sm:h-[21rem]">
        <div
          className="flex flex-col items-center px-6 py-8 text-center"
          style={{ background: 'radial-gradient(ellipse at center, #2a8cff 45%, transparent 72%)' }}
        >
          <img src="/logo.svg" alt="ListeningKit logo" className="size-16 shrink-0 rounded-[18px] object-contain sm:size-20" />
          <p className="mt-4 text-2xl font-black leading-tight sm:text-3xl">ListeningKit</p>
          <p className="mt-1 text-base leading-snug text-white/80 sm:text-lg">Live social listening</p>
        </div>
      </Clouds>
    </div>
  )
}

export function OnboardingShell({
  children,
  hero = true,
  tone = 'blue',
}: {
  children: ReactNode
  hero?: boolean
  tone?: 'blue' | 'white'
}) {
  const white = tone === 'white'
  return (
    <div
      className={`relative flex min-h-screen flex-col overflow-x-clip ${white ? 'text-slate-900' : 'text-white'}`}
      style={{ backgroundColor: white ? '#ffffff' : '#2a8cff', fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}
    >
      {/* Blue pages get one full-page dither layer (see EDGE_MASK note);
          white pages skip it — blue-on-blue waves would read as a blob. */}
      {white ? null : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-55" style={EDGE_MASK}>
          <Dither {...EDGE_DITHER} enableMouseInteraction={false} />
        </div>
      )}
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        {hero ? <OnboardingHero /> : null}
        {children}
      </div>
    </div>
  )
}
