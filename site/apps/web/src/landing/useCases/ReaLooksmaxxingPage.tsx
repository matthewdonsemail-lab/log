import { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDiscord, faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faAnglesRight, faArrowRight, faComments, faImage, faMicrophone } from '@fortawesome/free-solid-svg-icons'
import { Header } from '../Header'
import { SiteFooter } from '../SiteFooter'
import { ClayClouds } from '../ClayClouds'
import { PLATFORMS } from '../PlatformSuite'
import { LOG_REPO_URL, RepoLink, parseRepoUrl } from '../RepoLink'
import { DitherFade } from './DitherFade'
import { HowItWorks } from './HowItWorks'
import { PlatformScroll } from './platformStories'
import { PlatformMoney } from './PlatformMoney'
import { PLATFORM_SESSIONS } from './platformSessions'
import { Control, Dashed } from '../Control'
import { MoreUseCases, PromptCta, ThreeSteps } from './UseCasesPage'
import { REA_LOOKSMAXXING } from './reaLooksmaxxing'

const HAND = { fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }
const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'
const LOG_REPO = parseRepoUrl(LOG_REPO_URL)!
const X = PLATFORMS.find((platform) => platform.id === 'x')!
const ICONS = { platform: faXTwitter, meme: faImage, voice: faMicrophone, react: faComments, voiceGate: faComments }
const iconOfTool = (tool: string, kind: keyof typeof ICONS) => (tool.startsWith('discord') ? faDiscord : ICONS[kind])

const CHIP_LOGOS = {
  treg: { src: '/logos/stack/treg.svg', mask: true },
  SubQ: { src: '/logos/stack/subq.svg', mask: true },
  log: { src: '/logo.svg', mask: false },
  'Claude Code': { src: '/logos/tools/claude-desktop.svg', mask: true },
}

function LogoChip({ name }: { name: keyof typeof CHIP_LOGOS }) {
  const logo = CHIP_LOGOS[name]
  return (
    <span className="mx-0.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-white px-1.5 py-0.5 align-middle text-[0.9em] font-bold leading-none text-[#2A8CFF] shadow-[0_3px_0_#1A5FC8]">
      {logo.mask ? (
        <span
          aria-hidden
          className="inline-block size-[1.05em] shrink-0 bg-[#2A8CFF]"
          style={{ maskImage: `url(${logo.src})`, WebkitMaskImage: `url(${logo.src})`, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center' }}
        />
      ) : (
        <img src={logo.src} alt="" className="size-[1.05em] shrink-0 rounded-[22%]" />
      )}
      {name}
    </span>
  )
}

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
              The <span className="font-black text-white underline decoration-dashed underline-offset-4">/rea-looksmaxxing</span> play: <LogoChip name="treg" /> finds what&apos;s
              going viral, <LogoChip name="SubQ" /> picks the winners, <LogoChip name="log" /> runs the accounts and <LogoChip name="Claude Code" /> funnels everyone into
              your offer. Your jawline is optional.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <RepoLink
                href={LOG_REPO_URL}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[16px] font-bold text-[#2A8CFF] shadow-[0_3px_0_#1A5FC8] transition-transform hover:-translate-y-px"
              >
                Set up log
                <FontAwesomeIcon icon={faArrowRight} className="text-[13px]" />
              </RepoLink>
              <a href="#play" className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-5 py-3 text-[16px] font-bold text-white shadow-[0_3px_0_rgb(0_0_0/0.12)] transition-colors hover:bg-white/25">
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
          steps={play.how.steps.map((moment) => ({ icon: iconOfTool(moment.tool, moment.kind), label: moment.label, tool: moment.tool }))}
          platformLabel="Discord"
          platformIcon={faDiscord}
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
    <div ref={box} className="flex w-full max-w-[550px] justify-center">
      <blockquote className="twitter-tweet" data-dnt="true" data-theme="light" data-align="center">
        <a href={TWEET_URL}>A post from @clavicular on X</a>
      </blockquote>
    </div>
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
      <PlatformScroll platformId="reaLooksmaxxing" ctaHref={LOG_REPO_URL} />
      <Control
        title={
          <>
            The best tool for
            <br className="hidden sm:block" /> <span className={STICKER}>moneymaxxing.</span>
          </>
        }
        lede={
          <>
            treg finds the <Dashed>viral formula</Dashed>, log posts it through your accounts and answers <Dashed>every reply in your voice</Dashed>, right to the offer.
          </>
        }
        session={PLATFORM_SESSIONS.reaLooksmaxxing}
        platformLabel="social media"
      />
      <PlatformMoney
        platformId="reaLooksmaxxing"
        platformLabel="Discord"
        ctaHref={LOG_REPO_URL}
        embed={<ClavTweet />}
        title={
          <>
            Even Clavicular has <span className={STICKER}>Claude Code</span> in his <span className={STICKER}>DMs</span>
          </>
        }
        subline={
          <>
            His DMs are full of money. Set up log and just <span className={STICKER}>get after it</span>
          </>
        }
      />
      <ThreeSteps play={REA_LOOKSMAXXING} platform={{ ...X, label: 'socials' }} icon={faDiscord} />
      <PromptCta title="Run /rea-looksmaxxing with your agent" ask={REA_LOOKSMAXXING.ask} isCommand={false} install="curl -fsSL https://log.listeningkit.com/install.sh | sh -s -- --skills rea-looksmaxxing" />
      <MoreUseCases current={null} />
      <SiteFooter />
    </div>
  )
}
