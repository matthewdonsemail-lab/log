import { useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import { faAnglesRight, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons'
import { Header } from '../Header'
import { SiteFooter } from '../SiteFooter'
import { ClayClouds } from '../ClayClouds'
import { PLATFORMS } from '../PlatformSuite'
import { LOG_REPO_URL, RepoLink, parseRepoUrl } from '../RepoLink'
import { DitherFade } from './DitherFade'
import { HowItWorks } from './HowItWorks'
import { PlatformScroll } from './platformStories'
import { PlatformMoney } from './PlatformMoney'
import { Control, Dashed } from '../Control'
import { MoreUseCases, PromptCta, ThreeSteps } from './UseCasesPage'
import { LOG_VS_XREACHER } from './logVsXreacher'
import { PLATFORM_SESSIONS } from './platformSessions'

const HAND = { fontFamily: "'Schoolbell', 'Cabin Sketch', cursive" }
const STICKER = 'sticker-word inline-block px-[0.08em] text-[1.18em] leading-none'
const LOG_REPO = parseRepoUrl(LOG_REPO_URL)!
const X = PLATFORMS.find((platform) => platform.id === 'x')!

function LogoChip() {
  return (
    <span className="mx-0.5 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-white px-1.5 py-0.5 align-middle text-[0.9em] font-bold leading-none text-[#2A8CFF] shadow-[0_3px_0_#1A5FC8]">
      <img src="/logo.svg" alt="" className="size-[1.05em] shrink-0 rounded-[22%]" />
      log
    </span>
  )
}

function Hero() {
  const play = LOG_VS_XREACHER
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [band, setBand] = useState<{ height: number; fade: number } | null>(null)
  useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    const frame = frameRef.current
    if (!section || !copy || !frame) return
    const measure = () => {
      const top = section.getBoundingClientRect().top
      const frameBox = frame.getBoundingClientRect()
      const height = Math.round(frameBox.top + frameBox.height / 2 - top)
      const fade = Math.max(96, Math.round(height - (copy.getBoundingClientRect().bottom - top + 8)))
      setBand({ height, fade })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(section)
    observer.observe(copy)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])
  return (
    <section ref={sectionRef} aria-label="Hero" className="relative isolate w-full overflow-hidden text-left">
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 -z-10 overflow-hidden bg-[#2A8CFF] ${band ? '' : 'h-[calc(100%-8rem)] md:h-[calc(100%-14rem)]'}`}
        style={band ? { height: band.height } : undefined}
      >
        <div className="absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(ellipse_130%_100%_at_50%_0%,rgba(92,167,255,0.8)_0%,transparent_80%)]" />
        <ClayClouds className="absolute inset-x-0 top-12 h-[26rem] [mask-image:linear-gradient(to_bottom,black_75%,transparent)] md:top-14 md:h-[36rem]" />
        <DitherFade
          stops={['#2A8CFF', '#9CCBFF', '#FFFFFF']}
          cell={5}
          className={`absolute inset-x-0 bottom-0 w-full ${band ? '' : 'h-[22rem] md:h-[34rem]'}`}
          style={band ? { height: band.fade } : undefined}
        />
      </div>
      <div className="mx-auto w-full max-w-[86rem] px-4 pb-16 pt-72 md:px-6 md:pb-24 md:pt-[26rem]">
        <div ref={copyRef} className="grid items-end gap-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12 lg:gap-16">
          <h1 className="text-[clamp(2.75rem,1.4rem+4.2vw,5.25rem)] font-black leading-[0.95] tracking-[-0.04em] text-white">
            <span className="block">log vs Xreacher.</span>
            <span className="block text-white/65">Your DMs. Your call.</span>
          </h1>
          <div className="flex flex-col items-start gap-6 md:pb-2">
            <p className="text-2xl leading-tight text-white sm:text-3xl" style={HAND}>
              Same DM. Same task. <span className="text-white/70">No made-up winner.</span>
            </p>
            <p className="text-lede text-white/85">
              <LogoChip /> reads <span className="font-black text-white underline decoration-dashed underline-offset-4">X DMs and X Chat</span> together, checks your reply against your voice, and waits for your yes. Xreacher test: <span className="font-black text-white underline decoration-dashed underline-offset-4">not run yet</span> — the same-DM comparison and screenshots are still needed.
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
        <div ref={frameRef} aria-hidden className="h-40 md:h-48" />
        <HowItWorks
          ask={play.ask}
          done={play.how.done}
          title={play.name}
          steps={play.how.steps.map((moment) => ({ icon: moment.kind === 'voiceGate' ? faCheck : faXTwitter, label: moment.label, tool: moment.tool }))}
          platformLabel="X"
          platformIcon={faXTwitter}
          rows={play.how.rows}
        />
      </div>
    </section>
  )
}

export function LogVsXreacherPage() {
  useEffect(() => {
    const previous = document.title
    document.title = 'log vs Xreacher · log by ListeningKit'
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
      <PlatformScroll platformId="logVsXreacher" ctaHref={LOG_REPO_URL} />
      <Control
        title={
          <>
            The best tool for
            <br className="hidden sm:block" /> <span className={STICKER}>an honest DM test.</span>
          </>
        }
        lede={
          <>
            Start with log&apos;s real flow: read <Dashed>both X inboxes</Dashed>, check the draft against <Dashed>your voice</Dashed>, then wait for approval. Add the recorded Xreacher run before choosing a winner.
          </>
        }
        session={PLATFORM_SESSIONS.x}
        platformLabel="X"
      />
      <PlatformMoney
        platformId="x"
        platformLabel="X"
        ctaHref={LOG_REPO_URL}
        title={
          <>
            Same DM. Same task. <span className={STICKER}>Then a verdict.</span>
          </>
        }
        subline={
          <>
            The Xreacher row is still open: run the same message through both tools and keep the <span className={STICKER}>replies, timings and screenshots</span>
          </>
        }
      />
      <ThreeSteps play={LOG_VS_XREACHER} platform={{ ...X, label: 'X account' }} icon={faXTwitter} />
      <PromptCta title="Try log on your own X DMs" ask={LOG_VS_XREACHER.ask} isCommand={false} install="curl -fsSL https://log.listeningkit.com/install.sh | sh" />
      <MoreUseCases current={null} />
      <SiteFooter />
    </div>
  )
}
