import { useEffect, useState } from 'react'
import { Check, PenLine, SearchIcon, Target } from 'lucide-react'
import { SOCIAL_ICONS, SocialGlyph } from '@/lib/social-icons'
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'
import {
  mainStep,
  subStep,
  terminalStep,
  trunkStep,
} from '@/components/ai-elements/chain-joints'

/**
 * Auto-playing copy of the BrandRevealStep chain for the Socials end card.
 * Same streaming ChainOfThought language at the same full size, but with
 * no options and no answers — it just walks through what ListeningKit does
 * once the scroll reaches the end card. Sits on white, so everything uses
 * the brand-blue tone.
 *
 * This now owns the brand mark itself (logo + "ListeningKit" wordmark) as
 * a plain HTML ChainOfThoughtHeader, the same way BrandRevealStep's header
 * carries "Tracking {name}" — no more separate SVG-rendered wordmark text
 * drawn by the caller. The root wrapper mirrors BrandRevealStep's
 * `mb-auto mt-8 w-full`: the parent scene centers this block by default,
 * and the auto margin claims that space back so the block sits flush near
 * the top of its slot and only grows downward from there. That matters
 * here specifically because the Socials scene is pinned (no page scroll)
 * — without this, a block growing from a fixed vertical center runs its
 * tail off the bottom of the viewport before it's ever fully visible.
 */

const LISTEN_WORDS = 'Listening for your keywords across Reddit, X (Twitter) and Facebook.'.split(' ')
const SCORE_WORDS = 'Scoring every match 0 to 100 with an intent and a reason.'.split(' ')

const WORDMARK = 'ListeningKit'
const FONT = "'Satoshi', 'Inter', system-ui, sans-serif"
const BLUE = '#2A8CFF'
const LISTENING_PHOTOS = [
  '/images/mattlistening.png',
  '/images/johnlistening.png',
  '/images/kennedylistneing.png',
  '/images/mandeeplistening.png',
]

const FOUND = [
  { platform: 'reddit', label: 'Found a match on Reddit' },
  { platform: 'x', label: 'Found a match on X (Twitter)' },
  { platform: 'facebook', label: 'Found a match on Facebook' },
] as const

const STEP = mainStep('brand-blue')
const SUB = subStep('brand-blue')
const TRUNK = trunkStep('brand-blue')
const TERMINAL = terminalStep('brand-blue')

/**
 * Same chip as BrandRevealStep's InlineToolChip, flipped for the white
 * end card: brand-blue chip, white platform glyph + name.
 */
function SocialChip({ platform, name, accentColor }: { platform: 'reddit' | 'x' | 'facebook'; name: string; accentColor: string }) {
  const icon = SOCIAL_ICONS.find((entry) => entry.id === platform)
  return (
    <span
      className="shadow-hard relative inline-flex items-center gap-1.5 overflow-hidden rounded-sm px-1 py-0.5 text-white"
      style={{ backgroundColor: accentColor }}
    >
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {icon ? <SocialGlyph icon={icon} className="size-5 shrink-0" /> : null}
        {name}
      </span>
    </span>
  )
}

function socialChipFor(word: string): { platform: 'reddit' | 'x' | 'facebook'; name: string; trailing: string } | null {
  const trailing = word.match(/[.,!?;:]+$/)?.[0] ?? ''
  const clean = trailing ? word.slice(0, -trailing.length) : word
  if (clean === 'Reddit') return { platform: 'reddit', name: 'Reddit', trailing }
  if (clean === 'X') return { platform: 'x', name: 'X (Twitter)', trailing }
  if (clean === '(Twitter)') return { platform: 'x', name: '', trailing }
  if (clean === 'Facebook') return { platform: 'facebook', name: 'Facebook', trailing }
  return null
}

