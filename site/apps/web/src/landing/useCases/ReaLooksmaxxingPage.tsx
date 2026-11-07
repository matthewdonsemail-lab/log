import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faAnglesRight, faArrowRight, faComments, faImage, faMicrophone } from '@fortawesome/free-solid-svg-icons'
import { Header } from '../Header'
import { SiteFooter } from '../SiteFooter'
import { ClayClouds } from '../ClayClouds'
import { PLATFORMS } from '../PlatformSuite'
import { LOG_REPO_URL, RepoLink, parseRepoUrl } from '../RepoLink'
import { DitherFade } from './DitherFade'
import { HowItWorks } from './HowItWorks'
import { PromptCta, ThreeSteps } from './UseCasesPage'
import { REA_LOOKSMAXXING } from './reaLooksmaxxing'

const HAND = { fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }
const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'
const LOG_REPO = parseRepoUrl(LOG_REPO_URL)!
const X = PLATFORMS.find((platform) => platform.id === 'x')!
const ICONS = { platform: faXTwitter, meme: faImage, voice: faMicrophone, react: faComments, voiceGate: faComments }

function Hero() {
  const play = REA_LOOKSMAXXING
  return (
    <section aria-label="Hero" className="relative isolate w-full overflow-hidden text-left">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[calc(100%-8rem)] overflow-hidden bg-[#2A8CFF] md:h-[calc(100%-14rem)]">
        <div className="absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(ellipse_130%_100%_at_50%_0%,rgba(92,167,255,0.8)_0%,transparent_80%)]" />
        <ClayClouds className="absolute inset-x-0 top-12 h-[26rem] [mask-image:linear-gradient(to_bottom,black_75%,transparent)] md:top-14 md:h-[36rem]" />
        <DitherFade stops={['#2A8CFF', '#9CCBFF', '#FFFFFF']} cell={5} className="absolute inset-x-0 bottom-0 h-[22rem] w-full md:h-[34rem]" />
      </div>
      <div className="mx-auto w-full max-w-[86rem] px-4 pb-16 pt-72 md:px-6 md:pb-24 md:pt-[26rem]">
        <div className="grid items-end gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12 lg:gap-16">
          <h1 className="text-[clamp(2.75rem,1.4rem+4.2vw,5.25rem)] font-black leading-[0.95] tracking-[-0.04em] text-white">
            <span className="block">Moneymaxx like Clavicular.</span>
            <span className="block text-white/65">An 11 step play, from the nightclub to the limo.</span>
          </h1>
          <div className="flex flex-col items-start gap-6 md:pb-2">
            <p className="text-2xl leading-tight text-white sm:text-3xl" style={HAND}>
              We&apos;re <span className="underline decoration-wavy decoration-2 underline-offset-4">NOT</span> endorsed by Clavicular{' '}
              <span className="text-white/70">(yet)</span>
            </p>
            <p className="text-lede text-white/85">
              The <span className="font-black text-white underline decoration-dashed underline-offset-4">/rea-looksmaxxing</span> play: treg finds what&apos;s going viral, SubQ picks
              the winners, log runs the accounts and Claude Code funnels everyone into your offer. Your jawline is optional.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <RepoLink
                href={LOG_REPO_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[16px] font-bold text-[#2A8CFF] shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
              >
                Set up log
                <FontAwesomeIcon icon={faArrowRight} className="text-[13px]" />
              </RepoLink>
              <a href="#steps" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-[16px] font-bold text-white shadow-[0_3px_0_rgb(0_0_0/0.12)] transition-colors hover:bg-white/25">
                See the play
                <FontAwesomeIcon icon={faAnglesRight} className="text-[13px]" />
              </a>
            </div>
          </div>
        </div>
        <div aria-hidden className="h-40 md:h-48" />
        <HowItWorks
          ask={play.ask}
          done={play.how.done}
          title={play.name}
          steps={play.how.steps.map((moment) => ({ icon: ICONS[moment.kind], label: moment.label, tool: moment.tool }))}
          platformLabel={X.label}
          platformIcon={X.icon}
          rows={play.how.rows}
        />
      </div>
    </section>
  )
}

const TWEET_URL = 'https://twitter.com/clavicular/status/2118075785613287786'

function ClavTweet() {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const load = () => (window as unknown as { twttr?: { widgets?: { load: (el?: HTMLElement | null) => void } } }).twttr?.widgets?.load(box.current)
    if (document.getElementById('twitter-wjs')) {
      load()
      return
    }
    const script = document.createElement('script')
    script.id = 'twitter-wjs'
    script.async = true
    script.src = 'https://platform.twitter.com/widgets.js'
    script.onload = load
    document.body.appendChild(script)
  }, [])
  return (
    <section id="exhibitA" className="w-full scroll-mt-24 bg-white px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="flex flex-col gap-5">
          <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#2A8CFF]">Exhibit A</p>
          <h2 className="text-title text-[#0D2A4C]">
            The man. The myth. <span className={STICKER}>The jawline.</span>
          </h2>
          <p className="text-lede text-[#0D2A4C]/80">
            He already has Claude Code in his Instagram DMs. Step 9 of this play, confirmed by the man himself. We didn&apos;t invent moneymaxxing, we just made it run while you mew.
          </p>
          <ul className="flex flex-col gap-2 text-2xl text-[#0D2A4C]" style={HAND}>
            <li>jawline: mogging ✓</li>
            <li>bank account: also mogging ✓</li>
            <li>his DMs: Claude Code ✓</li>
          </ul>
        </div>
        <div ref={box} className="flex min-h-[20rem] justify-center rounded-3xl bg-[#F3F8FF] p-4 shadow-[0_0_0_1px_#C9E3FF,0_6px_0_#B5D6FF]">
          <blockquote className="twitter-tweet" data-dnt="true" data-theme="light">
            <a href={TWEET_URL}>A post from @clavicular on X</a>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

function ElevenSteps() {
  return (
    <section id="steps" className="w-full scroll-mt-24 bg-[#F7FAFF] px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center gap-4 text-center">
        <h2 className="text-title text-[#0D2A4C]">
          The play, <span className={STICKER}>step by step.</span>
        </h2>
        <p className="text-lede text-[#0D2A4C]/80">Eleven steps. Two of them are &quot;go viral&quot; and &quot;profit&quot;, which is how you know it&apos;s a real business plan.</p>
      </div>
      <ol className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REA_LOOKSMAXXING.beats.map((beat, index) => (
          <motion.li
            key={beat.head}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.35, delay: (index % 3) * 0.06 }}
            className="flex flex-col gap-3 rounded-3xl bg-white px-6 pb-6 pt-7 shadow-[0_0_0_1px_#C9E3FF,0_5px_0_#B5D6FF]"
          >
            <p className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#2A8CFF]">{beat.kicker}</p>
            <p className="text-2xl font-black leading-tight tracking-[-0.02em] text-[#0D2A4C]">{beat.head}</p>
            <p className="text-2xl leading-tight text-[#2A8CFF]" style={HAND}>
              {beat.sticker}
            </p>
            <p className="mt-auto text-[15px] text-[#0D2A4C]/70">{beat.joke}</p>
            {beat.tool ? (
              <p className="font-mono text-[12px] text-[#0D2A4C]/55">
                runs on <span className="font-bold text-[#0D2A4C]">{beat.tool}</span>
              </p>
            ) : null}
          </motion.li>
        ))}
      </ol>
      <div className="mx-auto mt-12 max-w-3xl rounded-3xl bg-[#0D2A4C] px-6 py-8 text-center text-white shadow-[0_6px_0_#061a33]">
        <p className="text-3xl font-black tracking-[-0.03em]">Your brand might be a bit cooked.</p>
        <p className="mt-2 text-3xl text-[#7BE3A4]" style={HAND}>
          But at least you moneymaxxed.
        </p>
      </div>
    </section>
  )
}

export function ReaLooksmaxxingPage() {
  useEffect(() => {
    const previous = document.title
    document.title = '/rea-looksmaxxing · log by ListeningKit'
    return () => {
      document.title = previous
    }
  }, [])
  return (
    <div className="flex min-h-screen flex-col bg-white" style={{ fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" }}>
      <Header
        tone="light"
        homeHref="/"
        logoLabel="ListeningKit"
        githubRepo={`${LOG_REPO.owner}/${LOG_REPO.repo}`}
        className="z-[70]"
        accountItems={[{ href: LOG_REPO_URL, label: 'Set up log', variant: 'cta' }]}
      />
      <Hero />
      <ClavTweet />
      <ElevenSteps />
      <ThreeSteps play={REA_LOOKSMAXXING} platform={{ ...X, label: 'socials' }} icon={faXTwitter} />
      <PromptCta title="Run /rea-looksmaxxing with your agent" ask={REA_LOOKSMAXXING.ask} isCommand={false} />
      <SiteFooter />
    </div>
  )
}