function renderStreamedWords(all: string[], shown: number, complete: boolean, accentColor: string) {
  return (
    <>
      {all.slice(0, shown).map((word, index, arr) => {
        const chip = socialChipFor(word)
        return (
          <span key={index}>
            {chip ? <SocialChip platform={chip.platform} name={chip.name} accentColor={accentColor} /> : word}
            {chip ? chip.trailing : ''}
            {index < arr.length - 1 ? ' ' : ''}
          </span>
        )
      })}
      {complete ? '' : '▍'}
    </>
  )
}

/**
 * Streams words without moving layout: the full text reserves the final
 * height invisibly while the visible copy streams over the top.
 */
function StreamedText({ words, shown, complete, accentColor }: { words: string[]; shown: number; complete: boolean; accentColor: string }) {
  return (
    <span className="relative block">
      <span aria-hidden="true" className="invisible">
        {renderStreamedWords(words, words.length, true, accentColor)}
      </span>
      <span className="absolute inset-0" aria-live="polite">
        {renderStreamedWords(words, shown, complete, accentColor)}
      </span>
    </span>
  )
}

export function SocialsExplainer({
  started,
  brandName = WORDMARK,
  logoSrc = '/logo.svg',
  finalMessage = 'Drafting a reply in your voice, ready to send.',
  accentColor = BLUE,
}: {
  started: boolean
  brandName?: string
  logoSrc?: string
  finalMessage?: string
  accentColor?: string
}) {
  const [listenShown, setListenShown] = useState(0)
  const listenDone = listenShown >= LISTEN_WORDS.length
  const [foundCount, setFoundCount] = useState(0)
  const foundAll = foundCount >= FOUND.length
  const [scoreShown, setScoreShown] = useState(0)
  const scoreDone = scoreShown >= SCORE_WORDS.length
  const draftWords = finalMessage.split(' ')
  const [draftShown, setDraftShown] = useState(0)
  const draftDone = draftShown >= draftWords.length

  useEffect(() => {
    if (!started || listenDone) return
    const id = window.setTimeout(() => setListenShown((prev) => Math.min(prev + 1, LISTEN_WORDS.length)), 90)
    return () => window.clearTimeout(id)
  }, [started, listenShown, listenDone])

  useEffect(() => {
    if (!started || !listenDone || foundAll) return
    const id = window.setTimeout(() => setFoundCount((prev) => prev + 1), 500)
    return () => window.clearTimeout(id)
  }, [started, listenDone, foundAll, foundCount])

  useEffect(() => {
    if (!started || !foundAll || scoreDone) return
    const id = window.setTimeout(() => setScoreShown((prev) => Math.min(prev + 1, SCORE_WORDS.length)), 90)
    return () => window.clearTimeout(id)
  }, [started, foundAll, scoreShown, scoreDone])

  useEffect(() => {
    if (!started || !scoreDone || draftDone) return
    const id = window.setTimeout(() => setDraftShown((prev) => Math.min(prev + 1, draftWords.length)), 90)
    return () => window.clearTimeout(id)
  }, [started, scoreDone, draftShown, draftDone, draftWords.length])

  return (
    // Mirrors BrandRevealStep's root wrapper exactly: anchors this block
    // near the top of its (otherwise centering) flex slot with a fixed
    // 8-unit gap, and lets it grow straight down from there.
    <div className="mb-auto mt-8 w-full">
      <ChainOfThought className="space-y-0 text-[#0B3E91] [&_svg.lucide]:size-6">
        <ChainOfThoughtHeader className="pb-8 [&>span]:text-center [&>svg]:hidden">
          <span className="flex items-center justify-start gap-3">
            <img
              src={logoSrc}
              alt={`${brandName} logo`}
              aria-hidden="true"
              className="size-16 shrink-0 rounded-[22%] sm:size-24"
            />
            <span className="flex flex-col items-start text-left">
              <span
                className="text-6xl font-black leading-none sm:text-8xl"
                style={{ fontFamily: FONT, color: accentColor }}
              >
                {brandName}
              </span>
            </span>
          </span>
        </ChainOfThoughtHeader>
        <div className="mx-auto w-full max-w-xl">
          <ChainOfThoughtStep
            icon={SearchIcon}
            status={listenDone ? 'complete' : 'active'}
          tone="brand-blue"
          accentColor={accentColor}
          label={<StreamedText words={LISTEN_WORDS} shown={listenShown} complete={listenDone} accentColor={accentColor} />}
            className={TRUNK}
          >
            {listenDone ? (
              <ChainOfThought className="space-y-0 pt-8">
                {FOUND.slice(0, foundCount).map((row, index) => {
                  const icon = SOCIAL_ICONS.find((entry) => entry.id === row.platform)
                  const isLast = foundAll && index === foundCount - 1
                  return (
                    <ChainOfThoughtStep
                      key={row.platform}
                      icon={Check}
                      status="complete"
                    tone="brand-blue"
                    accentColor={accentColor}
                      compact={!isLast}
                      elbow={isLast ? 'out' : index === 0 ? 'in' : undefined}
                      label={
                        <span className="flex items-center gap-2">
                          {icon ? (
                            <span className="shrink-0" style={{ color: accentColor }}>
                              <SocialGlyph icon={icon} className="size-8" />
                            </span>
                          ) : null}
                          {row.label}
                        </span>
                      }
                      className={SUB}
                    />
                  )
                })}
              </ChainOfThought>
            ) : null}
          </ChainOfThoughtStep>
        </div>
        {foundAll ? (
          <div className="mx-auto w-full max-w-xl">
            <ChainOfThoughtStep
              icon={Target}
              status={scoreDone ? 'complete' : 'active'}
              tone="brand-blue"
              accentColor={accentColor}
              label={<StreamedText words={SCORE_WORDS} shown={scoreShown} complete={scoreDone} accentColor={accentColor} />}
              className={STEP}
            />
          </div>
        ) : null}
        {scoreDone ? (
          <div className="mx-auto w-full max-w-xl">
            <ChainOfThoughtStep
              icon={PenLine}
              status={draftDone ? 'complete' : 'active'}
              tone="brand-blue"
              accentColor={accentColor}
              label={
                <span className="font-black" style={{ color: accentColor }}>
                  <StreamedText words={draftWords} shown={draftShown} complete={draftDone} accentColor={accentColor} />
                </span>
              }
              className={TERMINAL}
            />
          </div>
        ) : null}
      </ChainOfThought>
    </div>
  )
}

/** Full end-card composition: the chain completes before the comparison cards begin. */
export function SocialsExplainerWithComparison({ started }: { started: boolean }) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-10 flex items-center justify-center gap-4 px-2">
        <div className="flex shrink-0 gap-1.5">
          {LISTENING_PHOTOS.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              aria-hidden="true"
              className="size-10 rounded-lg border-2 border-[#2A8CFF] object-cover sm:size-12"
            />
          ))}
        </div>
        <p className="max-w-sm text-left text-sm font-bold leading-tight text-slate-500 sm:text-base">
          Built by a team{' '}
          <span className="font-black text-[#2A8CFF] underline decoration-dashed underline-offset-4">
            who doesn&apos;t want to pay for things that should be free.
          </span>
        </p>
      </div>
      <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20">
        <SocialsExplainer
          started={started}
          brandName="Octolens"
          logoSrc="/octolens.svg"
          finalMessage="Costs $400 to get results."
          accentColor="#5E45BE"
        />
        <SocialsExplainer started={started} finalMessage="Completely free." accentColor={BLUE} />
      </div>
      <div className="pt-10 text-center">
        <a
          href="#why-free"
          className="text-base text-slate-400 underline decoration-slate-400 underline-offset-4 transition-colors hover:text-slate-600 sm:text-lg"
        >
          Skip to why this should be free
        </a>
      </div>
    </div>
  )
}
